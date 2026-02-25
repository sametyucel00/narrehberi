/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  NAR REHBERİ — KATEGORİ VİTRİN v1                              ║
 * ║  KategoriVitrin.jsx                                             ║
 * ║                                                                  ║
 * ║  4 Lüks Kart  →  aiService filtre  →  PLATINUM+GOLD listesi   ║
 * ║  PayTR Güvenli Ödeme  ·  NetGSM 0850 302 79 46                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VENUES } from "./aiService_final.js";   // ← projedeki path'e göre düzelt

/* ─── TEMA ──────────────────────────────────────────────────────── */
const C = {
  bg:      "#0a0a0f",
  s2:      "#111118",
  s3:      "#17171e",
  s4:      "#1d1d26",
  gold:    "#D4AF37",
  goldD:   "rgba(212,175,55,0.10)",
  goldB:   "rgba(212,175,55,0.18)",
  text:    "rgba(238,230,210,0.92)",
  muted:   "rgba(168,155,128,0.50)",
  ok:      "#4caf7d",
  danger:  "#c0604a",
  plat:    "#a8c4e8",
  netgsm:  "0850 302 79 46",
};

/* ─── KATEGORİ TANIMLARI ────────────────────────────────────────── */
const CATS = [
  {
    key:   "SANAT_KULTUR",
    title: "Sahne & Sanat",
    sub:   "Devlet Tiyatrosu · Sergi · Kültür",
    icon:  "🎭",
    accent:"#4caf7d",
    desc:  "Antalya'nın sanat dünyasının editoryal seçkisi. Perde yükselmeden önce rezervasyonunuzu yapın.",
  },
  {
    key:   "GURME_DURAK",
    title: "Gurme Duraklar",
    sub:   "Specialty Coffee · Atölye · Lezzet",
    icon:  "☕",
    accent:"#c07840",
    desc:  "Sabah ritüelinden gece damak zevkine — her saate özel, editoryal tarafından seçilmiş lezzet noktaları.",
  },
  {
    key:   "USTA_HIZMET",
    title: "Usta / Hizmet",
    sub:   "Çilingir · Oto · Tesisat · 7/24",
    icon:  "🔧",
    accent:"#4a8fd4",
    desc:  "Acil ya da planlı. Şehrin en güvenilir usta ağı, tek çağrıyla kapınızda.",
  },
  {
    key:   "GECE_HAYATI",
    title: "Gece Hayatı",
    sub:   "Kokteyl · Rooftop · Club · Bar",
    icon:  "🌙",
    accent:"#a070d0",
    desc:  "Günün son saatleri için özel küratörlü liste. Şehrin en elite çıkış noktaları.",
  },
];

