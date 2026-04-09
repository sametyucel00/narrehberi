/**
 * Ã¢•"Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•- 
 * Ã¢•'  NAR REHBERİ Ã¢â‚¬" ANA UYGULAMA v4                                   Ã¢•'
 * Ã¢•'  Ã¢Å“... Onboarding: HoÃ…Å¸ Geldiniz Ã¢â€ ' Dil Ã¢â€ ' Konum (3 adÃ„Â±m)             Ã¢•'
 * ?  ?? Hero Arama: "Ne Ar?yorsun Kadir?" + BUL butonu          ?
 * Ã¢•'  Ã¢Å“... TimeSuggestion: "Ãƒ- Ã„ÂLE YAKLAÃ…ÂIYOR" atmosfer kartÃ„Â±             Ã¢•'
 * Ã¢•'  Ã¢Å“... NarHeader: Premium gradient + YÃƒ- NETÃ„Â°M                        Ã¢•'
 * Ã¢•'  Ã¢Å“... YÃƒ- NETÃ„Â°M EKLENDÃ„Â°: DT_ADMIN (Sinopsis) & MASTER Panelleri      Ã¢•'
 * Ã¢•'  SRC/App.jsx olarak kullan                                       Ã¢•'
 * Ã¢•Å¡Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "./services/firebase";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import KategoriVitrin from "./components/KategoriVitrin.jsx";
import logo from "./assets/logo.png";

// Firebase functions are now imported directly above




// --- YÃƒ- NETÃ„Â°M PANELLERÃ„Â° Ã„Â°Ãƒâ€¡Ã„Â°N EKLENEN Ã„Â°MPORTLAR ---
import AuthGateway from "./components/AuthGateway.jsx";
import RotatingLogo from "./components/RotatingLogo.jsx";
import TheaterAdminPanel from "./components/TheaterAdminPanel.jsx";
import MasterPanel from "./components/MasterPanel.jsx";
import KurumsalPanel from "./components/KurumsalPanel.jsx";
import IsletmePanel from "./components/IsletmePanel.jsx";
import UserPanel from "./components/UserPanel.jsx";
import BireyselIlanFormu from "./components/BireyselIlanFormu.jsx";
import TheDateDoctor from "./components/DateDoctor.jsx";
import TheBeniSasirt from "./components/BeniSasirt.jsx";
import { registerPushNotifications } from "./services/pushNotifications";
import { resolveAppleRedirectSession } from "./services/appleAuth";
// ------------------------------------------------

/* Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ TEMA Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ */
const C = {
  bg: "#0a0a0f",
  gold: "#D4AF37",
  goldD: "rgba(212,175,55,0.10)",
  goldB: "rgba(212,175,55,0.18)",
  goldX: "rgba(212,175,55,0.35)",
  text: "rgba(238,230,210,0.92)",
  muted: "rgba(168,155,128,0.48)",
  ok: "#4caf7d",
  serif: "'Cormorant Garamond','Garamond',serif",
  sans: "'Jost','Segoe UI',sans-serif",
};

/* Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ SESSION Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ */
const OB_KEY = "nar_session_v1";
const loadSession = () => { try { const r = localStorage.getItem(OB_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const saveSession = (s) => { try { localStorage.setItem(OB_KEY, JSON.stringify(s)); } catch { } };
const clearSession = () => { try { localStorage.removeItem(OB_KEY); } catch { } };

/* Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â
   ONBOARDING Ã¢â‚¬" 3 adÃ„Â±m: KarÃ…Å¸Ã„Â±lama Ã¢â€ ' Dil Ã¢â€ ' Konum
   (Image 4 / 5 / 6 birebir)
Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â */
const DILLER = [
  { kod: "TR", ad: "Türkçe", bayrak: "🇹🇷", alt: "Antalya'nın ruhunu keşfedin" },
  { kod: "EN", ad: "English", bayrak: "🇬🇧", alt: "Discover the soul of Antalya" },
  { kod: "RU", ad: "Русский", bayrak: "🇷🇺", alt: "Откройте душу Анталии" },
  { kod: "DE", ad: "Deutsch", bayrak: "🇩🇪", alt: "Entdecken Sie die Seele Antalyas" },
];
const TRANSLATIONS = {
  TR: {
    welcome: "Hoş geldin",
    discover: "Antalya'nın ruhunu keşfedin",
    start: "KEŞFETMEYE BAŞLA →",
    detected: "Diliniz algılandı:",
    chooseLang: "Dilinizi seçin",
    pref: "2 / 3 - DİL TERCİHİ",
    chooseSub: "Seçin · Choose · Выберите · Wählen Sie",
    back: "← Geri",
    next: "DEVAM ET →",
    locTitle: "3 / 3 - KONUM",
    locHead: "Konumunuz",
    locSub: "En yakın Nar Seçimi deneyimleri için",
    locBtn: "DEVAM ET",
    locOk: "✓ KONUM ALINDI",
    locWait: "⌛ Bekleniyor...",
    locSkip: "Konumsuz Devam Et",
    locNote: "Konum verisi yalnızca mesafe sıralaması için kullanılır, sunucularımıza gönderilmez.",
    locErr: "⚠️ Konum izni verilmedi",
    heroPlaceholder: "Mekan, hizmet veya sanat ara...",
    bulk: "BUL",
    searchPre: "📍 Konumunuz aktif · Öncelik en yakın Nar Seçimi",
    searchNoLoc: "📍 Konum izni verilmedi · Editoryal sıralama aktif",
    reset: "↺ Onboarding'i Sıfırla",
    exit: "Çıkış Yap",
    login: "Kayıt Ol / Giriş Yap",
    activeLoc: "Konum Aktif"
  },
  EN: {
    welcome: "Welcome",
    discover: "Discover the soul of Antalya",
    start: "START DISCOVERING →",
    detected: "Language detected:",
    chooseLang: "Choose your language",
    pref: "2 / 3 - LANGUAGE",
    chooseSub: "Select your language",
    back: "← Back",
    next: "CONTINUE →",
    locTitle: "3 / 3 - LOCATION",
    locHead: "Your location",
    locSub: "For the nearest Nar Selection experiences",
    locBtn: "CONTINUE",
    locOk: "✓ LOCATION READY",
    locWait: "⌛ Waiting...",
    locSkip: "Continue without location",
    locNote: "Your location is used only for distance sorting.",
    locErr: "⚠️ Location permission denied",
    heroPlaceholder: "Search places, services or art...",
    bulk: "FIND",
    searchPre: "📍 Location active · Nearest Nar Selection first",
    searchNoLoc: "📍 No location permission · Editorial ranking active",
    reset: "↺ Reset onboarding",
    exit: "Sign out",
    login: "Sign in",
    activeLoc: "Location Active"
  },
  RU: {
    welcome: "Добро пожаловать",
    discover: "Откройте душу Анталии",
    start: "НАЧАТЬ →",
    detected: "Язык определён:",
    chooseLang: "Выберите язык",
    pref: "2 / 3 - ЯЗЫК",
    chooseSub: "Выберите язык",
    back: "← Назад",
    next: "ДАЛЕЕ →",
    locTitle: "3 / 3 - ЛОКАЦИЯ",
    locHead: "Ваше местоположение",
    locSub: "Для ближайших рекомендаций Nar",
    locBtn: "ДАЛЕЕ",
    locOk: "✓ ЛОКАЦИЯ ГОТОВА",
    locWait: "⌛ Подождите...",
    locSkip: "Продолжить без геолокации",
    locNote: "Геолокация используется только для сортировки по расстоянию.",
    locErr: "⚠️ Нет доступа к геолокации",
    heroPlaceholder: "Ищите места, услуги или искусство...",
    bulk: "НАЙТИ",
    searchPre: "📍 Геолокация активна · Сначала ближайшие места",
    searchNoLoc: "📍 Геолокация отключена · Редакционная сортировка активна",
    reset: "↺ Сбросить старт",
    exit: "Выйти",
    login: "Войти",
    activeLoc: "Геолокация активна"
  },
  DE: {
    welcome: "Willkommen",
    discover: "Entdecken Sie die Seele Antalyas",
    start: "ENTDECKEN →",
    detected: "Sprache erkannt:",
    chooseLang: "Sprache wählen",
    pref: "2 / 3 - SPRACHE",
    chooseSub: "Wählen Sie Ihre Sprache",
    back: "← Zurück",
    next: "WEITER →",
    locTitle: "3 / 3 - STANDORT",
    locHead: "Ihr Standort",
    locSub: "Für die nächstgelegenen Nar-Auswahlen",
    locBtn: "WEITER",
    locOk: "✓ STANDORT AKTIV",
    locWait: "⌛ Bitte warten...",
    locSkip: "Ohne Standort fortfahren",
    locNote: "Der Standort wird nur für die Distanzsortierung genutzt.",
    locErr: "⚠️ Standortfreigabe abgelehnt",
    heroPlaceholder: "Suche nach Orten, Services oder Kunst...",
    bulk: "FINDEN",
    searchPre: "📍 Standort aktiv · Nächste Nar-Auswahl zuerst",
    searchNoLoc: "📍 Kein Standort · Redaktionelle Sortierung aktiv",
    reset: "↺ Onboarding zurücksetzen",
    exit: "Abmelden",
    login: "Anmelden",
    activeLoc: "Standort aktiv"
  }
};

function detectLang() {
  const nav = (navigator.language || navigator.languages?.[0] || "tr").slice(0, 2).toUpperCase();
  const found = DILLER.find(d => d.kod === nav);
  return found ? found.kod : "TR";
}

/* AdÃ„Â±m noktalarÃ„Â± */
function Steps({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 28 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ width: i === step ? 28 : 6, background: i === step ? C.gold : `rgba(212,175,55,0.25)` }}
          transition={{ duration: 0.35 }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}

function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(detectLang());
  const [konumDur, setKonumDur] = useState("BEKLE"); // BEKLE | OK | HATA | ATLA

  /* AdÃ„Â±m 0 Ã¢â‚¬" KarÃ…Å¸Ã„Â±lama */
  const StepKarsilama = () => (
    <motion.div key="s0"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

      {/* NAR logosu Ã¢â‚¬" halka */}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
        style={{ marginBottom: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: `1px solid rgba(212,175,55,0.5)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(212,175,55,0.06)",
          boxShadow: "0 0 28px rgba(212,175,55,0.12)",
        }}>
          <RotatingLogo size={42} />
        </div>
      </motion.div>

      {/* AltÃ„Â±n ince ÃƒÂ§izgi */}
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        style={{
          width: 80, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)",
          transformOrigin: "center", marginBottom: 20
        }} />

      <span style={{
        fontFamily: C.sans, fontSize: 10, color: C.gold,
        letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 10
      }}>
        NAR REHBERİ
      </span>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          fontFamily: C.serif, fontSize: 42, fontWeight: 400,
          color: C.text, letterSpacing: "0.02em", margin: "0 0 10px", textAlign: "center"
        }}>
        {TRANSLATIONS[lang]?.welcome || "Hoş Geldiniz"}
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        style={{
          fontFamily: C.sans, fontSize: 12, color: C.muted,
          letterSpacing: "0.04em", margin: "0 0 30px", textAlign: "center"
        }}>
        {TRANSLATIONS[lang]?.discover || "Antalya'nın ruhunu keşfedin"}
      </motion.p>

      {/* Dil algÃ„Â±lama notu */}
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4, marginBottom: 24, width: "100%", maxWidth: 320, boxSizing: "border-box"
        }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.ok, flexShrink: 0 }} />
        <span style={{ fontFamily: C.sans, fontSize: 11, color: C.muted }}>
          {TRANSLATIONS[lang]?.detected || "Diliniz algılandı:"} {DILLER.find(d => d.kod === lang)?.bayrak} {DILLER.find(d => d.kod === lang)?.ad}
        </span>
      </motion.div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setStep(1)}
        style={{
          width: "100%", maxWidth: 320, padding: "16px",
          background: `linear-gradient(135deg,${C.gold},#b8952a)`,
          border: "none", borderRadius: 4, color: "#0a0a0f",
          fontFamily: C.sans, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.18em", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(212,175,55,0.3)"
        }}>
        {TRANSLATIONS[lang]?.start || "KEŞFETMEYE BAŞLA →"}
      </motion.button>
    </motion.div>
  );

  /* AdÃ„Â±m 1 Ã¢â‚¬" Dil seÃƒÂ§imi */
  const StepDil = () => (
    <motion.div key="s1"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ width: "100%", maxWidth: 380 }}>

      <p style={{
        fontFamily: C.sans, fontSize: 10, color: C.gold,
        letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "center", marginBottom: 8
      }}>
        {TRANSLATIONS[lang]?.pref || "2 / 3 - DİL TERCİHİ"}
      </p>

      <h2 style={{
        fontFamily: C.serif, fontSize: 34, fontWeight: 400,
        color: C.text, textAlign: "center", margin: "0 0 6px"
      }}>
        {TRANSLATIONS[lang]?.chooseLang || "Dilinizi seçin"}
      </h2>
      <p style={{
        fontFamily: C.sans, fontSize: 11, color: C.muted,
        textAlign: "center", margin: "0 0 24px"
      }}>
        {TRANSLATIONS[lang]?.chooseSub || "Seçin · Choose · Выберите · Wählen Sie"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {DILLER.map(d => (
          <motion.button key={d.kod} whileTap={{ scale: 0.98 }}
            onClick={() => setLang(d.kod)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              background: lang === d.kod ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.025)",
              border: lang === d.kod ? `1px solid ${C.gold}` : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 4, cursor: "pointer", width: "100%", textAlign: "left",
              transition: "all 0.2s",
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: lang === d.kod ? `5px solid ${C.gold}` : "2px solid rgba(255,255,255,0.2)",
              flexShrink: 0, transition: "all 0.2s"
            }} />
            <span style={{ fontSize: 22 }}>{d.bayrak}</span>
            <div>
              <div style={{ fontFamily: C.serif, fontSize: 17, color: lang === d.kod ? C.gold : C.text }}>
                {d.ad}
              </div>
              <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.muted, marginTop: 1 }}>
                {d.alt}
              </div>
            </div>
            {lang === d.kod && (
              <span style={{ marginLeft: "auto", color: C.gold, fontSize: 13 }}>✓</span>
            )}
          </motion.button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(0)}
          style={{
            flex: 1, padding: "14px", background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
            color: C.muted, fontFamily: C.sans, fontSize: 11, cursor: "pointer",
            letterSpacing: "0.1em"
          }}>
          {TRANSLATIONS[lang]?.back || "? Geri"}
        </button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setStep(2)}
          style={{
            flex: 1, padding: "14px",
            background: `linear-gradient(135deg,${C.gold},#b8952a)`,
            border: "none", borderRadius: 4, color: "#0a0a0f",
            fontFamily: C.sans, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", cursor: "pointer"
          }}>
          {TRANSLATIONS[lang]?.next || "DEVAM ET ?"}
        </motion.button>
      </div>
    </motion.div>
  );

  /* AdÃ„Â±m 2 Ã¢â‚¬" Konum */
  const StepKonum = () => {
    const iste = () => {
      let tamamlandi = false;
      const bitir = (nextState, payload, delay = 900) => {
        if (tamamlandi) return;
        tamamlandi = true;
        setKonumDur(nextState);
        setTimeout(() => onDone(payload), delay);
      };

      if (!navigator.geolocation) {
        bitir("HATA", { lang, coords: null });
        return;
      }

      setKonumDur("BEKLE_IZIN");

      const failSafeTimer = setTimeout(() => {
        console.warn("Konum istegi zamaninda tamamlanmadi, konumsuz devam ediliyor.");
        bitir("HATA", { lang, coords: null });
      }, 12000);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("Konum OK:", latitude, longitude);
          clearTimeout(failSafeTimer);
          bitir("OK", {
            lang,
            coords: { lat: latitude, lng: longitude }
          }, 800);
        },
        (err) => {
          console.warn("Konum Alinamadi, tekrar deneniyor (dusuk hassasiyet)...", err);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(failSafeTimer);
              bitir("OK", {
                lang,
                coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
              }, 800);
            },
            (err2) => {
              console.error("Konum kesin olarak alinamadi:", err2);
              clearTimeout(failSafeTimer);
              bitir("HATA", { lang, coords: null });
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
          );
        },
        options
      );
    };


    return (
      <motion.div key="s2"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>

        <p style={{
          fontFamily: C.sans, fontSize: 10, color: C.gold,
          letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8
        }}>
          {TRANSLATIONS[lang]?.locTitle || "3 / 3 - KONUM"}
        </p>

        {/* Konum ikonu */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 90 }}
          style={{
            margin: "0 auto 24px",
            width: 60, height: 60, borderRadius: "50%",
            border: `2px solid rgba(212,175,55,0.35)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(212,175,55,0.06)"
          }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            border: "2px solid rgba(212,175,55,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(212,175,55,0.04)"
          }}>
            <span style={{ fontSize: 20 }}>
              {konumDur === "OK" ? "✓" : "📍"}
            </span>
          </div>
        </motion.div>

        <h2 style={{ fontFamily: C.serif, fontSize: 34, fontWeight: 400, color: C.text, margin: "0 0 8px" }}>
          {TRANSLATIONS[lang]?.locHead || "Konumunuz"}
        </h2>
        <p style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, margin: "0 0 30px", letterSpacing: "0.02em" }}>
          {TRANSLATIONS[lang]?.locSub || "En yakın Nar Seçimi deneyimleri için"}
        </p>

        {konumDur === "HATA" && (
          <p style={{
            fontFamily: C.sans, fontSize: 10, color: "#e07070",
            margin: "0 0 12px", letterSpacing: "0.05em"
          }}>
            {TRANSLATIONS[lang]?.locErr || "⚠️ Konum izni verilmedi"}
          </p>
        )}

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={iste}
          disabled={konumDur === "BEKLE_IZIN" || konumDur === "OK"}
          style={{
            width: "100%", padding: "16px",
            background: konumDur === "OK"
              ? `linear-gradient(135deg,#4caf7d,#3a8a5e)`
              : `linear-gradient(135deg,${C.gold},#b8952a)`,
            border: "none", borderRadius: 4, color: "#0a0a0f",
            fontFamily: C.sans, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.14em", cursor: konumDur === "OK" ? "default" : "pointer",
            boxShadow: "0 4px 20px rgba(212,175,55,0.25)", marginBottom: 10
          }}>
          {konumDur === "OK" ? (TRANSLATIONS[lang]?.locOk || "✓ KONUM ALINDI") :
            konumDur === "BEKLE_IZIN" ? (TRANSLATIONS[lang]?.locWait || "⌛ Bekleniyor...") :
              (TRANSLATIONS[lang]?.locBtn || "📍 KONUMU PAYLAŞ")}
        </motion.button>

        <p style={{
          fontFamily: C.sans, fontSize: 9, color: "rgba(255,255,255,0.18)",
          margin: "14px 0 0", lineHeight: 1.5
        }}>
          {TRANSLATIONS[lang]?.locNote || "Konum verisi yalnızca mesafe sıralaması için kullanılır, sunucularımıza gönderilmez."}
        </p>
      </motion.div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
      fontFamily: C.sans,
    }}>
      {/* Arka plan parÃƒÂ§acÃ„Â±klarÃ„Â± */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [-12, 12, -12], opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }}
          style={{
            position: "fixed",
            left: `${12 + i * 16}%`, top: `${18 + i * 12}%`,
            width: i % 2 === 0 ? 140 : 80, height: i % 2 === 0 ? 140 : 80,
            borderRadius: "50%",
            background: `radial-gradient(circle,rgba(212,175,55,0.07) 0%,transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      ))}

      <Steps step={step} />

      <AnimatePresence mode="wait">
        {step === 0 && <StepKarsilama key="s0" />}
        {step === 1 && <StepDil key="s1" />}
        {step === 2 && <StepKonum key="s2" />}
      </AnimatePresence>
    </div>
  );
}



/* Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â
   NAR HEADER Ã¢â‚¬" Premium gradient
Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â */
function NarHeader({ session, googleUser, onAdmin }) {
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogle = async () => {
    /* Firebase geÃƒÂ§ici olarak devre dÃ„Â±Ã…Å¸Ã„Â± */
  };

  const lang = session?.lang || "TR";

  return (
    <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(180deg,#13111c 0%,#0e0c18 100%)",
        position: "sticky", top: 0, zIndex: 200,
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 20px",
        backdropFilter: "blur(12px)",
      }}>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.35) 30%,rgba(212,175,55,0.35) 70%,transparent)"
      }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <RotatingLogo size={22} style={{ filter: "drop-shadow(0 0 6px rgba(212,175,55,0.4))" }} />
        <span style={{ fontFamily: C.serif, fontSize: 18, color: C.gold, fontWeight: 600, letterSpacing: "0.10em" }}>NAR</span>
        <div style={{ width: 1, height: 14, background: "rgba(212,175,55,0.25)" }} />
        <span style={{ fontFamily: C.sans, fontSize: 10, color: C.gold, opacity: 0.85, letterSpacing: "0.22em", fontWeight: 700 }}>REHBERİ</span>
      </div>

      {/* Konum Aktif (Orta) - Sadece GeniÃ…Å¸ Ekranlarda */}
      {session?.coords && (
        <motion.div
          className="header-location-badge"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            borderRadius: 20, background: "rgba(76,175,77,0.12)", border: "1px solid rgba(76,175,77,0.3)",
            backdropFilter: "blur(6px)",
          }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.ok, boxShadow: `0 0 8px ${C.ok}` }} />
          <span style={{ fontSize: 9, color: C.ok, letterSpacing: "0.12em", fontWeight: 700 }}>{TRANSLATIONS[lang]?.activeLoc || "Konum Aktif"}</span>
        </motion.div>
      )}

      {/* SaÃ„Å¸ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>


        <button onClick={() => onAdmin()}
          style={{
            background: googleUser ? C.goldD : "none",
            border: `1px solid rgba(212,175,55,0.28)`,
            borderRadius: 20, padding: "6px 16px", color: "rgba(212,175,55,0.8)",
            cursor: "pointer", fontSize: 10, letterSpacing: "0.1em", fontFamily: C.sans,
            fontWeight: googleUser ? 700 : 400,
            transition: "all 0.2s"
          }}>
          {googleUser ? "PANELE GİT →" : (TRANSLATIONS[lang]?.login || "Kayıt Ol / Giriş Yap")}
        </button>
      </div>
    </motion.header>
  );
}

/* Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â
   HERO ARAMA ? "Ne Ar?yorsun Kadir?" + BUL
   (Image 3 / 7 birebir)
Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â */
function HeroArama({ session, googleUser, aramaVal, onAramaChange, onAramaGo }) {
  const isim = googleUser?.isim?.split(" ")[0] || session?.isim || "Kurucu";
  const lang = session?.lang || "TR";

  const sorular = {
    TR: `Ne Arıyorsun${isim ? ` ${isim}` : ""}?`,
    EN: `What are you looking for${isim ? `, ${isim}` : ""}?`,
    RU: `Ğ§Ñ‚Ğ¾ Ğ²Ñ‹ Ğ¸Ñ‰ĞµÑ‚Ğµ${isim ? `, ${isim}` : ""}?`,
    DE: `Was suchst du${isim ? `, ${isim}` : ""}?`,
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "linear-gradient(160deg,#0d0b18 0%,#11101c 50%,#0a0a0f 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.08)",
        padding: "clamp(24px, 5vw, 40px) 16px clamp(20px, 4vw, 32px)",
        position: "relative",
      }}>

      {/* ÃƒÅ“st dekor ÃƒÂ§izgisi */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.4) 25%,rgba(212,175,55,0.4) 75%,transparent)"
      }} />

      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6 }}
          style={{
            fontFamily: C.serif, fontSize: isim ? "clamp(22px, 5vw, 28px)" : "clamp(20px, 4.5vw, 26px)", fontWeight: 400,
            color: "rgba(238,230,210,0.96)", letterSpacing: "0.01em",
            lineHeight: 1.25, margin: "0 0 20px"
          }}>
          {sorular[lang] || sorular.TR}
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          style={{ display: "flex", gap: 10, alignItems: "stretch" }}>

          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={aramaVal}
              onChange={e => onAramaChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onAramaGo()}
              placeholder={TRANSLATIONS[lang]?.heroPlaceholder || "Mekan, hizmet veya sanat ara..."}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 44px 14px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(212,175,55,0.22)",
                borderRadius: 4, color: "rgba(238,230,210,0.92)",
                fontSize: 15, fontFamily: C.serif, outline: "none",
                letterSpacing: "0.01em"
              }}
              onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.22)"}
            />
            {aramaVal && (
              <button onClick={() => onAramaChange("")}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: C.muted,
                  cursor: "pointer", fontSize: 24, padding: 0, lineHeight: 1,
                  opacity: 0.6, transition: "opacity 0.2s"
                }}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.6}
              >×</button>
            )}
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="hero-search-btn"
            onClick={onAramaGo}
            style={{
              height: "auto", padding: "0 clamp(12px, 3vw, 24px)",
              background: `linear-gradient(135deg,${C.gold},#b8952a)`,
              border: "none", borderRadius: 4, color: "#0a0a0f",
              fontFamily: C.sans, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.14em", cursor: "pointer",
              boxShadow: "0 2px 12px rgba(212,175,55,0.25)"
            }}>
            {TRANSLATIONS[lang]?.bulk || "BUL"}
          </motion.button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            fontSize: 9, color: "rgba(240,234,218,0.65)",
            letterSpacing: "0.12em", margin: "14px 0 0", fontFamily: C.sans,
            textAlign: "center"
          }}>
          {session?.coords ? "📍 Konumunuz aktif · Öncelik en yakın Nar Seçimi" : "📍 Konum izni verilmedi · Editoryal sıralama aktif"}</motion.p>
        </div>
      </motion.div>
  );
}

/* Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â
   VÃ„Â°TRÃ„Â°N SAYFASI Ã¢â‚¬" TÃƒÂ¼m bileÃ…Å¸enlerin orchestratÃƒÂ¶rÃƒÂ¼
Ã¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•ÂÃ¢•Â */
function VitrinPage({ session, setSession, googleUser, onAdmin, onBireyselIlanFormuAc, bireyselIlanlar = [], viewMode, setViewMode, liveVenues = [] }) {
  const [arama, setArama] = useState("");
  const [aramaSent, setAramaSent] = useState("");
  const [dateDoctorOpen, setDateDoctorOpen] = useState(false);
  const [beniSasirtOpen, setBeniSasirtOpen] = useState(false);
  const [sysNotification, setSysNotification] = useState(null);

  const showSysNotify = (msg, type = 'gold') => {
    setSysNotification({ msg, type });
    setTimeout(() => setSysNotification(null), 5000);
  };

  // URL Parametresi KontrolÃƒÂ¼ (Ãƒ- deme DÃƒÂ¶nÃƒÂ¼Ã…Å¸ÃƒÂ¼)
  useEffect(() => {
    const checkPaymentResult = async () => {
      const url = new URL(window.location.href);
      const lastOid = localStorage.getItem("last_merchant_oid");

      if (url.pathname === '/payment-success') {
        showSysNotify("Ãƒ- demeniz baÃ…Å¸arÃ„Â±yla gerÃƒÂ§ekleÃ…Å¸ti. TeÃ…Å¸ekkÃƒÂ¼rler!", "ok");

        if (lastOid) {
          try {
            // Firestore'da ilgili ÃƒÂ¶demeyi bul ve ÃƒÂ¶dÃƒÂ¼lÃƒÂ¼ ver
            const q = query(collection(db, "payments"), where("merchant_oid", "==", lastOid), where("status", "==", "PENDING"));
            const snap = await getDocs(q);

            if (!snap.empty) {
              const payDoc = snap.docs[0];
              const payData = payDoc.data();

              // 1. Ãƒ- demeyi gÃƒÂ¼ncelle
              await updateDoc(doc(db, "payments", payDoc.id), {
                status: "SUCCESS"
              });

              // 2. KullanÃ„Â±cÃ„Â±ya puanÃ„Â±nÃ„Â± ver
              const userRef = doc(db, "users", payData.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const currentPuan = userSnap.data().puan || 0;
                const newPuan = currentPuan + (payData.puan || 0);

                let yeniSeviye = "Yeni Üye";
                if (newPuan >= 500) yeniSeviye = "Gezgin";
                if (newPuan >= 1500) yeniSeviye = "Nar Gurmesi";
                if (newPuan >= 5000) yeniSeviye = "Antalya El?isi";

                await updateDoc(userRef, {
                  puan: newPuan,
                  seviye: yeniSeviye
                });
              }
            }
          } catch (e) {
            console.error("Payment update error:", e);
          }
          localStorage.removeItem("last_merchant_oid");
        }
        window.history.replaceState({}, document.title, "/");
      } else if (url.pathname === '/payment-fail') {
        showSysNotify("Ãƒ- deme iÃ…Å¸lemi baÃ…Å¸arÃ„Â±sÃ„Â±z oldu veya iptal edildi.", "error");
        if (lastOid) {
          try {
            const q = query(collection(db, "payments"), where("merchant_oid", "==", lastOid), where("status", "==", "PENDING"));
            const snap = await getDocs(q);
            if (!snap.empty) {
              await updateDoc(doc(db, "payments", snap.docs[0].id), {
                status: "FAILED"
              });
            }
          } catch (e) { }
          localStorage.removeItem("last_merchant_oid");
        }
        window.history.replaceState({}, document.title, "/");
      }
    };

    checkPaymentResult();
  }, []);

  // CanlÃ„Â± konum gÃƒÂ¼ncellemesi & eksikse alma
  useEffect(() => {
    if (navigator.geolocation) {
      const options = { enableHighAccuracy: false, maximumAge: 120000, timeout: 15000 };

      const success = (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // DeÃ„Å¸iÃ…Å¸im kontrolÃƒÂ¼ (0.0001 hassasiyet yaklaÃ…Å¸Ã„Â±k 10 metre)
        const current = session?.coords;
        if (!current || Math.abs(newCoords.lat - current.lat) > 0.0001 || Math.abs(newCoords.lng - current.lng) > 0.0001) {
          const updated = { ...session, coords: newCoords };
          setSession(updated);
          saveSession(updated);
        }
      };

      // Ã„Â°lk yÃƒÂ¼klemede coords yoksa hemen iste (eÃ„Å¸er daha ÃƒÂ¶nce sorulmadÃ„Â±ysa/verildiyse)
      navigator.geolocation.getCurrentPosition(success, () => { }, options);

      // Ã„Â°zlemeyi baÃ…Å¸latmak iÃƒÂ§in interval veya watchPosition da olabilir ama Ã…Å¸imdilik manuel tetikleme yeterli
    }
  }, [session, setSession]);

  // Arama sonrasÃ„Â± otomatik kaydÃ„Â±rma iÃƒÂ§in debounced (gecikmeli) tetikleyici
  useEffect(() => {
    if (!arama) {
      setAramaSent("");
      return;
    }
    const timer = setTimeout(() => {
      setAramaSent(arama);
    }, 300); // KullanÃ„Â±cÃ„Â± yazmayÃ„Â± bÃ„Â±raktÃ„Â±ktan 0.3 saniye sonra kaydÃ„Â±r (daha hÃ„Â±zlÃ„Â±)
    return () => clearTimeout(timer);
  }, [arama]);

  return (
    <motion.div key="vitrin"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      style={{ minHeight: "100vh", background: C.bg }}>

      {/* 1 Ã¢â‚¬" Header (sticky) */}
      <NarHeader session={session} googleUser={googleUser} onAdmin={onAdmin} />

      {/* 2 Ã¢â‚¬" Hero Arama */}
      <HeroArama
        session={session} googleUser={googleUser}
        aramaVal={arama} onAramaChange={setArama} onAramaGo={() => setAramaSent(arama)}
      />

      {/* Bireysel KullanÃ„Â±cÃ„Â± (USER) Profil Ãƒâ€¡ubuÃ„Å¸u - Sadece arama yapÃ„Â±lmÃ„Â±yorken gÃƒÂ¶sterilir */}
      {/* Bireysel Kullan?c? (USER) Profil ?ubu?u - Sadece arama yap?lm?yorken g?sterilir */}
      {session?.rol === "USER" && !arama.trim() && (() => {
        const TIER_THRESHOLDS = [
          { name: "Yeni Üye", min: 0, max: 500 },
          { name: "Bronz Üye", min: 500, max: 1500 },
          { name: "Gümüş Üye", min: 1500, max: 5000 },
          { name: "Altın Üye", min: 5000, max: 10000 },
          { name: "Platin Üye", min: 10000, max: 100000 },
        ];
        const currentPuan = session?.puan || 0;
        const activeTierIdx = TIER_THRESHOLDS.findLastIndex(t => currentPuan >= t.min) || 0;
        const activeTier = TIER_THRESHOLDS[activeTierIdx];
        const nextTier = TIER_THRESHOLDS[activeTierIdx + 1] || activeTier;
        let progress = 100;
        if (nextTier.name !== activeTier.name) {
          progress = ((currentPuan - activeTier.min) / (nextTier.min - activeTier.min)) * 100;
        }

        return (
          <div style={{ marginTop: 20, marginBottom: 8, position: "relative", zIndex: 10 }}>
            <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 16px" }}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onAdmin("USER")}
                style={{
                  background: "linear-gradient(135deg, rgba(112, 144, 224, 0.1), rgba(112, 144, 224, 0.03))",
                  border: "1px solid rgba(112, 144, 224, 0.2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "#7090e0" }} />
                <div style={{ width: "100%", paddingLeft: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🏆</span>
                      <span style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 700, color: "#7090e0" }}>{activeTier.name}</span>
                    </div>
                    <span style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 700, color: C.gold }}>
                      {currentPuan} <span style={{ fontSize: 11, opacity: 0.6 }}>PN</span>
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: "#7090e0", borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{activeTier.min} Puan</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{nextTier.min} Puan ({nextTier.name})</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      })()}

      {/* 3 ? KategoriVitrin */}
      <KategoriVitrin
        coords={session?.coords ?? null}
        lang={session?.lang ?? "TR"}
        session={session}
        globalArama={aramaSent}
        onBireyselIlanFormuAc={onBireyselIlanFormuAc}
        bireyselIlanlar={bireyselIlanlar}
        viewMode={viewMode}
        setViewMode={setViewMode}
        liveVenues={liveVenues}
        onDateDoctorOpen={() => setDateDoctorOpen(true)}
        onBeniSasirtOpen={() => setBeniSasirtOpen(true)}
        showSysNotify={showSysNotify}
      />

      <div style={{ height: 8 }} /> {/* Minimal spacer instead of reset button */}

      <AnimatePresence>
        {sysNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 80,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10000,
              padding: "12px 24px",
              borderRadius: 8,
              color: sysNotification.type === 'gold' ? "#000" : "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontFamily: C.sans,
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            <span>{sysNotification.type === 'ok' ? '✅' : sysNotification.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            {sysNotification.msg}
          </motion.div>
        )}

        {dateDoctorOpen && (
          <TheDateDoctor onClose={() => setDateDoctorOpen(false)} />
        )}
        {beniSasirtOpen && (
          <TheBeniSasirt onClose={() => setBeniSasirtOpen(false)} liveVenues={liveVenues} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState("BOOT");
  const [session, setSession] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [ilanKategori, setIlanKategori] = useState(null);
  const [bireyselIlanlar, setBireyselIlanlar] = useState([]);
  const [viewMode, setViewMode] = useState("LIST"); // Global view mode: LIST | CARD
  const [liveVenues, setLiveVenues] = useState([]);

  useEffect(() => {
    let aktif = true;
    resolveAppleRedirectSession()
      .then((appleSession) => {
        if (!aktif || !appleSession) return;
        setSession((prev) => {
          const next = { ...(prev || {}), ...appleSession };
          saveSession(next);
          return next;
        });
        setGoogleUser({
          uid: appleSession.uid,
          email: appleSession.email || "",
          isim: appleSession.ad_soyad || appleSession.firma_adi || "Nar Kullanıcısı",
          rol: appleSession.rol || "USER",
        });
        setView("VITRIN");
      })
      .catch((error) => {
        console.error("Apple redirect çözümlenemedi:", error);
      });
    return () => {
      aktif = false;
    };
  }, []);

  // Firebase Auth GerÃƒÂ§ek Dinleyici
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Oturum aÃƒÂ§Ã„Â±ldÃ„Â±
        const docSnap = await getDoc(doc(db, "users", u.uid));
        let rol = "USER";
        const email = u.email || "";
        let ad = email ? email.split("@")[0] : (u.displayName || "Nar Kullanıcısı");

        if (docSnap.exists()) {
          const veri = docSnap.data();
          rol = veri.rol || "USER";
          ad = veri.ad_soyad || veri.firma_adi || ad;
        } else {
          try {
            await setDoc(doc(db, "users", u.uid), {
              email: email,
              rol: "USER",
              ad_soyad: ad,
              aktif: true,
              appleSignIn: Array.isArray(u.providerData) && u.providerData.some((p) => p?.providerId === "apple.com"),
              olusturma_tarihi: new Date().toISOString()
            });
          } catch (e) { }
        }

        setGoogleUser({ uid: u.uid, email, isim: ad, rol });
      } else {
        setGoogleUser(null);
      }
      setAuthLoading(false);
    });

    // Siyah ekran/takÃ„Â±lma korumasÃ„Â±: 6 saniye sonra zorla aÃƒÂ§
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 6000);

    // Firebase Bireysel Ã„Â°lanlar Dinleyici - Sadece YAYINDA olanlar
    const qIlan = query(
      collection(db, "bireysel_ilanlar"),
      where("onay_durumu", "==", "YAYINDA")
    );
    const unsubscribeIlan = onSnapshot(qIlan, (snap) => {
      const ilanlar = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBireyselIlanlar(ilanlar);
    });

    // Venues Dinleyici
    const qVenues = query(collection(db, "venues"), where("aktif", "==", true));
    const unsubscribeVenues = onSnapshot(qVenues, (snap) => {
      setLiveVenues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const saved = loadSession();
    if (saved) { setSession(saved); }

    return () => {
      unsubscribe();
      unsubscribeIlan();
      unsubscribeVenues();
      clearTimeout(safetyTimer);
    };
  }, []);

  // KullanÃ„Â±cÃ„Â± verilerini (puan vb) gerÃƒÂ§ek zamanlÃ„Â± takip et
  useEffect(() => {
    if (!googleUser?.uid) return;
    const unsub = onSnapshot(doc(db, "users", googleUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const uData = docSnap.data();
        setSession(prev => {
          const updated = { ...prev, ...uData, id: docSnap.id };
          saveSession(updated); // Yerel hafÃ„Â±zaya da eÃ…Å¸itle
          return updated;
        });
      }
    });
    return () => unsub();
  }, [googleUser?.uid]);
  useEffect(() => {
    if (!googleUser?.uid) return;
    registerPushNotifications(googleUser.uid).catch((error) => {
      console.error("Push bildirim kaydı başarısız:", error);
    });
  }, [googleUser?.uid]);

  useEffect(() => {
    if (authLoading) return;

    const saved = loadSession();

    setView(prev => {
      if (!saved) return "ONBOARDING";
      if (!googleUser) return prev === "ONBOARDING" ? prev : "AUTH";

      if (prev === "BOOT" || prev === "AUTH" || prev === "ONBOARDING") return "VITRIN";
      return prev;
    });
  }, [authLoading, googleUser]);

  const handleOnboardingDone = (data) => {
    saveSession(data);
    setSession(data);
    setView(!googleUser ? "AUTH" : "VITRIN");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSession(null);
      setView("AUTH");
    } catch (e) {
      console.error("Ãƒâ€¡Ã„Â±kÃ„Â±Ã…Å¸ hatasÃ„Â±:", e);
      setView("AUTH");
    }
  };

  if (view === "BOOT" || authLoading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
      <div style={{ textAlign: 'center' }}>
        <img src={logo} style={{ width: 40, height: 40, marginBottom: 20 }} />
        <p style={{ letterSpacing: '0.2em' }}>SİSTEM BAŞLATILIYOR...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: 'hidden' }}>
      <AnimatePresence>
        {view === "ONBOARDING" && (
          <OnboardingScreen key="ob" onDone={handleOnboardingDone} />
        )}

        {view === "VITRIN" && (
          <VitrinPage key="vt"
            session={session}
            setSession={setSession}
            googleUser={googleUser}
            onAdmin={(hedefRol) => {
              const rol = hedefRol || googleUser?.rol || session?.rol;
              if (rol === "MASTER") setView("MASTER_PANEL");
              else if (rol === "DT_ADMIN") setView("DT_PANEL");
              else if (rol === "KURUMSAL") setView("KURUMSAL_PANEL");
              else if (rol === "ISLETME") setView("ISLETME_PANEL");
              else if (rol === "USER") setView("USER_PANEL");
              else setView("AUTH");
            }}
            onBireyselIlanFormuAc={(k) => { setIlanKategori(k); setView("BIREYSEL_ILAN_FORMU"); }}
            bireyselIlanlar={bireyselIlanlar}
            viewMode={viewMode}
            setViewMode={setViewMode}
            liveVenues={liveVenues}
          />
        )}

        {view === "BIREYSEL_ILAN_FORMU" && ilanKategori && (
          <BireyselIlanFormu
            key="bireysel-ilan"
            kategori={ilanKategori}
            onBasarili={() => setView("VITRIN")}
            onKapat={() => setView("VITRIN")}
            onIlanKaydet={() => { }} // Manual state update removed to prevent duplicates
          />
        )}


        {/* --- YÃƒ- NETÃ„Â°M PANELLERÃ„Â° EKLENTÃ„Â°SÃ„Â° --- */}
        {view === "AUTH" && (
          <AuthGateway key="auth"
            onAuth={(s) => {
              setSession(s);
              saveSession(s);
              if (s.rol === "MASTER") setView("MASTER_PANEL");
              else if (s.rol === "DT_ADMIN") setView("DT_PANEL");
              else if (s.rol === "KURUMSAL") setView("KURUMSAL_PANEL");
              else if (s.rol === "ISLETME") setView("ISLETME_PANEL");
              else setView("VITRIN"); // USER ve diÃ„Å¸er roller Ã¢â€ ' ana sayfaya yÃƒÂ¶nlendir
            }}
          />
        )}

        {view === "KURUMSAL_PANEL" && (
          <KurumsalPanel key="kurumsal" onCikis={handleLogout} onKapat={() => setView("VITRIN")} />
        )}

        {view === "ISLETME_PANEL" && (
          <IsletmePanel key="isletme" session={session} onCikis={handleLogout} onKapat={() => setView("VITRIN")} />
        )}

        {view === "USER_PANEL" && (
          <UserPanel key="userp" session={session} onCikis={handleLogout} onKapat={() => setView("VITRIN")} />
        )}

        {view === "DT_PANEL" && (
          <TheaterAdminPanel key="dt" onCikis={handleLogout} onKapat={() => setView("VITRIN")} />
        )}

        {view === "MASTER_PANEL" && (
          <MasterPanel key="mp"
            session={session}
            onCikis={handleLogout}
            onKapat={() => setView("VITRIN")} />
        )}
      </AnimatePresence>
    </div>
  );
}





