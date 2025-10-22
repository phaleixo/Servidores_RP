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
async function fetchWeatherData() {
  try {
    const apiURL = "https://weather-api-dun-mu.vercel.app/api/weather";

    let response;
    try {
      response = await fetch(apiURL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      // Possível erro de rede ou CORS quando rodando em servidor local
      console.warn(
        "Primeira tentativa de fetch falhou, tentando via proxy (allorigins):",
        err
      );
      // Usar proxy público como fallback para contornar CORS durante desenvolvimento
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        apiURL
      )}`;
      response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP proxy ${response.status}`);
    }

    const json = await response.json();
    // Log mínimo: somente em caso de erro (mantemos console.debug para desenvolvimento se necessário)

    // Usar apenas os campos calculados pela API
    // API pode retornar temperature ou temperatureC; preferimos temperature, senão fallback para temperatureC
    const temperature = json.temperature ?? json.temperatureC;
    const humidity = json.humidity;
    // Corrigir nome de campo: API retorna updatedAt (com D maiúsculo)
    const updatedAt = json.updatedAt ?? json.updateAt ?? json.update_at;

    // Atualiza DOM com checagens de existência dos elementos
    const tempEl = document.getElementById("temperature");
    const humEl = document.getElementById("humidity");
    const updateEl = document.getElementById("update-time");
    const metarSummaryEl = document.getElementById("metar-summary");

    if (tempEl) {
      if (
        temperature !== undefined &&
        temperature !== null &&
        !isNaN(temperature)
      ) {
        // Exibir temperatura arredondada e unidade. A API retorna Celsius, então usamos °C.
        tempEl.textContent = `${Math.round(temperature)}°C`;
      } else {
        tempEl.textContent = "N/D";
      }
    }

    if (humEl) {
      humEl.textContent =
        humidity !== undefined
          ? `Umidade: ${Math.round(humidity)}%`
          : "Umidade: N/D";
    }

    if (updateEl) {
      // Usar apenas o timestamp fornecido pela API. A API já fornece uma string curta (ex: "09:22")
      let timeString = "N/D";

      if (updatedAt) {
        // Se for uma string curta no formato HH:MM, usar diretamente; caso contrário, tentar parsear como Date
        if (
          typeof updatedAt === "string" &&
          /^\d{1,2}:\d{2}$/.test(updatedAt.trim())
        ) {
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

    // Mostrar um resumo simples do METAR (estação, temperatura, qnh) se disponível
    if (metarSummaryEl) {
      let summary = "--";
      // A API pode fornecer o METAR bruto em json.metar ou json.raw
      const raw = json.metar ?? json.raw ?? "";
      if (raw && typeof raw === "string") {
        // Tentativa simples de extrair estação (por exemplo SBRP) e temperatura (ex: 16/08 -> temperatura 16)
        try {
          const stationMatch = raw.match(/METAR\s+(\w+)/i);
          const tempMatch = raw.match(/\b(\d{1,2})\/(\d{1,2})\b/);
          const qnhMatch = raw.match(/Q(\d{4})\b/);
          const parts = [];
          if (stationMatch) parts.push(stationMatch[1]);
          if (tempMatch) parts.push(`${tempMatch[1]}°C`);
          if (qnhMatch) parts.push(`QNH ${qnhMatch[1]}hPa`);
          if (parts.length) summary = parts.join(" • ");
          else summary = raw.split("=")[0] || raw;
        } catch (e) {
          summary = raw.split("=")[0] || raw;
        }
      }
      metarSummaryEl.textContent = summary;
    }
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    const tempEl = document.getElementById("temperature");
    const humEl = document.getElementById("humidity");
    const updateEl = document.getElementById("update-time");

    if (tempEl) tempEl.textContent = "N/D";
    if (humEl) humEl.textContent = "Umidade: N/D";
    if (updateEl) updateEl.textContent = `Atualizado: N/D`;
  }
}
// Atualizar a cada 2 minutos (120000 ms)
fetchWeatherData(); // Chamada inicial
setInterval(fetchWeatherData, 120000);
