/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — MASTER ADMIN KOMUTA MERKEZİ                  ║
 * ║     MasterPanel.jsx                                             ║
 * ║                                                                  ║
 * ║     Renk Dili: Obsidian Aurora + Mor/İndigo (#a070d0) vurgu     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── SABITLER ────────────────────────────────────────────────────────────────

const GOLD        = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.2)";
const GOLD_DIM    = "rgba(212,175,55,0.08)";
const PURPLE      = "#a070d0";
const PURPLE_DIM  = "rgba(160,112,208,0.10)";
const PURPLE_BRD  = "rgba(160,112,208,0.28)";
const SURFACE_1   = "#0d0d12";
const SURFACE_2   = "#13131a";
const SURFACE_3   = "#1a1a24";
const TEXT_PRI    = "rgba(240,234,218,0.93)";
const TEXT_MUT    = "rgba(180,170,150,0.50)";
const SUCCESS     = "#4caf7d";
const DANGER      = "#c0604a";
const WARNING     = "#e0a030";

// ─── MOCK VERİ ───────────────────────────────────────────────────────────────

const MOCK_UYELER = [
  { id: "u1", ad: "Kadir Yılmaz",   email: "kadir@mail.com",   kayit: "2025-01-14", dil: "TR", aktif: true  },
  { id: "u2", ad: "Elena Sokolova", email: "elena@mail.ru",    kayit: "2025-02-03", dil: "RU", aktif: true  },
  { id: "u3", ad: "Hans Müller",    email: "hans@mail.de",     kayit: "2025-02-18", dil: "DE", aktif: false },
  { id: "u4", ad: "Sarah Johnson",  email: "sarah@mail.com",   kayit: "2025-03-01", dil: "EN", aktif: true  },
  { id: "u5", ad: "Ayşe Kara",      email: "ayse@mail.com",    kayit: "2025-03-10", dil: "TR", aktif: true  },
  { id: "u6", ad: "Marco Rossi",    email: "marco@mail.it",    kayit: "2025-03-22", dil: "EN", aktif: true  },
];

const MOCK_OYUNLAR = [
  { id: "o1", ad: "Othello",         durum: "YAYINDA",       dinlenme: 231, tiyatro: "Haşim İşcan",    tarih: "2025-03-15" },
  { id: "o2", ad: "Medea",           durum: "ONAY_BEKLIYOR", dinlenme: 0,   tiyatro: "AKM Ana Sahne",  tarih: "2025-04-02" },
  { id: "o3", ad: "Beklerken Godot", durum: "TASLAK",        dinlenme: 0,   tiyatro: "Devlet Sahnesi", tarih: "2025-04-20" },
  { id: "o4", ad: "Hamlet",          durum: "YAYINDA",       dinlenme: 187, tiyatro: "Haşim İşcan",    tarih: "2025-02-28" },
];

const MOCK_BILDIRIMLER = [
  { id: "b1", tip: "PROMIYER",   oyun: "Othello",         tarih: "2025-03-15T19:00:00", gonderenRol: "DT_ADMIN"  },
  { id: "b2", tip: "OYUN_GUNU",  oyun: "Hamlet",          tarih: "2025-03-10T09:00:00", gonderenRol: "DT_ADMIN"  },
  { id: "b3", tip: "SİSTEM",     oyun: "—",               tarih: "2025-03-08T14:30:00", gonderenRol: "MASTER"    },
  { id: "b4", tip: "SON_BILET",  oyun: "Othello",         tarih: "2025-03-20T11:00:00", gonderenRol: "DT_ADMIN"  },
  { id: "b5", tip: "PROMIYER",   oyun: "Hamlet",          tarih: "2025-02-28T20:00:00", gonderenRol: "DT_ADMIN"  },
];

