/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — BİREYSEL İLAN FORMU (Emlak / Araç)            ║
 * ║     BireyselIlanFormu.jsx — 6 fotoğraf, yasal zırh              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const GOLD_DIM = "rgba(212,175,55,0.08)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const LEGAL_GOLD = "#d4a84b";

export const YASAL_METIN = "Nar Rehberi, alıcı ve satıcıyı buluşturan bağımsız bir rehber platformudur. İşlemlerden doğabilecek hiçbir hukuki veya mali yükümlülüğü kabul etmez. Tüm sorumluluk muhataplara aittir.";

const MAX_BIREYSEL_FOTO = 6;

const EMLAK_TIPLERI = ["Daire", "Villa", "Arsa", "Bahçe", "Tarla"];
const EMLAK_ISLEM = ["Satılık", "Kiralık"];
const ARAC_ISLEM = ["Satılık", "Kiralık"];
const VITES_OPTS = ["Manuel", "Otomatik", "Yarı Otomatik"];

export function YasalZirh() {
  return (
    <p style={{
      fontSize: 10,
      lineHeight: 1.55,
      color: LEGAL_GOLD,
      fontWeight: 500,
      marginTop: 20,
      padding: "14px 16px",
      background: "rgba(212,168,75,0.08)",
      border: `1px solid rgba(212,168,75,0.35)`,
      borderRadius: 6,
      letterSpacing: "0.02em",
    }}>
      {YASAL_METIN}
    </p>
  );
}

// Object URL'i base64 data URL'e çevir (vitrinde kalıcı göstermek için)
function urlToBase64(url) {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.onerror = rej;
          fr.readAsDataURL(blob);
        })
    )
    .catch(() => null);
}

