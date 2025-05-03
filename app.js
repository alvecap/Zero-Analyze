// app.js - Logique principale pour Telegram WebApp avec intégration Firebase
// Version améliorée avec corrections des problèmes de chargement et de boutons

// Attendre que le document soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Application ZERO ANALYZE initialisée");
    
    // ======================================================
    // PARTIE 1: INITIALISATION DES OBJETS PRINCIPAUX
    // ======================================================
    
    // Variables globales
    let telegramApp; // Pour l'API Telegram WebApp
    let firebaseApp, db, auth, currentUser; // Pour Firebase
    
    // ======================================================
    // PARTIE 2: INITIALISATION DE FIREBASE
    // ======================================================
    
    // Configuration de Firebase - utilise les variables d'environnement de Render
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    // Initialisation de Firebase
    try {
        if (firebase) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();
            console.log("Firebase initialisé avec succès");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase:", error);
        showToast("Information", "Mode hors ligne actif", "ℹ️");
    }
    
    // ======================================================
    // PARTIE 3: INITIALISATION DE TELEGRAM WEBAPP
    // ======================================================
    
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
            
            console.log("Telegram WebApp initialisé avec succès");
        }
    } catch (error) {
        console.error('Telegram WebApp non disponible:', error);
        showToast("Information", "Mode autonome actif", "ℹ️");
    }
    
    // ======================================================
    // PARTIE 4: FONCTIONS DE NAVIGATION ET D'INTERFACE
    // ======================================================
    
    // Fonction de navigation entre les pages - CORRIGÉE ET AMÉLIORÉE
    window.navigateTo = function(pageId) {
        console.log("Navigation vers:", pageId);
        
        // Masquer toutes les pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Mettre à jour les boutons de navigation
            const navButtons = document.querySelectorAll('.nav-item');
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.id === 'nav-' + pageId) {
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
            
            // Actions spécifiques selon la page
            if (pageId === 'home') {
                if (window.initLogoAnimationEffect) {
                    const logoContainer = document.getElementById('logo-animation');
                    if (logoContainer) {
                        window.initLogoAnimationEffect(logoContainer);
                    }
                }
            } else if (pageId === 'profile') {
                // Chargement immédiat du profil sans animation de chargement
                if (window.loadUserProfile) {
                    window.loadUserProfile();
                }
            } else if (pageId === 'services') {
                if (window.loadServices) {
                    window.loadServices();
                }
            } else if (pageId === 'questionnaire') {
                // S'assurer que le questionnaire est initialisé
                if (window.resetQuestionnaire) {
                    window.resetQuestionnaire();
                }
            }
            
            // Faire défiler vers le haut
            window.scrollTo(0, 0);
        } else {
            console.error("Page non trouvée:", pageId);
            showToast("Erreur", "Page introuvable", "❌");
        }
    };
    
    // Fonction pour afficher les messages Toast - AMÉLIORÉE
    window.showToast = function(title, message, icon) {
        // Supprimer le toast existant s'il y en a un
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Créer un nouveau toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">${icon || 'ℹ️'}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentNode.remove()">×</div>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(toast);
        
        // Supprimer automatiquement après 4 secondes
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.classList.add('toast-hide');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    };
    
    // FONCTION CORRIGÉE POUR LE BOUTON "COMMENCER"
    window.startQuestionnaire = function() {
        console.log("Démarrage du questionnaire");
        
        // Référence au bouton
        const startButton = document.getElementById('start-btn');
        if (startButton) {
            // Ajouter une classe d'animation et désactiver le bouton
            startButton.classList.add('btn-loading');
            startButton.disabled = true;
            
            // Exécuter la navigation après un court délai
            setTimeout(() => {
                startButton.classList.remove('btn-loading');
                startButton.disabled = false;
                
                // Réinitialiser le questionnaire
                if (typeof window.resetQuestionnaire === 'function') {
                    window.resetQuestionnaire();
                }
                
                // Naviguer vers la page du questionnaire
                window.navigateTo('questionnaire');
            }, 300);
        } else {
            // Fallback si le bouton n'est pas trouvé
            if (typeof window.resetQuestionnaire === 'function') {
                window.resetQuestionnaire();
            }
            window.navigateTo('questionnaire');
        }
    };
    
    // ======================================================
    // PARTIE 5: AUTHENTIFICATION ET GESTION DES UTILISATEURS
    // ======================================================
    
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
            
            // Exposer l'utilisateur à la portée globale
            window.currentUser = currentUser;
            
            // Vérifier les limites d'utilisation
            checkUserLimits();
            
            // Afficher un toast de bienvenue
            showToast("Bienvenue", `Heureux de vous revoir, ${currentUser.firstName || 'utilisateur'} !`, "👋");
            
            return currentUser;
        } catch (error) {
            console.error("Erreur d'authentification:", error);
            showToast("Information", "Mode invité actif", "ℹ️");
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
                lastName: telegramUser.last_name || '',
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
            
            // Afficher un toast de bienvenue pour les nouveaux utilisateurs
            showToast("Bienvenue", "Bienvenue sur ZERO ANALYZE !", "🎉");
            
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
            
            // Alerter si peu de prédictions restantes
            if (limitInfo.remaining === 1 && !limitInfo.isPremium) {
                showToast("Attention", "Il ne vous reste plus qu'une prédiction aujourd'hui", "⚠️");
            } else if (limitInfo.remaining === 0 && !limitInfo.isPremium) {
                showToast("Limite atteinte", "Vous avez atteint votre limite quotidienne", "🛑");
            }
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
    
    // ======================================================
    // PARTIE 6: GESTION DES PROFILS ET SERVICES
    // ======================================================
    
    // Chargement du profil utilisateur - AMÉLIORÉ ET CORRIGÉ
    window.loadUserProfile = function() {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) return;
        
        // Vérifier si l'utilisateur est authentifié
        if (currentUser) {
            // Afficher directement le profil sans animation de chargement
            displayUserProfile(currentUser);
            
            // Charger les statistiques
            loadUserStats(currentUser.id);
        } else if (telegramApp && telegramApp.initDataUnsafe?.user) {
            // Utilisateur Telegram mais pas encore dans Firebase
            const user = telegramApp.initDataUnsafe.user;
            
            // Afficher les informations de base immédiatement
            displayBasicUserInfo(user);
            
            // Tenter d'authentifier l'utilisateur en arrière-plan
            authenticateUser(user).then((userData) => {
                if (userData) {
                    // Mettre à jour le profil avec les données complètes
                    displayUserProfile(userData);
                    loadUserStats(userData.id);
                }
            });
        } else {
            // Afficher un profil par défaut
            displayBasicUserInfo({ 
                first_name: "Utilisateur", 
                last_name: "", 
                username: "inconnu" 
            });
        }
    };
    
    // Affichage d'un profil de base sans attente
    function displayBasicUserInfo(user) {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) return;
        
        profileContent.innerHTML = `
            <div class="profile-info">
                <div class="profile-picture">
                    ${user.first_name ? user.first_name.charAt(0) : '?'}${user.last_name ? user.last_name.charAt(0) : ''}
                </div>
                <div>
                    <h3 class="profile-name">${user.first_name || ''} ${user.last_name || ''}</h3>
                    <p>@${user.username || 'inconnu'}</p>
                    <div style="margin-top: 10px;">
                        <span class="limit-badge">6/6</span> prédictions restantes
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter des statistiques de base
        const statsContainer = document.getElementById('prediction-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-card">
                    <h4>Vos prédictions</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">6</div>
                            <div class="stat-label">Restantes aujourd'hui</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Prédictions totales</div>
                        </div>
                    </div>
                </div>
                <div class="history-card">
                    <h4>Historique récent</h4>
                    <p class="centered">Aucune prédiction effectuée pour le moment.</p>
                </div>
            `;
        }
    }
    
    // Affichage du profil utilisateur complet
    function displayUserProfile(userData) {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) return;
        
        // Calculer le nombre de prédictions restantes
        const remaining = (userData.dailyLimit || 6) - (userData.usageCount || 0);
        
        profileContent.innerHTML = `
            <div class="profile-info">
                <div class="profile-picture">
                    ${userData.firstName ? userData.firstName.charAt(0) : '?'}${userData.lastName ? userData.lastName.charAt(0) : ''}
                </div>
                <div>
                    <h3 class="profile-name">${userData.firstName || ''} ${userData.lastName || ''}</h3>
                    <p>@${userData.username || 'inconnu'}</p>
                    <div style="margin-top: 10px;">
                        ${userData.isPremium 
                            ? '<span class="premium-badge">Premium</span>' 
                            : `<span class="limit-badge">${remaining}/${userData.dailyLimit}</span> prédictions restantes`}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Chargement des statistiques de l'utilisateur - AMÉLIORÉ
    async function loadUserStats(userId) {
        if (!db || !userId) return;
        
        const statsContainer = document.getElementById('prediction-stats');
        if (!statsContainer) return;
        
        try {
            // Récupérer l'utilisateur
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new Error("Utilisateur non trouvé");
            }
            
            const userData = userDoc.data();
            
            // Calculer les informations de limite
            const limitInfo = {
                dailyLimit: userData.dailyLimit || 6,
                usageCount: userData.usageCount || 0,
                remaining: (userData.dailyLimit || 6) - (userData.usageCount || 0),
                isPremium: userData.isPremium || false,
                totalPredictions: userData.totalPredictionsCount || 0
            };
            
            // Récupérer l'historique des prédictions
            const predictionsQuery = db.collection('predictions')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(5);
            
            const predictionsSnapshot = await predictionsQuery.get();
            const predictions = [];
            
            predictionsSnapshot.forEach(doc => {
                predictions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Créer le HTML des statistiques
            let statsHTML = `
                <div class="stats-card">
                    <h4>Vos prédictions</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${limitInfo.remaining}</div>
                            <div class="stat-label">Restantes aujourd'hui</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${limitInfo.totalPredictions}</div>
                            <div class="stat-label">Prédictions totales</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter l'historique s'il y a des prédictions
            if (predictions.length > 0) {
                statsHTML += `
                    <div class="history-card">
                        <h4>Historique récent</h4>
                        <ul class="prediction-history">
                `;
                
                predictions.forEach(prediction => {
                    if (prediction.timestamp && prediction.details) {
                        const date = new Date(prediction.timestamp.seconds * 1000);
                        const formattedDate = formatDate(date);
                        
                        statsHTML += `
                            <li class="history-item">
                                <div class="history-date">${formattedDate}</div>
                                <div class="history-details">
                                    <div class="history-score">${prediction.details.scoreExact1 || '0-0'} / ${prediction.details.scoreExact2 || '0-0'}</div>
                                    <div class="history-result">${prediction.details.matchResult || 'Match nul'}</div>
                                </div>
                            </li>
                        `;
                    }
                });
                
                statsHTML += `
                        </ul>
                    </div>
                `;
            } else {
                statsHTML += `
                    <div class="history-card">
                        <h4>Historique récent</h4>
                        <p class="centered">Aucune prédiction effectuée pour le moment.</p>
                    </div>
                `;
            }
            
            // Mettre à jour le conteneur
            statsContainer.innerHTML = statsHTML;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            statsContainer.innerHTML = `
                <div class="stats-card">
                    <h4>Vos prédictions</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">6</div>
                            <div class="stat-label">Restantes aujourd'hui</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Prédictions totales</div>
                        </div>
                    </div>
                </div>
                <div class="history-card">
                    <h4>Historique récent</h4>
                    <p class="centered">Aucune prédiction effectuée pour le moment.</p>
                </div>
            `;
        }
    }
    
    // Fonction pour formater les dates
    function formatDate(date) {
        if (!date) return '';
        
        if (typeof date.toDate === 'function') {
            date = date.toDate();
        }
        
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Chargement des services
    window.loadServices = function() {
        // Les services sont déjà définis dans le HTML, rien à faire ici
        console.log("Page des services chargée");
    };
    
    // ======================================================
    // PARTIE 7: GESTION DES RÉSULTATS ET PRÉDICTIONS
    // ======================================================
    
    // Afficher les résultats de prédiction
    window.showResults = function(results) {
        // Afficher la page de résultats avec animation
        window.navigateTo('results');

        // Afficher l'animation de chargement pendant un court instant
        const loadingElement = document.getElementById('loading');
        const predictionResults = document.getElementById('prediction-results');
        
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (predictionResults) predictionResults.classList.add('hidden');
        
        // Simuler le traitement avec un délai réduit
        setTimeout(() => {
            // Cacher l'animation et afficher les résultats
            if (loadingElement) loadingElement.classList.add('hidden');
            if (predictionResults) {
                predictionResults.style.opacity = 0;
                predictionResults.classList.remove('hidden');
                
                // Animation de fade-in
                setTimeout(() => {
                    predictionResults.style.transition = 'opacity 0.5s ease';
                    predictionResults.style.opacity = 1;
                }, 50);
            }
            
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
            
            // Afficher un toast
            showToast("Prédiction générée", "Votre prédiction est prête !", "🎯");
        }, 600); // Délai réduit pour améliorer l'expérience utilisateur
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
            showToast("Erreur", "Problème lors de l'enregistrement de la prédiction", "❌");
        }
    }
    
    // Afficher un message lorsque la limite est atteinte
    function showLimitReachedMessage() {
        // Créer le modal de limite atteinte avec design amélioré
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h3>Limite atteinte</h3>
                <p>Vous avez atteint votre limite quotidienne de prédictions gratuites.</p>
                <p>Revenez demain ou passez à la version premium pour des prédictions illimitées.</p>
                <button id="close-limit-modal" class="btn">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer le modal avec un événement onclick
        const closeButton = document.getElementById('close-limit-modal');
        if (closeButton) {
            closeButton.onclick = function() {
                modal.style.opacity = 0;
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            };
        }
        
        // Afficher un toast
        showToast("Limite atteinte", "Revenir demain ou passer en premium", "🔒");
    }
    
    // ======================================================
    // PARTIE 8: GESTION DES SERVICES
    // ======================================================
    
    // Liste des services avec descriptions détaillées
    const services = [
        {
            id: 'telegram-bots',
            title: 'Création de bots Telegram IA',
            shortDescription: 'Bot avec prédictions automatisées',
            fullDescription: `Nous développons des bots Telegram intelligents avec une intégration complète de l'IA. 
                            Nos bots peuvent offrir des prédictions sportives, des analyses de données, et une interaction 
                            naturelle avec vos utilisateurs. Ils sont parfaitement adaptés pour les plateformes de paris, 
                            les médias sportifs ou les communautés de fans.`,
            features: [
                "Prédictions automatisées similaires à ZERO ANALYZE",
                "Intégration avec les API de cotes en temps réel",
                "Notifications personnalisées",
                "Système de paiement intégré",
                "Tableaux de bord d'analyse"
            ],
            price: "À partir de 999€"
        },
        {
            id: 'webapps',
            title: 'Développement de WebApps IA',
            shortDescription: 'WebApp comme Zero Analyze',
            fullDescription: `Nous créons des WebApps Telegram modernes et réactives, parfaitement intégrées à l'écosystème Telegram.
                            Ces applications offrent une expérience utilisateur fluide et engageante, avec des fonctionnalités 
                            avancées d'analyse de données et de prédiction, similaires à ZERO ANALYZE.`,
            features: [
                "Interface utilisateur personnalisée et moderne",
                "Intégration complète avec Telegram",
                "Algorithmes de prédiction avancés",
                "Tableau de bord administrateur",
                "Système de gestion des utilisateurs",
                "Analyses en temps réel"
            ],
            price: "À partir de 1499€"
        },
        {
            id: 'youtube',
            title: 'Création de chaînes YouTube',
            shortDescription: 'Branding, scripts, monétisation',
            fullDescription: `Nous vous accompagnons dans la création et le développement de votre chaîne YouTube, 
                            de la conception de l'identité visuelle à la stratégie de contenu et de monétisation. 
                            Notre approche combine créativité et analyse de données pour maximiser votre audience 
                            et votre engagement.`,
            features: [
                "Création d'identité visuelle et branding",
                "Rédaction de scripts et scénarios",
                "Optimisation SEO pour YouTube",
                "Stratégie de monétisation",
                "Analyse de performance et conseils d'amélioration",
                "Aide à la production vidéo"
            ],
            price: "À partir de 799€"
        }
    ];
    
    // Afficher les détails d'un service
    window.showServiceDetails = function(serviceId) {
        console.log("Affichage des détails du service:", serviceId);
        
        // Trouver le service correspondant
        const service = services.find(s => s.id === serviceId);
        if (!service) {
            showToast("Erreur", "Service non trouvé", "❌");
            return;
        }
        
        // Créer le modal avec un design amélioré
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h3>${service.title}</h3>
                <p>${service.fullDescription}</p>
                
                <div style="margin-top: 20px; text-align: left;">
                    <h4 style="margin-bottom: 10px; color: var(--primary);">Fonctionnalités</h4>
                    <ul style="padding-left: 20px; margin-bottom: 15px;">
                        ${service.features.map(feature => `<li style="margin-bottom: 8px;">${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <p style="font-weight: 600; margin-top: 15px; color: var(--primary);">${service.price}</p>
                
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button id="contact-service-btn" class="btn" style="width: 48%;">Nous contacter</button>
                    <button id="close-modal-btn" class="btn btn-outline" style="width: 48%;">Fermer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer les événements des boutons
        document.getElementById('contact-service-btn').onclick = function() {
            document.body.removeChild(modal);
            showContactForm(serviceId);
        };
        
        document.getElementById('close-modal-btn').onclick = function() {
            modal.style.opacity = 0;
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
    };
    
    // Afficher le formulaire de contact pour un service
    window.showContactForm = function(serviceId) {
        console.log("Affichage du formulaire de contact pour:", serviceId);
        
        // Trouver le service correspondant
        const service = services.find(s => s.id === serviceId);
        if (!service) {
            showToast("Erreur", "Service non trouvé", "❌");
            return;
        }
        
        // Créer le modal avec un formulaire de contact
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h3>Contact pour ${service.title}</h3>
                <p>Complétez le formulaire ci-dessous pour en savoir plus sur nos services.</p>
                
                <div class="contact-form" style="margin-top: 20px;">
                    <button id="contact-telegram-btn" class="btn" style="margin-bottom: 10px;">
                        Contacter via Telegram
                    </button>
                    
                    <p style="text-align: center; margin: 15px 0; color: var(--text-light);">ou</p>
                    
                    <div class="form-group">
                        <label for="contact-email">Email</label>
                        <input type="email" id="contact-email" placeholder="Votre email">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" rows="4" placeholder="Votre message" style="width: 100%; padding: 12px; border-radius: var(--border-radius); border: 1px solid var(--border);"></textarea>
                    </div>
                    
                    <button id="send-message-btn" class="btn" style="margin-top: 15px;">Envoyer</button>
                </div>
                
                <button id="close-contact-modal-btn" class="btn btn-outline" style="margin-top: 15px;">Annuler</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer les événements des boutons
        document.getElementById('contact-telegram-btn').onclick = function() {
            // Ouvrir une conversation Telegram
            if (telegramApp && telegramApp.openTelegramLink) {
                telegramApp.openTelegramLink("https://t.me/votre_compte_support");
            } else {
                window.open("https://t.me/votre_compte_support", "_blank");
            }
            
            // Enregistrer l'intérêt et fermer le modal
            recordServiceInterest(serviceId, "telegram");
            document.body.removeChild(modal);
        };
        
        document.getElementById('send-message-btn').onclick = function() {
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            if (!email || !message) {
                showToast("Erreur", "Veuillez remplir tous les champs", "⚠️");
                return;
            }
            
            // Enregistrer le message (cette fonction devrait être définie dans app.js)
            recordServiceInterest(serviceId, "email", { email, message });
            
            // Afficher une confirmation et fermer
            showToast("Message envoyé", "Nous vous contacterons bientôt", "✅");
            document.body.removeChild(modal);
        };
        
        document.getElementById('close-contact-modal-btn').onclick = function() {
            modal.style.opacity = 0;
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
    };
    
    // Enregistrer l'intérêt d'un utilisateur pour un service
    async function recordServiceInterest(serviceId, contactMethod, contactDetails = {}) {
        if (!db) return;
        
        try {
            // Préparer les données
            const interestData = {
                serviceId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                contactMethod,
                contactDetails,
                // Ajouter les informations utilisateur si disponibles
                userId: currentUser?.id || null,
                telegramId: currentUser?.telegramId || (telegramApp?.initDataUnsafe?.user?.id?.toString() || null),
                username: currentUser?.username || (telegramApp?.initDataUnsafe?.user?.username || null)
            };
            
            // Enregistrer dans Firestore
            await db.collection('service_interests').add(interestData);
            
            console.log(`Intérêt enregistré pour ${serviceId}`);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'intérêt:", error);
        }
    }
    
    // ======================================================
    // PARTIE 9: FONCTIONS UTILITAIRES
    // ======================================================
    
    // Affichage de messages d'erreur temporaires
    window.showError = function(message, element) {
        if (!element) return;
        
        // Créer le message d'erreur avec style amélioré
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">⚠️</span>
                <span>${message}</span>
            </div>
        `;
        
        // Ajouter la classe d'erreur à l'élément
        element.classList.add('input-error');
        
        // Ajouter le message après l'élément
        element.parentNode.appendChild(errorMessage);
        
        // Supprimer après un délai
        setTimeout(function() {
            element.classList.remove('input-error');
            errorMessage.style.opacity = 0;
            errorMessage.style.transform = 'translateY(-10px)';
            errorMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                if (errorMessage.parentNode) {
                    errorMessage.parentNode.removeChild(errorMessage);
                }
            }, 300);
        }, 3000);
    };
    
    // Ouvrir un lien externe dans Telegram
    window.openExternalLink = function(url) {
        if (telegramApp && telegramApp.openLink) {
            telegramApp.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    };
    
    // ======================================================
    // PARTIE 10: ÉVÉNEMENTS TELEGRAM
    // ======================================================
    
    // Gestion des événements Telegram WebApp
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
        
        // Gestion du thème
        telegramApp.onEvent('themeChanged', function() {
            if (telegramApp.themeParams) {
                document.documentElement.style.setProperty('--tg-theme-bg-color', telegramApp.themeParams.bg_color || '#f8f9fa');
                document.documentElement.style.setProperty('--tg-theme-text-color', telegramApp.themeParams.text_color || '#333333');
                document.documentElement.style.setProperty('--tg-theme-button-color', telegramApp.themeParams.button_color || '#6366f1');
                document.documentElement.style.setProperty('--tg-theme-button-text-color', telegramApp.themeParams.button_text_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-hint-color', telegramApp.themeParams.hint_color || '#999999');
                document.documentElement.style.setProperty('--tg-theme-link-color', telegramApp.themeParams.link_color || '#2481cc');
            }
        });
    }
    
    // ======================================================
    // PARTIE 11: INITIALISATION COMPLÈTE
    // ======================================================
    
    // Initialiser l'application
    function initApp() {
        console.log("Initialisation complète de l'application");
        
        // Animation du logo sur la page d'accueil
        const logoContainer = document.getElementById('logo-animation');
        if (logoContainer && window.initLogoAnimationEffect) {
            window.initLogoAnimationEffect(logoContainer);
        }
        
        // Vérifier si les fonctions des boutons sont disponibles
        checkFunctions();
        
        // Vérifier les limites d'utilisation si l'utilisateur est connecté
        if (currentUser) {
            checkUserLimits();
        }
        
        // Afficher un toast de bienvenue
        setTimeout(() => {
            showToast("Bienvenue", "ZERO ANALYZE - Prédictions par les cotes", "🎯");
        }, 1000);
        
        // Corrige le bouton "Commencer" s'il existe
        fixStartButton();
    }
    
    // Vérifier et corriger le bouton "Commencer"
    function fixStartButton() {
        const startButton = document.getElementById('start-btn');
        if (!startButton) return;
        
        // S'assurer que le bouton utilise notre fonction corrigée
        startButton.onclick = window.startQuestionnaire;
        
        // Ajouter une classe pour montrer qu'il est prêt
        startButton.classList.add('btn-ready');
        
        console.log("Bouton 'Commencer' corrigé et prêt");
    }
    
    // Vérifier si les fonctions essentielles sont disponibles
    function checkFunctions() {
        const requiredFunctions = [
            { name: 'navigateTo', object: window },
            { name: 'resetQuestionnaire', object: window },
            { name: 'navigateToPreviousStep', object: window },
            { name: 'navigateToNextStep', object: window },
            { name: 'initLogoAnimationEffect', object: window }
        ];
        
        let missingFunctions = [];
        
        requiredFunctions.forEach(func => {
            if (typeof func.object[func.name] !== 'function') {
                console.warn(`Fonction ${func.name} non disponible`);
                missingFunctions.push(func.name);
                
                // Fournir une implémentation de secours
                if (func.name === 'resetQuestionnaire' && !window.resetQuestionnaire) {
                    window.resetQuestionnaire = function() {
                        console.log("Réinitialisation du questionnaire (fonction de secours)");
                        return true;
                    };
                }
            }
        });
        
        if (missingFunctions.length > 0) {
            console.warn(`Fonctions manquantes: ${missingFunctions.join(', ')}`);
        }
    }
    
    // Démarrer l'application
    initApp();
    
    // Exposer l'API publique
    window.app = {
        showServiceDetails: window.showServiceDetails,
        showContactForm: window.showContactForm,
        navigateTo: window.navigateTo,
        startQuestionnaire: window.startQuestionnaire,
        showResults: window.showResults,
        showError: window.showError,
        openExternalLink: window.openExternalLink
    };
});
