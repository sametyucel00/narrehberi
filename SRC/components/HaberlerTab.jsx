import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CARD_BG = "#13131a";
const CARD_BOR = "rgba(212,175,55,0.22)";
const TEXT = "rgba(238,230,210,0.92)";
const TEXT_DIM = "rgba(168,155,128,0.55)";
const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.08)";
const SANS = "'Inter','Segoe UI',sans-serif";
const SERIF = "'Inter','Garamond',serif";

export default function HaberlerTab() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCount, setShowCount] = useState(5);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                // Kendi PHP Proxy'miz üzerinden haberleri çek (CORS ve Proxy sorunlarını çözer)
                // Farklı ortamlarda (Vite dev, prod, mobile) daha güvenli bir yol deniyoruz
                const host = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1") ? "https://narrehberi.com" : "";
                const apiUrl = `${host}/api/haber`;
                
                let response;
                try {
                    response = await fetch(apiUrl);
                } catch (e) {
                    console.warn("Initial fetch failed, trying fallback...", e);
                    response = { ok: false };
                }
                
                let str;
                if (!response.ok) {
                    console.warn(`Haber API Error: ${response.status}. Trying fallback extension...`);
                    // Proxy her zaman çalışmayabilir, doğrudan PHP dosyasını dene
                    const fallbackUrl = `${host}/api/haber.php`;
                    const fallbackResponse = await fetch(fallbackUrl);
                    if (!fallbackResponse.ok) throw new Error("Haberler alınamadı");
                    str = await fallbackResponse.text();
                } else {
                    str = await response.text();
                }

                if (!str || str.trim().length === 0) throw new Error("Haber içeriği boş");

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(str, "text/xml");
                
                // Parser error check
                const parseError = xmlDoc.getElementsByTagName("parsererror");
                if (parseError.length > 0) {
                    console.error("XML Parse Error:", parseError[0].textContent);
                    throw new Error("Haber formatı okunamadı");
                }

                const items = Array.from(xmlDoc.querySelectorAll("item, entry"));
                if (items.length === 0) {
                    throw new Error("Güncel haber bulunamadı");
                }

                const parsedNews = items.slice(0, 20).map((item, index) => {
                    const titleNode = item.querySelector("title");
                    const title = titleNode ? titleNode.textContent : "Ba_l1ks1z Haber";

                    const descNode = item.querySelector("description, summary, content");
                    let description = descNode ? descNode.textContent : "";
                    description = description.replace(/<[^>]*>?/gm, '').trim();
                    if (description.length > 140) description = description.substring(0, 140) + "...";

                    const linkNode = item.querySelector("link");
                    let link = "#";
                    if (linkNode) {
                        link = linkNode.textContent || linkNode.getAttribute("href") || "#";
                    }

                    const pubDateNode = item.querySelector("pubDate, published, updated");
                    let pubDate = pubDateNode ? pubDateNode.textContent : "";
                    if (pubDate) {
                        try {
                            const d = new Date(pubDate);
                            if (!isNaN(d.getTime())) {
                                pubDate = d.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                            }
                        } catch(e) {}
                    }

                    const enclosure = item.querySelector("enclosure, media\\:content, content");
                    let imgUrl = enclosure ? (enclosure.getAttribute("url") || enclosure.getAttribute("src") || "") : "";
                    
                    // Fallback for image in description if not in enclosure
                    if (!imgUrl && descNode) {
                        const m = descNode.textContent.match(/src=["'](.*?)["']/);
                        if (m) imgUrl = m[1];
                    }

                    return { id: `haber-${index}-${Date.now()}`, title, description, link, pubDate, imgUrl };
                });

                setNews(parsedNews);
                setLoading(false);
            } catch (err) {
                console.error("Haber RSS çekme hatası:", err);
                setError(err.message || "Şu anda güncel haberlere ulaşılamıyor. Lütfen daha sonra tekrar deneyin.");
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", color: TEXT_DIM }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: "24px", height: "24px", border: `2px solid ${GOLD}`,
                        borderTopColor: "transparent", borderRadius: "50%", marginBottom: "12px"
                    }}
                />
                <p style={{ fontFamily: SANS, fontSize: "12px", letterSpacing: "0.1em" }}>Haberler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: SERIF, fontSize: "15px", color: "rgba(224,100,100,0.85)", fontStyle: "italic", marginBottom: "16px" }}>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{ padding: "8px 20px", background: "transparent", border: `1px solid ${GOLD}`, color: GOLD, borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                >
                    Yeniden Dene
                </button>
            </div>
        );
    }

    const displayedNews = news.slice(0, showCount);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ padding: "10px 0" }}
        >
            <div style={{ marginBottom: "16px", padding: "0 4px" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: "18px", color: TEXT, margin: "0 0 4px" }}>🗞 Antalyadan Son Dakika</h2>
                <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: 0 }}>Gündemden öne çıkan haberler</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {displayedNews.length > 0 ? displayedNews.map((item, i) => (
                    <motion.a
                        href={item.link} target="_blank" rel="noopener noreferrer"
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        whileHover={{ y: -2, borderColor: `${GOLD}50` }}
                        style={{
                            display: "flex", gap: "12px", background: CARD_BG, border: `1px solid ${CARD_BOR}`,
                            borderRadius: "4px", padding: "12px", textDecoration: "none", color: "inherit",
                            alignItems: "stretch"
                        }}
                    >
                        {item.imgUrl && (
                            <div style={{ width: "clamp(70px, 20vw, 90px)", flexShrink: 0, borderRadius: "2px", overflow: "hidden", background: "#202028" }}>
                                <img src={item.imgUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        )}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <h3 style={{ fontFamily: SERIF, fontSize: "14px", color: GOLD, margin: "0 0 6px", lineHeight: 1.3, fontWeight: 600 }}>
                                    {item.title}
                                </h3>
                                <p style={{ fontFamily: SANS, fontSize: "11px", color: TEXT, margin: 0, lineHeight: 1.5, opacity: 0.85 }}>
                                    {item.description}
                                </p>
                            </div>
                            {item.pubDate && (
                                <p style={{ fontFamily: SANS, fontSize: "9px", color: TEXT_DIM, margin: "8px 0 0", letterSpacing: "0.05em" }}>
                                    🕰 {item.pubDate}
                                </p>
                            )}
                        </div>
                    </motion.a>
                )) : (
                    <p style={{ textAlign: "center", color: TEXT_DIM, fontSize: "12px", padding: "20px 0", fontStyle: "italic" }}>
                        Henüz güncel haber bulunamadı.
                    </p>
                )}
            </div>

            {news.length > 5 && showCount < 20 && (
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCount(20)}
                    style={{
                        width: "100%", padding: "12px", marginTop: "16px", borderRadius: "3px", cursor: "pointer",
                        background: GOLD_DIM, border: `1px solid ${GOLD}40`, color: GOLD,
                        fontFamily: SANS, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase"
                    }}
                >
                    Daha Fazla Haber Göster ({news.length - 5})
                </motion.button>
            )}
        </motion.div>
    );
}
