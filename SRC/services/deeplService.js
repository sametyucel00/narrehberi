// Nar Rehberi - DeepL Translation Service (Direct REST API)

// Nar Rehberi - DeepL Translation Service
// User specified key: c1a3c3f7-af79-4d4f-8d2b-2ae72e2eaa77:fx
const authKey = "c1a3c3f7-af79-4d4f-8d2b-2ae72e2eaa77:fx";

// DeepL API Initialize
// "fx" suffix means it is the Free API. Using direct REST since we are in a browser environment (Vite/React)
export async function translateText(text, targetLang) {
    if (!text || text.trim().length === 0) return "";

    try {
        const url = 'https://api-free.deepl.com/v2/translate';

        const params = new URLSearchParams();
        params.append('text', text);
        params.append('target_lang', targetLang.toUpperCase());

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${authKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("DeepL API Error:", errData);
            throw new Error(`DeepL Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.translations && data.translations.length > 0) {
            return data.translations[0].text;
        }

        return "";
    } catch (error) {
        console.error("DeepL Execution Error:", error);
        throw error;
    }
}
