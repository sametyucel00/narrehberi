/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — TİYATRO ADMİN PANELİ v2                     ║
 * ║     TheaterAdminPanel.jsx                                       ║
 * ║                                                                  ║
 * ║     Yeni Özellikler:                                             ║
 * ║       - Onay Hiyerarşisi (TASLAK → ONAY_BEKLIYOR → YAYINDA)    ║
 * ║       - Mobil Önizleme (Mock VenueDetailCard)                   ║
 * ║       - QR Kod Jeneratörü (SVG tabanlı, eklentisiz)             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../services/firebase";
import { collection, addDoc, doc, updateDoc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { batchTranslate } from "../services/cloudTranslationService";
import ProfileSettings from "./ProfileSettings";

// ─── SABITLER ────────────────────────────────────────────────────────────────

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.10)";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.55)";
const SUCCESS = "#4caf7d";
const DANGER = "#c0604a";
const WARNING = "#e0a030";

const DILLER = ["TR", "EN", "RU", "DE"];
const DIL_ETIKET = { TR: "Türkçe", EN: "English", RU: "Русский", DE: "Deutsch" };

const BILDIRIM_SABLONLARI = {
  PROMIYER: { baslik: "Prömiyer Duyurusu", metin: "Bu akşam perde açılıyor." },
  SON_BILET: { baslik: "Son Biletler", metin: "Kapasite dolmak üzere." },
  OYUN_GUNU: { baslik: "Oyun Günü Hatırlatması", metin: "Perdeler saat 20:00'de." },
};

// Onay durumu renk/etiket haritası
const DURUM_META = {
  TASLAK: { renk: TEXT_MUT, etiket: "Taslak", ikon: "◎" },
  ONAY_BEKLIYOR: { renk: WARNING, etiket: "Onay Bekleniyor", ikon: "◐" },
  YAYINDA: { renk: SUCCESS, etiket: "Yayında", ikon: "●" },
  REDDEDILDI: { renk: DANGER, etiket: "Reddedildi", ikon: "✕" },
};

// ─── BOŞ FORM ŞEMASI ─────────────────────────────────────────────────────────

const bosForm = () => ({
  ad: "",
  afis: "",
  promiyer: false,
  tarihler: { promiyer: "", bitis: "", program: [{ tarih: "", saat: "" }] },
  kadro: [{ oyuncu: "", karakter: "" }],
  sinopsis: {
    TR: { perde1: "", perde2: "", sesUrl: "" },
    EN: { perde1: "", perde2: "", sesUrl: "" },
    RU: { perde1: "", perde2: "", sesUrl: "" },
    DE: { perde1: "", perde2: "", sesUrl: "" },
  },
  bildirimler: [
    { tip: "PROMIYER", gonderildi: false, tarih: null },
    { tip: "SON_BILET", gonderildi: false, tarih: null },
    { tip: "OYUN_GUNU", gonderildi: false, tarih: null },
  ],
  analitik: { TR: 0, EN: 0, RU: 0, DE: 0 },
  durum: "TASLAK",           // "TASLAK" | "ONAY_BEKLIYOR" | "YAYINDA" | "REDDEDILDI"
  redNotu: "",
  qrUrl: "",                  // YAYINDA'ya geçince oluşturulur
  biletLink: "",              // Yeni: Bilet/Rezervasyon Linki
});

// ─── SEKME TANIMI ─────────────────────────────────────────────────────────────

const sekmeler = (durum) => [
  { id: "liste", etiket: "Liste", ikon: "📁" },
  { id: "temel", etiket: "Oyun", ikon: "🎭" },
  { id: "kadro", etiket: "Kadro", ikon: "👤" },
  { id: "sinopsis", etiket: "Sinopsis", ikon: "📜" },
  { id: "bilet", etiket: "Bilet", ikon: "🎟️" },
  { id: "onizleme", etiket: "Önizleme", ikon: "👁" },
  { id: "bildirim", etiket: "Bildirimler", ikon: "🔔" },
  { id: "analitik", etiket: "Analitik", ikon: "📊" },
  ...(durum === "YAYINDA"
    ? [{ id: "qr", etiket: "QR Kod", ikon: "!" }]
    : []),
  { id: "ayarlar", etiket: "Ayarlar", ikon: "⚙" },
];

// ─── YARDIMCI BİLEŞENLER ─────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: "serif", fontSize: 11, letterSpacing: "0.2em",
        textTransform: "uppercase", color: GOLD, opacity: 0.7, marginBottom: 6
      }}>
        {children}
      </p>
      <div style={{
        height: 1, background:
          `linear-gradient(90deg, ${GOLD_BORDER}, transparent)`
      }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text" }) {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ ...styles.input, borderColor: f ? GOLD : GOLD_BORDER }}
      onFocus={() => setF(true)} onBlur={() => setF(false)} />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  const [f, setF] = useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        ...styles.input, resize: "vertical", lineHeight: 1.6,
        borderColor: f ? GOLD : GOLD_BORDER
      }}
      onFocus={() => setF(true)} onBlur={() => setF(false)} />
  );
}

// ─── AFİŞ YÜKLEYICI (FileReader + URL.createObjectURL) ───────────────────────

