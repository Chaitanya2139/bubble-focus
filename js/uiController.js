/**
 * Handles all UI interactions and updates
 */
export class UIController {
  constructor(app) {
    this.app = app;
    this.elements = {
      // Timer and status elements
      timerDisplay: document.getElementById('timer-display'),
      statusDot: document.getElementById('status-dot'),
      statusMessage: document.getElementById('status-message'),
      distractionCount: document.getElementById('distraction-count'),
      
      // Control buttons
      startBtn: document.getElementById('start-btn'),
      pauseBtn: document.getElementById('pause-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      resetBtn: document.getElementById('reset-btn'),
      
      // Settings controls
      maxDistractions: document.getElementById('max-distractions'),
      soundToggle: document.getElementById('sound-toggle'),
      volumeControl: document.getElementById('volume-control'),
      
      // Help and theme elements
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      helpBtn: document.getElementById('help-btn'),
      helpModal: document.getElementById('help-modal'),
      closeHelpModal: document.getElementById('close-help-modal'),
      
      // Alert elements
      alertPopup: document.getElementById('alert-popup'),
      alertMessage: document.getElementById('alert-message'),
      closeAlertBtn: document.getElementById('close-alert-btn'),
      
      // Data management buttons
      downloadDataBtn: document.getElementById('download-data-btn'),
      clearDataBtn: document.getElementById('clear-data-btn')
    };
  }
  
  /**
   * Set up all UI event listeners
   */
  setupEventListeners() {
    // Session control buttons
    this.elements.startBtn.addEventListener('click', () => this.app.startSession());
    this.elements.pauseBtn.addEventListener('click', () => this.app.pauseSession());
    this.elements.resumeBtn.addEventListener('click', () => this.app.resumeSession());
    this.elements.resetBtn.addEventListener('click', () => this.app.resetSession());
    
    // Settings controls
    this.elements.maxDistractions.addEventListener('change', (e) => {
      const value = parseInt(e.target.value);
      if (value < 1) e.target.value = '1';
      this.app.storage.savePreference('maxDistractions', parseInt(e.target.value));
    });
    
    this.elements.soundToggle.addEventListener('change', (e) => {
      this.app.storage.savePreference('soundEnabled', e.target.checked);
      this.app.notification.setSoundEnabled(e.target.checked);
    });
    
    this.elements.volumeControl.addEventListener('input', (e) => {
      const volume = parseFloat(e.target.value);
      this.app.storage.savePreference('volume', volume);
      this.app.notification.setVolume(volume);
    });
    
    // Theme toggle
    this.elements.themeToggleBtn.addEventListener('click', () => this.app.toggleTheme());
    
    // Help modal
    this.elements.helpBtn.addEventListener('click', () => this.toggleHelpModal(true));
    this.elements.closeHelpModal.addEventListener('click', () => this.toggleHelpModal(false));
    
    // Alert popup
    this.elements.closeAlertBtn.addEventListener('click', () => this.closeAlert());
    
    // Data buttons
    this.elements.downloadDataBtn.addEventListener('click', () => this.app.downloadSessionData());
    this.elements.clearDataBtn.addEventListener('click', () => this.app.clearAllData());
    
    // Click outside modal to close it
    window.addEventListener('click', (e) => {
      if (e.target === this.elements.helpModal) {
        this.toggleHelpModal(false);
      }
      if (e.target === this.elements.alertPopup) {
        this.closeAlert();
      }
    });
  }
  
  /**
   * Update the timer display
   * @param {string} timeString - Formatted time string (mm:ss)
   */
  updateTimerDisplay(timeString) {
    this.elements.timerDisplay.textContent = timeString;
  }
  
  /**
   * Update the distraction count display with animation
   * @param {number} count - Current distraction count
   */
  updateDistractionCount(count) {
    this.elements.distractionCount.textContent = count;
    
    // Add animation when count increases
    if (count > 0) {
      this.elements.distractionCount.classList.add('pulse');
      setTimeout(() => {
        this.elements.distractionCount.classList.remove('pulse');
      }, 500);
    }
  }
  
  /**
   * Update the focus state indicator
   * @param {boolean} isDistracted - Whether user is currently distracted
   */
  updateFocusState(isDistracted) {
    // Update status dot and message
    if (isDistracted) {
      this.elements.statusDot.classList.add('distracted');
      this.elements.statusDot.classList.remove('focused');
      this.elements.statusMessage.textContent = 'Distracted';
    } else {
      this.elements.statusDot.classList.add('focused');
      this.elements.statusDot.classList.remove('distracted');
      this.elements.statusMessage.textContent = 'Focused';
    }
  }
  
  /**
   * Update button states based on current session state
   * @param {string} state - Current session state ('inactive', 'active', 'paused')
   */
  updateSessionState(state) {
    switch(state) {
      case 'inactive':
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.resumeBtn.disabled = true;
        this.elements.resetBtn.disabled = true;
        
        this.elements.statusDot.classList.remove('focused', 'distracted');
        this.elements.statusMessage.textContent = 'Ready to focus';
        break;
        
      case 'active':
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.resumeBtn.disabled = true;
        this.elements.resetBtn.disabled = false;
        
        this.elements.statusDot.classList.add('focused');
        this.elements.statusDot.classList.remove('distracted');
        this.elements.statusMessage.textContent = 'Focused';
        break;
        
      case 'paused':
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = true;
        this.elements.resumeBtn.disabled = false;
        this.elements.resetBtn.disabled = false;
        
        this.elements.statusMessage.textContent = 'Paused';
        break;
    }
  }
  
  /**
   * Show the help modal
   * @param {boolean} show - Whether to show or hide the modal
   */
  toggleHelpModal(show) {
    if (show) {
      this.elements.helpModal.classList.add('show');
      this.elements.helpModal.classList.remove('hidden');
    } else {
      this.elements.helpModal.classList.remove('show');
      this.elements.helpModal.classList.add('hidden');
    }
  }
  
  /**
   * Show the alert popup
   * @param {string} message - Alert message to display
   */
  showAlert(message) {
    this.elements.alertMessage.textContent = message;
    this.elements.alertPopup.classList.remove('hidden');
    this.elements.alertPopup.classList.add('show');
  }
  
  /**
   * Close the alert popup
   */
  closeAlert() {
    this.elements.alertPopup.classList.remove('show');
    setTimeout(() => {
      this.elements.alertPopup.classList.add('hidden');
    }, 300);
  }
}