import { create } from 'magicmirror';
import fetch from 'node-fetch'; // Assuming this is available in your environment

export default create({
  defaults: {
    updateInterval: 60 * 60 * 1000, // Update every hour
    airports: ['KCLT', 'KJQF', 'KMYR'],
    apiBase: 'https://aviationweather.gov/api/data/metar',
    apiKey: '', // Add your API key if required
  },

  start() {
    this.scheduleUpdate();
  },

  scheduleUpdate() {
    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
    this.getData();
  },

  async getData() {
    const url = `${this.config.apiBase}?ids=${this.config.airports.join(',')}&format=json&taf=true&hours=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        this.processData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },

  processData(data) {
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

    this.airportsData = airportsData;
    this.updateDom();
  },

  getDom() {
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
