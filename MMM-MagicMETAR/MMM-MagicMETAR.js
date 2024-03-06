Module.register("MMM-MagicMetar", {
    // Default module config
    defaults: {
        airports: ['KSFO', 'KJFK', 'KLAX', 'KORD', 'KDFW', 'KDEN', 'KATL'], // Sample list of airports
        updateInterval: 10, // in minutes
        showDelayData: true,
        showHeader: true,
        headerText: "Aviation Weather",
        showIcons: true,
        iconSet: 'default',
        temperatureUnit: 'C',
        dateFormat: 'ddd, MMM D, h:mm A',
        displayLimit: 6, // Maximum airports to display per page
        rotationSpeed: 5 // Rotation speed in seconds
    },

    // Override start method
    start() {
        this.currentPage = 0;
        this.weatherInfo = null;
        this.rotatePages(); // Start rotating pages
        this.fetchWeatherData(); // Fetch initial weather data
    },

    // Fetch weather data for current page
    fetchWeatherData() {
        const startIndex = this.currentPage * this.config.displayLimit;
        const endIndex = Math.min((this.currentPage + 1) * this.config.displayLimit, this.config.airports.length);
        const airports = this.config.airports.slice(startIndex, endIndex);
        this.sendSocketNotification('FETCH_WEATHER', airports);
    },

    // Rotate pages
    rotatePages() {
        setInterval(() => {
            this.currentPage = (this.currentPage + 1) % Math.ceil(this.config.airports.length / this.config.displayLimit);
            this.fetchWeatherData();
        }, this.config.rotationSpeed * 1000); // Convert rotation speed to milliseconds
    },

    // Override socketNotificationReceived method
    socketNotificationReceived(notification, payload) {
        if (notification === 'WEATHER_DATA') {
            if (payload.error) {
                console.error('Error fetching weather data');
            } else {
                this.weatherInfo = payload;
                this.updateDom();
            }
        }
    },

    // Override dom generator
    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "aviation-weather";

        if (this.weatherInfo) {
            // Display weather information
            // You can format and display the weather information here
            const airportsInfo = this.weatherInfo.airports;

            airportsInfo.forEach(airport => {
                const metar = airport.metar;
                const taf = airport.taf;

                const airportElement = document.createElement("div");
                airportElement.innerHTML = `<p>Airport: ${airport.code}</p>
                                             <p>METAR: ${JSON.stringify(metar)}</p>
                                             <p>TAF: ${JSON.stringify(taf)}</p>`;
                wrapper.appendChild(airportElement);
            });
        } else {
            // Display loading message or error message
            const message = document.createElement("div");
            message.innerHTML = "Error fetching weather data";
            wrapper.appendChild(message);
        }

        return wrapper;
    }
});
