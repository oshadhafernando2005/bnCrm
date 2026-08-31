// firebase.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ add this
import { getStorage } from "firebase/storage";





const firebaseConfig = {
  apiKey: "AIzaSyBTqghc3mPii_dXAGIK6vsk3unjWYQ5ZVw",
  authDomain: "briscatax.firebaseapp.com",
  projectId: "briscatax",
  storageBucket: "briscatax.firebasestorage.app",
  messagingSenderId: "396006808063",
  appId: "1:396006808063:web:cd724ee3191b9b6b4e2fca"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app); // ✅ Firestore instance
export const storage = getStorage(app);
