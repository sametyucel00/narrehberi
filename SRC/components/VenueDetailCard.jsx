/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       NAR REHBERİ — KADİFE KUTU (VenueDetailCard)          ║
 * ║       Native HTML5 Audio + Framer Motion + Obsidian Aurora  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── SABİTLER ────────────────────────────────────────────────────────────────

// Test için royalty-free mp3 (SoundHelix - public domain, CORS açık)
const MOCK_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.15)";
const GOLD_BORDER = "rgba(212,175,55,0.2)";
const SURFACE = "rgba(18,18,24,0.97)";
const TEXT_PRIMARY = "rgba(240,234,218,0.93)";
const TEXT_MUTED = "rgba(180,170,150,0.65)";

// ─── YARDIMCI: ETKİNLİK Mİ? ─────────────────────────────────────────────────

function isEvent(venue) {
  return venue?.type === "event" || venue?.kategori === "TİYATRO";
}

// ─── YARDIMCI: WHATSAPP URL ──────────────────────────────────────────────────

function buildWhatsAppUrl(venue) {
  const phone = venue?.telefon?.replace(/\D/g, "") ?? "";
  const msg = encodeURIComponent(
    `Merhaba, "${venue?.ad}" hakkında bilgi almak istiyorum.`
  );
  return `https://wa.me/${phone}?text=${msg}`;
}

// ─── PULSE ANİMASYONU (Framer Motion variants) ──────────────────────────────

