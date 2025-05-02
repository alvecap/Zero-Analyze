// app.js - Logique principale optimisée pour Telegram WebApp avec intégration Firebase

// Import Firebase (ajoutez ces imports en haut de votre fichier)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async function() {
    // Initialisation de Firebase - utilise les variables d'environnement de Render
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    let app, db, auth, currentUser;
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("Firebase initialisé avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase:", error);
    }

    // Initialisation de l'application Telegram WebApp
    let telegramApp;
    try {
        telegramApp = window.Telegram?.WebApp;
        if (telegramApp) {
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
            
            // Authentification de l'utilisateur Telegram
            if (telegramApp.initDataUnsafe?.user) {
                try {
                    // Authentifier l'utilisateur de manière anonyme
                    await signInAnonymously(auth);
                    
                    // Vérifier/créer l'utilisateur dans Firestore
                    currentUser = await checkOrCreateUser(db, telegramApp.initDataUnsafe.user);
                    console.log("Utilisateur authentifié:", currentUser);
                } catch (authError) {
                    console.error("Erreur d'authentification:", authError);
                }
            }
        }
    } catch (error) {
        console.error('Telegram WebApp non disponible:', error);
    }

    // Authentification et gestion des utilisateurs Firebase
    async function checkOrCreateUser(db, telegramUser) {
        if (!telegramUser || !telegramUser.id) {
            console.error("Données utilisateur Telegram manquantes");
            return null;
        }
        
        try {
            const telegramId = telegramUser.id.toString();
            
            // Chercher l'utilisateur par son ID Telegram
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('telegramId', '==', telegramId));
            const querySnapshot = await getDocs(q);
            
            // Si l'utilisateur existe, retourner ses données
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                
                // Mise à jour de la date de dernier accès
                await updateDoc(userDoc.ref, {
                    lastAccessedAt: serverTimestamp()
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
                createdAt: serverTimestamp(),
                dailyLimit: 6,  // Limite modifiée à 6 comme demandé
                usageCount: 0,
                lastResetDate: serverTimestamp(),
                isAdmin: isAdmin,
                isPremium: false,
                premiumExpiry: null,
                lastAccessedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(usersRef, newUser);
            return {
                id: docRef.id,
                ...newUser
            };
        } catch (error) {
            console.error("Erreur lors de la vérification/création de l'utilisateur:", error);
            return null;
        }
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
        console.log("Navigation vers:", pageId); // Debugging
        
        // Masquer toutes les pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Mettre à jour les boutons de navigation
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.id === `nav-${pageId}`) {
                    btn.classList.add('active');
                }
            });
            
            // Gérer le bouton retour de Telegram
            if (telegramApp && telegramApp.BackButton) {
                if (pageId === 'home') {
                    telegramApp.BackButton.hide();
                } else {
                    telegramApp.BackButton.show();
                }
            }

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
                loadUserProfile();
            } else if (pageId === 'services') {
                // Charger les services
                if (window.loadServices) {
                    window.loadServices();
                }
            }

            // Faire défiler vers le haut
            window.scrollTo(0, 0);
        } else {
            console.error("Page non trouvée:", pageId);
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
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Bouton démarrer cliqué"); // Debugging
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
            console.log("Bouton accueil cliqué"); // Debugging
            navigateTo('home');
        });
    }

    // Bouton nouvelle prédiction
    if (newPredictionButton) {
        newPredictionButton.addEventListener('click', function() {
            console.log("Bouton nouvelle prédiction cliqué"); // Debugging
            if (window.resetQuestionnaire) {
                window.resetQuestionnaire();
            }
            navigateTo('questionnaire');
        });
    }

    // Vérification des limites d'utilisation et affichage
    async function checkUserLimits() {
        if (!db || !currentUser || !currentUser.telegramId) return;
        
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('telegramId', '==', currentUser.telegramId));
            const querySnapshot = await getDocs(q);
            
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

    // Afficher les informations de limite
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

    // Fonction pour charger le profil utilisateur
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
            // Message d'erreur à afficher sur la page de profil
            profileContent.innerHTML = `
                <div class="error-message centered">
                    <p>Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
                </div>
            `;
        }
    }

    // Initialisation de l'application
    function initApp() {
        // Vérifier les limites d'utilisation
        checkUserLimits();
        
        // Préchargement des services
        if (window.loadServices) {
            window.loadServices();
        }
        
        // Associer les fonctions au contexte global
        window.zeroAnalyzeApp = {
            navigateTo,
            
            showResults: function(results) {
                // Afficher la page de résultats avec animation
                navigateTo('results');

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
    }
    
    // Incrémenter le compteur d'utilisation dans Firebase
    async function incrementUsageCount(userId, predictionDetails) {
        if (!db) return;
        
        try {
            // Récupérer la référence de l'utilisateur
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
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
            await updateDoc(userRef, {
                usageCount: (userData.usageCount || 0) + 1,
                lastPredictionAt: serverTimestamp(),
                totalPredictionsCount: (userData.totalPredictionsCount || 0) + 1
            });
            
            // Enregistrer les détails de la prédiction
            await addDoc(collection(db, 'predictions'), {
                userId: userId,
                telegramId: userData.telegramId,
                timestamp: serverTimestamp(),
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
        
        // Fermer le modal
        document.getElementById('close-limit-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    }
    
    // Boutons de navigation du questionnaire
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            console.log("Bouton précédent cliqué"); // Debugging
            if (window.navigateToPreviousStep) {
                window.navigateToPreviousStep();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log("Bouton suivant cliqué"); // Debugging
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
