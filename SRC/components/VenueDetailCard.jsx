
/**
 * NAR REHBERİ — KADİFE KUTU v4
 * Orijinal dosya üzerine 3 ekleme:
 * + Yol Tarifi Al  (google_maps_url → yeni sekme)
 * + Güvenli Ödeme rozeti (is_escrow)
 * + Rezervasyon Modal (PayTR havuz + %10 komisyon)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.15)";
const GOLD_BORDER = "rgba(212,175,55,0.2)";
const SURFACE = "rgba(18,18,24,0.97)";
const TEXT_PRIMARY = "rgba(240,234,218,0.93)";
const TEXT_MUTED = "rgba(180,170,150,0.65)";
const SUCCESS = "#4caf7d";
const DANGER = "#c05050";
const NETGSM = "0850 302 79 46";
const WEB_EXTERNAL_PAYMENTS_ENABLED = false;

function getCleanTel(v) {
  if (!v) return null;
  const t = v.telefon || v.tel;
  if (!t) return null;
  const clean = String(t).replace(/\D/g, "");
  if (clean.length < 10 || clean === "902420000000" || clean === "02420000000" || clean.endsWith("0000000")) return null;
  return t;
}

function getVenueImages(v) {
  if (!v) return [];
  if (Array.isArray(v.fotolar)) return v.fotolar.filter(Boolean);
  if (typeof v.fotolar === "string") return v.fotolar.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function getVenueCover(v) {
  return v?.fotoUrl || getVenueImages(v)[0] || "";
}

function isEvent(venue) {
  return venue?.kategori === "SANAT_KULTUR" || venue?.type === "event";
}

function buildWhatsAppUrl(venue) {
  const tel = getCleanTel(venue);
  const phone = tel ? tel.replace(/\D/g, "") : NETGSM.replace(/\D/g, "");
  const msg = encodeURIComponent(`Merhaba, "${venue?.ad}" hakk?nda bilgi almak istiyorum.`);
  return `https://wa.me/${phone}?text=${msg}`;
}

const pulseVariants = {
  idle: { opacity: 1, boxShadow: `0 0 0px 0px ${GOLD_DIM}` },
  playing: {
    opacity: [1, 0.7, 1],
    boxShadow: [`0 0 0px 0px ${GOLD_DIM}`, `0 0 14px 4px rgba(212,175,55,0.35)`, `0 0 0px 0px ${GOLD_DIM}`],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.35, ease: "easeIn" } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.15, duration: 0.5, ease: "easeOut" } }),
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.22 } },
};

function FeeRow({ label, value, color, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ fontSize: "11px", color: TEXT_MUTED }}>{label}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: bold ? "13px" : "12px", color, fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>◌</motion.span>
      İşleniyor…
    </span>
  );
}

function ReservasyonModal({ venue, onClose }) {
  const [tutar, setTutar] = useState("");
  const [adim, setAdim] = useState("form");
  const [yukleniyor, setYuk] = useState(false);

  const rate = Number(venue?.service_fee_rate ? 0.10);
  const brut = parseFloat(tutar) || 0;
  const kom = +(brut * rate).toFixed(2);
  const net = +(brut - kom).toFixed(2);
  const pct = Math.round(rate * 100);
  const valid = brut > 0;

  const handleOde = async () => {
    setYuk(true);
    await new Promise(r => setTimeout(r, 1800));
    setYuk(false);
    setAdim("tamam");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <AnimatePresence mode="wait">

        {adim === "form" && (
          <motion.div key="form" variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={mS.card}>
            <p style={mS.etiket}>REZERVASYON</p>
            <h3 style={mS.baslik}>{venue.ad}</h3>

            <div style={mS.havuzBox}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>🛡️</span>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: SUCCESS, letterSpacing: "0.08em" }}>PayTR Güvenli Havuz</p>
                <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED, lineHeight: 1.65 }}>
                  Paranız bizim güvenli havuzumuza alınır. Hizmet tamamlandığında{" "}
                  <strong style={{ color: TEXT_PRIMARY }}>%{pct} komisyon kesilerek</strong>{" "}
                  işletmeye aktarılır.
                </p>
              </div>
            </div>

            <label style={mS.label}>Rezervasyon Tutarı (₺)</label>
            <input
              type="number" min="1" placeholder="Örn: 500"
              value={tutar} onChange={e => setTutar(e.target.value)}
              style={mS.input} autoFocus
            />

            {valid && (
              <div style={mS.feeBox}>
                <FeeRow label="Toplam Ödeme" value={`₺${brut.toFixed(2)}`} color={TEXT_PRIMARY} />
                <FeeRow label={`Nar Komisyonu (%${pct})`} value={`– ₺${kom.toFixed(2)}`} color={DANGER} />
                <div style={mS.feeLine} />
                <FeeRow label="İşletmeye Net" value={`₺${net.toFixed(2)}`} color={SUCCESS} bold />
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
              <button onClick={onClose} style={mS.btnIkincil}>İptal</button>
              <button onClick={() => setAdim("onay")} disabled={!valid}
                style={{ ...mS.btnAna, opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}>
                Devam Et →
              </button>
            </div>
          </motion.div>
        )}

        {adim === "onay" && (
          <motion.div key="onay" variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={mS.card}>
            <p style={mS.etiket}>ÖDEME ONAYI</p>
            <div style={{ ...mS.havuzBox, flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "10px", color: TEXT_MUTED, letterSpacing: "0.14em" }}>ONAYLANACAK TUTAR</p>
              <p style={{ margin: "0 0 4px", fontFamily: "'Inter', sans-serif", fontSize: "38px", color: GOLD, fontWeight: 700 }}>₺{brut.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED }}>{venue.ad}</p>
            </div>
            <div style={{ ...mS.feeBox, margin: "14px 0" }}>
              <FeeRow label="PayTR Güvenli Havuz" value={`₺${brut.toFixed(2)}`} color={TEXT_PRIMARY} />
              <FeeRow label={`Nar Rehberi Komisyonu (%${pct})`} value={`₺${kom.toFixed(2)}`} color={TEXT_MUTED} />
              <div style={mS.feeLine} />
              <FeeRow label="İşletmeye Aktarılacak" value={`₺${net.toFixed(2)}`} color={SUCCESS} bold />
            </div>
            <p style={{ fontSize: "9px", color: TEXT_MUTED, textAlign: "center", letterSpacing: "0.06em", marginBottom: "18px", lineHeight: 1.8 }}>
              🔒 256-bit SSL · 3D Secure · PayTR Lisanslı Sistem
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setAdim("form")} style={mS.btnIkincil}>← Geri</button>
              <button onClick={handleOde} disabled={yukleniyor} style={{ ...mS.btnAna, cursor: yukleniyor ? "wait" : "pointer" }}>
                {yukleniyor ? <Spinner /> : "?demeyi Onayla ?"}
              </button>
            </div>
          </motion.div>
        )}

        {adim === "tamam" && (
          <motion.div key="tamam" variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ ...mS.card, textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
              style={{ width: "60px", height: "60px", borderRadius: "50%", background: `${SUCCESS}18`, border: `2px solid ${SUCCESS}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", color: SUCCESS, margin: "0 auto 18px" }}>
              ✓
            </motion.div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", color: TEXT_PRIMARY, fontWeight: 700, marginBottom: "8px" }}>Rezervasyon Alındı</p>
            <p style={{ fontSize: "11px", color: TEXT_MUTED, lineHeight: 1.7, marginBottom: "6px" }}>
              <strong style={{ color: GOLD }}>₺{brut.toFixed(2)}</strong> PayTR Güvenli Havuzuna alındı.
            </p>
            <p style={{ fontSize: "11px", color: TEXT_MUTED, lineHeight: 1.7, marginBottom: "24px" }}>
              Hizmet tamamlandığında <strong style={{ color: SUCCESS }}>₺{net.toFixed(2)}</strong> işletmeye aktarılır.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <a href={buildWhatsAppUrl(venue)} target="_blank" rel="noopener noreferrer"
                style={{ ...mS.btnIkincil, flex: 1, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                💬 WhatsApp
              </a>
              <button onClick={onClose} style={{ ...mS.btnAna, flex: 1 }}>Tamam</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

export default function VenueDetailCard({ venue, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRezerv, setShowRezerv] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isEvent(venue)) return;
    const audioUrl = venue?.audioUrl || MOCK_AUDIO_URL;
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    audio.addEventListener("ended", () => setIsPlaying(false));
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; audioRef.current = null; setIsPlaying(false); };
  }, [venue]);

  const handleClose = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    onClose?.();
  }, [onClose]);

  const handleAudioToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { setIsPlaying(true); audio.play().catch(() => setIsPlaying(false)); }
  }, [isPlaying]);

  if (!venue) return null;

  const event = isEvent(venue);
  const whatsappUrl = buildWhatsAppUrl(venue);
  const hasEscrow = WEB_EXTERNAL_PAYMENTS_ENABLED && !!venue?.is_escrow;
  const hasRezerv = WEB_EXTERNAL_PAYMENTS_ENABLED && !!venue?.rezervasyon_aktif && !event;
  const isTiyatroBilet = venue?.kategori === "SANAT_KULTUR" && venue?.bilet_url;
  const showWhatsApp = !isTiyatroBilet;
  const cover = getVenueCover(venue);
  const images = getVenueImages(venue);
  const descriptionText = (venue.aciklama || venue.description || venue.sinopsis?.TR || "").replace(/\s*P.*/g, "").trim();

  const detailRows = [
    { label: "Kategori", value: venue.kategori },
    { label: "Adres", value: <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.ad, venue.adres].filter(Boolean).join(" "))}`} target="_blank" rel="noopener noreferrer" style={{ color: "#5b9bd4", textDecoration: "none" }}>{venue.adres}</a> },
    getCleanTel(venue) ? { label: "?leti?im", value: getCleanTel(venue) } : null,
  ].filter(Boolean);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={venue.ad}
          variants={cardVariants}
          initial="hidden" animate="visible" exit="exit"
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div style={styles.card}>

            <motion.div style={styles.topLine} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }} />

            {/* 🛡️ Escrow rozeti — sol üst */}
            {hasEscrow && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={styles.escrowBadge}>
                🛡️ <span style={{ marginLeft: "4px" }}>Güvenli Ödeme</span>
              </motion.div>
            )}

            <button style={styles.closeBtn} onClick={handleClose} aria-label="Kapat">
              <span style={{ fontSize: "18px", color: TEXT_MUTED }}>✕</span>
            </button>

            <motion.div style={{ ...styles.badge, marginTop: hasEscrow ? "26px" : "0" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}>
              {event ? "ETK?NL?K" : "MEKAN"}
            </motion.div>

            <motion.h2 style={styles.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }}>
              {venue.ad}
            </motion.h2>

            {venue.google_rating && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ marginBottom: "18px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(66,133,244,0.08)", border: "1px solid rgba(66,133,244,0.25)", padding: "4px 10px", borderRadius: "100px" }}
              >
                <span style={{ color: "#4285F4", fontSize: "15px", lineHeight: 1 }}>★</span>
                <strong style={{ color: "#4285F4", fontSize: "13px", fontFamily: "'Inter','Segoe UI',sans-serif", letterSpacing: "0.05em" }}>{venue.google_rating}</strong>
                <span style={{ color: "rgba(66,133,244,0.75)", fontSize: "11px", fontFamily: "'Inter','Segoe UI',sans-serif", fontWeight: 500, marginLeft: "2px" }}>({venue.google_ratings_total} Google Yorumu)</span>
              </motion.div>
            )}

            <motion.p style={styles.description} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.6 }}>
              {descriptionText}
            </motion.p>

            {(cover || images.length > 1 || venue.videoUrl) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.45 }} style={{ marginBottom: "18px" }}>
                {cover && (
                  <div style={{ height: 180, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.03)", marginBottom: 10 }}>
                    <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {venue.videoUrl && (
                    <a href={venue.videoUrl} target="_blank" rel="noopener noreferrer" style={{ ...styles.ctaBtn, width: "auto", padding: "10px 14px", marginBottom: 0 }}>🎬 Video</a>
                  )}
                  {images.length > 1 && (
                    <span style={{ fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.08em" }}>+{images.length - 1} ek görsel</span>
                  )}
                </div>
              </motion.div>
            )}

            <div style={styles.detailsBlock}>
              {detailRows.map((row, i) => (
                <motion.div key={row.label} style={styles.detailRow} custom={i} variants={rowVariants} initial="hidden" animate="visible">
                  <span style={styles.detailLabel}>{row.label}</span>
                  <span style={styles.detailValue}>{row.value}</span>
                </motion.div>
              ))}
            </div>

            <motion.div style={styles.divider} initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.85, duration: 0.6 }} />

            {/* Sesli Sinopsis */}
            {event && (
              <motion.div variants={pulseVariants} animate={isPlaying ? "playing" : "idle"} style={{ borderRadius: "3px", marginBottom: "10px" }}>
                <motion.button
                  style={{ ...styles.audioBtn, ...(isPlaying ? styles.audioBtnActive : {}) }}
                  onClick={handleAudioToggle}
                  whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95, duration: 0.45 }}
                >
                  <span style={styles.audioBtnIcon}>{isPlaying ? "?" : "?"}</span>
                  <span style={styles.audioBtnText}>{isPlaying ? "Durdur" : "Sesli Sinopsisi Dinle"}</span>
                  {isPlaying && (
                    <motion.span style={styles.liveIndicator} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* YOL TARİFİ — Ad + adres ile metin tabanlı navigasyon (güncel hedef) */}
            {(venue.ad || venue.adres) && (
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.ad, venue.adres].filter(Boolean).join(" "))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.mapsBtn}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: event ? 1.0 : 0.9, duration: 0.4 }}
                whileTap={{ scale: 0.96 }}
              >
                <span style={{ fontSize: "15px" }}>📍</span>
                <span>NAVİGASYONU BAŞLAT</span>
                <span style={{ fontSize: "11px", opacity: 0.55 }}>↗</span>
              </motion.a>
            )}

            {/* TİYATRO İÇİN ÖZEL BİLET BUTONU */}
            {isTiyatroBilet && (
              <motion.a
                href={venue.bilet_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.rezervBtn, textDecoration: "none", color: "#0a0a0f" }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.4 }}
                whileTap={{ scale: 0.96 }}
              >
                <span style={{ fontSize: "14px" }}>🎟️</span>
                <span>BİLETİNİ AL (RESMİ SİTE)</span>
                <span style={{ fontSize: "11px", opacity: 0.7 }}>↗</span>
              </motion.a>
            )}

            {/* GÜVENLİ REZERVASYON — Sadece tiyatro dışı, rezervasyonu aktif olanlarda */}
            {hasRezerv && (
              <motion.button
                style={styles.rezervBtn}
                onClick={() => setShowRezerv(true)}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: event ? 1.1 : 1.0, duration: 0.4 }}
                whileHover={{ opacity: 0.9, y: -1 }} whileTap={{ scale: 0.97 }}
              >
                <span style={{ fontSize: "14px" }}>🛡️</span>
                <span>GÜVENLİ REZERVASYON</span>
              </motion.button>
            )}

            {/* WhatsApp — Tiyatro (bilet_url) için gösterilmez */}
            {showWhatsApp && (
              <motion.a
                href={whatsappUrl}
                target="_blank" rel="noopener noreferrer"
                style={styles.ctaBtn}
                whileHover={{ opacity: 0.9, y: -1 }} whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: event ? 1.2 : 1.1, duration: 0.45 }}
              >
                {event ? "? WHATSAPP ?LE B?LET" : "? HEMEN ?LET?ME GE?"}
              </motion.a>
            )}

            <motion.div style={styles.bottomDot} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.45, scale: 1 }} transition={{ delay: 1.3, type: "spring" }} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Rezervasyon Modal */}
      <AnimatePresence>
        {showRezerv && <ReservasyonModal venue={venue} onClose={() => setShowRezerv(false)} />}
      </AnimatePresence>
    </>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(6,6,10,0.78)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "24px" },
  card: { position: "relative", background: SURFACE, border: `1px solid ${GOLD_BORDER}`, borderRadius: "4px", padding: "36px 32px 28px", width: "100%", maxWidth: "420px", maxHeight: "92vh", overflowY: "auto", boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD_BORDER}` },
  topLine: { position: "absolute", top: 0, left: "32px", right: "32px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD} 35%, ${GOLD} 65%, transparent)`, transformOrigin: "left", opacity: 0.7 },
  escrowBadge: { position: "absolute", top: "12px", left: "14px", display: "inline-flex", alignItems: "center", background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.35)", borderRadius: "20px", padding: "3px 10px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", color: SUCCESS, textTransform: "uppercase" },
  closeBtn: { position: "absolute", top: "14px", right: "16px", background: "none", border: "none", cursor: "pointer", padding: "6px", lineHeight: 1, opacity: 0.7 },
  badge: { display: "inline-block", fontSize: "10px", fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, opacity: 0.75, marginBottom: "10px" },
  title: { fontFamily: "'Inter', 'Garamond', serif", fontSize: "22px", fontWeight: 700, lineHeight: 1.3, color: TEXT_PRIMARY, letterSpacing: "0.01em", marginBottom: "14px" },
  description: { fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: 1.7, color: "rgba(220,210,190,0.8)", marginBottom: "20px", fontStyle: "italic" },
  detailsBlock: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  detailRow: { display: "flex", gap: "12px", alignItems: "flex-start" },
  detailLabel: { fontFamily: "'Inter', sans-serif", fontSize: "10.5px", letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, opacity: 0.65, minWidth: "72px", paddingTop: "2px" },
  detailValue: { fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: TEXT_PRIMARY, lineHeight: 1.5 },
  divider: { height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD_BORDER} 40%, ${GOLD_BORDER} 60%, transparent)`, marginBottom: "16px", transformOrigin: "left" },
  audioBtn: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "13px 18px", background: "transparent", border: `1px solid ${GOLD_BORDER}`, borderRadius: "3px", cursor: "pointer" },
  audioBtnActive: { background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.5)" },
  audioBtnIcon: { fontSize: "13px", color: GOLD, minWidth: "16px", textAlign: "center" },
  audioBtnText: { fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, flex: 1 },
  liveIndicator: { fontSize: "8px", color: GOLD },
  mapsBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px 18px", marginBottom: "10px", background: "rgba(91,155,212,0.12)", border: "1px solid rgba(91,155,212,0.40)", borderRadius: "3px", textDecoration: "none", fontFamily: "'Inter', sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5b9bd4", cursor: "pointer" },
  rezervBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px 18px", marginBottom: "10px", background: `linear-gradient(135deg, ${GOLD} 0%, #b8932a 100%)`, border: "none", borderRadius: "3px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0a0a0f", boxShadow: `0 4px 20px rgba(212,175,55,0.3)` },
  ctaBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "3px", textDecoration: "none", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT_MUTED, cursor: "pointer" },
  bottomDot: { position: "absolute", bottom: "14px", right: "22px", width: "4px", height: "4px", borderRadius: "50%", background: GOLD },
};

