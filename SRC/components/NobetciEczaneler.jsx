import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNobetciEczaneler } from "../services/pharmacyService";

const CARD_BG = "#13131a";
const CARD_BOR = "rgba(212,175,55,0.22)";
const TEXT = "rgba(238,230,210,0.92)";
const TEXT_DIM = "rgba(168,155,128,0.55)";
const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.08)";
const SANS = "'Inter','Segoe UI',sans-serif";
const SERIF = "'Inter','Garamond',serif";
const PANEL_BG = "#0d0d12";

export default function NobetciEczaneler({ onClose }) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getList = async () => {
            try {
                setLoading(true);
                const list = await fetchNobetciEczaneler();
                if (Object.keys(list).length === 0) throw new Error("Liste alınamadı.");
                setData(list);
            } catch (err) {
                console.error("Nöbetçi Eczane Hatası:", err);
                setError("Nöbetçi Eczaneler yüklenirken bir sorun oluştu.");
            } finally {
                setLoading(false);
            }
        };

        getList();
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.85)", zIndex: 9999,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    padding: "20px"
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: PANEL_BG,
                        width: "100%", maxWidth: "600px", maxHeight: "85vh",
                        borderRadius: "6px", border: `1px solid ${CARD_BOR}`,
                        display: "flex", flexDirection: "column",
                        overflow: "hidden", position: "relative"
                    }}
                >
                    {/* Üst Kısım */}
                    <div style={{
                        padding: "16px 20px", borderBottom: `1px solid ${CARD_BOR}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "linear-gradient(135deg,rgba(212,175,55,0.05) 0%,rgba(10,10,15,0.95) 100%)"
                    }}>
                        <div>
                            <h2 style={{ fontFamily: SERIF, fontSize: "18px", color: TEXT, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                💊 Nöbetçi Eczaneler
                            </h2>
                            <p style={{ fontFamily: SANS, fontSize: "10px", color: GOLD, margin: "2px 0 0", letterSpacing: "0.05em" }}>
                                Antalya Eczacı Odası Resmi Listesi
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: "none", border: "none", color: TEXT_DIM, fontSize: "20px", cursor: "pointer", padding: "4px" }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* İçerik */}
                    <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                        {loading && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", color: TEXT_DIM }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        width: "24px", height: "24px", border: `2px solid ${GOLD}`,
                                        borderTopColor: "transparent", borderRadius: "50%", marginBottom: "12px"
                                    }}
                                />
                                <span style={{ fontFamily: SANS, fontSize: "12px", letterSpacing: "0.1em" }}>Güncel liste çekiliyor...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div style={{ textAlign: "center", padding: "30px 0" }}>
                                <p style={{ fontFamily: SERIF, fontSize: "16px", color: "#e86464" }}>{error}</p>
                                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
                                    <a href="https://www.antalya.gov.tr/nobetci-eczaneler" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: "4px", background: "rgba(68,170,102,0.1)", border: "1px solid #44aa66", color: "#44aa66", textDecoration: "none", fontSize: "12px", fontFamily: SANS }}>
                                        Resmi Web Sitesine Git
                                    </a>
                                </div>
                            </div>
                        )}

                        {!loading && !error && Object.keys(data).length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {Object.entries(data).map(([ilce, eczaneler]) => (
                                    <div key={ilce}>
                                        <div style={{
                                            padding: "8px 12px", background: GOLD_DIM, borderLeft: `3px solid ${GOLD}`,
                                            marginBottom: "12px", borderRadius: "0 4px 4px 0"
                                        }}>
                                            <h3 style={{ fontFamily: SANS, fontSize: "13px", color: GOLD, margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                📍 {ilce}
                                            </h3>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                                            {eczaneler.map(eczane => (
                                                <div key={eczane.id} style={{
                                                    padding: "14px", background: CARD_BG, border: `1px solid ${CARD_BOR}`,
                                                    borderRadius: "4px", display: "flex", flexDirection: "column", justifyContent: "space-between"
                                                }}>
                                                    <div>
                                                        <h4 style={{ fontFamily: SERIF, fontSize: "15px", color: TEXT, margin: "0 0 6px", fontWeight: 600 }}>
                                                            {eczane.name}
                                                        </h4>
                                                        <p style={{ fontFamily: SANS, fontSize: "11px", color: TEXT_DIM, margin: "0 0 12px", lineHeight: 1.4 }}>
                                                            {eczane.adres}
                                                        </p>
                                                    </div>

                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        {eczane.telLink && (
                                                            <a href={eczane.telLink} style={{
                                                                flex: 1, padding: "8px 0", textAlign: "center", borderRadius: "3px", textDecoration: "none",
                                                                background: "rgba(212,175,55,0.1)", border: `1px solid ${GOLD}40`,
                                                                color: GOLD, fontFamily: SANS, fontSize: "11px", display: "inline-block"
                                                            }}>📞 {eczane.tel || "Ara"}</a>
                                                        )}
                                                        {eczane.mapsLink && (
                                                            <a href={eczane.mapsLink} target="_blank" rel="noopener noreferrer" style={{
                                                                flex: 1, padding: "8px 0", textAlign: "center", borderRadius: "3px", textDecoration: "none",
                                                                background: "rgba(66,133,244,0.1)", border: `1px solid rgba(66,133,244,0.4)`,
                                                                color: "#4285F4", fontFamily: SANS, fontSize: "11px", display: "inline-block"
                                                            }}>🗺 Harita</a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
