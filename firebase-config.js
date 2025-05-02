// firebase-config.js
// Configuration et initialisation complète de Firebase pour Zero Analyze

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Configuration Firebase - utilise des variables d'environnement sur Render
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Variables pour les services Firebase
let app;
let db;
let auth;
let analytics;
let functions;

/**
 * Initialise tous les services Firebase nécessaires
 * @returns {Object} Les services initialisés
 */
export const initializeFirebase = () => {
  try {
    // Initialiser l'application Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialiser Firestore
    db = getFirestore(app);
    
    // Initialiser Authentication
    auth = getAuth(app);
    
    // Initialiser Analytics si disponible (uniquement en production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      try {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics initialisé");
      } catch (analyticsError) {
        console.warn("Firebase Analytics non disponible:", analyticsError);
      }
    }
    
    // Initialiser Cloud Functions
    functions = getFunctions(app);
    
    // Connecter aux émulateurs en développement local
    if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATORS === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log("Connecté aux émulateurs Firebase");
      } catch (emulatorError) {
        console.warn("Échec de connexion aux émulateurs:", emulatorError);
      }
    }
    
    console.log("Firebase initialisé avec succès");
    return { app, db, auth, analytics, functions };
  } catch (error) {
    console.error("Erreur critique lors de l'initialisation de Firebase:", error);
    // Réessayer avec une configuration de secours en cas d'erreur
    return initializeFallbackFirebase();
  }
};

/**
 * Initialisation de secours en cas d'échec de l'initialisation principale
 * Utilise une configuration minimaliste pour assurer un fonctionnement de base
 */
const initializeFallbackFirebase = () => {
  try {
    const fallbackConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID
    };
    
    app = initializeApp(fallbackConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    console.warn("Firebase initialisé en mode secours (fonctionnalités limitées)");
    return { app, db, auth, analytics: null, functions: null };
  } catch (fallbackError) {
    console.error("Échec critique de l'initialisation Firebase de secours:", fallbackError);
    return { app: null, db: null, auth: null, analytics: null, functions: null };
  }
};

/**
 * Authentifie l'utilisateur de manière anonyme
 * @param {string} telegramId - ID Telegram de l'utilisateur pour le lier au compte anonyme
 * @returns {Promise<Object>} Informations sur l'utilisateur authentifié
 */
export const authenticateAnonymously = async (telegramId = null) => {
  try {
    if (!auth) throw new Error("Service d'authentification non initialisé");
    
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    // Lier l'ID Telegram au compte anonyme si disponible
    if (telegramId && analytics) {
      try {
        // Enregistrer l'association dans Analytics
        logEvent(analytics, 'user_authenticated', {
          telegramId: telegramId,
          authMethod: 'anonymous'
        });
        
        // Stocker l'ID Telegram dans les propriétés utilisateur
        // Note: ceci est uniquement pour Analytics, pas pour l'authentification
        // Pour une véritable authentification liée à Telegram, il faudrait utiliser
        // des fonctions Cloud Firebase personnalisées
      } catch (analyticsError) {
        console.warn("Erreur lors de l'enregistrement Analytics:", analyticsError);
      }
    }
    
    return {
      uid: user.uid,
      isAnonymous: user.isAnonymous,
      createdAt: user.metadata.creationTime,
      lastLoginAt: user.metadata.lastSignInTime
    };
  } catch (error) {
    console.error("Erreur d'authentification anonyme:", error);
    
    // Retourner un objet avec des informations d'erreur structurées
    return {
      error: true,
      code: error.code || 'unknown',
      message: error.message || "Échec de l'authentification",
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Déconnecte l'utilisateur et nettoie les ressources Firebase
 */
export const cleanupFirebase = async () => {
  try {
    if (auth) {
      await auth.signOut();
    }
    
    // Autres opérations de nettoyage si nécessaire
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du nettoyage Firebase:", error);
    return { success: false, error: error.message };
  }
};

// Exporter tous les services et fonctions
export { app, db, auth, analytics, functions };
