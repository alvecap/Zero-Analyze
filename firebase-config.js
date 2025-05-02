// === firebase-config.js ===
// Configuration et initialisation de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Configuration Firebase - utilisez des variables d'environnement sur Render
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Obtenir les instances de Firestore et Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Fonction pour authentifier l'utilisateur de manière anonyme
const authenticateAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return null;
  }
};

export { app, db, auth, authenticateAnonymously };

// === user-service.js ===
// Gestion des utilisateurs et des limites d'utilisation
import { db } from './firebase-config';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, 
  doc, getDoc, serverTimestamp, increment
} from 'firebase/firestore';

// Vérifier si l'utilisateur existe ou le créer si nécessaire
export const checkOrCreateUser = async (telegramUser) => {
  if (!telegramUser || !telegramUser.id) {
    console.error("Données utilisateur Telegram manquantes");
    return null;
  }
  
  try {
    const telegramId = telegramUser.id.toString();
    
    // Chercher l'utilisateur par son ID Telegram
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', telegramId));
    const querySnapshot = await getDocs(q);
    
    // Si l'utilisateur existe, retourner ses données
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Mise à jour de la date de dernier accès
      await updateDoc(userDoc.ref, {
        lastAccessedAt: serverTimestamp()
      });
      
      return {
        id: userDoc.id,
        ...userData
      };
    }
    
    // Si l'utilisateur n'existe pas, le créer
    const isAdmin = telegramId === process.env.ADMIN_TELEGRAM_ID;
    const newUser = {
      telegramId: telegramId,
      username: telegramUser.username || '',
      firstName: telegramUser.first_name || '',
      createdAt: serverTimestamp(),
      dailyLimit: 6,  // Limite modifiée à 6 comme demandé
      usageCount: 0,
      lastResetDate: serverTimestamp(),
      isAdmin: isAdmin,
      isPremium: false,
      premiumExpiry: null,
      lastAccessedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(usersRef, newUser);
    return {
      id: docRef.id,
      ...newUser
    };
  } catch (error) {
    console.error("Erreur lors de la vérification/création de l'utilisateur:", error);
    return null;
  }
};

// Vérifier si l'utilisateur peut faire une prédiction
export const checkUserCanPredict = async (telegramId) => {
  try {
    // Rechercher l'utilisateur
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', telegramId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { canPredict: false, reason: 'user_not_found' };
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Si admin ou premium, pas de limite
    if (userData.isAdmin || (userData.isPremium && new Date(userData.premiumExpiry?.toDate()) > new Date())) {
      return { canPredict: true, userRef: userDoc.ref };
    }
    
    // Vérifier si le compteur quotidien doit être réinitialisé
    const lastReset = userData.lastResetDate?.toDate() || new Date(0);
    const now = new Date();
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 1) {
      // Réinitialiser le compteur quotidien
      await updateDoc(userDoc.ref, {
        usageCount: 0,
        lastResetDate: serverTimestamp()
      });
      return { canPredict: true, userRef: userDoc.ref, remaining: userData.dailyLimit };
    }
    
    // Vérifier si la limite quotidienne est atteinte
    if (userData.usageCount >= userData.dailyLimit) {
      return {
        canPredict: false,
        reason: 'daily_limit_reached',
        usageCount: userData.usageCount,
        dailyLimit: userData.dailyLimit,
        userRef: userDoc.ref
      };
    }
    
    // L'utilisateur peut faire une prédiction
    return { 
      canPredict: true, 
      userRef: userDoc.ref,
      remaining: userData.dailyLimit - userData.usageCount
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des droits:", error);
    return { canPredict: false, reason: 'error' };
  }
};

