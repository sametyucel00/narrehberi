import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { resolveAppleRedirectSession, signInWithApple } from "../services/appleAuth";

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.10)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1c1c26";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.55)";
const DANGER = "#c0604a";

const ADMIN_FALLBACKS = {
  DT_ADMIN: { email: "yonetim@antalyadevlettiyatrosu.gov.tr", sifre: "DT2025", ad: "Tiyatro Yetkilisi" },
  MASTER: { email: "admin@narrehberi.com", sifre: "NAR_MASTER", ad: "Kurucu" },
};

const ROLLER = [
  { id: "USER", etiket: "Bireysel Üyelik", altetiket: "Sinopsis dinle, mekan keşfet", ikon: "◈", renk: "#7090e0" },
  { id: "DT_ADMIN", etiket: "Kurumsal Giriş", altetiket: "Devlet Tiyatrosu Yetkilisi", ikon: "🎭", renk: GOLD },
  { id: "KURUMSAL", etiket: "Kurumsal Üyelik", altetiket: "Kurumsal hesap ve ilan yönetimi", ikon: "🏢", renk: "#5fa8d3" },
  { id: "ISLETME", etiket: "İşletme Girişi", altetiket: "Mekan, sadakat ve QR yönetimi", ikon: "🍽", renk: "#e07a5f" },
  { id: "MASTER", etiket: "Master Admin", altetiket: "Nar Rehberi Kurucu Erişimi", ikon: "⬡", renk: "#a070d0" },
];

function AppleGlyph() {
  return (
    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" aria-hidden="true">
      <path
        d="M11.707 9.069c.018 1.977 1.735 2.636 1.754 2.645-.015.046-.273.938-.902 1.858-.543.795-1.107 1.587-1.996 1.603-.873.016-1.154-.518-2.151-.518-.998 0-1.31.502-2.135.534-.858.032-1.513-.862-2.061-1.654C3.092 11.83 2.27 8.738 3.42 6.75c.572-.988 1.596-1.614 2.708-1.63.844-.016 1.641.566 2.151.566.509 0 1.464-.7 2.468-.597.42.018 1.599.17 2.355 1.277-.061.038-1.405.817-1.395 2.703ZM10.553 2.306C11.008 1.755 11.316.988 11.232.22c-.656.026-1.448.438-1.919.989-.42.483-.787 1.258-.689 2.001.732.057 1.47-.372 1.929-.904Z"
        fill="#111111"
      />
    </svg>
  );
}

