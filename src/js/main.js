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

// Configurações da API
const WEATHER_API_URL = 'https://weather-api-dun-mu.vercel.app/api/weather';
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Elementos DOM para o clima
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const updateTimeElement = document.getElementById('update-time');
const metarSummaryElement = document.getElementById('metar-summary');

// Função principal para buscar dados do clima
async function fetchWeatherData() {
    try {
        console.log('🌤️ Buscando dados do clima...');
        
        const response = await fetch(WEATHER_API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        updateWeatherDisplay(data);
        console.log('✅ Dados do clima atualizados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados do clima:', error);
        showWeatherError();
    }
}

// Função para atualizar a exibição dos dados do clima
function updateWeatherDisplay(data) {
    const { temperature, humidity, updatedAt } = data;
    
    // Atualizar temperatura
    temperatureElement.textContent = `${temperature}°C`;
    
    // Atualizar umidade
    humidityElement.textContent = `Umidade: ${humidity}%`;
    
    // Atualizar horário da última atualização
    const formattedTime = formatUpdateTime(updatedAt);
    updateTimeElement.textContent = `Atualizado: ${formattedTime}`;
    
    // Atualizar resumo METAR baseado nas condições
    updateMetarSummary(temperature, humidity);
    
    // Atualizar ícone do clima baseado na temperatura
    updateWeatherIcon(temperature, humidity);
}

// Função para formatar o horário de atualização
function formatUpdateTime(dateString) {
    const date = new Date(dateString);
    
    // Formato brasileiro: HH:MM
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    };
    
    return date.toLocaleTimeString('pt-BR', options);
}

// Função para atualizar o resumo METAR baseado nas condições
function updateMetarSummary(temperature, humidity) {
    let summary = '';
    
    if (temperature >= 30) {
        summary = 'Quente e ';
    } else if (temperature <= 15) {
        summary = 'Frio e ';
    } else {
        summary = 'Agradável e ';
    }
    
    if (humidity >= 70) {
        summary += 'Úmido';
    } else if (humidity <= 30) {
        summary += 'Seco';
    } else {
        summary += 'Normal';
    }
    
    metarSummaryElement.textContent = summary;
}

// Função para atualizar o ícone do clima baseado nas condições
function updateWeatherIcon(temperature, humidity) {
    const weatherIcon = document.querySelector('.fa-cloud-sun');
    
    if (!weatherIcon) return;
    
    // Remover classes existentes
    weatherIcon.className = 'fas';
    
    // Definir ícone baseado nas condições
    if (temperature >= 30) {
        weatherIcon.classList.add('fa-sun');
    } else if (temperature <= 15) {
        weatherIcon.classList.add('fa-snowflake');
    } else if (humidity >= 70) {
        weatherIcon.classList.add('fa-cloud-rain');
    } else {
        weatherIcon.classList.add('fa-cloud-sun');
    }
}

// Função para exibir estado de erro no clima
function showWeatherError() {
    temperatureElement.textContent = '--°C';
    humidityElement.textContent = 'Umidade: --%';
    updateTimeElement.textContent = 'Atualizado: Erro';
    metarSummaryElement.textContent = 'Dados indisponíveis';
    
    // Resetar ícone para padrão
    const weatherIcon = document.querySelector('.fa-cloud-sun');
    if (weatherIcon) {
        weatherIcon.className = 'fas fa-cloud-sun';
    }
}

// Função para inicializar o monitor de clima
function initWeatherMonitor() {
    console.log('🌤️ Iniciando monitor de clima...');
    
    // Buscar dados imediatamente ao carregar
    fetchWeatherData();
    
    // Configurar atualização automática
    setInterval(fetchWeatherData, UPDATE_INTERVAL);
    
    // Adicionar evento de clique para atualização manual no card do clima
    const weatherCard = document.querySelector('.rounded-xl.p-2');
    if (weatherCard) {
        weatherCard.style.cursor = 'pointer';
        weatherCard.title = 'Clique para atualizar';
        weatherCard.addEventListener('click', fetchWeatherData);
    }
    
    console.log(`✅ Monitor de clima configurado (atualização a cada ${UPDATE_INTERVAL / 60000}min)`);
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeatherMonitor);
} else {
    initWeatherMonitor();
}

// Adicionar ao escopo global para possível uso manual
window.weatherApp = {
    fetchWeatherData,
    updateWeatherDisplay,
    initWeatherMonitor
};