const { create } = require('node_helper');
const fetch = require('node-fetch');

module.exports = create({
  start() {
    console.log('MMM-MagicMetar helper started...');
  },

  fetchWeatherData(config) {
    const url = `${config.apiBase}?ids=${config.airports.join(',')}&format=json&taf=true&hours=1`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.sendSocketNotification('WEATHER_DATA', data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'FETCH_WEATHER_DATA') {
      this.fetchWeatherData(payload);
    }
  },
});
