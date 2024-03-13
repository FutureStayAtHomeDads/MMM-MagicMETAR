const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

Module.register('MMM-MagicMetar', {
  defaults: {
    updateInterval: 60 * 60 * 1000, // Update every hour
    airports: ['KCLT', 'KJQF', 'KMYR'],
    apiBase: 'https://aviationweather.gov/api/data/metar',
    apiKey: '', // Add your API key if required
  },

  start: function () {
    this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    const self = this;
    setInterval(function () {
      self.getData();
    }, this.config.updateInterval);
    self.getData();
  },

  getData: function () {
    const self = this;
    const url = `${this.config.apiBase}?ids=${this.config.airports.join(',')}&format=json&taf=true&hours=1`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          self.processData(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  },

  processData: function (data) {
    const airportsData = data.map((airport) => ({
      icaoId: airport.icaoId,
      name: airport.name,
      temp: airport.temp,
      dewp: airport.dewp,
      wind: `${airport.wdir}° at ${airport.wspd} knots`,
      visibility: airport.visib,
      clouds: airport.clouds[0]?.cover || 'N/A',
      rawTaf: airport.rawTaf,
    }));

    this.updateDom(1000);
  },

  getDom: function () {
    const wrapper = document.createElement('div');

    const airportsData = this.airportsData || [];
    airportsData.forEach((airport) => {
      const airportWrapper = document.createElement('div');

      const airportName = document.createElement('div');
      airportName.innerHTML = `<strong>${airport.icaoId}</strong>: ${airport.name}`;
      airportWrapper.appendChild(airportName);

      const temp = document.createElement('div');
      temp.textContent = `Temperature: ${airport.temp}°C`;
      airportWrapper.appendChild(temp);

      const dewp = document.createElement('div');
      dewp.textContent = `Dewpoint: ${airport.dewp}°C`;
      airportWrapper.appendChild(dewp);

      const wind = document.createElement('div');
      wind.textContent = `Wind: ${airport.wind}`;
      airportWrapper.appendChild(wind);

      const visibility = document.createElement('div');
      visibility.textContent = `Visibility: ${airport.visibility}`;
      airportWrapper.appendChild(visibility);

      const clouds = document.createElement('div');
      clouds.textContent = `Clouds: ${airport.clouds}`;
      airportWrapper.appendChild(clouds);

      const taf = document.createElement('div');
      taf.innerHTML = `<strong>TAF:</strong> ${airport.rawTaf}`;
      airportWrapper.appendChild(taf);

      wrapper.appendChild(airportWrapper);
    });

    return wrapper;
  },
});
