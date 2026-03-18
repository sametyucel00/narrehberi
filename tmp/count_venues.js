
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function count() {
    const snap = await getDocs(collection(db, "venues"));
    console.log("Venues count:", snap.size);
    process.exit(0);
}

count().catch(console.error);