/* ─── HAVERSINE ─────────────────────────────────────────────────── */
function km(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLa = (lat2 - lat1) * r, dLo = (lng2 - lng1) * r;
  const a = Math.sin(dLa/2)**2 +
    Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLo/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ─── FİLTRE FONKSİYONU (aiService mantığı) ────────────────────── */
function filterVenues(catKey, coords) {
  return VENUES
    .filter(v => v.aktif && v.kategori === catKey &&
      (v.uyelik === "PLATINUM" || v.uyelik === "GOLD"))
    .map(v => ({
      ...v,
      _km: coords ? km(coords.lat, coords.lng, v.lat, v.lng) : null,
    }))
    .sort((a, b) => {
      if (a.uyelik !== b.uyelik)
        return a.uyelik === "PLATINUM" ? -1 : 1;
      if (a._km != null && b._km != null) return a._km - b._km;
      return b.nar_secimi_skoru - a.nar_secimi_skoru;
    });
}

/* ─── REZERVASYON BUTONU ────────────────────────────────────────── */
function ReservBtn({ venue }) {
  const [st, setSt] = useState("idle"); // idle|loading|sent

  const handle = async () => {
    setSt("loading");
    await new Promise(r => setTimeout(r, 1400));
    setSt("sent");
    setTimeout(() => setSt("idle"), 3200);
  };

  return (
    <div style={{ display:"flex", gap:8, marginTop:14 }}>
      {/* Ara */}
      <a href={`tel:+${venue.telefon}`}
        style={{ textDecoration:"none", flex:"0 0 80px" }}>
        <div style={{
          height:40, display:"flex", alignItems:"center",
          justifyContent:"center", gap:5,
          background:"none",
          border:`1px solid ${C.goldB}`,
          borderRadius:3, fontSize:10,
          color: C.muted, cursor:"pointer",
          letterSpacing:"0.08em",
        }}>
          📞 Ara
        </div>
      </a>

      {/* Güvenli Rezervasyon */}
      <motion.button onClick={handle}
        disabled={st !== "idle"}
        whileHover={st==="idle" ? { scale:1.02 } : {}}
        whileTap={st==="idle" ? { scale:0.96 } : {}}
        style={{
          flex:1, height:40,
          background: st==="sent"
            ? `${C.ok}1a`
            : `linear-gradient(135deg,${C.gold},#b8922a)`,
          border: st==="sent" ? `1px solid ${C.ok}55` : "none",
          borderRadius:3,
          color: st==="sent" ? C.ok : "#08080d",
          fontSize:11, fontWeight:700,
          letterSpacing:"0.09em",
          cursor: st==="idle" ? "pointer" : "default",
          display:"flex", alignItems:"center",
          justifyContent:"center", gap:7,
          transition:"all 0.3s",
        }}>
        {st==="loading" ? (
          <motion.span animate={{ rotate:360 }}
            transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}>
            ◌
          </motion.span>
        ) : st==="sent" ? (
          `✓ SMS → ${C.netgsm}`
        ) : (
          <><LockIcon /> Güvenli Rezervasyon</>
        )}
      </motion.button>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
      <rect x="1.5" y="5.5" width="8" height="7" rx="1.2"
        stroke="#08080d" strokeWidth="1.2"/>
      <path d="M3.5 5.5V3.8a2 2 0 014 0V5.5"
        stroke="#08080d" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── ALTYAPI ROZET ŞERIDI ──────────────────────────────────────── */
function TrustBar() {
  return (
    <div style={{ display:"flex", gap:8, marginTop:10,
      flexWrap:"wrap" }}>
      <span style={badge(C.ok)}>🔒 PayTR · SSL 256-bit</span>
      <span style={badge(C.gold)}>📱 {C.netgsm}</span>
      <span style={badge("#4a8fd4")}>3D Secure</span>
    </div>
  );
}
function badge(color) {
  return {
    fontSize:9, padding:"3px 9px", borderRadius:12,
    background: color+"14",
    border:`1px solid ${color}35`,
    color, letterSpacing:"0.08em",
    whiteSpace:"nowrap",
  };
}

/* ─── VENİTE SATIRI ─────────────────────────────────────────────── */
function VenueRow({ v, idx, accent }) {
  const [open, setOpen] = useState(false);
  const uColor = v.uyelik==="PLATINUM" ? C.plat : C.gold;

  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: idx*0.06 }}
      style={{
        background: C.s4,
        border:`1px solid ${open ? accent+"44" : C.goldB}`,
        borderRadius:5, overflow:"hidden",
        transition:"border-color 0.2s",
      }}>
      {/* Üyelik şeridi */}
      <div style={{ height:2.5,
        background:`linear-gradient(90deg,${accent},transparent)` }}/>

      <div style={{ padding:"13px 15px" }}>
        {/* Başlık satırı */}
        <div style={{ display:"flex", alignItems:"flex-start",
          gap:10, cursor:"pointer" }}
          onClick={() => setOpen(o=>!o)}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center",
              gap:8, marginBottom:4 }}>
              <span style={{ fontFamily:"'Cormorant Garamond','Garamond',serif",
                fontSize:14.5, color: C.text, fontWeight:600 }}>
                {v.ad}
              </span>
              <span style={{
                fontSize:8, padding:"2px 7px", borderRadius:10,
                background: uColor+"18",
                border:`1px solid ${uColor}40`,
                color: uColor, letterSpacing:"0.12em" }}>
                {v.uyelik}
              </span>
            </div>
            <p style={{ fontSize:11, color:C.muted,
              lineHeight:1.5, marginBottom:6 }}>
              {v.description?.slice(0,88)}…
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              {v._km != null && (
                <span style={{ fontSize:10, color:accent }}>
                  ◎ {v._km.toFixed(1)} km
                </span>
              )}
              <span style={{ fontSize:10, color:C.gold, opacity:0.7 }}>
                ★ {v.nar_secimi_skoru}
              </span>
              <span style={{ fontSize:10, color:C.muted }}>
                {v.adres?.split(",")[0]}
              </span>
            </div>
          </div>
          <motion.span animate={{ rotate: open?180:0 }}
            style={{ color:C.muted, fontSize:13,
              flexShrink:0, paddingTop:2 }}>
            ▾
          </motion.span>
        </div>

        {/* Genişletilmiş */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity:0, height:0 }}
              animate={{ opacity:1, height:"auto" }}
              exit={{ opacity:0, height:0 }}
              transition={{ duration:0.28 }}
              style={{ overflow:"hidden" }}>
              <div style={{ paddingTop:13, marginTop:12,
                borderTop:`1px solid ${C.goldB}` }}>
                <p style={{ fontSize:12,
                  color:"rgba(220,210,190,0.82)",
                  lineHeight:1.75, marginBottom:10 }}>
                  {v.description}
                </p>
                <div style={{ fontSize:11, color:C.muted,
                  marginBottom:4 }}>
                  📍 {v.adres}
                </div>
                <TrustBar />
                <ReservBtn venue={v} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── KATEGORİ KARTI ────────────────────────────────────────────── */
