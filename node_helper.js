const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-MagicMetar helper started...');
  },

  fetchWeatherData: function (config) {
    const url = `${config.apiBase}?ids=${config.airports.join(',')}&format=json&taf=true&hours=1`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.sendSocketNotification('WEATHER_DATA', data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'FETCH_WEATHER_DATA') {
      this.fetchWeatherData(payload);
    }
  },
});