const pulseVariants = {
  idle: { opacity: 1, boxShadow: `0 0 0px 0px ${GOLD_DIM}` },
  playing: {
    opacity: [1, 0.7, 1],
    boxShadow: [
      `0 0 0px 0px ${GOLD_DIM}`,
      `0 0 14px 4px rgba(212,175,55,0.35)`,
      `0 0 0px 0px ${GOLD_DIM}`,
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── KART GİRİŞ / ÇIKIŞ ─────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.96,
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

// Stagger için satır animasyonu
const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────

export default function VenueDetailCard({ venue, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // ── Audio nesnesini bir kez oluştur (etkinlikse) ─────────────────────────
  useEffect(() => {
    if (!isEvent(venue)) return;

    const audioUrl = venue?.audioUrl || MOCK_AUDIO_URL;
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";

    // Ses bitince butonu sıfırla
    audio.addEventListener("ended", () => setIsPlaying(false));

    audioRef.current = audio;

    // Cleanup: bileşen unmount edilince veya venue değişince
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [venue]);

  // ── onClose tetiklenince sesi durdur ─────────────────────────────────────
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onClose?.();
  }, [onClose]);

  // ── Play / Pause toggle ──────────────────────────────────────────────────
  const handleAudioToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true); // Pulse başlasın; hata olursa catch geri alır
      audio.play().catch((err) => {
        console.error("ŞANTİYE BİLDİRİMİ - Ses Çalma Hatası:", err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  if (!venue) return null;

  const event = isEvent(venue);
  const whatsappUrl = buildWhatsAppUrl(venue);

  const detailRows = [
    { label: "Kategori", value: venue.kategori },
    { label: "Adres", value: venue.adres },
    venue.telefon && { label: "İletişim", value: venue.telefon },
  ].filter(Boolean);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={venue.ad}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={styles.overlay}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div style={styles.card}>

          {/* ── Üst Altın Çizgi ──────────────────────────────────────────── */}
          <motion.div
            style={styles.topLine}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          />

          {/* ── Kapat Butonu ─────────────────────────────────────────────── */}
          <button style={styles.closeBtn} onClick={handleClose} aria-label="Kapat">
            <span style={{ fontSize: "18px", color: TEXT_MUTED }}>✕</span>
          </button>

          {/* ── Kategori Rozeti ───────────────────────────────────────────── */}
          <motion.div
            style={styles.badge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {event ? "🎭 ETKİNLİK" : "📍 MEKAN"}
          </motion.div>

          {/* ── Başlık ───────────────────────────────────────────────────── */}
          <motion.h2
            style={styles.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
          >
            {venue.ad}
          </motion.h2>

          {/* ── Açıklama ─────────────────────────────────────────────────── */}
          <motion.p
            style={styles.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {venue.description}
          </motion.p>

          {/* ── Detay Satırları (Stagger) ─────────────────────────────────── */}
          <div style={styles.detailsBlock}>
            {detailRows.map((row, i) => (
              <motion.div
                key={row.label}
                style={styles.detailRow}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
              >
                <span style={styles.detailLabel}>{row.label}</span>
                <span style={styles.detailValue}>{row.value}</span>
              </motion.div>
            ))}
          </div>

          {/* ── Ayraç ────────────────────────────────────────────────────── */}
          <motion.div
            style={styles.divider}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
          />

          {/* ── Sesli Sinopsis Butonu (SADECE ETKİNLİKLERDE) ─────────────── */}
          {event && (
            <motion.div
              variants={pulseVariants}
              animate={isPlaying ? "playing" : "idle"}
              style={{ borderRadius: "3px" }}
            >
              <motion.button
                style={{
                  ...styles.audioBtn,
                  ...(isPlaying ? styles.audioBtnActive : {}),
                }}
                onClick={handleAudioToggle}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.45 }}
              >
                <span style={styles.audioBtnIcon}>
                  {isPlaying ? "⏸" : "▶"}
                </span>
                <span style={styles.audioBtnText}>
                  {isPlaying ? "DURDUR" : "SESLİ SİNOPSİSİ DİNLE"}
                </span>
                {isPlaying && (
                  <motion.span
                    style={styles.liveIndicator}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ── WhatsApp / Bilet CTA ──────────────────────────────────────── */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.ctaBtn}
            whileHover={{ opacity: 0.9, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: event ? 1.05 : 0.95, duration: 0.45 }}
          >
            {event ? "BİLET / REZERVASYON" : "HEMEN İLETİŞİME GEÇ"}
          </motion.a>

          {/* ── Alt Dekoratif Nokta ───────────────────────────────────────── */}
          <motion.div
            style={styles.bottomDot}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.45, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────────────

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6,6,10,0.78)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "24px",
  },

  card: {
    position: "relative",
    background: SURFACE,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: "4px",
    padding: "36px 32px 28px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD_BORDER}`,
    overflow: "hidden",
  },

  topLine: {
    position: "absolute",
    top: 0,
    left: "32px",
    right: "32px",
    height: "1px",
    background: `linear-gradient(90deg, transparent, ${GOLD} 35%, ${GOLD} 65%, transparent)`,
    transformOrigin: "left",
    opacity: 0.7,
  },

  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    lineHeight: 1,
    opacity: 0.7,
    transition: "opacity 0.2s",
  },

  badge: {
    display: "inline-block",
    fontSize: "10px",
    fontFamily: "'Cormorant Garamond', 'Garamond', serif",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: GOLD,
    opacity: 0.75,
    marginBottom: "10px",
  },

  title: {
    fontFamily: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.3,
    color: TEXT_PRIMARY,
    letterSpacing: "0.01em",
    marginBottom: "14px",
  },

  description: {
    fontFamily: "'Cormorant Garamond', 'Garamond', serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.7,
    color: "rgba(220,210,190,0.8)",
    marginBottom: "20px",
    fontStyle: "italic",
  },

  detailsBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "24px",
  },

  detailRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  detailLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: GOLD,
    opacity: 0.65,
    minWidth: "72px",
    paddingTop: "2px",
  },

  detailValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "13.5px",
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
  },

  divider: {
    height: "1px",
    background: `linear-gradient(90deg, transparent, ${GOLD_BORDER} 40%, ${GOLD_BORDER} 60%, transparent)`,
    marginBottom: "20px",
    transformOrigin: "left",
  },

  // Sesli sinopsis butonu
  audioBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "13px 18px",
    marginBottom: "12px",
    background: "transparent",
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: "3px",
    cursor: "pointer",
    transition: "border-color 0.3s, background 0.3s",
  },

  audioBtnActive: {
    background: "rgba(212,175,55,0.07)",
    borderColor: "rgba(212,175,55,0.5)",
  },

  audioBtnIcon: {
    fontSize: "13px",
    color: GOLD,
    minWidth: "16px",
    textAlign: "center",
  },

  audioBtnText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: GOLD,
    flex: 1,
  },

  liveIndicator: {
    fontSize: "8px",
    color: GOLD,
  },

  // WhatsApp / Bilet CTA
  ctaBtn: {
    display: "block",
    width: "100%",
    padding: "15px 18px",
    background: `linear-gradient(135deg, ${GOLD} 0%, #b8932a 100%)`,
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11.5px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#0a0a0f",
    boxShadow: `0 4px 24px rgba(212,175,55,0.25)`,
  },

  bottomDot: {
    position: "absolute",
    bottom: "14px",
    right: "22px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: GOLD,
  },
};