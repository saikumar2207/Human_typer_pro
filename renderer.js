const { ipcRenderer } = require('electron');

// DOM Elements
const textInput = document.getElementById('textInput');
const charSpeedSlider = document.getElementById('charSpeed');
const wordSpeedSlider = document.getElementById('wordSpeed');
const charSpeedValue = document.getElementById('charSpeedValue');
const wordSpeedValue = document.getElementById('wordSpeedValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDisplay = document.getElementById('statusDisplay');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const countdown = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdownNumber');

// Update speed displays
charSpeedSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  charSpeedValue.textContent = value;
  ipcRenderer.send('set-speeds', {
    charSpeed: parseInt(value),
    wordSpeed: parseInt(wordSpeedSlider.value)
  });
});

wordSpeedSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  wordSpeedValue.textContent = value;
  ipcRenderer.send('set-speeds', {
    charSpeed: parseInt(charSpeedSlider.value),
    wordSpeed: parseInt(value)
  });
});

// Update text
textInput.addEventListener('input', (e) => {
  ipcRenderer.send('set-text', e.target.value);
});

// Button handlers
startBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) {
    updateStatus('⚠️', 'Please enter some text first', 'warning');
    return;
  }
  
  ipcRenderer.send('set-text', text);
  ipcRenderer.send('set-speeds', {
    charSpeed: parseInt(charSpeedSlider.value),
    wordSpeed: parseInt(wordSpeedSlider.value)
  });
  ipcRenderer.send('start-typing');
  
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  textInput.disabled = true;
  charSpeedSlider.disabled = true;
  wordSpeedSlider.disabled = true;
});

pauseBtn.addEventListener('click', () => {
  ipcRenderer.send('pause-typing');
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
});

resumeBtn.addEventListener('click', () => {
  ipcRenderer.send('resume-typing');
  resumeBtn.disabled = true;
  pauseBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
  ipcRenderer.send('stop-typing');
  resetUI();
});

// IPC Listeners
ipcRenderer.on('countdown-start', (event, seconds) => {
  countdown.style.display = 'flex';
  countdownNumber.textContent = seconds;
  updateStatus('⏱️', `Get ready! ${seconds} seconds to select target...`, 'info');
});

ipcRenderer.on('countdown-update', (event, seconds) => {
  countdownNumber.textContent = seconds;
  updateStatus('⏱️', `Get ready! ${seconds} seconds to select target...`, 'info');
});

ipcRenderer.on('countdown-complete', () => {
  countdown.style.display = 'none';
  progressBar.style.display = 'block';
  updateStatus('⌨️', 'Typing in progress...', 'typing');
});

ipcRenderer.on('typing-progress', (event, data) => {
  progressFill.style.width = `${data.progress}%`;
  progressText.textContent = `${data.progress}% (${data.index}/${data.total})`;
});

ipcRenderer.on('typing-complete', () => {
  updateStatus('✅', 'Typing completed successfully!', 'success');
  setTimeout(resetUI, 2000);
});

ipcRenderer.on('typing-paused', () => {
  updateStatus('⏸️', 'Typing paused', 'paused');
});

ipcRenderer.on('typing-resumed', () => {
  updateStatus('⌨️', 'Typing resumed...', 'typing');
});

ipcRenderer.on('typing-stopped', () => {
  updateStatus('⏹️', 'Typing stopped', 'stopped');
  resetUI();
});

ipcRenderer.on('typing-error', (event, error) => {
  updateStatus('❌', `Error: ${error}`, 'error');
  resetUI();
});

// Troubleshooting Modal
const troubleshootBtn = document.getElementById('troubleshootBtn');
const troubleshootModal = document.getElementById('troubleshootModal');
const closeModal = document.querySelector('.close-modal');

troubleshootBtn.addEventListener('click', (e) => {
  e.preventDefault();
  troubleshootModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  troubleshootModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === troubleshootModal) {
    troubleshootModal.style.display = 'none';
  }
});

// Helper functions
function updateStatus(icon, text, type = 'info') {
  const statusIcon = statusDisplay.querySelector('.status-icon');
  const statusText = statusDisplay.querySelector('.status-text');
  
  statusIcon.textContent = icon;
  statusText.textContent = text;
  
  statusDisplay.className = `status-display status-${type}`;
}

function resetUI() {
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;
  textInput.disabled = false;
  charSpeedSlider.disabled = false;
  wordSpeedSlider.disabled = false;
  
  progressBar.style.display = 'none';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  countdown.style.display = 'none';
  
  updateStatus('ℹ️', 'Ready to type', 'info');
}
