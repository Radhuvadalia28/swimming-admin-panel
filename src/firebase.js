// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCtKYznC7W78G3SwCLGK_a1VCnh5eTzhx0",
  authDomain: "swimming-academy-admin.firebaseapp.com",
  projectId: "swimming-academy-admin",
  storageBucket: "swimming-academy-admin.firebasestorage.app",
  messagingSenderId: "899183227862",
  appId: "1:899183227862:web:b64781fad1a10898c66a77"
  };
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
// Firebase configuration with direct API keys
  