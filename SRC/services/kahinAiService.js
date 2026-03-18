// Nar Rehberi - Kahin AI Service (Directed exclusively to the NEWly requested key)
const API_KEY = "AIzaSyAdg4hhar57GVIwzgIlBrdjuCFG0PrRPok";

/**
 * Bu servis sadece kullanıcının son sağladığı API anahtarını kullanır.
 * Çok aşamalı fallback (geri dönüş) sistemi ile maksimum dayanıklılık sağlar.
 */
export async function askKahinWeb(cat, question, lang = "TR") {
    const prompt = `
      Sen Antalya'nın en güncel rehberi Kahin'sin.
      Kullanıcı "${cat}" kategorisinde şunu soruyor: "${question}"
      Web araması yaparak kısa, öz ve pratik bir cevap ver (maks 4 cümle).
      Cevabını güncel web verilerine (mekanlar, etkinlikler, fiyatlar) dayandır.
      Dil: ${lang === "TR" ? "T�rk�e" : "0ngilizce"}.
      İmza ekleme.
    `;

    try {
        // En güvenilir yol: Kendi PHP Proxy'miz (Hostinger/Web üzerinde CORS ve kısıtlamaları aşar)
        const proxyResponse = await fetch("/api/kahin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, useSearch: true })
        });

        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        }
        
        // Proxy başarısızsa doğrudan Gemini API üzerinden dene (Fallback)
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const directResponse = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                tools: [{ google_search_retrieval: {} }]
            })
        });

        if (directResponse.ok) {
            const data = await directResponse.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        }
        throw new Error("PRIMARY_FAILED");

    } catch (error) {
        // 2. ADIM: Standart v1 Üzerinden Flash Denemesi (Search Kapalı)
        try {
            const urlV1 = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            const responseV1 = await fetch(urlV1, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Sen Antalya Rehberi Kahin'sin. Kısa ve öz cevapla: ${question}` }] }]
                })
            });

            if (!responseV1.ok) throw new Error("V1_FAILED");

            const dataV1 = await responseV1.json();
            return dataV1.candidates[0].content.parts[0].text;
        } catch (inner) {
            // 3. ADIM: Temel Gemini-Pro Denemesi (v1)
            try {
                const urlPro = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
                const responsePro = await fetch(urlPro, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Antalya Rehberi: ${question}` }] }]
                    })
                });

                if (!responsePro.ok) throw new Error("PRO_FAILED");
                const dataPro = await responsePro.json();
                return dataPro.candidates[0].content.parts[0].text;
            } catch (final) {
                console.error("Kahin AI Critical Failure: All models failed for the provided key.");
                return lang === "TR"
                    ? "^u an Antalya rehberinize ula_makta zorlan1yorum, l�tfen biraz sonra tekrar deneyin."
                    : "I'm having trouble reaching your Antalya guide right now, please try again later.";
            }
        }
    }
}
