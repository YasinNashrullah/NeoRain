import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi dari Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "testingneorain.firebaseapp.com",
  projectId: "testingneorain",
  storageBucket: "testingneorain.firebasestorage.app",
  messagingSenderId: "185821765622",
  appId: "1:185821765622:web:d515aad0e2f6813a1531d7",
  measurementId: "G-D2VWHMRS8F",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
