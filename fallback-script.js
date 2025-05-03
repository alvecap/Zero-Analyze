/**
 * fallback-script.js
 * Script de secours pour garantir le fonctionnement des boutons dans l'application ZERO ANALYZE
 * Ce script est chargé après tous les autres scripts pour résoudre les problèmes potentiels
 */

// Fonction de secours pour les boutons qui s'exécute après chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation du script de secours pour les boutons");
    
    // Correction du bouton Commencer
    fixStartButton();
    
    // Correction des boutons de navigation
    fixNavigationButtons();
    
    // Ajout d'un gestionnaire global pour les erreurs
    setupErrorHandling();
    
    // Correction de la page de profil
    setTimeout(fixProfilePage, 3000);
});

// Fonction pour corriger le bouton Commencer
function fixStartButton() {
    const startButton = document.getElementById('start-btn');
    if (!startButton) {
        console.error("Bouton 'start-btn' introuvable");
        return;
    }
    
    // S'assurer que le bouton a une fonction onclick valide
    startButton.onclick = function() {
        console.log("Démarrage du questionnaire (fonction de secours)");
        
        // Ajouter un effet visuel de chargement
        startButton.classList.add('btn-loading');
        startButton.disabled = true;
        
        setTimeout(function() {
            // Retirer l'effet de chargement
            startButton.classList.remove('btn-loading');
            startButton.disabled = false;
            
            try {
                // Essayer d'utiliser la fonction principale
                if (typeof window.startQuestionnaire === 'function') {
                    window.startQuestionnaire();
                } 
                // Si la fonction principale n'existe pas, utiliser une méthode de secours
                else {
                    console.log("Fonction startQuestionnaire non disponible, utilisation de la méthode de secours");
                    
                    // Tenter de réinitialiser le questionnaire
                    if (typeof window.resetQuestionnaire === 'function') {
                        window.resetQuestionnaire();
                    }
                    
                    // Naviguer directement vers la page de questionnaire
                    navigateToPage('questionnaire');
                }
            } catch (error) {
                console.error("Erreur lors du démarrage du questionnaire:", error);
                
                // En dernier recours, naviguer directement
                navigateToPage('questionnaire');
            }
        }, 800);
    };
    
    console.log("Bouton 'Commencer' corrigé");
}

// Fonction pour corriger les boutons de navigation
function fixNavigationButtons() {
    // Corriger les boutons de navigation principale
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        const pageId = button.id.replace('nav-', '');
        
        button.onclick = function() {
            navigateToPage(pageId);
        };
    });
    
    // Corriger les autres boutons de navigation
    const homeButton = document.getElementById('home-btn');
    if (homeButton) {
        homeButton.onclick = function() {
            navigateToPage('home');
        };
    }
    
    const newPredictionButton = document.getElementById('new-prediction-btn');
    if (newPredictionButton) {
        newPredictionButton.onclick = function() {
            // Réinitialiser le questionnaire si possible
            if (typeof window.resetQuestionnaire === 'function') {
                window.resetQuestionnaire();
            }
            
            // Naviguer vers le questionnaire
            navigateToPage('questionnaire');
        };
    }
    
    console.log("Boutons de navigation corrigés");
}

// Fonction de navigation directe
function navigateToPage(pageId) {
    console.log("Navigation vers " + pageId + " (fonction de secours)");
    
    try {
        // Essayer d'utiliser la fonction principale
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(pageId);
            return;
        }
        
        // Si la fonction principale n'existe pas, naviguer manuellement
        // Masquer toutes les pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(function(page) {
            page.classList.remove('active');
        });
        
        // Afficher la page demandée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Mettre à jour les boutons de navigation
            const navButtons = document.querySelectorAll('.nav-item');
            navButtons.forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.id === 'nav-' + pageId) {
                    btn.classList.add('active');
                }
            });
            
            // Faire défiler vers le haut
            window.scrollTo(0, 0);
            
            // Actions spécifiques selon la page
            if (pageId === 'profile' && typeof window.loadUserProfile === 'function') {
                window.loadUserProfile();
            } else if (pageId === 'services' && typeof window.loadServices === 'function') {
                window.loadServices();
            }
        } else {
            console.error("Page " + pageId + " introuvable");
            
            // En dernier recours, revenir à la page d'accueil
            const homePage = document.getElementById('home');
            if (homePage) {
                homePage.classList.add('active');
            }
        }
    } catch (error) {
        console.error("Erreur lors de la navigation:", error);
        
        // En cas d'erreur, revenir à la page d'accueil
        const homePage = document.getElementById('home');
        if (homePage) {
            homePage.classList.add('active');
        }
    }
}