function CatCard({ cat, coords, idx }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [items,   setItems]   = useState(null);

  const toggle = useCallback(async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (items !== null) return;          // zaten yüklendi
    setLoading(true);
    await new Promise(r => setTimeout(r, 550));  // AI düşünüyor efekti
    setItems(filterVenues(cat.key, coords));
    setLoading(false);
  }, [open, items, cat.key, coords]);

  return (
    <motion.div
      initial={{ opacity:0, y:22 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: idx*0.09, duration:0.48 }}
      style={{ marginBottom:10 }}>

      {/* ── Kart Başlığı ── */}
      <motion.button onClick={toggle}
        whileHover={{ x:3 }} whileTap={{ scale:0.99 }}
        style={{
          width:"100%", textAlign:"left",
          padding:"17px 18px",
          background: open
            ? `linear-gradient(135deg,${cat.accent}18,${cat.accent}06)`
            : C.s2,
          border:`1px solid ${open ? cat.accent+"44" : C.goldB}`,
          borderRadius: open ? "6px 6px 0 0" : 6,
          cursor:"pointer",
          display:"flex", alignItems:"center", gap:15,
          transition:"all 0.22s",
        }}>

        {/* İkon kutusu */}
        <div style={{
          width:50, height:50, flexShrink:0,
          borderRadius:4,
          background: cat.accent+"15",
          border:`1px solid ${cat.accent}30`,
          display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:24,
        }}>
          {cat.icon}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center",
            gap:8, marginBottom:3 }}>
            <span style={{
              fontFamily:"'Cormorant Garamond','Garamond',serif",
              fontSize:17, color: C.text,
              fontWeight:600, letterSpacing:"0.01em" }}>
              {cat.title}
            </span>
            {/* Nar Seçimi rozeti */}
            <span style={{
              fontSize:8, padding:"2px 8px", borderRadius:10,
              background: C.goldD,
              border:`1px solid ${C.goldB}`,
              color: C.gold, letterSpacing:"0.14em",
              whiteSpace:"nowrap" }}>
              NAR SEÇİMİ
            </span>
          </div>
          <span style={{ fontSize:11, color:C.muted,
            letterSpacing:"0.04em" }}>
            {cat.sub}
          </span>
        </div>

        <motion.span animate={{ rotate: open?90:0,
          color: open ? cat.accent : C.muted }}
          style={{ fontSize:18, flexShrink:0,
            transition:"color 0.2s" }}>
          ›
        </motion.span>
      </motion.button>

      {/* ── İçerik Paneli ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }}
            transition={{ duration:0.32 }}
            style={{
              background: C.bg,
              border:`1px solid ${cat.accent}30`,
              borderTop:"none",
              borderRadius:"0 0 6px 6px",
              overflow:"hidden",
            }}>
            <div style={{ padding:"16px 14px" }}>

              {loading ? (
                /* Yükleme durumu */
                <div style={{ display:"flex", alignItems:"center",
                  gap:12, padding:"14px 0" }}>
                  <motion.div animate={{ rotate:360 }}
                    transition={{ duration:0.9, repeat:Infinity, ease:"linear" }}
                    style={{ width:18, height:18,
                      border:`2px solid ${cat.accent}35`,
                      borderTopColor: cat.accent,
                      borderRadius:"50%", flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:C.muted,
                    letterSpacing:"0.09em" }}>
                    Nar Seçimi filtreleniyor…
                  </span>
                </div>

              ) : items?.length > 0 ? (
                <>
                  {/* Meta başlık */}
                  <div style={{ display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center", marginBottom:12 }}>
                    <span style={{ fontSize:9, letterSpacing:"0.18em",
                      color: cat.accent, opacity:0.8,
                      textTransform:"uppercase" }}>
                      {items.length} kayıt · PLATINUM & GOLD
                    </span>
                    {coords && (
                      <span style={{ fontSize:9, color:C.muted }}>
                        En yakından uzağa ↓
                      </span>
                    )}
                  </div>

                  <div style={{ display:"flex",
                    flexDirection:"column", gap:10 }}>
                    {items.map((v, i) => (
                      <VenueRow key={v.id} v={v} idx={i}
                        accent={cat.accent}/>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize:12, color:C.muted,
                  textAlign:"center", padding:"14px 0" }}>
                  Bu kategoride aktif üye bulunamadı.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── ANA BİLEŞEN ───────────────────────────────────────────────── */
export default function KategoriVitrin({ coords, lang = "TR" }) {

  const greeting = {
    TR: "Antalya'nın seçkin rehberi",
    EN: "Antalya's curated guide",
    RU: "Путеводитель по лучшим местам Анталии",
    DE: "Der kuratierte Führer von Antalya",
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto",
      padding:"0 0 80px",
      fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* ── Bölüm Başlığı ── */}
      <div style={{ marginBottom:26 }}>
        <p style={{ fontSize:9, letterSpacing:"0.24em",
          color: C.gold, opacity:0.6, marginBottom:6,
          textTransform:"uppercase" }}>
          Editörün Notu
        </p>
        <h2 style={{ fontFamily:"'Cormorant Garamond','Garamond',serif",
          fontSize:24, color: C.text, fontWeight:700,
          letterSpacing:"0.01em", marginBottom:6 }}>
          Nar Seçimi Vitrin
        </h2>
        <div style={{ height:1,
          background:`linear-gradient(90deg,${C.goldB},transparent)`,
          marginBottom:10 }}/>
        <p style={{ fontSize:11, color:C.muted, lineHeight:1.65 }}>
          {greeting[lang] || greeting.TR}
          {coords
            ? " · Konumunuza göre PLATINUM & GOLD önce sıralanır."
            : " · Editoryal puanlamaya göre sıralanır."}
        </p>
      </div>

      {/* ── Kartlar ── */}
      {CATS.map((cat, i) => (
        <CatCard key={cat.key} cat={cat} coords={coords} idx={i}/>
      ))}

      {/* ── Alt Güven Çubuğu ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ delay:0.7 }}
        style={{ marginTop:32, padding:"15px 17px",
          background: C.s2, border:`1px solid ${C.goldB}`,
          borderRadius:5 }}>
        <p style={{ fontSize:9, letterSpacing:"0.16em",
          color: C.gold, opacity:0.6, marginBottom:10,
          textTransform:"uppercase" }}>
          Güvenli Altyapı
        </p>
        <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>🔒</span>
            <div>
              <div style={{ fontSize:11, color:C.text,
                letterSpacing:"0.04em" }}>
                PayTR Güvenli Ödeme
              </div>
              <div style={{ fontSize:9, color:C.muted }}>
                256-bit SSL · 3D Secure
              </div>
            </div>
          </div>
          <div style={{ width:1, background:C.goldB, margin:"0 4px" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>📱</span>
            <div>
              <div style={{ fontSize:11, color:C.text,
                letterSpacing:"0.04em" }}>
                {C.netgsm}
              </div>
              <div style={{ fontSize:9, color:C.muted }}>
                NetGSM · SMS Onay Hattı
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}