function AfisUploader({ afis, onChange }) {
  const [surukleniyor, setSurukleniyor] = useState(false);
  const inputRef = useRef(null);

  const dosyaIsle = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Frontend önizleme için object URL oluştur (Firebase'e upload sonraya)
    const objectUrl = URL.createObjectURL(file);
    onChange(objectUrl);
  };

  const handleDosyaSec = (e) => dosyaIsle(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setSurukleniyor(false);
    dosyaIsle(e.dataTransfer.files[0]);
  };

  const handleSil = (e) => {
    e.stopPropagation();
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {/* Gizli file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleDosyaSec}
        style={{ display: "none" }}
        id="afis-file-input"
      />

      {afis ? (
        /* ── Önizleme modu ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "relative", borderRadius: 4, overflow: "hidden",
            border: `1px solid ${GOLD_BORDER}`
          }}>
          <img
            src={afis}
            alt="afiş önizleme"
            style={{
              width: "100%", maxHeight: 220,
              objectFit: "cover", display: "block"
            }}
            onError={e => e.target.style.display = "none"}
          />
          {/* Kaldır / Değiştir bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(10,10,18,0.85)", backdropFilter: "blur(6px)",
            display: "flex", gap: 8, padding: "10px 14px"
          }}>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                ...styles.ghostBtn, flex: 1, marginTop: 0,
                padding: "7px 0", fontSize: 11
              }}>
              🖼️ Değiştir
            </button>
            <button
              onClick={handleSil}
              style={{
                ...styles.ghostBtn, flex: 1, marginTop: 0,
                padding: "7px 0", fontSize: 11,
                borderColor: "rgba(192,96,74,0.3)", color: DANGER
              }}>
              ✕ Kaldır
            </button>
          </div>
        </motion.div>
      ) : (
        /* ── Yükleme alanı (drag & drop destekli) ── */
        <motion.div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setSurukleniyor(true); }}
          onDragLeave={() => setSurukleniyor(false)}
          onDrop={handleDrop}
          animate={{
            borderColor: surukleniyor ? GOLD : GOLD_BORDER,
            background: surukleniyor ? GOLD_DIM : SURFACE_3,
          }}
          transition={{ duration: 0.2 }}
          style={{
            border: `1.5px dashed ${GOLD_BORDER}`, borderRadius: 4,
            padding: "32px 20px", textAlign: "center", cursor: "pointer",
            background: SURFACE_3
          }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.7 }}>🖼️</div>
          <p style={{
            fontFamily: "serif", fontSize: 13, color: TEXT_PRI,
            marginBottom: 6, letterSpacing: "0.04em"
          }}>
            Bilgisayardan Seç
          </p>
          <p style={{ fontSize: 11, color: TEXT_MUT }}>
            veya sürükleyip bırakın · JPG, PNG, WEBP
          </p>
          <motion.div
            whileHover={{ opacity: 1 }}
            style={{
              display: "inline-block", marginTop: 14,
              background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 3, padding: "8px 20px",
              fontSize: 11, color: GOLD, letterSpacing: "0.14em",
              opacity: 0.85
            }}>
            DOSYA SEÇ
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ─── QR KOD ÜRETICI (SVG - EKLENTISIZ) ───────────────────────────────────────
// Not: Bu basit görsel QR temsilidir. Prodüksiyonda react-qr-code veya
// qrcode.react kullanılması önerilir. Şimdilik SVG ile mock pattern üretir.

function QRCodeSVG({ value, size = 200 }) {
  // Deterministik sahte QR pattern (hash tabanlı)
  const hash = value.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  const cells = 21;
  const cellSize = size / cells;

  const isBlack = (r, c) => {
    // Finder pattern (köşeler)
    const inFinder = (
      (r < 7 && c < 7) ||
      (r < 7 && c >= cells - 7) ||
      (r >= cells - 7 && c < 7)
    );
    if (inFinder) {
      const rr = r < 7 ? r : r - (cells - 7);
      const cc = c < 7 ? c : c - (cells - 7);
      return (rr === 0 || rr === 6 || cc === 0 || cc === 6) ||
        (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
    }
    // Timing pattern
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    // Data (hash ile renklendir)
    return ((hash >> ((r * cells + c) % 31)) & 1) === 1;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          isBlack(r, c) ? (
            <rect key={`${r}-${c}`}
              x={c * cellSize} y={r * cellSize}
              width={cellSize} height={cellSize}
              fill="#0a0a0f" />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── MOBİL ÖNİZLEME ─────────────────────────────────────────────────────────

function MobilePreview({ form }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {/* Telefon çerçevesi */}
      <div style={styles.phoneFrame}>
        <div style={styles.phoneScreen}>
          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "8px 16px 0", marginBottom: 12
          }}>
            <span style={{ fontSize: 9, color: TEXT_MUT }}>9:41</span>
            <span style={{ fontSize: 9, color: TEXT_MUT }}>◉◉◉</span>
          </div>

          {/* Kart içeriği */}
          <div style={styles.previewCard}>
            <motion.div style={styles.previewTopLine}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 1 }} />

            <div style={{
              fontSize: 9, letterSpacing: "0.18em", color: GOLD,
              opacity: 0.7, marginBottom: 6
            }}>🎭 ETKİNLİK</div>

            <div style={{
              fontFamily: "serif", fontSize: 16, fontWeight: 700,
              color: TEXT_PRI, marginBottom: 8, lineHeight: 1.3
            }}>
              {form.ad || "Oyun Adı"}
            </div>

            {form.afis && (
              <img src={form.afis} alt="afiş"
                style={{
                  width: "100%", height: 80, objectFit: "cover",
                  borderRadius: 2, marginBottom: 8
                }}
                onError={e => e.target.style.display = "none"} />
            )}

            <div style={{
              fontSize: 10, color: "rgba(220,210,190,0.75)",
              fontStyle: "italic", lineHeight: 1.6, marginBottom: 10
            }}>
              {form.sinopsis.TR.perde1
                ? form.sinopsis.TR.perde1.slice(0, 100) + "..."
                : "Sinopsis henüz eklenmedi."}
            </div>

            {/* Oyun Tarihleri */}
            {form.tarihler?.program?.filter(p => p.tarih).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 8, letterSpacing: "0.15em", color: GOLD,
                  opacity: 0.6, marginBottom: 4
                }}>OYUN TARİHLERİ</div>
                {form.tarihler.program.filter(p => p.tarih).map((p, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_MUT, marginBottom: 2 }}>
                    📅 {p.tarih} ⏰ {p.saat}
                  </div>
                ))}
              </div>
            )}

            {/* Kadro özeti */}
            {form.kadro.filter(k => k.oyuncu).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 8, letterSpacing: "0.15em", color: GOLD,
                  opacity: 0.6, marginBottom: 4
                }}>KADRO</div>
                {form.kadro.filter(k => k.oyuncu).slice(0, 3).map((k, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_MUT, marginBottom: 2 }}>
                    {k.oyuncu} — <em>{k.karakter}</em>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 1, background: GOLD_BORDER, margin: "10px 0" }} />

            <div style={{
              background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 2, padding: "8px 10px", textAlign: "center",
              fontSize: 9, color: GOLD, letterSpacing: "0.15em",
              fontWeight: 700, marginBottom: 6
            }}>
              ▶ SESLİ SİNOPSİSİ DİNLE
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => form.biletLink && window.open(form.biletLink, "_blank")}
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #b8932a)`,
                borderRadius: 2, padding: "8px 10px", textAlign: "center",
                fontSize: 9, color: "#0a0a0f", fontWeight: 800,
                letterSpacing: "0.15em", cursor: form.biletLink ? "pointer" : "default",
                opacity: form.biletLink ? 1 : 0.5
              }}>
              BİLET / REZERVASYON
            </motion.div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 8, color: TEXT_MUT, letterSpacing: "0.15em" }}>
              narrehberi.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEKME: TEMEL BİLGİLER ───────────────────────────────────────────────────

