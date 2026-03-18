/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — MASTER ADMIN KOMUTA MERKEZİ                  ║
 * ║     MasterPanel.jsx — FULL FIREBASE INTEGRATION                ║
 * ║                                                                  ║
 * ║     Renk Dili: Obsidian Aurora + Mor/İndigo (#a070d0) vurgu     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../services/firebase";
import {
  collection, onSnapshot, query, doc, updateDoc,
  deleteDoc, addDoc, orderBy, limit, writeBatch
} from "firebase/firestore";
import TheaterAdminPanel from "./TheaterAdminPanel";
import ProfileSettings from "./ProfileSettings";
import { ANTALYA_ETKINLIK_TAKVIMI_2026 } from "../data/antalyaEtkinlikTakvimi2026";
import { uploadFileToStorage, uploadFilesToStorage } from "../services/storageUpload";

// ─── SABITLER ────────────────────────────────────────────────────────────────

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.2)";
const GOLD_DIM = "rgba(212,175,55,0.08)";
const PURPLE = "#a070d0";
const PURPLE_DIM = "rgba(160,112,208,0.10)";
const PURPLE_BRD = "rgba(160,112,208,0.28)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const SUCCESS = "#4caf7d";
const DANGER = "#c0604a";
const WARNING = "#e0a030";

const KAT_ETIKET = {
  GASTRONOMI: "Gastronomi",
  GECE_HAYATI: "Gece Hayatı",
  KONAKLAMA: "Konaklama",
  SANAT_KULTUR: "Sanat ve Kültür",
  OTOMOTIV: "Otomotiv",
  ALISVERIS: "Alışveriş (Giyim, Market vb)",
  GAYRIMENKUL: "Gayrimenkul / Emlak",
  SAGLIK_GUZELLIK: "Sağlık ve Güzellik",
  USTA_HIZMET: "Usta / Hizmet",
  EGLENCE: "Eğlence",
  REHBER: "Nar Rehberi (İthal İşletmeler)",
};

const UYELIK_RENK = { PLATİN: "#a0c4ff", ALTIN: "#D4AF37", GUMUS: "#c0c0c0", BRONZ: "#c07840" };

// ─── YARDIMCI BİLEŞENLER ─────────────────────────────────────────────────────

function SectionTitle({ children, renk = PURPLE }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: "serif", fontSize: 11, letterSpacing: "0.2em",
        textTransform: "uppercase", color: renk, opacity: 0.8, marginBottom: 6
      }}>
        {children}
      </p>
      <div style={{
        height: 1, background:
          `linear-gradient(90deg, ${renk}44, transparent)`
      }} />
    </div>
  );
}

function DurumBadge({ durum }) {
  const meta = {
    YAYINDA: { renk: SUCCESS, etiket: "Yayında" },
    ONAY_BEKLIYOR: { renk: WARNING, etiket: "Onay Bekleniyor" },
    TASLAK: { renk: TEXT_MUT, etiket: "Taslak" },
    REDDEDILDI: { renk: DANGER, etiket: "Reddedildi" },
  }[durum] || { renk: TEXT_MUT, etiket: durum };

  return (
    <span style={{
      fontSize: 9, padding: "3px 10px", borderRadius: 10,
      background: meta.renk + "18", border: `1px solid ${meta.renk}44`,
      color: meta.renk, letterSpacing: "0.1em", whiteSpace: "nowrap"
    }}>
      {meta.etiket}
    </span>
  );
}

function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, background: "rgba(13,13,18,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10, borderRadius: 3
      }}>
      <motion.div animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: 24, height: 24, border: `2px solid ${PURPLE_BRD}`,
          borderTopColor: PURPLE, borderRadius: "50%"
        }} />
    </motion.div>
  );
}

// ─── SEKME: GENEL BAKIŞ ──────────────────────────────────────────────────────

function GenelBakis({ stats }) {
  return (
    <div>
      <SectionTitle>Sistem Durumu</SectionTitle>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 28
      }}>
        {stats.map((s, i) => (
          <motion.div key={s.etiket}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: SURFACE_3, border: `1px solid ${s.renk}33`,
              borderRadius: 4, padding: "18px 16px",
              boxShadow: `0 0 20px ${s.renk}08`
            }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 10
            }}>
              <span style={{ fontSize: 18 }}>{s.ikon}</span>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: s.renk
                }} />
            </div>
            <div style={{
              fontFamily: "serif", fontSize: 28, color: s.renk,
              marginBottom: 4, letterSpacing: "-0.01em"
            }}>
              {s.deger}
            </div>
            <div style={{
              fontSize: 10, letterSpacing: "0.12em", color: TEXT_MUT,
              textTransform: "uppercase", marginBottom: 2
            }}>
              {s.etiket}
            </div>
            <div style={{ fontSize: 10, color: s.renk, opacity: 0.6 }}>
              {s.alt}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

// ─── SEKME: ÜYELER ───────────────────────────────────────────────────────────

function UyelerSekme() {
  const [uyeler, setUyeler] = useState([]);
  const [yukleniyor, setYuk] = useState(null);
  const [filtre, setFiltre] = useState("TÜMÜ");
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("olusturma_tarihi", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUyeler(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  const toggle = async (id, cur) => {
    setYuk(id);
    try { await updateDoc(doc(db, "users", id), { aktif: !cur }); } catch (e) { }
    setYuk(null);
  };

  const deleteUser = async (id) => {
    if (confirm("Kullan1c1 tamamen silinsin mi?")) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  const goro = filtre === "T?M?" ? uyeler
    : filtre === "AKT0F" ? uyeler.filter(u => u.aktif)
      : uyeler.filter(u => !u.aktif);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Üye Yönetimi</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          {["TÜMÜ", "AKTİF", "PASİF"].map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              background: filtre === f ? PURPLE_DIM : "none",
              border: `1px solid ${filtre === f ? PURPLE_BRD : GOLD_BORDER}`,
              borderRadius: 20, padding: "5px 12px", color: filtre === f ? PURPLE : TEXT_MUT,
              cursor: "pointer", fontSize: 10
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Ad Soyad", "E-posta", "Rol", "Durum", "İşlem"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 9, color: PURPLE, borderBottom: `1px solid ${PURPLE_BRD}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {goro.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={tdStyle}>{u.ad_soyad || u.firma_adi || "İsimsiz"}</td>
                  <td style={{ ...tdStyle, color: TEXT_MUT, fontSize: 11, fontFamily: "monospace" }}>{u.email}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 9, padding: "2px 8px", background: PURPLE_DIM, borderRadius: 10, color: PURPLE }}>{u.rol}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10, color: u.aktif ? SUCCESS : DANGER }}>{u.aktif ? "Aktif" : "Pasif"}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggle(u.id, u.aktif)} style={actionBtn}>{u.aktif ? "Durdur" : "Aktif"}</button>
                      <button onClick={() => deleteUser(u.id)} style={{ ...actionBtn, borderColor: DANGER + "44", color: DANGER }}>Sil</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SEKME: DT KONTROLÜ ──────────────────────────────────────────────────────

