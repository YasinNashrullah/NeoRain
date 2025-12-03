import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi dari Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "neorain.firebaseapp.com",
  projectId: "neorain",
  storageBucket: "neorain.firebasestorage.app",
  messagingSenderId: "1088663832972",
  appId: "1:1088663832972:web:3523d3267098a266cbeea9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);