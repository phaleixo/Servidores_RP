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

// Função principal para buscar dados do clima com tratamento de CORS
async function fetchWeatherData() {
    try {
        console.log('🌤️ Buscando dados do clima...');
        
        // Usando mode 'cors' e headers básicos
        const response = await fetch(WEATHER_API_URL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        
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
    try {
        const temperatureElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        const updateTimeElement = document.getElementById('update-time');
        const metarSummaryElement = document.getElementById('metar-summary');

        if (!temperatureElement || !humidityElement) {
            console.error('Elementos do clima não encontrados no DOM');
            return;
        }

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
        
        // Atualizar ícone do clima baseado nas condições
        updateWeatherIcon(temperature, humidity);
        
    } catch (error) {
        console.error('Erro ao atualizar display:', error);
    }
}

// Função para formatar o horário de atualização
function formatUpdateTime(dateString) {
    try {
        const date = new Date(dateString);
        
        // Formato brasileiro: HH:MM
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        };
        
        return date.toLocaleTimeString('pt-BR', options);
    } catch (error) {
        return '--:--';
    }
}

// Função para atualizar o resumo METAR baseado nas condições
function updateMetarSummary(temperature, humidity) {
    try {
        const metarSummaryElement = document.getElementById('metar-summary');
        if (!metarSummaryElement) return;

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
    } catch (error) {
        console.error('Erro ao atualizar METAR:', error);
    }
}

// Função para atualizar o ícone do clima baseado nas condições
function updateWeatherIcon(temperature, humidity) {
    try {
        // Encontrar o ícone do clima - pode estar em diferentes elementos
        let weatherIcon = document.querySelector('.fa-cloud-sun') || 
                         document.querySelector('.fa-sun') ||
                         document.querySelector('.fa-snowflake') ||
                         document.querySelector('.fa-cloud-rain');
        
        if (!weatherIcon) {
            // Se não encontrar, tenta encontrar pelo container do clima
            const weatherContainer = document.querySelector('.rounded-xl.p-2');
            if (weatherContainer) {
                weatherIcon = weatherContainer.querySelector('i');
            }
        }
        
        if (!weatherIcon) return;
        
        // Salvar classes base do Font Awesome
        const baseClass = 'fas';
        
        // Definir ícone baseado nas condições
        let iconClass = 'fa-cloud-sun'; // padrão
        
        if (temperature >= 30) {
            iconClass = 'fa-sun';
        } else if (temperature <= 15) {
            iconClass = 'fa-snowflake';
        } else if (humidity >= 70) {
            iconClass = 'fa-cloud-rain';
        }
        
        weatherIcon.className = `${baseClass} ${iconClass}`;
    } catch (error) {
        console.error('Erro ao atualizar ícone:', error);
    }
}

// Função para exibir estado de erro no clima
function showWeatherError() {
    try {
        const temperatureElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        const updateTimeElement = document.getElementById('update-time');
        const metarSummaryElement = document.getElementById('metar-summary');

        if (temperatureElement) temperatureElement.textContent = '--°C';
        if (humidityElement) humidityElement.textContent = 'Umidade: --%';
        if (updateTimeElement) updateTimeElement.textContent = 'Atualizado: Erro';
        if (metarSummaryElement) metarSummaryElement.textContent = 'Dados indisponíveis';
        
        // Resetar ícone para padrão
        updateWeatherIcon(25, 50); // Valores padrão
    } catch (error) {
        console.error('Erro ao mostrar estado de erro:', error);
    }
}

// Função para inicializar o monitor de clima
function initWeatherMonitor() {
    console.log('🌤️ Iniciando monitor de clima...');
    
    // Aguardar um pouco para garantir que o DOM esteja totalmente carregado
    setTimeout(() => {
        // Buscar dados imediatamente ao carregar
        fetchWeatherData();
        
        // Configurar atualização automática
        setInterval(fetchWeatherData, UPDATE_INTERVAL);
        
        // Adicionar evento de clique para atualização manual no card do clima
        const weatherCard = document.querySelector('.rounded-xl.p-2.text-left');
        if (weatherCard) {
            weatherCard.style.cursor = 'pointer';
            weatherCard.title = 'Clique para atualizar';
            weatherCard.addEventListener('click', fetchWeatherData);
        }
        
        console.log(`✅ Monitor de clima configurado (atualização a cada ${UPDATE_INTERVAL / 60000}min)`);
    }, 1000);
}

// Versão alternativa mais simples para debug
function simpleWeatherFetch() {
    fetch('https://weather-api-dun-mu.vercel.app/api/weather')
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos:', data);
            updateWeatherDisplay(data);
        })
        .catch(error => {
            console.error('Erro simples:', error);
            showWeatherError();
        });
}

// Inicializar quando a página estiver totalmente carregada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeatherMonitor);
} else {
    // DOM já carregado
    initWeatherMonitor();
}

// Adicionar fallback - tentar inicializar após um tempo
setTimeout(initWeatherMonitor, 2000);

// Exportar para uso global (se necessário)
window.weatherApp = {
    fetchWeatherData,
    updateWeatherDisplay,
    initWeatherMonitor,
    simpleWeatherFetch
};