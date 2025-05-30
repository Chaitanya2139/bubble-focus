/**
 * Manages keyboard shortcuts for the application
 */
export class ShortcutManager {
  constructor(app) {
    this.app = app;
    this.keymap = {
      ' ': this.toggleStartPause.bind(this),    // Space - Start/Pause/Resume
      'r': this.app.resetSession.bind(this.app), // R - Reset
      'm': this.toggleSound.bind(this),          // M - Mute/Unmute
      'h': this.toggleHelp.bind(this),           // H - Help
      't': this.app.toggleTheme.bind(this.app)   // T - Theme
    };
  }
  
  /**
   * Set up keyboard shortcut listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }
  
  /**
   * Handle keyboard shortcut events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyPress(event) {
    // Ignore if in a form input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const key = event.key.toLowerCase();
    
    if (this.keymap[key]) {
      event.preventDefault();
      this.keymap[key]();
    }
  }
  
  /**
   * Toggle between start, pause, and resume
   */
  toggleStartPause() {
    const isActive = this.app.timer.isRunning;
    const isPaused = !isActive && this.app.timer.elapsed > 0;
    
    if (!isActive && !isPaused) {
      this.app.startSession();
    } else if (isActive) {
      this.app.pauseSession();
    } else if (isPaused) {
      this.app.resumeSession();
    }
  }
  
  /**
   * Toggle sound on/off
   */
  toggleSound() {
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.checked = !soundToggle.checked;
    
    // Trigger the change event
    const event = new Event('change');
    soundToggle.dispatchEvent(event);
  }
  
  /**
   * Toggle help modal
   */
  toggleHelp() {
    const helpModal = document.getElementById('help-modal');
    const isShowing = helpModal.classList.contains('show');
    
    if (isShowing) {
      helpModal.classList.remove('show');
      setTimeout(() => {
        helpModal.classList.add('hidden');
      }, 300);
    } else {
      helpModal.classList.remove('hidden');
      setTimeout(() => {
        helpModal.classList.add('show');
      }, 10);
    }
  }
}