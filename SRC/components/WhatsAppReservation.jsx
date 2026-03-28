/**
 * V4.5 WhatsApp Lüks Davetiye Mührü — Randevu Mühürle tetiklenince işletmeye giden metin.
 */

/**
 * Liyakat randevusu mesajı (V4.5 mühürlü ton).
 * @param {string} tarih - Örn. "23.02.2026"
 * @param {string} saat - Örn. "20:00"
 * @returns {string} WhatsApp metni
 */
export function buildLuxuryInviteMessage(tarih, saat) {
  return [
    '🏛️ NAR REHBERİ | UYGUNLUK RANDEVUSU',
    '',
    'Sn. İşletme Yetkilisi,',
    '',
    `Sistemimiz, uygunluk puanı en yüksek misafirimiz Kadir USLU için ${tarih} - ${saat} diliminde kurumunuzu reçete etmiştir.`,
    '',
    'Lütfen hazırlıklarınızı elit standartlarımıza göre tamamlayınız.',
    '',
    'Mühür sende.',
  ].join('\n');
}

/**
 * Lüks davetiye metnini işletme WhatsApp numarasına açar.
 * Randevu Mühürle → Talebi Gönder ve Mühürle tıklandığında kullanılır.
 */
export function sendLuxuryInvite({ tarih, saat, whatsAppNumber }) {
  const text = buildLuxuryInviteMessage(tarih || '', saat || '');
  const phone = (whatsAppNumber || '').replace(/\D/g, '');
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
