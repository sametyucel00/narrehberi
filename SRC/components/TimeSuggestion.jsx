import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEME = {
  gold: "#d4af37",
  text: "rgba(240,234,218,0.92)",
  muted: "rgba(212,175,55,0.74)",
  serif: "'Cormorant Garamond','Garamond',serif",
  sans: "'Jost','Segoe UI',sans-serif",
};

const TIYATROLAR = [
  {
    ad: "Beklenirken Godot",
    mekan: "Devlet Tiyatrosu Ana Sahne",
    ipucu: "Sizi de beklediği şeyden emin olmayan biri var.",
  },
  {
    ad: "Othello",
    mekan: "Haşim İşcan Kültür Merkezi",
    ipucu: "Kıskançlığın trajedisi bu akşam yeniden sahnede.",
  },
  {
    ad: "Medea",
    mekan: "Atatürk Kültür Merkezi",
    ipucu: "Güçlü bir tragedya için sakin bir akşam planı kurabilirsiniz.",
  },
];

const ETKINLIKLER = [
  {
    tur: "Konser",
    ad: "Devlet Senfoni Orkestrası",
    detay: "Atatürk Kültür Merkezi'nde akşam seansı.",
  },
  {
    tur: "Festival",
    ad: "Antalya Caz Günleri",
    detay: "Açık hava sahnesi ve gün batımı eşliğiyle.",
  },
  {
    tur: "Sergi",
    ad: "Antalya Müzesi özel seçkisi",
    detay: "Günün sonunda kısa bir kültür molası için hazır.",
  },
];

function getSlot(hour) {
  if (hour >= 5 && hour < 11) return "sabah";
  if (hour >= 11 && hour < 15) return "ogle";
  if (hour >= 15 && hour < 19) return "ikindi";
  return "gece";
}

const SLOT_TEXT = {
  sabah: {
    title: "SABAH BAŞLIYOR.",
    body: "Güne ağır değil, zarif bir ritimle başlamak için sakin bir durak sizi bekliyor.",
    icon: "☕",
  },
  ogle: {
    title: "ÖĞLE YAKLAŞIYOR.",
    body: "Şehrin gürültüsünden izole, sessiz bir lezzet noktası sizi bekliyor.",
    icon: "🍽️",
  },
  ikindi: {
    title: "İKİNDİ SERİNLİYOR.",
    body: "Kahve, kısa yürüyüş ve hafif bir kültür molası için en doğru saatlerdesiniz.",
    icon: "🌆",
  },
  gece: {
    title: "GECE DERİNLEŞİYOR.",
    body: "Kalabalıktan uzak, iyi seçilmiş bir masa ve uzun bir sohbet için uygun zaman.",
    icon: "🥂",
  },
};

function buildSuggestion(hour) {
  const slot = getSlot(hour);
  const text = SLOT_TEXT[slot];
  const tiyatro = TIYATROLAR[hour % TIYATROLAR.length];
  const etkinlik = ETKINLIKLER[hour % ETKINLIKLER.length];

  const detail =
    hour >= 6 && hour < 21
      ? `Bu akşam ${tiyatro.mekan}'da ${tiyatro.ad} var. ${tiyatro.ipucu}`
      : `${etkinlik.tur}: ${etkinlik.ad}. ${etkinlik.detay}`;

  return {
    ...text,
    detail,
    slot,
  };
}

export default function TimeSuggestion() {
  const [visible, setVisible] = useState(true);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000;
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentHour(new Date().getHours());
        setVisible(true);
      }, 350);
    }, msToNextHour);
    return () => clearTimeout(timeout);
  }, [currentHour]);

  const suggestion = useMemo(() => buildSuggestion(currentHour), [currentHour]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.section
          key={suggestion.slot}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 16,
            border: "1px solid rgba(212,175,55,0.18)",
            background: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(20,20,27,0.96) 62%)",
            padding: "24px 22px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              right: 20,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.75), transparent)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>{suggestion.icon}</span>
            <span
              style={{
                fontFamily: THEME.sans,
                color: THEME.gold,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {suggestion.title}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: THEME.serif,
              fontSize: 22,
              lineHeight: 1.5,
              color: THEME.text,
              fontWeight: 600,
            }}
          >
            {suggestion.body}
          </p>

          <p
            style={{
              margin: "14px 0 0",
              fontFamily: THEME.serif,
              fontSize: 18,
              lineHeight: 1.6,
              color: THEME.muted,
              fontStyle: "italic",
            }}
          >
            {suggestion.detail}
          </p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
