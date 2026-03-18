/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — AUTH GATEWAY (Giriş Kapısı - ONARILMIŞ)      ║
 * ║     AuthGateway.jsx                                             ║
 * ║                                                                  ║
 * ║     Düzeltme: onAuth tetiklendiğinde modal artık donmuyor.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── SABITLER ────────────────────────────────────────────────────────────────

const GOLD        = "#D4AF37";
const GOLD_DIM    = "rgba(212,175,55,0.10)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_1   = "#0d0d12";
const SURFACE_2   = "#13131a";
const SURFACE_3   = "#1c1c26";
const TEXT_PRI    = "rgba(240,234,218,0.93)";
const TEXT_MUT    = "rgba(180,170,150,0.55)";
const DANGER      = "#c0604a";

// Mock kimlik bilgileri
const MOCK_CREDENTIALS = {
  DT_ADMIN: { email: "yonetim@antalyadevlettiyatrosu.gov.tr", sifre: "DT2025" },
  MASTER:   { email: "admin@narrehberi.com",                  sifre: "NAR_MASTER" },
};

const ROLLER = [
  {
    id: "USER",
    etiket: "Bireysel Üyelik",
    altetiket: "Sinopsis dinle, mekan keşfet",
    ikon: "◈",
    renk: "#7090e0",
  },
  {
    id: "DT_ADMIN",
    etiket: "Kurumsal Giriş",
    altetiket: "Devlet Tiyatrosu Yetkilisi",
    ikon: "🎭",
    renk: GOLD,
  },
  {
    id: "MASTER",
    etiket: "Master Admin",
    altetiket: "Nar Rehberi Kurucu Erişimi",
    ikon: "⬡",
    renk: "#a070d0",
  },
];

// ─── YARDIMCILAR ─────────────────────────────────────────────────────────────

