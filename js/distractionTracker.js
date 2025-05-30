/**
 * Tracks tab and window focus to detect distractions
 */
export class DistractionTracker {
  constructor(distractionCallback) {
    this.count = 0;
    this.timestamps = [];
    this.isTracking = false;
    this.distractionCallback = distractionCallback;
    this.lastFocusState = true;
    this.inCooldown = false;
    this.cooldownTime = 1000; // 1 second cooldown to prevent multiple counts for same distraction
  }
  
  /**
   * Set up event listeners for tracking distractions
   */
  setupEventListeners() {
    // Tab visibility change detection
    document.addEventListener('visibilitychange', () => {
      if (this.isTracking) {
        const isVisible = document.visibilityState === 'visible';
        this.handleFocusChange(isVisible);
      }
    });
    
    // Window focus/blur detection
    window.addEventListener('blur', () => {
      if (this.isTracking) {
        this.handleFocusChange(false);
      }
    });
    
    window.addEventListener('focus', () => {
      if (this.isTracking) {
        this.handleFocusChange(true);
      }
    });
  }
  
  /**
   * Start tracking distractions
   */
  startTracking() {
    this.isTracking = true;
    // Initialize with the current focus state
    this.lastFocusState = document.visibilityState === 'visible';
  }
  
  /**
   * Stop tracking distractions
   */
  stopTracking() {
    this.isTracking = false;
  }
  
  /**
   * Handle focus state changes to detect distractions
   * @param {boolean} isFocused - Whether the window/tab is focused
   */
  handleFocusChange(isFocused) {
    // Ignore if we're in cooldown period or if the state hasn't changed
    if (this.inCooldown || this.lastFocusState === isFocused) {
      this.lastFocusState = isFocused;
      return;
    }
    
    // Only count as distraction when moving from focused to unfocused
    if (!isFocused) {
      this.startCooldown();
      
      // Notify via callback
      this.distractionCallback(true);
    } else {
      // Coming back from distraction
      this.distractionCallback(false);
    }
    
    // Update last focus state
    this.lastFocusState = isFocused;
  }
  
  /**
   * Start cooldown to prevent rapid counting of same distraction
   */
  startCooldown() {
    this.inCooldown = true;
    setTimeout(() => {
      this.inCooldown = false;
    }, this.cooldownTime);
  }
  
  /**
   * Add a distraction to the count
   */
  addDistraction() {
    this.count++;
    this.timestamps.push({
      timestamp: Date.now(),
      count: this.count
    });
  }
  
  /**
   * Reset distraction counts
   */
  resetCounts() {
    this.count = 0;
    this.timestamps = [];
  }
  
  /**
   * Calculate total estimated distraction time
   * @param {number} averageDistractionSeconds - Average seconds per distraction
   * @returns {number} Total distraction time in seconds
   */
  calculateTotalDistractionTime(averageDistractionSeconds = 15) {
    return this.count * averageDistractionSeconds;
  }
}