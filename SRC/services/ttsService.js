/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — PREMİUM TTS SERVİSİ (Google Cloud)           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const GOOGLE_TTS_API_KEY = "AIzaSyAC-dYdfkhQnITm8E1Ejf9nj9vKL803_q0"; // From cloudTranslationService

/**
 * Google Cloud Text-to-Speech REST API using Neural2/WaveNet voices
 * More realistic and human-like than Web Speech API.
 */
export async function getPremiumVoice(text, lang = "TR") {
    if (!text || text.trim().length < 1) return null;

    // Language and Voice Mapping (Neural / WaveNet)
    const langConfig = {
        TR: { code: "tr-TR", voiceName: "tr-TR-Wavenet-E" },   // More realistic Male Narrator
        EN: { code: "en-US", voiceName: "en-US-Neural2-F" },  // Higher quality Neural
        RU: { code: "ru-RU", voiceName: "ru-RU-Wavenet-D" },  // Natural Russian
        DE: { code: "de-DE", voiceName: "de-DE-Wavenet-F" },  // Natural German
    };

    const config = langConfig[lang] || langConfig.TR;

    try {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: text },
                voice: {
                    languageCode: config.code,
                    name: config.voiceName,
                    ssmlGender: lang === "EN" || lang === "RU" || lang === "DE" ? "FEMALE" : "MALE"
                },
                audioConfig: {
                    audioEncoding: "MP3",
                    pitch: -0.5, // Subtle depth
                    speakingRate: 0.92 // Natural pace
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Premium TTS API Error:", err);
            return null;
        }

        const data = await response.json();
        if (data && data.audioContent) {
            // Return base64 audio URI
            return `data:audio/mp3;base64,${data.audioContent}`;
        }

        return null;
    } catch (error) {
        console.error("Premium TTS Connection Error:", error);
        return null;
    }
}
