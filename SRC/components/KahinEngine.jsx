import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
// KAHİN ENGINE v3
// Bir sohbet botu değil — şehrin sessiz, zarif rehberi
// Konuşmaz. Yönlendirir. Hatırlatır. Eşlik eder.
// ─────────────────────────────────────────────────────────────────

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@200;300;400&display=swap');
`;

// ── Saat bazlı tema & içerik ──────────────────────────────────────
const getTimeContext = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]}`;
  const dayStr = days[now.getDay()];

  const themes = {
    dawn: { h: [5, 7], label: "Şafak", sub: "Güne sessizce başla", icon: "🌤", bg: "linear-gradient(160deg,#1a0a00 0%,#3d1c00 40%,#7a3b1e 70%,#c4622d 100%)", accent: "#e8914a", card: "rgba(255,255,255,0.06)" },
    morning: { h: [7, 12], label: "Sabah", sub: "Antalya uyanıyor", icon: "☀️", bg: "linear-gradient(160deg,#0a1628 0%,#1e3a5f 40%,#2e6b9e 75%,#4a9abe 100%)", accent: "#7ec8e3", card: "rgba(255,255,255,0.07)" },
    noon: { h: [12, 15], label: "Öğle", sub: "Gün dorukta", icon: "🌞", bg: "linear-gradient(160deg,#0d1b2a 0%,#1b3a4b 40%,#2a6478 70%,#3a8fa3 100%)", accent: "#f0c060", card: "rgba(255,255,255,0.07)" },
    afternoon: { h: [15, 18], label: "İkindi", sub: "Şehir yavaşlıyor", icon: "🍵", bg: "linear-gradient(160deg,#0f1923 0%,#1e3040 40%,#2d5a6b 65%,#4a8a7a 100%)", accent: "#a8d5b5", card: "rgba(255,255,255,0.07)" },
    sunset: { h: [18, 21], label: "Gün Batımı", sub: "Altın saati kaçırma", icon: "🌆", bg: "linear-gradient(160deg,#0a0510 0%,#1a0a2e 30%,#4a1942 60%,#8b3a2a 85%,#c4622d 100%)", accent: "#f4a460", card: "rgba(255,255,255,0.08)" },
    evening: { h: [21, 24], label: "Gece", sub: "Şehrin gizli yüzü açılıyor", icon: "🌙", bg: "linear-gradient(160deg,#050510 0%,#0d0d2b 35%,#1a1040 65%,#2d1b69 100%)", accent: "#9b8ec4", card: "rgba(255,255,255,0.08)" },
    night: { h: [0, 5], label: "Gece Yarısı", sub: "Şehir uyurken biz nöbetteyiz", icon: "🔮", bg: "linear-gradient(160deg,#020208 0%,#080818 40%,#10102a 70%,#1a1535 100%)", accent: "#6b7db3", card: "rgba(255,255,255,0.06)" },
  };

  let theme = themes.night;
  for (const t of Object.values(themes)) {
    if (h >= t.h[0] && h < t.h[1]) { theme = t; break; }
  }

  return { timeStr, dateStr, dayStr, h, m, theme };
};

/** receteLayers.js uyumluluk */
export function getTimeBasedRecipe(location) {
  const ctx = getTimeContext();
  let message = `${ctx.theme.icon} ${ctx.theme.label} vakti. ${ctx.theme.sub}`;
  if (location && String(location).trim()) {
    message = `Şu an ${String(location).trim()} civarındasın. ${message}`;
  }
  const reçete = `Reçete: ${ctx.theme.label} — Nar Rehberi Kahin.`;
  return { title: "Zaman Motoru", text: message, message, reçete };
}

