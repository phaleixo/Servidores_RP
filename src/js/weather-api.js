// Comunicação com a API de clima
(function () {
  async function fetchWeatherData() {
    const weatherCard = document.getElementById("weather-card");
    if (weatherCard) weatherCard.classList.add("loading");

    try {
      const response = await fetch(window.APP_CONFIG.WEATHER_API_URL, {
        method: "GET",
        mode: "cors",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      window.updateWeatherDisplay && window.updateWeatherDisplay(data);
    } catch (error) {
      console.error("❌ Erro ao buscar dados do clima:", error);
      window.showWeatherError && window.showWeatherError();
    } finally {
      setTimeout(() => {
        if (weatherCard) weatherCard.classList.remove("loading");
      }, 250);
    }
  }

  // Expor globalmente
  window.fetchWeatherData = fetchWeatherData;
})();