function GoldLine({ delay = 0 }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD} 40%, ${GOLD} 60%, transparent)`,
        transformOrigin: "left",
        opacity: 0.5,
        marginBottom: 24,
      }}
    />
  );
}

function InputField({ label, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...styles.input,
          borderColor: focused ? GOLD : GOLD_BORDER,
        }}
      />
    </div>
  );
}

// ─── FORMLAR ─────────────────────────────────────────────────────────────────

function UserForm({ onSuccess }) {
  const [mod, setMod] = useState("giris");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);

  const gonder = async () => {
    if (!email || !sifre) { setHata("Lütfen tüm alanları doldurun."); return; }
    setHata(""); setYuk(true);
    await new Promise(r => setTimeout(r, 1200));
    setYuk(false);
    onSuccess({ rol: "USER", ad: ad || email.split("@")[0] });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["giris", "kayit"].map(m => (
          <button key={m} onClick={() => setMod(m)}
            style={{ ...styles.tabPill, ...(mod === m ? styles.tabPillActive : {}) }}>
            {m === "giris" ? "Giriş Yap" : "Üye Ol"}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={mod} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
          {mod === "kayit" && <InputField label="Adınız" value={ad} onChange={e => setAd(e.target.value)} placeholder="Kadir Yılmaz" />}
          <InputField label="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" />
          <InputField label="Şifre" type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="••••••••" />
        </motion.div>
      </AnimatePresence>
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket={mod === "giris" ? "GİRİŞ YAP" : "HESAP OLUŞTUR"} renk="#7090e0" />
    </div>
  );
}

function DTAdminForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);

  const gonder = async () => {
    if (!email || !sifre) { setHata("Lütfen kimlik bilgilerini girin."); return; }
    setHata(""); setYuk(true);
    await new Promise(r => setTimeout(r, 1500));
    setYuk(false);
    const dogru = MOCK_CREDENTIALS.DT_ADMIN;
    if (email === dogru.email && sifre === dogru.sifre) {
      onSuccess({ rol: "DT_ADMIN", ad: "Tiyatro Yetkilisi" });
    } else {
      setHata("Kimlik bilgileri hatalı.");
    }
  };

  return (
    <div>
      <div style={styles.kurumBox}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD }}>DEVLET TİYATROSU PROTOKOL ERİŞİMİ</span>
        <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>Bu alan yalnızca yetkili tiyatro personeline açıktır.</p>
      </div>
      <InputField label="Kurumsal E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yetkili@devlettiyatrosu.gov.tr" />
      <InputField label="Şifre" type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="••••••••" />
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket="KURUMSAL GİRİŞ" renk={GOLD} dark />
    </div>
  );
}

function MasterForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);

  const gonder = async () => {
    if (!email || !sifre || !kod) { setHata("Tüm alanlar zorunludur."); return; }
    setHata(""); setYuk(true);
    await new Promise(r => setTimeout(r, 1800));
    setYuk(false);
    const dogru = MOCK_CREDENTIALS.MASTER;
    if (email === dogru.email && sifre === dogru.sifre && kod === "NAR2025") {
      onSuccess({ rol: "MASTER", ad: "Kurucu" });
    } else {
      setHata("Erişim reddedildi.");
    }
  };

  return (
    <div>
      <div style={{ ...styles.kurumBox, borderColor: "rgba(160,112,208,0.35)" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "#a070d0" }}>⬡ KURUCU ERİŞİM KATMANI</span>
        <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>Bu kapı izlenmektedir.</p>
      </div>
      <InputField label="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="••••@narrehberi.com" />
      <InputField label="Master Şifre" type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="••••••••" />
      <InputField label="2FA Kodu" value={kod} onChange={e => setKod(e.target.value)} placeholder="NAR2025" />
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket="MASTER ERİŞİM" renk="#a070d0" />
    </div>
  );
}

function SubmitButton({ onClick, yukleniyor, etiket, renk, dark = false }) {
  return (
    <motion.button onClick={onClick} whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }} disabled={yukleniyor}
      style={{
        width: "100%", padding: "14px", borderRadius: 3, cursor: yukleniyor ? "not-allowed" : "pointer",
        background: dark ? `linear-gradient(135deg, ${renk}, #9a7820)` : `linear-gradient(135deg, ${renk}22, ${renk}44)`,
        border: `1px solid ${renk}55`, color: dark ? "#0a0a0f" : renk,
        fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
      {yukleniyor ? "Doğrulanıyor..." : etiket}
    </motion.button>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────

export default function AuthGateway({ onClose, onAuth }) {
  const [aktifRol, setAktifRol] = useState("USER");

  const handleAuth = (session) => {
    onAuth(session);
    // 🔥 DÜZELTME: onClose() buradan kaldırıldı. App.jsx görünümü değiştirecek.
  };

  const formMap = {
    USER:     <UserForm    onSuccess={handleAuth} />,
    DT_ADMIN: <DTAdminForm onSuccess={handleAuth} />,
    MASTER:   <MasterForm  onSuccess={handleAuth} />,
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && onClose()} style={styles.overlay}>
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} style={styles.modal}>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.25em", color: GOLD, opacity: 0.6, marginBottom: 6 }}>NAR REHBERİ — GİRİŞ KAPISI</p>
            <h2 style={{ fontFamily: "serif", fontSize: 22, color: TEXT_PRI, fontWeight: 700 }}>Erişim Düzeyinizi Seçin</h2>
          </div>
          <GoldLine delay={0.3} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {ROLLER.map((rol, i) => (
              <motion.button key={rol.id} onClick={() => setAktifRol(rol.id)} style={{ ...styles.rolBtn, ...(aktifRol === rol.id ? { background: `${rol.renk}12`, borderColor: `${rol.renk}44` } : {}) }}>
                <span style={{ fontSize: 16, minWidth: 24 }}>{rol.ikon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: aktifRol === rol.id ? rol.renk : TEXT_PRI }}>{rol.etiket}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUT }}>{rol.altetiket}</div>
                </div>
              </motion.button>
            ))}
          </div>
          <div style={styles.formArea}>
            <AnimatePresence mode="wait">
              <motion.div key={aktifRol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {formMap[aktifRol]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(4,4,8,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 },
  modal: { position: "relative", background: SURFACE_1, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "36px 32px", width: "100%", maxWidth: 460, boxShadow: "0 40px 100px rgba(0,0,0,0.8)" },
  closeBtn: { position: "absolute", top: 14, right: 16, background: "none", border: "none", cursor: "pointer", color: TEXT_MUT },
  rolBtn: { display: "flex", alignItems: "center", gap: 14, background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "12px 16px", cursor: "pointer", width: "100%" },
  formArea: { background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "20px" },
  label: { display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, opacity: 0.65, marginBottom: 8 },
  input: { display: "block", width: "100%", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "11px 14px", color: TEXT_PRI, outline: "none", boxSizing: "border-box" },
  tabPill: { flex: 1, background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: 20, padding: "8px 0", color: TEXT_MUT, cursor: "pointer" },
  tabPillActive: { background: GOLD_DIM, borderColor: GOLD, color: GOLD },
  kurumBox: { background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "14px 16px", marginBottom: 20 },
  hata: { fontSize: 11, color: DANGER, marginBottom: 14, padding: "8px", background: "rgba(192,96,74,0.08)", border: "1px solid rgba(192,96,74,0.2)" },
};
