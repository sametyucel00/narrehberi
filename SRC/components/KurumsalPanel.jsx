/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — KURUMSAL PREMİUM PANEL (Emlakçı ve Galerici)  ║
 * ║     KurumsalPanel.jsx — İlan VER butonu + kurumsal ilan formu   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YasalZirh } from "./BireyselIlanFormu.jsx";
import { db, auth } from "../services/firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import ProfileSettings from "./ProfileSettings";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const GOLD_DIM = "rgba(212,175,55,0.08)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const WARNING = "#e0a030";
const DANGER = "#c0604a";
const UYELIK_RENK = { PLATİN: "#a0c4ff", ALTIN: "#D4AF37", GUMUS: "#c0c0c0", BRONZ: "#c07840" };
const PAKETLER = [
  { id: "BRONZ", ad: "Bronz", limit: 5, renk: "#cd7f32", maxFoto: 6 },
  { id: "GUMUS", ad: "Gümüş", limit: 20, renk: "#c0c0c0", maxFoto: 8 },
  { id: "ALTIN", ad: "Altın", limit: null, renk: GOLD, maxFoto: 10 },
  { id: "PLATİN", ad: "Platin", limit: null, renk: "#a0c4ff", maxFoto: 15 },
];

const KURUMSAL_KATEGORILER = [
  { id: "EMLAK", label: "Emlak" },
  { id: "ARAC", label: "Araç" },
  { id: "RENTACAR", label: "Rent A Car" },
];
const EMLAK_TIPLERI = ["Daire", "Villa", "Arsa", "Bahçe", "Tarla"];
const VITES_OPTS = ["Manuel", "Otomatik", "Yarı Otomatik"];

