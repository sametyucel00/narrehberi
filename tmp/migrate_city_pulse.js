
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const EVENTS = [
    { id: "t1", kat: "Tiyatro", icon: "🎭", isim: "Othello", yer: "Haşim İşcan Kültür Merkezi", tarih: "Her Cuma–Cumartesi", saat: "20:30", tel: "0242 243 60 26", maps: "Haşim İşcan Kültür Merkezi Antalya", not: "Kıskançlığın trajedisi — bilet sınırlı.", ay: [1, 2, 3, 11, 12] },
    { id: "t2", kat: "Tiyatro", icon: "🎭", isim: "Bekleme Odası", yer: "Devlet Tiyatrosu Ana Sahne", tarih: "Çarşamba–Perşembe", saat: "20:00", tel: "0242 243 60 26", maps: "Antalya Devlet Tiyatrosu", not: "Günümüz insanının aynası.", ay: [1, 2, 3, 10, 11, 12] },
    { id: "t3", kat: "Tiyatro", icon: "🎭", isim: "Medea", yer: "Atatürk Kültür Merkezi", tarih: "Cumartesi", saat: "20:30", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Sevginin en karanlık yüzü.", ay: [2, 3, 11, 12] },
    { id: "k1", kat: "Konser", icon: "🎵", isim: "Boğaziçi Caz Festivali – Antalya", yer: "Karaalioğlu Parkı Açık Sahne", tarih: "15–18 Mayıs", saat: "20:30", tel: "0242 249 17 47", maps: "Karaalioğlu Parkı Antalya", not: "Ücretsiz giriş. Açık hava.", ay: [5] },
    { id: "k2", kat: "Konser", icon: "🎸", isim: "Antalya Müzik Festivali", yer: "Aspendos Antik Tiyatro", tarih: "Temmuz", saat: "21:00", tel: "0242 735 10 34", maps: "Aspendos Antik Tiyatro Antalya", not: "Antik taşların altında müzik.", ay: [7] },
    { id: "k3", kat: "Konser", icon: "🎻", isim: "Devlet Senfoni Orkestrası", yer: "Atatürk Kültür Merkezi", tarih: "Her ay 1. Cumartesi", saat: "20:00", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Klasik müziğin başkenti.", ay: [1, 2, 3, 4, 5, 10, 11, 12] },
    { id: "k4", kat: "Konser", icon: "🥁", isim: "Antalya Caz Günleri", yer: "Kaleiçi Yat Limanı", tarih: "Haziran", saat: "20:00", tel: "0242 249 17 47", maps: "Kaleiçi Yat Limanı Antalya", not: "Tekne manzaralı açık hava sahnesinde caz.", ay: [6] },
    { id: "f1", kat: "Fuar", icon: "📚", isim: "Antalya Kitap Fuarı", yer: "Cam Piramit Kültür Merkezi", tarih: "Ocak sonu", saat: "10:00–20:00", tel: "0242 249 17 47", maps: "Cam Piramit Kültür Merkezi Antalya", not: "100+ yayınevi, imza günleri.", ay: [1] },
    { id: "f2", kat: "Fuar", icon: "🏡", isim: "Yörex Yöresel Ürünler Fuarı", yer: "Antalya Fuar Merkezi", tarih: "Mart", saat: "10:00–19:00", tel: "0242 316 00 00", maps: "Antalya Fuar Merkezi", not: "Türkiye'nin en büyük yöresel ürün fuarı.", ay: [3] },
    { id: "fe1", kat: "Festival", icon: "🎬", isim: "Altın Portakal Film Festivali", yer: "Atatürk Kültür Merkezi", tarih: "Ekim", saat: "Çeşitli", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Türkiye'nin en prestijli film festivali.", ay: [10] },
    { id: "fe2", kat: "Festival", icon: "🍊", isim: "Uluslararası Narenciye Festivali", yer: "Kepez Atatürk Meydanı", tarih: "Ocak", saat: "Tüm gün", tel: "0242 311 11 11", maps: "Kepez Atatürk Meydanı Antalya", not: "Şehrin rengi ve kokusu.", ay: [1] },
    { id: "fe3", kat: "Festival", icon: "🌊", isim: "Su Sporları Festivali", yer: "Konyaaltı Sahili", tarih: "Temmuz", saat: "09:00–18:00", tel: "0242 249 17 47", maps: "Konyaaltı Sahili Antalya", not: "Jet ski, sörf, parasailing gösterileri.", ay: [7] },
    { id: "fe4", kat: "Festival", icon: "🎪", isim: "Uluslararası Opera Festivali", yer: "Aspendos Antik Tiyatro", tarih: "Eylül", saat: "21:00", tel: "0242 735 10 34", maps: "Aspendos Antik Tiyatro Antalya", not: "Dünyanın en güzel sahnelerinden birinde opera.", ay: [9] },
    { id: "s1", kat: "Spor", icon: "🏃", isim: "Antalya Maratonu", yer: "Konyaaltı – Falezler", tarih: "Mart", saat: "08:00", tel: "0242 249 17 47", maps: "Konyaaltı Sahili Antalya", not: "Deniz manzaralı 42km.", ay: [3] },
    { id: "s2", kat: "Spor", icon: "⛷️", isim: "Saklıkent Kayak Sezonu", yer: "Saklıkent Kayak Merkezi", tarih: "Aralık–Mart", saat: "09:00–17:00", tel: "0242 744 30 50", maps: "Saklıkent Kayak Merkezi Antalya", not: "Denize 45dk, karda 1 gün.", ay: [12, 1, 2, 3] },
    { id: "s3", kat: "Spor", icon: "🚴", isim: "Likya Yolu Bisiklet Turu", yer: "Kalkan – Antalya", tarih: "Ekim–Kasım", saat: "Çok günlü", tel: "0242 249 17 47", maps: "Likya Yolu Antalya", not: "Türkiye'nin en güzel sahil bisiklet rotası.", ay: [10, 11] },
];

const SERVICES = [
    { id: "h1", kat: "Hastane", icon: "🏥", isim: "Akdeniz Üni. Hastanesi – Acil", tel: "0242 249 60 00", maps: "Akdeniz Üniversitesi Hastanesi Antalya acil", acil: true, renk: "#e05555" },
    { id: "h2", kat: "Hastane", icon: "🏥", isim: "Antalya Şehir Hastanesi – Acil", tel: "0242 276 50 00", maps: "Antalya Şehir Hastanesi acil", acil: true, renk: "#e05555" },
    { id: "h3", kat: "Hastane", icon: "🏥", isim: "Eğitim & Araştırma Hastanesi", tel: "0242 249 44 00", maps: "Antalya Eğitim Araştırma Hastanesi", acil: false, renk: "#c04444" },
    { id: "h4", kat: "Hastane", icon: "🏥", isim: "Özel Medline Hastanesi", tel: "0242 314 44 44", maps: "Medline Hastanesi Antalya", acil: false, renk: "#c04444" },
    { id: "e1", kat: "Eczane", icon: "💊", isim: "Nöbetçi Eczane – Resmi Liste", tel: "182", maps: "nöbetçi eczane antalya", acil: true, renk: "#44aa66" },
    { id: "v1", kat: "Veteriner", icon: "🐾", isim: "Antalya Veteriner Acil Klinik", tel: "0242 502 05 05", maps: "acil veteriner antalya 7/24", acil: true, renk: "#8877cc" },
    { id: "v2", kat: "Veteriner", icon: "🐾", isim: "Akdeniz Veteriner Kliniği", tel: "0242 311 22 33", maps: "veteriner kliniği antalya", acil: false, renk: "#8877cc" },
    { id: "c1", kat: "Yol Yardım", icon: "🚗", isim: "7/24 Oto Çekici Antalya", tel: "0542 777 88 99", maps: "oto çekici antalya 7/24", acil: true, renk: "#cc8833" },
    { id: "c2", kat: "Yol Yardım", icon: "🔧", isim: "Lastik & Yol Yardım", tel: "0532 444 55 66", maps: "yol yardım lastik antalya", acil: false, renk: "#cc8833" },
    { id: "ch1", kat: "Çilingir", icon: "🔑", isim: "7/24 Çilingir Antalya", tel: "0544 333 22 11", maps: "çilingir antalya 7/24 gece", acil: true, renk: "#d4af37" },
];

async function migrate() {
    console.log("Migrating events...");
    for (const e of EVENTS) {
        await addDoc(collection(db, "city_pulse"), { ...e, type: "event", active: true });
    }
    console.log("Migrating services...");
    for (const s of SERVICES) {
        await addDoc(collection(db, "city_pulse"), { ...s, type: "service", active: true });
    }
    console.log("Done!");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
