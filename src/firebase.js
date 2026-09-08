// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0baB40XbbWhvQ-TjGJsVltfbphBPFD2Q",
  authDomain: "solar-calculator-rjb2026-cb70e.firebaseapp.com",
  projectId: "solar-calculator-rjb2026-cb70e",
  storageBucket: "solar-calculator-rjb2026-cb70e.firebasestorage.app",
  messagingSenderId: "726077454639",
  appId: "1:726077454639:web:9fa326b42e69b238ba89da",
  measurementId: "G-FVN5YNT2ND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);