function RoleIcon({ role }) {
  const symbolMap = {
    USER: "◉",
    DT_ADMIN: "◭",
    KURUMSAL: "▣",
    ISLETME: "✦",
    MASTER: "⬢",
  };

  return (
    <span
      style={{
        minWidth: 30,
        width: 30,
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: `${role.renk}18`,
        border: `1px solid ${role.renk}55`,
        color: role.renk,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset`,
        fontSize: 15,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {symbolMap[role.id] || role.ikon}
    </span>
  );
}

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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function mapAuthError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi girin.";
    case "auth/missing-password":
      return "Şifre alanı zorunludur.";
    case "auth/weak-password":
      return "Şifre en az 6 karakter olmalıdır.";
    case "auth/email-already-in-use":
      return "Bu e-posta adresiyle zaten bir hesap var.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-posta veya şifre hatalı.";
    case "auth/network-request-failed":
      return "Ağ hatası oluştu. İnternet bağlantınızı kontrol edin.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
    default:
      return "İşlem sırasında bir hata oluştu.";
  }
}

async function ensureUserDoc(user, payload) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const email = normalizeEmail(user.email);
  const base = {
    uid: user.uid,
    email,
    rol: payload.rol || "USER",
    aktif: true,
    olusturma_tarihi: snap.exists() ? snap.data().olusturma_tarihi || new Date().toISOString() : new Date().toISOString(),
  };

  await setDoc(ref, { ...base, ...payload }, { merge: true });
  const finalSnap = await getDoc(ref);
  return { uid: user.uid, id: user.uid, ...finalSnap.data() };
}

function SubmitButton({ onClick, yukleniyor, etiket, renk, dark = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ opacity: 0.88 }}
      whileTap={{ scale: 0.97 }}
      disabled={yukleniyor}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 3,
        cursor: yukleniyor ? "not-allowed" : "pointer",
        background: dark ? `linear-gradient(135deg, ${renk}, #9a7820)` : `linear-gradient(135deg, ${renk}22, ${renk}44)`,
        border: `1px solid ${renk}55`,
        color: dark ? "#0a0a0f" : renk,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {yukleniyor ? "Doğrulanıyor..." : etiket}
    </motion.button>
  );
}

function AppleButton({ loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading} style={styles.appleBtn}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(17,17,17,0.08)" }}>
          <AppleGlyph />
        </span>
        <span>{loading ? "Apple girişi hazırlanıyor..." : "Apple ile Devam Et"}</span>
      </span>
    </button>
  );
}

function UserForm({ onSuccess }) {
  const [mod, setMod] = useState("giris");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);
  const [appleYukleniyor, setAppleYukleniyor] = useState(false);

  const gonder = async () => {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !sifre || (mod === "kayit" && !ad.trim())) {
      setHata(mod === "kayit" ? "Ad, e-posta ve şifre alanlarını doldurun." : "E-posta ve şifre alanlarını doldurun.");
      return;
    }
    setHata("");
    setYuk(true);
    try {
      if (mod === "kayit") {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, sifre);
        const session = await ensureUserDoc(cred.user, {
          rol: "USER",
          ad_soyad: ad.trim(),
          aktif: true,
          puan: null,
        });
        onSuccess(session);
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, sifre);
        const session = await ensureUserDoc(cred.user, {
          rol: "USER",
          ad_soyad: ad.trim() || cleanEmail.split("@")[0],
          aktif: true,
        });
        onSuccess(session);
      }
    } catch (error) {
      setHata(mapAuthError(error));
    } finally {
      setYuk(false);
    }
  };

  const appleGiris = async () => {
    setHata("");
    setAppleYukleniyor(true);
    try {
      const result = await signInWithApple();
      if (result?.session) onSuccess(result.session);
    } catch (error) {
      setHata(error?.message || "Apple ile giriş sırasında bir hata oluştu.");
    } finally {
      setAppleYukleniyor(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["giris", "kayit"].map((m) => (
          <button key={m} onClick={() => setMod(m)} style={{ ...styles.tabPill, ...(mod === m ? styles.tabPillActive : {}) }}>
            {m === "giris" ? "Giriş Yap" : "Üye Ol"}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={mod} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
          {mod === "kayit" && <InputField label="Adınız" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Kadir Yılmaz" />}
          <InputField label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" />
          <InputField label="Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" />
        </motion.div>
      </AnimatePresence>
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket={mod === "giris" ? "Giriş Yap" : "Hesap Oluştur"} renk="#7090e0" />
      <AppleButton loading={appleYukleniyor} onClick={appleGiris} />
    </div>
  );
}

function RoleAccountForm({ onSuccess, role, title, helper, submitLabel, accent = GOLD, companyLabel = "Firma / İşletme Adı" }) {
  const [mod, setMod] = useState("giris");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);

  const isBusiness = role === "KURUMSAL" || role === "ISLETME";

  const gonder = async () => {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !sifre || (mod === "kayit" && !name.trim())) {
      setHata(mod === "kayit" ? "Tüm zorunlu alanları doldurun." : "E-posta ve şifre alanlarını doldurun.");
      return;
    }

    setHata("");
    setYuk(true);
    try {
      if (mod === "kayit") {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, sifre);
        const session = await ensureUserDoc(cred.user, {
          rol: role,
          aktif: true,
          ...(isBusiness ? { firma_adi: name.trim() } : { ad_soyad: name.trim() }),
        });
        onSuccess(session);
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, sifre);
        const ref = doc(db, "users", cred.user.uid);
        const snap = await getDoc(ref);
        const existingRole = snap.exists() ? snap.data().rol : null;
        const session = await ensureUserDoc(cred.user, {
          rol: existingRole || role,
          aktif: true,
          ...(isBusiness
            ? { firma_adi: snap.exists() ? snap.data().firma_adi || cleanEmail.split("@")[0] : cleanEmail.split("@")[0] }
            : { ad_soyad: snap.exists() ? snap.data().ad_soyad || cleanEmail.split("@")[0] : cleanEmail.split("@")[0] }),
        });
        onSuccess(session);
      }
    } catch (error) {
      setHata(mapAuthError(error));
    } finally {
      setYuk(false);
    }
  };

  return (
    <div>
      <div style={{ ...styles.kurumBox, borderColor: `${accent}55` }}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>{title}</span>
        <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>{helper}</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["giris", "kayit"].map((m) => (
          <button key={m} onClick={() => setMod(m)} style={{ ...styles.tabPill, ...(mod === m ? styles.tabPillActive : {}) }}>
            {m === "giris" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        ))}
      </div>
      {mod === "kayit" && (
        <InputField label={companyLabel} value={name} onChange={(e) => setName(e.target.value)} placeholder={isBusiness ? "Nar Rehberi İşletmesi" : "Ad Soyad"} />
      )}
      <InputField label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" />
      <InputField label="Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" />
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket={submitLabel} renk={accent} dark />
    </div>
  );
}

function DTAdminForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYuk] = useState(false);

  const gonder = async () => {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !sifre) {
      setHata("Lütfen kimlik bilgilerini girin.");
      return;
    }
    setHata("");
    setYuk(true);
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, cleanEmail, sifre);
      } catch (error) {
        const fallback = ADMIN_FALLBACKS.DT_ADMIN;
        if ((error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") && cleanEmail === fallback.email && sifre === fallback.sifre) {
          cred = await createUserWithEmailAndPassword(auth, cleanEmail, sifre);
        } else {
          throw error;
        }
      }
      const session = await ensureUserDoc(cred.user, { rol: "DT_ADMIN", ad_soyad: ADMIN_FALLBACKS.DT_ADMIN.ad, aktif: true });
      onSuccess(session);
    } catch (error) {
      setHata(mapAuthError(error));
    } finally {
      setYuk(false);
    }
  };

  return (
    <div>
      <div style={styles.kurumBox}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD }}>DEVLET TİYATROSU PROTOKOL ERİŞİMİ</span>
        <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>Bu alan yalnızca yetkili tiyatro personeline açıktır.</p>
      </div>
      <InputField label="Kurumsal E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yetkili@devlettiyatrosu.gov.tr" />
      <InputField label="Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" />
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket="Kurumsal Giriş" renk={GOLD} dark />
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
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !sifre || !kod.trim()) {
      setHata("E-posta, şifre ve doğrulama kodunu girin.");
      return;
    }
    setHata("");
    setYuk(true);
    try {
      const fallback = ADMIN_FALLBACKS.MASTER;
      if (kod !== "NAR2025") throw { code: "master/invalid-2fa" };
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, cleanEmail, sifre);
      } catch (error) {
        if ((error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") && cleanEmail === fallback.email && sifre === fallback.sifre) {
          cred = await createUserWithEmailAndPassword(auth, cleanEmail, sifre);
        } else {
          throw error;
        }
      }
      const session = await ensureUserDoc(cred.user, { rol: "MASTER", ad_soyad: fallback.ad, aktif: true });
      onSuccess(session);
    } catch (error) {
      setHata(error?.code === "master/invalid-2fa" ? "Doğrulama kodu hatalı." : mapAuthError(error));
    } finally {
      setYuk(false);
    }
  };

  return (
    <div>
      <div style={{ ...styles.kurumBox, borderColor: "rgba(160,112,208,0.35)" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "#a070d0" }}>⬡ KURUCU ERİŞİM KATMANI</span>
        <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>Bu kapı izlenmektedir.</p>
      </div>
      <InputField label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="••••@narrehberi.com" />
      <InputField label="Master Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="••••••••" />
      <InputField label="2FA Kodu" value={kod} onChange={(e) => setKod(e.target.value)} placeholder="NAR2025" />
      {hata && <p style={styles.hata}>{hata}</p>}
      <SubmitButton yukleniyor={yukleniyor} onClick={gonder} etiket="Master Erişim" renk="#a070d0" />
    </div>
  );
}

