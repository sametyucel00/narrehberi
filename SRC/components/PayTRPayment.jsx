import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createPaymentToken } from '../services/PayTRService';

const C = {
    gold: "#D4AF37",
    bg: "#0a0a0f",
    text: "rgba(238,230,210,0.92)"
};

export default function PayTRPayment({ amount, user, onClose, onSuccess }) {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function initPayment() {
            setLoading(true);
            const result = await createPaymentToken({
                amount,
                userEmail: user?.email || 'test@example.com',
                userName: user?.displayName || user?.name || 'Misafir Kullan1c1',
                userPhone: user?.phone || '05555555555',
                userAddress: 'Antalya, Türkiye'
            });

            if (result.token) {
                setToken(result.token);
            } else {
                setError(result.error);
            }
            setLoading(false);
        }

        initPayment();
    }, [amount, user]);

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 10001,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", padding: 20
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: "100%", maxWidth: 600, height: "80vh",
                    background: C.bg, borderRadius: 12, border: `1px solid ${C.gold}`,
                    position: "relative", overflow: "hidden", display: "flex", flexDirection: "column"
                }}
            >
                <div style={{
                    padding: "15px 20px", borderBottom: `1px solid ${C.gold}44`,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <h3 style={{ margin: 0, color: C.gold, fontSize: 18 }}>Güvenli Ödeme (PayTR)</h3>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", color: "#fff",
                        fontSize: 24, cursor: "pointer"
                    }}>×</button>
                </div>

                <div style={{ flex: 1, position: "relative", background: "#fff" }}>
                    {loading && (
                        <div style={{
                            position: "absolute", inset: 0, display: "flex",
                            alignItems: "center", justifyContent: "center", background: C.bg, color: C.gold
                        }}>
                            Ödeme sayfası hazırlanıyor...
                        </div>
                    )}

                    {error && (
                        <div style={{
                            position: "absolute", inset: 0, display: "flex",
                            flexDirection: "column", alignItems: "center", justifyContent: "center",
                            background: C.bg, color: "#ff4d4d", padding: 20, textAlign: "center"
                        }}>
                            <p>Hata: {error}</p>
                            <button onClick={onClose} style={{
                                marginTop: 20, padding: "10px 20px", background: C.gold,
                                color: "#000", border: "none", borderRadius: 4, cursor: "pointer"
                            }}>Kapat</button>
                        </div>
                    )}

                    {token && (
                        <iframe
                            src={`https://www.paytr.com/odeme/guvenli/${token}`}
                            id="paytriframe"
                            frameBorder="0"
                            scrolling="yes"
                            style={{ width: "100%", height: "100%" }}
                        ></iframe>
                    )}
                </div>

                <div style={{ padding: 10, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    256-bit SSL ile %100 Güvenli Ödeme Altyapısı
                </div>
            </motion.div>
        </div>
    );
}
