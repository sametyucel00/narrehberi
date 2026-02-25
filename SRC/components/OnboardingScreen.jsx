/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  NAR REHBERİ — ONBOARDING v1                                   ║
 * ║  OnboardingScreen.jsx                                           ║
 * ║                                                                  ║
 * ║  Adım 1 · Karşılama  (tarayıcı dilini pulse ile göster)        ║
 * ║  Adım 2 · Dil Seçimi (4 dil, radyo + animasyon)                ║
 * ║  Adım 3 · Konum      (Geolocation API ya da atla)              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── TEMA ──────────────────────────────────────────────────────── */
const C = {
  bg:       "#0a0a0f",
  s2:       "#111118",
  s3:       "#18181f",
  gold:     "#D4AF37",
  goldDim:  "rgba(212,175,55,0.10)",
  goldBrd:  "rgba(212,175,55,0.20)",
  goldAlt:  "#b8922a",
  text:     "rgba(238,230,210,0.92)",
  muted:    "rgba(170,158,132,0.48)",
  ok:       "#4caf7d",
  danger:   "#c0604a",
};

/* ─── DİL VERİSİ ────────────────────────────────────────────────── */
const LANGS = [
  {
    code:    "TR",
    flag:    "🇹🇷",
    label:   "Türkçe",
    welcome: "Hoş Geldiniz",
    sub:     "Antalya'nın ruhunu keşfedin",
    cta:     "Keşfetmeye Başla",
    next:    "Devam Et",
    skip:    "Konumsuz Devam Et",
    locHd:   "Konumunuz",
    locSub:  "En yakın Nar Seçimi deneyimleri için",
    locBtn:  "Konumu Paylaş",
    detect:  "Tarayıcı dili algılandı",
    prefixes:["tr"],
  },
  {
    code:    "EN",
    flag:    "🇬🇧",
    label:   "English",
    welcome: "Welcome",
    sub:     "Discover the soul of Antalya",
    cta:     "Begin Exploring",
    next:    "Continue",
    skip:    "Continue without location",
    locHd:   "Your Location",
    locSub:  "To show the nearest Nar's Choice experiences",
    locBtn:  "Share Location",
    detect:  "Browser language detected",
    prefixes:["en"],
  },
  {
    code:    "RU",
    flag:    "🇷🇺",
    label:   "Русский",
    welcome: "Добро пожаловать",
    sub:     "Откройте душу Анталии",
    cta:     "Начать исследование",
    next:    "Продолжить",
    skip:    "Продолжить без геолокации",
    locHd:   "Ваше местоположение",
    locSub:  "Чтобы найти ближайшие места",
    locBtn:  "Поделиться локацией",
    detect:  "Язык браузера определён",
    prefixes:["ru"],
  },
  {
    code:    "DE",
    flag:    "🇩🇪",
    label:   "Deutsch",
    welcome: "Willkommen",
    sub:     "Entdecken Sie die Seele Antalyas",
    cta:     "Erkunden beginnen",
    next:    "Weiter",
    skip:    "Ohne Standort fortfahren",
    locHd:   "Ihr Standort",
    locSub:  "Für die nächsten Nar-Auswahl-Erlebnisse",
    locBtn:  "Standort teilen",
    detect:  "Browsersprache erkannt",
    prefixes:["de"],
  },
];

function detectLang() {
  const nav = (navigator.languages || [navigator.language || "en"])
    .map(l => l.toLowerCase().slice(0, 2));
  for (const n of nav) {
    const found = LANGS.find(l => l.prefixes.includes(n));
    if (found) return found.code;
  }
  return "TR";
}

