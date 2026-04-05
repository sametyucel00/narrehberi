import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth } from "../services/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.22)";
const SURFACE_2 = "#13131a";
const SURFACE_3 = "#1a1a24";
const TEXT_PRI = "rgba(240,234,218,0.93)";
const TEXT_MUT = "rgba(180,170,150,0.50)";
const SUCCESS = "#7090e0";
const DANGER = "#c0604a";

export default function ProfileSettings({ userRole }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [bildirim, setBildirim] = useState(null);

    // Form states
    const [profileForm, setProfileForm] = useState({
        ad_soyad: "",
        telefon: "",
        firma_adi: "",
        isletmeAdi: "",
        adres: ""
    });

    const [passForm, setPassForm] = useState({
        currentPass: "",
        newPass: "",
        confirmPass: ""
    });
    const [deleteConfirm, setDeleteConfirm] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            const u = auth.currentUser;
            if (!u) return;
            try {
                const docSnap = await getDoc(doc(db, "users", u.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setProfileForm({
                        ad_soyad: data.ad_soyad || "",
                        telefon: data.telefon || "",
                        firma_adi: data.firma_adi || "",
                        isletmeAdi: data.isletmeAdi || "",
                        adres: data.adres || ""
                    });
                }
            } catch (err) {
                console.error("User data fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const notify = (tip, mesaj) => {
        setBildirim({ tip, mesaj });
        setTimeout(() => setBildirim(null), 4000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const u = auth.currentUser;
            const updateData = {
                ad_soyad: profileForm.ad_soyad,
                telefon: profileForm.telefon,
                adres: profileForm.adres
            };

            if (userRole === "KURUMSAL" || userRole === "ISLETME") {
                updateData.firma_adi = profileForm.firma_adi || profileForm.isletmeAdi;
            }

            await updateDoc(doc(db, "users", u.uid), updateData);
            notify("basari", "Profil bilgileri başarıyla güncellendi.");
        } catch (err) {
            console.error("Profile update failed:", err);
            notify("hata", "Profil güncellenirken bir hata oluştu.");
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passForm.newPass !== passForm.confirmPass) {
            return notify("hata", "Yeni şifreler uyuşmuyor.");
        }
        if (passForm.newPass.length < 6) {
            return notify("hata", "Şifre en az 6 karakter olmalıdır.");
        }

        setUpdating(true);
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, passForm.currentPass);

            // Re-authenticate user
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, passForm.newPass);

            setPassForm({ currentPass: "", newPass: "", confirmPass: "" });
            notify("basari", "Şifreniz başarıyla değiştirildi.");
        } catch (err) {
            console.error("Password update failed:", err);
            if (err.code === "auth/wrong-password") {
                notify("hata", "Mevcut şifreniz hatalı.");
            } else {
                notify("hata", "Şifre değiştirilirken bir hata oluştu.");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleAccountDelete = async (e) => {
        e.preventDefault();
        if (deleteConfirm.trim().toUpperCase() !== "SIL") {
            return notify("hata", "Hesap silme onayı için SIL yazmalısınız.");
        }

        setUpdating(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("auth/no-current-user");

            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            notify("basari", "Hesabınız silindi.");
            setTimeout(() => window.location.reload(), 900);
        } catch (err) {
            console.error("Account delete failed:", err);
            if (err?.code === "auth/requires-recent-login") {
                notify("hata", "Hesabı silmek için lütfen yeniden giriş yapın ve tekrar deneyin.");
            } else {
                notify("hata", "Hesap silinirken bir hata oluştu.");
            }
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ color: TEXT_MUT, textAlign: "center", padding: 40 }}>Yükleniyor...</div>;

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            {/* Bildirim */}
            {bildirim && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: "fixed", top: 20, right: 20, zIndex: 1000,
                        background: SURFACE_2, border: `1px solid ${bildirim.tip === "basari" ? SUCCESS : DANGER}`,
                        padding: "12px 24px", borderRadius: 8, color: TEXT_PRI, boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                    }}>
                    <span style={{ fontSize: 16, marginRight: 8 }}>{bildirim.tip === "basari" ? "✓" : "✕"}</span>
                    {bildirim.mesaj}
                </motion.div>
            )}

            {/* Profile Edit Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                style={{ flex: "1 1 400px", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                <h3 style={{ margin: "0 0 20px", color: GOLD, fontSize: 16, letterSpacing: "0.1em" }}>PROFİL BİLGİLERİ</h3>

                <form onSubmit={handleProfileUpdate}>
                    <div style={styles.field}>
                        <label style={styles.label}>E-POSTA (Değiştirilemez)</label>
                        <input type="text" value={userData?.email || ""} disabled style={styles.inputDisabled} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>KULLANICI ADI (Değiştirilemez)</label>
                        <input type="text" value={userData?.kullanici_adi || ""} disabled style={styles.inputDisabled} />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>AD SOYAD</label>
                        <input type="text" value={profileForm.ad_soyad} onChange={e => setProfileForm({ ...profileForm, ad_soyad: e.target.value })} style={styles.input} />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>TELEFON</label>
                        <input type="text" value={profileForm.telefon} onChange={e => setProfileForm({ ...profileForm, telefon: e.target.value })} style={styles.input} />
                    </div>

                    {(userRole === "KURUMSAL" || userRole === "ISLETME") && (
                        <div style={styles.field}>
                            <label style={styles.label}>{userRole === "KURUMSAL" ? "FİRMA ADI" : "İŞLETME ADI"}</label>
                            <input type="text" value={profileForm.firma_adi || profileForm.isletmeAdi}
                                onChange={e => setProfileForm({ ...profileForm, [userRole === "KURUMSAL" ? "firma_adi" : "isletmeAdi"]: e.target.value })}
                                style={styles.input} />
                        </div>
                    )}

                    <div style={styles.field}>
                        <label style={styles.label}>ADRES</label>
                        <textarea rows={3} value={profileForm.adres} onChange={e => setProfileForm({ ...profileForm, adres: e.target.value })} style={{ ...styles.input, resize: "none" }} />
                    </div>

                    <button type="submit" disabled={updating} style={styles.button}>
                        {updating ? "GÜNCELLENİYOR..." : "PROFİLİ GÜNCELLE"}
                    </button>
                </form>
            </motion.div>

            {/* Password Section */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                style={{ flex: "1 1 300px", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                <h3 style={{ margin: "0 0 20px", color: GOLD, fontSize: 16, letterSpacing: "0.1em" }}>ŞİFREYİ DEĞİŞTİR</h3>

                <form onSubmit={handlePasswordUpdate}>
                    <div style={styles.field}>
                        <label style={styles.label}>MEVCUT ŞİFRE</label>
                        <input type="password" required value={passForm.currentPass} onChange={e => setPassForm({ ...passForm, currentPass: e.target.value })} style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>YENİ ŞİFRE</label>
                        <input type="password" required value={passForm.newPass} onChange={e => setPassForm({ ...passForm, newPass: e.target.value })} style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>YENİ ŞİFRE TEKRAR</label>
                        <input type="password" required value={passForm.confirmPass} onChange={e => setPassForm({ ...passForm, confirmPass: e.target.value })} style={styles.input} />
                    </div>

                    <button type="submit" disabled={updating} style={{ ...styles.button, background: "transparent", border: `1px solid ${GOLD}` }}>
                        {updating ? "İŞLENİYOR..." : "ŞİFREYİ GÜNCELLE"}
                    </button>
                </form>

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${GOLD_BORDER}` }}>
                    <h3 style={{ margin: "0 0 12px", color: DANGER, fontSize: 16, letterSpacing: "0.1em" }}>HESABI SİL</h3>
                    <p style={{ margin: "0 0 12px", color: TEXT_MUT, fontSize: 12, lineHeight: 1.6 }}>
                        Hesabınızı ve bu hesaba bağlı kullanıcı kaydını kalıcı olarak silmek için aşağıya <strong style={{ color: TEXT_PRI }}>SIL</strong> yazın.
                    </p>
                    <form onSubmit={handleAccountDelete}>
                        <div style={styles.field}>
                            <label style={styles.label}>ONAY METNİ</label>
                            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} style={styles.input} placeholder="SIL" />
                        </div>
                        <button type="submit" disabled={updating} style={{ ...styles.button, background: "transparent", border: `1px solid ${DANGER}`, color: DANGER }}>
                            {updating ? "İŞLENİYOR..." : "HESABI SİL"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

const styles = {
    field: { marginBottom: 16 },
    label: { display: "block", fontSize: 10, color: GOLD, opacity: 0.7, marginBottom: 6, letterSpacing: "0.05em" },
    input: { width: "100%", background: SURFACE_3, border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "10px 12px", color: TEXT_PRI, fontSize: 13, boxSizing: "border-box", outline: "none" },
    inputDisabled: { width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 4, padding: "10px 12px", color: TEXT_MUT, fontSize: 13, boxSizing: "border-box", cursor: "not-allowed" },
    button: { width: "100%", padding: "12px", background: GOLD, color: "#000", border: "none", borderRadius: 4, fontWeights: "bold", fontSize: 12, cursor: "pointer", letterSpacing: "0.1em", marginTop: 10 }
};
