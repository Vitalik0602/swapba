// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// ←←←←← ВСТАВЬ СВОИ ДАННЫЕ ИЗ FIREBASE CONSOLE ←←←←←
const firebaseConfig = {
  apiKey: "AIzaSyBF8yD01Mz7JmzvLg32ornkr6MZZBfpS48",
  authDomain: "swapix-d20e6.firebaseapp.com",
  projectId: "swapix-d20e6",
  storageBucket: "swapix-d20e6.firebasestorage.app",
  messagingSenderId: "510676268001",
  appId: "1:510676268001:web:0c6eff84d8436447e258a0",
  measurementId: "G-7LD6FJEQ1G"
};
// ←←←←← ←←←←← ←←←←← ←←←←← ←←←←← ←←←←← ←←←←←

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);