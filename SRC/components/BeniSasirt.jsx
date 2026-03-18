import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0a0a0f",
  gold: "#D4AF37",
  border: "rgba(212,175,55,0.25)",
  cardBg: "#111116",
  text: "rgba(238,230,210,0.92)",
  muted: "rgba(168,155,128,0.7)",
  red: "#c05050",
};

export default function BeniSasirt({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", overflowY: "auto", padding: "20px 10px" }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 620, background: C.bg, borderRadius: 14, border: "1px solid " + C.border, padding: "clamp(20px, 5vw, 34px)", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: C.muted, fontSize: 30, cursor: "pointer" }}>×</button>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", textAlign: "center" }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(192,80,80,0.12)", border: "1px solid rgba(192,80,80,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontSize: 32 }}>
              ✨
            </div>
            <div>
              <p style={{ margin: 0, color: C.gold, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>Yakında!</p>
              <h2 style={{ margin: "8px 0 10px", color: C.text, fontFamily: "serif", fontSize: "clamp(26px, 5vw, 38px)" }}>Beni Şaşırt modülü geçici olarak kapalı</h2>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.7, fontSize: 15 }}>
                Bu alan şu anda çalışmıyor. Yenilenen sürüm hazır olduğunda tekrar aktif edeceğiz.
                Şimdilik sadece bilgilendirme ibaresi gösteriyoruz.
              </p>
            </div>

            <div style={{ width: "100%", background: C.cardBg, border: "1px solid " + C.border, borderRadius: 12, padding: 16, color: C.text, textAlign: "left" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>Durum</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, lineHeight: 1.8, fontSize: 14 }}>
                <li>Rota üretimi kapalı.</li>
                <li>Akış ve puan mekanikleri askıda.</li>
                <li>Yakında yeni sürümle geri açılacak.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
