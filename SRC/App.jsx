import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── BİLEŞEN IMPORTLARI ──────────────────────────────────────────
import OnboardingScreen   from './components/OnboardingScreen';
import KategoriVitrin     from './components/KategoriVitrin';
import AuthGateway        from './components/AuthGateway';
import TheaterAdminPanel  from './components/TheaterAdminPanel'; // v8 içeriği
import MasterPanel        from './components/MasterPanel';        // v2 içeriği
import TimeSuggestion     from './components/TimeSuggestion';

// ─── SERVİS IMPORTLARI ───────────────────────────────────────────
import { routeAndProcess } from './services/aiService';
import { haversineMeters } from './utils/distance';

const ANTALYA_CENTER = { lat: 36.8841, lng: 30.7056 };

export default function App() {
  // ─── STATE YÖNETİMİ ──────────────────────────────────────────────
  const [view, setView] = useState("MAIN"); // MAIN, AUTH, DT_PANEL, MASTER_PANEL
  const [session, setSession] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [userCoords, setUserCoords] = useState(ANTALYA_CENTER);
  
  // Arama Motoru State'leri
  const [appState, setAppState] = useState('IDLE'); // IDLE, ANALYZING, RESULT
  const [query, setQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);

  // ─── INITIAL CHECK (ONBOARDING & SESSION) ───────────────────────
  useEffect(() => {
    const completed = localStorage.getItem("nar_onboarding_completed");
    if (completed) {
      setShowOnboarding(false);
      const savedLang = localStorage.getItem("nar_lang_preference");
      setSession(prev => ({ ...prev, lang: savedLang || "TR" }));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  // ─── HANDLERS ────────────────────────────────────────────────────
  const handleOnboardingDone = (data) => {
    // data: { lang: "TR", coords: { lat, lng } }
    localStorage.setItem("nar_onboarding_completed", "true");
    localStorage.setItem("nar_lang_preference", data.lang);
    if (data.coords) setUserCoords(data.coords);
    setSession({ lang: data.lang, coords: data.coords });
    setShowOnboarding(false);
  };

  const handleAuth = (ses) => {
    // Rol bilgisini ve kullanıcı adını session'a perçinle
    setSession(prev => ({ ...prev, ...ses }));
    
    if (ses.rol === "DT_ADMIN") setView("DT_PANEL");
    else if (ses.rol === "MASTER") setView("MASTER_PANEL");
    else setView("MAIN");
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setAppState('ANALYZING');
    try {
      const result = await routeAndProcess(query, userCoords);
      if (result) {
        setSelectedVenue(result);
        setAppState('RESULT');
      } else {
        setAppState('IDLE');
      }
    } catch (err) { setAppState('IDLE'); }
  };

  const handleCikis = () => {
    setSession(null);
    setView("MAIN");
  };

  // ─── RENDER ────────────────────────────────────────────────────────
  if (showOnboarding === null) return null; // Yükleme anında boş ekran

  return (
    <div className="app-wrap theme-obsidian" style={{ background: "#0a0a0f", minHeight: "100vh", color: "#eee" }}>
      
      <AnimatePresence mode="wait">
        {/* 1. ONBOARDING EKRANI (İLK GİRİŞ) */}
        {showOnboarding ? (
          <OnboardingScreen key="ob" onDone={handleOnboardingDone} />
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* ── HEADER ── */}
            {view === "MAIN" && (
              <header style={styles.header}>
                <div style={styles.logo}>🍎 NAR REHBERİ</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                   {session?.ad && <span style={{ fontSize: 10, color: "#D4AF37", opacity: 0.7 }}>{session.ad.toUpperCase()}</span>}
                   <button onClick={() => setView("AUTH")} style={styles.adminBtn}>
                     {session ? "YÖNETİM" : "GİRİŞ"}
                   </button>
                </div>
              </header>
            )}

            <AnimatePresence mode="wait">
              {/* 🟢 ANA VİTRİN VE ARAMA EKRANI */}
              {view === "MAIN" && (
                <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <main style={{ padding: "20px" }}>
                    
                    {/* Arama Bölümü */}
                    <section style={styles.searchSection}>
                      <h1 style={styles.heroTitle}>Ne arıyorsun Kadir?</h1>
                      <form onSubmit={handleSearch} style={styles.searchForm}>
                        <input 
                          className="search-input-v75" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Mekan, hizmet veya sanat..." 
                          style={styles.input}
                        />
                        <button type="submit" style={styles.searchBtn}>BUL</button>
                      </form>
                    </section>

                    {/* Kategori Vitrini */}
                    <KategoriVitrin 
                      coords={userCoords} 
                      lang={localStorage.getItem("nar_lang_preference") || "TR"} 
                    />
                    
                    <TimeSuggestion />
                  </main>
                </motion.div>
              )}

              {/* 🔐 GİRİŞ KAPISI (AuthGateway) */}
              {view === "AUTH" && (
                <AuthGateway 
                  key="auth" 
                  onClose={() => setView("MAIN")} 
                  onAuth={handleAuth} 
                />
              )}

              {/* 🎭 TİYATRO YETKİLİ PANELİ (TheaterAdminPanel v8) */}
              {view === "DT_PANEL" && (
                <motion.div key="dt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.fullscreenPanel}>
                  <TheaterAdminPanel onCikis={handleCikis} />
                </motion.div>
              )}

              {/* ⬡ MASTER ADMIN PANELİ (MasterPanel v2) */}
              {view === "MASTER_PANEL" && (
                <motion.div key="mp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.fullscreenPanel}>
                  <MasterPanel session={session} onCikis={handleCikis} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────────────
const styles = {
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "15px 25px", 
    background: "#111118", 
    borderBottom: "1px solid rgba(212,175,55,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  logo: { color: "#D4AF37", fontWeight: "bold", letterSpacing: "2px", fontFamily: "serif" },
  adminBtn: { 
    background: "none", 
    border: "1px solid #D4AF37", 
    color: "#D4AF37", 
    padding: "6px 15px", 
    borderRadius: "4px", 
    fontSize: "10px", 
    cursor: "pointer",
    letterSpacing: "0.1em"
  },
  searchSection: { textAlign: "center", margin: "40px 0" },
  heroTitle: { fontSize: "28px", marginBottom: "20px", color: "#fff", fontFamily: "serif" },
  searchForm: { maxWidth: "450px", margin: "0 auto", display: "flex", gap: "10px" },
  input: { 
    flex: 1, 
    padding: "12px", 
    borderRadius: "8px", 
    border: "1px solid rgba(212,175,55,0.3)", 
    background: "rgba(255,255,255,0.05)", 
    color: "#fff",
    outline: "none"
  },
  searchBtn: { 
    padding: "0 20px", 
    background: "#D4AF37", 
    border: "none", 
    borderRadius: "8px", 
    color: "#000",
    fontWeight: "bold", 
    cursor: "pointer" 
  },
  fullscreenPanel: { 
    position: "fixed", 
    inset: 0, 
    zIndex: 1000, 
    background: "#0a0a0f", 
    overflowY: "auto" 
  }
};