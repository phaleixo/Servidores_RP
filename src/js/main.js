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

// src/js/weather.js

async function fetchWeatherData() {
  const apiURL = "https://weather-api-dun-mu.vercel.app/api/weather";

  // Seletores dos elementos no HTML
  const tempEl = document.getElementById("temperature");
  const humEl = document.getElementById("humidity");
  const timeEl = document.getElementById("update-time");
  const summaryEl = document.getElementById("metar-summary");

  try {
    // Busca os dados da API
    const response = await fetch(apiURL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();

    // Extrai dados esperados
    const temp = data.temperature ?? "--";
    const hum = data.humidity ?? "--";
    const metar = data.metar_summary ?? "Sem informações disponíveis";

    // Atualiza o HTML
    tempEl.textContent = `${temp}°C`;
    humEl.textContent = `Umidade: ${hum}%`;
    summaryEl.textContent = metar;

    // Atualiza horário da última atualização
    const now = new Date();
    const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    timeEl.textContent = `Atualizado: ${hora}`;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);

    tempEl.textContent = "--°C";
    humEl.textContent = "Umidade: --%";
    summaryEl.textContent = "Erro ao obter dados";
    timeEl.textContent = "Atualizado: falha";
  }
}

// Atualiza ao carregar a página
document.addEventListener("DOMContentLoaded", fetchWeatherData);

// Atualiza a cada 2 minutos (120000 ms)
setInterval(fetchWeatherData, 120000);
