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

// Weather Data Fetching and Update
async function fetchWeatherData() {
  try {
    const baseURL =
      "http://redemet.decea.gov.br/api/consulta_automatica/index.php?local=sbrp&msg=metar&data_ini=" +
      getCurrentDate() +
      "&data_fim=" +
      getCurrentDate();
    const corsProxyURL = "https://corsproxy.io/?" + encodeURIComponent(baseURL);

    const response = await fetch(corsProxyURL);
    const data = await response.text();
    console.log("Resposta bruta da API:", data);

    const metar = data.split("\n")[0];
    console.log("Primeira linha (METAR):", metar);

    const tempMatch = metar.match(/\s(\d{2})\/(M?\d{2})\s/);

    if (tempMatch) {
      const temperature = parseInt(tempMatch[1]);
      let dewPointRaw = tempMatch[2];

      let dewPoint = 0;
      if (dewPointRaw.startsWith("M")) {
        dewPointRaw = dewPointRaw.replace("M", "");
        dewPoint = dewPointRaw === "00" ? 0 : -parseInt(dewPointRaw);
      } else {
        dewPoint = parseInt(dewPointRaw);
      }

      const humidity = calculateHumidity(temperature, dewPoint);

      document.getElementById("temperature").textContent = `${temperature}°C`;
      document.getElementById("humidity").textContent = `Umidade: ${humidity}%`;

      const now = new Date();
      const timeString = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      document.getElementById(
        "update-time"
      ).textContent = `Atualizado: ${timeString}`;
    }
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    const now = new Date();
    const timeString = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById(
      "update-time"
    ).textContent = `Atualizado: ${timeString}`;
  }
}

function getCurrentDate() {
  const now = new Date();
  now.setHours(now.getHours() + 3); // Adiciona 3 horas
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function calculateHumidity(temp, dewPoint) {
  // Fórmula simplificada para umidade relativa
  const humidity =
    100 *
    (Math.exp((17.625 * dewPoint) / (243.04 + dewPoint)) /
      Math.exp((17.625 * temp) / (243.04 + temp)));
  return Math.round(humidity);
}

// Atualizar a cada 2 minutos (120000 ms)
fetchWeatherData(); // Chamada inicial
setInterval(fetchWeatherData, 120000);
