import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../services/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import ProfileSettings from "./ProfileSettings";
import PayTRPayment from "./PayTRPayment";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_1 = "#0d0d12";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const SUCCESS = "#7090e0";

export default function UserPanel({ session, onCikis, onKapat }) {
    const [tab, setTab] = useState("PROFILE"); // PROFILE | QUESTS | DATE | SURPRISE | ACH | STORE | ORDERS | SETTINGS
    const [userData, setUserData] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [bildirim, setBildirim] = useState("");
    const [reservations, setReservations] = useState([]);
    const [surprises, setSurprises] = useState([]);
    const [payments, setPayments] = useState([]);
    const [payTRDetails, setPayTRDetails] = useState(null);

    useEffect(() => {
        const u = auth.currentUser;
        if (!u) return;
        const unsub = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserData({ id: docSnap.id, ...docSnap.data() });
            }
        });

        const qRes = query(collection(db, "date_doctor_reservations"), where("userId", "==", u.uid), orderBy("timestamp", "desc"));
        const unsubRes = onSnapshot(qRes, (snap) => setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qSurp = query(collection(db, "surprise_logs"), where("userId", "==", u.uid), orderBy("timestamp", "desc"));
        const unsubSurp = onSnapshot(qSurp, (snap) => setSurprises(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qPay = query(collection(db, "payments"), where("userId", "==", u.uid), orderBy("timestamp", "desc"));
        const unsubPay = onSnapshot(qPay, (snap) => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        return () => { unsub(); unsubRes(); unsubSurp(); unsubPay(); };
    }, []);

    const handlePuanSatinAl = async (puanMiktari, fiyat) => {
        if (!userData) return;
        setYukleniyor(true);

        const merchantOid = "NAR" + Date.now() + Math.floor(Math.random() * 1000);

        try {
            // Firestore'da PENDING kaydı oluştur
            await addDoc(collection(db, "payments"), {
                userId: userData.id,
                userEmail: userData.email,
                userName: userData.ad_soyad || userData.firma_adi || "İsimsiz",
                amount: fiyat,
                puan: puanMiktari,
                merchant_oid: merchantOid,
                status: "PENDING",
                timestamp: serverTimestamp()
            });

            // LocalStorage'a kaydet (dönüşte kontrol için)
            localStorage.setItem("last_merchant_oid", merchantOid);

            // PayTR modalını aç
            setPayTRDetails({
                amount: fiyat,
                user: {
                    email: userData.email,
                    name: userData.ad_soyad || userData.firma_adi || "İsimsiz",
                    phone: userData.telefon || "05000000000",
                    address: userData.adres || "Antalya, Türkiye"
                },
                merchant_oid: merchantOid,
                basket: [["Nar Puan Yükleme (" + puanMiktari + ")", fiyat.toString(), 1]]
            });

        } catch (err) {
            console.error("Payment initiation error:", err);
            setBildirim("Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        } finally {
            setYukleniyor(false);
        }
    };

    if (!userData) return <div style={{ minHeight: "100vh", background: SURFACE_1, padding: 40, color: TEXT_PRI, textAlign: "center" }}>Yükleniyor...</div>;

    const TIER_THRESHOLDS = [
        { name: "Yeni Üye", min: 0, max: 500, color: "#a0a0a0" },
        { name: "Bronz Üye", min: 500, max: 1500, color: "#cd7f32" },
        { name: "Gümüş Üye", min: 1500, max: 5000, color: "#c0c0c0" },
        { name: "Altın Üye", min: 5000, max: 10000, color: GOLD },
        { name: "Platin Üye", min: 10000, max: 10000, color: "#e5e4e2" },
    ];

    const currentPuan = userData.puan || 0;
    const activeTierIndex = Object.values(TIER_THRESHOLDS).findLastIndex(t => currentPuan >= t.min) || 0;
    const activeTier = TIER_THRESHOLDS[activeTierIndex];
    const nextTier = TIER_THRESHOLDS[activeTierIndex + 1] || activeTier;

    let progress = 100;
    if (nextTier.name !== activeTier.name) {
        progress = ((currentPuan - activeTier.min) / (nextTier.min - activeTier.min)) * 100;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ minHeight: "100vh", background: SURFACE_1, padding: "clamp(12px, 3vw, 24px) clamp(14px, 4vw, 28px)", width: "100%", margin: "0", overflowX: "hidden" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    {onKapat && (
                        <button onClick={onKapat} style={{ background: "none", border: `1px solid ${GOLD_BORDER}`, borderRadius: "50%", width: 32, height: 32, color: SUCCESS, cursor: "pointer", fontSize: 16 }}>✕</button>
                    )}
                    <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: SUCCESS, opacity: 0.8, marginBottom: 4 }}>NAR REHBERİ — BİREYSEL</p>
                        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, color: TEXT_PRI, fontWeight: 700 }}>Kulüp Profilin</h1>
                    </div>
                </div>
                <button onClick={onCikis} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${SUCCESS}44`, borderRadius: 4, color: TEXT_MUT, fontSize: 11, cursor: "pointer" }}>Oturumu Kapat</button>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: 8,
                marginBottom: 24,
                paddingBottom: 4
            }}>
                <button onClick={() => setTab("PROFILE")} style={{ padding: "10px 4px", background: tab === "PROFILE" ? `${SUCCESS}22` : SURFACE_2, border: `1px solid ${tab === "PROFILE" ? SUCCESS : GOLD_BORDER}`, color: tab === "PROFILE" ? SUCCESS : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Puan ve QR</button>
                <button onClick={() => setTab("QUESTS")} style={{ padding: "10px 4px", background: tab === "QUESTS" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "QUESTS" ? GOLD : GOLD_BORDER}`, color: tab === "QUESTS" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>G?revler</button>
                <button onClick={() => setTab("DATE")} style={{ padding: "10px 4px", background: tab === "DATE" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "DATE" ? GOLD : GOLD_BORDER}`, color: tab === "DATE" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Date Doctor</button>
                <button onClick={() => setTab("SURPRISE")} style={{ padding: "10px 4px", background: tab === "SURPRISE" ? "#e74c3c22" : SURFACE_2, border: `1px solid ${tab === "SURPRISE" ? "#e74c3c" : GOLD_BORDER}`, color: tab === "SURPRISE" ? "#e74c3c" : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>S?rprizler</button>
                <button onClick={() => setTab("ACH")} style={{ padding: "10px 4px", background: tab === "ACH" ? `${SUCCESS}22` : SURFACE_2, border: `1px solid ${tab === "ACH" ? SUCCESS : GOLD_BORDER}`, color: tab === "ACH" ? SUCCESS : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Rozetler</button>
                <button onClick={() => setTab("STORE")} style={{ padding: "10px 4px", background: tab === "STORE" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "STORE" ? GOLD : GOLD_BORDER}`, color: tab === "STORE" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>???</span>Ma?aza</button>
                <button onClick={() => setTab("ORDERS")} style={{ padding: "10px 4px", background: tab === "ORDERS" ? `${SUCCESS}22` : SURFACE_2, border: `1px solid ${tab === "ORDERS" ? SUCCESS : GOLD_BORDER}`, color: tab === "ORDERS" ? SUCCESS : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Sipari?ler</button>
                <button onClick={() => setTab("SETTINGS")} style={{ padding: "10px 4px", background: tab === "SETTINGS" ? `${GOLD}22` : SURFACE_2, border: `1px solid ${tab === "SETTINGS" ? GOLD : GOLD_BORDER}`, color: tab === "SETTINGS" ? GOLD : TEXT_MUT, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span>??</span>Ayarlar</button>
            </div>

            {bildirim && <div style={{ background: "rgba(112,144,224,0.1)", border: `1px solid ${SUCCESS}`, padding: 12, borderRadius: 4, color: SUCCESS, fontSize: 12, marginBottom: 20 }}>{bildirim}</div>}

            <AnimatePresence>
                {tab === "PROFILE" && (
                    <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>

                        <div style={{ flex: "1 1 300px", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${activeTier.color}33`, border: `2px solid ${activeTier.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                                <div>
                                    <h3 style={{ margin: 0, color: TEXT_PRI, fontSize: 18 }}>{userData.ad_soyad}</h3>
                                    <p style={{ margin: "4px 0 0", color: activeTier.color, fontSize: 12, fontWeight: 700 }}>{activeTier.name}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: TEXT_MUT }}>Toplam Puan ({activeTier.name})</span>
                                    <span style={{ fontSize: 14, color: GOLD, fontWeight: "bold" }}>{currentPuan} PN</span>
                                </div>
                                <div style={{ width: "100%", height: 6, background: SURFACE_3, borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${activeTier.color}, ${nextTier.color})` }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                    <span style={{ fontSize: 10, color: TEXT_MUT }}>Daha Fazla Kazan, Statünü Yükselt!</span>
                                    <span style={{ fontSize: 10, color: TEXT_MUT }}>{nextTier.name !== activeTier.name ? `Hedef: ${nextTier.max} (${nextTier.name})` : 'Maksimum Seviye'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: "1 1 300px", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}`, textAlign: "center" }}>
                            <h2 style={{ fontSize: 14, color: TEXT_PRI, marginBottom: 12 }}>İşletme QR Kodun</h2>
                            <p style={{ fontSize: 11, color: TEXT_MUT, marginBottom: 20 }}>Anlaşmalı Nar Rehberi noktalarında bu kodu okutarak puan kazanın ve harcayın.</p>

                            <div style={{ margin: "0 auto", width: 180, height: 180, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                                <div style={{ border: "24px dashed #000", width: "80%", height: "80%" }}>
                                    {/* Mock QR: Ideally we use a QR library here, for now it's just visually simulated block */}
                                    <div style={{ background: "#000", width: 40, height: 40, margin: "auto", position: "relative", top: 25 }} />
                                </div>
                            </div>
                            <p style={{ marginTop: 16, fontSize: 14, fontFamily: "monospace", color: GOLD, letterSpacing: 2 }}>{userData.kullanici_adi || userData.id.substring(0, 6)}</p>

                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${GOLD_BORDER}` }}>
                                <p style={{ fontSize: 11, color: TEXT_PRI, marginBottom: 8 }}>Arkadaşlarını Davet Et, 50 Puan Kazan!</p>
                                <div style={{ display: "flex", gap: 8, background: SURFACE_3, padding: 8, borderRadius: 4, alignItems: "center" }}>
                                    <span style={{ fontSize: 10, color: TEXT_MUT, flex: 1, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        narrehberi.com/?ref={userData.kullanici_adi || userData.id.substring(0, 6)}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://narrehberi.com/?ref=${userData.kullanici_adi || userData.id.substring(0, 6)}`);
                                            setBildirim("Davet linki kopyalandı!");
                                        }}
                                        style={{ padding: "4px 8px", background: SUCCESS, color: "#fff", fontSize: 9, border: "none", borderRadius: 4, cursor: "pointer" }}
                                    >
                                        KOPYALA
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}

                {tab === "QUESTS" && (
                    <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ background: `linear-gradient(135deg, ${GOLD}22, transparent)`, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, padding: 16, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 16, color: GOLD, margin: "0 0 8px" }}>Günlük ve Haftalık Görevler</h2>
                            <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>Şehrin sokaklarını keşfet, belirlenen görevleri tamamlayıp Nar Puan topla ve statünü yükselt!</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {[
                                { ad: "Haftalık Keşif: Gurme Serisi", icon: "🍔", aciklama: "Bu hafta 3 farklı Hamburgerciyi ziyaret et, QR kod okut. 'Burger Ustası' rozeti ve %20 ekstra puan kazan!", p: "0/3", pVal: 0 },
                                { ad: "Hafta Sonu Savaşçısı", icon: "🕺", aciklama: "Cuma ve Cumartesi günü şehrin nabzını tut, 4 işletmede check-in yap.", p: "1/4", pVal: 25 },
                                { ad: "Kahin'i Dinle", icon: "🔮", aciklama: "Beni Şaşırt rotalarından biriyle hafta içi bir plan tamamla.", p: "0/1", pVal: 0 },
                            ].map((g, i) => (
                                <div key={i} style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, padding: 16 }}>
                                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                        <div style={{ fontSize: 28 }}>{g.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                <h3 style={{ margin: 0, fontSize: 14, color: TEXT_PRI }}>{g.ad}</h3>
                                                <span style={{ fontSize: 11, color: SUCCESS, fontWeight: "bold", background: `${SUCCESS}22`, padding: "4px 8px", borderRadius: 4 }}>{g.p}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 12, color: TEXT_MUT, lineHeight: 1.4 }}>{g.aciklama}</p>
                                            <div style={{ width: "100%", height: 4, background: SURFACE_3, borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
                                                <div style={{ width: `${g.pVal}%`, height: "100%", background: GOLD }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {tab === "DATE" && (
                    <motion.div key="date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: 14, color: GOLD, marginBottom: 16 }}>Date Doctor Rezervasyonlarım</h2>
                        {reservations.length === 0 ? (
                            <p style={{ color: TEXT_MUT, fontSize: 12 }}>Henüz bir rezervasyonunuz bulunmuyor.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {reservations.map(res => (
                                    <div key={res.id} style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, borderRadius: 8, padding: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 15 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, color: TEXT_PRI, fontWeight: "bold", marginBottom: 8 }}>{res.category} Planı</div>
                                                <div style={{ fontSize: 11, color: TEXT_MUT, marginBottom: 4 }}>📅 {res.date} • 🕒 {res.time}</div>
                                                <div style={{ fontSize: 11, color: GOLD, marginBottom: 8 }}>📍 {res.venue}</div>
                                                <div style={{ fontSize: 10, color: TEXT_MUT, fontStyle: "italic", background: SURFACE_3, padding: 8, borderRadius: 4 }}>
                                                    "Not: {res.note || "Belirtilmedi"}"
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "center", background: "#fff", padding: 10, borderRadius: 6, width: 90, height: 90 }}>
                                                <div style={{ border: "10px dashed #000", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <div style={{ width: 20, height: 20, background: "#000" }} />
                                                </div>
                                                <span style={{ fontSize: 7, color: "#000", display: "block", marginTop: 4 }}>REZERVASYON QR</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === "SURPRISE" && (
                    <motion.div key="surp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: 14, color: "#e74c3c", marginBottom: 16 }}>Beni Şaşırt Rota Geçmişim</h2>
                        {surprises.length === 0 ? (
                            <p style={{ color: TEXT_MUT, fontSize: 12 }}>Henüz bir sürpriz rota oluşturulmamış.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                {surprises.map(s => (
                                    <div key={s.id} style={{ background: SURFACE_2, border: "1px solid rgba(231, 76, 60, 0.2)", borderRadius: 12, padding: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                                            <span style={{ fontSize: 12, fontWeight: "bold", color: "#e74c3c", background: "rgba(231, 76, 60, 0.1)", padding: "4px 10px", borderRadius: 4 }}>{s.mood} Rota</span>
                                            <span style={{ fontSize: 10, color: TEXT_MUT }}>{s.timestamp?.toDate().toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <h3 style={{ fontSize: 15, color: TEXT_PRI, marginBottom: 15 }}>{s.scenario_ad}</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                <span style={{ fontSize: 14 }}>1️⃣</span>
                                                <span style={{ fontSize: 12, color: TEXT_PRI }}>{s.scenario_full?.step1}</span>
                                            </div>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                <span style={{ fontSize: 14 }}>2️⃣</span>
                                                <span style={{ fontSize: 12, color: TEXT_PRI }}>{s.scenario_full?.step2}</span>
                                            </div>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                <span style={{ fontSize: 14 }}>3️⃣</span>
                                                <span style={{ fontSize: 12, color: TEXT_PRI }}>{s.scenario_full?.step3}</span>
                                            </div>
                                        </div>
                                        <p style={{ marginTop: 15, fontSize: 11, color: TEXT_MUT, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>{s.scenario_full?.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === "ACH" && (
                    <motion.div key="ach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{ fontSize: 14, color: TEXT_PRI }}>Başarımlar & Sosyal Rozetler</h2>
                            <span style={{ fontSize: 11, color: GOLD }}>1 / 8 Açıldı</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                            {[
                                { ad: "İlk Adım", icon: "🌱", aciklama: "Uygulamaya kayıt oldun.", acildi: true },
                                { ad: "Yerel Kahraman", icon: "🦸‍♂️", aciklama: "Mevcut mahallede işletmelere en çok giden %5 lik dilim.", acildi: false },
                                { ad: "Gece Kuşu", icon: "🦉", aciklama: "Saat 22:00'den sonra 10 etkileşim kur.", acildi: false },
                                { ad: "Gurme Eleştirmen", icon: "✍️", aciklama: "Date Doctor ile 3 plan yap ve yorum bırak.", acildi: false },
                                { ad: "Sıra Önceliği", icon: "⏳", aciklama: "Gümüş Üyelikte kilit açıldı: Belirli mekanlarda VIP sıra.", acildi: false },
                                { ad: "Altın Gurme", icon: "👑", aciklama: "Altın Üyeliğe ulaş ve menü sırlarını gör.", acildi: false },
                            ].map(ach => (
                                <div key={ach.ad} style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, padding: 16, borderRadius: 8, opacity: ach.acildi ? 1 : 0.4, filter: ach.acildi ? "none" : "grayscale(1)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>{ach.icon}</div>
                                        {ach.acildi && <button style={{ border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, fontSize: 9, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>PAYLAŞ</button>}
                                    </div>
                                    <h3 style={{ margin: "0 0 6px", fontSize: 14, color: TEXT_PRI }}>{ach.ad}</h3>
                                    <p style={{ margin: 0, fontSize: 11, color: TEXT_MUT }}>{ach.aciklama}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {tab === "STORE" && (
                    <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}40`, padding: 24, borderRadius: 8, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, color: GOLD, margin: "0 0 8px" }}>Hoşgeldin Kampanyası</h2>
                            <p style={{ fontSize: 13, color: TEXT_PRI, margin: "0 0 16px" }}>Mevcut Puanın: <strong>{userData.puan || 0}</strong></p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                            {[
                                { puan: 100, fiyat: 50 },
                                { puan: 200, fiyat: 100 },
                                { puan: 300, fiyat: 150 },
                                { puan: 500, fiyat: 250 },
                                { puan: 1000, fiyat: 450 },
                            ].map(pkt => (
                                <div key={pkt.puan} style={{ background: SURFACE_2, border: `1px solid ${GOLD_BORDER}`, padding: 20, borderRadius: 8, textAlign: "center" }}>
                                    <h3 style={{ fontSize: 24, color: TEXT_PRI, margin: "0 0 4px" }}>{pkt.puan}</h3>
                                    <p style={{ fontSize: 12, color: TEXT_MUT, margin: "0 0 20px" }}>Nar Puanı</p>
                                    <button
                                        onClick={() => handlePuanSatinAl(pkt.puan, pkt.fiyat)}
                                        disabled={yukleniyor}
                                        style={{ width: "100%", padding: 12, background: yukleniyor ? SURFACE_3 : `linear-gradient(135deg, ${GOLD}, #b8952a)`, color: yukleniyor ? TEXT_MUT : "#000", border: "none", borderRadius: 4, fontWeight: "bold", cursor: yukleniyor ? "wait" : "pointer" }}>
                                        ₺{pkt.fiyat} — SATIN AL
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {tab === "ORDERS" && (
                    <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: 14, color: SUCCESS, marginBottom: 16 }}>Sipariş Geçmişim</h2>
                        {payments.length === 0 ? (
                            <p style={{ color: TEXT_MUT, fontSize: 12 }}>Henüz bir siparişiniz bulunmuyor.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {payments.map(p => (
                                    <div key={p.id} style={{
                                        background: SURFACE_2, padding: "12px 16px", borderRadius: 8, border: `1px solid ${GOLD_BORDER}`,
                                        display: "flex", justifyContent: "space-between", alignItems: "center"
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 13, color: TEXT_PRI, fontWeight: "bold" }}>{p.puan} Nar Puanı</div>
                                            <div style={{ fontSize: 10, color: TEXT_MUT }}>ID: {p.merchant_oid} " {p.timestamp?.toDate().toLocaleString('tr-TR')}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 14, color: GOLD, fontWeight: "bold" }}>₺{p.amount}</div>
                                            <div style={{
                                                fontSize: 9, padding: "2px 8px", borderRadius: 10, marginTop: 4, display: "inline-block",
                                                background: p.status === 'SUCCESS' ? SUCCESS + '22' : p.status === 'FAILED' ? '#e74c3c22' : '#f1c40f22',
                                                color: p.status === 'SUCCESS' ? SUCCESS : p.status === 'FAILED' ? '#e74c3c' : '#f1c40f',
                                                border: `1px solid ${p.status === 'SUCCESS' ? SUCCESS : p.status === 'FAILED' ? '#e74c3c' : '#f1c40f'}44`
                                            }}>
                                                {p.status === 'SUCCESS' ? 'TAMAMLANDI' : p.status === 'FAILED' ? '0PTAL/HATA' : 'BEKL0YOR'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === "SETTINGS" && (
                    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <ProfileSettings userRole="USER" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {payTRDetails && (
                    <PayTRPayment
                        amount={payTRDetails.amount}
                        user={payTRDetails.user}
                        merchant_oid={payTRDetails.merchant_oid}
                        basket={payTRDetails.basket}
                        onClose={() => setPayTRDetails(null)}
                        onSuccess={() => {
                            setPayTRDetails(null);
                            setTab("ORDERS");
                            setBildirim("Ödeme sayfasına yönlendiriliyorsunuz...");
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
