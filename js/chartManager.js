/**
 * Manages chart visualizations for focus statistics
 */
export class ChartManager {
  constructor() {
    this.chart = null;
    this.chartCanvas = document.getElementById('focus-chart');
    this.chartData = {
      focusTime: 0,
      distractionTime: 0
    };
  }
  
  /**
   * Initialize the chart
   */
  initializeChart() {
    // Create a chart with default data
    const ctx = this.chartCanvas.getContext('2d');
    
    // Set default colors based on current theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#F9FAFB' : '#1F2937';
    
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Focus Time', 'Distraction Time'],
        datasets: [{
          data: [100, 0],
          backgroundColor: [
            '#10B981', // Success green for focus time
            '#EF4444'  // Error red for distraction time
          ],
          borderColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateRotate: true,
          animateScale: true
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              },
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${percentage}%`;
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Update chart with new focus/distraction data
   * @param {Object} data - Object containing focusTime and distractionTime
   */
  updateChart(data) {
    if (!this.chart) return;
    
    this.chartData = data;
    
    // Handle case where both values are 0
    if (data.focusTime === 0 && data.distractionTime === 0) {
      this.chart.data.datasets[0].data = [100, 0];
    } else {
      this.chart.data.datasets[0].data = [data.focusTime, data.distractionTime];
    }
    
    this.chart.update();
  }
  
  /**
   * Update chart colors based on current theme
   */
  updateChartColors() {
    if (!this.chart) return;
    
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#F9FAFB' : '#1F2937';
    const borderColor = isDarkTheme ? '#1F2937' : '#FFFFFF';
    
    // Update legend text color
    this.chart.options.plugins.legend.labels.color = textColor;
    
    // Update border color
    this.chart.data.datasets[0].borderColor = borderColor;
    
    this.chart.update();
  }
  
  /**
   * Update chart with historical data
   * @param {Array} historicalData - Array of historical session data
   */
  updateChartWithData(historicalData) {
    if (!historicalData || historicalData.length === 0) return;
    
    // Calculate total focus and distraction time from historical data
    let totalFocusTime = 0;
    let totalDistractionTime = 0;
    
    historicalData.forEach(session => {
      // Each distraction is estimated at 15 seconds
      const sessionDistractionTime = session.distractionCount * 15;
      const sessionFocusTime = Math.max(0, session.duration - sessionDistractionTime);
      
      totalFocusTime += sessionFocusTime;
      totalDistractionTime += sessionDistractionTime;
    });
    
    // Update the chart
    this.updateChart({
      focusTime: totalFocusTime,
      distractionTime: totalDistractionTime
    });
  }
}