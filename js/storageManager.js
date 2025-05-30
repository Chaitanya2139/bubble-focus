/**
 * Manages data persistence using localStorage
 */
export class StorageManager {
  constructor() {
    this.storageKeys = {
      sessionData: 'focusBubble_sessionData',
      historicalData: 'focusBubble_historicalData',
      preferences: 'focusBubble_preferences'
    };
    
    // Initialize storage if needed
    this.initializeStorage();
  }
  
  /**
   * Initialize storage with default values if they don't exist
   */
  initializeStorage() {
    if (!localStorage.getItem(this.storageKeys.sessionData)) {
      localStorage.setItem(this.storageKeys.sessionData, JSON.stringify({
        isActive: false,
        isPaused: false,
        startTime: null,
        elapsed: 0,
        distractionCount: 0,
        distractionTimestamps: []
      }));
    }
    
    if (!localStorage.getItem(this.storageKeys.historicalData)) {
      localStorage.setItem(this.storageKeys.historicalData, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(this.storageKeys.preferences)) {
      localStorage.setItem(this.storageKeys.preferences, JSON.stringify({
        theme: 'light',
        maxDistractions: 3,
        soundEnabled: true,
        volume: 0.5
      }));
    }
  }
  
  /**
   * Save current session data
   * @param {string} state - Current session state ('active', 'paused')
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} distractionCount - Number of distractions
   */
  saveSessionState(state, elapsed, distractionCount) {
    const sessionData = this.getSessionData() || {};
    
    sessionData.isActive = true;
    sessionData.isPaused = state === 'paused';
    sessionData.elapsed = elapsed;
    sessionData.distractionCount = distractionCount;
    
    localStorage.setItem(this.storageKeys.sessionData, JSON.stringify(sessionData));
  }
  
  /**
   * Save session start information
   */
  saveSessionStart() {
    const sessionData = this.getSessionData() || {};
    
    sessionData.isActive = true;
    sessionData.isPaused = false;
    sessionData.startTime = Date.now();
    
    localStorage.setItem(this.storageKeys.sessionData, JSON.stringify(sessionData));
  }
  
  /**
   * Save distraction data
   * @param {number} count - Current distraction count
   * @param {Array} timestamps - Array of distraction timestamps
   */
  saveDistractionData(count, timestamps) {
    const sessionData = this.getSessionData() || {};
    
    sessionData.distractionCount = count;
    sessionData.distractionTimestamps = timestamps;
    
    localStorage.setItem(this.storageKeys.sessionData, JSON.stringify(sessionData));
  }
  
  /**
   * Complete current session and move to historical data
   * @param {number} elapsed - Total elapsed time in seconds
   * @param {number} distractionCount - Total distractions
   * @param {Array} distractionTimestamps - Distraction timestamp data
   */
  completeSession(elapsed, distractionCount, distractionTimestamps) {
    // Get current session data
    const sessionData = this.getSessionData();
    
    // Create a completed session record
    const completedSession = {
      date: new Date().toISOString(),
      duration: elapsed,
      distractionCount,
      distractionTimestamps,
      estimatedFocusTime: Math.max(0, elapsed - (distractionCount * 15)) // 15s average distraction
    };
    
    // Add to historical data
    const historicalData = this.getHistoricalData() || [];
    historicalData.push(completedSession);
    localStorage.setItem(this.storageKeys.historicalData, JSON.stringify(historicalData));
    
    // Clear current session
    this.clearCurrentSession();
  }
  
  /**
   * Save a user preference setting
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   */
  savePreference(key, value) {
    const preferences = this.getPreferences() || {};
    preferences[key] = value;
    localStorage.setItem(this.storageKeys.preferences, JSON.stringify(preferences));
  }
  
  /**
   * Get current session data
   * @returns {Object} Session data object
   */
  getSessionData() {
    const data = localStorage.getItem(this.storageKeys.sessionData);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Get historical session data
   * @returns {Array} Array of historical session records
   */
  getHistoricalData() {
    const data = localStorage.getItem(this.storageKeys.historicalData);
    return data ? JSON.parse(data) : [];
  }
  
  /**
   * Get user preferences
   * @returns {Object} User preferences object
   */
  getPreferences() {
    const data = localStorage.getItem(this.storageKeys.preferences);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Clear current session data
   */
  clearCurrentSession() {
    localStorage.setItem(this.storageKeys.sessionData, JSON.stringify({
      isActive: false,
      isPaused: false,
      startTime: null,
      elapsed: 0,
      distractionCount: 0,
      distractionTimestamps: []
    }));
  }
  
  /**
   * Clear all stored data
   */
  clearAllData() {
    localStorage.removeItem(this.storageKeys.sessionData);
    localStorage.removeItem(this.storageKeys.historicalData);
    
    // Re-initialize storage with defaults
    this.initializeStorage();
  }
  
  /**
   * Get all data for export/download
   * @returns {Object} All application data
   */
  getAllData() {
    return {
      currentSession: this.getSessionData(),
      historicalData: this.getHistoricalData(),
      preferences: this.getPreferences(),
      exportDate: new Date().toISOString()
    };
  }
}