/**
 * Manages notifications, alerts, and sound effects
 */
export class NotificationManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.soundEnabled = this.storage.getPreferences()?.soundEnabled ?? true;
    this.volume = this.storage.getPreferences()?.volume ?? 0.5;

    // Initialize sound effects
    this.alertSound = new Audio();
    this.alertSound.volume = this.volume;

    // Array of local sound file paths (must be in same directory)
    const soundUrls = [
      'alert1.mp3',
      'alert2.wav',
      'alert3.wav'
    ];

    this.loadSound(soundUrls);

    // Alert cooldown (to avoid rapid repeated alerts)
    this.alertCooldown = false;
    this.alertCooldownTime = 3000; // 3 seconds cooldown between alerts

    // Get UI elements
    this.alertPopup = document.getElementById('alert-popup');
    this.alertMessage = document.getElementById('alert-message');

    // Start listening to tab visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle tab or window visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.showAlert('You left the tab!');
    }
  }

  /**
   * Attempt to load sound from array of local file paths
   * @param {string[]} urls - Array of sound file paths to try
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

    this.alertSound.addEventListener('error', () => {
      currentIndex++;
      tryNextSound();
    });

    tryNextSound();
  }

  /**
   * Show an alert popup with message
   * @param {string} message - Message to display
   */
  showAlert(message) {
    if (this.alertCooldown) return;

    this.alertMessage.textContent = message;

    this.alertPopup.classList.remove('hidden');
    setTimeout(() => {
      this.alertPopup.classList.add('show');
    }, 10);

    if (this.soundEnabled && this.alertSound.readyState === 4) {
      this.playAlertSound();
    }

    this.showBrowserNotification('Focus Alert!', message);

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
    if (this.alertSound.readyState !== 4) return;

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
      return;
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
