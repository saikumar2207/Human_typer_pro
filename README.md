# Human Typing Bot

A cross-platform desktop application that simulates human-like typing with precision speed control.

## Features

- 🤖 **Human-like typing simulation** - Types text character-by-character at configurable speeds
- ⚡ **Dual speed controls** - Separate sliders for Characters Per Minute (CPM) and Words Per Minute (WPM)
- 🎯 **Manual target selection** - 3-second countdown to select where to type
- ⏸️ **Pause/Resume** - Stop and continue typing from the exact position
- 📊 **Real-time progress** - Visual progress bar and status updates
- 🎨 **Premium UI** - Modern interface with gradient backgrounds and smooth animations

## Installation

### Prerequisites
- Node.js v22.12.0 or higher
- npm v10.9.0 or higher

### Setup
```bash
cd "/Users/sivasai/Projects/AI Proj/typing-bot"
npm install
```

## Usage

### Running the App
```bash
npm start
```

### How to Use
1. **Paste your text** into the textarea
2. **Adjust typing speeds**:
   - Character Speed: 30-300 CPM (characters per minute)
   - Word Speed: 10-120 WPM (words per minute)
3. **Click "Start Typing"**
4. **Within 3 seconds**, click on the target window or text field where you want the text typed
5. The app will automatically type your text character-by-character
6. Use **Pause** to stop temporarily, **Resume** to continue, or **Stop** to cancel

### Speed Control
The app uses **both** speed settings to ensure natural typing:
- The actual typing speed will be the **slower** of the two settings
- This ensures both character and word speed constraints are met
- Experiment with different combinations to find your preferred pace

## Technical Details

### Built With
- **Electron** - Cross-platform desktop framework
- **robotjs** - Native keyboard automation
- **Node.js** - JavaScript runtime

### Project Structure
```
typing-bot/
├── main.js          # Electron main process & typing engine
├── renderer.js      # UI event handlers & IPC communication
├── index.html       # Application interface
├── styles.css       # Styling and animations
├── package.json     # Project configuration
└── README.md        # This file
```

### How It Works
1. **Text Input**: User pastes text into the application
2. **Speed Calculation**: Converts CPM/WPM to millisecond delays
3. **Target Selection**: 3-second countdown for user to select destination
4. **Typing Engine**: Uses `robotjs` to send keystrokes at calculated intervals
5. **State Management**: Tracks position for pause/resume functionality

## macOS Permissions

On macOS, you may need to grant accessibility permissions:
1. Go to **System Preferences** → **Security & Privacy** → **Accessibility**
2. Add and enable your terminal app or the Electron app

## Building for Distribution

### macOS
```bash
npm install --save-dev electron-builder
npm run build
```

### Windows
Requires native compilation of `robotjs`:
```bash
npm install --save-dev electron-builder
# May require Visual Studio Build Tools
npm run build
```

## Troubleshooting

### "robotjs" installation fails
- On macOS: Install Xcode Command Line Tools
- On Windows: Install Visual Studio Build Tools
- On Linux: Install `libxtst-dev` and `libpng++-dev`

### App doesn't type
- Check accessibility permissions (macOS)
- Ensure target window is focused after countdown
- Try increasing the countdown delay in `main.js`

## License

ISC

## Author

Created with Electron and Node.js
