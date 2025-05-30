/**
 * Manages notifications, alerts, and sound effects
 */
export class NotificationManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.soundEnabled = this.storage.getPreferences()?.soundEnabled ?? true;
    this.volume = this.storage.getPreferences()?.volume ?? 0.5;
    
    // Initialize sound effects with multiple fallback options
    this.alertSound = new Audio();
    this.alertSound.volume = this.volume;
    
    // Array of fallback sound URLs
    const soundUrls = [
      'https://assets.mixkit.co/sfx/download/mixkit-software-interface-alert-2573.wav',
      'https://assets.mixkit.co/sfx/download/mixkit-alert-quick-chime-766.wav',
      'https://assets.mixkit.co/sfx/download/mixkit-clear-announce-tones-2861.wav'
    ];
    
    // Try loading sounds until one works
    this.loadSound(soundUrls);
    
    // Alert cooldown state
    this.alertCooldown = false;
    this.alertCooldownTime = 60000; // 1 minute cooldown
    
    // Get UI elements
    this.alertPopup = document.getElementById('alert-popup');
    this.alertMessage = document.getElementById('alert-message');
  }
  
  /**
   * Attempt to load sound from array of URLs
   * @param {string[]} urls - Array of sound URLs to try
   */
  loadSound(urls) {
    let currentIndex = 0;
    
    const tryNextSound = () => {
      if (currentIndex >= urls.length) {
        console.warn('Could not load any notification sounds');
        return;
      }
      
      this.alertSound.src = urls[currentIndex];
      this.alertSound.load();
    };
    
    // Handle errors and try next sound
    this.alertSound.addEventListener('error', () => {
      currentIndex++;
      tryNextSound();
    });
    
    // Start loading the first sound
    tryNextSound();
  }
  
  /**
   * Show an alert popup with message
   * @param {string} message - Message to display
   */
  showAlert(message) {
    if (this.alertCooldown) return;
    
    // Update alert message
    this.alertMessage.textContent = message;
    
    // Show popup
    this.alertPopup.classList.remove('hidden');
    setTimeout(() => {
      this.alertPopup.classList.add('show');
    }, 10);
    
    // Play alert sound if enabled and loaded
    if (this.soundEnabled && this.alertSound.readyState === 4) {
      this.playAlertSound();
    }
    
    // Show browser notification if permission granted
    this.showBrowserNotification('Focus Alert!', message);
    
    // Start cooldown
    this.startAlertCooldown();
  }
  
  /**
   * Close the alert popup
   */
  closeAlert() {
    this.alertPopup.classList.remove('show');
    setTimeout(() => {
      this.alertPopup.classList.add('hidden');
    }, 300);
  }
  
  /**
   * Play the alert sound effect
   */
  playAlertSound() {
    if (!this.alertSound.readyState === 4) return;
    
    // Clone and play the sound to allow overlapping playback
    const sound = this.alertSound.cloneNode();
    sound.volume = this.volume;
    sound.play().catch(error => {
      console.warn('Error playing sound:', error);
    });
  }
  
  /**
   * Show a browser notification if permission is granted
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   */
  showBrowserNotification(title, body) {
    if (!("Notification" in window)) {
      return; // Browser doesn't support notifications
    }
    
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
  
  /**
   * Start cooldown period for alerts
   */
  startAlertCooldown() {
    this.alertCooldown = true;
    setTimeout(() => {
      this.alertCooldown = false;
    }, this.alertCooldownTime);
  }
  
  /**
   * Enable or disable sound effects
   * @param {boolean} enabled - Whether sound should be enabled
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }
  
  /**
   * Set the volume for sound effects
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = volume;
    this.alertSound.volume = volume;
  }
}