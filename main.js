const { app, BrowserWindow, ipcMain } = require('electron');
const robot = require('robotjs');
const path = require('path');

let mainWindow;
let typingState = {
  isTyping: false,
  isPaused: false,
  text: '',
  currentIndex: 0,
  charSpeed: 100, // characters per minute
  wordSpeed: 40,  // words per minute
  timeoutId: null
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
  // Auto-pause when window gains focus (user interruption)
  mainWindow.on('focus', () => {
    if (typingState.isTyping && !typingState.isPaused) {
      typingState.isPaused = true;
      if (typingState.timeoutId) {
        clearTimeout(typingState.timeoutId);
        typingState.timeoutId = null;
      }
      mainWindow.webContents.send('typing-paused');
      // Notify renderer to show resume button state
      mainWindow.webContents.send('auto-paused');
    }
  });

  mainWindow.on('blur', () => {
    // Optional: could auto-resume here, but user requested manual resume click -> countdown
  });
}

app.whenReady().then(() => {
  createWindow();
  // Set minimal delay for robotjs to ensure stability
  robot.setKeyboardDelay(1);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Calculate delay based on speed settings
function calculateDelay() {
  // Convert CPM to milliseconds per character
  const charDelay = (60 * 1000) / typingState.charSpeed;
  
  // Convert WPM to milliseconds per word (assuming avg 5 chars per word)
  const wordDelay = (60 * 1000) / (typingState.wordSpeed * 5);
  
  // Use the slower of the two speeds to ensure both constraints are met
  return Math.max(charDelay, wordDelay);
}

// Type the next character
function typeNextCharacter() {
  if (!typingState.isTyping || typingState.isPaused) {
    return;
  }

  // Safety check: Never type if the bot window itself is focused
  if (mainWindow.isFocused()) {
    console.log('Window focused, pausing typing safety check');
    typingState.isPaused = true;
    if (typingState.timeoutId) {
      clearTimeout(typingState.timeoutId);
      typingState.timeoutId = null;
    }
    mainWindow.webContents.send('typing-paused');
    mainWindow.webContents.send('auto-paused');
    return;
  }

  if (typingState.currentIndex >= typingState.text.length) {
    // Typing complete
    typingState.isTyping = false;
    typingState.currentIndex = 0;
    mainWindow.webContents.send('typing-complete');
    return;
  }

  const char = typingState.text[typingState.currentIndex];
  
  try {
    // Type the character
    if (char === '\n') {
      robot.keyTap('enter');
    } else if (char === '\t') {
      robot.keyTap('tab');
    } else {
      robot.typeString(char);
    }
    
    typingState.currentIndex++;
    
    // Send progress update
    const progress = (typingState.currentIndex / typingState.text.length) * 100;
    mainWindow.webContents.send('typing-progress', {
      index: typingState.currentIndex,
      total: typingState.text.length,
      progress: progress.toFixed(1)
    });
    
    // Schedule next character
    const delay = calculateDelay();
    typingState.timeoutId = setTimeout(typeNextCharacter, delay);
  } catch (error) {
    console.error('Error typing character:', error);
    mainWindow.webContents.send('typing-error', error.message);
    typingState.isTyping = false;
  }
}



// IPC Handlers
ipcMain.on('set-text', (event, text) => {
  typingState.text = text;
  typingState.currentIndex = 0;
});

ipcMain.on('set-speeds', (event, { charSpeed, wordSpeed }) => {
  typingState.charSpeed = charSpeed;
  typingState.wordSpeed = wordSpeed;
});

function startCountdownAndType() {
  // Give user 3 seconds to select the target window/field
  mainWindow.webContents.send('countdown-start', 3);
  
  let countdown = 3;
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      mainWindow.webContents.send('countdown-update', countdown);
    } else {
      clearInterval(countdownInterval);
      mainWindow.webContents.send('countdown-complete');
      // Start/Resume typing after countdown
      if (typingState.isPaused) {
        typingState.isPaused = false;
        mainWindow.webContents.send('typing-resumed');
      }
      typeNextCharacter();
    }
  }, 1000);
}

ipcMain.on('start-typing', (event) => {
  if (typingState.isTyping) {
    return;
  }
  
  if (!typingState.text) {
    mainWindow.webContents.send('typing-error', 'No text to type');
    return;
  }
  
  typingState.isTyping = true;
  typingState.isPaused = false;
  
  startCountdownAndType();
});

ipcMain.on('pause-typing', (event) => {
  if (typingState.isTyping && !typingState.isPaused) {
    typingState.isPaused = true;
    if (typingState.timeoutId) {
      clearTimeout(typingState.timeoutId);
      typingState.timeoutId = null;
    }
    mainWindow.webContents.send('typing-paused');
  }
});

ipcMain.on('resume-typing', (event) => {
  if (typingState.isTyping && typingState.isPaused) {
    // Resume with countdown as requested
    startCountdownAndType();
  }
});

ipcMain.on('stop-typing', (event) => {
  typingState.isTyping = false;
  typingState.isPaused = false;
  typingState.currentIndex = 0;
  if (typingState.timeoutId) {
    clearTimeout(typingState.timeoutId);
    typingState.timeoutId = null;
  }
  mainWindow.webContents.send('typing-stopped');
});
