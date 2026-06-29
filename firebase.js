import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
export const firebaseConfig = {
  apiKey: "AIzaSyD15CXLJd4P79dzVMUjhlLy8XcaAa5aqT0",
  authDomain: "hungryhubb-7d34c.firebaseapp.com",
  projectId: "hungryhubb-7d34c",
  storageBucket: "hungryhubb-7d34c.firebasestorage.app",
  messagingSenderId: "209695043853",
  appId: "1:209695043853:web:460b856b0bb7ce661ec044",
  measurementId: "G-SPWE7BBGEQ"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
