// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Set persistent login for users
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase Auth persistence set to LOCAL"))
  .catch((error) => console.error("❌ Failed to set session persistence:", error));

// Export everything needed
export { 
  firebaseApp, 
  auth, 
  db, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc 
};

export default firebaseApp;
