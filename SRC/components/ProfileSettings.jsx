import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

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
            notify("basari", "Profil bilgileri baÅŸarÄ±yla gÃ¼ncellendi.");
        } catch (err) {
            console.error("Profile update failed:", err);
            notify("hata", "Profil gÃ¼ncellenirken bir hata oluÅŸtu.");
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passForm.newPass !== passForm.confirmPass) {
            return notify("hata", "Yeni ÅŸifreler uyuÅŸmuyor.");
        }
        if (passForm.newPass.length < 6) {
            return notify("hata", "Åifre en az 6 karakter olmalÄ±dÄ±r.");
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
            notify("basari", "Åifreniz baÅŸarÄ±yla deÄŸiÅŸtirildi.");
        } catch (err) {
            console.error("Password update failed:", err);
            if (err.code === "auth/wrong-password") {
                notify("hata", "Mevcut ÅŸifreniz hatalÄ±.");
            } else {
                notify("hata", "Åifre deÄŸiÅŸtirilirken bir hata oluÅŸtu.");
            }
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ color: TEXT_MUT, textAlign: "center", padding: 40 }}>YÃ¼kleniyor...</div>;

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
                <h3 style={{ margin: "0 0 20px", color: GOLD, fontSize: 16, letterSpacing: "0.1em" }}>PROFÄ°L BÄ°LGÄ°LERÄ°</h3>

                <form onSubmit={handleProfileUpdate}>
                    <div style={styles.field}>
                        <label style={styles.label}>E-POSTA (DeÄŸiÅŸtirilemez)</label>
                        <input type="text" value={userData?.email || ""} disabled style={styles.inputDisabled} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>KULLANICI ADI (DeÄŸiÅŸtirilemez)</label>
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
                            <label style={styles.label}>{userRole === "KURUMSAL" ? "F0RMA ADI" : "0^LETME ADI"}</label>
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
                        {updating ? "GÃœNCELLENÄ°YOR..." : "PROFÄ°LÄ° GÃœNCELLE"}
                    </button>
                </form>
            </motion.div>

            {/* Password Section */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                style={{ flex: "1 1 300px", background: SURFACE_2, padding: 24, borderRadius: 8, border: `1px solid ${GOLD_BORDER}` }}>
                <h3 style={{ margin: "0 0 20px", color: GOLD, fontSize: 16, letterSpacing: "0.1em" }}>ÅÄ°FREYÄ° DEÄÄ°ÅTÄ°R</h3>

                <form onSubmit={handlePasswordUpdate}>
                    <div style={styles.field}>
                        <label style={styles.label}>MEVCUT ÅÄ°FRE</label>
                        <input type="password" required value={passForm.currentPass} onChange={e => setPassForm({ ...passForm, currentPass: e.target.value })} style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>YENÄ° ÅÄ°FRE</label>
                        <input type="password" required value={passForm.newPass} onChange={e => setPassForm({ ...passForm, newPass: e.target.value })} style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>YENÄ° ÅÄ°FRE TEKRAR</label>
                        <input type="password" required value={passForm.confirmPass} onChange={e => setPassForm({ ...passForm, confirmPass: e.target.value })} style={styles.input} />
                    </div>

                    <button type="submit" disabled={updating} style={{ ...styles.button, background: "transparent", border: `1px solid ${GOLD}` }}>
                        {updating ? "Ä°ÅLENÄ°YOR..." : "ÅÄ°FREYÄ° GÃœNCELLE"}
                    </button>
                </form>
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