function OyunlarSekme() {
  const [oyunlar, setOyunlar] = useState([]);
  const [yukleniyor, setYuk] = useState(null);
  const [editOyun, setEditOyun] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "theatre_plays"), orderBy("olusturma_tarihi", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOyunlar(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  const update = async (id, status) => {
    setYuk(id);
    try { await updateDoc(doc(db, "theatre_plays", id), { durum: status }); } catch (e) { }
    setYuk(null);
  };

  const del = async (id) => {
    if (!window.confirm("Bu oyunu tamamen silmek istediinize emin misiniz?")) return;
    setYuk(id);
    try { await deleteDoc(doc(db, "theatre_plays", id)); } catch (e) { }
    setYuk(null);
  };

  if (editOyun) {
    return (
      <div style={{ margin: "-24px" }}>
        <TheaterAdminPanel initialOyun={editOyun} onKapat={() => setEditOyun(null)} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>Devlet Tiyatrosu Kontrolü</SectionTitle>
        <button onClick={() => setEditOyun({ ad: "", durum: "TASLAK" })} style={{ ...actionBtn, marginBottom: 20 }}>+ Yeni Oyun Ekle</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {oyunlar.map(o => (
          <div key={o.id} style={{ position: "relative", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "16px 18px" }}>
            {yukleniyor === o.id && <LoadingOverlay />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "serif", fontSize: 15, color: TEXT_PRI, fontWeight: 600 }}>{o.ad}</span>
                  <DurumBadge durum={o.durum} />
                </div>
                <div style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>{o.tiyatro || "Devlet Tiyatrosu"} · {o.dinlenme || 0} dinlenme</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {o.durum === "ONAY_BEKLIYOR" && (
                  <>
                    <button onClick={() => update(o.id, "YAYINDA")} style={{ ...actionBtn, color: SUCCESS, borderColor: SUCCESS + "44" }}>Onayla</button>
                    <button onClick={() => update(o.id, "REDDEDILDI")} style={{ ...actionBtn, color: DANGER, borderColor: DANGER + "44" }}>Reddet</button>
                  </>
                )}
                {o.durum === "YAYINDA" && <button onClick={() => update(o.id, "TASLAK")} style={{ ...actionBtn, color: WARNING }}>Durdur</button>}
                {o.durum !== "YAYINDA" && o.durum !== "ONAY_BEKLIYOR" && <button onClick={() => update(o.id, "YAYINDA")} style={actionBtn}>Yayınla</button>}

                <button onClick={() => setEditOyun(o)} style={{ ...actionBtn, color: GOLD, borderColor: GOLD_BORDER }}>Düzenle</button>
                <button onClick={() => del(o.id)} style={{ ...actionBtn, color: DANGER, borderColor: DANGER + "44" }}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: İŞLETME HAVUZU ───────────────────────────────────────────────────

function IsletmelerSekme() {
  const [list, setList] = useState([]);
  const [yukleniyor, setYuk] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "kurumsal_ilanlar"), orderBy("olusturma_tarihi", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setList(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  const toggle = async (id, cur) => {
    setYuk(id);
    const next = cur === "YAYINDA" ? "BEKLIYOR" : "YAYINDA";
    try { await updateDoc(doc(db, "kurumsal_ilanlar", id), { onay_durumu: next }); } catch (e) { }
    setYuk(null);
  };

  return (
    <div>
      <SectionTitle>Kurumsal İlan Havuzu</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["İşletme / İlan", "Kategori", "Paket", "Durum", "İşlem"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 9, color: PURPLE, borderBottom: `1px solid ${PURPLE_BRD}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {list.map(i => (
                <tr key={i.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
                  <td style={tdStyle}>{i.baslik}</td>
                  <td style={tdStyle}>{i.kategori}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 9, padding: "2px 8px", background: (UYELIK_RENK[i.paketId] || "#555") + "18", borderRadius: 10, color: UYELIK_RENK[i.paketId] || "#999" }}>{i.paketId}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10, color: i.onay_durumu === "YAYINDA" ? SUCCESS : WARNING }}>{i.onay_durumu === "YAYINDA" ? "Yay?nda" : "Beklemede"}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ position: "relative" }}>
                      {yukleniyor === i.id && <LoadingOverlay />}
                      <button onClick={() => toggle(i.id, i.onay_durumu)} style={actionBtn}>{i.onay_durumu === "YAYINDA" ? "Durdur" : "Yay1nla"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SEKME: BİREYSEL İLANLAR ────────────────────────────────────────────────
function BireyselIlanlarSekme() {
  const [ilanlar, setIlanlar] = useState([]);
  const [yukleniyor, setYuk] = useState(null);
  const [editIlan, setEditIlan] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "bireysel_ilanlar"), orderBy("olusturma_tarihi", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIlanlar(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    setYuk(id);
    try { 
      await updateDoc(doc(db, "bireysel_ilanlar", id), { onay_durumu: status }); 
    } catch (e) {
      console.error("Status update error:", e);
      alert("Hata: " + e.message);
    }
    setYuk(null);
  };

  const deleteIlan = async (id) => {
    if (confirm("Bu ilan1 silmek istediinize emin misiniz?")) {
      setYuk(id);
      try { 
        await deleteDoc(doc(db, "bireysel_ilanlar", id)); 
      } catch (e) {
        console.error("Delete error:", e);
        alert("Hata: " + e.message);
      }
      setYuk(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editIlan) return;
    setYuk(editIlan.id);
    try {
      // id alanını payload'dan kaldır (doc id'si zaten belli)
      const { id, ...data } = editIlan;
      await updateDoc(doc(db, "bireysel_ilanlar", id), data);
      setEditIlan(null);
    } catch (e) {
      console.error("Save error:", e);
      alert("Kaydedilirken hata oluştu: " + e.message);
    }
    setYuk(null);
  };

  return (
    <div>
      <SectionTitle>Bireysel İlan Yönetimi (Emlak / Araç)</SectionTitle>

      {editIlan && (
        <div style={{ background: SURFACE_2, padding: 20, borderRadius: 6, marginBottom: 20, border: `1px solid ${PURPLE_BRD}`, position: "relative" }}>
          {yukleniyor === editIlan.id && <LoadingOverlay />}
          <h3 style={{ fontFamily: "serif", color: GOLD, marginBottom: 15 }}>İlanı Düzenle</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} value={editIlan.baslik || ""} onChange={e => setEditIlan({ ...editIlan, baslik: e.target.value })} placeholder="Başlık" />
              <input style={inputStyle} value={editIlan.fiyat || ""} onChange={e => setEditIlan({ ...editIlan, fiyat: e.target.value })} placeholder="Fiyat" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} value={editIlan.tel || ""} onChange={e => setEditIlan({ ...editIlan, tel: e.target.value })} placeholder="Telefon" />
              <input style={inputStyle} value={editIlan.kategori || ""} onChange={e => setEditIlan({ ...editIlan, kategori: e.target.value })} placeholder="Kategori" />
            </div>
            <textarea style={{ ...inputStyle, width: "100%", marginBottom: 10 }} rows={3} value={editIlan.aciklama || ""} onChange={e => setEditIlan({ ...editIlan, aciklama: e.target.value })} placeholder="Açıklama" />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={yukleniyor === editIlan.id} style={{ ...actionBtn, background: PURPLE_DIM, color: PURPLE }}>{yukleniyor === editIlan.id ? "..." : "Kaydet"}</button>
              <button type="button" onClick={() => setEditIlan(null)} style={actionBtn}>İptal</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ilanlar.map(i => (
          <div key={i.id} style={{ background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "16px 18px", position: "relative" }}>
            {yukleniyor === i.id && <LoadingOverlay />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 15, flex: "1 1 200px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 4, background: SURFACE_2, overflow: "hidden", flexShrink: 0 }}>
                  {(i.fotoUrl || (i.fotolar && i.fotolar[0])) && <img src={i.fotoUrl || i.fotolar[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "serif", fontSize: 14, color: TEXT_PRI, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.baslik}</div>
                  <div style={{ fontSize: 11, color: GOLD, marginTop: 2 }}>{i.fiyat} · {i.kategori}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUT, marginTop: 4 }}>{i.tel}</div>
                  <div style={{ marginTop: 8 }}><DurumBadge durum={i.onay_durumu || "BEKLIYOR"} /></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flex: 1 }}>
                {i.onay_durumu !== "YAYINDA" && <button onClick={() => updateStatus(i.id, "YAYINDA")} style={{ ...actionBtn, color: SUCCESS, borderColor: SUCCESS + "44", flex: "1 1 auto" }}>Yayınla</button>}
                {i.onay_durumu === "YAYINDA" && <button onClick={() => updateStatus(i.id, "PASIF")} style={{ ...actionBtn, color: WARNING, flex: "1 1 auto" }}>Durdur</button>}
                <button onClick={() => setEditIlan(i)} style={{ ...actionBtn, flex: "1 1 auto" }}>Düzenle</button>
                <button onClick={() => deleteIlan(i.id)} style={{ ...actionBtn, color: DANGER, borderColor: DANGER + "44", flex: "1 1 auto" }}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: BİLDİRİM LOGU ────────────────────────────────────────────────────


function BildirimlerSekme() {
  const [log, setLog] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("tarih", "desc"), limit(30));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLog(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <SectionTitle>Sistem Bildirim Logu</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {log.map(b => (
          <div key={b.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 16px", background: SURFACE_3, borderLeft: "2px solid " + PURPLE_BRD, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: TEXT_MUT, fontFamily: "monospace", minWidth: 100 }}>{new Date(b.tarih).toLocaleTimeString()}</span>
            <span style={{ fontSize: 9, padding: "2px 8px", background: PURPLE_DIM, color: PURPLE, borderRadius: 10 }}>{b.tip}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{b.mesaj || b.oyun}</span>
            <span style={{ fontSize: 9, color: GOLD }}>{b.gonderenRol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: NAR SEÇİMİ ───────────────────────────────────────────────────────

// ─── SEKME: ŞEHİR NABZI ───────────────────────────────────────────────────

function SehirNabziSekme() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "event", kat: "Tiyatro", isim: "", yer: "", tarih: "", saat: "", icon: "🎭", active: true });
  const [editId, setEditId] = useState(null);
  const [importing, setImporting] = useState(false);
  const hasLoadedRef = useRef(false);
  const autoSeededRef = useRef(false);

  useEffect(() => {
    const q = query(collection(db, "city_pulse"), orderBy("type"));
    const unsub = onSnapshot(q, (snap) => {
      hasLoadedRef.current = true;
      setItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const save = async () => {
    if (!form.isim) return;
    if (editId) {
      await updateDoc(doc(db, "city_pulse", editId), form);
    } else {
      await addDoc(collection(db, "city_pulse"), form);
    }
    setForm({ type: "event", kat: "Tiyatro", isim: "", yer: "", tarih: "", saat: "", icon: "🎭", active: true });
    setEditId(null);
  };

  const del = async (id) => { if (confirm("Silinsin mi?")) await deleteDoc(doc(db, "city_pulse", id)); };

  const syncXlsxEvents = async (silent = false) => {
    if (importing) return;
    if (!silent) {
      const ok = confirm("XLSX etkinlik takvimindeki 2026 verileri city_pulse koleksiyonuna senklensin mi?");
      if (!ok) return;
    }
    setImporting(true);
    try {
      const batch = writeBatch(db);
      ANTALYA_ETKINLIK_TAKVIMI_2026.forEach((ev) => {
        batch.set(doc(db, "city_pulse", ev.id), {
          ...ev,
          active: true,
          type: "event",
          source: "xlsx",
        }, { merge: true });
      });
      await batch.commit();
      localStorage.setItem("nar_city_pulse_seeded_2026", "1");
    } catch (err) {
      console.error(err);
      alert("Etkinlikler içe aktarılırken bir hata oluştu.");
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (autoSeededRef.current) return;
    if (items.length > 0) return;
    if (localStorage.getItem("nar_city_pulse_seeded_2026") === "1") {
      autoSeededRef.current = true;
      return;
    }
    autoSeededRef.current = true;
    syncXlsxEvents(true);
  }, [items.length]);

  return (
    <div>
      <SectionTitle>Şehir Nabzı Yönetimi</SectionTitle>
    <div style={{ background: SURFACE_3, padding: 16, borderRadius: 4, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, color: TEXT_MUT }}>XLSX takvimini tek seferde kaynağa yazıp canlı alana senkronlayabilirsiniz.</div>
          <button onClick={syncXlsxEvents} disabled={importing} style={{ ...actionBtn, background: PURPLE_DIM, color: PURPLE, padding: "10px 12px" }}>
            {importing ? "Senkronlan?yor..." : "XLSX Etkinlikleri ??e Aktar"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value, icon: e.target.value === "event" ? "??" : "??" })}>
            <option value="event">Etkinlik</option>
            <option value="service">Hizmet / Acil</option>
          </select>
          <input style={inputStyle} placeholder="İkon (Emoji)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
        </div>
        <input style={{ ...inputStyle, width: "100%", marginBottom: 10, boxSizing: "border-box" }} placeholder="Başlık / İsim" value={form.isim} onChange={e => setForm({ ...form, isim: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Kategori" value={form.kat} onChange={e => setForm({ ...form, kat: e.target.value })} />
          <input style={inputStyle} placeholder="Yer" value={form.yer} onChange={e => setForm({ ...form, yer: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Tarih" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} />
          <input style={inputStyle} placeholder="Saat/Tel" value={form.saat} onChange={e => setForm({ ...form, saat: e.target.value })} />
        </div>
        <button onClick={save} style={{ ...actionBtn, width: "100%", background: PURPLE_DIM, color: PURPLE, padding: 12 }}>{editId ? "G?ncelle" : "Yeni Ekle"}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE_3, padding: "10px 14px", borderRadius: 3, border: "1px solid " + GOLD_BORDER, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: 13, color: TEXT_PRI }}>{item.isim}</div>
              <div style={{ fontSize: 10, color: TEXT_MUT }}>{item.type.toUpperCase()} · {item.kat}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setForm(item); setEditId(item.id); }} style={actionBtn}>✎</button>
              <button onClick={() => del(item.id)} style={{ ...actionBtn, color: DANGER }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: MEKANLAR ───────────────────────────────────────────────────────

function MekanlarSekme() {
  const [venues, setVenues] = useState([]);
  const emptyVenueForm = {
    ad: "",
    kategori: "GASTRONOMI",
    uyelik: "GOLD",
    nar_secimi_skoru: 70,
    google_rating: "",
    google_ratings_total: "",
    adres: "",
    telefon: "",
    lat: "",
    lng: "",
    web: "",
    aciklama: "",
    videoUrl: "",
    fotolar: "",
    fotoUrl: "",
  };
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const toVenueForm = (v = {}) => ({
    ...emptyVenueForm,
    ...v,
    fotoUrl: v.fotoUrl || (Array.isArray(v.fotolar) ? v.fotolar[0] : "") || "",
    fotolar: Array.isArray(v.fotolar) ? v.fotolar.join("\n") : (v.fotolar || ""),
    aciklama: v.aciklama || "",
    videoUrl: v.videoUrl || "",
  });
  const parseFotoList = (value) => String(value || "").split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);

  const [form, setForm] = useState(emptyVenueForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [savingVenue, setSavingVenue] = useState(false);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, "venues"), orderBy("olusturma_tarihi", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      setVenues(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  const save = async (e) => {
    e?.preventDefault?.();
    if (!form.ad?.trim()) return notify("L?tfen mekan ad?n? girin.");
    if (savingVenue) return;
    setSavingVenue(true);
    try {
      const fotolar = parseFotoList(form.fotolar);
      const uploadedGallery = selectedGallery.length ? await uploadFilesToStorage(selectedGallery, `venues/master/gallery`) : [];
      const uploadedCover = selectedCover ? await uploadFileToStorage(selectedCover, `venues/master/cover`) : "";
      const uploadedVideo = selectedVideo ? await uploadFileToStorage(selectedVideo, `venues/master/video`) : "";
      const payload = {
        ...form,
        aciklama: form.aciklama || "",
        videoUrl: uploadedVideo || form.videoUrl || "",
        fotolar: [...fotolar, ...uploadedGallery].filter(Boolean),
        fotoUrl: uploadedCover || form.fotoUrl || fotolar[0] || uploadedGallery[0] || "",
      };
      if (!payload.google_maps_url && payload.lat && payload.lng) {
        payload.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${payload.lat},${payload.lng}`;
      }

      if (editId) {
        await updateDoc(doc(db, "venues", editId), payload);
      } else {
        await addDoc(collection(db, "venues"), { ...payload, aktif: true, onay_durumu: "YAYINDA", olusturma_tarihi: new Date().toISOString() });
      }
      setForm({ ...emptyVenueForm, uyelik: "GOLD" });
      setSelectedCover(null);
      setSelectedGallery([]);
      setSelectedVideo(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      setEditId(null);
      notify(editId ? "Mekan g?ncellendi." : "Mekan eklendi.");
    } catch (err) {
      console.error(err);
      notify("Mekan kaydedilirken bir sorun oluştu.");
    } finally {
      setSavingVenue(false);
    }
  };

  const del = async (id) => { if (confirm("Silinsin mi?")) await deleteDoc(doc(db, "venues", id)); };

  const updateStatus = async (id, status) => {
    try { await updateDoc(doc(db, "venues", id), { onay_durumu: status }); } catch (e) { }
  };

  const handleAutoFill = async () => {
    if (!form.ad) return notify("Lütfen arama yapmak için açıkça Mekan Adı girin (Örn: 'The Tudors Arena').");

    // Google API Anahtarı
    const API_KEY = "AIzaSyChf3O9sGsQDIGBoTjLmtOKH0EFoCXx7AI";

    try {
      // 1. Script yüklü mü kontrol et, yüklü değilse dinamik olarak ekle
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 2. Google Places API işlemleri
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const queryStr = form.ad + " " + (form.adres || "Antalya");

      service.findPlaceFromQuery({
        query: queryStr,
        fields: ['place_id', 'geometry', 'formatted_address', 'rating', 'user_ratings_total']
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];

          // 3. Web Sitesi ve Telefon bilgisi için Detay (Details) Servisine istek
          service.getDetails({
            placeId: place.place_id,
            fields: ['website', 'formatted_phone_number']
          }, (detResults, detStatus) => {
            let fetchedWeb = form.web;
            let fetchedTel = form.telefon;

            if (detStatus === window.google.maps.places.PlacesServiceStatus.OK && detResults) {
              fetchedWeb = detResults.website || fetchedWeb;
              fetchedTel = detResults.formatted_phone_number || fetchedTel;
            }

            setForm(prev => ({
              ...prev,
              lat: place.geometry?.location?.lat()?.toFixed(6) || prev.lat,
              lng: place.geometry?.location?.lng()?.toFixed(6) || prev.lng,
              adres: place.formatted_address || prev.adres,
              google_rating: place.rating?.toFixed(1) || prev.google_rating,
              google_ratings_total: place.user_ratings_total || prev.google_ratings_total,
              web: fetchedWeb || prev.web,
              telefon: fetchedTel || prev.telefon
            }));

            // Notification inside MasterPanel
            notify("✅ Google'dan mekan verileri başarıyla çekildi!");
          });

        } else {
          notify("❌ Google Haritalar'da mekan tam olarak bulunamadı. Lütfen Adı veya Adresi daha spesifik girerek tekrar deneyin.");
        }
      });

    } catch (e) {
      console.error(e);
      notify("⚠️ Google Maps API'ye erişilirken bir hata oluştu.");
    }
  };

  const filtered = venues.filter(v => (v.ad || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {notification && (
        <div style={{ padding: "12px", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 6, marginBottom: 16, color: "#eee6d2", fontWeight: 600 }}>
          {notification}
        </div>
      )}
      <SectionTitle>Mekan Yönetimi (Vitrin)</SectionTitle>
      <form onSubmit={save} style={{ background: SURFACE_3, padding: 16, borderRadius: 4, marginBottom: 20 }}>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: 1, margin: 0, minWidth: "200px" }} placeholder="Mekan Adı" value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })} />
          <button type="button" onClick={handleAutoFill} style={{
            ...actionBtn, background: "rgba(66,133,244,0.15)", color: "#4285F4",
            border: "1px solid rgba(66,133,244,0.3)", padding: "12px 16px", borderRadius: "4px", fontSize: "12px",
            display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap", flex: "1 0 auto"
          }}>
            <span>🔍</span> Otomatik Bul
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <select style={inputStyle} value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
            {Object.keys(KAT_ETIKET).map(k => <option key={k} value={k}>{KAT_ETIKET[k]}</option>)}
          </select>
          <select style={inputStyle} value={form.uyelik} onChange={e => setForm({ ...form, uyelik: e.target.value })}>
            <option value="PLATINUM">PLATINUM</option>
            <option value="GOLD">GOLD</option>
            <option value="BRONZE">BRONZE</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Adres" value={form.adres} onChange={e => setForm({ ...form, adres: e.target.value })} />
          <input style={inputStyle} placeholder="Telefon" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Web Sitesi URL" value={form.web} onChange={e => setForm({ ...form, web: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Kapak Görseli URL" value={form.fotoUrl} onChange={e => setForm({ ...form, fotoUrl: e.target.value })} />
          <input style={inputStyle} placeholder="Video URL (YouTube / MP4)" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
        </div>
        <textarea style={{ ...inputStyle, width: "100%", marginBottom: 10 }} rows={4} placeholder="İşletme Açıklaması" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
        <textarea style={{ ...inputStyle, width: "100%", marginBottom: 10 }} rows={4} placeholder="Ek Görseller (her satıra bir URL)" value={form.fotolar} onChange={e => setForm({ ...form, fotolar: e.target.value })} />
        <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={e => setSelectedCover(e.target.files?.[0] || null)} style={inputStyle} />
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={e => setSelectedGallery(Array.from(e.target.files || []))} style={inputStyle} />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={e => setSelectedVideo(e.target.files?.[0] || null)} style={inputStyle} />
          <div style={{ fontSize: 10, color: TEXT_MUT, lineHeight: 1.5 }}>
            Dosya seçerseniz Storage’a yüklenir ve URL otomatik kaydedilir. İsterseniz URL alanları da yedekte kalır.
          </div>
          {(selectedCover || selectedGallery.length > 0 || selectedVideo) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selectedCover && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(212,175,55,0.12)", color: GOLD }}>Kapak seçildi</span>}
              {selectedGallery.length > 0 && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(76,175,125,0.12)", color: SUCCESS }}>{selectedGallery.length} görsel seçildi</span>}
              {selectedVideo && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(76,175,125,0.12)", color: SUCCESS }}>Video seçildi</span>}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} type="number" step="0.1" placeholder="Google Puanı" value={form.google_rating} onChange={e => setForm({ ...form, google_rating: e.target.value })} />
          <input style={inputStyle} type="number" placeholder="Google Yorum Sayısı" value={form.google_ratings_total} onChange={e => setForm({ ...form, google_ratings_total: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Enlem (lat)" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
          <input style={inputStyle} placeholder="Boylam (lng)" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
        </div>
        <button type="submit" disabled={savingVenue} style={{ ...actionBtn, width: "100%", background: PURPLE_DIM, color: PURPLE, padding: 12, opacity: savingVenue ? 0.75 : 1, cursor: savingVenue ? "wait" : "pointer" }}>{savingVenue ? "Kaydediliyor..." : (editId ? "G?ncelle" : "Ekle")}</button>
      </form>

      <input style={{ ...inputStyle, width: "100%", marginBottom: 12 }} placeholder="Listede ara..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(v => (
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE_3, padding: "10px 14px", borderRadius: 3, border: "1px solid " + GOLD_BORDER }}>
            <div style={{ width: 52, height: 52, borderRadius: 4, overflow: "hidden", background: SURFACE_2, flexShrink: 0 }}>
              {(v.fotoUrl || (Array.isArray(v.fotolar) && v.fotolar[0])) && <img src={v.fotoUrl || v.fotolar[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.ad}</span>
                {v.onay_durumu === "BEKLIYOR" && <span style={{ fontSize: 9, padding: "2px 6px", background: `${WARNING}33`, color: WARNING, borderRadius: 4 }}>ONAY BEKLİYOR</span>}
                {v.videoUrl && <span style={{ fontSize: 9, padding: "2px 6px", background: `${SUCCESS}22`, color: SUCCESS, borderRadius: 4 }}>Video</span>}
              </div>
              <div style={{ fontSize: 9, color: GOLD, marginTop: 2 }}>{v.uyelik} · {v.kategori}</div>
              {v.aciklama && <div style={{ fontSize: 10, color: TEXT_MUT, marginTop: 4, lineHeight: 1.45 }}>{String(v.aciklama).slice(0, 120)}{String(v.aciklama).length > 120 ? "..." : ""}</div>}
            </div>
            {v.onay_durumu === "BEKLIYOR" && (
              <button onClick={() => updateStatus(v.id, "YAYINDA")} style={{ ...actionBtn, borderColor: SUCCESS + "55", color: SUCCESS }}>Onayla</button>
            )}
            <button onClick={() => { setForm(toVenueForm(v)); setEditId(v.id); }} style={actionBtn}>✎</button>
            <button onClick={() => del(v.id)} style={{ ...actionBtn, color: DANGER }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: DATE DOCTOR KONTROLÜ ───────────────────────────────────────────────────

function DateDoctorSekme() {
  const [aktifTab, setAktifTab] = useState("KATEGORI"); // KATEGORI | MEKAN
  const [kategoriler, setKategoriler] = useState([]);
  const [mekanlar, setMekanlar] = useState([]);
  const [ddNotice, setDdNotice] = useState("");

  const [katForm, setKatForm] = useState({ ad: "", aciklama: "", fiyat: "" });
  const [katEditId, setKatEditId] = useState(null);

  const [mekanForm, setMekanForm] = useState({
    ad: "", adres: "", fotoUrl: "", kat: "", butce: "Standart", atmosfer: "Romantik", tercih: "Alkolsüz",
    etiketler: "", menuUrl: "", konumUrl: "", instagramUrl: ""
  });
  const [mekanEditId, setMekanEditId] = useState(null);

  useEffect(() => {
    const unsubKat = onSnapshot(collection(db, "date_doctor_categories"), (snap) => {
      setKategoriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubMekan = onSnapshot(collection(db, "date_doctor_venues"), (snap) => {
      setMekanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubKat(); unsubMekan(); };
  }, []);

  const saveKat = async () => {
    try {
      if (!katForm.ad?.trim()) {
        setDdNotice("Kategori ad? gerekli.");
        return;
      }
      const payload = { ...katForm, ad: katForm.ad.trim() };
      if (katEditId) {
        await updateDoc(doc(db, "date_doctor_categories", katEditId), payload);
      } else {
        await addDoc(collection(db, "date_doctor_categories"), payload);
      }
      setKatForm({ ad: "", aciklama: "", fiyat: "" });
      setKatEditId(null);
      setDdNotice("Kategori kaydedildi.");
    } catch (err) {
      console.error("Date Doctor kategori kayd? ba?ar?s?z:", err);
      setDdNotice(`Kategori kaydedilemedi: ${err?.message || "bilinmeyen hata"}`);
    }
  };
  const delKat = async (id) => { if (confirm("Kategori silinsin mi?")) await deleteDoc(doc(db, "date_doctor_categories", id)); };

  const saveMekan = async () => {
    try {
      if (!mekanForm.ad?.trim()) {
        setDdNotice("Mekan ad? gerekli.");
        return;
      }
      const payload = {
        ...mekanForm,
        ad: mekanForm.ad.trim(),
        adres: mekanForm.adres?.trim() || "",
        fotoUrl: mekanForm.fotoUrl?.trim() || "",
        kat: mekanForm.kat?.trim() || "",
        etiketler: mekanForm.etiketler?.trim() || "",
        menuUrl: mekanForm.menuUrl?.trim() || "",
        konumUrl: mekanForm.konumUrl?.trim() || "",
        instagramUrl: mekanForm.instagramUrl?.trim() || "",
      };
      if (mekanEditId) {
        await updateDoc(doc(db, "date_doctor_venues", mekanEditId), payload);
      } else {
        await addDoc(collection(db, "date_doctor_venues"), payload);
      }
      setMekanForm({
        ad: "", adres: "", fotoUrl: "", kat: "", butce: "Standart", atmosfer: "Romantik", tercih: "Alkols?z",
        etiketler: "", menuUrl: "", konumUrl: "", instagramUrl: ""
      });
      setMekanEditId(null);
      setDdNotice("Mekan kaydedildi.");
    } catch (err) {
      console.error("Date Doctor mekan kayd? ba?ar?s?z:", err);
      setDdNotice(`Mekan kaydedilemedi: ${err?.message || "bilinmeyen hata"}`);
    }
  };
  const delMekan = async (id) => { if (confirm("Mekan silinsin mi?")) await deleteDoc(doc(db, "date_doctor_venues", id)); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Date Doctor Yönetimi</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setAktifTab("KATEGORI")} style={{ ...actionBtn, background: aktifTab === "KATEGORI" ? PURPLE_DIM : "none", color: aktifTab === "KATEGORI" ? PURPLE : TEXT_MUT }}>Kategoriler</button>
          <button onClick={() => setAktifTab("MEKAN")} style={{ ...actionBtn, background: aktifTab === "MEKAN" ? PURPLE_DIM : "none", color: aktifTab === "MEKAN" ? PURPLE : TEXT_MUT }}>Mekanlar</button>
        </div>
      </div>
      {ddNotice && (
        <div style={{ padding: "10px 12px", marginBottom: 16, borderRadius: 4, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.22)", color: GOLD, fontSize: 11, lineHeight: 1.45 }}>
          {ddNotice}
        </div>
      )}

      {aktifTab === "KATEGORI" && (
        <div>
          <div style={{ background: SURFACE_3, padding: 16, borderRadius: 4, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Kategori Adı" value={katForm.ad} onChange={e => setKatForm({ ...katForm, ad: e.target.value })} />
              <input style={inputStyle} placeholder="Hizmet Bedeli" value={katForm.fiyat} onChange={e => setKatForm({ ...katForm, fiyat: e.target.value })} />
            </div>
            <input style={{ ...inputStyle, width: "100%", marginBottom: 10 }} placeholder="Açıklama" value={katForm.aciklama} onChange={e => setKatForm({ ...katForm, aciklama: e.target.value })} />
            <button type="button" onClick={saveKat} style={{ ...actionBtn, width: "100%", background: PURPLE_DIM, color: PURPLE, padding: 12 }}>{katEditId ? "G?ncelle" : "Ekle"}</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {kategoriler.map(k => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE_3, padding: "10px 14px", borderRadius: 3, border: "1px solid " + GOLD_BORDER }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TEXT_PRI }}>{k.ad}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUT }}>{k.fiyat} · {k.aciklama}</div>
                </div>
                <button onClick={() => { setKatForm(k); setKatEditId(k.id); }} style={actionBtn}>✎</button>
                <button onClick={() => delKat(k.id)} style={{ ...actionBtn, color: DANGER }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aktifTab === "MEKAN" && (
        <div>
          <div style={{ background: SURFACE_3, padding: 16, borderRadius: 4, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Mekan Adı" value={mekanForm.ad} onChange={e => setMekanForm({ ...mekanForm, ad: e.target.value })} />
              <input style={inputStyle} placeholder="Adres / Konum Özeti" value={mekanForm.adres} onChange={e => setMekanForm({ ...mekanForm, adres: e.target.value })} />
            </div>
            <input style={{ ...inputStyle, width: "100%", marginBottom: 10 }} placeholder="Fotoğraf URL" value={mekanForm.fotoUrl} onChange={e => setMekanForm({ ...mekanForm, fotoUrl: e.target.value })} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Etiketler" value={mekanForm.etiketler} onChange={e => setMekanForm({ ...mekanForm, etiketler: e.target.value })} />
              <input style={inputStyle} placeholder="Menü URL" value={mekanForm.menuUrl} onChange={e => setMekanForm({ ...mekanForm, menuUrl: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Konum/Maps URL" value={mekanForm.konumUrl} onChange={e => setMekanForm({ ...mekanForm, konumUrl: e.target.value })} />
              <input style={inputStyle} placeholder="Instagram URL" value={mekanForm.instagramUrl} onChange={e => setMekanForm({ ...mekanForm, instagramUrl: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 10 }}>
              <select style={inputStyle} value={mekanForm.butce} onChange={e => setMekanForm({ ...mekanForm, butce: e.target.value })}>
                <option value="Ekonomik">Ekonomik</option><option value="Standart">Standart</option><option value="Premium">Premium</option><option value="Ultra Lüks">Ultra Lüks</option>
              </select>
              <select style={inputStyle} value={mekanForm.atmosfer} onChange={e => setMekanForm({ ...mekanForm, atmosfer: e.target.value })}>
                <option value="Romantik">Romantik</option><option value="Eğlenceli">Eğlenceli</option><option value="Sakin">Sakin</option><option value="Gösterişli">Gösterişli</option>
              </select>
              <select style={inputStyle} value={mekanForm.tercih} onChange={e => setMekanForm({ ...mekanForm, tercih: e.target.value })}>
                <option value="Alkollü">Alkollü</option><option value="Alkolsüz">Alkolsüz</option>
              </select>
            </div>
            <button type="button" onClick={saveMekan} style={{ ...actionBtn, width: "100%", background: PURPLE_DIM, color: PURPLE, padding: 12 }}>{mekanEditId ? "G?ncelle" : "Ekle"}</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mekanlar.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE_3, padding: "10px 14px", borderRadius: 3, border: "1px solid " + GOLD_BORDER }}>
                {m.fotoUrl && <img src={m.fotoUrl} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TEXT_PRI }}>{m.ad}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUT }}>{m.butce} · {m.atmosfer} · {m.tercih} · {m.adres}</div>
                </div>
                <button onClick={() => { setMekanForm(m); setMekanEditId(m.id); }} style={actionBtn}>✎</button>
                <button onClick={() => delMekan(m.id)} style={{ ...actionBtn, color: DANGER }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

  );
}

function BeniSasirtSekme() {
  const [scenarios, setScenarios] = useState([]);
  const [form, setForm] = useState({ ad: "", mood: "Romantik", step1: "", step2: "", step3: "", desc: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "surprise_scenarios"), (snap) => {
      setScenarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const save = async () => {
    if (!form.ad) return;
    if (editId) {
      await updateDoc(doc(db, "surprise_scenarios", editId), form);
    } else {
      await addDoc(collection(db, "surprise_scenarios"), form);
    }
    setForm({ ad: "", mood: "Romantik", step1: "", step2: "", step3: "", desc: "" });
    setEditId(null);
  };

  const del = async (id) => { if (confirm("Senaryo silinsin mi?")) await deleteDoc(doc(db, "surprise_scenarios", id)); };

  return (
    <div>
      <SectionTitle>Beni Şaşırt Yönetimi</SectionTitle>
      <div style={{ background: SURFACE_3, padding: 16, borderRadius: 4, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Senaryo Adı" value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })} />
          <select style={inputStyle} value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}>
            <option value="Romantik">Romantik</option>
            <option value="Enerjik">Enerjik</option>
            <option value="Sakin">Sakin</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="1. Durak (Yemek)" value={form.step1} onChange={e => setForm({ ...form, step1: e.target.value })} />
          <input style={inputStyle} placeholder="2. Durak (Etkinlik/Lokomotif)" value={form.step2} onChange={e => setForm({ ...form, step2: e.target.value })} />
          <input style={inputStyle} placeholder="3. Durak (Keyif/Final)" value={form.step3} onChange={e => setForm({ ...form, step3: e.target.value })} />
          <textarea style={{ ...inputStyle, height: 60 }} placeholder="Senaryo Açıklaması (Felsefesi)" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
        </div>
        <button onClick={save} style={{ ...actionBtn, width: "100%", background: PURPLE_DIM, color: PURPLE, padding: 12 }}>{editId ? "G?ncelle" : "Ekle"}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {scenarios.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE_3, padding: "10px 14px", borderRadius: 3, border: "1px solid " + GOLD_BORDER }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: TEXT_PRI }}>{s.ad}</div>
              <div style={{ fontSize: 9, color: PURPLE }}>{s.mood} · {s.step1.substring(0, 20)}...</div>
            </div>
            <button onClick={() => { setForm(s); setEditId(s.id); }} style={actionBtn}>✎</button>
            <button onClick={() => del(s.id)} style={{ ...actionBtn, color: DANGER }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEKME: QR LOGLARI ───────────────────────────────────────────────────────

function QrLogSekme() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "qr_logs"), orderBy("tarih", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <SectionTitle>QR Kod İşlem Akışı</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {logs.length === 0 ? (
          <p style={{ color: TEXT_MUT, fontSize: 12 }}>Henüz bir işlem kaydı bulunmuyor.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{
              padding: "12px 16px", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`,
              borderLeft: `3px solid ${log.islem_tur === "EKLE" ? SUCCESS : DANGER}`,
              borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 13, color: TEXT_PRI, fontWeight: 600 }}>
                  {log.kullanici_adi} <span style={{ color: TEXT_MUT, fontWeight: 400, fontSize: 11 }}>({log.kullanici_id})</span>
                </div>
                <div style={{ fontSize: 11, color: TEXT_MUT, marginTop: 4 }}>
                  İşletme: <span style={{ color: GOLD }}>{log.isletme_uid}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, color: log.islem_tur === "EKLE" ? SUCCESS : DANGER, fontWeight: 700 }}>
                  {log.islem_tur === "EKLE" ? "+" : "-"}{log.islem_puan} Puan
                </div>
                <div style={{ fontSize: 10, color: TEXT_MUT, marginTop: 4 }}>
                  {new Date(log.tarih).toLocaleString("tr-TR")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── SEKME: SİPARİŞLER (ÖDEMELER) ───────────────────────────────────────────
function SiparislerSekme() {
  const [payments, setPayments] = useState([]);
  const [yukleniyor, setYuk] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    setYuk(id);
    await updateDoc(doc(db, "payments", id), { status });
    setYuk(null);
  };

  return (
    <div>
      <SectionTitle>Sistem Sipariş Akışı (PayTR)</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Tarih", "Kullanıcı", "Miktar", "Puan", "ID / OID", "Durum", "İşlem"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 9, color: PURPLE, borderBottom: `1px solid ${PURPLE_BRD}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
                <td style={tdStyle}>{p.timestamp?.toDate().toLocaleString('tr-TR')}</td>
                <td style={tdStyle}>
                  <div style={{ fontSize: 13 }}>{p.userName}</div>
                  <div style={{ fontSize: 9, color: TEXT_MUT }}>{p.userEmail}</div>
                </td>
                <td style={{ ...tdStyle, color: GOLD, fontWeight: "bold" }}>₺{p.amount}</td>
                <td style={{ ...tdStyle, color: SUCCESS }}>{p.puan} PN</td>
                <td style={{ ...tdStyle, fontSize: 10, fontFamily: "monospace" }}>{p.merchant_oid}</td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 10,
                    background: p.status === 'SUCCESS' ? SUCCESS + '22' : p.status === 'FAILED' ? DANGER + '22' : WARNING + '22',
                    color: p.status === 'SUCCESS' ? SUCCESS : p.status === 'FAILED' ? DANGER : WARNING
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.status === "PENDING" && (
                      <button onClick={() => updateStatus(p.id, "SUCCESS")} style={{ ...actionBtn, color: SUCCESS }}>✓ Onayla</button>
                    )}
                    <button onClick={() => { if (confirm("Kay1t silinsin mi?")) deleteDoc(doc(db, "payments", p.id)) }} style={{ ...actionBtn, color: DANGER }}> Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────

export default function MasterPanel({ session, onCikis, onKapat }) {
  const [aktifSekme, setAktif] = useState("genel");
  const [stats, setStats] = useState({ users: 0, plays: 0, kurumsal: 0, bireysel: 0, venues: 0 });

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "users"), s => setStats(p => ({ ...p, users: s.size })));
    const unsub2 = onSnapshot(collection(db, "theatre_plays"), s => setStats(p => ({ ...p, plays: s.size })));
    const unsub3 = onSnapshot(collection(db, "kurumsal_ilanlar"), s => setStats(p => ({ ...p, kurumsal: s.size })));
    const unsub4 = onSnapshot(collection(db, "bireysel_ilanlar"), s => setStats(p => ({ ...p, bireysel: s.size })));
    const unsub5 = onSnapshot(collection(db, "payments"), s => setStats(p => ({ ...p, payments: s.size })));
    const unsub6 = onSnapshot(collection(db, "venues"), s => setStats(p => ({ ...p, venues: s.size })));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); };
  }, []);

  const DYNAMIC_STATS = [
    { etiket: "Toplam Üye", deger: stats.users, ikon: "◈", renk: PURPLE, alt: "Canlı Veri" },
    { etiket: "Siparişler", deger: stats.payments || 0, ikon: "📦", renk: SUCCESS, alt: "PayTR İşlemleri" },
    { etiket: "Mekanlar (Vitrin)", deger: stats.venues, ikon: "⚙", renk: GOLD, alt: "Aktif Mekanlar" },
    { etiket: "Tüm İlanlar", deger: stats.kurumsal + stats.bireysel, ikon: "🏢", renk: PURPLE, alt: `Kurumsal: ${stats.kurumsal} / Bireysel: ${stats.bireysel}` },
  ];

  const SEKMELER = [
    { id: "genel", etiket: "Genel", ikon: "⬡" },
    { id: "uyeler", etiket: "Üyeler", ikon: "◈" },
    { id: "siparis", etiket: "Siparişler", ikon: "📦" }, // NEW
    { id: "nabiz", etiket: "Şehir Nabzı", ikon: "✨" },
    { id: "bireysel", etiket: "Bireysel İlan", ikon: "🏠" },
    { id: "oyunlar", etiket: "DT Kontrol", ikon: "🎭" },
    { id: "qrlogs", etiket: "QR Akış", ikon: "◈" },
    { id: "isletmeler", etiket: "İşletmeler", ikon: "🏢" },
    { id: "datedoctor", etiket: "Date Doctor", ikon: "🩺" },
    { id: "benisasirt", etiket: "Beni Şaşırt", ikon: "✨" },
    { id: "bildirimler", etiket: "Loglar", ikon: "🔔" },
    { id: "mekanlar", etiket: "Mekanlar", ikon: "⚙" },
    { id: "settings", etiket: "Ayarlar", ikon: "⚙" },
  ];


  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {onKapat && (
            <button onClick={onKapat} style={{ background: "none", border: "1px solid " + PURPLE_BRD, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE, cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.22em", color: PURPLE, opacity: 0.7 }}>MASTER ADMIN · MERKEZ</p>
            <h1 style={{ fontFamily: "serif", fontSize: 20, color: TEXT_PRI }}>{session?.ad || "Kurucu"}</h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + PURPLE_BRD, fontSize: 9, color: PURPLE }}>● CANLI</div>
          <button onClick={onCikis} style={{ ...actionBtn, color: TEXT_MUT }}>Oturumu Kapat</button>
        </div>
      </div>

      <div style={{
        ...styles.tabBar,
        display: "flex",
        flexWrap: "nowrap",
        gap: 6,
        padding: "8px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderBottom: "1px solid " + PURPLE_BRD,
        WebkitOverflowScrolling: "touch"
      }}>
        {SEKMELER.map(s => (
          <button key={s.id} onClick={() => setAktif(s.id)} style={{
            ...styles.tabBtn,
            padding: "8px 12px",
            fontSize: 10,
            whiteSpace: "nowrap",
            color: aktifSekme === s.id ? PURPLE : TEXT_MUT,
            background: aktifSekme === s.id ? PURPLE_DIM : SURFACE_2,
            border: `1px solid ${aktifSekme === s.id ? PURPLE_BRD : "transparent"}`,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
            minWidth: "70px"
          }}>
            <span style={{ fontSize: 14 }}>{s.ikon}</span>
            {s.etiket}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        <AnimatePresence>
          <motion.div key={aktifSekme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            {aktifSekme === "genel" && <GenelBakis stats={DYNAMIC_STATS} />}
            {aktifSekme === "uyeler" && <UyelerSekme />}
            {aktifSekme === "siparis" && <SiparislerSekme />}
            {aktifSekme === "nabiz" && <SehirNabziSekme />}
            {aktifSekme === "bireysel" && <BireyselIlanlarSekme />}
            {aktifSekme === "oyunlar" && <OyunlarSekme />}
            {aktifSekme === "qrlogs" && <QrLogSekme />}
            {aktifSekme === "isletmeler" && <IsletmelerSekme />}
            {aktifSekme === "datedoctor" && <DateDoctorSekme />}
            {aktifSekme === "benisasirt" && <BeniSasirtSekme />}
            {aktifSekme === "bildirimler" && <BildirimlerSekme />}
            {aktifSekme === "mekanlar" && <MekanlarSekme />}
            {aktifSekme === "settings" && <ProfileSettings userRole="MASTER" />}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles = {
  root: { background: SURFACE_1, minHeight: "100vh", color: TEXT_PRI, width: "100%", margin: "0", padding: "0" },
  header: { background: SURFACE_2, padding: "clamp(12px, 3vw, 20px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + PURPLE_BRD, flexWrap: "wrap", gap: 10 },
  tabBar: { display: "flex", background: SURFACE_2, padding: "0 10px", borderBottom: "1px solid " + PURPLE_BRD, overflowX: "auto", scrollbarWidth: "none", "-ms-overflow-style": "none" },
  tabBtn: { background: "none", border: "none", borderBottom: "2px solid", padding: "12px 15px", fontSize: 12, cursor: "pointer", transition: "0.2s" },
  content: { padding: "clamp(12px, 4vw, 24px)" }
};

const tdStyle = { padding: "10px 12px", fontSize: 12, color: TEXT_PRI };
const actionBtn = { background: "none", border: "1px solid " + GOLD_BORDER, borderRadius: 3, padding: "4px 10px", color: TEXT_MUT, cursor: "pointer", fontSize: 10 };
const inputStyle = { background: SURFACE_2, border: "1px solid " + GOLD_BORDER, borderRadius: 3, padding: 10, color: TEXT_PRI, fontSize: 12 };