export default function KurumsalPanel({ onCikis, onKapat }) {
  const [paketId, setPaketId] = useState("GUMUS");
  const [ilanFormAcik, setIlanFormAcik] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [ilanlar, setIlanlar] = useState([]);
  const [tab, setTab] = useState("DASHBOARD"); // DASHBOARD | SETTINGS

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const q = query(collection(db, "kurumsal_ilanlar"), where("owner_uid", "==", u.uid));
    const unsub = onSnapshot(q, (snap) => {
      setIlanlar(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const currentIlanSayisi = ilanlar.length;
  const paket = PAKETLER.find(p => p.id === paketId) || PAKETLER[1];
  const limit = paket.limit;
  const atLimit = limit != null && currentIlanSayisi >= limit;
  const limitLabel = limit == null ? "S1n1rs1z" : `${currentIlanSayisi} / ${limit}`;
  const maxFoto = paket.maxFoto ?? 6;

  const mockIstatistikler = [
    { etiket: "Toplam İlan", deger: currentIlanSayisi, ikon: "📋" },
    { etiket: "Görüntülenme (30 gün)", deger: "0", ikon: "👁" },
    { etiket: "Öne Çıkarılan", deger: "0", ikon: "⭐" },
    { etiket: "İletişim Tıklanma", deger: "0", ikon: "📞" },
  ];

  const mockOneCikarilanlar = [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "100vh",
        background: SURFACE_1,
        padding: "24px 28px",
        boxSizing: "border-box",
        width: "100%",
        margin: "0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {onKapat && (
            <button onClick={onKapat} style={{ background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.2em", color: GOLD, opacity: 0.8, marginBottom: 4 }}>NAR REHBERİ — KURUMSAL PANEL</p>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(18px, 5vw, 24px)", color: TEXT_PRI, fontWeight: 700 }}>Emlakçı ve Galerici Yönetimi</h1>
          </div>
        </div>
        <button
          onClick={onCikis}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 4,
            color: TEXT_MUT,
            fontSize: 11,
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          Oturumu Kapat
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 24,
        paddingBottom: 4
      }}>
        <button onClick={() => setTab("DASHBOARD")} style={{ padding: "12px 16px", background: tab === "DASHBOARD" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "DASHBOARD" ? GOLD : GOLD_BORDER}`, color: tab === "DASHBOARD" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span>🏢</span>İlanlarım</button>
        <button onClick={() => setTab("SETTINGS")} style={{ padding: "12px 16px", background: tab === "SETTINGS" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "SETTINGS" ? GOLD : GOLD_BORDER}`, color: tab === "SETTINGS" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span>⚙️</span>Ayarlar</button>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)`, marginBottom: 28 }} />

      <AnimatePresence mode="wait">
        {tab === "DASHBOARD" && (
          <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* İlan İstatistikleri */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD, marginBottom: 14, textTransform: "uppercase" }}>İlan İstatistikleri</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {mockIstatistikler.map((s, i) => (
                  <div
                    key={s.etiket}
                    style={{
                      background: SURFACE_2,
                      border: `1px solid ${GOLD_BORDER}`,
                      borderRadius: 6,
                      padding: "14px 16px",
                      flex: "1 1 120px"
                    }}
                  >
                    <span style={{ fontSize: 20, marginBottom: 6, display: "block" }}>{s.ikon}</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRI }}>{s.deger}</div>
                    <div style={{ fontSize: 9, color: TEXT_MUT, letterSpacing: "0.06em" }}>{s.etiket}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Paket Durumu */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD, marginBottom: 14, textTransform: "uppercase" }}>Paket Durumu</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                {PAKETLER.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPaketId(p.id)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 6,
                      border: `1px solid ${paketId === p.id ? p.renk : GOLD_BORDER}`,
                      background: paketId === p.id ? `${p.renk}18` : SURFACE_2,
                      color: paketId === p.id ? p.renk : TEXT_MUT,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {p.ad} {p.limit != null ? `(${p.limit} 0lan)` : "(S1n1rs1z)"}
                  </button>
                ))}
              </div>
              <div style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 11, color: TEXT_MUT }}>Mevcut kullanım</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: atLimit ? WARNING : TEXT_PRI }}>
                    {limitLabel}
                    {atLimit && " — Limit dolu"}
                  </span>
                </div>
                {limit != null && (
                  <div style={{ marginTop: 10, height: 6, background: SURFACE_3, borderRadius: 3, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${limit === 0 ? 0 : Math.min(100, (currentIlanSayisi / limit) * 100)}%` }}
                      transition={{ duration: 0.6 }}
                      style={{ height: "100%", background: atLimit ? WARNING : GOLD, borderRadius: 3 }}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Öne Çıkarılanlar */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD, marginBottom: 14, textTransform: "uppercase" }}>Öne Çıkarılanlar</h2>
              <div style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, overflow: "hidden" }}>
                {mockOneCikarilanlar.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: TEXT_MUT, fontSize: 11 }}>Öne çıkarılmış ilan yok.</div>
                ) : (
                  mockOneCikarilanlar.map((ilan, i) => (
                    <div
                      key={ilan.id}
                      style={{
                        padding: "14px 18px",
                        borderBottom: i < mockOneCikarilanlar.length - 1 ? `1px solid ${GOLD_BORDER}` : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: TEXT_PRI, fontWeight: 600 }}>{ilan.baslik}</div>
                        <div style={{ fontSize: 10, color: TEXT_MUT }}>{ilan.kategori} · Öne çıkarma bitiş: {ilan.bitis}</div>
                      </div>
                      <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 12, background: GOLD_DIM, border: `1px solid ${GOLD}44`, color: GOLD }}>AKTİF</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Yeni İlan — sadece İLAN VER butonu */}
            <section>
              <h2 style={{ fontSize: 10, letterSpacing: "0.18em", color: GOLD, marginBottom: 14, textTransform: "uppercase" }}>Yeni İlan</h2>
              {atLimit ? (
                <div style={{ background: `${DANGER}12`, border: `1px solid ${DANGER}35`, borderRadius: 6, padding: 18 }}>
                  <p style={{ fontSize: 11, color: DANGER, marginBottom: 10 }}>Paket limitinize ulaştınız ({limit} ilan). Yeni ilan eklemek için paket yükseltin veya mevcut bir ilanı kaldırın.</p>
                  <button disabled style={{ padding: "10px 20px", borderRadius: 4, border: "none", background: SURFACE_3, color: TEXT_MUT, fontSize: 11, cursor: "not-allowed" }}>İLAN VER (Engelli)</button>
                </div>
              ) : (
                <div style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, padding: 18 }}>
                  <button
                    onClick={() => setIlanFormAcik(true)}
                    style={{
                      padding: "12px 24px",
                      borderRadius: 4,
                      border: `1px solid ${GOLD}`,
                      background: `linear-gradient(135deg,${GOLD}28,${GOLD_DIM})`,
                      color: GOLD,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.14em",
                    }}
                  >
                    İLAN VER
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {tab === "SETTINGS" && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileSettings userRole="KURUMSAL" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kurumsal ilan formu (modal / inline) */}
      <AnimatePresence>
        {ilanFormAcik && !gonderildi && (
          <KurumsalIlanFormuInline
            paketId={paketId}
            maxFoto={maxFoto}
            onKapat={() => setIlanFormAcik(false)}
            onGonderildi={() => {
              setGonderildi(true);
              setTimeout(() => onCikis(), 2200);
            }}
          />
        )}
      </AnimatePresence>
      {gonderildi && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, background: "rgba(4,4,8,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ textAlign: "center", color: TEXT_PRI }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: GOLD, marginBottom: 8 }}>İlanınız liyakat incelemesine gönderildi</p>
            <p style={{ fontSize: 12, color: TEXT_MUT }}>Vitrine yönlendiriliyorsunuz…</p>
          </div>
        </motion.div>
      )}
    </motion.div>
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

