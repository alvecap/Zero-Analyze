// firebase-config.js - Configuration de Firebase avec gestion des variables d'environnement

// Import des fonctions nécessaires de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Configuration Firebase qui utilise exclusivement des variables d'environnement
 * Ces variables seront définies sur Render pour protéger les informations sensibles
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

/**
 * Initialise Firebase avec la configuration
 * Toutes les clés sensibles sont récupérées uniquement depuis les variables d'environnement de Render
 */
const app = initializeApp(firebaseConfig);

// Export des services Firebase dont nous aurons besoin
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
