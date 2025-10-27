// Configurações globais do aplicativo disponíveis em window.APP_CONFIG
(function () {
  const APP_CONFIG = {
    WEATHER_API_URL: "https://weather-api-dun-mu.vercel.app/api/weather",
    DEFAULT_ICON_URL: "src/img/weather-default.svg",
    UPDATE_INTERVAL: 2 * 60 * 1000, // 2 minutos
  };

  window.APP_CONFIG = APP_CONFIG;
})();
