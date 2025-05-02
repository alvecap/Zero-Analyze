// === limit-display.js ===
// Composant pour afficher les limites d'utilisation et options premium

/**
 * Crée et affiche une bannière d'information sur les limites d'utilisation
 * @param {Object} limitInfo - Informations sur les limites d'utilisation
 * @param {function} onPremiumClick - Fonction à exécuter lorsque l'utilisateur clique sur le bouton Premium
 */
export function renderLimitInfoBanner(limitInfo, onPremiumClick) {
  // Créer l'élément de bannière s'il n'existe pas
  let bannerElement = document.getElementById('usage-limit-banner');
  if (!bannerElement) {
    bannerElement = document.createElement('div');
    bannerElement.id = 'usage-limit-banner';
    bannerElement.className = 'limit-banner';
    
    // Ajouter au DOM après l'élément de logo ou en haut de l'application
    const appElement = document.getElementById('app');
    if (appElement && appElement.firstChild) {
      appElement.insertBefore(bannerElement, appElement.firstChild.nextSibling);
    } else if (appElement) {
      appElement.appendChild(bannerElement);
    } else {
      document.body.appendChild(bannerElement);
    }
  }
  
  // Si l'utilisateur est premium, afficher les informations premium
  if (limitInfo.isPremium) {
    let expiryDate = 'illimitée';
    if (limitInfo.premiumExpiry) {
      const date = new Date(limitInfo.premiumExpiry);
      expiryDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    
    bannerElement.className = 'limit-banner premium';
    bannerElement.innerHTML = `
      <div class="limit-icon">⭐</div>
      <div class="limit-info">
        <div class="limit-title">Accès Premium</div>
        <div class="limit-subtitle">Prédictions illimitées - Expire le ${expiryDate}</div>
      </div>
    `;
    return;
  }
  
  // Si ce n'est pas un utilisateur premium, afficher les limitations
  const remaining = limitInfo.remaining || 0;
  const dailyLimit = limitInfo.dailyLimit || 6;
  const percentage = Math.round((remaining / dailyLimit) * 100);
  
  let statusClass = '';
  let message = '';
  
  if (percentage <= 0) {
    statusClass = 'danger';
    message = 'Limite atteinte aujourd\'hui';
  } else if (percentage <= 30) {
    statusClass = 'warning';
    message = 'Presque épuisé';
  } else {
    statusClass = 'good';
    message = 'Disponible';
  }
  
  // Mettre à jour le contenu
  bannerElement.className = `limit-banner ${statusClass}`;
  bannerElement.innerHTML = `
    <div class="limit-progress">
      <div class="limit-progress-bar" style="width: ${percentage}%"></div>
    </div>
    <div class="limit-info">
      <div class="limit-title">
        <span class="limit-count">${remaining}/${dailyLimit}</span> prédictions restantes
      </div>
      <div class="limit-subtitle">${message}</div>
    </div>
    <button id="premium-upgrade-btn" class="premium-btn">Premium</button>
  `;
  
  // Ajouter l'écouteur d'événement pour le bouton premium
  const premiumBtn = document.getElementById('premium-upgrade-btn');
  if (premiumBtn && onPremiumClick) {
    premiumBtn.addEventListener('click', onPremiumClick);
  }
}

/**
 * Affiche une modale lorsque la limite quotidienne est atteinte
 * @param {Object} limitInfo - Informations sur les limites d'utilisation
 * @param {function} onPremiumClick - Fonction à exécuter lorsque l'utilisateur clique sur le bouton Premium
 */
export function showLimitReachedModal(limitInfo, onPremiumClick) {
  // Créer la modale
  const modalElement = document.createElement('div');
  modalElement.className = 'limit-modal';
  modalElement.innerHTML = `
    <div class="limit-modal-content">
      <div class="limit-modal-header">
        <h3>Limite de prédictions atteinte</h3>
        <button class="limit-modal-close">&times;</button>
      </div>
      <div class="limit-modal-body">
        <div class="limit-modal-icon">🕒</div>
        <p>Vous avez utilisé toutes vos prédictions gratuites pour aujourd'hui (${limitInfo.dailyLimit || 6}).</p>
        <p>Vos prédictions seront réinitialisées dans <strong>24 heures</strong>.</p>
        <div class="limit-modal-options">
          <button id="limit-premium-btn" class="premium-btn">Passer en premium pour des prédictions illimitées</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la modale au DOM
  document.body.appendChild(modalElement);
  
  // Ajouter les écouteurs d'événements
  const closeBtn = modalElement.querySelector('.limit-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalElement);
    });
  }
  
  const premiumBtn = document.getElementById('limit-premium-btn');
  if (premiumBtn && onPremiumClick) {
    premiumBtn.addEventListener('click', () => {
      document.body.removeChild(modalElement);
      onPremiumClick();
    });
  }
  
  // Fermer la modale en cliquant en dehors
  modalElement.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      document.body.removeChild(modalElement);
    }
  });
}

// === premium-modal.js ===
// Modale pour l'achat d'un abonnement premium

/**
 * Affiche une modale pour l'achat d'un abonnement premium
 * @param {function} onPaymentInitiated - Fonction à exécuter lorsque l'utilisateur initie un paiement
 */
export function showPremiumModal(onPaymentInitiated) {
  // Créer la modale
  const modalElement = document.createElement('div');
  modalElement.className = 'premium-modal';
  modalElement.innerHTML = `
    <div class="premium-modal-content">
      <div class="premium-modal-header">
        <h3>Passez à ZERO ANALYZE Premium</h3>
        <button class="premium-modal-close">&times;</button>
      </div>
      <div class="premium-modal-body">
        <div class="premium-features">
          <div class="premium-feature">
            <div class="premium-feature-icon">♾️</div>
            <div class="premium-feature-text">
              <h4>Prédictions illimitées</h4>
              <p>Aucune restriction quotidienne</p>
            </div>
          </div>
          <div class="premium-feature">
            <div class="premium-feature-icon">🏆</div>
            <div class="premium-feature-text">
              <h4>Accès prioritaire</h4>
              <p>Aux nouvelles fonctionnalités</p>
            </div>
          </div>
          <div class="premium-feature">
            <div class="premium-feature-icon">📊</div>
            <div class="premium-feature-text">
              <h4>Analyse avancée</h4>
              <p>Prédictions détaillées</p>
            </div>
          </div>
        </div>
        
        <div class="premium-pricing">
          <div class="premium-price">10€</div>
          <div class="premium-period">pour un an</div>
        </div>
        
        <button id="premium-payment-btn" class="premium-payment-btn">Passer à Premium</button>
      </div>
    </div>
  `;
  
  // Ajouter la modale au DOM
  document.body.appendChild(modalElement);
  
  // Ajouter les écouteurs d'événements
  const closeBtn = modalElement.querySelector('.premium-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalElement);
    });
  }
  
  const paymentBtn = document.getElementById('premium-payment-btn');
  if (paymentBtn && onPaymentInitiated) {
    paymentBtn.addEventListener('click', () => {
      // Afficher un indicateur de chargement
      paymentBtn.innerHTML = '<span class="loading-dots">Traitement en cours</span>';
      paymentBtn.disabled = true;
      
      // Exécuter la fonction de callback
      onPaymentInitiated().then(result => {
        // La redirection vers la page de paiement sera gérée par la fonction onPaymentInitiated
        if (!result || !result.success) {
          // Si échec, réactiver le bouton
          paymentBtn.innerHTML = 'Passer à Premium';
          paymentBtn.disabled = false;
        }
      }).catch(error => {
        console.error("Erreur lors de l'initialisation du paiement:", error);
        paymentBtn.innerHTML = 'Réessayer';
        paymentBtn.disabled = false;
      });
    });
  }
  
  // Fermer la modale en cliquant en dehors
  modalElement.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      document.body.removeChild(modalElement);
    }
  });
}

// === payment-integration.js ===
// Intégration avec le système de paiement (exemple avec Stripe)

import { initializePayment } from './app-integration';

/**
 * Initialise un processus de paiement Stripe
 * @param {string} userId - ID de l'utilisateur
 * @param {string} telegramId - ID Telegram de l'utilisateur
 */
export async function initializeStripePayment(userId, telegramId) {
  try {
    // Créer une demande de paiement dans Firestore
    const paymentRequest = await initializePayment(userId, telegramId);
    
    if (!paymentRequest || !paymentRequest.id) {
      console.error("Erreur lors de la création de la demande de paiement");
      return { success: false, error: 'payment_request_failed' };
    }
    
    // Rediriger vers Stripe Checkout (URL à configurer sur Render)
    const stripeCheckoutUrl = process.env.STRIPE_CHECKOUT_URL || 'https://votre-backend.com/create-checkout';
    
    // Rediriger vers la page de paiement
    window.location.href = `${stripeCheckoutUrl}?payment_id=${paymentRequest.id}&telegram_id=${telegramId}`;
    
    return { success: true, paymentId: paymentRequest.id };
  } catch (error) {
    console.error("Erreur lors de l'initialisation du paiement Stripe:", error);
    return { success: false, error: 'initialization_failed' };
  }
}

// Vous pouvez ajouter d'autres méthodes de paiement ici
// Par exemple, PayPal, crypto, etc.

// === styles.css ===
// Styles pour les éléments d'interface utilisateur de limite et premium

/* Bannière de limite d'utilisation */
.limit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: var(--border-radius);
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.limit-banner.premium {
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  color: white;
}

.limit-banner.good {
  border-left: 4px solid #10b981;
}

.limit-banner.warning {
  border-left: 4px solid #f59e0b;
}

.limit-banner.danger {
  border-left: 4px solid #ef4444;
}

.limit-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
}

.limit-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #f59e0b);
  transition: width 0.3s ease;
}

.limit-info {
  flex: 1;
}

.limit-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.limit-subtitle {
  font-size: 0.8rem;
  color: #666;
}

.limit-banner.premium .limit-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.limit-icon {
  font-size: 1.5rem;
  margin-right: 10px;
}

.limit-count {
  font-weight: 700;
}

/* Suite du fichier styles.css */
.premium-btn {
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Modale de limite atteinte */
.limit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.limit-modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideInUp 0.4s ease;
}

.limit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.limit-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.limit-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.limit-modal-body {
  padding: 20px;
  text-align: center;
}

.limit-modal-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #f59e0b;
}

.limit-modal-options {
  margin-top: 20px;
}

/* Modale Premium */
.premium-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.premium-modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideInUp 0.4s ease;
}

.premium-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  color: white;
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.premium-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.premium-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
}

.premium-modal-body {
  padding: 20px;
}

.premium-features {
  margin-bottom: 20px;
}

.premium-feature {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: var(--border-radius);
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.premium-feature:hover {
  transform: translateX(5px);
  background-color: #e2e8f0;
}

.premium-feature-icon {
  font-size: 2rem;
  margin-right: 15px;
  color: #6366f1;
}

.premium-feature-text h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.premium-feature-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.premium-pricing {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
}

.premium-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6366f1;
}

.premium-period {
  font-size: 1rem;
  color: #666;
}

.premium-payment-btn {
  display: block;
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  color: white;
  border: none;
  padding: 12px;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
  margin-top: 20px;
}

.premium-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
}

.premium-payment-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { 
    opacity: 0;
    transform: translateY(50px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation de chargement */
.loading-dots::after {
  content: '';
  animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

// === main-integration.js ===
// Intégration principale des services Firebase dans l'application Zero Analyze

import { initializeFirebase, handleTelegramUser, canMakePrediction, logPredictionUsage, getLimitInfo, checkUserPremium } from './app-integration';
import { renderLimitInfoBanner, showLimitReachedModal } from './limit-display';
import { showPremiumModal } from './premium-modal';
import { initializeStripePayment } from './payment-integration';

// Variables pour stocker les informations de l'utilisateur
let currentUser = null;
let limitInfo = null;

/**
 * Initialise l'application avec Firebase et les fonctionnalités premium
 */
export async function initializeApp() {
  // Initialiser Firebase
  const firebaseInitialized = await initializeFirebase();
  if (!firebaseInitialized) {
    console.error("Erreur lors de l'initialisation de Firebase");
    // Continuer quand même, car l'application de base peut fonctionner sans Firebase
  }
  
  // Récupérer les informations de l'utilisateur Telegram
  const telegramApp = window.Telegram?.WebApp;
  if (telegramApp) {
    // Authentifier et récupérer l'utilisateur
    currentUser = await handleTelegramUser(telegramApp);
    
    if (currentUser) {
      // Vérifier le statut premium
      const premiumStatus = await checkUserPremium(currentUser.telegramId);
      
      // Récupérer les informations de limite
      limitInfo = await getLimitInfo(currentUser.telegramId);
      
      // Afficher la bannière d'information
      if (limitInfo) {
        renderLimitInfoBanner(limitInfo, openPremiumModal);
      }
    }
  }
  
  // Remplacer la fonction de soumission du formulaire pour vérifier les limites
  overridePredictionSubmission();
}

/**
 * Remplace la fonction de soumission du formulaire pour vérifier les limites
 */
function overridePredictionSubmission() {
  // Trouver le formulaire ou le bouton de soumission
  const predictionForm = document.getElementById('prediction-form');
  const submitButton = document.getElementById('next-btn');
  
  if (predictionForm) {
    // Remplacer l'événement submit du formulaire
    const originalSubmit = predictionForm.onsubmit;
    predictionForm.onsubmit = async function(event) {
      event.preventDefault();
      
      // Vérifier si l'utilisateur peut faire une prédiction
      if (currentUser && currentUser.telegramId) {
        const predictionCheck = await canMakePrediction(currentUser.telegramId);
        
        if (predictionCheck.canPredict) {
          // L'utilisateur peut faire une prédiction, enregistrer l'utilisation
          await logPredictionUsage(predictionCheck.userRef);
          
          // Mettre à jour les informations de limite
          limitInfo = await getLimitInfo(currentUser.telegramId);
          if (limitInfo) {
            renderLimitInfoBanner(limitInfo, openPremiumModal);
          }
          
          // Exécuter la soumission originale
          if (originalSubmit) {
            originalSubmit.call(this, event);
          }
        } else {
          // L'utilisateur a atteint sa limite
          if (predictionCheck.reason === 'daily_limit_reached') {
            showLimitReachedModal({
              dailyLimit: predictionCheck.dailyLimit,
              usageCount: predictionCheck.usageCount
            }, openPremiumModal);
          }
        }
      } else {
        // Pas d'utilisateur identifié, permettre la prédiction quand même
        if (originalSubmit) {
          originalSubmit.call(this, event);
        }
      }
    };
  } else if (submitButton) {
    // Si pas de formulaire, mais un bouton de soumission
    const originalClick = submitButton.onclick;
    submitButton.onclick = async function(event) {
      // Vérifier si l'utilisateur peut faire une prédiction
      if (currentUser && currentUser.telegramId) {
        const predictionCheck = await canMakePrediction(currentUser.telegramId);
        
        if (predictionCheck.canPredict) {
          // L'utilisateur peut faire une prédiction, enregistrer l'utilisation
          await logPredictionUsage(predictionCheck.userRef);
          
          // Mettre à jour les informations de limite
          limitInfo = await getLimitInfo(currentUser.telegramId);
          if (limitInfo) {
            renderLimitInfoBanner(limitInfo, openPremiumModal);
          }
          
          // Exécuter le clic original
          if (originalClick) {
            return originalClick.call(this, event);
          }
        } else {
          // L'utilisateur a atteint sa limite
          if (predictionCheck.reason === 'daily_limit_reached') {
            showLimitReachedModal({
              dailyLimit: predictionCheck.dailyLimit,
              usageCount: predictionCheck.usageCount
            }, openPremiumModal);
          }
          return false;
        }
      } else {
        // Pas d'utilisateur identifié, permettre la prédiction quand même
        if (originalClick) {
          return originalClick.call(this, event);
        }
      }
    };
  }
}

/**
 * Ouvre la modale Premium
 */
function openPremiumModal() {
  if (!currentUser) {
    console.error("Utilisateur non identifié");
    return;
  }
  
  showPremiumModal(async () => {
    // Initialiser le processus de paiement
    return await initializeStripePayment(currentUser.id, currentUser.telegramId);
  });
}

// === integration-point.js ===
// Point d'entrée pour l'intégration de Firebase dans l'application

import { initializeApp } from './main-integration';

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser l'application avec Firebase
  initializeApp().catch(error => {
    console.error("Erreur lors de l'initialisation de l'application:", error);
  });
});
