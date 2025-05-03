// profile.js - Gestion du profil utilisateur et des services avec intégration Firebase améliorée
// Cette version récupère automatiquement les informations utilisateur et affiche les prédictions restantes

// Importer les modules nécessaires
// Note: Ces imports sont commentés car ils ne fonctionneront pas dans un navigateur sans bundler
// Dans l'application réelle, nous utilisons les objets globaux définis dans app.js
// import { telegramApp, db, auth, currentUser } from './app.js';

/**
 * Initialisation du profil au démarrage de l'application
 * Cette fonction est appelée automatiquement au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation du module de profil");
    
    // Surveiller les changements d'authentification
    if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // L'utilisateur est connecté, charger son profil
                initializeUserProfile();
            }
        });
    }
    
    // Tenter d'initialiser si Telegram est disponible
    if (window.Telegram && window.Telegram.WebApp) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (telegramUser) {
            // Initialiser avec les données Telegram
            initializeUserProfile(telegramUser);
        }
    }
});

/**
 * Initialise le profil utilisateur avec les données Telegram
 * @param {Object} telegramUser - Données utilisateur Telegram (optionnel)
 */
async function initializeUserProfile(telegramUser = null) {
    console.log("Initialisation du profil utilisateur");
    
    try {
        // Vérifier si l'authentification est déjà gérée par app.js
        if (window.currentUser) {
            // Profil déjà initialisé dans app.js
            return;
        }
        
        // Si telegramUser n'est pas fourni, essayer de le récupérer depuis Telegram WebApp
        if (!telegramUser && window.Telegram && window.Telegram.WebApp) {
            telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
        }
        
        if (!telegramUser) {
            console.warn("Pas de données utilisateur Telegram disponibles");
            return;
        }
        
        // Vérifier si Firebase est disponible
        if (!window.firebase || !window.firebase.firestore) {
            console.warn("Firebase non disponible, impossible de charger le profil complet");
            
            // Afficher uniquement les infos Telegram
            displayBasicUserInfo(telegramUser);
            return;
        }
        
        // Chercher l'utilisateur dans Firebase
        const db = window.firebase.firestore();
        const telegramId = telegramUser.id.toString();
        
        const usersRef = db.collection('users');
        const query = usersRef.where('telegramId', '==', telegramId);
        const querySnapshot = await query.get();
        
        let userData;
        
        if (!querySnapshot.empty) {
            // Utilisateur existant
            const userDoc = querySnapshot.docs[0];
            userData = {
                id: userDoc.id,
                ...userDoc.data()
            };
            
            // Mise à jour des données d'accès
            await userDoc.ref.update({
                lastAccessedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Nouvel utilisateur - créer un profil
            const newUser = {
                telegramId: telegramId,
                username: telegramUser.username || '',
                firstName: telegramUser.first_name || '',
                lastName: telegramUser.last_name || '',
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                dailyLimit: 6,  // Limite par défaut
                usageCount: 0,
                lastResetDate: window.firebase.firestore.FieldValue.serverTimestamp(),
                isAdmin: false,
                isPremium: false,
                premiumExpiry: null,
                lastAccessedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await usersRef.add(newUser);
            userData = {
                id: docRef.id,
                ...newUser
            };
        }
        
        // Stocker les données utilisateur pour utilisation future
        window.userData = userData;
        
        // Afficher le profil
        displayUserProfile(userData);
        
        // Charger les statistiques
        loadUserStats(userData.id);
        
        // Afficher les limites d'utilisation
        displayLimitInfo(userData);
        
        console.log("Profil utilisateur initialisé avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation du profil:", error);
        displayErrorProfile();
    }
}

/**
 * Affiche les informations de base de l'utilisateur avec uniquement les données Telegram
 * @param {Object} telegramUser - Données utilisateur Telegram
 */
function displayBasicUserInfo(telegramUser) {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="profile-info">
            <div class="profile-picture">
                ${telegramUser.first_name ? telegramUser.first_name.charAt(0) : '?'}${telegramUser.last_name ? telegramUser.last_name.charAt(0) : ''}
            </div>
            <div>
                <h3 class="profile-name">${telegramUser.first_name || ''} ${telegramUser.last_name || ''}</h3>
                <p>@${telegramUser.username || 'inconnu'}</p>
            </div>
        </div>
        <div class="profile-details">
            <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
            <p>Chargement des informations détaillées en cours...</p>
        </div>
    `;
}

/**
 * Affiche le profil complet de l'utilisateur avec toutes les données Firebase
 * @param {Object} userData - Données utilisateur complètes de Firebase
 */
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
        <div class="profile-details">
            <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
            <p>Vos prédictions sont générées automatiquement grâce à nos algorithmes avancés.</p>
            ${userData.isPremium 
                ? `<div class="premium-status">Statut: <span class="premium-badge">Premium</span> ${userData.premiumExpiry ? `(expire le ${formatDate(userData.premiumExpiry)})` : ''}</div>` 
                : ''}
        </div>
    `;
}

/**
 * Affiche un message d'erreur dans le profil
 */
function displayErrorProfile() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    profileContent.innerHTML = `
        <div class="card">
            <div class="error-icon">⚠️</div>
            <h3>Problème de chargement</h3>
            <p class="error-subtitle">Impossible de charger votre profil. Veuillez réessayer ultérieurement.</p>
        </div>
    `;
}

/**
 * Affiche les informations de limite d'utilisation
 * @param {Object} userData - Données utilisateur de Firebase
 */
function displayLimitInfo(userData) {
    if (!userData) return;
    
    // Créer ou mettre à jour l'élément d'information sur la page d'accueil
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
    
    // Calculer le nombre de prédictions restantes
    const remaining = (userData.dailyLimit || 6) - (userData.usageCount || 0);
    
    // Mettre à jour le contenu
    if (userData.isPremium) {
        infoElement.innerHTML = `<span class="premium-badge">Premium</span> Prédictions illimitées`;
    } else {
        infoElement.innerHTML = `<span class="limit-badge">${remaining}/${userData.dailyLimit}</span> prédictions restantes`;
    }
    
    // Ajouter également une bannière si les prédictions sont presque épuisées
    if (!userData.isPremium && remaining <= 2) {
        const bannerContainer = document.getElementById('limit-banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="limit-banner">
                    <div class="limit-icon">${remaining === 0 ? '🛑' : '⚠️'}</div>
                    <div class="limit-text">
                        <p>${remaining === 0 
                            ? 'Vous avez atteint votre limite quotidienne de prédictions.' 
                            : `Il ne vous reste que ${remaining} prédiction${remaining > 1 ? 's' : ''} aujourd'hui.`}</p>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Charge les statistiques de l'utilisateur
 * @param {string} userId - ID de l'utilisateur Firebase
 */
async function loadUserStats(userId) {
    const statsContainer = document.getElementById('prediction-stats');
    if (!statsContainer || !userId) return;
    
    try {
        // Vérifier si Firebase est disponible
        if (!window.firebase || !window.firebase.firestore) {
            throw new Error("Firebase non disponible");
        }
        
        const db = window.firebase.firestore();
        
        // Récupérer les données utilisateur
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
                    const formattedDate = formatDate(date, true);
                    
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
            <div class="card">
                <p class="error-message">Impossible de charger vos statistiques. Veuillez réessayer ultérieurement.</p>
            </div>
        `;
    }
}

/**
 * Formate une date pour l'affichage
 * @param {Date|Object} date - Objet Date ou timestamp Firestore
 * @param {boolean} includeTime - Inclure l'heure dans le format
 * @returns {string} - Date formatée
 */
function formatDate(date, includeTime = false) {
    // Si c'est un timestamp Firestore, convertir en Date
    if (date && typeof date.toDate === 'function') {
        date = date.toDate();
    } else if (!(date instanceof Date)) {
        return 'Date inconnue';
    }
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Récupère les détails d'un service
 * @param {string} serviceId - ID du service
 * @returns {Object|null} - Détails du service ou null
 */
function getServiceDetails(serviceId) {
    // Liste des services disponibles
    const services = [
        {
            id: 'telegram-bots',
            title: 'Création de bots Telegram IA',
            description: 'Développement de bots avec prédictions automatisées et interactions intelligentes.',
            icon: '🤖'
        },
        {
            id: 'webapps',
            title: 'Développement de WebApps IA',
            description: 'Applications web comme Zero Analyze, avec intelligence artificielle intégrée.',
            icon: '🌐'
        },
        {
            id: 'youtube',
            title: 'Création de chaînes YouTube',
            description: 'Stratégie de contenu, branding, scripts, montage et monétisation.',
            icon: '📺'
        }
    ];
    
    return services.find(service => service.id === serviceId) || null;
}

/**
 * Fonction principale pour charger le profil utilisateur
 * Cette fonction est appelée lors de la navigation vers la page de profil
 */
window.loadUserProfile = function() {
    console.log("Chargement du profil utilisateur");
    
    // Vérifie si l'utilisateur est déjà initialisé (via app.js)
    if (window.currentUser) {
        // Utiliser les données utilisateur existantes
        displayUserProfile(window.currentUser);
        loadUserStats(window.currentUser.id);
        return;
    }
    
    // Vérifier si les données utilisateur sont stockées localement
    if (window.userData) {
        // Utiliser les données utilisateur stockées localement
        displayUserProfile(window.userData);
        loadUserStats(window.userData.id);
        return;
    }
    
    // Essayer d'initialiser avec les données Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (telegramUser) {
            // Afficher les informations de base pendant l'initialisation
            displayBasicUserInfo(telegramUser);
            
            // Initialiser complètement le profil
            initializeUserProfile(telegramUser);
            return;
        }
    }
    
    // Aucune donnée disponible, afficher un message d'erreur
    displayErrorProfile();
};

/**
 * Charge les services disponibles
 */
window.loadServices = function() {
    console.log("Chargement des services");
    
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    // Les services sont déjà définis dans le HTML, mais on pourrait les charger dynamiquement ici
    
    // Ajouter des écouteurs d'événements aux boutons
    const infoButtons = document.querySelectorAll('.service-info-btn');
    const contactButtons = document.querySelectorAll('.service-contact-btn');
    
    infoButtons.forEach(button => {
        button.onclick = function() {
            const serviceId = this.getAttribute('data-service');
            if (window.showServiceDetails) {
                window.showServiceDetails(serviceId);
            }
        };
    });
    
    contactButtons.forEach(button => {
        button.onclick = function() {
            const serviceId = this.getAttribute('data-service');
            if (window.showContactForm) {
                window.showContactForm(serviceId);
            }
        };
    });
};

/**
 * Affiche les détails d'un service
 * @param {string} serviceId - ID du service
 */
window.showServiceDetails = function(serviceId) {
    const service = getServiceDetails(serviceId);
    if (!service) {
        console.error(`Service '${serviceId}' non trouvé`);
        return;
    }
    
    // Si app.js a déjà défini cette fonction, l'utiliser à la place
    if (typeof window.app !== 'undefined' && typeof window.app.showServiceDetails === 'function') {
        window.app.showServiceDetails(serviceId);
        return;
    }
    
    // Créer un modal pour afficher les détails
    const modal = document.createElement('div');
    modal.className = 'limit-modal';
    modal.innerHTML = `
        <div class="limit-modal-content">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <button id="close-service-modal" class="btn" style="margin-top: 20px;">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter un gestionnaire d'événement pour fermer le modal
    document.getElementById('close-service-modal').onclick = function() {
        document.body.removeChild(modal);
    };
};

/**
 * Affiche le formulaire de contact pour un service
 * @param {string} serviceId - ID du service
 */
window.showContactForm = function(serviceId) {
    const service = getServiceDetails(serviceId);
    if (!service) {
        console.error(`Service '${serviceId}' non trouvé`);
        return;
    }
    
    // Si app.js a déjà défini cette fonction, l'utiliser à la place
    if (typeof window.app !== 'undefined' && typeof window.app.showContactForm === 'function') {
        window.app.showContactForm(serviceId);
        return;
    }
    
    // Créer un modal pour afficher le formulaire de contact
    const modal = document.createElement('div');
    modal.className = 'limit-modal';
    modal.innerHTML = `
        <div class="limit-modal-content">
            <h3>Contact pour ${service.title}</h3>
            <p>Pour obtenir plus d'informations sur ce service, veuillez nous contacter.</p>
            
            <div style="margin: 20px 0;">
                <button id="contact-telegram-btn" class="btn" style="margin-bottom: 10px;">
                    Contacter via Telegram
                </button>
                
                <p style="text-align: center; margin: 15px 0; color: var(--text-light);">ou</p>
                
                <div style="margin-bottom: 15px;">
                    <label for="contact-email" style="display: block; margin-bottom: 5px; font-weight: 600;">Email</label>
                    <input type="email" id="contact-email" placeholder="Votre email" style="width: 100%; padding: 12px; border-radius: var(--border-radius); border: 1px solid var(--border);">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label for="contact-message" style="display: block; margin-bottom: 5px; font-weight: 600;">Message</label>
                    <textarea id="contact-message" rows="4" placeholder="Votre message" style="width: 100%; padding: 12px; border-radius: var(--border-radius); border: 1px solid var(--border);"></textarea>
                </div>
                
                <button id="send-message-btn" class="btn" style="margin-top: 10px;">Envoyer</button>
            </div>
            
            <button id="close-contact-modal" class="btn btn-outline" style="margin-top: 10px;">Annuler</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter des gestionnaires d'événements pour les boutons
    document.getElementById('contact-telegram-btn').onclick = function() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink("https://t.me/votre_compte_support");
        } else {
            window.open("https://t.me/votre_compte_support", "_blank");
        }
        
        document.body.removeChild(modal);
    };
    
    document.getElementById('send-message-btn').onclick = function() {
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        
        if (!email || !message) {
            alert("Veuillez remplir tous les champs");
            return;
        }
        
        // Enregistrer le message (cette fonction devrait être définie dans app.js)
        if (typeof window.recordServiceInterest === 'function') {
            window.recordServiceInterest(serviceId, "email", { email, message });
        }
        
        alert("Message envoyé ! Nous vous contacterons bientôt.");
        document.body.removeChild(modal);
    };
    
    document.getElementById('close-contact-modal').onclick = function() {
        document.body.removeChild(modal);
    };
};

// Exécuter l'initialisation du profil au chargement
initializeUserProfile();

// Export des fonctions pour utilisation globale
window.initializeUserProfile = initializeUserProfile;
window.displayUserProfile = displayUserProfile;
window.loadUserStats = loadUserStats;
