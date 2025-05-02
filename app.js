// app.js - Logique principale optimisée pour Telegram WebApp avec Firebase

// Importation des modules
import telegramAuth from './telegram-auth.js';
import firebaseService from './firebase-service.js';
import predictionLimits from './prediction-limits.js';

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'application...');
    
    // Initialisation de l'application Telegram WebApp
    let telegramApp = null;
    try {
        if (window.Telegram && window.Telegram.WebApp) {
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
            console.log('Initialisation Telegram WebApp réussie');
        } else {
            console.warn('Telegram WebApp non disponible, utilisation en mode autonome');
        }
    } catch (error) {
        console.error('Telegram WebApp erreur:', error);
    }

    // Éléments du DOM
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-item');
    const startButton = document.getElementById('start-btn');
    const homeButton = document.getElementById('home-btn');
    const newPredictionButton = document.getElementById('new-prediction-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const limitBannerContainer = document.getElementById('limit-banner-container');

    // Configuration de la navigation principale
    function navigateTo(pageId, direction = 'forward') {
        console.log(`Navigation vers: ${pageId}`);
        
        // Masquer toutes les pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error(`Page non trouvée: ${pageId}`);
            return;
        }

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
            
            // Afficher la bannière de limite sur la page d'accueil si l'utilisateur est authentifié
            if (telegramAuth.isAuthenticated() && limitBannerContainer) {
                predictionLimits.displayLimitBanner(limitBannerContainer);
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
        } else if (pageId === 'questionnaire') {
            // Vérifier les limites de prédictions avant d'afficher le questionnaire
            checkPredictionLimitsBeforeQuestionnaire();
        }

        // Faire défiler vers le haut
        window.scrollTo(0, 0);
    }

    // Vérification des limites de prédictions avant d'ouvrir le questionnaire
    async function checkPredictionLimitsBeforeQuestionnaire() {
        console.log('Vérification des limites de prédictions...');
        
        if (!telegramAuth.isAuthenticated()) {
            console.warn('Utilisateur non authentifié');
            showAuthenticationError();
            return;
        }
        
        const userId = telegramAuth.getUserId();
        try {
            const limitStatus = await predictionLimits.canMakePrediction(userId);
            console.log('Statut des limites:', limitStatus);
            
            if (!limitStatus.allowed) {
                // Afficher un message d'erreur et rediriger vers la page d'accueil
                const questionsContainer = document.getElementById('questions-container');
                if (questionsContainer) {
                    questionsContainer.innerHTML = `
                        <div class="error-message centered">
                            <div class="error-icon">⏱️</div>
                            <h3>Limite atteinte</h3>
                            <p>${limitStatus.message}</p>
                            <button id="back-to-home-btn" class="btn">Retour à l'accueil</button>
                        </div>
                    `;
                    
                    // Configurer le bouton de retour
                    const backButton = document.getElementById('back-to-home-btn');
                    if (backButton) {
                        backButton.addEventListener('click', () => navigateTo('home'));
                    }
                    
                    // Masquer les boutons de navigation du questionnaire
                    if (prevButton) prevButton.style.display = 'none';
                    if (nextButton) nextButton.style.display = 'none';
                }
            } else {
                // Afficher le questionnaire normalement
                if (window.resetQuestionnaire) {
                    window.resetQuestionnaire();
                }
                
                // Afficher les boutons de navigation
                if (prevButton) prevButton.style.display = '';
                if (nextButton) nextButton.style.display = '';
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des limites:', error);
            
            // En cas d'erreur, permettre quand même d'accéder au questionnaire
            if (window.resetQuestionnaire) {
                window.resetQuestionnaire();
            }
        }
    }

    // Affichage d'une erreur d'authentification
    function showAuthenticationError() {
        const questionsContainer = document.getElementById('questions-container');
        if (questionsContainer) {
            telegramAuth.showAuthError(questionsContainer);
            
            // Masquer les boutons de navigation
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
        }
    }

    // Initialisation des événements de navigation
    function initNavigationButtons() {
        console.log('Initialisation des boutons de navigation...');
        
        // Boutons de navigation principale
        navButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log(`Clic sur bouton nav: ${this.id}`);
                const pageId = this.id.replace('nav-', '');
                navigateTo(pageId);
            });
        });

        // Bouton de démarrage
        if (startButton) {
            startButton.addEventListener('click', async function() {
                console.log('Clic sur bouton démarrer');
                // Vérifier d'abord l'authentification
                if (!telegramAuth.isAuthenticated()) {
                    // Tenter d'initialiser l'authentification
                    const authSuccess = await telegramAuth.initialize();
                    if (!authSuccess) {
                        showAuthenticationError();
                        return;
                    }
                }
                
                // Initialiser les limites de prédictions
                if (!predictionLimits.initialized) {
                    await predictionLimits.initialize(telegramAuth.getUserId());
                }
                
                // Commencer le questionnaire
                navigateTo('questionnaire');
            });
        } else {
            console.error('Bouton de démarrage non trouvé');
        }

        // Bouton retour à l'accueil depuis les résultats
        if (homeButton) {
            homeButton.addEventListener('click', function() {
                console.log('Clic sur bouton accueil');
                navigateTo('home');
            });
        } else {
            console.error('Bouton accueil non trouvé');
        }

        // Bouton nouvelle prédiction
        if (newPredictionButton) {
            newPredictionButton.addEventListener('click', async function() {
                console.log('Clic sur bouton nouvelle prédiction');
                // Vérifier les limites avant de démarrer un nouveau questionnaire
                await checkPredictionLimitsBeforeQuestionnaire();
            });
        } else {
            console.error('Bouton nouvelle prédiction non trouvé');
        }

        // Boutons de navigation du questionnaire
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                console.log('Clic sur bouton précédent');
                if (window.navigateToPreviousStep) {
                    window.navigateToPreviousStep();
                }
            });
        } else {
            console.error('Bouton précédent non trouvé');
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                console.log('Clic sur bouton suivant');
                if (window.navigateToNextStep) {
                    window.navigateToNextStep();
                }
            });
        } else {
            console.error('Bouton suivant non trouvé');
        }
    }

    // Initialisation de l'application
    async function initApp() {
        console.log('Initialisation de l\'application...');
        
        // Initialisation de l'authentification Telegram
        await initializeTelegramAuth();
        
        // Initialisation des événements
        initNavigationButtons();
        
        // Préchargement des services
        if (window.loadServices) {
            window.loadServices();
        }
        
        console.log('Initialisation terminée!');
    }

    // Initialisation de l'authentification Telegram
    async function initializeTelegramAuth() {
        console.log('Initialisation de l\'authentification Telegram...');
        
        try {
            const authSuccess = await telegramAuth.initialize();
            
            if (authSuccess) {
                console.log('Authentification réussie');
                // Utilisateur authentifié - initialiser les limites de prédiction
                await predictionLimits.initialize(telegramAuth.getUserId());
                
                // Mettre à jour l'interface utilisateur avec les données utilisateur
                if (window.setUserData) {
                    window.setUserData(telegramAuth.getUserData());
                }
                
                // Afficher la bannière de limite sur la page d'accueil
                if (limitBannerContainer) {
                    predictionLimits.displayLimitBanner(limitBannerContainer);
                }
            } else {
                console.warn('Échec d\'authentification');
                // Échec d'authentification - mettre à jour l'interface utilisateur
                const profileContent = document.getElementById('profile-content');
                if (profileContent) {
                    telegramAuth.showAuthError(profileContent, "Veuillez ouvrir cette WebApp depuis l'application Telegram.");
                }
            }
        } catch (error) {
            console.error("Erreur d'initialisation de l'authentification:", error);
        }
    }

    // API globale pour l'application
    window.zeroAnalyzeApp = {
        navigateTo,
        
        // Afficher les résultats avec sauvegarde dans Firebase
        showResults: async function(results) {
            console.log('Affichage des résultats:', results);
            
            // Vérifier l'authentification avant d'enregistrer
            if (!telegramAuth.isAuthenticated()) {
                navigateTo('results');
                const predictionResults = document.getElementById('prediction-results');
                if (predictionResults) {
                    telegramAuth.showAuthError(predictionResults);
                }
                return;
            }
            
            // Afficher la page de résultats avec animation
            navigateTo('results');

            // Afficher l'animation de chargement
            const loadingAnimation = document.getElementById('loading-animation');
            const loadingElement = document.getElementById('loading');
            const predictionResults = document.getElementById('prediction-results');
            
            if (loadingElement) loadingElement.classList.remove('hidden');
            if (predictionResults) predictionResults.classList.add('hidden');
            
            // Enregistrer la prédiction dans Firebase
            try {
                const userId = telegramAuth.getUserId();
                
                // Enrichir les résultats avec des métadonnées
                const predictionData = {
                    ...results,
                    timestamp: new Date().toISOString(),
                    type: 'soccer', // Type de prédiction
                    status: 'pending' // Statut initial (en attente de vérification)
                };
                
                // Enregistrer dans Firebase et vérifier les limites
                const saveResult = await predictionLimits.recordPrediction(userId, predictionData);
                console.log('Résultat de l\'enregistrement:', saveResult);
                
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
                    
                    // Afficher un message concernant les limites si nécessaire
                    const limitMessageElement = document.getElementById('limit-message');
                    if (limitMessageElement && saveResult) {
                        if (saveResult.success) {
                            limitMessageElement.textContent = saveResult.message;
                            limitMessageElement.classList.remove('hidden');
                        } else {
                            // Cas rare où l'enregistrement échoue après vérification
                            limitMessageElement.textContent = "Erreur d'enregistrement de la prédiction.";
                            limitMessageElement.classList.remove('hidden');
                        }
                    }
                }, 3000); // 3 secondes d'animation
            } catch (error) {
                console.error("Erreur lors de l'enregistrement de la prédiction:", error);
                
                // Afficher quand même les résultats en cas d'erreur
                setTimeout(function() {
                    if (loadingElement) loadingElement.classList.add('hidden');
                    if (predictionResults) predictionResults.classList.remove('hidden');
                    
                    const score1Element = document.getElementById('score-1');
                    const score2Element = document.getElementById('score-2');
                    const matchResultElement = document.getElementById('match-result');
                    const goalsPredictionElement = document.getElementById('goals-prediction');
                    
                    if (score1Element) score1Element.textContent = results.scoreExact1;
                    if (score2Element) score2Element.textContent = results.scoreExact2;
                    if (matchResultElement) matchResultElement.textContent = results.matchResult;
                    if (goalsPredictionElement) goalsPredictionElement.textContent = results.goalsPrediction;
                    
                    // Afficher un message d'erreur
                    const limitMessageElement = document.getElementById('limit-message');
                    if (limitMessageElement) {
                        limitMessageElement.textContent = "Erreur d'enregistrement de la prédiction. Votre quota n'a pas été affecté.";
                        limitMessageElement.classList.add('error');
                        limitMessageElement.classList.remove('hidden');
                    }
                }, 3000);
            }
        },
        
        // Messages d'erreur temporaires
        showError: function(message, element) {
            if (!element) return;
            
            console.log(`Affichage d'erreur: ${message}`);
            
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
            console.log(`Ouverture du lien: ${url}`);
            
            if (telegramApp && telegramApp.openLink) {
                telegramApp.openLink(url);
            } else {
                window.open(url, '_blank');
            }
        },
        
        // Vérifier les limites de prédictions
        checkPredictionLimits: async function() {
            if (!telegramAuth.isAuthenticated()) {
                return { allowed: false, message: "Authentification requise." };
            }
            
            return await predictionLimits.canMakePrediction(telegramAuth.getUserId());
        }
    };
    
    // Initialiser l'application
    initApp();
    
    // Événements pour debug Telegram WebApp
    if (telegramApp) {
        telegramApp.onEvent('viewportChanged', function() {
            console.log('Viewport changed');
        });
        
        // Gestion du bouton retour principal de Telegram
        telegramApp.BackButton.onClick(function() {
            console.log('Bouton retour Telegram activé');
            
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id !== 'home') {
                navigateTo('home');
            } else {
                telegramApp.close();
            }
        });
    }
});
