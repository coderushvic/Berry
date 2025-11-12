// Import necessary Firebase SDK functions
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// ✅ Export everything (including firebaseApp)
export {
  firebaseApp,
  auth,
  db,
  storage,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
};

export default firebaseApp;
