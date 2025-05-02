// profile.js - Gestion du profil utilisateur et des services avec intégration Firebase

import telegramAuth from './telegram-auth.js';
import firebaseService from './firebase-service.js';
import predictionLimits from './prediction-limits.js';

/**
 * Stocke les données utilisateur récupérées depuis Telegram
 * @param {Object} user - Objet utilisateur Telegram
 */
function setUserData(user) {
    // Mettre à jour l'interface utilisateur
    updateUserInterface(user);
}

/**
 * Met à jour l'interface utilisateur avec les informations du profil
 * @param {Object} userData - Données utilisateur
 */
function updateUserInterface(userData = null) {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    // Si aucune donnée utilisateur n'est fournie, utiliser celles de telegramAuth
    if (!userData && telegramAuth.isAuthenticated()) {
        userData = telegramAuth.getUserData();
    }
    
    if (userData) {
        // Afficher les informations de l'utilisateur
        profileContent.innerHTML = `
            <div class="profile-info">
                <div class="profile-picture">
                    ${userData.first_name ? userData.first_name.charAt(0) : '?'}${userData.last_name ? userData.last_name.charAt(0) : ''}
                </div>
                <div>
                    <h3 class="profile-name">${userData.first_name || ''} ${userData.last_name || ''}</h3>
                    <p>@${userData.username || 'inconnu'}</p>
                </div>
            </div>
            <div class="profile-details">
                <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
                <div id="prediction-stats" class="stats-container">
                    <p><strong>Chargement de vos statistiques...</strong></p>
                </div>
            </div>
        `;
        
        // Charger les statistiques de l'utilisateur
        loadUserStats(userData.id);
    } else {
        // Afficher un message d'erreur ou d'invitation
        profileContent.innerHTML = `
            <div class="error-message centered">
                <p>Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
            </div>
        `;
    }
}

/**
 * Charge les statistiques de l'utilisateur depuis Firebase
 * @param {string} userId - ID de l'utilisateur
 */
async function loadUserStats(userId) {
    const statsContainer = document.getElementById('prediction-stats');
    if (!statsContainer) return;
    
    try {
        // Vérifier l'état des limites de prédictions
        const limitStatus = await predictionLimits.canMakePrediction(userId);
        
        // Récupérer l'historique des prédictions
        const predictionHistory = await firebaseService.getUserPredictions(userId, 5);
        // Créer le contenu des statistiques
        let statsHTML = `
            <div class="stats-card">
                <h4>Vos prédictions</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${limitStatus.remaining}</div>
                        <div class="stat-label">Prédictions restantes aujourd'hui</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${predictionLimits.DAILY_LIMIT}</div>
                        <div class="stat-label">Limite quotidienne</div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter l'historique des prédictions s'il y en a
        if (predictionHistory && predictionHistory.length > 0) {
            statsHTML += `
                <div class="history-card">
                    <h4>Historique récent</h4>
                    <ul class="prediction-history">
            `;
            
            // Ajouter chaque prédiction
            predictionHistory.forEach(pred => {
                const date = pred.created_at ? new Date(pred.created_at.seconds * 1000) : new Date();
                const formattedDate = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                statsHTML += `
                    <li class="history-item">
                        <div class="history-date">${formattedDate}</div>
                        <div class="history-details">
                            <div class="history-score">${pred.scoreExact1} / ${pred.scoreExact2}</div>
                            <div class="history-result">${pred.matchResult}</div>
                        </div>
                    </li>
                `;
            });
            
            statsHTML += `
                    </ul>
                </div>
            `;
        } else {
            statsHTML += `
                <div class="history-card">
                    <h4>Historique récent</h4>
                    <p class="centered">Aucune prédiction enregistrée pour le moment.</p>
                </div>
            `;
        }
        
        // Mise à jour du conteneur
        statsContainer.innerHTML = statsHTML;
    } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        
        if (statsContainer) {
            statsContainer.innerHTML = `
                <p class="error-message">Impossible de charger vos statistiques. Veuillez réessayer ultérieurement.</p>
            `;
        }
    }
}

/**
 * Charge le profil utilisateur
 * Appelé lors de la navigation vers la page de profil
 */
function loadUserProfile() {
    if (telegramAuth.isAuthenticated()) {
        updateUserInterface();
    } else {
        const profileContent = document.getElementById('profile-content');
        if (profileContent) {
            telegramAuth.showAuthError(profileContent);
        }
    }
}

/**
 * Liste des services disponibles
 */
const servicesList = [
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

/**
 * Charge les services dans la page des services
 */
function loadServices() {
    const servicesListContainer = document.getElementById('services-list');
    if (!servicesListContainer) return;
    
    // Vider la liste existante
    servicesListContainer.innerHTML = '';
    
    // Ajouter chaque service
    servicesList.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'card';
        
        serviceCard.innerHTML = `
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <div class="form-nav">
                <button class="btn btn-outline service-info-btn" data-service="${service.id}">Aperçu</button>
                <button class="btn service-contact-btn" data-service="${service.id}">Contact</button>
            </div>
        `;
        
        servicesListContainer.appendChild(serviceCard);
    });
    
    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.service-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showServiceDetails(this.dataset.service);
        });
    });
    
    document.querySelectorAll('.service-contact-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showContactForm(this.dataset.service);
        });
    });
}

/**
 * Affiche les détails d'un service
 * @param {string} serviceId - ID du service
 */
function showServiceDetails(serviceId) {
    // Trouver le service correspondant
    const service = servicesList.find(s => s.id === serviceId);
    if (!service) return;
    
    // Afficher une alerte simple (à remplacer par une modale)
    alert(`Service: ${service.title}\n\nDescription: ${service.description}`);
}

/**
 * Affiche le formulaire de contact pour un service
 * @param {string} serviceId - ID du service
 */
function showContactForm(serviceId) {
    // Trouver le service correspondant
    const service = servicesList.find(s => s.id === serviceId);
    if (!service) return;
    
    // Afficher une alerte simple (à remplacer par une modale)
    alert(`Contact pour le service: ${service.title}\n\nVeuillez nous contacter via Telegram pour plus d'informations.`);
    
    // Si l'utilisateur est authentifié, enregistrer l'intérêt
    if (telegramAuth.isAuthenticated()) {
        recordServiceInterest(serviceId);
    }
}

/**
 * Enregistre l'intérêt d'un utilisateur pour un service dans Firebase
 * @param {string} serviceId - ID du service
 */
async function recordServiceInterest(serviceId) {
    if (!telegramAuth.isAuthenticated()) return;
    
    try {
        const userId = telegramAuth.getUserId();
        if (!userId) return;
        
        // Enregistrer l'intérêt dans Firebase (pourrait être implémenté dans firebase-service.js)
        // await firebaseService.recordServiceInterest(userId, serviceId);
        console.log(`Intérêt enregistré pour ${serviceId} par l'utilisateur ${userId}`);
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'intérêt:", error);
    }
}

// Exposer les fonctions globalement
window.setUserData = setUserData;
window.loadUserProfile = loadUserProfile;
window.loadServices = loadServices;