export default function BireyselIlanFormu({ kategori, onBasarili, onKapat, onIlanKaydet }) {
  const isEmlak = kategori === "EMLAK_ILAN";
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [form, setForm] = useState({
    islem: "",
    tip: "",
    metrekare: "",
    odaSayisi: "",
    marka: "",
    model: "",
    yil: "",
    km: "",
    vites: "",
    baslik: "",
    aciklama: "",
    fiyat: "",
    tel: "",
  });
  const [photos, setPhotos] = useState([]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const fileRef = useRef(null);

  const onPhotoChange = useCallback((e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_BIREYSEL_FOTO);
    setPhotos((prev) => {
      prev.forEach((u) => { try { URL.revokeObjectURL(u); } catch (_) { } });
      return files.map((f) => URL.createObjectURL(f));
    });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  useEffect(() => () => {
    photos.forEach((u) => { try { URL.revokeObjectURL(u); } catch (_) { } });
  }, [photos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (yukleniyor) return;
    setYukleniyor(true);

    const baslik = (form.baslik || "").trim();
    const tel = (form.tel || "").trim();
    if (!baslik || !tel) {
      setYukleniyor(false);
      return;
    }
    const fiyat = (form.fiyat || "").trim() || "Fiyat görüşülür";
    let fotolar = [];
    try {
      fotolar = await Promise.all(photos.map((url) => urlToBase64(url)));
      fotolar = fotolar.filter(Boolean);
    } catch (_) {
      fotolar = [];
    }
    const kategoriNorm = isEmlak ? "EMLAK" : "ARAC";
    const payload = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      kategori: kategoriNorm,
      baslik,
      fiyat,
      tel,
      aciklama: (form.aciklama || "").trim() || "",
      metrekare: form.metrekare || "",
      odaSayisi: form.odaSayisi || "",
      marka: form.marka || "",
      model: form.model || "",
      yil: form.yil || "",
      km: form.km || "",
      vites: form.vites || "",
      islem: form.islem || "",
      tip: form.tip || "",
      paket: "BIREYSEL",
      fotolar,
      fotoUrl: fotolar[0] || null,
    };

    if (typeof onIlanKaydet === "function") {
      try {
        onIlanKaydet(payload);
      } catch (_) { }
    }

    try {
      await addDoc(collection(db, "bireysel_ilanlar"), {
        ...payload,
        olusturma_tarihi: new Date().toISOString(),
        onay_durumu: "BEKLIYOR"
      });
      setGonderildi(true);
      setTimeout(() => {
        onBasarili && onBasarili();
      }, 2200);
    } catch (err) {
      console.error("Firebase'e eklenirken veya fotoğraf yüklenirken hata:", err);
      alert("İlan gönderilirken bir hata oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.");
      setYukleniyor(false);
    }
  };

  if (gonderildi) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ minHeight: "100vh", background: SURFACE_1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 48, marginBottom: 16 }}>✓</motion.div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: GOLD, marginBottom: 8 }}>İlanınız liyakat incelemesine gönderildi</p>
          <p style={{ fontSize: 12, color: TEXT_MUT }}>Vitrine yönlendiriliyorsunuz…</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", background: SURFACE_1, padding: "24px 20px 40px", boxSizing: "border-box" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, color: TEXT_PRI, fontWeight: 700 }}>
          {isEmlak ? "Emlak İlanı" : "Araç İlanı"} · Bireysel
        </h1>
        {onKapat && (
          <button type="button" onClick={onKapat} style={{ padding: "8px 16px", border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, background: "transparent", color: TEXT_MUT, fontSize: 11, cursor: "pointer" }}>Kapat</button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* İşlem: Satılık / Kiralık */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, letterSpacing: "0.14em", color: TEXT_MUT, textTransform: "uppercase", display: "block", marginBottom: 8 }}>İşlem Türü</label>
          <div style={{ display: "flex", gap: 10 }}>
            {(isEmlak ? EMLAK_ISLEM : ARAC_ISLEM).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm(p => ({ ...p, islem: opt }))}
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: `1px solid ${form.islem === opt ? GOLD : GOLD_BORDER}`,
                  background: form.islem === opt ? GOLD_DIM : SURFACE_2,
                  color: form.islem === opt ? GOLD : TEXT_MUT,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {isEmlak ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 9, letterSpacing: "0.14em", color: TEXT_MUT, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Konut / Mülk Tipi</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMLAK_TIPLERI.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, tip: opt }))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: `1px solid ${form.tip === opt ? GOLD : GOLD_BORDER}`,
                      background: form.tip === opt ? GOLD_DIM : SURFACE_2,
                      color: form.tip === opt ? GOLD : TEXT_MUT,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Metrekare (m²)</label>
                <input type="text" value={form.metrekare} onChange={e => setForm(p => ({ ...p, metrekare: e.target.value }))} placeholder="Örn. 120" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Oda Sayısı</label>
                <input type="text" value={form.odaSayisi} onChange={e => setForm(p => ({ ...p, odaSayisi: e.target.value }))} placeholder="Örn. 3+1" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Marka</label>
                <input type="text" value={form.marka} onChange={e => setForm(p => ({ ...p, marka: e.target.value }))} placeholder="Örn. BMW" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Model</label>
                <input type="text" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Örn. 320d" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Yıl</label>
                <input type="text" value={form.yil} onChange={e => setForm(p => ({ ...p, yil: e.target.value }))} placeholder="Örn. 2022" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>KM</label>
                <input type="text" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))} placeholder="Örn. 45000" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Vites</label>
                <select value={form.vites} onChange={e => setForm(p => ({ ...p, vites: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }}>
                  <option value="">Seçin</option>
                  {VITES_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>İlan Başlığı</label>
          <input type="text" value={form.baslik} onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))} placeholder="Kısa ve net başlık" required style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Açıklama</label>
          <textarea rows={3} value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="Konum, özellikler…" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>Fiyat</label>
            <input type="text" value={form.fiyat} onChange={e => setForm(p => ({ ...p, fiyat: e.target.value }))} placeholder="Örn. 2.500.000 TL" style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 4 }}>İletişim (Tel)</label>
            <input type="tel" value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))} placeholder="0532 xxx xx xx" required style={{ width: "100%", padding: "10px 12px", background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
          </div>
        </div>

        {/* 6 Fotoğraf */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 9, letterSpacing: "0.14em", color: TEXT_MUT, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Fotoğraf (Maks. {MAX_BIREYSEL_FOTO} Adet)</label>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPhotoChange} style={{ display: "none" }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={photos.length >= MAX_BIREYSEL_FOTO} style={{ padding: "10px 18px", borderRadius: 6, border: `1px solid ${GOLD}40`, background: GOLD_DIM, color: GOLD, fontSize: 11, cursor: photos.length >= MAX_BIREYSEL_FOTO ? "not-allowed" : "pointer" }}>📷 {photos.length}/{MAX_BIREYSEL_FOTO} Seç</button>
          {photos.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, overflow: "hidden", borderRadius: 6, border: `1px solid ${GOLD_BORDER}`, background: SURFACE_2, padding: 8 }}>
              <button type="button" onClick={() => setGalleryIdx(i => i === 0 ? photos.length - 1 : i - 1)} style={{ flexShrink: 0, width: 36, height: 48, border: "none", background: "rgba(255,255,255,0.06)", color: TEXT_PRI, cursor: "pointer", fontSize: 18 }}>‹</button>
              <div style={{ flex: 1, minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={photos[galleryIdx]} alt="" style={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <button type="button" onClick={() => setGalleryIdx(i => i >= photos.length - 1 ? 0 : i + 1)} style={{ flexShrink: 0, width: 36, height: 48, border: "none", background: "rgba(255,255,255,0.06)", color: TEXT_PRI, cursor: "pointer", fontSize: 18 }}>›</button>
            </div>
          )}
        </div>

        <YasalZirh />

        <button type="submit" disabled={!form.baslik || !form.tel || yukleniyor} style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 6, border: `1px solid ${GOLD}55`, background: (form.baslik && form.tel && !yukleniyor) ? `linear-gradient(135deg,${GOLD}33,${GOLD_DIM})` : SURFACE_2, color: (form.baslik && form.tel && !yukleniyor) ? GOLD : TEXT_MUT, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", cursor: (form.baslik && form.tel && !yukleniyor) ? "pointer" : "not-allowed" }}>
          {yukleniyor ? "Gönderiliyor..." : "İlanı Gönder"}
        </button>
      </form>
    </motion.div>
  );
}