// ── Saate göre öneriler (şehir odaklı, kişisel değil) ─────────────
const getCityCards = (h) => {
  const all = {
    dawn: [
      { icon: "☕", cat: "Sabah Ritüeli", title: "Kaleiçi'nde Sessiz Kahve", desc: "Cumhuriyet Meydanı açılmadan önce — şehrin en huzurlu anı.", tag: "06:00–07:30" },
      { icon: "🌅", cat: "Sabah Yürüyüşü", title: "Konyaaltı Sahil Şeridi", desc: "Kalabalık gelmeden deniz sizi bekliyor. 5km yürüyüş parkuru.", tag: "Erken saatler" },
      { icon: "🧘", cat: "Beden & Zihin", title: "Sahil Seyri ile Meditasyon", desc: "Gün batısına bakan Falezler — nefes egzersizleri için ideal.", tag: "Sessiz saat" },
    ],
    morning: [
      { icon: "🏺", cat: "Kültür", title: "Antalya Müzesi", desc: "Dünyaca ünlü eserlere sabah sessizliğinde bakın. Kalabalık yok.", tag: "09:00 açılış" },
      { icon: "🚴", cat: "Outdoor", title: "Düden Şelalesi Bisiklet Turu", desc: "Kıyı boyunca 12km. Kiralık bisiklet Konyaaltı girişinde.", tag: "09:00–12:00" },
      { icon: "🫒", cat: "Gastronomi", title: "Pazar Keşfi — Muratpaşa", desc: "Salı & Cuma pazarı. Taze zeytin, narenciye, yerel peynirler.", tag: "Cumartesi" },
    ],
    noon: [
      { icon: "🐟", cat: "Öğle Yemeği", title: "Balık Tutmadan Yenen Balık", desc: "Kaleiçi'ndeki küçük aile restoranları — turistik değil, yerel.", tag: "12:00–14:00" },
      { icon: "💧", cat: "Sağlık", title: "Su & Dinlenme", desc: "Öğle sıcağında gölge bulun. Günlük su hedefinizin yarısı burada.", tag: "Hatırlatma" },
      { icon: "🌿", cat: "Kaçış", title: "Güllük Tepesi Gölgesi", desc: "Şehir merkezinde saklı yeşil alan. Kısa öğle molası için ideal.", tag: "Sessiz köşe" },
    ],
    afternoon: [
      { icon: "🎨", cat: "Sanat", title: "Kaleiçi Galeri Turu", desc: "Küçük atölyeler ve yerel sanatçılar. Pazarlık etmekten çekinmeyin.", tag: "14:00–17:00" },
      { icon: "🍋", cat: "İkindi Keyfi", title: "Limon Bahçesi Kafe", desc: "Bağlar bölgesinde asırlık limon ağaçları arasında çay.", tag: "15:00–18:00" },
      { icon: "🛶", cat: "Su Sporu", title: "Kayak & Paddle Board", desc: "Konyaaltı Sahili kiralama noktaları. Öğleden sonra dalgalar sakin.", tag: "14:00–17:00" },
    ],
    sunset: [
      { icon: "🌅", cat: "Gün Batımı", title: "Falezler Seyir Terası", desc: "Antalya'nın imza anı. 30 dakika önce gidin, yer kapın.", tag: "Bugün ~18:30" },
      { icon: "🍷", cat: "Aperitif", title: "Kaleiçi Yat Limanı", desc: "Tekne manzaralı terasta şarap & mezze. Rezervasyon önerilir.", tag: "19:00 sonrası" },
      { icon: "🎵", cat: "Canlı Müzik", title: "Cumartesi Konserleri", desc: "Kepez Kültür Merkezi & Atatürk Kültür Evi — ücretsiz girişli.", tag: "Bu hafta" },
    ],
    evening: [
      { icon: "🌙", cat: "Gece Keşfi", title: "Kaleiçi Gece Turu", desc: "Sura yaslanmış küçük barlar, nar şarabı, caz sesleri.", tag: "21:00 sonrası" },
      { icon: "🎭", cat: "Etkinlik", title: "Aspendos Antik Tiyatro", desc: "Yaz sezonu akşam gösterileri. Tarihin içinde müzik.", tag: "Etkinlik takvimi" },
      { icon: "🍽️", cat: "Gece Yemeği", title: "Tersane Sokak Lezzetleri", desc: "Yerel halkın bildiği küçük kebapçılar — gece 23'e kadar açık.", tag: "Her gece" },
    ],
    night: [
      { icon: "💊", cat: "Nöbetçi Eczane", title: "Antalya Nöbetçi Eczaneleri", desc: "Antalya Eczacı Odası resmi listesini görüntüleyin.", tag: "7/24", emergency: true },
      { icon: "🏥", cat: "Acil Servis", title: "Akdeniz Üniversitesi Hastanesi", desc: "Antalya'nın en büyük acil servisi. Kampüs içi 3. bina.", tag: "Sürekli açık", emergency: true, maps: "akdeniz+üniversitesi+hastanesi+antalya+acil" },
      { icon: "🔑", cat: "Çilingir 7/24", title: "Gece Çilingir Hizmeti", desc: "Şehir geneli 7/24 çilingir hizmeti — harita üzerinden yönlen.", tag: "Acil", emergency: true, maps: "çilingir+antalya+7/24+gece" },
    ],
  };

  if (h >= 5 && h < 7) return all.dawn;
  if (h >= 7 && h < 12) return all.morning;
  if (h >= 12 && h < 15) return all.noon;
  if (h >= 15 && h < 18) return all.afternoon;
  if (h >= 18 && h < 21) return all.sunset;
  if (h >= 21 && h < 24) return all.evening;
  return all.night;
};