// 500+ havuzundan alınan mock temsil verisi (aiService_v2.js'den senkronize)
const MOCK_ISLETMELER = [
  { id: "g_seraser",      ad: "Seraser Fine Dining",    kategori: "GASTRONOMI",   uyelik: "PLATINUM", aktif: true,  leads: 214, paytr: "PTR_10001" },
  { id: "g_vanilla",      ad: "Vanilla Lounge",         kategori: "GASTRONOMI",   uyelik: "GOLD",     aktif: true,  leads: 97,  paytr: "PTR_10002" },
  { id: "g_hasanaga",     ad: "Hasanağa Restaurant",    kategori: "GASTRONOMI",   uyelik: "GOLD",     aktif: true,  leads: 143, paytr: "PTR_10003" },
  { id: "g_portofino",    ad: "Porto Fino Italian",     kategori: "GASTRONOMI",   uyelik: "BRONZE",   aktif: true,  leads: 61,  paytr: "PTR_10004" },
  { id: "gd_petra",       ad: "Petra Roasting Co.",     kategori: "GURME_DURAK",  uyelik: "PLATINUM", aktif: true,  leads: 389, paytr: "PTR_20001" },
  { id: "gd_moka",        ad: "Moka Atelier",           kategori: "GURME_DURAK",  uyelik: "GOLD",     aktif: true,  leads: 167, paytr: "PTR_20002" },
  { id: "gd_dondurmaci",  ad: "Maraş Ustası Dondurma", kategori: "GURME_DURAK",  uyelik: "BRONZE",   aktif: true,  leads: 44,  paytr: "PTR_20003" },
  { id: "h_elite",        ad: "Elite Çilingir 7/24",   kategori: "USTA_HIZMET",  uyelik: "PLATINUM", aktif: true,  leads: 528, paytr: "PTR_30001" },
  { id: "h_prestige",     ad: "Prestige Oto Yol Yardım",kategori: "USTA_HIZMET", uyelik: "GOLD",     aktif: true,  leads: 302, paytr: "PTR_30002" },
  { id: "h_tesisat",      ad: "Antalya Su & Tesisat",  kategori: "USTA_HIZMET",  uyelik: "GOLD",     aktif: true,  leads: 189, paytr: "PTR_30003" },
  { id: "h_elektrik",     ad: "Volt Elektrik Ustası",  kategori: "USTA_HIZMET",  uyelik: "BRONZE",   aktif: false, leads: 94,  paytr: "PTR_30004" },
  { id: "sk_othello",     ad: "Othello — DT",          kategori: "SANAT_KULTUR", uyelik: "PLATINUM", aktif: true,  leads: 231, paytr: "PTR_40001" },
  { id: "sk_sergi",       ad: "Dijital Anılar Sergisi", kategori: "SANAT_KULTUR", uyelik: "GOLD",     aktif: true,  leads: 89,  paytr: "PTR_40002" },
  { id: "sk_kitap",       ad: "Cam Piramit Kitap Fuarı",kategori: "SANAT_KULTUR",uyelik: "GOLD",     aktif: true,  leads: 56,  paytr: "PTR_40003" },
  { id: "gh_360",         ad: "The 360 Rooftop Bar",   kategori: "GECE_HAYATI",  uyelik: "PLATINUM", aktif: true,  leads: 276, paytr: "PTR_50001" },
  { id: "gh_kaledaki",    ad: "Kaledaki Club",          kategori: "GECE_HAYATI",  uyelik: "GOLD",     aktif: true,  leads: 154, paytr: "PTR_50002" },
  { id: "gh_liman",       ad: "Liman Bistro & Bar",    kategori: "GECE_HAYATI",  uyelik: "BRONZE",   aktif: true,  leads: 88,  paytr: "PTR_50003" },
];

const MOCK_NETGSM_LOGS = [
  { id: "sms1", tip: "REZERVASYON_ONAY", isletme: "The 360 Rooftop Bar",  alici: "+905321234567", tarih: "2025-03-21T19:30:00", durum: "TESLİM" },
  { id: "sms2", tip: "LEAD_BILDIRIMI",   isletme: "Petra Roasting Co.",   alici: "+905329876543", tarih: "2025-03-21T10:14:00", durum: "TESLİM" },
  { id: "sms3", tip: "LEAD_BILDIRIMI",   isletme: "Seraser Fine Dining",  alici: "+905333210000", tarih: "2025-03-20T18:05:00", durum: "TESLİM" },
  { id: "sms4", tip: "REZERVASYON_ONAY", isletme: "Elite Çilingir",       alici: "+905304441122", tarih: "2025-03-20T22:14:00", durum: "TESLİM" },
  { id: "sms5", tip: "LEAD_BILDIRIMI",   isletme: "Othello — DT",         alici: "+905556667788", tarih: "2025-03-20T15:00:00", durum: "BEKLEMEDE" },
  { id: "sms6", tip: "LEAD_BILDIRIMI",   isletme: "Vanilla Lounge",       alici: "+905312223344", tarih: "2025-03-18T12:10:00", durum: "TESLİM" },
];

const KAT_ETIKET = {
  GASTRONOMI:   "Gastronomi",
  GURME_DURAK:  "Gurme Durak",
  USTA_HIZMET:  "Usta / Hizmet",
  SANAT_KULTUR: "Sanat & Kültür",
  GECE_HAYATI:  "Gece Hayatı",
};

const UYELIK_RENK = { PLATINUM: "#a0c4ff", GOLD: "#D4AF37", BRONZE: "#c07840" };

// ─── İŞLETMELER SEKMESİ ──────────────────────────────────────────────────────

