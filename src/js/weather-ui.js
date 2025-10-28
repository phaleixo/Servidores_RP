// Funções de UI relacionadas à exibição do clima (temperatura, umidade, ícone, resumo)
(function () {
  // Flags para evitar spam de notificações repetidas
  let lastHumidityAlert = null; // true = já alertado baixa umidade, false = já normalizado, null = sem estado
  let lastTempAlert = null; // true = já alertado temperatura alta

  function sendNotification(title, body) {
    try {
      if (!("Notification" in window)) return;
      const icon =
        (window.APP_CONFIG && window.APP_CONFIG.DEFAULT_ICON_URL) || undefined;

      if (Notification.permission === "granted") {
        const n = new Notification(title, { body, icon });
        n.onclick = function () {
          try {
            window.focus();
            n.close();
          } catch (e) {}
        };
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            try {
              const n = new Notification(title, { body, icon });
              n.onclick = function () {
                try {
                  window.focus();
                  n.close();
                } catch (e) {}
              };
            } catch (e) {}
          }
        });
      }
    } catch (err) {
      // não crítico
    }
  }
  function updateMetarSummary(temperature, humidity) {
    try {
      const metarSummaryElement = document.getElementById("metar-summary");
      if (!metarSummaryElement) return;

      let summary = "";

      if (typeof temperature === "number") {
        if (temperature >= 30) summary = "Quente";
        else if (temperature <= 15) summary = "Frio";
        else summary = "Agradável";
      }

      if (typeof humidity === "number") {
        if (humidity >= 70) summary += summary ? " e úmido" : "Úmido";
        else if (humidity <= 30) summary += summary ? " e seco" : "Seco";
      }

      metarSummaryElement.textContent = summary || "Sem resumo disponível";
    } catch (error) {
      console.error("Erro em updateMetarSummary:", error);
    }
  }

  function showWeatherError() {
    try {
      const temperatureElement = document.getElementById("temperature");
      const humidityElement = document.getElementById("humidity");
      const updateTimeElement = document.getElementById("update-time");
      const metarSummaryElement = document.getElementById("metar-summary");

      if (temperatureElement) temperatureElement.textContent = "--°C";
      if (temperatureElement) {
        try {
          temperatureElement.classList.remove("font-extrabold");
        } catch (e) {}
      }
      if (humidityElement) humidityElement.textContent = "Umidade: --%";
      if (humidityElement) {
        try {
          humidityElement.classList.remove("text-red-500", "font-semibold");
        } catch (e) {}
      }
      if (updateTimeElement) updateTimeElement.textContent = "Atualizado: Erro";
      if (metarSummaryElement)
        metarSummaryElement.textContent = "Dados indisponíveis";

      // Resetar ícone (usar fallback local)
      try {
        const iconEl = document.getElementById("weather-icon");
        if (
          iconEl &&
          iconEl.tagName &&
          iconEl.tagName.toLowerCase() === "img"
        ) {
          iconEl.src = window.APP_CONFIG.DEFAULT_ICON_URL;
        }
      } catch (err) {
        // não crítico
      }
      // Resetar flags de notificação para permitir novos avisos quando dados voltarem
      try {
        lastHumidityAlert = null;
        lastTempAlert = null;
      } catch (e) {}
    } catch (error) {
      console.error("Erro ao mostrar estado de erro:", error);
    }
  }

  function updateWeatherDisplay(data) {
    try {
      const temperatureElement = document.getElementById("temperature");
      const humidityElement = document.getElementById("humidity");
      const updateTimeElement = document.getElementById("update-time");

      if (!temperatureElement || !humidityElement) {
        console.error("Elementos do clima não encontrados no DOM");
        return;
      }

      const { temperature, humidity } = data;
      const iconUrl = data.iconUrl || data.icon || null;

      // Atualizar temperatura e umidade
      temperatureElement.textContent = `${temperature}°C`;
      humidityElement.textContent = `Umidade: ${humidity}%`;

      // Destacar estados (usar utilitários Tailwind via classes)
      try {
        // umidade baixa -> texto em vermelho
        if (typeof humidity === "number" && humidity <= 20) {
          humidityElement.classList.add("text-red-500", "font-semibold");
        } else {
          humidityElement.classList.remove("text-red-500", "font-semibold");
        }

        // temperatura alta -> apenas destaque de peso (cor permanece branca)
        if (typeof temperature === "number" && temperature >= 38) {
          temperatureElement.classList.add("font-extrabold");
        } else {
          temperatureElement.classList.remove("font-extrabold");
        }
      } catch (e) {
        // não crítico
      }

      // Notificações: evitar spam usando flags locais
      try {
        const isLowHum = typeof humidity === "number" && humidity <= 20;
        if (isLowHum && lastHumidityAlert !== true) {
          sendNotification(
            "Alerta: Umidade baixa",
            `Umidade ${humidity}% — verifique as condições.`
          );
          lastHumidityAlert = true;
        } else if (!isLowHum && lastHumidityAlert === true) {
          // voltou ao normal — permitir novo alerta no futuro
          lastHumidityAlert = false;
        }

        const isHighTemp = typeof temperature === "number" && temperature >= 38;
        if (isHighTemp && lastTempAlert !== true) {
          sendNotification(
            "Alerta: Temperatura alta",
            `Temperatura ${temperature}°C — recomenda-se atenção.`
          );
          lastTempAlert = true;
        } else if (!isHighTemp && lastTempAlert === true) {
          lastTempAlert = false;
        }
      } catch (e) {
        // não crítico
      }

      // Destacar temperatura alta (>= 38°C)
      try {
        if (typeof temperature === "number" && temperature >= 38) {
          temperatureElement.classList.add("high-temperature");
        } else {
          temperatureElement.classList.remove("high-temperature");
        }
      } catch (e) {
        // não crítico
      }

      // Atualizar hora
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
      if (updateTimeElement)
        updateTimeElement.textContent = `Atualizado às ${formattedTime}`;

      // Resumo
      updateMetarSummary(temperature, humidity);

      // Ícone: spinner + carregamento do SVG (ou fallback)
      const iconEl = document.getElementById("weather-icon");
      if (iconEl) {
        try {
          const spinner = document.getElementById("weather-icon-spinner");
          iconEl.alt = "Ícone do tempo";
          iconEl.loading = "lazy";
          iconEl.decoding = "async";

          if (iconUrl) {
            if (spinner) spinner.classList.remove("hidden");
            iconEl.style.opacity = "0";

            iconEl.onload = function () {
              if (spinner) spinner.classList.add("hidden");
              iconEl.style.opacity = "1";
              iconEl.onload = null;
              iconEl.onerror = null;
            };

            iconEl.onerror = function () {
              if (spinner) spinner.classList.add("hidden");
              try {
                iconEl.src = window.APP_CONFIG.DEFAULT_ICON_URL;
                iconEl.style.opacity = "1";
              } catch (e) {}
              iconEl.onload = null;
              iconEl.onerror = null;
            };

            iconEl.src = iconUrl;
          } else {
            if (spinner) spinner.classList.add("hidden");
            try {
              iconEl.src = window.APP_CONFIG.DEFAULT_ICON_URL;
              iconEl.style.opacity = "1";
            } catch (e) {}
          }
        } catch (err) {
          console.error("Erro ao definir src do ícone:", err);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar display:", error);
    }
  }

  // Expor as funções globalmente para serem usadas por outras partes do app
  window.updateWeatherDisplay = updateWeatherDisplay;
  window.updateMetarSummary = updateMetarSummary;
  window.showWeatherError = showWeatherError;
})();
