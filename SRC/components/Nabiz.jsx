import { motion } from 'framer-motion';
import { NAR_GOLD, NAR_ASH, CARD_BG, USE_MOCK_NABIZ } from '../constants';
import { getMockNabizCards, MOCK_FESTIVAL } from '../constants/mockData';
import TypewriterText from './TypewriterText';

/** V4.2/V4.3 Üçlü Heyet: Mock modda statik veri (kota yok); yoksa saate/tarihe göre. */
export function getNabizCards() {
  if (USE_MOCK_NABIZ) return getMockNabizCards();

  const now = new Date();
  const h = now.getHours();
  const d = now.getDate();
  const m = now.getMonth();
  const cards = [];

  /* Kahin Update: Saat 15:00 civarı — Kahve ve Dopamin Dengesi, Erasta/Özdilek, daktilo */
  if (h >= 14 && h < 16) {
    cards.push({
      id: 'kahve',
      type: 'heyet-kahve',
      icon: '☕',
      title: 'Saat 15:00: Kahve ve Dopamin Dengesi',
      subtitle: 'Erasta veya ÖzdilekPark civarındaysan, liyakatli bir mola zamanı.',
      teşhis: 'Teşhis: Akut Kafein Eksikliği.',
      eczane: [
        { name: 'Starbucks Coffee - ErastaPark', distance: '1 km', query: 'Starbucks ErastaPark Antalya' },
        { name: 'Starbucks Coffee - ÖzdilekPark', distance: '1.7 km', query: 'Starbucks ÖzdilekPark Antalya' },
      ],
      reçete: 'Bir White Chocolate Mocha ve o beklediğin Cheesecake. "Bu bir harcama değil, ruhsal bir kalibrasyondur."',
      cta: 'En Yakın Eczane (Kahve)',
      useTypewriter: true,
    });
  }

  /* Culture Hub: 23-25 Şubat — Cam Piramit Nar Festivali + Zülfü Livaneli, kristal görseller */
  if (m === 1 && d >= 23 && d <= 25) {
    cards.push({ ...MOCK_FESTIVAL });
  }

  /* Red Code: Gece 00:00 sonrası — nöbetçi eczane + acil yol yardım */
  if (h >= 0 && h < 5) {
    cards.push({
      id: 'kirmizi',
      type: 'heyet-redcode',
      icon: '🌙',
      title: 'Gece 00:00: Kırmızı Kod Departmanı',
      subtitle: 'Gece yarısından sonra Nar Rehberi "Kırmızı Kod" birimi nöbette.',
      teşhis: null,
      reçete: 'Yolda kaldıysan sistem en yakın yetkiliyi yönlendirir. Nöbetçi eczane ve acil yol yardım aşağıda.',
      nöbetçi: [
        { district: 'Kepez', name: 'Deva Eczanesi', address: 'Kültür Mah. Hürriyet Bulv.', query: 'Deva Eczanesi Kepez Antalya' },
        { district: 'Muratpaşa', name: 'Yiğit Eczanesi', address: 'Nöbetçi', query: 'Yiğit Eczanesi Muratpaşa Antalya' },
        { district: 'Muratpaşa', name: 'Barınaklar Eczanesi', address: 'Nöbetçi', query: 'Barınaklar Eczanesi Antalya' },
      ],
      acilReçete: true,
      yolYardim: { label: 'Acil Yol Yardım', tel: '05321234567', query: 'acil yol yardım çekici Antalya' },
      cta: 'Ruhsal Triyaj: Bir sorun varsa yaz; asistan "Acil Reçete"yi hemen yazar.',
    });
  }

  return cards;
}

export function NabizCard({ card }) {
  const openMaps = (query) => window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query), '_blank');
  const openTel = (tel) => window.open('tel:' + tel, '_self');
  const cardClass = ['recepte-kart', 'nabiz-kart', 'nabiz-kart-heyet']
    .concat(card.type === 'heyet-culture' ? ['nabiz-kart-culture'] : [])
    .concat(card.type === 'heyet-redcode' ? ['nabiz-kart-redcode'] : [])
    .concat(card.type === 'heyet-kahve' ? ['nabiz-kart-kahve'] : [])
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={cardClass}
      style={{ backgroundColor: CARD_BG }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="nabiz-icon" aria-hidden>{card.icon}</span>
      <h3 className="nabiz-title" style={{ color: NAR_GOLD }}>
        {card.useTypewriter ? (
          <TypewriterText text={card.title} speed={52} onComplete={() => {}} />
        ) : (
          card.title
        )}
      </h3>
      {card.subtitle && <p className="kart-metin nabiz-subtitle">{card.subtitle}</p>}
      {card.teşhis && <p className="kart-metin nabiz-teshis">{card.teşhis}</p>}
      {card.reçete && <p className="kart-metin nabiz-recete">{card.reçete}</p>}

      {card.images && card.images.length > 0 && (
        <div className="nabiz-festival-images">
          {card.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.alt || ''} className="nabiz-festival-img" loading="lazy" />
          ))}
        </div>
      )}

      {card.eczane && (
        <div className="nabiz-eczane">
          <p className="kart-metin nabiz-eczane-label" style={{ color: NAR_GOLD }}>{card.cta}</p>
          {card.eczane.map((e) => (
            <button key={e.name} type="button" className="btn-cta btn-cta-secondary nabiz-eczane-btn" onClick={() => openMaps(e.query)}>
              {e.name} ({e.distance})
            </button>
          ))}
        </div>
      )}

      {card.event && (
        <div className="nabiz-event">
          <p className="kart-metin nabiz-event-title" style={{ color: NAR_GOLD }}>{card.event.title}</p>
          <p className="kart-metin">{card.event.text}</p>
          <button type="button" className="btn-cta btn-cta-secondary" onClick={() => openMaps(card.event.query)}>{card.event.cta}</button>
        </div>
      )}

      {card.nöbetçi && (
        <div className="nabiz-nobetci">
          <p className="kart-metin" style={{ color: NAR_ASH }}>Nöbetçi Eczane Teşhisi:</p>
          {card.nöbetçi.map((n) => (
            <button key={n.name + n.district} type="button" className="btn-cta btn-cta-secondary nabiz-nobetci-btn" onClick={() => openMaps(n.query)}>
              {n.district}: {n.name} — {n.address}
            </button>
          ))}
        </div>
      )}

      {card.yolYardim && (
        <div className="nabiz-yol-yardim">
          <a href={`tel:${card.yolYardim.tel || '05300000000'}`} style={{ display: 'block', width: '100%' }}>
            Acil Yol Yardım
          </a>
        </div>
      )}
    </motion.div>
  );
}
