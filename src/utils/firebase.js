// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace this config with your own from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB-WyIo4M3ek20E9iP1Y7UnXmXr23QMakY",
  authDomain: "incomes-e8d4d.firebaseapp.com",
  projectId: "incomes-e8d4d",
  storageBucket: "incomes-e8d4d.firebasestorage.app",
  messagingSenderId: "1025937037623",
  appId: "1:1025937037623:web:5474d1305ee4ee8d2522b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

