// Dark mode toggle
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        // Check for saved user preference or system preference
        if (localStorage.getItem('color-theme') === 'dark' || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
        
        themeToggle.addEventListener('click', function() {
            // Toggle icon
            themeIcon.classList.toggle('fa-moon');
            themeIcon.classList.toggle('fa-sun');
            
            // Toggle theme
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });

        // PWA Installation
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(function(registration) {
                console.log('Service Worker registrado com sucesso:', registration);
            }).catch(function(error) {
                console.log('Falha ao registrar o Service Worker:', error);
            });
        }

        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredPrompt = event;
            document.getElementById('installButton').classList.remove('hidden');
            document.getElementById('install-banner').classList.remove('hidden');
        });

        document.getElementById('installButton').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuário aceitou instalar o PWA');
                        document.getElementById('installButton').classList.add('hidden');
                        document.getElementById('install-banner').classList.add('hidden');
                    } else {
                        console.log('Usuário recusou instalar o PWA');
                    }
                    deferredPrompt = null;
                });
            }
        });

        document.getElementById('install-button').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuário aceitou instalar o PWA');
                        document.getElementById('installButton').classList.add('hidden');
                        document.getElementById('install-banner').classList.add('hidden');
                    } else {
                        console.log('Usuário recusou instalar o PWA');
                    }
                    deferredPrompt = null;
                });
            }
        });

        // Weather Data Fetching and Update
        async function fetchWeatherData() {
            try {
                // requisição à API
                const baseURL = 'http://redemet.decea.gov.br/api/consulta_automatica/index.php?local=sbrp&msg=metar&data_ini=' + getCurrentDate() + '&data_fim=' + getCurrentDate();
                const corsProxyURL = 'https://corsproxy.io/?' + encodeURIComponent(baseURL);

                const response = await fetch(corsProxyURL);
                const data = await response.text();
                console.log('Resposta bruta da API:', data);
                // Processar o METAR 
                const metar = data.split('\n')[0]; // Pega a primeira linha do retorno
                console.log('Primeira linha (METAR):', metar);
                // Extrair temperatura e ponto de orvalho (exemplo: "22/18")
                const tempMatch = metar.match(/\s(\d{2})\/(\d{2})\s/);
                
                if (tempMatch) {
                    const temperature = tempMatch[1];
                    const dewPoint = tempMatch[2];
                    
                    // Calcular umidade relativa 
                    const humidity = calculateHumidity(parseInt(temperature), parseInt(dewPoint));
                    
                    // Atualizar a interface
                    document.getElementById('temperature').textContent = `${temperature}°C`;
                    document.getElementById('humidity').textContent = `Umidade: ${humidity}%`;
                    
                    // Atualizar horário
                    const now = new Date();
                    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    document.getElementById('update-time').textContent = `Atualizado: ${timeString}`;
                }
            } catch (error) {
                console.error('Erro ao buscar dados meteorológicos:', error);
                const now = new Date();
                const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                document.getElementById('update-time').textContent = `Atualizado: ${timeString}`;
            }
        }

        function getCurrentDate() {
            const now = new Date();
            now.setHours(now.getHours()+3); // Adiciona 3 horas
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }

        function calculateHumidity(temp, dewPoint) {
            // Fórmula simplificada para umidade relativa
            const humidity = 100 * (Math.exp((17.625 * dewPoint)/(243.04 + dewPoint)) / Math.exp((17.625 * temp)/(243.04 + temp)));
            return Math.round(humidity);
        }

        // Atualizar a cada 2 minutos (120000 ms)
        fetchWeatherData(); // Chamada inicial
        setInterval(fetchWeatherData, 120000);