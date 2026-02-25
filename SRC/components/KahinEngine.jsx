import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NAR_GOLD, CARD_BG } from '../constants';
import TypewriterText from './TypewriterText';
import GoldParticles from './GoldParticles';

/** V9.1 Zaman Motoru — davetkar, insani ton (emredici değil) */
const ZAMAN_MOTORU_MESAJLARI = [
  { start: 0, end: 4, message: 'Şehir sakin. İstersen 24 saat açık güvenli rotalar ve nöbetçi eczane bilgisi burada.', reçete: 'Reçete: Sistem bu saatte 24 saat açık, onaylı güvenli sığınak rotasını öneriyor. En yakın nöbetçi eczane ve acil yol yardım hattı aktiftir.' },
  { start: 4, end: 8, message: 'Şafak öncesi huzur. Bir bardak çay veya sessiz bir kahve iyi gidebilir.', reçete: 'Reçete: Gün ağarmadan önce uygun bir durak — sessiz bir kahve noktası veya 24 saat açık istasyon. Bu bölgede onaylı rota mevcut.' },
  { start: 8, end: 11, message: 'Günün ilk ışıkları. Sabah rutini için uygun kahve ve odak noktaları hazır.', reçete: 'Reçete: Sabah için sistem onaylı mekân — kahve durağı ve odak noktası. Erasta veya ÖzdilekPark civarı onaylı rotada.' },
  { start: 11, end: 14, message: 'Öğle molası zamanı. Sessiz bir ortamda kısa bir mola iyi gelir.', reçete: 'Reçete: Öğle molası için onaylı mekân. Sessiz, profesyonel bir ortamda masa onaylı.' },
  { start: 14, end: 18, message: 'Gün ortası. Bir bardak kahve ve kısa bir nefes konsantrasyonu tazeler.', reçete: 'Reçete: Gün ortası için Kahve ve Dopamin Dengesi. White Chocolate Mocha ve uygun mola noktası onaylandı.' },
  { start: 18, end: 19, message: 'Akşamın eşiğinde. Sessiz bir köşe veya manzaralı bir masa düşünebilirsin.', reçete: 'Reçete: Akşam açılışı için onaylı mekân. Manzara veya atmosfer odaklı masa hazır.' },
  { start: 19, end: 22, message: 'Akşamın nabzı. Sanat, gastronomi ve keyif bir arada. Planını onaylayalım mı?', reçete: 'Reçete: Akşam için onaylı mekân — Nar Elite Çilingir veya Konyaaltı Teras. Saat 20:00 kuzey masası, sanat ve gastronomi kesişimi onaylandı.' },
  { start: 22, end: 24, message: 'Gece sessizliği. Sessiz, loş bir kapanış rotası seni bekliyor.', reçete: 'Reçete: Gece için onaylı mekân. Sessiz, loş ışıklı ve uygun bir kapanış rotası onaylandı.' },
];

function getZamanBand(h) {
  for (const band of ZAMAN_MOTORU_MESAJLARI) {
    if (h >= band.start && h < band.end) return band;
  }
  return ZAMAN_MOTORU_MESAJLARI[0];
}

export function DiagnosisEngine() {
  const h = new Date().getHours();
  const band = getZamanBand(h);
  return { title: 'Zaman Motoru', text: band.message, reçete: band.reçete };
}

export const KAHIN_DACTILO_TITLES = ['Gün Ortası Ritüeli', 'Akşam Reçetesi', 'Gece Teşhisi'];

/** location: konum adı (örn. "Antalya"); mesajın içine eklenir */
export function getTimeBasedRecipe(location) {
  const band = getZamanBand(new Date().getHours());
  let message = band.message;
  if (location && String(location).trim()) {
    message = `Şu an ${String(location).trim()} civarındasın; sistem bu bölge için uygun bir öneri hazırladı. ${message}`;
  }
  return { title: 'Zaman Motoru', text: message, message, reçete: band.reçete };
}

export default function KahinEngine() {
  const [recipe, setRecipe] = useState(() => getTimeBasedRecipe());
  const [cardHover, setCardHover] = useState(false);
  const [buttonFocus, setButtonFocus] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setRecipe(getTimeBasedRecipe()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="recepte-kart"
      style={{ backgroundColor: CARD_BG }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
    >
      <GoldParticles active={cardHover || buttonFocus} />
      <h3>
        {KAHIN_DACTILO_TITLES.includes(recipe.title) ? (
          <TypewriterText text={recipe.title} speed={72} onComplete={() => {}} />
        ) : (
          recipe.title
        )}
      </h3>
      <p className="kart-metin">{recipe.text}</p>
      <p className="kart-not">Alternatif sunulmaz.</p>
      <button
        type="button"
        className="btn-cta"
        onFocus={() => setButtonFocus(true)}
        onBlur={() => setButtonFocus(false)}
      >
        Kararı Uygula
      </button>
    </motion.div>
  );
}
