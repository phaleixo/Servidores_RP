// Configuração do Tailwind
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "rp-blue": "#04295b",
        "rp-light-blue": "#044884",
      },
    },
  },
};

document.addEventListener("DOMContentLoaded", function () {
  // Alternância de tema
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  if (themeToggle && themeIcon) {
    themeToggle.addEventListener("click", function () {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // Verificar preferência de tema salva
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    document.documentElement.classList.remove("dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }

  // Feedback tátil para os cartões
  const linkCards = document.querySelectorAll("a");
  linkCards.forEach((card) => {
    card.addEventListener("touchstart", function () {
      this.classList.add("opacity-80");
    });

    card.addEventListener("touchend", function () {
      this.classList.remove("opacity-80");
    });
  });

  // Registro do Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("service-worker.js")
        .then(function (registration) {
          console.log(
            "Service Worker registrado com sucesso:",
            registration.scope
          );
        })
        .catch(function (error) {
          console.error("Falha ao registrar o Service Worker:", error);
        });
    });
  }
});

// Weather Data Fetching and Update (usa endpoint Vercel fornecido)
// Função para buscar e atualizar dados meteorológicos
async function fetchWeatherData() {
  const apiURL = "https://api.allorigins.win/raw?url=https://weather-api-dun-mu.vercel.app/api/weather";

  const tempEl = document.getElementById("temperature");
  const humEl = document.getElementById("humidity");
  const updateEl = document.getElementById("update-time");
  const metarSummaryEl = document.getElementById("metar-summary");

  try {
    const response = await fetch(apiURL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();

    // Extrai os campos principais
    const temperature = json.temperature ?? json.temperatureC;
    const humidity = json.humidity;
    const updatedAt = json.updatedAt ?? json.updateAt ?? json.update_at;

    // Atualiza elementos na tela
    if (tempEl) {
      tempEl.textContent =
        temperature !== undefined && temperature !== null && !isNaN(temperature)
          ? `${Math.round(temperature)}°C`
          : "N/D";
    }

    if (humEl) {
      humEl.textContent =
        humidity !== undefined
          ? `Umidade: ${Math.round(humidity)}%`
          : "Umidade: N/D";
    }

    if (updateEl) {
      let timeString = "N/D";

      if (updatedAt) {
        if (typeof updatedAt === "string" && /^\d{1,2}:\d{2}$/.test(updatedAt.trim())) {
          timeString = updatedAt.trim();
        } else {
          try {
            const parsed = new Date(updatedAt);
            if (!isNaN(parsed)) {
              timeString = parsed.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          } catch (e) {
            console.warn("Erro ao parsear updatedAt:", e);
          }
        }
      }

      updateEl.textContent = `Atualizado: ${timeString}`;
    }

    // Exibe um resumo simples do METAR se disponível
    if (metarSummaryEl) {
      let summary = "--";
      const raw = json.metar ?? json.raw ?? "";
      if (raw && typeof raw === "string") {
        try {
          const stationMatch = raw.match(/METAR\s+(\w+)/i);
          const tempMatch = raw.match(/\b(\d{1,2})\/(\d{1,2})\b/);
          const qnhMatch = raw.match(/Q(\d{4})\b/);
          const parts = [];
          if (stationMatch) parts.push(stationMatch[1]);
          if (tempMatch) parts.push(`${tempMatch[1]}°C`);
          if (qnhMatch) parts.push(`QNH ${qnhMatch[1]}hPa`);
          summary = parts.length ? parts.join(" • ") : raw.split("=")[0];
        } catch {
          summary = raw.split("=")[0];
        }
      }
      metarSummaryEl.textContent = summary;
    }

    // Salva dados no cache local
    localStorage.setItem(
      "weatherData",
      JSON.stringify({
        temperature,
        humidity,
        updatedAt,
        metarSummary: metarSummaryEl?.textContent ?? "",
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);

    // Tenta restaurar do cache local
    const cached = localStorage.getItem("weatherData");
    if (cached) {
      const { temperature, humidity, updatedAt, metarSummary } = JSON.parse(cached);
      if (tempEl && temperature) tempEl.textContent = `${Math.round(temperature)}°C`;
      if (humEl && humidity) humEl.textContent = `Umidade: ${Math.round(humidity)}%`;
      if (updateEl && updatedAt) updateEl.textContent = `Atualizado: ${updatedAt}`;
      if (metarSummaryEl && metarSummary) metarSummaryEl.textContent = metarSummary;
    } else {
      if (tempEl) tempEl.textContent = "N/D";
      if (humEl) humEl.textContent = "Umidade: N/D";
      if (updateEl) updateEl.textContent = "Atualizado: N/D";
      if (metarSummaryEl) metarSummaryEl.textContent = "--";
    }
  }
}

// Chamada inicial e atualização a cada 2 minutos
fetchWeatherData();
setInterval(fetchWeatherData, 120000);
