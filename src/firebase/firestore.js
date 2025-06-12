// Import only the necessary functions from the Firebase SDK
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore"; // Add missing Firestore imports

// Add the Web App's Firebase configuration.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY, // Ensure this is set correctly
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID, // Make sure this is not undefined
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0]; // Use the existing app
}

// Export Firebase services and Firestore functions
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export { collection, getDocs, query, where, updateDoc, doc }; // Export necessary Firestore functions
export default firebaseApp;