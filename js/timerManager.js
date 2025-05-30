/**
 * Manages the study timer functionality
 */
export class TimerManager {
  constructor(updateCallback) {
    this.elapsed = 0; // Time elapsed in seconds
    this.interval = null;
    this.isRunning = false;
    this.updateCallback = updateCallback;
  }
  
  /**
   * Start or resume the timer
   */
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - (this.elapsed * 1000);
      
      // Use requestAnimationFrame for smoother updates
      const updateTimer = () => {
        if (!this.isRunning) return;
        
        const now = Date.now();
        this.elapsed = Math.floor((now - this.startTime) / 1000);
        
        // Call update callback to refresh UI
        this.updateCallback();
        
        // Schedule next update
        requestAnimationFrame(updateTimer);
      };
      
      updateTimer();
    }
  }
  
  /**
   * Pause the timer
   */
  pause() {
    this.isRunning = false;
  }
  
  /**
   * Reset the timer
   */
  reset() {
    this.isRunning = false;
    this.elapsed = 0;
  }
  
  /**
   * Format seconds to mm:ss display
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} Formatted time string
   */
  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Format seconds to readable duration
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} Human-readable duration
   */
  formatDuration(totalSeconds) {
    if (totalSeconds < 60) {
      return `${totalSeconds} seconds`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds > 0 ? `and ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? `and ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    }
  }
}