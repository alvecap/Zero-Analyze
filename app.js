// app.js - Logique principale optimisée pour Telegram WebApp

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'application Telegram WebApp
    let telegramApp;
    try {
        telegramApp = window.Telegram.WebApp;
        // Informer Telegram que l'app est prête
        telegramApp.ready();
        // Expansion de l'app pour utiliser tout l'écran disponible
        telegramApp.expand();
        
        // Appliquer les couleurs du thème Telegram si disponibles
        if (telegramApp.themeParams) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', telegramApp.themeParams.bg_color || '#f8f9fa');
            document.documentElement.style.setProperty('--tg-theme-text-color', telegramApp.themeParams.text_color || '#333333');
            document.documentElement.style.setProperty('--tg-theme-button-color', telegramApp.themeParams.button_color || '#6366f1');
            document.documentElement.style.setProperty('--tg-theme-button-text-color', telegramApp.themeParams.button_text_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-theme-hint-color', telegramApp.themeParams.hint_color || '#999999');
            document.documentElement.style.setProperty('--tg-theme-link-color', telegramApp.themeParams.link_color || '#2481cc');
        }
    } catch (error) {
        console.error('Telegram WebApp non disponible:', error);
    }

    // Éléments du DOM
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-item');
    const startButton = document.getElementById('start-btn');
    const homeButton = document.getElementById('home-btn');
    const newPredictionButton = document.getElementById('new-prediction-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    // Configuration de la navigation principale
    function navigateTo(pageId, direction = 'forward') {
        // Masquer toutes les pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        targetPage.classList.add('active');

        // Mettre à jour les boutons de navigation
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `nav-${pageId}`) {
                btn.classList.add('active');
            }
        });

        // Événements spécifiques à certaines pages
        if (pageId === 'home') {
            // Actions spécifiques à la page d'accueil
            if (window.initLogoAnimationEffect) {
                const logoContainer = document.getElementById('logo-animation');
                if (logoContainer) {
                    window.initLogoAnimationEffect(logoContainer);
                }
            }
        } else if (pageId === 'profile') {
            // Charger le profil utilisateur
            if (window.loadUserProfile) {
                window.loadUserProfile();
            }
        } else if (pageId === 'services') {
            // Charger les services
            if (window.loadServices) {
                window.loadServices();
            }
        }

        // Faire défiler vers le haut
        window.scrollTo(0, 0);
    }

    // Initialisation des événements de navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.id.replace('nav-', '');
            navigateTo(pageId);
        });
    });

    // Bouton de démarrage
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Commencer le questionnaire
            if (window.resetQuestionnaire) {
                window.resetQuestionnaire();
            }
            navigateTo('questionnaire');
        });
    }

    // Bouton retour à l'accueil depuis les résultats
    if (homeButton) {
        homeButton.addEventListener('click', function() {
            navigateTo('home');
        });
    }

    // Bouton nouvelle prédiction
    if (newPredictionButton) {
        newPredictionButton.addEventListener('click', function() {
            if (window.resetQuestionnaire) {
                window.resetQuestionnaire();
            }
            navigateTo('questionnaire');
        });
    }

    // Initialisation de l'application
    function initApp() {
        // Vérification de l'authentification Telegram
        checkTelegramAuth();
        
        // Préchargement des services
        if (window.loadServices) {
            window.loadServices();
        }
    }

    // Vérification de l'authentification Telegram
    function checkTelegramAuth() {
        if (telegramApp) {
            const user = telegramApp.initDataUnsafe?.user;
            if (user && window.setUserData) {
                // Utilisateur authentifié
                window.setUserData(user);
            } else {
                // Message d'erreur à afficher sur la page de profil
                const profileContent = document.getElementById('profile-content');
                if (profileContent) {
                    profileContent.innerHTML = `
                        <div class="error-message centered">
                            <p>Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
                        </div>
                    `;
                }
            }
        }
    }

    // API globale pour l'application
    window.zeroAnalyzeApp = {
        navigateTo,
        showResults: function(results) {
            // Afficher la page de résultats avec animation
            navigateTo('results');

            // Afficher l'animation de chargement
            const loadingAnimation = document.getElementById('loading-animation');
            const loadingElement = document.getElementById('loading');
            const predictionResults = document.getElementById('prediction-results');
            
            if (loadingElement) loadingElement.classList.remove('hidden');
            if (predictionResults) predictionResults.classList.add('hidden');
            
            // Simuler le traitement
            setTimeout(function() {
                // Cacher l'animation et afficher les résultats
                if (loadingElement) loadingElement.classList.add('hidden');
                if (predictionResults) predictionResults.classList.remove('hidden');
                
                // Remplir les résultats
                const score1Element = document.getElementById('score-1');
                const score2Element = document.getElementById('score-2');
                const matchResultElement = document.getElementById('match-result');
                const goalsPredictionElement = document.getElementById('goals-prediction');
                
                if (score1Element) score1Element.textContent = results.scoreExact1;
                if (score2Element) score2Element.textContent = results.scoreExact2;
                if (matchResultElement) matchResultElement.textContent = results.matchResult;
                if (goalsPredictionElement) goalsPredictionElement.textContent = results.goalsPrediction;
            }, 3000); // 3 secondes d'animation
        },
        
        // Messages d'erreur temporaires
        showError: function(message, element) {
            if (!element) return;
            
            // Créer le message d'erreur
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = message;
            
            // Ajouter la classe d'erreur à l'élément
            element.classList.add('input-error');
            
            // Ajouter le message après l'élément
            element.parentNode.appendChild(errorMessage);
            
            // Supprimer après un délai
            setTimeout(function() {
                element.classList.remove('input-error');
                if (errorMessage.parentNode) {
                    errorMessage.parentNode.removeChild(errorMessage);
                }
            }, 3000);
        },
        
        // Ouvrir une URL externe dans Telegram
        openExternalLink: function(url) {
            if (telegramApp && telegramApp.openLink) {
                telegramApp.openLink(url);
            } else {
                window.open(url, '_blank');
            }
        }
    };
    
    // Boutons de navigation du questionnaire
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (window.navigateToPreviousStep) {
                window.navigateToPreviousStep();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (window.navigateToNextStep) {
                window.navigateToNextStep();
            }
        });
    }
    
    // Initialiser l'application
    initApp();
    
    // Événements pour debug Telegram WebApp
    if (telegramApp) {
        telegramApp.onEvent('viewportChanged', function() {
            console.log('Viewport changed');
        });
        
        // Gestion du bouton retour principal de Telegram
        telegramApp.BackButton.onClick(function() {
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id !== 'home') {
                navigateTo('home');
            } else {
                telegramApp.close();
            }
        });
    }
});
