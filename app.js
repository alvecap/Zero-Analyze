// app.js - Logique principale de l'application

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'application Telegram
    let telegramApp;
    try {
        telegramApp = window.Telegram.WebApp;
        telegramApp.expand(); // Expansion de l'app pour utiliser tout l'écran disponible
    } catch (error) {
        console.error('Telegram WebApp non disponible:', error);
    }

    // Gestion de la navigation
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    const startButton = document.getElementById('start-btn');
    const homeButton = document.getElementById('home-btn');
    const newPredictionButton = document.getElementById('new-prediction-btn');

    // Configuration de la navigation principale
    function navigateTo(pageId, direction = 'forward') {
        // Masquer toutes les pages
        pages.forEach(page => {
            if (page.classList.contains('active')) {
                page.classList.remove('active');
                page.classList.add(direction === 'forward' ? 'page-exit' : 'page-exit-back');
                
                setTimeout(() => {
                    page.classList.remove('page-exit', 'page-exit-back');
                }, 500);
            }
        });

        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        targetPage.classList.add('active');
        targetPage.classList.add(direction === 'forward' ? 'page-enter' : 'page-enter-back');
        
        setTimeout(() => {
            targetPage.classList.remove('page-enter', 'page-enter-back');
        }, 500);

        // Mettre à jour les boutons de navigation
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `nav-${pageId}`) {
                btn.classList.add('active');
            }
        });

        // Événements spécifiques à certaines pages
        if (pageId === 'home') {
            initLogoAnimation();
        } else if (pageId === 'profile') {
            loadUserProfile();
        } else if (pageId === 'services') {
            loadServices();
        }
    }

    // Initialisation des événements de navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.id.replace('nav-', '');
            navigateTo(pageId);
        });
    });

    // Bouton de démarrage
    startButton.addEventListener('click', function() {
        // Commencer le questionnaire
        resetQuestionnaire();
        navigateTo('questionnaire');
    });

    // Bouton retour à l'accueil depuis les résultats
    homeButton.addEventListener('click', function() {
        navigateTo('home');
    });

    // Bouton nouvelle prédiction
    newPredictionButton.addEventListener('click', function() {
        resetQuestionnaire();
        navigateTo('questionnaire');
    });
    
    // Initialisation de l'application
    function initApp() {
        // Vérification de l'authentification Telegram
        checkTelegramAuth();
        
        // Initialisation de l'animation du logo
        initLogoAnimation();
        
        // Préchargement des services
        loadServices();
    }

    // Vérification de l'authentification Telegram
    function checkTelegramAuth() {
        if (telegramApp) {
            const user = telegramApp.initDataUnsafe?.user;
            if (user) {
                // Utilisateur authentifié
                setUserData(user);
            } else {
                // Message d'erreur à afficher sur la page de profil
                const profileContent = document.getElementById('profile-content');
                profileContent.innerHTML = `
                    <div class="error-message centered">
                        <p>Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
                    </div>
                `;
            }
        }
    }

    // Initialisation de l'animation du logo
    function initLogoAnimation() {
        const logoContainer = document.getElementById('logo-animation');
        if (logoContainer) {
            // L'animation du logo sera gérée par animation.js
            initLogoAnimationEffect(logoContainer);
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
            const predictionResults = document.getElementById('prediction-results');
            
            loadingAnimation.classList.remove('hidden');
            predictionResults.classList.add('hidden');
            
            // Simuler le traitement
            setTimeout(function() {
                // Cacher l'animation et afficher les résultats
                loadingAnimation.classList.add('hidden');
                predictionResults.classList.remove('hidden');
                
                // Remplir les résultats
                document.getElementById('score-1').textContent = results.scoreExact1;
                document.getElementById('score-2').textContent = results.scoreExact2;
                document.getElementById('match-result').textContent = results.matchResult;
                document.getElementById('goals-prediction').textContent = results.goalsPrediction;
            }, 3000); // 3 secondes d'animation
        },
        
        // Messages d'erreur temporaires
        showError: function(message, element) {
            // Créer le message d'erreur
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = message;
            
            // Ajouter la classe d'erreur à l'élément
            element.classList.add('input-error');
            element.classList.add('shake');
            
            // Ajouter le message après l'élément
            element.parentNode.appendChild(errorMessage);
            
            // Supprimer après un délai
            setTimeout(function() {
                element.classList.remove('input-error');
                element.classList.remove('shake');
                if (errorMessage.parentNode) {
                    errorMessage.parentNode.removeChild(errorMessage);
                }
            }, 3000);
        }
    };
    
    // Initialiser l'application
    initApp();
});
