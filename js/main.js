// Import modules
import { TimerManager } from './timerManager.js';
import { DistractionTracker } from './distractionTracker.js';
import { UIController } from './uiController.js';
import { StorageManager } from './storageManager.js';
import { ChartManager } from './chartManager.js';
import { NotificationManager } from './notificationManager.js';
import { ShortcutManager } from './shortcutManager.js';

// Main application class
class FocusBubbleApp {
  constructor() {
    // Initialize modules
    this.storage = new StorageManager();
    this.timer = new TimerManager(this.updateUI.bind(this));
    this.distractionTracker = new DistractionTracker(this.handleDistraction.bind(this));
    this.ui = new UIController(this);
    this.chart = new ChartManager();
    this.notification = new NotificationManager(this.storage);
    this.shortcuts = new ShortcutManager(this);
    
    // Initialize state from storage
    this.initializeFromStorage();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial UI update
    this.updateUI();
  }
  
  initializeFromStorage() {
    // Load user preferences
    const preferences = this.storage.getPreferences();
    if (preferences) {
      // Apply theme
      if (preferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      }
      
      // Set max distractions
      document.getElementById('max-distractions').value = preferences.maxDistractions || 3;
      
      // Set sound preferences
      document.getElementById('sound-toggle').checked = preferences.soundEnabled ?? true;
      document.getElementById('volume-control').value = preferences.volume ?? 0.5;
    }
    
    // Load session data
    const sessionData = this.storage.getSessionData();
    if (sessionData && sessionData.isActive) {
      this.timer.elapsed = sessionData.elapsed || 0;
      this.distractionTracker.count = sessionData.distractionCount || 0;
      this.distractionTracker.timestamps = sessionData.distractionTimestamps || [];
      
      // If there was an active session, resume it
      if (sessionData.isPaused) {
        this.ui.updateSessionState('paused');
      } else {
        this.ui.updateSessionState('active');
        this.timer.start();
      }
    }
    
    // Initialize chart with historical data
    this.chart.initializeChart();
    this.chart.updateChartWithData(this.storage.getHistoricalData());
  }
  
  setupEventListeners() {
    // Let each module set up its own event listeners
    this.ui.setupEventListeners();
    this.distractionTracker.setupEventListeners();
    this.shortcuts.setupEventListeners();
  }
  
  startSession() {
    this.timer.start();
    this.distractionTracker.startTracking();
    this.ui.updateSessionState('active');
    this.storage.saveSessionStart();
  }
  
  pauseSession() {
    this.timer.pause();
    this.ui.updateSessionState('paused');
    this.storage.saveSessionState('paused', this.timer.elapsed, this.distractionTracker.count);
  }
  
  resumeSession() {
    this.timer.start();
    this.ui.updateSessionState('active');
    this.storage.saveSessionState('active', this.timer.elapsed, this.distractionTracker.count);
  }
  
  resetSession() {
    this.timer.reset();
    this.distractionTracker.resetCounts();
    this.ui.updateSessionState('inactive');
    this.storage.clearCurrentSession();
    this.updateUI();
  }
  
  handleDistraction(isDistracted) {
    // Update UI to show distracted state
    this.ui.updateFocusState(isDistracted);
    
    if (isDistracted) {
      // Increment distraction count and update UI
      this.distractionTracker.addDistraction();
      this.ui.updateDistractionCount(this.distractionTracker.count);
      
      // Save current state to storage
      this.storage.saveDistractionData(
        this.distractionTracker.count, 
        this.distractionTracker.timestamps
      );
      
      // Check if we need to show an alert
      const maxDistractions = parseInt(document.getElementById('max-distractions').value) || 3;
      if (this.distractionTracker.count === maxDistractions) {
        this.notification.showAlert(`You've reached ${maxDistractions} distractions. Let's refocus!`);
      }
    }
    
    // Update the statistics
    this.updateStats();
  }
  
  updateUI() {
    // Update timer display
    this.ui.updateTimerDisplay(this.timer.formatTime(this.timer.elapsed));
    
    // Update distraction count
    this.ui.updateDistractionCount(this.distractionTracker.count);
    
    // Update stats
    this.updateStats();
    
    // Save session state
    if (this.timer.isRunning || this.timer.elapsed > 0) {
      this.storage.saveSessionState(
        this.timer.isRunning ? 'active' : 'paused',
        this.timer.elapsed,
        this.distractionTracker.count
      );
    }
  }
  
  updateStats() {
    const totalSessionTime = this.timer.elapsed;
    const distractionCount = this.distractionTracker.count;
    
    // Estimate distraction time (each distraction is ~15 seconds)
    const estimatedDistractionTime = distractionCount * 15;
    const focusTime = Math.max(0, totalSessionTime - estimatedDistractionTime);
    
    // Calculate focus ratio
    const focusRatio = totalSessionTime > 0 ? 
      Math.round((focusTime / totalSessionTime) * 100) : 100;
    
    // Update UI elements
    document.getElementById('focus-time').textContent = this.timer.formatTime(focusTime);
    document.getElementById('distraction-time').textContent = this.timer.formatTime(estimatedDistractionTime);
    document.getElementById('focus-ratio').textContent = `${focusRatio}%`;
    document.getElementById('total-distractions').textContent = distractionCount;
    
    // Update chart
    this.chart.updateChart({
      focusTime,
      distractionTime: estimatedDistractionTime
    });
  }
  
  toggleTheme() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    if (isDarkTheme) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      this.storage.savePreference('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      this.storage.savePreference('theme', 'dark');
    }
    
    // Update chart colors
    this.chart.updateChartColors();
  }
  
  downloadSessionData() {
    // Get all session data
    const data = this.storage.getAllData();
    
    // Create a blob with the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-bubble-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  clearAllData() {
    if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
      this.storage.clearAllData();
      this.resetSession();
      this.chart.initializeChart();
      alert('All data has been cleared successfully.');
    }
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.focusBubbleApp = new FocusBubbleApp();
});

// Export the app for access in the console (for debugging)
export default FocusBubbleApp;