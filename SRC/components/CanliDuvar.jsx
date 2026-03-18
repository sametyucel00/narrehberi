import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RotatingLogo from "./RotatingLogo";
import { getPremiumVoice } from "../services/ttsService.js";

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.65)";
const TEXT = "rgba(240,234,218,0.95)";
const TEXT_DIM = "rgba(190,178,150,0.72)";
const SERIF = "'Cormorant Garamond','Garamond',serif";
const SANS = "'Jost','Segoe UI',sans-serif";

const LANG_MAP = {
  TR: "tr-TR",
  EN: "en-US",
  RU: "ru-RU",
  DE: "de-DE",
};

export default function CanliDuvar({ data = [], lang = "TR", onKapat }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const currentLang = ["TR", "EN", "RU", "DE"].includes(lang) ? lang : "TR";
  const item = data[activeIndex];

  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, [activeIndex, currentLang]);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis?.cancel();
      if (audioPlayer) audioPlayer.pause();
    };
  }, [audioPlayer]);

  const content = useMemo(() => {
    if (!item) return null;
    return {
      title: item.title?.[currentLang] || item.title?.TR || "",
      subtitle: item.subtitle?.[currentLang] || item.subtitle?.TR || "",
      text: item.text?.[currentLang] || item.text?.TR || "",
    };
  }, [currentLang, item]);

  if (!item || !content) return null;

  const stopPlayback = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  const fallbackSpeech = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(content.text);
    utterance.lang = LANG_MAP[currentLang] || "tr-TR";

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((candidate) => candidate.lang === utterance.lang) ||
      voices.find((candidate) => candidate.lang.startsWith(utterance.lang.split("-")[0]));

    if (voice) utterance.voice = voice;
    utterance.rate = 1.03;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const seslendir = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);

    try {
      const audioUri = await getPremiumVoice(content.text, currentLang);
      if (audioUri) {
        const audio = new Audio(audioUri);
        setAudioPlayer(audio);
        audio.onended = () => {
          setIsPlaying(false);
          setAudioPlayer(null);
        };
        audio.onerror = () => {
          setAudioPlayer(null);
          fallbackSpeech();
        };
        await audio.play();
        return;
      }
    } catch (_) {
      // Premium TTS başarısız olursa Web Speech'e düşüyoruz.
    }

    fallbackSpeech();
  };

  const introText =
    currentLang === "TR"
      ? "Antik Antalya'nın tarihini yapay zeka sesi ve çok dilli anlatımla yeniden görünür kılıyoruz."
      : currentLang === "EN"
        ? "We bring Ancient Antalya back to life with AI voice and multilingual narration."
        : currentLang === "RU"
          ? "Мы заново оживляем историю древней Анталии с помощью голоса ИИ и многоязычного повествования."
          : "Wir machen die Geschichte des antiken Antalya mit KI-Stimme und mehrsprachiger Erzählung wieder sichtbar.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(8,8,14,0.94)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          stopPlayback();
          onKapat?.();
        }
      }}
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: 20,
          border: "1px solid rgba(212,175,55,0.24)",
          background: "linear-gradient(180deg, rgba(18,18,28,0.98), rgba(10,10,15,0.98))",
          color: TEXT,
          boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RotatingLogo size={26} />
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase" }}>
                Canlı Duvar
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT }}>Taşların Hatırladıkları</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopPlayback();
              onKapat?.();
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "1px solid rgba(212,175,55,0.28)",
              background: "transparent",
              color: GOLD,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.28em", color: GOLD_DIM, textTransform: "uppercase" }}>
              Çok Dilli Anlatım
            </div>
            <p style={{ margin: "10px auto 0", maxWidth: 520, fontFamily: SANS, fontSize: 13, lineHeight: 1.7, color: TEXT_DIM }}>
              {introText}
            </p>
          </div>

          <div style={{ borderRadius: 18, border: "1px solid rgba(212,175,55,0.18)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            <div style={{ padding: "28px 22px 18px", textAlign: "center", background: "linear-gradient(180deg, rgba(212,175,55,0.08), transparent)" }}>
              <motion.div key={item.year} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: SERIF, fontSize: 58, color: GOLD }}>
                {item.year}
              </motion.div>
              <motion.div key={content.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontFamily: SERIF, fontSize: 30, color: TEXT }}>{content.title}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: GOLD_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 6 }}>
                  {content.subtitle}
                </div>
              </motion.div>
            </div>

            <div style={{ padding: "0 24px 24px" }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${activeIndex}-${currentLang}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.7, color: TEXT, textAlign: "center", minHeight: 148, margin: 0 }}
                >
                  {content.text}
                </motion.p>
              </AnimatePresence>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
                <button
                  type="button"
                  onClick={seslendir}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    border: `2px solid ${GOLD}`,
                    background: isPlaying ? "rgba(212,175,55,0.14)" : "transparent",
                    color: GOLD,
                    cursor: "pointer",
                    fontSize: 24,
                    boxShadow: isPlaying ? "0 0 24px rgba(212,175,55,0.22)" : "none",
                  }}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", borderTop: "1px solid rgba(212,175,55,0.16)", background: "rgba(0,0,0,0.18)" }}>
              {data.map((step, idx) => (
                <button
                  key={`${step.year}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    flex: 1,
                    padding: "14px 8px",
                    background: "transparent",
                    border: "none",
                    borderBottom: activeIndex === idx ? `3px solid ${GOLD}` : "3px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: activeIndex === idx ? GOLD : "rgba(255,255,255,0.48)" }}>
                    {step.year}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 9, color: TEXT_DIM, marginTop: 4 }}>
                    {(step.title?.TR || "").split(" ")[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