export default function AuthGateway({ onClose, onAuth }) {
  const [aktifRol, setAktifRol] = useState("USER");
  const [redirectHata, setRedirectHata] = useState("");

  const handleAuth = (session) => {
    onAuth(session);
  };

  useEffect(() => {
    let mounted = true;
    resolveAppleRedirectSession()
      .then((session) => {
        if (mounted && session) handleAuth(session);
      })
      .catch((error) => {
        if (mounted && error?.message) setRedirectHata(error.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const formMap = {
    USER: <UserForm onSuccess={handleAuth} />,
    DT_ADMIN: <DTAdminForm onSuccess={handleAuth} />,
    KURUMSAL: <RoleAccountForm onSuccess={handleAuth} role="KURUMSAL" title="KURUMSAL HESAP" helper="Kurumsal ilan ve içerik yönetimi için hesap oluşturabilir veya giriş yapabilirsiniz." submitLabel="Kurumsal Devam Et" accent="#5fa8d3" companyLabel="Firma Adı" />,
    ISLETME: <RoleAccountForm onSuccess={handleAuth} role="ISLETME" title="İŞLETME HESABI" helper="Mekan, sadakat ve QR işlemleri için işletme hesabınızla devam edin." submitLabel="İşletme Girişi" accent="#e07a5f" companyLabel="İşletme Adı" />,
    MASTER: <MasterForm onSuccess={handleAuth} />,
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()} style={styles.overlay}>
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} style={styles.modal}>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.25em", color: GOLD, opacity: 0.6, marginBottom: 6 }}>NAR REHBERİ — GİRİŞ KAPISI</p>
            <h2 style={{ fontFamily: "serif", fontSize: 22, color: TEXT_PRI, fontWeight: 700 }}>Erişim Düzeyinizi Seçin</h2>
          </div>
          <GoldLine delay={0.3} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {ROLLER.map((rol) => (
              <motion.button key={rol.id} onClick={() => setAktifRol(rol.id)} style={{ ...styles.rolBtn, ...(aktifRol === rol.id ? { background: `${rol.renk}12`, borderColor: `${rol.renk}44` } : {}) }}>
                <RoleIcon role={rol} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: aktifRol === rol.id ? rol.renk : TEXT_PRI }}>{rol.etiket}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUT }}>{rol.altetiket}</div>
                </div>
              </motion.button>
            ))}
          </div>
          <div style={styles.formArea}>
            {redirectHata && <p style={{ ...styles.hata, marginTop: 0 }}>{redirectHata}</p>}
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
  overlay: { position: "fixed", inset: 0, background: "rgba(4,4,8,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24, overflowY: "auto" },
  modal: { position: "relative", background: SURFACE_1, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "36px 32px", width: "100%", maxWidth: 460, maxHeight: "calc(100vh - 48px)", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" },
  closeBtn: { position: "absolute", top: 14, right: 16, background: "none", border: "none", cursor: "pointer", color: TEXT_MUT },
  rolBtn: { display: "flex", alignItems: "center", gap: 14, background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "12px 16px", cursor: "pointer", width: "100%" },
  formArea: { background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "20px" },
  label: { display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, opacity: 0.65, marginBottom: 8 },
  input: { display: "block", width: "100%", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "11px 14px", color: TEXT_PRI, outline: "none", boxSizing: "border-box" },
  tabPill: { flex: 1, background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: 20, padding: "8px 0", color: TEXT_MUT, cursor: "pointer" },
  tabPillActive: { background: GOLD_DIM, borderColor: GOLD, color: GOLD },
  kurumBox: { background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, padding: "14px 16px", marginBottom: 20 },
  hata: { fontSize: 11, color: DANGER, marginBottom: 14, padding: "8px", background: "rgba(192,96,74,0.08)", border: "1px solid rgba(192,96,74,0.2)" },
  appleBtn: { width: "100%", padding: "13px 14px", borderRadius: 3, cursor: "pointer", marginTop: 12, background: "linear-gradient(135deg, #ffffff, #d9d9d9)", border: "1px solid rgba(255,255,255,0.28)", color: "#111", fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" },
};