// Incrémenter le compteur d'utilisation
export const incrementUsageCount = async (userRef, predictionType = 'standard') => {
  try {
    // Incrémenter le compteur
    await updateDoc(userRef, {
      usageCount: increment(1)
    });
    
    // Ajouter un log d'utilisation
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    await addDoc(collection(db, 'usageLogs'), {
      userId: userRef.id,
      telegramId: userData.telegramId,
      timestamp: serverTimestamp(),
      predictionType: predictionType
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du compteur:", error);
    return false;
  }
};

// Vérifier les informations sur l'utilisation quotidienne
export const getUserLimitInfo = async (telegramId) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', telegramId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userData = querySnapshot.docs[0].data();
    const lastReset = userData.lastResetDate?.toDate() || new Date(0);
    const now = new Date();
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    
    // Réinitialiser le compteur si nécessaire
    if (daysSinceReset >= 1) {
      await updateDoc(querySnapshot.docs[0].ref, {
        usageCount: 0,
        lastResetDate: serverTimestamp()
      });
      
      return {
        dailyLimit: userData.dailyLimit,
        usageCount: 0,
        remaining: userData.dailyLimit,
        isPremium: userData.isPremium,
        premiumExpiry: userData.premiumExpiry?.toDate()
      };
    }
    
    return {
      dailyLimit: userData.dailyLimit,
      usageCount: userData.usageCount,
      remaining: userData.dailyLimit - userData.usageCount,
      isPremium: userData.isPremium,
      premiumExpiry: userData.premiumExpiry?.toDate()
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de limite:", error);
    return null;
  }
};

// === payment-service.js ===
// Gestion des paiements et abonnements premium
import { db } from './firebase-config';
import { 
  collection, addDoc, updateDoc, query, where, 
  getDocs, serverTimestamp, Timestamp, doc
} from 'firebase/firestore';

// Créer une demande de paiement
export const createPaymentRequest = async (userId, telegramId, amount = 10, currency = 'EUR') => {
  try {
    const paymentData = {
      userId,
      telegramId,
      amount,
      currency,
      status: 'pending',
      createdAt: serverTimestamp(),
      completedAt: null,
      paymentMethod: 'stripe', // ou 'paypal' ou autre
      premium: {
        startDate: null,
        endDate: null
      }
    };
    
    const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
    return {
      id: paymentRef.id,
      ...paymentData
    };
  } catch (error) {
    console.error("Erreur lors de la création de la demande de paiement:", error);
    return null;
  }
};

// Mettre à jour le statut de paiement
export const updatePaymentStatus = async (paymentId, status, paymentDetails = {}) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      return { success: false, error: 'payment_not_found' };
    }
    
    const paymentData = paymentDoc.data();
    
    // Si le paiement est complété, activer l'abonnement premium
    if (status === 'completed') {
      const now = new Date();
      const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      // Mettre à jour le paiement
      await updateDoc(paymentRef, {
        status: status,
        completedAt: serverTimestamp(),
        'premium.startDate': Timestamp.fromDate(now),
        'premium.endDate': Timestamp.fromDate(oneYearLater),
        ...paymentDetails
      });
      
      // Mettre à jour l'utilisateur
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('telegramId', '==', paymentData.telegramId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          isPremium: true,
          premiumExpiry: Timestamp.fromDate(oneYearLater)
        });
      }
      
      return { success: true, status: 'completed', expiryDate: oneYearLater };
    }
    
    // Si le paiement a échoué ou est annulé
    await updateDoc(paymentRef, {
      status: status,
      ...paymentDetails
    });
    
    return { success: true, status: status };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de paiement:", error);
    return { success: false, error: 'update_failed' };
  }
};

// Vérifier si un utilisateur est premium
export const checkPremiumStatus = async (telegramId) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', telegramId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { isPremium: false, reason: 'user_not_found' };
    }
    
    const userData = querySnapshot.docs[0].data();
    
    // Si l'utilisateur est premium et que l'abonnement n'a pas expiré
    if (userData.isPremium && userData.premiumExpiry) {
      const expiryDate = userData.premiumExpiry.toDate();
      const now = new Date();
      
      if (expiryDate > now) {
        return { 
          isPremium: true, 
          expiryDate: expiryDate,
          daysLeft: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
        };
      } else {
        // L'abonnement a expiré, mettre à jour l'utilisateur
        await updateDoc(querySnapshot.docs[0].ref, {
          isPremium: false
        });
        
        return { isPremium: false, reason: 'expired' };
      }
    }
    
    return { isPremium: false };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut premium:", error);
    return { isPremium: false, error: 'check_failed' };
  }
};

// === app-integration.js ===
// Intégration des services Firebase dans l'application Zero Analyze
import { authenticateAnonymously } from './firebase-config';
import { checkOrCreateUser, checkUserCanPredict, incrementUsageCount, getUserLimitInfo } from './user-service';
import { createPaymentRequest, updatePaymentStatus, checkPremiumStatus } from './payment-service';

// Initialiser Firebase au démarrage de l'application
export const initializeFirebase = async () => {
  try {
    // Authentifier l'utilisateur de manière anonyme
    const user = await authenticateAnonymously();
    if (!user) {
      console.error("Échec de l'authentification Firebase anonyme");
      return false;
    }
    
    console.log("Firebase initialisé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
    return false;
  }
};

// Gérer l'utilisateur Telegram au démarrage
export const handleTelegramUser = async (telegramApp) => {
  if (!telegramApp || !telegramApp.initDataUnsafe || !telegramApp.initDataUnsafe.user) {
    console.error("Données Telegram manquantes");
    return null;
  }
  
  const telegramUser = telegramApp.initDataUnsafe.user;
  const user = await checkOrCreateUser(telegramUser);
  
  return user;
};

// Vérifier si l'utilisateur peut effectuer une prédiction
export const canMakePrediction = async (telegramId) => {
  const result = await checkUserCanPredict(telegramId);
  return result;
};

// Enregistrer une utilisation de prédiction
export const logPredictionUsage = async (userRef, type = 'standard') => {
  return await incrementUsageCount(userRef, type);
};

// Obtenir les informations de limite d'utilisation
export const getLimitInfo = async (telegramId) => {
  return await getUserLimitInfo(telegramId);
};

// Initialiser un processus de paiement
export const initializePayment = async (userId, telegramId) => {
  const paymentRequest = await createPaymentRequest(userId, telegramId);
  return paymentRequest;
};

// Vérifier le statut premium
export const checkUserPremium = async (telegramId) => {
  return await checkPremiumStatus(telegramId);
};
