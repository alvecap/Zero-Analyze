// firebase-service.js - Service pour gérer les interactions avec Firebase

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp 
} from "firebase/firestore";
import { 
  signInWithCustomToken, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth } from "./firebase-config.js";

// Constantes
const USERS_COLLECTION = "users";
const PREDICTIONS_COLLECTION = "predictions";
const DAILY_PREDICTION_LIMIT = 6;

/**
 * Service Firebase pour gérer les utilisateurs et les prédictions
 */
class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    
    // Observer les changements d'état d'authentification
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.isInitialized = true;
    });
  }

  /**
   * Initialise l'utilisateur dans Firestore s'il n'existe pas déjà
   * @param {Object} userData - Données utilisateur de Telegram
   * @returns {Promise<Object>} - Données utilisateur
   */
  async initializeUser(userData) {
    if (!userData || !userData.id) {
      throw new Error("Données utilisateur invalides");
    }

    const userRef = doc(db, USERS_COLLECTION, userData.id.toString());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Utilisateur existant - mettre à jour les dernières infos
      const existingData = userSnap.data();
      await updateDoc(userRef, {
        last_login: serverTimestamp(),
        username: userData.username || existingData.username,
        first_name: userData.first_name || existingData.first_name,
        last_name: userData.last_name || existingData.last_name
      });
      
      return { ...existingData, id: userData.id };
    } else {
      // Nouvel utilisateur - créer un profil
      const newUser = {
        id: userData.id,
        username: userData.username || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        created_at: serverTimestamp(),
        last_login: serverTimestamp(),
        prediction_count: 0,
        predictions_today: 0,
        last_prediction_date: null
      };
      
      await setDoc(userRef, newUser);
      return newUser;
    }
  }

  /**
   * Authentifie l'utilisateur avec le token Telegram
   * @param {string} token - Token d'authentification Telegram
   * @returns {Promise<Object>} - Utilisateur authentifié
   */
  async authenticateUser(token) {
    try {
      return await signInWithCustomToken(auth, token);
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      throw error;
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   * @returns {Promise<void>}
   */
  async signOutUser() {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur peut faire une prédiction aujourd'hui
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Statut de la limite avec nombre restant
   */
  async checkPredictionLimit(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId.toString());
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("Utilisateur non trouvé");
      }
      
      const userData = userSnap.data();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      // Si la dernière prédiction date d'avant aujourd'hui, réinitialiser le compteur
      if (!userData.last_prediction_date || 
          new Date(userData.last_prediction_date.toDate()).getTime() < today) {
        await updateDoc(userRef, {
          predictions_today: 0
        });
        return { 
          canPredict: true, 
          remaining: DAILY_PREDICTION_LIMIT 
        };
      }
      
      // Vérifier si l'utilisateur a atteint la limite
      const predictionsToday = userData.predictions_today || 0;
      const remaining = DAILY_PREDICTION_LIMIT - predictionsToday;
      
      return {
        canPredict: remaining > 0,
        remaining: remaining
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de la limite:", error);
      throw error;
    }
  }

  /**
   * Enregistre une nouvelle prédiction pour l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} predictionData - Données de la prédiction
   * @returns {Promise<Object>} - Prédiction enregistrée avec ID
   */
  async savePrediction(userId, predictionData) {
    try {
      // Vérifier la limite quotidienne
      const limitStatus = await this.checkPredictionLimit(userId);
      if (!limitStatus.canPredict) {
        throw new Error("Limite quotidienne de prédictions atteinte");
      }
      
      // Référence utilisateur
      const userRef = doc(db, USERS_COLLECTION, userId.toString());
      
      // Créer la prédiction
      const predictionRef = doc(collection(db, PREDICTIONS_COLLECTION));
      const timestamp = serverTimestamp();
      
      const prediction = {
        id: predictionRef.id,
        user_id: userId,
        created_at: timestamp,
        ...predictionData
      };
      
      // Enregistrer la prédiction
      await setDoc(predictionRef, prediction);
      
      // Mettre à jour le compteur de l'utilisateur
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      await updateDoc(userRef, {
        prediction_count: (userData.prediction_count || 0) + 1,
        predictions_today: (userData.predictions_today || 0) + 1,
        last_prediction_date: timestamp
      });
      
      return prediction;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la prédiction:", error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des prédictions d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {number} limit - Nombre maximal de prédictions à récupérer
   * @returns {Promise<Array>} - Liste des prédictions
   */
  async getUserPredictions(userId, limit = 10) {
    try {
      const predictionsQuery = query(
        collection(db, PREDICTIONS_COLLECTION),
        where("user_id", "==", userId),
        // orderBy("created_at", "desc") // Nécessite un index dans Firestore
      );
      
      const querySnapshot = await getDocs(predictionsQuery);
      const predictions = [];
      
      querySnapshot.forEach((doc) => {
        predictions.push(doc.data());
      });
      
      // Trier manuellement par date (alternative à orderBy qui nécessite un index)
      predictions.sort((a, b) => {
        return b.created_at.seconds - a.created_at.seconds;
      });
      
      // Limiter le nombre de résultats
      return predictions.slice(0, limit);
    } catch (error) {
      console.error("Erreur lors de la récupération des prédictions:", error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} - Statut de connexion
   */
  isUserLoggedIn() {
    return !!this.currentUser;
  }

  /**
   * Récupère l'utilisateur actuel
   * @returns {Object|null} - Utilisateur actuel ou null
   */
  getCurrentUser() {
    return this.currentUser;
  }
}

// Exporter une instance unique du service
const firebaseService = new FirebaseService();
export default firebaseService;
