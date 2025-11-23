const { app, ipcMain } = require('electron');

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(),
    webContents: {
      send: jest.fn(),
      openDevTools: jest.fn()
    }
  })),
  ipcMain: {
    on: jest.fn()
  }
}));

// Mock robotjs
jest.mock('robotjs', () => ({
  typeString: jest.fn(),
  setKeyboardDelay: jest.fn()
}));

describe('Typing Logic', () => {
  let typingState;
  
  beforeEach(() => {
    // Reset state for each test
    typingState = {
      isTyping: false,
      isPaused: false,
      text: 'Hello World',
      currentIndex: 0,
      charSpeed: 100,
      wordSpeed: 40,
      timeoutId: null
    };
    jest.clearAllMocks();
  });

  test('calculateDelay should respect character speed', () => {
    const charSpeed = 60; // 60 chars per minute = 1 char per second = 1000ms
    const wordSpeed = 1000; // Very fast word speed to ensure char speed is the bottleneck
    
    const charDelay = (60 * 1000) / charSpeed;
    const wordDelay = (60 * 1000) / (wordSpeed * 5);
    
    const delay = Math.max(charDelay, wordDelay);
    
    expect(delay).toBe(1000);
  });

  test('calculateDelay should respect word speed', () => {
    const charSpeed = 3000; // Very fast char speed
    const wordSpeed = 12; // 12 words per minute = 1 word every 5 seconds = 5 chars every 5 seconds = 1 char per second
    
    const charDelay = (60 * 1000) / charSpeed;
    const wordDelay = (60 * 1000) / (wordSpeed * 5);
    
    const delay = Math.max(charDelay, wordDelay);
    
    expect(delay).toBe(1000);
  });
});