/* ─── YARDIMCI: NARCİCEĞİ SVG ──────────────────────────────────── */
function PomegranateIcon({ size = 64 }) {
  const seeds = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r = 13;
    return { x: 32 + r * Math.cos(a), y: 34 + r * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="36" r="22" fill={C.goldDim} stroke={C.gold}
        strokeWidth="1"/>
      {/* Taç */}
      <path d="M25 16 Q28 10 32 14 Q36 8 38 14 Q41 10 44 16"
        stroke={C.gold} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M25 16 Q32 12 44 16" stroke={C.gold} strokeWidth="1"
        fill="none"/>
      {/* Tohumlar */}
      {seeds.map((s, i) => (
        <motion.circle key={i} cx={s.x} cy={s.y} r="3.2"
          fill={C.gold}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity,
            delay: i * 0.18, ease: "easeInOut" }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
        />
      ))}
      <circle cx="32" cy="36" r="6" fill={C.gold} opacity="0.18"/>
    </svg>
  );
}

/* ─── ADIM 1: KARŞILAMA ─────────────────────────────────────────── */
function StepWelcome({ lang, onNext }) {
  const L = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <motion.div key="welcome"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.55 }}
      style={sty.stepWrap}>

      {/* Nar ikonu */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", bounce: 0.45 }}
        style={{ marginBottom: 8 }}>
        <PomegranateIcon size={72} />
      </motion.div>

      {/* Ayraç çizgisi */}
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        style={{ width: 72, height: 1, margin: "12px auto 20px",
          background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>

      {/* Servis adı */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ fontFamily:"'Cormorant Garamond','Garamond',serif",
          fontSize: 10, letterSpacing: "0.34em", color: C.gold,
          opacity: 0.65, marginBottom: 10,
          textTransform: "uppercase" }}>
        Nar Rehberi
      </motion.p>

      {/* Ana başlık */}
      <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.82, duration: 0.6 }}
        style={{ fontFamily:"'Cormorant Garamond','Garamond',serif",
          fontSize: 44, fontWeight: 700, color: C.text,
          letterSpacing: "0.02em", lineHeight: 1.1,
          marginBottom: 10, textAlign: "center" }}>
        {L.welcome}
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
        style={{ fontSize: 13, color: C.muted,
          letterSpacing: "0.07em", marginBottom: 36,
          textAlign: "center" }}>
        {L.sub}
      </motion.p>

      {/* Algılama balonu */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ background: C.s3, border: `1px solid ${C.goldBrd}`,
          borderRadius: 6, padding: "11px 16px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 10 }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: "50%",
            background: C.ok, flexShrink: 0, display: "block" }}/>
        <span style={{ fontSize: 11, color: C.muted }}>
          {L.detect}: <span style={{ color: C.gold }}>{L.flag} {L.label}</span>
        </span>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35 }}
        onClick={onNext}
        whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.965 }}
        style={sty.btnGold}>
        {L.cta} →
      </motion.button>
    </motion.div>
  );
}