const getWellnessTip = (h) => {
  if (h >= 6 && h < 9) return { icon: "🍳", text: "Güne protein ağırlıklı başlayın — yumurta, peynir, ceviz." };
  if (h >= 9 && h < 11) return { icon: "💧", text: "İlk 2 saatte en az 2 bardak su. Ara öğün: bir avuç fındık." };
  if (h >= 11 && h < 13) return { icon: "🥗", text: "Öğle yemeğinde ağır yemekten kaçının. Hafif sebze + protein." };
  if (h >= 13 && h < 15) return { icon: "😴", text: "20 dakikalık şekerleme odaklanmayı %34 artırıyor." };
  if (h >= 15 && h < 17) return { icon: "🍊", text: "İkindi ara öğünü: taze meyve veya yoğurt + bal." };
  if (h >= 17 && h < 20) return { icon: "🚶", text: "Akşam yürüyüşü sindirime yardımcı olur. En az 20 dk." };
  if (h >= 20 && h < 23) return { icon: "🌿", text: "Gece geç yemekten kaçının. Papatya çayı uyku kalitesini artırır." };
  return { icon: "🌙", text: "Bu saatte ekran ışığı melatonini baskılıyor. Dinlenmeyi deneyin." };
};

// ── ANA COMPONENT ─────────────────────────────────────────────────
export default function KahinEngine() {
  const [tc, setTc] = useState(getTimeContext());
  const [cards] = useState(() => getCityCards(getTimeContext().h));
  const [wellness] = useState(() => getWellnessTip(getTimeContext().h));
  const [activeCard, setActiveCard] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTc(getTimeContext()), 60000);
    return () => clearInterval(iv);
  }, []);

  const askKahin = async (q) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const { askKahinWeb } = await import("../services/kahinAiService");
      const res = await askKahinWeb("Genel", q);
      setAnswer(res);
    } catch (err) {
      console.error(err);
      setAnswer("Bağlantı kurulamadı. Tekrar deneyin.");
    }
    setLoading(false);
  };

  const { theme } = tc;
  const visibleCards = showAll ? cards : cards.slice(0, 3);

  return (
    <>
      <style>{FONTS}{`
        .kahin-root { font-family: 'Inter', sans-serif; }
        .kahin-title { font-family: 'Inter', sans-serif; }
        .kahin-card { transition: all 0.3s ease; cursor: pointer; }
        .kahin-card:hover { transform: translateY(-2px); }
        .kahin-input::placeholder { color: rgba(255,255,255,0.3); }
        .kahin-input:focus { outline: none; }
        .kahin-scroll::-webkit-scrollbar { width: 0; }
        @keyframes kahin-fade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .kahin-anim { animation: kahin-fade 0.5s ease forwards; }
        @keyframes kahin-pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
        .kahin-star { animation: kahin-pulse 3s infinite; }
        @keyframes kahin-spin { to{transform:rotate(360deg);} }
        .kahin-loading { animation: kahin-spin 1s linear infinite; }
      `}</style>

      <div className="kahin-root kahin-scroll"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "620px",
          display: "flex",
          flexDirection: "column",
          background: theme.bg,
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 12px 12px",
        }}>

        {/* Atmosfer: Gece yıldızları */}
        {tc.h >= 20 || tc.h < 6 ? (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {[...Array(40)].map((_, i) => (
              <div key={i} className="kahin-star" style={{
                position: "absolute",
                width: i % 5 === 0 ? "2px" : "1px",
                height: i % 5 === 0 ? "2px" : "1px",
                borderRadius: "50%",
                background: "white",
                left: `${(i * 37.3) % 100}%`,
                top: `${(i * 23.7) % 55}%`,
                animationDelay: `${(i * 0.3) % 3}s`
              }} />
            ))}
          </div>
        ) : null}

        {/* Işık kırılması — dekoratif */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}18 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />

        {/* ── HEADER ── */}
        <div style={{ padding: "20px 24px 12px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {/* Sol: İkon + Başlık */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: `rgba(255,255,255,0.08)`,
                backdropFilter: "blur(8px)",
                border: `1px solid rgba(255,255,255,0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px"
              }}>{theme.icon}</div>
              <div>
                <h2 className="kahin-title" style={{
                  color: "white", fontSize: "22px", fontWeight: 400,
                  letterSpacing: "0.05em", margin: 0, lineHeight: 1
                }}>Kahin</h2>
                <p style={{
                  color: `${theme.accent}`, fontSize: "10px",
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  margin: "3px 0 0", fontWeight: 300
                }}>{theme.sub}</p>
              </div>
            </div>

            {/* Sağ: Saat + Dönem */}
            <div style={{ textAlign: "right" }}>
              <div className="kahin-title" style={{
                color: "white", fontSize: "28px", fontWeight: 300,
                lineHeight: 1, letterSpacing: "0.02em"
              }}>{tc.timeStr}</div>
              <div style={{
                color: `rgba(255,255,255,0.45)`, fontSize: "10px",
                letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "3px"
              }}>{tc.dateStr} · {tc.dayStr}</div>
            </div>
          </div>

          {/* İnce ayraç */}
          <div style={{
            marginTop: "16px", height: "1px",
            background: `linear-gradient(to right, transparent, ${theme.accent}40, transparent)`
          }} />
        </div>

        {/* ── SCROLL ALAN ── */}
        <div className="kahin-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px", position: "relative", zIndex: 2 }}>

          {/* Wellness şeridi */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", borderRadius: "10px", marginBottom: "16px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid rgba(255,255,255,0.07)`
          }}>
            <span style={{ fontSize: "16px" }}>{wellness.icon}</span>
            <p style={{ color: `rgba(255,255,255,0.6)`, fontSize: "12px", fontWeight: 300, margin: 0, lineHeight: 1.5 }}>
              {wellness.text}
            </p>
          </div>

          {/* Bölüm başlığı */}
          <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{
              color: `${theme.accent}`, fontSize: "10px",
              letterSpacing: "0.2em", textTransform: "uppercase",
              fontWeight: 400, margin: 0
            }}>Şehirden · {theme.label}</p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", margin: 0 }}>Antalya</p>
          </div>

          {/* Kartlar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {visibleCards.map((card, i) => (
              <div key={i} className="kahin-card kahin-anim"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                onClick={() => {
                  if (card.cat === "Nöbetçi Eczane") {
                    window.open("https://www.antalyaeo.org.tr/tr/nobetci-eczaneler", "_blank");
                  } else if (card.emergency) {
                    window.open(`https://www.google.com/maps/search/${card.maps}`, "_blank");
                  } else {
                    setActiveCard(activeCard === i ? null : i);
                  }
                }}>
                <div style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: activeCard === i
                    ? `rgba(255,255,255,0.1)`
                    : `rgba(255,255,255,0.05)`,
                  border: `1px solid ${activeCard === i
                    ? `${theme.accent}50`
                    : "rgba(255,255,255,0.07)"}`,
                  backdropFilter: "blur(8px)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>{card.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <p style={{
                          color: `rgba(255,255,255,0.45)`, fontSize: "9px",
                          letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontWeight: 400
                        }}>
                          {card.cat}
                        </p>
                        <span style={{
                          color: card.emergency ? "#ff6b6b" : theme.accent,
                          fontSize: "9px", letterSpacing: "0.1em",
                          background: card.emergency ? "rgba(255,107,107,0.1)" : `${theme.accent}18`,
                          padding: "2px 7px", borderRadius: "20px", flexShrink: 0
                        }}>{card.tag}</span>
                      </div>
                      <p className="kahin-title" style={{
                        color: "white", fontSize: "15px", fontWeight: 400,
                        margin: "3px 0 0", lineHeight: 1.2
                      }}>{card.title}</p>
                    </div>
                  </div>

                  {(activeCard === i || card.emergency) && (
                    <p style={{
                      color: "rgba(255,255,255,0.55)", fontSize: "12px",
                      margin: "10px 0 0 32px", lineHeight: 1.6, fontWeight: 300
                    }}>{card.desc}
                      {card.emergency && (
                        <span style={{ color: theme.accent, display: "block", marginTop: "6px", fontSize: "11px" }}>
                          → Google Maps'te aç ↗
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tümünü göster */}
          {cards.length > 3 && (
            <button onClick={() => setShowAll(!showAll)}
              style={{
                width: "100%", marginTop: "10px", padding: "8px",
                background: "transparent", border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: "8px", color: "rgba(255,255,255,0.3)",
                fontSize: "11px", letterSpacing: "0.1em", cursor: "pointer",
                fontFamily: "Inter, sans-serif"
              }}>
              {showAll ? "? daha az ?" : "+ t?m ?neriler"}
            </button>
          )}

          {/* Soru & cevap alanı */}
          <div style={{ marginTop: "20px" }}>
            <div style={{
              height: "1px", marginBottom: "16px",
              background: `linear-gradient(to right, transparent, ${theme.accent}30, transparent)`
            }} />

            <p style={{
              color: `${theme.accent}`, fontSize: "9px",
              letterSpacing: "0.2em", textTransform: "uppercase",
              margin: "0 0 10px", fontWeight: 400
            }}>Rehbere Sor</p>

            <div style={{
              display: "flex", gap: "8px", alignItems: "center",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: "10px"
            }}>
              <input
                className="kahin-input"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { askKahin(question); setQuestion(""); } }}
                placeholder="Etkinlik, mekan, yemek, aktivite..."
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "white", fontSize: "12px", fontFamily: "Inter, sans-serif",
                  fontWeight: 300, letterSpacing: "0.02em"
                }}
              />
              <button onClick={() => { askKahin(question); setQuestion(""); }}
                disabled={loading || !question.trim()}
                style={{
                  width: "28px", height: "28px", borderRadius: "7px",
                  background: loading ? "transparent" : `${theme.accent}25`,
                  border: `1px solid ${theme.accent}40`,
                  color: theme.accent, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", flexShrink: 0,
                  opacity: question.trim() ? 1 : 0.4
                }}>
                {loading
                  ? <div className="kahin-loading" style={{ width: "10px", height: "10px", border: `1.5px solid ${theme.accent}`, borderTopColor: "transparent", borderRadius: "50%" }} />
                  : "↑"
                }
              </button>
            </div>

            {/* Cevap */}
            {answer && (
              <div className="kahin-anim" style={{
                marginTop: "10px", padding: "12px 14px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${theme.accent}25`,
                borderRadius: "10px"
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.7)", fontSize: "12px",
                  lineHeight: 1.7, margin: 0, fontWeight: 300
                }}>{answer}</p>
              </div>
            )}

            {/* Hızlı sorular */}
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              {[
                "G?n bat?m? nerede?",
                "Su sporu var m1?",
                "Canl? m?zik bu gece?",
                "Sa?l?kl? ??le nerede?",
              ].map(q => (
                <button key={q} onClick={() => { askKahin(q); }}
                  style={{
                    padding: "5px 10px", borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)", fontSize: "10px",
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                    letterSpacing: "0.02em"
                  }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Alt boşluk */}
          <div style={{ height: "16px" }} />
        </div>

        {/* ── ALT FOOTER ── */}
        <div style={{
          padding: "10px 24px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,0,0,0.2)", backdropFilter: "blur(10px)",
          position: "relative", zIndex: 2
        }}>
          <p style={{
            color: "rgba(255,255,255,0.2)", fontSize: "9px",
            letterSpacing: "0.18em", textTransform: "uppercase", margin: 0
          }}>
            Nar Rehberi · Antalya
          </p>
          <p className="kahin-title" style={{
            color: `${theme.accent}60`,
            fontSize: "11px", margin: 0, fontStyle: "italic", fontWeight: 300
          }}>
            {theme.label} vakti
          </p>
        </div>
      </div>
    </>
  );
}
