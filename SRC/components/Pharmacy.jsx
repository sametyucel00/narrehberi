import { useState } from 'react';
import { NAR_GOLD } from '../constants';
import GoldParticles from './GoldParticles';

export const ECZANE_PILLS = [
  { id: 'cicek', emoji: '🌸', label: 'Çiçek (Duygusal Antibiyotik)', tag: '%25 Nar İndirimi Tanımlandı', url: 'https://www.ciceksepeti.com/', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80' },
  { id: 'taki', emoji: '💍', label: 'Takı/Oyuncak (Bağlılık Serumu)', tag: '%25 Nar İndirimi Tanımlandı', url: 'https://www.zenpirlanta.com/', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
  { id: 'surpriz', emoji: '🎁', label: 'Özel Sürpriz (Mucizevi Doz)', tag: '%25 Nar İndirimi Tanımlandı', url: 'https://www.hepsiburada.com/hediye', imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80' },
];

function EczanePillCard({ pill }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showGoldLoading = pill.imageUrl && (!imgLoaded || imgError);

  return (
    <a href={pill.url} target="_blank" rel="noopener noreferrer" className="recepte-kart eczane-pill">
      <div className="eczane-pill-icon-wrap">
        {showGoldLoading && <GoldParticles active />}
        {pill.imageUrl && !imgError ? (
          <img
            src={pill.imageUrl}
            alt=""
            className="eczane-pill-img"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="pill-emoji">{pill.emoji}</span>
        )}
      </div>
      <span className="pill-label">{pill.label}</span>
      <span className="pill-tag" style={{ color: NAR_GOLD }}>{pill.tag}</span>
    </a>
  );
}

export default function EczaneSection({ typewriterDone, eczanePaid, onEczaneClick }) {
  if (!typewriterDone) return null;
  return (
    <div className="eczane-section">
      {!eczanePaid ? (
        <button type="button" className="btn-cta btn-eczane-gate" onClick={onEczaneClick}>
          TEDAVİ İÇİN ECZANEYE GİT
        </button>
      ) : (
        <div className="eczane-pills eczane-pills-row">
          {ECZANE_PILLS.map((pill) => (
            <EczanePillCard key={pill.id} pill={pill} />
          ))}
        </div>
      )}
    </div>
  );
}