/* ─── ADIM 2: DİL ───────────────────────────────────────────────── */
function StepLang({ selected, onSelect, onNext, onBack }) {
  const L = LANGS.find(l => l.code === selected) || LANGS[0];

  return (
    <motion.div key="lang"
      initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -48 }} transition={{ duration: 0.38 }}
      style={sty.stepWrap}>

      <Dots active={1} />

      <p style={sty.stepLabel}>2 / 3 — Dil Tercihi</p>
      <h2 style={sty.stepTitle}>Dilinizi Seçin</h2>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 28,
        letterSpacing: "0.06em", textAlign: "center" }}>
        Choose · Выберите · Wählen Sie
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap: 9,
        marginBottom: 28 }}>
        {LANGS.map((l, i) => {
          const active = selected === l.code;
          return (
            <motion.button key={l.code}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(l.code)}
              whileHover={{ x: 4 }}
              style={{
                display:"flex", alignItems:"center", gap: 14,
                padding:"13px 16px",
                background: active ? C.goldDim : C.s3,
                border:`1px solid ${active ? C.gold : C.goldBrd}`,
                borderRadius: 5, cursor:"pointer",
                transition:"all 0.2s",
              }}>
              {/* Radyo */}
              <div style={{ width:18, height:18, borderRadius:"50%",
                border:`1.5px solid ${active ? C.gold : C.goldBrd}`,
                background: active ? C.gold : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, transition:"all 0.18s" }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ width:7, height:7, borderRadius:"50%",
                      background: C.bg }} />
                )}
              </div>

              <span style={{ fontSize:22, flexShrink:0 }}>{l.flag}</span>

              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:14, color: active ? C.gold : C.text,
                  fontWeight: active ? 600 : 400,
                  letterSpacing:"0.03em" }}>
                  {l.label}
                </div>
                <div style={{ fontSize:10, color:C.muted,
                  marginTop:2, letterSpacing:"0.07em" }}>
                  {l.sub}
                </div>
              </div>

              {active && (
                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{ fontSize:9, color:C.gold,
                    letterSpacing:"0.14em" }}>
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onBack} style={sty.btnGhost}>← Geri</button>
        <motion.button onClick={onNext}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          style={{ ...sty.btnGold, flex:1 }}>
          {L.next} →
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── ADIM 3: KONUM ─────────────────────────────────────────────── */
function StepLocation({ lang, onDone }) {
  const L = LANGS.find(l => l.code === lang) || LANGS[0];
  const [status, setStatus] = useState("idle"); // idle|loading|ok|denied

  const requestLocation = () => {
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setStatus("ok");
        setTimeout(() => onDone({
          lang,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }), 1000);
      },
      () => {
        setStatus("denied");
        setTimeout(() => onDone({
          lang,
          coords: { lat: 36.8969, lng: 30.7133 }, // Antalya merkezi
        }), 1000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <motion.div key="loc"
      initial={{ opacity:0, x:48 }} animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:-48 }} transition={{ duration:0.38 }}
      style={sty.stepWrap}>

      <Dots active={2} />

      <p style={sty.stepLabel}>3 / 3 — Konum</p>

      {/* Animasyonlu ikon */}
      <motion.div
        animate={status === "loading"
          ? { scale:[1,1.12,1], opacity:[1,0.55,1] }
          : status === "ok"
            ? { scale:1.1, opacity:1 }
            : { scale:1, opacity:1 }}
        transition={{ duration:1.1, repeat: status === "loading" ? Infinity : 0 }}
        style={{ fontSize:52, textAlign:"center", margin:"16px 0 18px",
          filter: status === "ok" ? `drop-shadow(0 0 14px ${C.ok})` : "none" }}>
        {status === "ok" ? "✓" : status === "denied" ? "📍" : "◎"}
      </motion.div>

      <h2 style={{ ...sty.stepTitle, marginBottom:8 }}>{L.locHd}</h2>
      <p style={{ fontSize:12, color:C.muted, marginBottom:32,
        textAlign:"center", lineHeight:1.7,
        letterSpacing:"0.05em" }}>
        {L.locSub}
      </p>

      <AnimatePresence mode="wait">
        {status === "ok" || status === "denied" ? (
          <motion.p key="done"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ textAlign:"center", fontSize:12,
              color: status === "ok" ? C.ok : C.muted,
              letterSpacing:"0.09em" }}>
            {status === "ok" ? "✓ Konum alındı" : "📍 Antalya merkezi kullanılıyor"}
          </motion.p>
        ) : status === "loading" ? (
          <motion.div key="spin" style={{ display:"flex",
            justifyContent:"center" }}>
            <motion.div animate={{ rotate:360 }}
              transition={{ duration:0.9, repeat:Infinity, ease:"linear" }}
              style={{ width:26, height:26,
                border:`2px solid ${C.goldBrd}`,
                borderTopColor: C.gold, borderRadius:"50%" }}/>
          </motion.div>
        ) : (
          <motion.div key="btns"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <motion.button onClick={requestLocation}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              style={sty.btnGold}>
              ◎ {L.locBtn}
            </motion.button>
            <button
              onClick={() => onDone({ lang, coords:null })}
              style={sty.btnGhost}>
              {L.skip}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ fontSize:10, color:C.muted, marginTop:24,
        textAlign:"center", lineHeight:1.7, opacity:0.65 }}>
        Konum verisi yalnızca mesafe sıralaması için kullanılır,
        <br/>sunucularımıza gönderilmez.
      </p>
    </motion.div>
  );
}