// Configurer la gestion globale des erreurs
function setupErrorHandling() {
    // Intercepter les erreurs non captées
    window.onerror = function(message, source, lineno, colno, error) {
        console.error("Erreur globale:", message, "à", source, lineno, colno);
        
        // Afficher un toast d'erreur
        showErrorToast("Une erreur s'est produite. Veuillez réessayer.");
        
        return false; // Permettre à l'erreur de se propager
    };
    
    // Intercepter les rejets de promesses non gérés
    window.addEventListener('unhandledrejection', function(event) {
        console.error("Promesse rejetée non gérée:", event.reason);
        
        // Afficher un toast d'erreur
        showErrorToast("Une erreur asynchrone s'est produite.");
        
        // Empêcher la propagation de l'erreur
        event.preventDefault();
    });
}

// Fonction pour afficher un toast d'erreur
function showErrorToast(message) {
    // Vérifier si showToast est disponible
    if (typeof window.showToast === 'function') {
        window.showToast("Erreur", message, "❌");
        return;
    }
    
    // Fonction de secours si showToast n'est pas disponible
    // Supprimer le toast existant s'il y en a un
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Créer le toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">❌</div>
        <div class="toast-content">
            <div class="toast-title">Erreur</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close" onclick="this.parentNode.remove()">×</div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(toast);
    
    // Supprimer après 4 secondes
    setTimeout(function() {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 4000);
}

// Fonction pour corriger le problème de profil
function fixProfilePage() {
    // Cette fonction sera appelée si l'utilisateur navigue vers la page de profil
    // et que le chargement échoue
    if (document.getElementById('profile').classList.contains('active')) {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) return;
        
        // Vérifier si le profil affiche une erreur
        if (profileContent.textContent.includes('Problème de chargement')) {
            console.log("Tentative de correction du profil");
            
            // Afficher une animation de chargement
            profileContent.innerHTML = `
                <div class="loading-animation">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 15px;">Récupération de votre profil...</p>
                </div>
            `;
            
            // Après un court délai, afficher un profil de fallback
            setTimeout(function() {
                // Récupérer les données Telegram si disponibles
                let firstName = "", lastName = "", username = "";
                
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
                    const user = window.Telegram.WebApp.initDataUnsafe.user;
                    firstName = user.first_name || "";
                    lastName = user.last_name || "";
                    username = user.username || "inconnu";
                }
                
                // Afficher un profil basique
                profileContent.innerHTML = `
                    <div class="profile-info">
                        <div class="profile-picture">
                            ${firstName ? firstName.charAt(0) : '?'}${lastName ? lastName.charAt(0) : ''}
                        </div>
                        <div>
                            <h3 class="profile-name">${firstName || 'Utilisateur'} ${lastName || ''}</h3>
                            <p>@${username}</p>
                            <div style="margin-top: 10px;">
                                <span class="limit-badge">6/6</span> prédictions restantes
                            </div>
                        </div>
                    </div>
                    <div class="profile-details">
                        <p>Bienvenue dans ZERO ANALYZE, votre application de prédiction sportive basée uniquement sur les cotes.</p>
                        <p>Vos prédictions sont générées automatiquement grâce à nos algorithmes avancés.</p>
                        <button id="retry-profile-btn" class="btn" style="margin-top: 15px;">Actualiser le profil</button>
                    </div>
                `;
                
                // Ajouter un gestionnaire d'événements pour le bouton Réessayer
                const retryButton = document.getElementById('retry-profile-btn');
                if (retryButton) {
                    retryButton.onclick = function() {
                        // Afficher une animation de chargement
                        profileContent.innerHTML = `
                            <div class="loading-animation">
                                <div class="loading-spinner"></div>
                                <p style="margin-top: 15px;">Chargement de votre profil...</p>
                            </div>
                        `;
                        
                        // Tenter de recharger le profil
                        if (typeof window.loadUserProfile === 'function') {
                            setTimeout(window.loadUserProfile, 500);
                        } else {
                            // Si échec, afficher à nouveau le profil de secours après un délai
                            setTimeout(fixProfilePage, 1500);
                        }
                    };
                }
                
                // Afficher des statistiques basiques
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
            }, 1500);
        }
    }
}

