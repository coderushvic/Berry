// ✅ Import the functions you need from the SDKs
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase configuration (ensure these are set in your .env file)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// ✅ Initialize Firebase (prevent duplicate initialization)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// ✅ Set persistent login for users
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase Auth persistence set to LOCAL"))
  .catch((error) => console.error("❌ Failed to set session persistence:", error));

// ✅ Export all Firebase services and helpers
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