function IsletmelerSekme() {
  const [katFiltre,  setKatFiltre]  = useState("TÜMÜ");
  const [uyelikFiltre, setUyelik]   = useState("TÜMÜ");
  const [aktifFiltre,  setAktifF]   = useState("TÜMÜ");
  const [gsmAcik,      setGsmAcik]  = useState(false);

  const goruntulenen = MOCK_ISLETMELER.filter(i => {
    if (katFiltre   !== "TÜMÜ" && i.kategori !== katFiltre)     return false;
    if (uyelikFiltre !== "TÜMÜ" && i.uyelik   !== uyelikFiltre) return false;
    if (aktifFiltre === "AKTİF" && !i.aktif)  return false;
    if (aktifFiltre === "PASİF" &&  i.aktif)  return false;
    return true;
  });

  const toplamLeads = goruntulenen.reduce((s, i) => s + i.leads, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <SectionTitle>İşletme Havuzu (500+)</SectionTitle>
          <p style={{ fontSize: 10, color: TEXT_MUT, marginTop: -14 }}>
            {goruntulenen.length} işletme · {toplamLeads} toplam yönlendirme
          </p>
        </div>
        <motion.button
          onClick={() => setGsmAcik(v => !v)}
          whileTap={{ scale: 0.97 }}
          style={{ background: gsmAcik ? PURPLE_DIM : "none",
            border: `1px solid ${PURPLE_BRD}`, borderRadius: 3,
            padding: "8px 14px", color: PURPLE, cursor: "pointer",
            fontSize: 11, letterSpacing: "0.1em" }}>
          📱 NetGSM Log {gsmAcik ? "▲" : "▼"}
        </motion.button>
      </div>

      {/* NetGSM Log Panel */}
      <AnimatePresence>
        {gsmAcik && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: SURFACE_3,
              border: `1px solid ${PURPLE_BRD}`,
              borderRadius: 4, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", color: PURPLE,
                marginBottom: 12, textTransform: "uppercase" }}>
                NetGSM SMS Log · 0850 302 79 46
              </p>
              {MOCK_NETGSM_LOGS.map((log, i) => (
                <motion.div key={log.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: "flex", gap: 10, alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: TEXT_MUT,
                    fontFamily: "monospace", minWidth: 110 }}>
                    {new Date(log.tarih).toLocaleString("tr-TR", {
                      day: "2-digit", month: "2-digit",
                      hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 9, padding: "2px 8px",
                    borderRadius: 10, whiteSpace: "nowrap",
                    background: (log.tip === "REZERVASYON_ONAY" ? GOLD : PURPLE) + "15",
                    border: `1px solid ${(log.tip === "REZERVASYON_ONAY" ? GOLD : PURPLE)}33`,
                    color: log.tip === "REZERVASYON_ONAY" ? GOLD : PURPLE }}>
                    {log.tip}
                  </span>
                  <span style={{ flex: 1, fontSize: 11, color: TEXT_PRI,
                    minWidth: 120 }}>{log.isletme}</span>
                  <span style={{ fontSize: 10, color: TEXT_MUT,
                    fontFamily: "monospace" }}>{log.alici}</span>
                  <span style={{ fontSize: 9,
                    color: log.durum === "TESLİM" ? SUCCESS : WARNING,
                    letterSpacing: "0.08em" }}>
                    {log.durum === "TESLİM" ? "✓" : "◐"} {log.durum}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtreler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {/* Kategori */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["TÜMÜ", ...Object.keys(KAT_ETIKET)].map(k => (
            <button key={k} onClick={() => setKatFiltre(k)}
              style={{ ...filterPill,
                ...(katFiltre === k ? { borderColor: GOLD, color: GOLD,
                  background: GOLD_DIM } : {}) }}>
              {k === "TÜMÜ" ? "Tüm Kategoriler" : KAT_ETIKET[k]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["TÜMÜ", "PLATINUM", "GOLD", "BRONZE"].map(u => (
          <button key={u} onClick={() => setUyelik(u)}
            style={{ ...filterPill,
              ...(uyelikFiltre === u ? {
                borderColor: (UYELIK_RENK[u] || GOLD),
                color: (UYELIK_RENK[u] || GOLD),
                background: (UYELIK_RENK[u] || GOLD) + "12" } : {}) }}>
            {u === "TÜMÜ" ? "Tüm Üyelikler" : u}
          </button>
        ))}
        {["TÜMÜ", "AKTİF", "PASİF"].map(a => (
          <button key={a} onClick={() => setAktifF(a)}
            style={{ ...filterPill,
              ...(aktifFiltre === a ? { borderColor: PURPLE_BRD,
                color: PURPLE, background: PURPLE_DIM } : {}) }}>
            {a}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["İşletme", "Kategori", "Üyelik", "Durum", "Lead", "PayTR ID"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px",
                  fontSize: 9, letterSpacing: "0.15em", color: PURPLE,
                  opacity: 0.75, textTransform: "uppercase",
                  borderBottom: `1px solid ${PURPLE_BRD}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {goruntulenen.map((isletme, i) => (
                <motion.tr key={isletme.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)",
                    opacity: isletme.aktif ? 1 : 0.45 }}>
                  <td style={tdStyle}>{isletme.ad}</td>
                  <td style={{ ...tdStyle, fontSize: 10, color: TEXT_MUT }}>
                    {KAT_ETIKET[isletme.kategori]}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 9, padding: "2px 8px",
                      borderRadius: 10,
                      background: (UYELIK_RENK[isletme.uyelik]) + "18",
                      border: `1px solid ${UYELIK_RENK[isletme.uyelik]}44`,
                      color: UYELIK_RENK[isletme.uyelik],
                      letterSpacing: "0.1em" }}>
                      {isletme.uyelik}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10,
                      color: isletme.aktif ? SUCCESS : DANGER }}>
                      {isletme.aktif ? "● Aktif" : "○ Pasif"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "serif",
                    color: GOLD }}>{isletme.leads}</td>
                  <td style={{ ...tdStyle, fontSize: 10, color: TEXT_MUT,
                    fontFamily: "monospace" }}>{isletme.paytr}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const filterPill = {
  background: "none",
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: 20,
  padding: "5px 12px",
  color: TEXT_MUT,
  cursor: "pointer",
  fontSize: 10,
  letterSpacing: "0.08em",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

const MOCK_MEKANLAR = [
  { id: "m1", ad: "Petra Roasting Co.",       kategori: "KAHVE",   aktif: true,  skor: 96 },
  { id: "m2", ad: "Seraser Fine Dining",      kategori: "RESTORAN",aktif: true,  skor: 98 },
  { id: "m3", ad: "Elite Çilingir 7/24",      kategori: "HİZMET",  aktif: true,  skor: 95 },
  { id: "m4", ad: "The 360 Rooftop Bar",      kategori: "BAR",     aktif: false, skor: 93 },
  { id: "m5", ad: "Moka Atelier",             kategori: "KAHVE",   aktif: true,  skor: 88 },
];

const STATS = [
  { etiket: "Toplam Üye",           deger: "6",    ikon: "◈", renk: PURPLE, alt: "+2 bu hafta"     },
  { etiket: "Aktif DT Oyunları",    deger: "2",    ikon: "🎭", renk: GOLD,   alt: "4 toplam kayıt"  },
  { etiket: "Gönderilen Bildirim",  deger: "5",    ikon: "🔔", renk: WARNING, alt: "Tüm zamanlar"   },
  { etiket: "Sinopsis Dinlenme",    deger: "418",  ikon: "▶", renk: SUCCESS, alt: "TR·EN·RU·DE"    },
];

// ─── SEKME TANIMI ─────────────────────────────────────────────────────────────

const SEKMELER = [
  { id: "genel",      etiket: "Genel Bakış",      ikon: "⬡" },
  { id: "uyeler",     etiket: "Üyeler",            ikon: "◈" },
  { id: "oyunlar",    etiket: "DT Kontrolü",       ikon: "🎭" },
  { id: "isletmeler", etiket: "İşletme Havuzu",    ikon: "📍" },
  { id: "bildirimler",etiket: "Bildirim Logu",     ikon: "🔔" },
  { id: "mekanlar",   etiket: "Nar Seçimi",  ikon: "⚙" },
];

// ─── YARDIMCI BİLEŞENLER ─────────────────────────────────────────────────────

function SectionTitle({ children, renk = PURPLE }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: "serif", fontSize: 11, letterSpacing: "0.2em",
        textTransform: "uppercase", color: renk, opacity: 0.8, marginBottom: 6 }}>
        {children}
      </p>
      <div style={{ height: 1, background:
        `linear-gradient(90deg, ${renk}44, transparent)` }} />
    </div>
  );
}

function DurumBadge({ durum }) {
  const meta = {
    YAYINDA:        { renk: SUCCESS,  etiket: "Yayında"         },
    ONAY_BEKLIYOR:  { renk: WARNING,  etiket: "Onay Bekleniyor" },
    TASLAK:         { renk: TEXT_MUT, etiket: "Taslak"          },
    REDDEDILDI:     { renk: DANGER,   etiket: "Reddedildi"      },
  }[durum] || { renk: TEXT_MUT, etiket: durum };

  return (
    <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 10,
      background: meta.renk + "18", border: `1px solid ${meta.renk}44`,
      color: meta.renk, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
      {meta.etiket}
    </span>
  );
}

function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, background: "rgba(13,13,18,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10, borderRadius: 3 }}>
      <motion.div animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 24, height: 24, border: `2px solid ${PURPLE_BRD}`,
          borderTopColor: PURPLE, borderRadius: "50%" }} />
    </motion.div>
  );
}

// ─── SEKME: GENEL BAKIŞ ──────────────────────────────────────────────────────

function GenelBakis() {
  return (
    <div>
      <SectionTitle>Sistem Durumu</SectionTitle>

      {/* Stat Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.etiket}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: SURFACE_3, border: `1px solid ${s.renk}33`,
              borderRadius: 4, padding: "18px 16px",
              boxShadow: `0 0 20px ${s.renk}08` }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{s.ikon}</span>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                style={{ width: 6, height: 6, borderRadius: "50%",
                  background: s.renk }} />
            </div>
            <div style={{ fontFamily: "serif", fontSize: 28, color: s.renk,
              marginBottom: 4, letterSpacing: "-0.01em" }}>
              {s.deger}
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: TEXT_MUT,
              textTransform: "uppercase", marginBottom: 2 }}>
              {s.etiket}
            </div>
            <div style={{ fontSize: 10, color: s.renk, opacity: 0.6 }}>
              {s.alt}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sistem Sağlığı */}
      <SectionTitle>Servis Sağlığı</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { ad: "Auth Gateway",        durum: "ONLINE",  gecikme: "12ms"  },
          { ad: "AI Kahin Motoru",     durum: "ONLINE",  gecikme: "284ms" },
          { ad: "Sinopsis Ses Servisi",durum: "ONLINE",  gecikme: "67ms"  },
          { ad: "QR Jeneratör",        durum: "ONLINE",  gecikme: "8ms"   },
          { ad: "Firebase Sync",       durum: "BEKLIYOR",gecikme: "—"     },
        ].map((s, i) => (
          <motion.div key={s.ad}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "11px 14px",
              background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                animate={s.durum === "ONLINE"
                  ? { opacity: [1, 0.4, 1] }
                  : { opacity: 0.4 }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%",
                  background: s.durum === "ONLINE" ? SUCCESS : WARNING }} />
              <span style={{ fontSize: 12, color: TEXT_PRI }}>{s.ad}</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: TEXT_MUT,
                fontFamily: "monospace" }}>{s.gecikme}</span>
              <span style={{ fontSize: 9, color: s.durum === "ONLINE" ? SUCCESS : WARNING,
                letterSpacing: "0.1em" }}>{s.durum}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: ÜYELER ───────────────────────────────────────────────────────────

function UyelerSekme() {
  const [uyeler, setUyeler] = useState(MOCK_UYELER);
  const [yukleniyor, setYuk] = useState(null);
  const [filtre, setFiltre] = useState("TÜMÜ");

  const toggle = async (id) => {
    setYuk(id);
    await new Promise(r => setTimeout(r, 700));
    setUyeler(prev =>
      prev.map(u => u.id === id ? { ...u, aktif: !u.aktif } : u)
    );
    setYuk(null);
  };

  const goruntulenen = filtre === "TÜMÜ" ? uyeler
    : filtre === "AKTİF" ? uyeler.filter(u => u.aktif)
    : uyeler.filter(u => !u.aktif);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Bireysel Üyeler</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          {["TÜMÜ", "AKTİF", "PASİF"].map(f => (
            <button key={f} onClick={() => setFiltre(f)}
              style={{ background: filtre === f ? PURPLE_DIM : "none",
                border: `1px solid ${filtre === f ? PURPLE_BRD : GOLD_BORDER}`,
                borderRadius: 20, padding: "5px 12px",
                color: filtre === f ? PURPLE : TEXT_MUT,
                cursor: "pointer", fontSize: 10,
                letterSpacing: "0.1em" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Ad", "E-posta", "Kayıt", "Dil", "Durum", "İşlem"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px",
                  fontSize: 9, letterSpacing: "0.15em", color: PURPLE,
                  opacity: 0.7, textTransform: "uppercase",
                  borderBottom: `1px solid ${PURPLE_BRD}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {goruntulenen.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <td style={tdStyle}>{u.ad}</td>
                  <td style={{ ...tdStyle, color: TEXT_MUT, fontSize: 11,
                    fontFamily: "monospace" }}>{u.email}</td>
                  <td style={{ ...tdStyle, color: TEXT_MUT, fontSize: 11 }}>
                    {new Date(u.kayit).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10, padding: "2px 8px",
                      background: PURPLE_DIM, border: `1px solid ${PURPLE_BRD}`,
                      borderRadius: 10, color: PURPLE }}>{u.dil}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10, color: u.aktif ? SUCCESS : DANGER }}>
                      {u.aktif ? "● Aktif" : "○ Pasif"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <AnimatePresence>
                        {yukleniyor === u.id && <LoadingOverlay />}
                      </AnimatePresence>
                      <button onClick={() => toggle(u.id)}
                        style={{ background: "none",
                          border: `1px solid ${u.aktif ? DANGER + "44" : SUCCESS + "44"}`,
                          borderRadius: 3, padding: "4px 10px",
                          color: u.aktif ? DANGER : SUCCESS,
                          cursor: "pointer", fontSize: 10,
                          letterSpacing: "0.1em" }}>
                        {u.aktif ? "Askıya Al" : "Aktifleştir"}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 10, color: TEXT_MUT, marginTop: 14, textAlign: "right" }}>
        {goruntulenen.length} / {uyeler.length} üye gösteriliyor
      </p>
    </div>
  );
}

// ─── SEKME: DT KONTROLÜ ──────────────────────────────────────────────────────

function OyunlarSekme() {
  const [oyunlar, setOyunlar] = useState(MOCK_OYUNLAR);
  const [yukleniyor, setYuk]  = useState(null);

  const mudahale = async (id, yeniDurum) => {
    setYuk(id);
    await new Promise(r => setTimeout(r, 900));
    setOyunlar(prev =>
      prev.map(o => o.id === id ? { ...o, durum: yeniDurum } : o)
    );
    setYuk(null);
  };

  return (
    <div>
      <SectionTitle>Devlet Tiyatrosu Oyun Kontrolü</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {oyunlar.map((o, i) => (
          <motion.div key={o.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ position: "relative", background: SURFACE_3,
              border: `1px solid ${GOLD_BORDER}`, borderRadius: 4,
              padding: "16px 18px" }}>

            <AnimatePresence>
              {yukleniyor === o.id && <LoadingOverlay />}
            </AnimatePresence>

            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 6 }}>
                  <span style={{ fontFamily: "serif", fontSize: 15, color: TEXT_PRI,
                    fontWeight: 600 }}>{o.ad}</span>
                  <DurumBadge durum={o.durum} />
                </div>
                <div style={{ fontSize: 11, color: TEXT_MUT }}>
                  {o.tiyatro} · {new Date(o.tarih).toLocaleDateString("tr-TR")}
                  {o.dinlenme > 0 && (
                    <span style={{ marginLeft: 12, color: SUCCESS }}>
                      ▶ {o.dinlenme} dinlenme
                    </span>
                  )}
                </div>
              </div>

              {/* Master müdahale butonları */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {o.durum === "ONAY_BEKLIYOR" && (
                  <>
                    <button onClick={() => mudahale(o.id, "YAYINDA")}
                      style={{ ...actionBtn, borderColor: SUCCESS + "44", color: SUCCESS }}>
                      ✓ Onayla
                    </button>
                    <button onClick={() => mudahale(o.id, "REDDEDILDI")}
                      style={{ ...actionBtn, borderColor: DANGER + "44", color: DANGER }}>
                      ✕ Reddet
                    </button>
                  </>
                )}
                {o.durum === "YAYINDA" && (
                  <button onClick={() => mudahale(o.id, "TASLAK")}
                    style={{ ...actionBtn, borderColor: WARNING + "44", color: WARNING }}>
                    ⏸ Yayından Kaldır
                  </button>
                )}
                {(o.durum === "TASLAK" || o.durum === "REDDEDILDI") && (
                  <button onClick={() => mudahale(o.id, "YAYINDA")}
                    style={{ ...actionBtn, borderColor: PURPLE_BRD, color: PURPLE }}>
                    ⬡ Direkt Yayına Al
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: BİLDİRİM LOGU ────────────────────────────────────────────────────

function BildirimlerSekme() {
  const [log] = useState(
    [...MOCK_BILDIRIMLER].sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
  );

  const tipRenk = { PROMIYER: GOLD, SON_BILET: WARNING, OYUN_GUNU: SUCCESS,
    SİSTEM: PURPLE };

  return (
    <div>
      <SectionTitle>Global Bildirim Logu</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {log.map((b, i) => (
          <motion.div key={b.id}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: "flex", gap: 14, alignItems: "center",
              padding: "12px 16px",
              background: i % 2 === 0 ? SURFACE_3 : SURFACE_2,
              borderLeft: `2px solid ${(tipRenk[b.tip] || TEXT_MUT)}44` }}>

            {/* Zaman */}
            <div style={{ minWidth: 100, fontSize: 10, color: TEXT_MUT,
              fontFamily: "monospace" }}>
              {new Date(b.tarih).toLocaleString("tr-TR", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
              })}
            </div>

            {/* Tip rozeti */}
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10,
              background: (tipRenk[b.tip] || TEXT_MUT) + "15",
              border: `1px solid ${(tipRenk[b.tip] || TEXT_MUT)}33`,
              color: tipRenk[b.tip] || TEXT_MUT,
              letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
              {b.tip}
            </span>

            {/* Oyun adı */}
            <span style={{ flex: 1, fontSize: 12, color: TEXT_PRI,
              fontStyle: b.oyun === "—" ? "italic" : "normal" }}>
              {b.oyun}
            </span>

            {/* Gönderen */}
            <span style={{ fontSize: 9, color: b.gonderenRol === "MASTER"
              ? PURPLE : GOLD, letterSpacing: "0.1em" }}>
              {b.gonderenRol}
            </span>
          </motion.div>
        ))}
      </div>

      <p style={{ fontSize: 10, color: TEXT_MUT, marginTop: 12, textAlign: "center" }}>
        {log.length} bildirim kaydı · Gerçek zamanlı log Firebase'e bağlandığında aktif olacak
      </p>
    </div>
  );
}

// ─── SEKME: LİYAKAT HAVUZU ───────────────────────────────────────────────────

function MekanlarSekme() {
  const [mekanlar, setMekanlar] = useState(MOCK_MEKANLAR);
  const [yukleniyor, setYuk]    = useState(null);
  const [yeniAd, setYeniAd]     = useState("");
  const [yeniKat, setYeniKat]   = useState("KAHVE");
  const [ekleniyor, setEkleniyor] = useState(false);

  const toggleAktif = async (id) => {
    setYuk(id);
    await new Promise(r => setTimeout(r, 600));
    setMekanlar(prev =>
      prev.map(m => m.id === id ? { ...m, aktif: !m.aktif } : m)
    );
    setYuk(null);
  };

  const sil = async (id) => {
    setYuk(id + "_sil");
    await new Promise(r => setTimeout(r, 500));
    setMekanlar(prev => prev.filter(m => m.id !== id));
    setYuk(null);
  };

  const ekle = async () => {
    if (!yeniAd.trim()) return;
    setEkleniyor(true);
    await new Promise(r => setTimeout(r, 800));
    const yeniMekan = {
      id: "m" + Date.now(),
      ad: yeniAd.trim(),
      kategori: yeniKat,
      aktif: true,
      skor: Math.floor(Math.random() * 10) + 88,
    };
    setMekanlar(prev => [...prev, yeniMekan]);
    setYeniAd(""); setEkleniyor(false);
  };

  const KATEGORILER = ["KAHVE", "RESTORAN", "BAR", "HİZMET", "KÜLTÜR"];
  const katRenk = { KAHVE: "#c07840", RESTORAN: GOLD, BAR: PURPLE,
    HİZMET: "#4080c0", KÜLTÜR: SUCCESS };

  return (
    <div>
      <SectionTitle>Nar Seçimi Havuzu</SectionTitle>

      {/* Yeni mekan ekleme */}
      <div style={{ background: SURFACE_3, border: `1px solid ${PURPLE_BRD}`,
        borderRadius: 4, padding: "16px 18px", marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: PURPLE,
          marginBottom: 12, textTransform: "uppercase" }}>+ Yeni Mekan Ekle</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={yeniAd} onChange={e => setYeniAd(e.target.value)}
            placeholder="Mekan adı..."
            style={{ ...inputStyle, flex: "2 1 180px" }} />
          <select value={yeniKat} onChange={e => setYeniKat(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 120px" }}>
            {KATEGORILER.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <motion.button onClick={ekle} disabled={ekleniyor || !yeniAd.trim()}
            whileTap={{ scale: 0.97 }}
            style={{ flex: "1 1 80px", padding: "11px 14px",
              background: yeniAd.trim() ? PURPLE_DIM : "none",
              border: `1px solid ${yeniAd.trim() ? PURPLE_BRD : GOLD_BORDER}`,
              borderRadius: 3, color: yeniAd.trim() ? PURPLE : TEXT_MUT,
              cursor: yeniAd.trim() ? "pointer" : "not-allowed",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6 }}>
            {ekleniyor ? (
              <motion.span animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                ◌
              </motion.span>
            ) : "+ Ekle"}
          </motion.button>
        </div>
      </div>

      {/* Mekan listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {mekanlar.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ position: "relative", display: "flex",
                alignItems: "center", gap: 12,
                background: SURFACE_3,
                border: `1px solid ${m.aktif ? GOLD_BORDER : "rgba(255,255,255,0.04)"}`,
                borderRadius: 3, padding: "12px 16px",
                opacity: m.aktif ? 1 : 0.5, transition: "opacity 0.3s" }}>

              <AnimatePresence>
                {(yukleniyor === m.id || yukleniyor === m.id + "_sil") && (
                  <LoadingOverlay />
                )}
              </AnimatePresence>

              {/* Kategori rozeti */}
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10,
                background: (katRenk[m.kategori] || TEXT_MUT) + "15",
                border: `1px solid ${(katRenk[m.kategori] || TEXT_MUT)}33`,
                color: katRenk[m.kategori] || TEXT_MUT,
                letterSpacing: "0.1em", minWidth: 64, textAlign: "center" }}>
                {m.kategori}
              </span>

              <span style={{ flex: 1, fontSize: 13, color: TEXT_PRI }}>
                {m.ad}
              </span>

              {/* Nar Seçimi skoru */}
              <span style={{ fontSize: 11, color: GOLD, fontFamily: "serif",
                minWidth: 30, textAlign: "right" }}>
                {m.skor}
              </span>

              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleAktif(m.id)}
                  style={{ ...actionBtn,
                    borderColor: m.aktif ? WARNING + "44" : SUCCESS + "44",
                    color: m.aktif ? WARNING : SUCCESS, padding: "4px 10px" }}>
                  {m.aktif ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <button onClick={() => sil(m.id)}
                  style={{ ...actionBtn, borderColor: DANGER + "33",
                    color: DANGER, padding: "4px 8px" }}>
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p style={{ fontSize: 10, color: TEXT_MUT, marginTop: 14, textAlign: "right" }}>
        {mekanlar.filter(m => m.aktif).length} aktif / {mekanlar.length} toplam mekan
      </p>
    </div>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────

export default function MasterPanel({ session, onCikis }) {
  const [aktifSekme, setAktif] = useState("genel");

  const bilesenMap = {
    genel:       <GenelBakis />,
    uyeler:      <UyelerSekme />,
    oyunlar:     <OyunlarSekme />,
    isletmeler:  <IsletmelerSekme />,
    bildirimler: <BildirimlerSekme />,
    mekanlar:    <MekanlarSekme />,
  };

  return (
    <div style={styles.root}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.22em", color: PURPLE,
            opacity: 0.7, marginBottom: 4 }}>MASTER ADMIN · KOMUTA MERKEZİ</p>
          <h1 style={{ fontFamily: "serif", fontSize: 22, fontWeight: 700,
            color: TEXT_PRI, letterSpacing: "0.01em" }}>
            {session?.ad || "Kurucu"}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Canlı pulse */}
          <div style={{ display: "flex", alignItems: "center", gap: 7,
            border: `1px solid ${PURPLE_BRD}`, borderRadius: 20,
            padding: "6px 14px" }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%",
                background: PURPLE }} />
            <span style={{ fontSize: 9, color: PURPLE, letterSpacing: "0.12em" }}>
              CANLI
            </span>
          </div>

          {onCikis && (
            <button onClick={onCikis}
              style={{ background: "none",
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 3, padding: "6px 14px",
                color: TEXT_MUT, cursor: "pointer", fontSize: 11 }}>
              Çıkış
            </button>
          )}
        </div>
      </div>

      {/* ── Sekme Çubuğu ───────────────────────────────────────────── */}
      <div style={styles.tabBar}>
        {SEKMELER.map(s => (
          <button key={s.id} onClick={() => setAktif(s.id)}
            style={{
              ...styles.tabBtn,
              ...(aktifSekme === s.id ? {
                color: PURPLE,
                borderBottomColor: PURPLE,
              } : {}),
            }}>
            <span style={{ marginRight: 5 }}>{s.ikon}</span>
            {s.etiket}
          </button>
        ))}
      </div>

      {/* ── İçerik ─────────────────────────────────────────────────── */}
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div key={aktifSekme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}>
            {bilesenMap[aktifSekme]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────────────

const styles = {
  root: {
    background: SURFACE_1,
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: TEXT_PRI,
    maxWidth: 860,
    margin: "0 auto",
  },
  header: {
    background: SURFACE_2,
    borderBottom: `1px solid ${PURPLE_BRD}`,
    padding: "20px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  tabBar: {
    display: "flex",
    overflowX: "auto",
    background: SURFACE_2,
    borderBottom: `1px solid ${PURPLE_BRD}`,
    padding: "0 16px",
  },
  tabBtn: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: TEXT_MUT,
    cursor: "pointer",
    padding: "14px 14px",
    fontSize: 12,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    transition: "color 0.2s, border-color 0.2s",
    display: "flex",
    alignItems: "center",
  },
  content: {
    padding: "28px 28px 60px",
    background: SURFACE_1,
  },
};

const tdStyle = {
  padding: "11px 12px",
  fontSize: 12,
  color: TEXT_PRI,
  verticalAlign: "middle",
};

const actionBtn = {
  background: "none",
  border: "1px solid",
  borderRadius: 3,
  padding: "5px 12px",
  cursor: "pointer",
  fontSize: 10,
  letterSpacing: "0.1em",
  transition: "opacity 0.2s",
  whiteSpace: "nowrap",
};

const inputStyle = {
  background: SURFACE_2,
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: 3,
  padding: "11px 12px",
  color: TEXT_PRI,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};