function TemelSekme({ form, set }) {
  const kalan = (() => {
    if (!form.tarihler.promiyer) return null;
    const fark = new Date(form.tarihler.promiyer) - new Date();
    if (fark <= 0) return "Prömiyer geçti";
    const gun = Math.floor(fark / 86400000);
    const saat = Math.floor((fark % 86400000) / 3600000);
    return `${gun} gün ${saat} saat`;
  })();

  const ekleTarih = () => {
    const p = form.tarihler.program || [];
    set("tarihler.program", [...p, { tarih: "", saat: "" }]);
  };

  const guncelleTarih = (i, alan, val) => {
    const as = [...(form.tarihler.program || [])];
    as[i] = { ...as[i], [alan]: val };
    set("tarihler.program", as);
  };

  const silTarih = i => {
    const p = form.tarihler.program || [];
    set("tarihler.program", p.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <SectionTitle>Temel Bilgiler</SectionTitle>
      <Field label="Oyun Adı">
        <StyledInput value={form.ad} placeholder="Othello"
          onChange={e => set("ad", e.target.value)} />
      </Field>
      <Field label="Afiş Görseli">
        <AfisUploader afis={form.afis} onChange={url => set("afis", url)} />
      </Field>
      <div style={{ display: "flex", gap: 16 }}>
        <Field label="Prömiyer Tarihi">
          <StyledInput type="date" value={form.tarihler.promiyer}
            onChange={e => set("tarihler.promiyer", e.target.value)} />
        </Field>
        <Field label="Bitiş Tarihi">
          <StyledInput type="date" value={form.tarihler.bitis}
            onChange={e => set("tarihler.bitis", e.target.value)} />
        </Field>
      </div>
      {kalan && (
        <motion.div style={styles.countdownBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD, opacity: 0.7 }}>
            PRÖMİYERE KALAN
          </span>
          <span style={{ fontFamily: "serif", fontSize: 22, color: GOLD, marginTop: 2 }}>
            {kalan}
          </span>
        </motion.div>
      )}

      <SectionTitle>Oyun Tarihleri ve Saatleri</SectionTitle>
      <AnimatePresence>
        {(form.tarihler.program || []).map((satir, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input type="date" value={satir.tarih}
              onChange={e => guncelleTarih(i, "tarih", e.target.value)}
              style={{ ...styles.input, flex: 1 }} />
            <input type="time" value={satir.saat}
              onChange={e => guncelleTarih(i, "saat", e.target.value)}
              style={{ ...styles.input, flex: 1 }} />
            <button onClick={() => silTarih(i)} style={styles.iconBtn}>✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
      <button onClick={ekleTarih} style={{ ...styles.ghostBtn, marginBottom: 16 }}>+ Tarih/Saat Ekle</button>

      <Field label="Prömiyer Durumu">
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {[true, false].map(val => (
            <button key={String(val)} onClick={() => set("promiyer", val)}
              style={{
                ...styles.toggleBtn,
                ...(form.promiyer === val ? styles.toggleBtnActive : {})
              }}>
              {val ? "& Pr?miyer" : "Repertuar"}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── SEKME: KADRO ────────────────────────────────────────────────────────────

function KadroSekme({ form, setKadro }) {
  const ekle = () => setKadro([...form.kadro, { oyuncu: "", karakter: "" }]);
  const sil = i => setKadro(form.kadro.filter((_, idx) => idx !== i));
  const guncelle = (i, alan, val) => {
    const yeni = [...form.kadro];
    yeni[i] = { ...yeni[i], [alan]: val };
    setKadro(yeni);
  };
  return (
    <div>
      <SectionTitle>Oyuncu Kadrosu</SectionTitle>
      <AnimatePresence>
        {form.kadro.map((satir, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input placeholder="Oyuncu adı" value={satir.oyuncu}
              onChange={e => guncelle(i, "oyuncu", e.target.value)}
              style={{ ...styles.input, flex: 1 }} />
            <input placeholder="Karakter" value={satir.karakter}
              onChange={e => guncelle(i, "karakter", e.target.value)}
              style={{ ...styles.input, flex: 1 }} />
            <button onClick={() => sil(i)} style={styles.iconBtn}>✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
      <button onClick={ekle} style={styles.ghostBtn}>+ Oyuncu Ekle</button>
    </div>
  );
}

// ─── SEKME: BİLET / REZERVASYON ──────────────────────────────────────────────

function BiletSekme({ form, set }) {
  return (
    <div>
      <SectionTitle>Bilet / Rezervasyon Yönetimi</SectionTitle>
      <p style={{ fontSize: 11, color: TEXT_MUT, marginBottom: 20, lineHeight: 1.6 }}>
        Seyirci mobil uygulamada "BİLET / REZERVASYON" butonuna bastığında aşağıdaki linke yönlendirilecektir.
      </p>
      <Field label="Bilet / Rezervasyon Linki">
        <StyledInput
          value={form.biletLink}
          placeholder="https://biletinial.com/tiyatro/..."
          onChange={e => set("biletLink", e.target.value)}
        />
      </Field>
      {form.biletLink && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => window.open(form.biletLink, "_blank")}
            style={{ ...styles.ghostBtn, borderColor: SUCCESS + "44", color: SUCCESS, width: "auto" }}>
            🔗 Linki Test Et →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SEKME: SİNOPSİS ─────────────────────────────────────────────────────────

function SinopsisSekme({ form, setForm, setSinopsis, onNotify }) {
  const [aktivDil, setAktivDil] = useState("TR");
  const [aktivPerde, setAktivPerde] = useState("perde1");
  const [ceviriliyor, setCeviriliyor] = useState(false);
  const [ceviriTamam, setCeviriTamam] = useState(false);

  // ── useRef: her dil için ayrı gizli ses dosyası inputu ──────────────────────
  const sesInputRef = useRef({});
  const sesRefCallback = (dil) => (el) => { if (el) sesInputRef.current[dil] = el; };

  const guncelle = (alan, val) =>
    setSinopsis({
      ...form.sinopsis,
      [aktivDil]: { ...form.sinopsis[aktivDil], [alan]: val },
    });

  // Ses dosyası seçildiğinde object URL oluştur
  const handleSesDosyasi = (dil, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setForm(prev => ({
      ...prev,
      sinopsis: {
        ...prev.sinopsis,
        [dil]: { ...prev.sinopsis[dil], sesUrl: objectUrl },
      },
    }));
    e.target.value = "";
  };

  const sesDosyasiSec = () => sesInputRef.current[aktivDil]?.click();

  // ── aiCevir — Batch Translation with Single API Call (Optimal - Gemini 2.0) ───────────────
  const aiCevir = async () => {
    const sourceText = form.sinopsis.TR[aktivPerde];
    if (!sourceText || sourceText.trim().length < 5) {
      onNotify("hata", "Ortak, çeviri yapabilmem için önce Türkçe metni doldurmalısın!");
      return;
    }

    setCeviriliyor(true);
    setCeviriTamam(false);

    try {
      const response = await batchTranslate(sourceText, "tr");

      if (response && response.EN && response.RU && response.DE) {
        setForm(prev => {
          const yeniSinopsis = { ...prev.sinopsis };
          const diller = ["EN", "RU", "DE"];

          diller.forEach(kod => {
            yeniSinopsis[kod] = {
              ...yeniSinopsis[kod],
              [aktivPerde]: response[kod],
            };
          });

          return { ...prev, sinopsis: yeniSinopsis };
        });

        setCeviriliyor(false);
        setCeviriTamam(true);
        setAktivDil("EN");
        setTimeout(() => setCeviriTamam(false), 5000);
      } else {
        throw new Error("API'den geçersiz veya eksik yanıt geldi.");
      }

    } catch (err) {
      console.error("Batch Translation Error:", err);
      setCeviriliyor(false);
      onNotify("hata", "Çeviri sırasında bir hata oluştu. API geçici olarak yoğun olabilir.");
    }
  };

  const trDolu = Boolean(form.sinopsis.TR[aktivPerde]?.trim().length >= 5);
  const ceviriAktif = trDolu && !ceviriliyor && aktivDil === "TR";

  return (
    <div>
      <SectionTitle>Çok Dilli Sinopsis</SectionTitle>

      {/* 🔔 Nar AI Bildirim Paneli (Alert yerine) */}
      <AnimatePresence>
        {ceviriTamam && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: 80, left: "50%", x: "-50%", zIndex: 9999,
              background: "rgba(18, 18, 24, 0.95)", border: `1px solid ${GOLD}`,
              borderRadius: "8px", padding: "12px 24px", color: TEXT_PRI,
              display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
              backdropFilter: "blur(10px)"
            }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: GOLD }}>Nar AI: Çeviri Başarılı!</p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Tüm diller başarıyla çevrildi ve perdelərə eklendi.</p>
            </div>
            <button onClick={() => setCeviriTamam(false)} style={{ background: "none", border: "none", color: TEXT_MUT, fontSize: 16, cursor: "pointer", marginLeft: 10 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gizli ses dosyası inputları */}
      {DILLER.map(dil => (
        <input key={dil} ref={sesRefCallback(dil)} type="file" accept="audio/*"
          style={{ display: "none" }} onChange={e => handleSesDosyasi(dil, e)} />
      ))}

      {/* Dil seçici */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {DILLER.map(dil => (
          <button key={dil} onClick={() => setAktivDil(dil)}
            style={{ ...styles.toggleBtn, ...(aktivDil === dil ? styles.toggleBtnActive : {}) }}>
            {DIL_ETIKET[dil]}
            {form.sinopsis[dil].sesUrl && (
              <span style={{ marginLeft: 5, fontSize: 8, color: SUCCESS }}>♪</span>
            )}
          </button>
        ))}
      </div>

      {/* AI Çeviri Butonu — her zaman görünür */}
      <motion.button
        onClick={aiCevir}
        disabled={!ceviriAktif}
        whileHover={ceviriAktif ? { opacity: 0.88 } : {}}
        whileTap={ceviriAktif ? { scale: 0.97 } : {}}
        style={{
          width: "100%", padding: "13px 18px", marginBottom: 10,
          background: ceviriTamam
            ? `${SUCCESS}15`
            : ceviriliyor ? GOLD_DIM
              : trDolu ? `linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.07))`
                : "rgba(255,255,255,0.02)",
          border: `1px solid ${ceviriTamam ? SUCCESS + "55" : trDolu ? GOLD + "55" : GOLD_BORDER}`,
          borderRadius: 3,
          color: ceviriTamam ? SUCCESS : trDolu ? GOLD : TEXT_MUT,
          cursor: ceviriAktif ? "pointer" : "not-allowed",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "background 0.3s, border-color 0.3s, color 0.3s",
        }}>
        {ceviriliyor ? (
          <>
            <motion.span animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block" }}>◌</motion.span>
            <motion.span animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}>
              Nar AI Çeviriyor...
            </motion.span>
          </>
        ) : ceviriTamam ? (
          "✓ EN · RU · DE Başarıyla Çevrildi"
        ) : (
          "✨ Yapay Zeka ile Tüm Dillere Çevir"
        )}
      </motion.button>

      {!trDolu && aktivDil === "TR" && (
        <p style={{
          fontSize: 10, color: TEXT_MUT, marginBottom: 12,
          textAlign: "center", letterSpacing: "0.05em"
        }}>
          ?nce T?rk?e ? {aktivPerde === "perde1" ? "I." : "II."} Perde metnini doldurun.
        </p>
      )}
      {aktivDil !== "TR" && (
        <p style={{
          fontSize: 10, color: TEXT_MUT, marginBottom: 12,
          textAlign: "center", letterSpacing: "0.05em"
        }}>
          Çeviri için Türkçe sekmesine geçin.
        </p>
      )}

      {/* Perde seçici */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["perde1", "perde2"].map(p => (
          <button key={p} onClick={() => setAktivPerde(p)}
            style={{
              ...styles.toggleBtn, fontSize: 11,
              ...(aktivPerde === p ? styles.toggleBtnActive : {})
            }}>
            {p === "perde1" ? "I. Perde" : "II. Perde"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${aktivDil}-${aktivPerde}`}
          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
          <Field label={`${DIL_ETIKET[aktivDil]}  ${aktivPerde === "perde1" ? "I." : "II."} Perde`}>
            <Textarea value={form.sinopsis[aktivDil][aktivPerde]} rows={6}
              placeholder={`${DIL_ETIKET[aktivDil]} sinopsis...`}
              onChange={e => guncelle(aktivPerde, e.target.value)} />
          </Field>
        </motion.div>
      </AnimatePresence>

      {/* Ses Yükleme — URL veya bilgisayardan dosya */}
      <Field label={`${DIL_ETIKET[aktivDil]} — Sesli Sinopsis`}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={form.sinopsis[aktivDil].sesUrl}
            onChange={e => guncelle("sesUrl", e.target.value)}
            placeholder="https://... .mp3  ya da 🎙 ile dosya seçin"
            style={{ ...styles.input, flex: 1, fontSize: 12 }}
          />
          <motion.button
            onClick={sesDosyasiSec}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            title="Bilgisayardan ses dosyası seç"
            style={{
              width: 40, height: 40, flexShrink: 0,
              background: form.sinopsis[aktivDil].sesUrl ? `${SUCCESS}18` : GOLD_DIM,
              border: `1px solid ${form.sinopsis[aktivDil].sesUrl ? SUCCESS + "55" : GOLD_BORDER}`,
              borderRadius: 3, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "all 0.2s",
            }}>
            {form.sinopsis[aktivDil].sesUrl ? "??" : "???"}
          </motion.button>
        </div>
        {form.sinopsis[aktivDil].sesUrl?.startsWith("blob:") && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              fontSize: 10, color: SUCCESS, marginTop: 6,
              display: "flex", alignItems: "center", gap: 5
            }}>
            <span>●</span> Yerel dosya yüklendi · Firebase'e kayıtta kalıcılaşacak
          </motion.p>
        )}
      </Field>

      {/* Editörün Notu — Dil Tamamlanma */}
      <SectionTitle>Editörün Notu — Dil Tamamlanma</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DILLER.map(dil => {
          const s = form.sinopsis[dil];
          const dolu = [s.perde1, s.perde2, s.sesUrl].filter(Boolean).length;
          return (
            <div key={dil} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontFamily: "serif", fontSize: 11, color: GOLD,
                minWidth: 36
              }}>{dil}</span>
              <div style={{
                flex: 1, height: 4, borderRadius: 2,
                background: "rgba(255,255,255,0.06)"
              }}>
                <motion.div animate={{ width: `${(dolu / 3) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  style={{
                    height: "100%", borderRadius: 2,
                    background: dolu === 3 ? SUCCESS : GOLD, opacity: 0.8
                  }} />
              </div>
              <span style={{ fontSize: 10, color: TEXT_MUT }}>{dolu}/3</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SEKME: ÖNİZLEME & ONAY ──────────────────────────────────────────────────

function OnizlemeSekme({ form, onYayinla }) {
  const meta = DURUM_META[form.durum] || DURUM_META.TASLAK;

  return (
    <div>
      <SectionTitle>Mobil Önizleme</SectionTitle>

      {/* Durum göstergesi */}
      <motion.div style={{
        ...styles.durumBadge, borderColor: meta.renk + "44",
        background: meta.renk + "10"
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.span animate={{ opacity: form.durum === "YAYINDA" ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 1.5, repeat: form.durum === "YAYINDA" ? Infinity : 0 }}
          style={{ color: meta.renk, fontSize: 12 }}>
          {meta.ikon}
        </motion.span>
        <span style={{ fontSize: 11, color: meta.renk, letterSpacing: "0.12em" }}>
          {meta.etiket}
        </span>
      </motion.div>

      <MobilePreview form={form} />

      {/* Aksiyon alanı — duruma göre */}
      <div style={{ marginTop: 24 }}>
        {form.durum !== "YAYINDA" && (
          <motion.button onClick={onYayinla}
            whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }}
            style={{
              ...styles.approveBtn, background: SUCCESS + "15",
              borderColor: SUCCESS + "44", color: SUCCESS, width: "100%"
            }}>
            ✓ Yayınla (Otomatik Kaydet ve Yayına Al)
          </motion.button>
        )}

        {form.durum === "YAYINDA" && (
          <div style={{
            ...styles.infoBox, borderColor: SUCCESS + "44",
            background: SUCCESS + "08", textAlign: "center"
          }}>
            <p style={{ fontSize: 12, color: SUCCESS, letterSpacing: "0.1em" }}>
              ● Bu oyun yayında. QR Kod sekmesinden afişinizi oluşturabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SEKME: BİLDİRİMLER ─────────────────────────────────────────────────────

function BildirimSekme({ form, setBildirimler }) {
  const gonder = i => {
    const yeni = [...form.bildirimler];
    yeni[i] = { ...yeni[i], gonderildi: true, tarih: new Date().toISOString() };
    setBildirimler(yeni);
  };
  const gonderilen = form.bildirimler.filter(b => b.gonderildi).length;

  return (
    <div>
      <SectionTitle>Stratejik Bildirim Sistemi</SectionTitle>
      <div style={{ ...styles.infoBox, marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: GOLD }}>KULLANIM: {gonderilen} / 3</span>
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 8 }}>
          <motion.div animate={{ width: `${(gonderilen / 3) * 100}%` }}
            transition={{ duration: 0.6 }}
            style={{
              height: "100%", borderRadius: 2,
              background: gonderilen === 3 ? DANGER : GOLD
            }} />
        </div>
      </div>
      {form.bildirimler.map((b, i) => {
        const sablon = BILDIRIM_SABLONLARI[b.tip];
        const oncekiYok = i > 0 && !form.bildirimler[i - 1].gonderildi;
        return (
          <motion.div key={b.tip}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              ...styles.bildirimKart,
              ...(b.gonderildi ? styles.bildirimGonderildi : {}),
              ...(oncekiYok ? { opacity: 0.3, pointerEvents: "none" } : {})
            }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 12
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 11, color: b.gonderildi ? SUCCESS : GOLD,
                  letterSpacing: "0.12em", marginBottom: 4
                }}>
                  {i + 1}. {sablon.baslik}
                  {b.gonderildi && (
                    <span style={{
                      marginLeft: 8, fontSize: 9,
                      background: SUCCESS + "20", color: SUCCESS,
                      borderRadius: 10, padding: "2px 8px"
                    }}>✓ GÖNDERİLDİ</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: TEXT_MUT, fontStyle: "italic" }}>
                  "{sablon.metin}"
                </p>
              </div>
              {!b.gonderildi && (
                <button onClick={() => gonder(i)} style={styles.sendBtn}>
                  Gönder
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── SEKME: ANALİTİK ─────────────────────────────────────────────────────────

function AnalitikSekme({ form }) {
  const toplam = Object.values(form.analitik).reduce((a, b) => a + b, 0);
  const renk = { TR: "#4f8ef7", EN: "#6bbf72", RU: "#e07070", DE: "#f0c060" };
  return (
    <div>
      <SectionTitle>Turist Analitik</SectionTitle>
      <div style={{ ...styles.infoBox, textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: GOLD, opacity: 0.7 }}>
          TOPLAM DİNLENME
        </p>
        <p style={{ fontFamily: "serif", fontSize: 36, color: GOLD, marginTop: 4 }}>
          {toplam.toLocaleString("tr-TR")}
        </p>
      </div>
      {DILLER.map(dil => {
        const oran = toplam > 0 ? (form.analitik[dil] / toplam) * 100 : 0;
        return (
          <div key={dil} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: TEXT_PRI }}>{DIL_ETIKET[dil]}</span>
              <span style={{ fontSize: 12, color: TEXT_MUT }}>
                {form.analitik[dil]} ({oran.toFixed(1)}%)
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)" }}>
              <motion.div initial={{ width: 0 }}
                animate={{ width: `${oran}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 4,
                  background: renk[dil], opacity: 0.85
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SEKME: QR KOD ───────────────────────────────────────────────────────────

function QRSekme({ form }) {
  const qrUrl = form.qrUrl || `https://narrehberi.com/sinopsis/${encodeURIComponent(form.ad)}`;
  const [indirildi, setIndirildi] = useState(false);

  const indir = () => {
    // SVG'yi canvas'a çiz ve PNG olarak indir
    const svg = document.getElementById("nar-qr-svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${form.ad || "oyun"}-qr.svg`;
    a.click(); URL.revokeObjectURL(url);
    setIndirildi(true);
    setTimeout(() => setIndirildi(false), 2500);
  };

  return (
    <div>
      <SectionTitle>QR Büyüme Motoru</SectionTitle>

      <div style={{ ...styles.infoBox, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: GOLD, letterSpacing: "0.1em", marginBottom: 6 }}>
          FUAYE AFİŞİ QR KODU
        </p>
        <p style={{ fontSize: 11, color: TEXT_MUT, lineHeight: 1.6 }}>
          Bu QR kod tiyatro fuayesine asılır. Seyirci okuttuğunda Nar Rehberi'ni indirir,
          otomatik üye olur ve kendi dilindeki sesli sinopsise yönlendirilir.
        </p>
      </div>

      {/* QR Kod */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{
          background: "white", padding: 20, borderRadius: 6,
          border: `2px solid ${GOLD_BORDER}`,
          boxShadow: `0 0 40px ${GOLD_DIM}`
        }}>
          <div id="nar-qr-svg">
            <QRCodeSVG value={qrUrl} size={200} />
          </div>
        </div>
      </motion.div>

      {/* URL */}
      <div style={{ ...styles.infoBox, marginBottom: 16, wordBreak: "break-all" }}>
        <p style={{
          fontSize: 9, letterSpacing: "0.15em", color: GOLD,
          opacity: 0.6, marginBottom: 4
        }}>HEDEFLEDİĞİ URL</p>
        <p style={{ fontSize: 11, color: TEXT_MUT, fontFamily: "monospace" }}>{qrUrl}</p>
      </div>

      {/* Dil hedefleme */}
      <div style={{ marginBottom: 20 }}>
        <SectionTitle>Dil Bazlı Hedefleme</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DILLER.map(dil => (
            <div key={dil} style={{
              ...styles.infoBox, flex: "1 1 80px",
              textAlign: "center", padding: "10px 12px"
            }}>
              <p style={{
                fontSize: 9, letterSpacing: "0.15em", color: GOLD,
                marginBottom: 4
              }}>{dil}</p>
              <p style={{ fontSize: 10, color: TEXT_MUT }}>
                /sinopsis/{dil.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* İndir / Yazdır */}
      <div style={{ display: "flex", gap: 10 }}>
        <motion.button onClick={indir} whileTap={{ scale: 0.97 }}
          style={{
            ...styles.approveBtn, flex: 1,
            ...(indirildi ? {
              background: SUCCESS + "15",
              borderColor: SUCCESS + "44", color: SUCCESS
            } : {})
          }}>
          {indirildi ? " 0ndirildi" : " SVG 0ndir"}
        </motion.button>
        <motion.button onClick={() => window.print()} whileTap={{ scale: 0.97 }}
          style={{ ...styles.approveBtn, flex: 1 }}>
          ⎙ Yazdır
        </motion.button>
      </div>
    </div>
  );
}

// ─── SEKME: OYUN LİSTESİ ──────────────────────────────────────────────────────

function OyunListeSekme({ onDuzenle, onNotify }) {
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "theatre_plays"), orderBy("olusturma_tarihi", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const veriler = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setListe(veriler);
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  const sil = async (id) => {
    if (!window.confirm("Bu oyunu silmek istediinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "theatre_plays", id));
      onNotify("basari", "Oyun başarıyla silindi.");
    } catch (e) {
      onNotify("hata", "Silme işlemi sırasında hata oluştu.");
    }
  };

  if (yukleniyor) return <p style={{ textAlign: "center", color: TEXT_MUT }}>Yükleniyor...</p>;

  return (
    <div>
      <SectionTitle>Yayındaki ve Taslak Oyunlar</SectionTitle>
      {liste.length === 0 && <p style={{ textAlign: "center", color: TEXT_MUT, padding: 20 }}>Henüz oyun eklenmemiş.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {liste.map(o => (
          <motion.div key={o.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            style={{
              padding: 16, background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 4, background: SURFACE_3,
                overflow: "hidden", border: `1px solid ${GOLD_BORDER}`
              }}>
                {o.afis && <img src={o.afis} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI }}>{o.ad}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: DURUM_META[o.durum]?.renk || GOLD
                  }} />
                  <span style={{ fontSize: 10, color: TEXT_MUT, letterSpacing: "0.1em" }}>{DURUM_META[o.durum]?.etiket}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onDuzenle(o)}
                style={{ ...styles.toggleBtn, borderColor: GOLD, color: GOLD, padding: "6px 12px" }}>
                Düzenle
              </button>
              <button onClick={() => sil(o.id)}
                style={{ ...styles.toggleBtn, borderColor: DANGER, color: DANGER, padding: "6px 12px" }}>
                Sil
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── ANA PANELBİLEŞENİ ───────────────────────────────────────────────────────

export default function TheaterAdminPanel({ onCikis, onKapat, initialOyun = null }) {
  const [form, setForm] = useState(() => initialOyun ? { ...bosForm(), ...initialOyun } : bosForm());
  const [aktifSekme, setAktif] = useState("temel");
  const [kaydediliyor, setKay] = useState(false);
  const [sistemBildirim, setSistemBildirim] = useState(null);

  useEffect(() => {
    if (initialOyun) {
      setForm({ ...bosForm(), ...initialOyun });
      setAktif("temel");
    }
  }, [initialOyun]);

  const notify = useCallback((tip, mesaj) => {
    setSistemBildirim({ tip, mesaj });
    setTimeout(() => setSistemBildirim(null), 3500);
  }, []);

  const handleKaydet = async () => {
    setKay(true);
    try {
      const data = {
        ...form,
        olusturma_tarihi: form.olusturma_tarihi || new Date().toISOString(),
        guncelleme_tarihi: new Date().toISOString()
      };

      if (form.id) {
        await updateDoc(doc(db, "theatre_plays", form.id), data);
      } else {
        const docRef = await addDoc(collection(db, "theatre_plays"), data);
        setForm(prev => ({ ...prev, id: docRef.id }));
      }
      notify("basari", "Oyun başarıyla kaydedildi.");
    } catch (e) {
      console.error(e);
      notify("hata", "Kayıt sırasında hata oluştu.");
    }
    setKay(false);
  };

  const set = useCallback((yol, deger) => {
    setForm(prev => {
      const p = yol.split(".");
      if (p.length === 1) return { ...prev, [yol]: deger };
      if (p.length === 2) return { ...prev, [p[0]]: { ...prev[p[0]], [p[1]]: deger } };
      return prev;
    });
  }, []);

  const onYayinla = async () => {
    const yeniForm = {
      ...form,
      durum: "YAYINDA",
      qrUrl: `https://narrehberi.com/sinopsis/${encodeURIComponent(form.ad || "Oyun")}`,
    };
    setForm(yeniForm);

    setKay(true);
    try {
      const data = {
        ...yeniForm,
        olusturma_tarihi: yeniForm.olusturma_tarihi || new Date().toISOString(),
        guncelleme_tarihi: new Date().toISOString()
      };
      if (yeniForm.id) {
        await updateDoc(doc(db, "theatre_plays", yeniForm.id), data);
      } else {
        const docRef = await addDoc(collection(db, "theatre_plays"), data);
        setForm(prev => ({ ...prev, id: docRef.id }));
      }
      notify("basari", "Oyun başarıyla yayınlandı ve kaydedildi.");
    } catch (e) {
      console.error(e);
      notify("hata", "Yayınlama sırasında hata oluştu.");
    }
    setKay(false);
  };

  const durumMeta = DURUM_META[form.durum] || DURUM_META.TASLAK;
  const aktifSekmeler = sekmeler(form.durum);

  // Eğer aktif sekme artık listede yoksa (QR sekme kaldırıldıysa) temel'e dön
  const gosterilecekSekme = aktifSekmeler.find(s => s.id === aktifSekme)
    ? aktifSekme : "temel";

  const renderSekme = () => {
    switch (gosterilecekSekme) {
      case "liste":
        return <OyunListeSekme onDuzenle={(o) => { setForm(o); setAktif("temel"); }} onNotify={notify} />;
      case "temel":
        return <TemelSekme form={form} set={set} />;
      case "kadro":
        return <KadroSekme form={form}
          setKadro={k => setForm(p => ({ ...p, kadro: k }))} />;
      case "sinopsis":
        return <SinopsisSekme
          form={form}
          setForm={setForm}
          onNotify={notify}
          setSinopsis={s => setForm(p => ({ ...p, sinopsis: s }))}
        />;
      case "bilet":
        return <BiletSekme form={form} set={set} />;
      case "onizleme":
        return <OnizlemeSekme form={form} onYayinla={onYayinla} />;
      case "bildirim":
        return <BildirimSekme form={form}
          setBildirimler={b => setForm(p => ({ ...p, bildirimler: b }))} />;
      case "analitik":
        return <AnalitikSekme form={form} />;
      case "qr":
        return <QRSekme form={form} />;
      case "ayarlar":
        return <ProfileSettings userRole="DT_ADMIN" />;
      default:
        return <TemelSekme form={form} set={set} />;
    }
  };

  return (
    <div style={styles.root}>
      {/* 🔔 Sistem Bildirimleri (Toast) */}
      <AnimatePresence>
        {sistemBildirim && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: 20, left: "50%", x: "-50%", zIndex: 9999,
              background: "rgba(18, 18, 24, 0.95)",
              border: `1px solid ${sistemBildirim.tip === "basari" ? SUCCESS : DANGER}`,
              borderRadius: "8px", padding: "12px 24px", color: TEXT_PRI,
              display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
              backdropFilter: "blur(10px)",
              fontFamily: "'Inter','Garamond',serif"
            }}>
            <span style={{ fontSize: 20 }}>{sistemBildirim.tip === "basari" ? "(" : ""}</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: sistemBildirim.tip === "basari" ? SUCCESS : DANGER }}>
                {sistemBildirim.tip === "basari" ? "Ba_ar1l1" : "Hata"}
              </p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.8, fontFamily: "sans-serif" }}>{sistemBildirim.mesaj}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {onKapat && (
            <button onClick={onKapat} style={{ background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
          <div>
            <p style={{
              fontSize: 9, letterSpacing: "0.22em", color: GOLD,
              opacity: 0.65, marginBottom: 4
            }}>TİYATRO YETKİLİSİ PANELİ</p>
            <h1 style={styles.headerTitle}>{form.ad || "Yeni Oyun"}</h1>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setForm(bosForm())}
                style={{
                  background: "none", border: `1px solid ${GOLD_BORDER}`,
                  borderRadius: 3, padding: "4px 10px", color: SUCCESS,
                  cursor: "pointer", fontSize: 10, letterSpacing: "0.05em"
                }}>
                + YENİ OYUN EKLE
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div style={{
            ...styles.durumBadge,
            borderColor: durumMeta.renk + "44",
            background: durumMeta.renk + "10"
          }}
            animate={{ opacity: form.durum === "YAYINDA" ? [1, 0.7, 1] : 1 }}
            transition={{ duration: 2, repeat: form.durum === "YAYINDA" ? Infinity : 0 }}>
            <span style={{ color: durumMeta.renk }}>{durumMeta.ikon}</span>
            <span style={{
              fontSize: 10, color: durumMeta.renk,
              letterSpacing: "0.1em"
            }}>{durumMeta.etiket}</span>
          </motion.div>
          <button onClick={handleKaydet} disabled={kaydediliyor}
            style={{
              background: GOLD_DIM, border: `1px solid ${GOLD}`,
              borderRadius: 3, padding: "6px 14px", color: GOLD,
              cursor: "pointer", fontSize: 11, fontWeight: 700
            }}>
            {kaydediliyor ? "..." : "Sisteme Kaydet"}
          </button>
          {onCikis && (
            <button onClick={onCikis}
              style={{
                background: "none", border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 3, padding: "6px 14px", color: TEXT_MUT,
                cursor: "pointer", fontSize: 11
              }}>
              Oturumu Kapat
            </button>
          )}
        </div>
      </div>

      {/* ── Sekme Çubuğu ───────────────────────────────────────────────── */}
      <div style={styles.tabBar}>
        {aktifSekmeler.map(s => (
          <button key={s.id} onClick={() => setAktif(s.id)}
            style={{
              ...styles.tabBtn,
              ...(gosterilecekSekme === s.id ? styles.tabBtnActive : {}),
              ...(s.id === "qr" ? { color: GOLD } : {})
            }}>
            <span style={{ marginRight: 5 }}>{s.ikon}</span>{s.etiket}
            {s.id === "qr" && (
              <motion.span style={{ marginLeft: 4, fontSize: 8, color: SUCCESS }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}>●</motion.span>
            )}
          </button>
        ))}
      </div>

      {/* ── İçerik ─────────────────────────────────────────────────────── */}
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div key={gosterilecekSekme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}>
            {renderSekme()}
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
    width: "100%",
    margin: "0",
  },
  header: {
    background: SURFACE_2,
    borderBottom: `1px solid ${GOLD_BORDER}`,
    padding: "20px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontFamily: "'Inter','Garamond',serif",
    fontSize: 22, fontWeight: 700,
    color: TEXT_PRI, letterSpacing: "0.01em",
  },
  tabBar: {
    display: "flex", flexWrap: "wrap", justifyContent: "center",
    background: SURFACE_2,
    borderBottom: `1px solid ${GOLD_BORDER}`,
    padding: "6px 12px",
    gap: 4
  },
  tabBtn: {
    background: "none", border: "none",
    borderBottom: "2px solid transparent",
    color: TEXT_MUT, cursor: "pointer",
    padding: "8px 10px",
    fontSize: 11, letterSpacing: "0.03em",
    whiteSpace: "nowrap",
    transition: "color 0.2s, border-color 0.2s",
    display: "flex", alignItems: "center",
  },
  tabBtnActive: { color: GOLD, borderBottomColor: GOLD },
  content: { padding: "28px 28px 60px", background: SURFACE_1 },
  label: {
    display: "block", fontSize: 10,
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: GOLD, opacity: 0.65, marginBottom: 8,
  },
  input: {
    display: "block", width: "100%",
    background: SURFACE_3,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 3, padding: "11px 14px",
    color: TEXT_PRI, fontSize: 13.5,
    fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  toggleBtn: {
    background: "none",
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 3, padding: "8px 16px",
    color: TEXT_MUT, cursor: "pointer",
    fontSize: 12, letterSpacing: "0.08em",
    transition: "all 0.2s",
  },
  toggleBtnActive: {
    background: GOLD_DIM, borderColor: GOLD, color: GOLD,
  },
  ghostBtn: {
    background: "none",
    border: `1px dashed ${GOLD_BORDER}`,
    borderRadius: 3, padding: "10px 18px",
    color: GOLD, opacity: 0.7, cursor: "pointer",
    fontSize: 12, letterSpacing: "0.1em",
    width: "100%", marginTop: 4,
  },
  iconBtn: {
    background: "none",
    border: `1px solid rgba(192,96,74,0.3)`,
    borderRadius: 3, width: 34, height: 34,
    color: DANGER, cursor: "pointer", fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "0.2s"
  },
  countdownBox: {
    background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4,
    padding: "16px 20px", marginBottom: 24, textAlign: "center", display: "flex", flexDirection: "column"
  },
  infoBox: {
    background: SURFACE_3,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 3, padding: "16px 18px",
  },
  durumBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    border: "1px solid", borderRadius: 20,
    padding: "6px 14px",
  },
  bildirimKart: {
    background: SURFACE_3,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 3, padding: "16px 18px", marginBottom: 12,
  },
  bildirimGonderildi: {
    borderColor: "rgba(76,175,125,0.25)",
    background: "rgba(76,175,125,0.04)",
  },
  sendBtn: {
    background: `linear-gradient(135deg, ${GOLD}, #b8932a)`,
    border: "none", borderRadius: 3,
    padding: "8px 16px", color: "#0a0a0f",
    cursor: "pointer", fontSize: 11,
    fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
  },
  approveBtn: {
    display: "block", width: "100%",
    background: GOLD_DIM,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 3, padding: "13px 18px",
    color: GOLD, cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: 700,
    letterSpacing: "0.15em", textTransform: "uppercase",
    textAlign: "center", transition: "all 0.2s",
  },
  phoneFrame: {
    width: "min(300px, 100%)", height: "auto", minHeight: 480, background: "#0a0a0f",
    borderRadius: 32, border: "8px solid #1a1a24", padding: 8, position: "relative",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
  },
  phoneScreen: { background: SURFACE_1, borderRadius: 24, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" },
  previewCard: { padding: 18, flex: 1, position: "relative" },
  previewTopLine: { width: 40, height: 2, background: GOLD, borderRadius: 1, marginBottom: 16, transformOrigin: "left" },
};
