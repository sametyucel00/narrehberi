// Firebase SDK'larını projeye dahil ediyoruz
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Nar Rehberi Pro Firebase Yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyDVrufUynAnWdA7dBZ7PZjXYK6WcslU9r8",
    authDomain: "nar-rehberi-pro.firebaseapp.com",
    databaseURL: "https://nar-rehberi-pro-default-rtdb.firebaseio.com",
    projectId: "nar-rehberi-pro",
    storageBucket: "nar-rehberi-pro.firebasestorage.app",
    messagingSenderId: "712568563076",
    appId: "1:712568563076:web:a9c6f80d4ba8f5f4fe29d1",
    measurementId: "G-60H45904M0"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Diğer servisleri dışa aktarıyoruz (ileride kullanmak üzere hazır)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
