import { useState } from 'react';
import { motion } from 'framer-motion';
import { NAR_GOLD } from '../constants';
import { sendLuxuryInvite } from './WhatsAppReservation';

/** Antalya randevu mühürleme: çalışma saatleri + ideal romantizm saati (gün batımı öncelikli) */
export const RANDEVU_VENUES = [
  { id: 'liyakat', name: 'Nar Elite Çilingir', category: 'Çilingir', description: '7/24 Acil Çilingir - Nar Onaylı Elite Usta.', workingStart: 12, workingEnd: 23, idealSlots: [18, 19, 20], whatsApp: '902421000001', liyakatNote: 'Lüks segment: smart casual.' },
  { id: 'oldtown', name: 'Old Town Terrace Restaurant', category: 'Romantik Akşam Yemeği', description: "Kaleiçi'nin kalbinde, eşsiz manzara.", workingStart: 18, workingEnd: 24, idealSlots: [19, 20, 21], whatsApp: '902421000002', liyakatNote: 'Akşam yemeği: kıyafet kuralı uygulanır.' },
  { id: 'chiaro', name: 'Chiaro Garden Fish & Steak', category: 'Romantik Akşam Yemeği', description: 'Bahçe atmosferinde lüks deneyim.', workingStart: 12, workingEnd: 23, idealSlots: [19, 20, 21], whatsApp: '902421000003', liyakatNote: 'Lüks segment: resmi-casual.' },
  { id: 'sauvignon', name: 'Sauvignon Restaurant', category: 'Romantik Akşam Yemeği', description: 'Şarap ve gastronomi odaklı elit rota.', workingStart: 18, workingEnd: 24, idealSlots: [20, 21], whatsApp: '902421000004', liyakatNote: 'Elit rota: davet kıyafeti önerilir.' },
  { id: 'tiyatro', name: 'Antalya Devlet Tiyatrosu', category: 'Kültür ve Sanat', description: 'Randevu öncesi/sonrası uygun bir oyun.', workingStart: 10, workingEnd: 22, idealSlots: [19, 20], whatsApp: '902421000005', liyakatNote: 'Kültür reçetesi: biletli giriş.' },
  { id: 'aks', name: 'Antalya Kültür Sanat (AKS)', category: 'Kültür ve Sanat', description: 'Entelektüel buluşma için mühürlü nokta.', workingStart: 10, workingEnd: 20, idealSlots: [14, 15, 18], whatsApp: '902421000006', liyakatNote: 'Şehir merkezi, sergi/etkinlik.' },
];

