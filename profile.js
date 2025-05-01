// profile.js - Gestion du profil utilisateur et des services

/**
 * Stocke les données utilisateur récupérées depuis Telegram
 * @param {Object} user - Objet utilisateur Telegram
 */
function setUserData(user) {
    // Sauvegarder les données utilisateur dans le stockage local
    localStorage.setItem('zeroAnalyzeUser', JSON.stringify({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        timestamp: Date.now()
    }));
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
}

/**
 * Récupère les données utilisateur du stockage local
 * @returns {Object|null} - Données utilisateur ou null si non trouvées
 */
function getUserData() {
    const userData = localStorage.getItem('zeroAnalyzeUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Erreur lors de la lecture des données utilisateur:', error);
            return null;
        }
    }
    return null;
}

/**
 * Met à jour l'interface utilisateur avec les informations du profil
 */
function updateUserInterface() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    const userData = getUserData();
    
    if (userData && userData.username) {
        // Afficher les informations de l'utilisateur
        profileContent.innerHTML = `
            <div class="profile-info">
                <div class="profile-picture">
                    ${userData.firstName ? userData.firstName.charAt(0) : '?'}${userData.lastName ? userData.lastName.charAt(0) : ''}
                </div>
                <div>
                    <h3 class="profile-name">${userData.firstName || ''} ${userData.lastName || ''}</h3>
                    <p>@${userData.username}</p>
                </div>
            </div>
            <div class="profile-details">
                <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
                <p>Vos prédictions sont générées automatiquement grâce à nos algorithmes avancés.</p>
            </div>
        `;
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
 * Charge le profil utilisateur
 * Appelé lors de la navigation vers la page de profil
 */
function loadUserProfile() {
    updateUserInterface();
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
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    // Vider la liste existante
    servicesList.innerHTML = '';
    
    // Ajouter chaque service
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        serviceCard.innerHTML = `
            <div class="service-header">
                <span class="service-icon">${service.icon}</span>
                <h3 class="service-title">${service.title}</h3>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-actions">
                <button class="secondary-btn service-details-btn" data-service="${service.id}">Aperçu</button>
                <button class="primary-btn service-contact-btn" data-service="${service.id}">Contact</button>
            </div>
        `;
        
        servicesList.appendChild(serviceCard);
    });
    
    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.service-details-btn').forEach(btn => {
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
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Créer une popup modale
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${service.title}</h3>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="service-icon-large">${service.icon}</div>
                <p>${service.description}</p>
                <div class="service-details">
                    ${getServiceDetailsHTML(serviceId)}
                </div>
            </div>
            <div class="modal-footer">
                <button class="primary-btn contact-service-btn" data-service="${serviceId}">Je suis intéressé</button>
            </div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(modal);
    
    // Événements
    modal.querySelector('.close-modal-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.contact-service-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
        showContactForm(serviceId);
    });
    
    // Fermer si clic en dehors
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Génère le HTML des détails spécifiques à chaque service
 * @param {string} serviceId - ID du service
 * @returns {string} - HTML des détails
 */
function getServiceDetailsHTML(serviceId) {
    switch(serviceId) {
        case 'telegram-bots':
            return `
                <h4>Fonctionnalités des bots Telegram</h4>
                <ul>
                    <li>Intégration d'algorithmes prédictifs</li>
                    <li>Interface interactive et intuitive</li>
                    <li>Personnalisation complète</li>
                    <li>Notifications automatisées</li>
                    <li>Analyse de données en temps réel</li>
                </ul>
            `;
        case 'webapps':
            return `
                <h4>Types d'applications web</h4>
                <ul>
                    <li>Applications de prédiction statistique</li>
                    <li>Dashboards analytiques</li>
                    <li>Outils d'aide à la décision</li>
                    <li>Systèmes de recommandation</li>
                    <li>Intégration avec des API sportives</li>
                </ul>
            `;
        case 'youtube':
            return `
                <h4>Services pour YouTube</h4>
                <ul>
                    <li>Développement d'identité de chaîne</li>
                    <li>Création de contenu à fort engagement</li>
                    <li>Optimisation SEO pour YouTube</li>
                    <li>Stratégies de monétisation</li>
                    <li>Production vidéo de qualité professionnelle</li>
                </ul>
            `;
        default:
            return '<p>Détails non disponibles pour ce service.</p>';
    }
}

/**
 * Affiche le formulaire de contact pour un service
 * @param {string} serviceId - ID du service
 */
function showContactForm(serviceId) {
    // Trouver le service correspondant
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Créer une popup modale
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Contact pour ${service.title}</h3>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Laissez-nous vos coordonnées pour discuter de ce service.</p>
                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <label for="contact-name">Prénom</label>
                        <input type="text" id="contact-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Email</label>
                        <input type="email" id="contact-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-budget">Budget (€)</label>
                        <input type="number" id="contact-budget" name="budget" min="100">
                    </div>
                    <div class="form-group">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" name="message" rows="4"></textarea>
                    </div>
                    <input type="hidden" name="service" value="${serviceId}">
                </form>
            </div>
            <div class="modal-footer">
                <button id="submit-contact-btn" class="primary-btn">Envoyer</button>
            </div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(modal);
    
    // Événements
    modal.querySelector('.close-modal-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#submit-contact-btn').addEventListener('click', function() {
        const form = document.getElementById('contact-form');
        if (form.checkValidity()) {
            // Simuler l'envoi du formulaire
            showSubmissionConfirmation(service.title);
            document.body.removeChild(modal);
        } else {
            form.reportValidity();
        }
    });
    
    // Fermer si clic en dehors
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Affiche une confirmation après l'envoi du formulaire
 * @param {string} serviceTitle - Titre du service
 */
function showSubmissionConfirmation(serviceTitle) {
    // Créer une popup de confirmation
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">✅</span>
            <div class="toast-message">
                <p>Merci pour votre intérêt pour <strong>${serviceTitle}</strong>.</p>
                <p>Nous vous contacterons bientôt.</p>
            </div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(toast);
    
    // Disparaître après un délai
    setTimeout(function() {
        toast.classList.add('toast-hide');
        setTimeout(function() {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Déclaration des services
const services = servicesList;

// Exposer les fonctions globalement
window.setUserData = setUserData;
window.loadUserProfile = loadUserProfile;
window.loadServices = loadServices;
