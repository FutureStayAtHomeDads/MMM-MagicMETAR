const NodeHelper = require('node_helper');
const axios = require('axios');

module.exports = NodeHelper.create({
    // Override start method
    start() {
        console.log('Starting module: ' + this.name);
    },

    // Override socketNotificationReceived method
    socketNotificationReceived(notification, payload) {
        if (notification === 'FETCH_WEATHER') {
            this.fetchWeather(payload);
        }
    },

    // Function to fetch weather data for a specific airport
    async fetchWeather(airportCode) {
        const metarData = await this.fetchMETAR(airportCode);
        const tafData = await this.fetchTAF(airportCode);

        if (metarData && tafData) {
            // Process and display weather data
            this.processWeatherData(airportCode, metarData, tafData);
        } else {
            // Send empty data to frontend with error flag
            this.sendSocketNotification('WEATHER_DATA', { airportCode, error: true });
        }
    },

    // Function to fetch METAR data for a specific airport
    async fetchMETAR(airportCode) {
        const url = `https://aviationweather.gov/api/data/metar?station=${airportCode}&format=json`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching METAR data:', error);
            return null;
        }
    },

    // Function to fetch TAF data for a specific airport
    async fetchTAF(airportCode) {
        // Implement logic to fetch TAF data
        return null;
    },

    // Function to process weather data
    processWeatherData(airportCode, metarData, tafData) {
        // Process METAR and TAF data
        // Display weather information on MagicMirror2 interface
        const weatherInfo = {
            airportCode,
            metar: metarData,
            taf: tafData
        };
        this.sendSocketNotification('WEATHER_DATA', weatherInfo);
    }
});
