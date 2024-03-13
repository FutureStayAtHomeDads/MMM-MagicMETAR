import('MMM-MagicMetar.js')
  .then(({ default: create }) => {
    // Your code inside the dynamic import callback
    export default create({
      start() {
        console.log('MMM-MagicMetar helper started...');
      },
    
      async fetchWeatherData(config) {
        const url = `${config.apiBase}?ids=${config.airports.join(',')}&format=json&taf=true&hours=1`;
    
        try {
          const response = await fetch(url);
          const data = await response.json();
          this.sendSocketNotification('WEATHER_DATA', data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
    
      socketNotificationReceived(notification, payload) {
        if (notification === 'FETCH_WEATHER_DATA') {
          this.fetchWeatherData(payload);
        }
      },
    });
  })
  .catch(error => {
    console.error('Dynamic import error:', error);
    // Handle the error or log it appropriately
  });
