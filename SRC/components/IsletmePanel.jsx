import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../services/firebase";
import { collection, addDoc, query, where, onSnapshot, getDocs, doc, updateDoc } from "firebase/firestore";
import ProfileSettings from "./ProfileSettings";
import { uploadFileToStorage, uploadFilesToStorage } from "../services/storageUpload";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const SUCCESS = "#4caf7d";
const WARNING = "#e0a030";
const DANGER = "#c05050";

export default function IsletmePanel({ onCikis, onKapat }) {
    const [tab, setTab] = useState("DASHBOARD"); // DASHBOARD | LOYALTY | YENI_ILAN | QR_TARA | SETTINGS
    const [mekanlar, setMekanlar] = useState([]);
    const emptyForm = { ad: "", adres: "", kategori: "YEME_ICME", telefon: "", aciklama: "", fotoUrl: "", videoUrl: "", fotolar: "" };
    const parseFotoList = (value) => String(value || "").split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
    const [form, setForm] = useState(emptyForm);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [bildirim, setBildirim] = useState("");
    const coverInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [selectedCover, setSelectedCover] = useState(null);
    const [selectedGallery, setSelectedGallery] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const [qrCode, setQrCode] = useState("");
    const [islemPuan, setIslemPuan] = useState("");
    const [islemTur, setIslemTur] = useState("EKLE");

    useEffect(() => {
        const u = auth.currentUser;
        if (!u) return;
        const q = query(collection(db, "venues"), where("owner_uid", "==", u.uid));
        const unsub = onSnapshot(q, (snap) => {
            setMekanlar(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        });
        return () => unsub();
    }, []);

    const handleMekanEkle = async (e) => {
        e.preventDefault();
        setYukleniyor(true);
        try {
            const u = auth.currentUser;
            if (!u) {
                setBildirim("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
                return;
            }
            const fotolar = parseFotoList(form.fotolar);
            const uploadedGallery = selectedGallery.length ? await uploadFilesToStorage(selectedGallery, `venues/${u?.uid || "guest"}/gallery`) : [];
            const uploadedCover = selectedCover ? await uploadFileToStorage(selectedCover, `venues/${u?.uid || "guest"}/cover`) : "";
            const uploadedVideo = selectedVideo ? await uploadFileToStorage(selectedVideo, `venues/${u?.uid || "guest"}/video`) : "";
            const mergedPhotos = [
                ...fotolar,
                ...uploadedGallery,
            ].filter(Boolean);
            const videoUrl = uploadedVideo || form.videoUrl || "";
            await addDoc(collection(db, "venues"), {
                ...form,
                aciklama: form.aciklama || "",
                videoUrl,
                fotolar: mergedPhotos,
                fotoUrl: uploadedCover || form.fotoUrl || mergedPhotos[0] || "",
                owner_uid: u.uid,
                aktif: true,
                onay_durumu: "BEKLIYOR",
                olusturma_tarihi: new Date().toISOString()
            });
            setForm(emptyForm);
            setSelectedCover(null);
            setSelectedGallery([]);
            setSelectedVideo(null);
            if (coverInputRef.current) coverInputRef.current.value = "";
            if (galleryInputRef.current) galleryInputRef.current.value = "";
            if (videoInputRef.current) videoInputRef.current.value = "";
            setTab("DASHBOARD");
            setBildirim("Mekan eklendi.");
            setTimeout(() => setBildirim(""), 3000);
        } catch (err) {
            console.error(err);
            setBildirim("Medya yüklenirken veya kayıt sırasında hata oluştu.");
        } finally {
            setYukleniyor(false);
        }
    };

    const handleQrİslem = async (e) => {
        e.preventDefault();
        if (!qrCode || !islemPuan) return;
        setYukleniyor(true);
        try {
            // UID olarak kullanıldığını varsayıyoruz (basitlik için)
            const uId = qrCode.replace("NAR-QR-", "");
            const q = query(collection(db, "users"), where("kullanici_adi", "==", uId));
            const snap = await getDocs(q);

            let userDocRef;
            let existingPuan = 0;

            if (!snap.empty) {
                userDocRef = doc(db, "users", snap.docs[0].id);
                existingPuan = snap.docs[0].data().puan || 0;
            } else {
                // UID fallback
                const udoc = await getDocs(query(collection(db, "users"), where("uid", "==", uId))); // UID in field might not exist, but let's try direct snap
                if (uId.length > 5) {
                    userDocRef = doc(db, "users", uId);
                }
            }

            if (userDocRef) {
                let targetPuan = islemTur === "EKLE" ? existingPuan + Number(islemPuan) : existingPuan - Number(islemPuan);
                if (targetPuan < 0) targetPuan = 0;

                await updateDoc(userDocRef, {
                    puan: targetPuan
                });

                // --- İŞLEM LOGU EKLE ---
                try {
                    await addDoc(collection(db, "qr_logs"), {
                        kullanici_id: userDocRef.id,
                        kullanici_adi: uId,
                        islem_puan: Number(islemPuan),
                        islem_tur: islemTur,
                        isletme_uid: auth.currentUser.uid,
                        tarih: new Date().toISOString()
                    });
                } catch (logErr) { console.error("Log error:", logErr); }
                // -----------------------

                setBildirim(`Bireysel kullan?c1ya ${islemPuan} puan ${islemTur === "EKLE" ? "eklendi" : "d???ld?"}.`);
                setQrCode("");
                setIslemPuan("");
            } else {
                setBildirim("Kullanıcı bulunamadı.");
            }
        } catch (err) {
            console.error(err);
            setBildirim("Hata oluştu.");
        } finally {
            setYukleniyor(false);
            setTimeout(() => setBildirim(""), 3000);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ minHeight: "100vh", background: SURFACE_1, padding: "24px 28px", width: "100%", margin: "0" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    {onKapat && (
                        <button onClick={onKapat} style={{ background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: "50%", width: 32, height: 32, color: GOLD, cursor: "pointer", fontSize: 16 }}>✕</button>
                    )}
                    <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#e07a5f", opacity: 0.8, marginBottom: 4 }}>NAR REHBERİ — İŞLETME</p>
                        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(18px, 5vw, 24px)", color: TEXT_PRI, fontWeight: 700 }}>İşletme Kontrol Merkezi</h1>
                    </div>
                </div>
                <button onClick={onCikis} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, color: TEXT_MUT, fontSize: 11, cursor: "pointer" }}>Oturumu Kapat</button>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: 8,
                marginBottom: 24,
                paddingBottom: 4
            }}>
                <button onClick={() => setTab("DASHBOARD")} style={{ padding: "10px 4px", background: tab === "DASHBOARD" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "DASHBOARD" ? GOLD : GOLD_BORDER}`, color: tab === "DASHBOARD" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Mekanlar</button>
                <button onClick={() => setTab("LOYALTY")} style={{ padding: "10px 4px", background: tab === "LOYALTY" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "LOYALTY" ? GOLD : GOLD_BORDER}`, color: tab === "LOYALTY" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Sadakat</button>
                <button onClick={() => setTab("YENI_ILAN")} style={{ padding: "10px 4px", background: tab === "YENI_ILAN" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "YENI_ILAN" ? GOLD : GOLD_BORDER}`, color: tab === "YENI_ILAN" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>?</span>Yeni Ekle</button>
                <button onClick={() => setTab("QR_TARA")} style={{ padding: "10px 4px", background: tab === "QR_TARA" ? `${SUCCESS}22` : SURFACE_2, border: `1px solid ${tab === "QR_TARA" ? SUCCESS : GOLD_BORDER}`, color: tab === "QR_TARA" ? SUCCESS : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>QR ??lem</button>
                <button onClick={() => setTab("SETTINGS")} style={{ padding: "10px 4px", background: tab === "SETTINGS" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "SETTINGS" ? GOLD : GOLD_BORDER}`, color: tab === "SETTINGS" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Ayarlar</button>
            </div>

            {bildirim && <div style={{ background: "rgba(76,175,125,0.1)", border: `1px solid ${SUCCESS}`, padding: 12, borderRadius: 4, color: SUCCESS, fontSize: 12, marginBottom: 20 }}>{bildirim}</div>}

            <AnimatePresence mode="wait">
                {tab === "DASHBOARD" && (
                    <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: 11, letterSpacing: "0.15em", color: GOLD, marginBottom: 16 }}>İşletmeleriniz</h2>
                        {mekanlar.length === 0 ? (
                            <p style={{ color: TEXT_MUT, fontSize: 12 }}>Henüz bir işletme eklemediniz.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {mekanlar.map(m => (
                                    <div key={m.id} style={{ padding: 16, background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ margin: "0 0 6px", fontSize: 14, color: TEXT_PRI }}>{m.ad}</h3>
                                            <p style={{ margin: 0, fontSize: 11, color: TEXT_MUT }}>{m.kategori} · {m.adres}</p>
                                            {m.aciklama && <p style={{ margin: "6px 0 0", fontSize: 11, color: TEXT_MUT, lineHeight: 1.5 }}>{String(m.aciklama).slice(0, 100)}{String(m.aciklama).length > 100 ? "..." : ""}</p>}
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                                {(m.fotoUrl || (Array.isArray(m.fotolar) && m.fotolar[0])) && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: "rgba(212,175,55,0.10)", color: GOLD }}>Kapak Görseli</span>}
                                                {m.videoUrl && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: "rgba(76,175,125,0.10)", color: SUCCESS }}>Video</span>}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 4, border: `1px solid ${GOLD_BORDER}`, color: m.onay_durumu === "BEKLIYOR" ? WARNING : SUCCESS, background: "rgba(255,255,255,0.05)" }}>
                                            {m.onay_durumu || "BEKLIYOR"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === "LOYALTY" && (
                    <motion.div key="loyalty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ background: `linear-gradient(135deg, ${GOLD}22, transparent)`, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, padding: 16, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 16, color: GOLD, margin: "0 0 8px" }}>Müşteri Sadakati ve Kampanyalar</h2>
                            <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>Mekanınıza en çok gelen sadık müşterileri (Yerel Kahramanlar) görün ve onlara özel anlık bildirim ('Flash Events') gönderin.</p>
                        </div>

                        <h3 style={{ fontSize: 13, color: TEXT_PRI, marginBottom: 16 }}>En Sadık Müşteriler (Lider Tablosu)</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                            {[
                                { ad: "Ahmet Y.", checkin: 12, seviye: "Altın Üye", last: "Dün" },
                                { ad: "Merve K.", checkin: 8, seviye: "Gümüş Üye", last: "3 gün önce" },
                                { ad: "Can B.", checkin: 5, seviye: "Bronz Üye", last: "1 hafta önce" }
                            ].map((m, i) => (
                                <div key={i} style={{ padding: 16, background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: SURFACE_3, color: i === 0 ? GOLD : TEXT_PRI, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>#{i + 1}</div>
                                        <div>
                                            <h4 style={{ margin: "0 0 4px", fontSize: 14, color: TEXT_PRI, display: "flex", alignItems: "center", gap: 8 }}>
                                                {m.ad}
                                                {i === 0 && <span style={{ fontSize: 9, background: `${GOLD}33`, color: GOLD, padding: "2px 6px", borderRadius: 4 }}>Mahalle Muhtarı 👑</span>}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: 11, color: TEXT_MUT }}>{m.seviye} • Son ziyaret: {m.last}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "0 0 4px", fontSize: 14, color: GOLD, fontWeight: "bold" }}>{m.checkin} Check-in</p>
                                        <button style={{ background: "transparent", border: `1px solid ${GOLD}`, color: GOLD, padding: "4px 8px", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>ÖZEL TEKLİF GÖNDER</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ fontSize: 13, color: TEXT_PRI, marginBottom: 16 }}>Flash Event (Anlık Etkinlik) Başlat</h3>
                        <div style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, padding: 20, borderRadius: 8 }}>
                            <p style={{ fontSize: 11, color: TEXT_MUT, marginBottom: 16 }}>Şu an mahallenizde uygulamayı kullanan üyelere "Anlık Fırsat" bildirimi göndererek trafiğinizi artırın.</p>
                            <input type="text" placeholder="Örn: Sadece son 2 saat, tüm kahvelerde %20 indirim!" style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                            <div style={{ display: "flex", gap: 10 }}>
                                <button style={{ flex: 1, padding: 12, background: GOLD, color: "#000", border: "none", borderRadius: 4, fontWeight: "bold", cursor: "pointer" }}>YAKINDAKİLERE BİLDİRİM GÖNDER (500 Puan Harcar)</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === "YENI_ILAN" && (
                    <motion.div key="yeni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ maxWidth: 800, margin: "0 auto", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                            <h2 style={{ fontSize: 14, color: TEXT_PRI, marginBottom: 20 }}>Vitrine Eklenecek Mekan Bilgileri</h2>
                            <form onSubmit={handleMekanEkle}>
                                <input type="text" placeholder="İşletme Adı" required value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }}>
                                    <option value="YEME_ICME">Yeme İçme</option>
                                    <option value="GEL_AL">Gel Al</option>
                                    <option value="EGLENCE">Eğlence</option>
                                    <option value="HIZMET">Hizmet</option>
                                </select>
                                <input type="text" placeholder="Adres" required value={form.adres} onChange={e => setForm(p => ({ ...p, adres: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <input type="tel" placeholder="Telefon" required value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <input type="text" placeholder="Kapak Görseli URL" value={form.fotoUrl} onChange={e => setForm(p => ({ ...p, fotoUrl: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <input type="text" placeholder="Video URL" value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <textarea rows={3} placeholder="Açıklama / Hakkımızda" value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <textarea rows={4} placeholder="Ek Görseller (her satıra bir URL)" value={form.fotolar} onChange={e => setForm(p => ({ ...p, fotolar: e.target.value }))} style={{ width: "100%", padding: 12, marginBottom: 20, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                                    <input ref={coverInputRef} type="file" accept="image/*" onChange={e => setSelectedCover(e.target.files?.[0] || null)} style={{ width: "100%", padding: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                    <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={e => setSelectedGallery(Array.from(e.target.files || []))} style={{ width: "100%", padding: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                    <input ref={videoInputRef} type="file" accept="video/*" onChange={e => setSelectedVideo(e.target.files?.[0] || null)} style={{ width: "100%", padding: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />
                                    <div style={{ fontSize: 10, color: TEXT_MUT, lineHeight: 1.5 }}>
                                        Dosya yüklemezseniz üstteki URL alanları kullanılacak. Yüklerseniz Storage bağlantıları otomatik kaydedilir.
                                    </div>
                                    {(selectedCover || selectedGallery.length > 0 || selectedVideo) && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {selectedCover && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 10, background: "rgba(212,175,55,0.12)", color: GOLD }}>Kapak seçildi</span>}
                                            {selectedGallery.length > 0 && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 10, background: "rgba(76,175,125,0.12)", color: SUCCESS }}>{selectedGallery.length} görsel seçildi</span>}
                                            {selectedVideo && <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 10, background: "rgba(76,175,125,0.12)", color: SUCCESS }}>Video seçildi</span>}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={yukleniyor} style={{ width: "100%", padding: 14, background: GOLD, color: "#000", border: "none", borderRadius: 4, fontWeight: "bold", cursor: yukleniyor ? "wait" : "pointer" }}>
                                    {yukleniyor ? "G?nderiliyor..." : "Y?NET?C? ONAYINA G?NDER"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {tab === "QR_TARA" && (
                    <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ maxWidth: 800, margin: "0 auto", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                            <h2 style={{ fontSize: 14, color: TEXT_PRI, marginBottom: 10 }}>Kullanıcı QR İşlemi & Check-in</h2>
                            <p style={{ fontSize: 11, color: TEXT_MUT, marginBottom: 20 }}>Müşterinin görevleri tamamlaması veya check-in yapması için QR kodunu okutarak işlem yapın. Bu işlem onun sadakat sistemindeki ilerlemesini de etkiler.</p>

                            <form onSubmit={handleQrİslem}>
                                <input type="text" placeholder="Kullanıcı Kodu (Örn: ali123 veya UID)" required value={qrCode} onChange={e => setQrCode(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 12, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />

                                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                    <button type="button" onClick={() => setIslemTur("EKLE")} style={{ flex: 1, padding: 12, background: islemTur === "EKLE" ? `${SUCCESS}22` : SURFACE_3, border: `1px solid ${islemTur === "EKLE" ? SUCCESS : GOLD_BORDER}`, color: islemTur === "EKLE" ? SUCCESS : TEXT_MUT, borderRadius: 4 }}>+ Puan Ekle</button>
                                    <button type="button" onClick={() => setIslemTur("DUS")} style={{ flex: 1, padding: 12, background: islemTur === "DUS" ? `${DANGER}22` : SURFACE_3, border: `1px solid ${islemTur === "DUS" ? DANGER : GOLD_BORDER}`, color: islemTur === "DUS" ? DANGER : TEXT_MUT, borderRadius: 4 }}>- Puan Harcat</button>
                                </div>

                                <input type="number" placeholder="İşlem Yapılacak Puan Miktarı" required value={islemPuan} onChange={e => setIslemPuan(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 20, background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, color: TEXT_PRI, borderRadius: 4 }} />

                                <button type="submit" disabled={yukleniyor} style={{ width: "100%", padding: 14, background: islemTur === "EKLE" ? SUCCESS : DANGER, color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold", cursor: yukleniyor ? "wait" : "pointer" }}>
                                    {yukleniyor ? "0_leniyor..." : "0^LEM0 TAMAMLA"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {tab === "SETTINGS" && (
                    <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ProfileSettings userRole="ISLETME" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
