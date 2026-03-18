
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TIYATRO_LIST = [
    { ad: "Othello", mekan: "Haşim İşcan Kültür Merkezi", ipucu: "Kıskançlığın trajedisi bu gece sahnede." },
    { ad: "Beklenirken Godot", mekan: "Devlet Tiyatrosu Ana Sahne", ipucu: "Sizi de beklediği şeyden emin olmayan biri var." },
];
const ETKINLIK_LIST = [
    { tur: "Fuar", ad: "Cam Piramit Kitap Fuarı", detay: "Son 2 gün, 11:00–20:00." },
    { tur: "Konser", ad: "Açık Hava Tiyatrosu", detay: "Senfonik Rock, 20:30." },
];

async function migrate() {
    console.log("Migrating Suggestions...");
    const batch = writeBatch(db);
    const ref = doc(collection(db, "settings"), "suggestions");
    batch.set(ref, { tiyatro: TIYATRO_LIST, etkinlik: ETKINLIK_LIST }, { merge: true });
    await batch.commit();
    console.log("Suggestions Migrated!");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
