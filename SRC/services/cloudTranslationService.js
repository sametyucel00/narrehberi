// Nar Rehberi - Google Cloud Translation API Service (REST)

const CLOUD_TRANSLATION_API_KEY = "AIzaSyAC-dYdfkhQnITm8E1Ejf9nj9vKL803_q0"; // Same key used in Gemini

export async function translateText(text, targetLang) {
    if (!text || text.trim().length === 0) return "";

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${CLOUD_TRANSLATION_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLang.toLowerCase(),
                format: 'text', // Can be 'html' if tags are present
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Cloud Translation API Error:", errData);
            throw new Error(`Cloud Translation Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.data && data.data.translations && data.data.translations.length > 0) {
            return data.data.translations[0].translatedText;
        }

        return "";
    } catch (error) {
        console.error("Cloud Translation Execution Error:", error);
        throw error;
    }
}

/**
 * Batch translate text into multiple languages
 * Used mainly for the Theater Synopsis where we need EN, RU, DE at the same time
 */
export async function batchTranslate(text, sourceLang = "tr") {
    if (!text || text.trim().length === 0) return { EN: "", RU: "", DE: "" };

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${CLOUD_TRANSLATION_API_KEY}`;

        // Target languages
        const targets = ["en", "ru", "de"];
        const results = {};

        // We run multiple promises simultaneously to speed things up
        const requests = targets.map(async (target) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: target,
                    source: sourceLang,
                    format: 'text',
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error(`Cloud Translation API Error for ${target}:`, errData);
                return "";
            }

            const data = await response.json();
            if (data && data.data && data.data.translations && data.data.translations.length > 0) {
                return data.data.translations[0].translatedText;
            }
            return "";
        });

        const responses = await Promise.all(requests);

        results.EN = responses[0];
        results.RU = responses[1];
        results.DE = responses[2];

        return results;

    } catch (error) {
        console.error("Cloud Translation Batch Execution Error:", error);
        throw error;
    }
}