const mS = {
  card: { background: "rgba(12,12,18,0.99)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "5px", padding: "26px 24px", width: "100%", maxWidth: "360px", boxShadow: "0 24px 60px rgba(0,0,0,0.85)" },
  etiket: { fontSize: "9px", letterSpacing: "0.24em", color: GOLD, opacity: 0.65, textTransform: "uppercase", margin: "0 0 5px" },
  baslik: { fontFamily: "'Inter', sans-serif", fontSize: "18px", color: TEXT_PRIMARY, fontWeight: 700, margin: "0 0 18px" },
  havuzBox: { display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(76,175,125,0.08)", border: "1px solid rgba(76,175,125,0.28)", borderRadius: "4px", padding: "13px 14px", marginBottom: "18px" },
  label: { display: "block", fontSize: "9.5px", letterSpacing: "0.14em", color: GOLD, opacity: 0.7, marginBottom: "7px", textTransform: "uppercase" },
  input: { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "3px", color: TEXT_PRIMARY, fontSize: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  feeBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", padding: "11px 13px", marginTop: "12px" },
  feeLine: { height: "1px", background: "rgba(255,255,255,0.08)", margin: "7px 0" },
  btnAna: { flex: 2, padding: "13px 16px", background: `linear-gradient(135deg, ${GOLD}, #b8922a)`, border: "none", borderRadius: "3px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 800, letterSpacing: "0.13em", color: "#0a0a0f", width: "100%" },
  btnIkincil: { flex: 1, padding: "13px 12px", background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: "3px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", letterSpacing: "0.1em", color: TEXT_MUTED, width: "100%" },
};