export default function RandevuMuhurleme({ onBack, userName = 'Nar Rehberi Misafiri' }) {
  const [venueId, setVenueId] = useState(RANDEVU_VENUES[0].id);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sealed, setSealed] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const venue = RANDEVU_VENUES.find((v) => v.id === venueId) || RANDEVU_VENUES[0];
  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const getDaysInMonth = () => {
    const first = new Date(calendarMonth.year, calendarMonth.month, 1);
    const last = new Date(calendarMonth.year, calendarMonth.month + 1, 0);
    const days = [];
    const startPad = first.getDay();
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(calendarMonth.year, calendarMonth.month, d));
    return days;
  };

  const all24Hours = Array.from({ length: 24 }, (_, i) => i);
  const dateStr = selectedDate ? selectedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const timeStr = selectedTime != null ? `${String(selectedTime).padStart(2, '0')}:00` : '';

  const handleOnayla = () => {
    if (!selectedDate || selectedTime == null) return;
    sendLuxuryInvite({
      tarih: dateStr,
      saat: timeStr,
      whatsAppNumber: venue.whatsApp,
    });
    setSealed({ venue, dateStr, timeStr });
  };

  const handleWhatsAppDavetiye = () => {
    const b2c = `Onaylandı. Randevunuz ${venue.name} tarafından onaylandı. Saat ${timeStr}'te sistem sizi bekliyor. — NAR REHBERİ`;
    window.open(`https://wa.me/?text=${encodeURIComponent(b2c)}`, '_blank');
  };

  const prevMonth = () => {
    setCalendarMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }));
  };
  const nextMonth = () => {
    setCalendarMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }));
  };

  if (sealed) {
    return (
      <motion.div className="randevu-muhurleme randevu-davetiye" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="randevu-title" style={{ color: NAR_GOLD }}>Mühürlü Davetiye</h3>
        <div className="randevu-davetiye-card" style={{ borderColor: NAR_GOLD, boxShadow: `0 0 24px ${NAR_GOLD}40` }}>
          <p className="kart-metin davetiye-text">Onaylandı. Randevunuz <strong>{sealed.venue.name}</strong> tarafından onaylandı. Saat <strong>{sealed.timeStr}</strong>&apos;te sistem sizi bekliyor.</p>
          <p className="kart-not">NAR REHBERİ</p>
        </div>
        <p className="kart-metin" style={{ fontSize: '0.8rem', marginTop: 8 }}>Mekana talep WhatsApp ile iletildi. Onay sonrası bu davetiye geçerlidir.</p>
        <button type="button" className="btn-cta" onClick={handleWhatsAppDavetiye}>WhatsApp&apos;ta Paylaş</button>
        <button type="button" className="btn-cta btn-ghost-overlay" style={{ marginTop: 8 }} onClick={onBack}>Reçeteye Dön</button>
      </motion.div>
    );
  }

  const daysInMonth = getDaysInMonth();
  const idealSlots = venue.idealSlots || [18, 19, 20];

  return (
    <motion.div className="randevu-muhurleme" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 className="randevu-title" style={{ color: NAR_GOLD }}>Randevu Mühürleme — Başhekim Onaylı Takvim</h3>
      <p className="kart-metin randevu-subtitle">Tüm aylar ve 24 saat serbest; mekan müsaitliği ve Canlı Nabız ile uyumlu.</p>

      <label className="randevu-label">Mekan</label>
      <select className="randevu-select" value={venueId} onChange={(e) => setVenueId(e.target.value)} style={{ color: NAR_GOLD, borderColor: `${NAR_GOLD}60` }}>
        {RANDEVU_VENUES.map((v) => (
          <option key={v.id} value={v.id}>[{v.category}] {v.name}</option>
        ))}
      </select>
      {venue.liyakatNote && <p className="kart-metin randevu-note" style={{ fontSize: '0.75rem', opacity: 0.85 }}>{venue.liyakatNote}</p>}

      <label className="randevu-label">Tarih — Sonsuz Takvim</label>
      <div className="randevu-calendar-nav">
        <button type="button" className="randevu-nav-btn" onClick={prevMonth} style={{ color: NAR_GOLD }}>←</button>
        <span className="randevu-month-label" style={{ color: NAR_GOLD }}>{monthLabel}</span>
        <button type="button" className="randevu-nav-btn" onClick={nextMonth} style={{ color: NAR_GOLD }}>→</button>
      </div>
      <div className="randevu-calendar randevu-calendar-grid">
        {daysInMonth.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} className="randevu-cal-day pad" />;
          const key = d.toISOString().slice(0, 10);
          const isSelected = selectedDate && selectedDate.toISOString().slice(0, 10) === key;
          return (
            <button
              key={key}
              type="button"
              className={`randevu-cal-day ${isSelected ? 'selected' : ''}`}
              style={isSelected ? { borderColor: NAR_GOLD, color: NAR_GOLD } : {}}
              onClick={() => setSelectedDate(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <label className="randevu-label">Saat — 24 Saat Zaman Çizelgesi (ideal saatler vurgulu)</label>
      <div className="randevu-times randevu-times-24">
        {all24Hours.map((h) => {
          const isIdeal = idealSlots.includes(h);
          const isInWorking = h >= venue.workingStart && h < venue.workingEnd;
          const isSelected = selectedTime === h;
          return (
            <button
              key={h}
              type="button"
              className={`randevu-time-btn ${isSelected ? 'selected' : ''} ${isIdeal ? 'ideal' : ''} ${!isInWorking ? 'muted' : ''}`}
              style={isSelected ? { borderColor: NAR_GOLD, color: NAR_GOLD } : isIdeal ? { borderColor: `${NAR_GOLD}99` } : {}}
              onClick={() => setSelectedTime(h)}
              title={!isInWorking ? 'Mekan kapalı' : ''}
            >
              {String(h).padStart(2, '0')}
            </button>
          );
        })}
      </div>

      <button type="button" className="btn-cta" disabled={!selectedDate || selectedTime == null} onClick={handleOnayla}>
        Talebi Gönder ve Mühürle
      </button>
      <p className="kart-metin" style={{ fontSize: '0.7rem', marginTop: 8 }}>Onayla: Mekanın WhatsApp&apos;ına &quot;Yeni Karar Talebi&quot; düşer; takip milimetrik raporlanır.</p>
      <button type="button" className="btn-cta btn-ghost-overlay" style={{ marginTop: 12 }} onClick={onBack}>Reçeteye Dön</button>
    </motion.div>
  );
}
