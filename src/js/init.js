// Inicialização do monitor de clima e bindings
(function () {
  function initWeatherMonitor() {
    // Buscar dados imediatamente ao carregar
    window.fetchWeatherData && window.fetchWeatherData();

    // Configurar atualização automática
    if (window.APP_CONFIG && window.APP_CONFIG.UPDATE_INTERVAL) {
      setInterval(window.fetchWeatherData, window.APP_CONFIG.UPDATE_INTERVAL);
    }

    // Clique no card para forçar atualização
    const weatherCard = document.getElementById("weather-card");
    if (weatherCard) {
      weatherCard.style.cursor = "pointer";
      weatherCard.title = "Clique para atualizar";
      weatherCard.addEventListener("click", function () {
        window.fetchWeatherData && window.fetchWeatherData();
      });
    }
  }

  // Inicializar após DOM pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWeatherMonitor);
  } else {
    initWeatherMonitor();
  }

  // Export (optional)
  window.initWeatherMonitor = initWeatherMonitor;
})();