// Ajouter un observateur de mutations pour surveiller les changements de page
const pageObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('page') && target.classList.contains('active')) {
                if (target.id === 'profile') {
                    // Si la page de profil devient active, on vérifie après un délai
                    setTimeout(fixProfilePage, 3000);
                }
            }
        }
    });
});

// Démarrer l'observation des changements de classe
document.querySelectorAll('.page').forEach(function(page) {
    pageObserver.observe(page, { attributes: true });
});

// Vérifier si la fonction startQuestionnaire existe déjà
if (typeof window.startQuestionnaire !== 'function') {
    // Définir une version de secours de la fonction
    window.startQuestionnaire = function() {
        console.log("Démarrage du questionnaire (fonction de secours globale)");
        
        // Obtenir une référence au bouton
        const startButton = document.getElementById('start-btn');
        if (startButton) {
            startButton.classList.add('btn-loading');
            startButton.disabled = true;
        }
        
        setTimeout(function() {
            // Réinitialiser l'apparence du bouton
            if (startButton) {
                startButton.classList.remove('btn-loading');
                startButton.disabled = false;
            }
            
            // Tenter de réinitialiser le questionnaire si la fonction existe
            if (typeof window.resetQuestionnaire === 'function') {
                try {
                    window.resetQuestionnaire();
                } catch (error) {
                    console.error("Erreur lors de la réinitialisation du questionnaire:", error);
                }
            }
            
            // Naviguer vers la page du questionnaire
            navigateToPage('questionnaire');
        }, 800);
    };
}

// Corriger la navigation dans le questionnaire
function fixQuestionnaireNavigation() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    if (prevButton && typeof window.navigateToPreviousStep !== 'function') {
        prevButton.onclick = function() {
            console.log("Navigation vers l'étape précédente (fonction de secours)");
            // Implémentation basique
            const container = document.getElementById('questions-container');
            if (container) {
                container.innerHTML = '<p class="centered">Chargement de l\'étape précédente...</p>';
                
                // Cette fonction devrait être définie dans questions.js
                if (typeof window.navigateToPreviousStep === 'function') {
                    window.navigateToPreviousStep();
                } else {
                    // Message d'erreur après un délai
                    setTimeout(function() {
                        container.innerHTML = '<p class="centered">Impossible de naviguer vers l\'étape précédente. Veuillez réessayer.</p>';
                    }, 1000);
                }
            }
        };
    }
    
    if (nextButton && typeof window.navigateToNextStep !== 'function') {
        nextButton.onclick = function() {
            console.log("Navigation vers l'étape suivante (fonction de secours)");
            // Implémentation basique
            const container = document.getElementById('questions-container');
            if (container) {
                container.innerHTML = '<p class="centered">Chargement de l\'étape suivante...</p>';
                
                // Cette fonction devrait être définie dans questions.js
                if (typeof window.navigateToNextStep === 'function') {
                    window.navigateToNextStep();
                } else {
                    // Message d'erreur après un délai
                    setTimeout(function() {
                        container.innerHTML = '<p class="centered">Impossible de naviguer vers l\'étape suivante. Veuillez réessayer.</p>';
                        
                        // Ajouter un bouton pour revenir à l'accueil
                        const backButton = document.createElement('button');
                        backButton.className = 'btn';
                        backButton.textContent = 'Retour à l\'accueil';
                        backButton.onclick = function() {
                            navigateToPage('home');
                        };
                        container.appendChild(backButton);
                    }, 1000);
                }
            }
        };
    }
}

// Exécuter la correction de navigation du questionnaire
setTimeout(fixQuestionnaireNavigation, 1000);

// Créer un style pour l'animation de chargement si elle n'existe pas déjà
if (!document.getElementById('spin-animation-style')) {
    const style = document.createElement('style');
    style.id = 'spin-animation-style';
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

console.log("Script de secours chargé et prêt");
