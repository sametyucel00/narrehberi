import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── VERİ HAVUZU ────────────────────────────────────────────────────────────

const TIYATRO = [
  { ad: "Othello", mekan: "Haşim İşcan Kültür Merkezi", ipucu: "Kıskançlığın trajedisi bu gece sahnede." },
  { ad: "Beklenirken Godot", mekan: "Devlet Tiyatrosu Ana Sahne", ipucu: "Sizi de beklediği şeyden emin olmayan biri var." },
  { ad: "Medea", mekan: "Atatürk Kültür Merkezi", ipucu: "Sevginin en karanlık yüzü bu akşam aydınlanıyor." },
];

const ETKINLIKLER = [
  { tur: "Fuar", ad: "Cam Piramit Kitap Fuarı", detay: "Son 2 gün, 11:00–20:00." },
  { tur: "Konser", ad: "Boğaziçi Caz Festivali – Antalya Etabı", detay: "Açık hava, Karaalioğlu Parkı, 20:30." },
  { tur: "Sergi", ad: "Atatürk Müzesi – Dijital Anılar", detay: "Ücretsiz giriş, Cumartesi'ye kadar." },
];

// ─── SAAT DİLİMİ MANTIĞI ────────────────────────────────────────────────────

function getTimeSlot(hour) {
  if (hour >= 5 && hour < 11) return "sabah";
  if (hour >= 11 && hour < 15) return "ogle";
  if (hour >= 15 && hour < 19) return "ikindi";
  return "gece";
}

const SLOT_DATA = {
  sabah: {
    selamlama: "Günaydın.",
    rutin: "Güne asil bir başlangıç için liyakatli bir üçüncü nesil kahveci eşleşmesi hazırladım.",
    ikon: "☕",
  },
  ogle: {
    selamlama: "Öğle yaklaşıyor.",
    rutin: "Şehrin gürültüsünden izole, sessiz bir lezzet noktası sizi bekliyor.",
    ikon: "🍽",
  },
  ikindi: {
    selamlama: "İyi akşamlar.",
    rutin: "Günün enerjisini taze tutmak için özel bir seçkiyi hazırladım.",
    ikon: "🌆",
  },
  gece: {
    selamlama: "Gece daha yeni başlıyor.",
    rutin: "Günün yorgunluğunu silecek elit bir ortam eşleşmesi hazır.",
    ikon: "🥃",
  },
};

// ─── FISISLTININ OLUŞTURULMASI ───────────────────────────────────────────────

function buildWhisper(hour) {
  const slot = getTimeSlot(hour);
  const data = SLOT_DATA[slot];

  // Rastgele tiyatro ve etkinlik seç
  const tiyatro = TIYATRO[Math.floor(Math.random() * TIYATRO.length)];
  const etkinlik = ETKINLIKLER[Math.floor(Math.random() * ETKINLIKLER.length)];

  // Gece geç saatte tiyatro yerine etkinlik öner
  const ekBilgi =
    hour >= 5 && hour < 20
      ? `Bu akşam ${tiyatro.mekan}'da <em>${tiyatro.ad}</em> — ${tiyatro.ipucu}`
      : `${etkinlik.tur}: <em>${etkinlik.ad}</em>. ${etkinlik.detay}`;

  return {
    selamlama: data.selamlama,
    rutin: data.rutin,
    ekBilgi,
    ikon: data.ikon,
    slot,
  };
}

// ─── BILEŞEN ────────────────────────────────────────────────────────────────

export default function TimeSuggestion() {
  const [whisper, setWhisper] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const now = new Date();
    setWhisper(buildWhisper(now.getHours()));

    // Her tam saatte yenile
    const msToNextHour =
      (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000;
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setWhisper(buildWhisper(new Date().getHours()));
        setVisible(true);
      }, 800);
    }, msToNextHour);

    return () => clearTimeout(timeout);
  }, []);

  if (!whisper) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={whisper.slot}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={styles.wrapper}
        >
          {/* Altın ince çizgi */}
          <motion.div
            style={styles.topLine}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
          />

          {/* İkon + Selamlama */}
          <motion.div
            style={styles.header}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span style={styles.ikon}>{whisper.ikon}</span>
            <span style={styles.selamlama}>{whisper.selamlama}</span>
          </motion.div>

          {/* Ana Fısıltı */}
          <motion.p
            style={styles.rutin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.9 }}
          >
            {whisper.rutin}
          </motion.p>

          {/* Etkinlik / Tiyatro Notu */}
          <motion.p
            style={styles.ekBilgi}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.72 }}
            transition={{ delay: 1.05, duration: 0.9 }}
            dangerouslySetInnerHTML={{ __html: whisper.ekBilgi }}
          />

          {/* Alt dekoratif nokta */}
          <motion.div
            style={styles.bottomDot}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.4, type: "spring" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── STİLLER (Obsidian Aurora Teması) ───────────────────────────────────────

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    margin: "0 auto",
    padding: "20px 24px 18px",
    background:
      "linear-gradient(135deg, rgba(212,175,55,0.045) 0%, rgba(0,0,0,0) 60%)",
    border: "1px solid rgba(212,175,55,0.12)",
    borderRadius: "2px",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  },

  topLine: {
    position: "absolute",
    top: 0,
    left: "24px",
    right: "24px",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, #D4AF37 40%, #D4AF37 60%, transparent)",
    transformOrigin: "left",
    opacity: 0.6,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },

  ikon: {
    fontSize: "12px",
    opacity: 0.85,
  },

  selamlama: {
    fontFamily: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#D4AF37",
  },

  rutin: {
    fontFamily: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
    fontSize: "14.5px",
    fontWeight: 400,
    lineHeight: 1.65,
    letterSpacing: "0.02em",
    color: "rgba(240, 234, 218, 0.92)",
    margin: "0 0 10px 0",
  },

  ekBilgi: {
    fontFamily: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
    fontSize: "12.5px",
    fontStyle: "italic",
    fontWeight: 300,
    lineHeight: 1.55,
    letterSpacing: "0.015em",
    color: "rgba(212,175,55,0.7)",
    margin: 0,
  },

  bottomDot: {
    position: "absolute",
    bottom: "14px",
    right: "24px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#D4AF37",
    opacity: 0.5,
  },
};
