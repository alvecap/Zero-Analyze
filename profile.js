// profile.js - Gestion du profil utilisateur et des services avec intégration Firebase améliorée
// Cette version corrigée résout les problèmes de chargement et améliore le design

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
            console.warn("Firebase non disponible, affichage des informations de base uniquement");
            
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
        displayBasicUserInfo(telegramUser || { first_name: "Utilisateur", last_name: "", username: "inconnu" });
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
                <div style="margin-top: 10px;">
                    <span class="limit-badge">6/6</span> prédictions restantes
                </div>
            </div>
        </div>
    `;
    
    // Ajouter des statistiques basiques
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
            // Afficher directement les informations de base
            displayBasicUserInfo(telegramUser);
            
            // Initialiser complètement le profil en arrière-plan
            initializeUserProfile(telegramUser);
            return;
        }
    }
    
    // Aucune donnée disponible, afficher un profil par défaut
    displayBasicUserInfo({ first_name: "Utilisateur", last_name: "", username: "inconnu" });
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

// Exécuter l'initialisation au chargement
if (document.getElementById('profile').classList.contains('active')) {
    window.loadUserProfile();
}

// Export des fonctions pour utilisation globale
window.initializeUserProfile = initializeUserProfile;
window.displayUserProfile = displayUserProfile;
window.loadUserStats = loadUserStats;