/* ─── YARDIMCI: DOTS ────────────────────────────────────────────── */
function Dots({ active }) {
  return (
    <div style={{ display:"flex", gap:6, justifyContent:"center",
      marginBottom:28 }}>
      {[0,1,2].map(i => (
        <motion.div key={i}
          animate={{ width: i===active ? 22 : 6,
            background: i <= active ? C.gold : C.goldBrd }}
          transition={{ duration:0.3 }}
          style={{ height:3, borderRadius:3 }}/>
      ))}
    </div>
  );
}

/* ─── ANA BİLEŞEN ───────────────────────────────────────────────── */
export default function OnboardingScreen({ onDone }) {
  const [step, setStep]     = useState(0);
  const [lang, setLang]     = useState("TR");

  useEffect(() => { setLang(detectLang()); }, []);

  // 40 adet titreşen yıldız
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    r: Math.random()*1.4+0.4, d: Math.random()*5,
  }));

  return (
    <div style={sty.root}>
      {/* Yıldız örgüsü */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {stars.map(s => (
          <motion.div key={s.id}
            animate={{ opacity:[0.08, 0.55, 0.08] }}
            transition={{ duration:3+s.d, repeat:Infinity, delay:s.d }}
            style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
              width:s.r, height:s.r, borderRadius:"50%",
              background: C.gold }}/>
        ))}
      </div>

      {/* Halka efekti */}
      <div style={{ position:"absolute", width:480, height:480,
        borderRadius:"50%", border:`1px solid ${C.goldBrd}`,
        top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        pointerEvents:"none", opacity:0.25,
        boxShadow:`0 0 90px rgba(212,175,55,0.07) inset` }}/>

      <div style={sty.card}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepWelcome key="w" lang={lang}
              onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepLang key="l" selected={lang}
              onSelect={setLang}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <StepLocation key="lo" lang={lang}
              onDone={onDone} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── STİLLER ───────────────────────────────────────────────────── */
const sty = {
  root: {
    position:"fixed", inset:0,
    background: C.bg,
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:1000, overflow:"hidden",
    fontFamily:"'Segoe UI',system-ui,sans-serif",
  },
  card: {
    position:"relative", zIndex:1,
    width:"100%", maxWidth:400,
    padding:"0 22px",
  },
  stepWrap: {
    display:"flex", flexDirection:"column", alignItems:"stretch",
  },
  stepLabel: {
    fontFamily:"'Cormorant Garamond','Garamond',serif",
    fontSize:10, letterSpacing:"0.26em",
    color: C.gold, opacity:0.65,
    marginBottom:14, textAlign:"center",
    textTransform:"uppercase",
  },
  stepTitle: {
    fontFamily:"'Cormorant Garamond','Garamond',serif",
    fontSize:28, fontWeight:700,
    color: C.text, letterSpacing:"0.02em",
    marginBottom:8, textAlign:"center",
  },
  btnGold: {
    padding:"14px 22px",
    background:`linear-gradient(135deg,${C.gold},${C.goldAlt})`,
    border:"none", borderRadius:4,
    color:"#08080d", fontSize:12, fontWeight:700,
    letterSpacing:"0.13em", textTransform:"uppercase",
    cursor:"pointer", width:"100%",
  },
  btnGhost: {
    padding:"12px 22px",
    background:"none",
    border:`1px solid ${C.goldBrd}`,
    borderRadius:4, color: C.muted,
    fontSize:11, letterSpacing:"0.1em",
    cursor:"pointer", width:"100%",
  },
};