// prediction-limits.js - Gestion des limites de prédictions quotidiennes

import firebaseService from './firebase-service.js';

/**
 * Utilitaire pour gérer les limites de prédictions
 */
class PredictionLimits {
  constructor() {
    this.DAILY_LIMIT = 6; // Limite quotidienne de prédictions
    this.remainingPredictions = null;
    this.initialized = false;
  }

  /**
   * Initialise le compteur de prédictions pour l'utilisateur courant
   * @param {string} userId - ID de l'utilisateur Telegram
   * @returns {Promise<void>}
   */
  async initialize(userId) {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    try {
      const limitStatus = await firebaseService.checkPredictionLimit(userId);
      this.remainingPredictions = limitStatus.remaining;
      this.initialized = true;
    } catch (error) {
      console.error("Erreur d'initialisation des limites:", error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur peut faire une prédiction supplémentaire
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Statut de la limite avec messages
   */
  async canMakePrediction(userId) {
    if (!this.initialized) {
      await this.initialize(userId);
    }

    try {
      const limitStatus = await firebaseService.checkPredictionLimit(userId);
      this.remainingPredictions = limitStatus.remaining;

      return {
        allowed: limitStatus.canPredict,
        remaining: limitStatus.remaining,
        message: limitStatus.canPredict
          ? `Il vous reste ${limitStatus.remaining} prédiction${limitStatus.remaining > 1 ? 's' : ''} aujourd'hui.`
          : "Vous avez atteint votre limite quotidienne de prédictions. Revenez demain!"
      };
    } catch (error) {
      console.error("Erreur de vérification de limite:", error);
      return {
        allowed: false,
        remaining: 0,
        message: "Impossible de vérifier vos limites de prédictions."
      };
    }
  }

  /**
   * Enregistre une nouvelle prédiction et met à jour le compteur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} predictionData - Données de la prédiction
   * @returns {Promise<Object>} - Résultat avec statut et message
   */
  async recordPrediction(userId, predictionData) {
    if (!userId || !predictionData) {
      throw new Error("Paramètres manquants");
    }

    try {
      // Vérifier la limite avant d'enregistrer
      const limitStatus = await this.canMakePrediction(userId);
      
      if (!limitStatus.allowed) {
        return {
          success: false,
          message: limitStatus.message
        };
      }

      // Enregistrer la prédiction
      const prediction = await firebaseService.savePrediction(userId, predictionData);
      
      // Mettre à jour le compteur local
      this.remainingPredictions = Math.max(0, this.remainingPredictions - 1);
      
      return {
        success: true,
        remaining: this.remainingPredictions,
        message: `Prédiction enregistrée! Il vous reste ${this.remainingPredictions} prédiction${this.remainingPredictions > 1 ? 's' : ''} aujourd'hui.`,
        prediction: prediction
      };
    } catch (error) {
      console.error("Erreur d'enregistrement de prédiction:", error);
      return {
        success: false,
        message: "Impossible d'enregistrer votre prédiction. Veuillez réessayer."
      };
    }
  }

  /**
   * Récupère le nombre de prédictions restantes pour l'utilisateur
   * @returns {number} - Nombre de prédictions restantes
   */
  getRemainingPredictions() {
    return this.remainingPredictions !== null ? this.remainingPredictions : this.DAILY_LIMIT;
  }

  /**
   * Affiche une bannière d'information sur les limites de prédictions
   * @param {HTMLElement} container - Élément où afficher la bannière
   */
  displayLimitBanner(container) {
    if (!container) return;

    const banner = document.createElement('div');
    banner.className = 'limit-banner';
    
    const remaining = this.getRemainingPredictions();
    const hasLimit = remaining < this.DAILY_LIMIT;
    
    banner.innerHTML = `
      <div class="limit-icon">${hasLimit ? '⚠️' : '✅'}</div>
      <div class="limit-text">
        <p>${hasLimit 
          ? `Il vous reste ${remaining} prédiction${remaining > 1 ? 's' : ''} aujourd'hui.` 
          : `Vous disposez de ${this.DAILY_LIMIT} prédictions quotidiennes.`}
        </p>
      </div>
    `;
    
    container.appendChild(banner);
  }
}

// Exporter une instance unique
const predictionLimits = new PredictionLimits();
export default predictionLimits;
