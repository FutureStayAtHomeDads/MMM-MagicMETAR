import { create } from 'node_helper';
import fetch from 'node-fetch';

// Enable Node.js warnings for unhandled Promise rejections (development only)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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