function KurumsalIlanFormuInline({ paketId, maxFoto, onKapat, onGonderildi }) {
  const [kategori, setKategori] = useState("EMLAK");
  const [form, setForm] = useState({
    islem: "", tip: "", metrekare: "", odaSayisi: "", marka: "", model: "", yil: "", km: "", vites: "",
    baslik: "", aciklama: "", fiyat: "", tel: "",
  });
  const [photos, setPhotos] = useState([]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const fileRef = useRef(null);

  const onPhotoChange = useCallback((e) => {
    const files = Array.from(e.target.files || []).slice(0, maxFoto);
    setPhotos(prev => {
      prev.forEach(u => { try { URL.revokeObjectURL(u); } catch (_) { } });
      return files.map(f => URL.createObjectURL(f));
    });
    if (fileRef.current) fileRef.current.value = "";
  }, [maxFoto]);

  useEffect(() => () => {
    photos.forEach(u => { try { URL.revokeObjectURL(u); } catch (_) { } });
  }, [photos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tel || !form.baslik) return;

    let fotolar = [];
    try {
      fotolar = await Promise.all(photos.map((url) => urlToBase64(url)));
      fotolar = fotolar.filter(Boolean);
    } catch (_) {
      fotolar = [];
    }

    try {
      const u = auth.currentUser;
      await addDoc(collection(db, "kurumsal_ilanlar"), {
        ...form,
        owner_uid: u ? u.uid : "ANON",
        kategori: kategori,
        paketId: paketId,
        fotolar,
        fotoUrl: fotolar[0] || null,
        olusturma_tarihi: new Date().toISOString(),
        onay_durumu: "BEKLIYOR"
      });
      onGonderildi();
    } catch (err) {
      console.error("Kurumsal ilan kaydedilemedi:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(4,4,8,0.92)", zIndex: 100, overflow: "auto", padding: "24px 20px 40px", boxSizing: "border-box" }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: GOLD, fontWeight: 700 }}>Kurumsal İlan Girişi</h2>
          <button type="button" onClick={onKapat} style={{ padding: "8px 16px", border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, background: "transparent", color: TEXT_MUT, fontSize: 11, cursor: "pointer" }}>Kapat</button>
        </div>

        <form onSubmit={handleSubmit} style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 9, letterSpacing: "0.14em", color: TEXT_MUT, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Kategori</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {KURUMSAL_KATEGORILER.map(k => (
                <button key={k.id} type="button" onClick={() => setKategori(k.id)} style={{ padding: "10px 18px", borderRadius: 6, border: `1px solid ${kategori === k.id ? GOLD : GOLD_BORDER}`, background: kategori === k.id ? GOLD_DIM : SURFACE_3, color: kategori === k.id ? GOLD : TEXT_MUT, fontSize: 11, cursor: "pointer" }}>{k.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 9, letterSpacing: "0.14em", color: TEXT_MUT, display: "block", marginBottom: 8 }}>İşlem</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Satılık", "Kiralık"].map(opt => (
                <button key={opt} type="button" onClick={() => setForm(p => ({ ...p, islem: opt }))} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${form.islem === opt ? GOLD : GOLD_BORDER}`, background: form.islem === opt ? GOLD_DIM : SURFACE_3, color: form.islem === opt ? GOLD : TEXT_MUT, fontSize: 11, cursor: "pointer" }}>{opt}</button>
              ))}
            </div>
          </div>

          {(kategori === "EMLAK" || kategori === "RENTACAR") && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 8 }}>Konut / Mülk Tipi</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMLAK_TIPLERI.map(opt => (
                  <button key={opt} type="button" onClick={() => setForm(p => ({ ...p, tip: opt }))} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${form.tip === opt ? GOLD : GOLD_BORDER}`, background: form.tip === opt ? GOLD_DIM : SURFACE_3, color: form.tip === opt ? GOLD : TEXT_MUT, fontSize: 11, cursor: "pointer" }}>{opt}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                <div><label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>m²</label><input type="text" value={form.metrekare} onChange={e => setForm(p => ({ ...p, metrekare: e.target.value }))} placeholder="Metrekare" style={{ width: "100%", padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} /></div>
                <div><label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Oda</label><input type="text" value={form.odaSayisi} onChange={e => setForm(p => ({ ...p, odaSayisi: e.target.value }))} placeholder="3+1" style={{ width: "100%", padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} /></div>
              </div>
            </div>
          )}

          {(kategori === "ARAC" || kategori === "RENTACAR") && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 8 }}>Araç Detayları</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input type="text" value={form.marka} onChange={e => setForm(p => ({ ...p, marka: e.target.value }))} placeholder="Marka" style={{ padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }} />
                <input type="text" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Model" style={{ padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }} />
                <input type="text" value={form.yil} onChange={e => setForm(p => ({ ...p, yil: e.target.value }))} placeholder="Yıl" style={{ padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }} />
                <input type="text" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))} placeholder="KM" style={{ padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }} />
                <select value={form.vites} onChange={e => setForm(p => ({ ...p, vites: e.target.value }))} style={{ padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11 }}>
                  <option value="">Vites</option>
                  {VITES_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Başlık</label>
            <input type="text" value={form.baslik} onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))} placeholder="İlan başlığı" required style={{ width: "100%", padding: "10px 12px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Açıklama</label>
            <textarea rows={2} value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="Teknik donanım, özellikler…" style={{ width: "100%", padding: "10px 12px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Fiyat</label><input type="text" value={form.fiyat} onChange={e => setForm(p => ({ ...p, fiyat: e.target.value }))} placeholder="Fiyat" style={{ width: "100%", padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 9, color: TEXT_MUT, display: "block", marginBottom: 4 }}>İletişim</label><input type="tel" value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))} placeholder="0532 xxx xx xx" required style={{ width: "100%", padding: "8px 10px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 6, color: TEXT_PRI, fontSize: 11, boxSizing: "border-box" }} /></div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 9, letterSpacing: "0.12em", color: TEXT_MUT, display: "block", marginBottom: 8 }}>Fotoğraf (Maks. {maxFoto} — paket limiti)</label>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPhotoChange} style={{ display: "none" }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={photos.length >= maxFoto} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${GOLD}40`, background: GOLD_DIM, color: GOLD, fontSize: 11, cursor: photos.length >= maxFoto ? "not-allowed" : "pointer" }}>📷 {photos.length}/{maxFoto}</button>
            {photos.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, overflow: "hidden", borderRadius: 6, border: `1px solid ${GOLD_BORDER}`, padding: 8 }}>
                <button type="button" onClick={() => setGalleryIdx(i => i === 0 ? photos.length - 1 : i - 1)} style={{ flexShrink: 0, width: 32, height: 40, border: "none", background: "rgba(255,255,255,0.06)", color: TEXT_PRI, cursor: "pointer" }}>9</button>
                <img src={photos[galleryIdx]} alt="" style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }} />
                <button type="button" onClick={() => setGalleryIdx(i => i >= photos.length - 1 ? 0 : i + 1)} style={{ flexShrink: 0, width: 32, height: 40, border: "none", background: "rgba(255,255,255,0.06)", color: TEXT_PRI, cursor: "pointer" }}>:</button>
              </div>
            )}
          </div>

          <YasalZirh />

          <button type="submit" disabled={!form.baslik || !form.tel} style={{ width: "100%", marginTop: 18, padding: 12, borderRadius: 6, border: `1px solid ${GOLD}55`, background: form.baslik && form.tel ? `linear-gradient(135deg,${GOLD}33,${GOLD_DIM})` : SURFACE_3, color: form.baslik && form.tel ? GOLD : TEXT_MUT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", cursor: form.baslik && form.tel ? "pointer" : "not-allowed" }}>İlanı Gönder</button>
        </form>
      </div>
    </motion.div>
  );
}
