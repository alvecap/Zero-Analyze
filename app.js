// app.js - Logique principale pour Telegram WebApp avec intégration Firebase
// Version simplifiée pour résoudre les problèmes de boutons

// Attendre que le document soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Application initialisée");
    
    // PARTIE 1: INITIALISATION FIREBASE
    
    // Configuration de Firebase - utilise les variables d'environnement de Render
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    // Variables globales pour Firebase
    let firebaseApp, db, auth, currentUser;

    // Initialisation Firebase
    try {
        if (firebase) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();
            console.log("Firebase initialisé avec succès");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase:", error);
    }
    
    // PARTIE 2: TELEGRAM WEBAPP
    
    // Variable pour Telegram WebApp
    let telegramApp;
    
    // Initialisation de Telegram WebApp
    try {
        telegramApp = window.Telegram?.WebApp;
        if (telegramApp) {
            // Informer Telegram que l'app est prête
            telegramApp.ready();
            
            // Expansion de l'app pour utiliser tout l'écran disponible
            telegramApp.expand();
            
            // Appliquer les couleurs du thème Telegram
            if (telegramApp.themeParams) {
                document.documentElement.style.setProperty('--tg-theme-bg-color', telegramApp.themeParams.bg_color || '#f8f9fa');
                document.documentElement.style.setProperty('--tg-theme-text-color', telegramApp.themeParams.text_color || '#333333');
                document.documentElement.style.setProperty('--tg-theme-button-color', telegramApp.themeParams.button_color || '#6366f1');
                document.documentElement.style.setProperty('--tg-theme-button-text-color', telegramApp.themeParams.button_text_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-hint-color', telegramApp.themeParams.hint_color || '#999999');
                document.documentElement.style.setProperty('--tg-theme-link-color', telegramApp.themeParams.link_color || '#2481cc');
            }
            
            // Si des données utilisateur sont disponibles, authentifier
            if (telegramApp.initDataUnsafe?.user) {
                authenticateUser(telegramApp.initDataUnsafe.user);
            }
        }
    } catch (error) {
        console.error('Telegram WebApp non disponible:', error);
    }
    
    // PARTIE 3: FONCTIONS DE BASE
    
    // Fonction de navigation entre les pages
    window.navigateTo = function(pageId) {
        console.log("Navigation vers:", pageId);
        
        // Masquer toutes les pages
        var pages = document.querySelectorAll('.page');
        for (var i = 0; i < pages.length; i++) {
            pages[i].classList.remove('active');
        }
        
        // Afficher la page demandée
        var targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Mettre à jour les boutons de navigation
            var navButtons = document.querySelectorAll('.nav-item');
            for (var j = 0; j < navButtons.length; j++) {
                navButtons[j].classList.remove('active');
                if (navButtons[j].id === 'nav-' + pageId) {
                    navButtons[j].classList.add('active');
                }
            }
            
            // Gérer le bouton retour de Telegram
            if (telegramApp && telegramApp.BackButton) {
                if (pageId === 'home') {
                    telegramApp.BackButton.hide();
                } else {
                    telegramApp.BackButton.show();
                }
            }
            
            // Actions spécifiques selon la page
            if (pageId === 'home') {
                if (window.initLogoAnimationEffect) {
                    window.initLogoAnimationEffect(document.getElementById('logo-animation'));
                }
            } else if (pageId === 'profile') {
                loadUserProfile();
            } else if (pageId === 'services') {
                loadServices();
            }
            
            // Faire défiler vers le haut
            window.scrollTo(0, 0);
        }
    };
    
    // Démarrer le questionnaire
    window.startQuestionnaire = function() {
        console.log("Démarrage du questionnaire");
        if (window.resetQuestionnaire) {
            window.resetQuestionnaire();
        }
        window.navigateTo('questionnaire');
    };
    
    // Authentification de l'utilisateur via Telegram
    async function authenticateUser(telegramUser) {
        if (!telegramUser || !telegramUser.id || !auth || !db) {
            console.error("Données nécessaires à l'authentification manquantes");
            return null;
        }
        
        try {
            // Authentifier l'utilisateur de manière anonyme
            await auth.signInAnonymously();
            
            // Vérifier/créer l'utilisateur dans Firestore
            currentUser = await checkOrCreateUser(telegramUser);
            console.log("Utilisateur authentifié:", currentUser);
            
            // Vérifier les limites d'utilisation
            checkUserLimits();
            
            return currentUser;
        } catch (error) {
            console.error("Erreur d'authentification:", error);
            return null;
        }
    }
    
    // Vérification ou création de l'utilisateur dans Firestore
    async function checkOrCreateUser(telegramUser) {
        if (!telegramUser || !telegramUser.id || !db) {
            console.error("Données utilisateur ou Firestore manquantes");
            return null;
        }
        
        try {
            const telegramId = telegramUser.id.toString();
            
            // Chercher l'utilisateur par son ID Telegram
            const usersRef = db.collection('users');
            const query = usersRef.where('telegramId', '==', telegramId);
            const querySnapshot = await query.get();
            
            // Si l'utilisateur existe, retourner ses données
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                
                // Mise à jour de la date de dernier accès
                await userDoc.ref.update({
                    lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                return {
                    id: userDoc.id,
                    ...userData
                };
            }
            
            // Si l'utilisateur n'existe pas, le créer
            const isAdmin = telegramId === process.env.ADMIN_TELEGRAM_ID;
            const newUser = {
                telegramId: telegramId,
                username: telegramUser.username || '',
                firstName: telegramUser.first_name || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                dailyLimit: 6,  // Limite modifiée à 6 comme demandé
                usageCount: 0,
                lastResetDate: firebase.firestore.FieldValue.serverTimestamp(),
                isAdmin: isAdmin,
                isPremium: false,
                premiumExpiry: null,
                lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await usersRef.add(newUser);
            return {
                id: docRef.id,
                ...newUser
            };
        } catch (error) {
            console.error("Erreur lors de la vérification/création de l'utilisateur:", error);
            return null;
        }
    }
    
    // Vérification des limites d'utilisation
    async function checkUserLimits() {
        if (!db || !currentUser || !currentUser.telegramId) return;
        
        try {
            const usersRef = db.collection('users');
            const query = usersRef.where('telegramId', '==', currentUser.telegramId);
            const querySnapshot = await query.get();
            
            if (querySnapshot.empty) return;
            
            const userData = querySnapshot.docs[0].data();
            const limitInfo = {
                dailyLimit: userData.dailyLimit || 6,
                usageCount: userData.usageCount || 0,
                remaining: (userData.dailyLimit || 6) - (userData.usageCount || 0),
                isPremium: userData.isPremium || false,
                premiumExpiry: userData.premiumExpiry?.toDate()
            };
            
            // Afficher les infos de limite
            displayLimitInfo(limitInfo);
        } catch (error) {
            console.error("Erreur lors de la vérification des limites:", error);
        }
    }
    
    // Affichage des informations de limite
    function displayLimitInfo(limitInfo) {
        // Créer ou mettre à jour l'élément d'information
        let infoElement = document.getElementById('limit-info');
        if (!infoElement) {
            infoElement = document.createElement('div');
            infoElement.id = 'limit-info';
            infoElement.className = 'limit-info';
            
            const homeContent = document.querySelector('#home .tagline');
            if (homeContent) {
                homeContent.parentNode.insertBefore(infoElement, homeContent.nextSibling);
            }
        }
        
        // Mettre à jour le contenu
        if (limitInfo.isPremium) {
            infoElement.innerHTML = `<span class="premium-badge">Premium</span> Prédictions illimitées`;
        } else {
            infoElement.innerHTML = `<span class="limit-badge">${limitInfo.remaining}/${limitInfo.dailyLimit}</span> prédictions restantes`;
        }
    }
    
    // Chargement du profil utilisateur
    function loadUserProfile() {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) return;
        
        if (currentUser) {
            // Utilisateur authentifié
            profileContent.innerHTML = `
                <div class="profile-info">
                    <div class="profile-picture">
                        ${currentUser.firstName ? currentUser.firstName.charAt(0) : '?'}${currentUser.lastName ? currentUser.lastName.charAt(0) : ''}
                    </div>
                    <div>
                        <h3 class="profile-name">${currentUser.firstName || ''} ${currentUser.lastName || ''}</h3>
                        <p>@${currentUser.username || 'inconnu'}</p>
                    </div>
                </div>
                <div class="profile-details">
                    <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
                    <p>Vos prédictions sont générées automatiquement grâce à nos algorithmes avancés.</p>
                    ${currentUser.isPremium ? '<div class="premium-status">Statut: <span class="premium-badge">Premium</span></div>' : ''}
                </div>
            `;
        } else if (telegramApp && telegramApp.initDataUnsafe?.user) {
            // Utilisateur Telegram mais pas encore dans Firebase
            const user = telegramApp.initDataUnsafe.user;
            profileContent.innerHTML = `
                <div class="profile-info">
                    <div class="profile-picture">
                        ${user.first_name ? user.first_name.charAt(0) : '?'}${user.last_name ? user.last_name.charAt(0) : ''}
                    </div>
                    <div>
                        <h3 class="profile-name">${user.first_name || ''} ${user.last_name || ''}</h3>
                        <p>@${user.username || 'inconnu'}</p>
                    </div>
                </div>
                <div class="profile-details">
                    <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
                    <p>Vos prédictions sont générées automatiquement grâce à nos algorithmes avancés.</p>
                </div>
            `;
        } else {
            // Message d'erreur
            profileContent.innerHTML = `
                <div class="error-message centered">
                    <p>Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
                </div>
            `;
        }
    }
    
    // Chargement des services
    function loadServices() {
        const servicesListContainer = document.getElementById('services-list');
        if (!servicesListContainer) return;
        
        // Les services sont déjà chargés dans le HTML
        console.log("Services chargés");
    }
    
    // PARTIE 4: INTÉGRATION AVEC LES RÉSULTATS
    
    // Afficher les résultats de prédiction
    window.showResults = function(results) {
        // Afficher la page de résultats avec animation
        window.navigateTo('results');

        // Afficher l'animation de chargement
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
            
            // Enregistrer l'utilisation si l'utilisateur est connecté
            if (db && currentUser && currentUser.id) {
                incrementUsageCount(currentUser.id, results);
            }
        }, 3000); // 3 secondes d'animation
    };
    
    // Incrémenter le compteur d'utilisation dans Firebase
    async function incrementUsageCount(userId, predictionDetails) {
        if (!db) return;
        
        try {
            // Récupérer la référence de l'utilisateur
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.error("Utilisateur non trouvé");
                return;
            }
            
            const userData = userDoc.data();
            
            // Vérifier si la limite est atteinte pour les non-premium
            if (!userData.isPremium && userData.usageCount >= userData.dailyLimit) {
                showLimitReachedMessage();
                return;
            }
            
            // Mettre à jour le compteur
            await userRef.update({
                usageCount: (userData.usageCount || 0) + 1,
                lastPredictionAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalPredictionsCount: (userData.totalPredictionsCount || 0) + 1
            });
            
            // Enregistrer les détails de la prédiction
            await db.collection('predictions').add({
                userId: userId,
                telegramId: userData.telegramId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                details: predictionDetails
            });
            
            // Mettre à jour l'affichage des limites
            checkUserLimits();
        } catch (error) {
            console.error("Erreur lors de l'incrémentation du compteur:", error);
        }
    }
    
    // Afficher un message lorsque la limite est atteinte
    function showLimitReachedMessage() {
        // Créer le modal de limite atteinte
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h3>Limite atteinte</h3>
                <p>Vous avez atteint votre limite quotidienne de prédictions gratuites.</p>
                <p>Revenez demain ou passez à la version premium pour des prédictions illimitées.</p>
                <button id="close-limit-modal" class="primary-btn">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer le modal avec un événement onclick
        const closeButton = document.getElementById('close-limit-modal');
        if (closeButton) {
            closeButton.onclick = function() {
                document.body.removeChild(modal);
            };
        }
    }
    
    // PARTIE 5: FONCTIONS POUR LES SERVICES
    
    // Afficher les détails d'un service
    window.showServiceDetails = function(serviceId) {
        console.log("Affichage des détails du service:", serviceId);
        
        // Informations des services
        const servicesList = [
            {
                id: 'telegram-bots',
                title: 'Création de bots Telegram IA',
                description: 'Développement de bots avec prédictions automatisées et interactions intelligentes.'
            },
            {
                id: 'webapps',
                title: 'Développement de WebApps IA',
                description: 'Applications web comme Zero Analyze, avec intelligence artificielle intégrée.'
            },
            {
                id: 'youtube',
                title: 'Création de chaînes YouTube',
                description: 'Stratégie de contenu, branding, scripts, montage et monétisation.'
            }
        ];
        
        // Trouver le service demandé
        const service = servicesList.find(s => s.id === serviceId);
        if (service) {
            alert(`Service: ${service.title}\n\nDescription: ${service.description}`);
        } else {
            alert("Service non trouvé");
        }
    };
    
    // Afficher le formulaire de contact pour un service
    window.showContactForm = function(serviceId) {
        console.log("Affichage du formulaire de contact pour:", serviceId);
        
        // Informations des services (même que ci-dessus)
        const servicesList = [
            {
                id: 'telegram-bots',
                title: 'Création de bots Telegram IA',
                description: 'Développement de bots avec prédictions automatisées et interactions intelligentes.'
            },
            {
                id: 'webapps',
                title: 'Développement de WebApps IA',
                description: 'Applications web comme Zero Analyze, avec intelligence artificielle intégrée.'
            },
            {
                id: 'youtube',
                title: 'Création de chaînes YouTube',
                description: 'Stratégie de contenu, branding, scripts, montage et monétisation.'
            }
        ];
        
        // Trouver le service demandé
        const service = servicesList.find(s => s.id === serviceId);
        if (service) {
            alert(`Contact pour le service: ${service.title}\n\nVeuillez nous contacter via Telegram pour plus d'informations.`);
            
            // Si l'utilisateur est authentifié, enregistrer l'intérêt
            if (currentUser && currentUser.id && db) {
                // Enregistrer l'intérêt dans Firebase
                db.collection('service_interests').add({
                    userId: currentUser.id,
                    serviceId: serviceId,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'intérêt:", error);
                });
            }
        } else {
            alert("Service non trouvé");
        }
    };
    
    // PARTIE 6: AFFICHAGE DES ERREURS
    
    // Affichage de messages d'erreur temporaires
    window.showError = function(message, element) {
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
    };
    
    // PARTIE 7: GESTION DE TELEGRAM WEBAPP EVENTS
    
    // Événements pour debug Telegram WebApp
    if (telegramApp) {
        // Changement de viewport
        telegramApp.onEvent('viewportChanged', function() {
            console.log('Viewport changed');
        });
        
        // Gestion du bouton retour principal de Telegram
        if (telegramApp.BackButton) {
            telegramApp.BackButton.onClick(function() {
                const activePage = document.querySelector('.page.active');
                if (activePage && activePage.id !== 'home') {
                    window.navigateTo('home');
                } else {
                    telegramApp.close();
                }
            });
        }
        
        // Gestion des liens externes
        window.openExternalLink = function(url) {
            if (telegramApp && telegramApp.openLink) {
                telegramApp.openLink(url);
            } else {
                window.open(url, '_blank');
            }
        };
    }
    
    // PARTIE 8: INITIALISATION COMPLÈTE
    
    // Initialiser l'application
    function initApp() {
        console.log("Initialisation complète de l'application");
        
        // Activer l'animation du logo sur la page d'accueil
        const logoContainer = document.getElementById('logo-animation');
        if (logoContainer && window.initLogoAnimationEffect) {
            window.initLogoAnimationEffect(logoContainer);
        }
        
        // Vérifier les limites d'utilisation si l'utilisateur est connecté
        if (currentUser) {
            checkUserLimits();
        }
    }
    
    // Démarrer l'application
    initApp();
});
