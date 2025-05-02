// telegram-auth.js - Gestion de l'authentification via Telegram WebApp

import firebaseService from './firebase-service.js';

/**
 * Classe pour gérer l'authentification via Telegram
 */
class TelegramAuth {
  constructor() {
    this.telegramApp = null;
    this.authInitialized = false;
    this.userData = null;
  }

  /**
   * Initialise l'authentification Telegram
   * @returns {Promise<boolean>} - Statut d'initialisation
   */
  async initialize() {
    try {
      // Vérifier si Telegram WebApp est disponible
      if (window.Telegram && window.Telegram.WebApp) {
        this.telegramApp = window.Telegram.WebApp;
        
        // Informer Telegram que l'app est prête
        this.telegramApp.ready();
        
        // Expansion de l'app pour utiliser tout l'écran
        if (typeof this.telegramApp.expand === 'function') {
          this.telegramApp.expand();
        }
        
        // Vérifier si des données utilisateur sont disponibles
        if (this.telegramApp.initDataUnsafe && this.telegramApp.initDataUnsafe.user) {
          const telegramUser = this.telegramApp.initDataUnsafe.user;
          
          // Initialiser l'utilisateur dans Firebase
          this.userData = await firebaseService.initializeUser({
            id: telegramUser.id.toString(),
            username: telegramUser.username || '',
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || ''
          });
          
          this.authInitialized = true;
          return true;
        } else {
          console.warn("Données utilisateur Telegram non disponibles");
          return false;
        }
      } else {
        console.warn("Telegram WebApp non disponible");
        return false;
      }
    } catch (error) {
      console.error("Erreur d'initialisation de l'authentification:", error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié via Telegram
   * @returns {boolean} - Statut d'authentification
   */
  isAuthenticated() {
    return this.authInitialized && !!this.userData;
  }

  /**
   * Récupère les données de l'utilisateur authentifié
   * @returns {Object|null} - Données utilisateur ou null
   */
  getUserData() {
    return this.userData;
  }

  /**
   * Récupère l'ID de l'utilisateur Telegram
   * @returns {string|null} - ID utilisateur ou null
   */
  getUserId() {
    return this.userData ? this.userData.id : null;
  }

  /**
   * Récupère le nom complet de l'utilisateur
   * @returns {string} - Nom complet ou "Utilisateur"
   */
  getUserFullName() {
    if (!this.userData) return "Utilisateur";
    
    const firstName = this.userData.first_name || '';
    const lastName = this.userData.last_name || '';
    
    return firstName || lastName 
      ? `${firstName} ${lastName}`.trim() 
      : "Utilisateur";
  }

  /**
   * Vérifie si l'authentification est possible via Telegram
   * @returns {boolean} - Disponibilité de Telegram WebApp
   */
  isTelegramAvailable() {
    return !!(window.Telegram && window.Telegram.WebApp);
  }

  /**
   * Gère l'affichage des erreurs d'authentification
   * @param {HTMLElement} container - Élément où afficher l'erreur
   * @param {string} message - Message d'erreur
   */
  showAuthError(container, message = "Authentification requise pour utiliser cette application.") {
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-message centered">
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
        <p class="error-subtitle">Veuillez ouvrir cette WebApp via Telegram.</p>
      </div>
    `;
  }
}

// Exporter une instance unique
const telegramAuth = new TelegramAuth();
export default telegramAuth;
