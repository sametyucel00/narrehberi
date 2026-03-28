/**
 * V9.1 Social Memory — Sessiz ama anlamlı bildirimler: bayram, araç vergi, check-up, özel gün.
 * Ana ekranı kapatmaz; tek satır veya kısa liste olarak gösterilebilir.
 */

const BAYRAM_DATES = [
  { name: 'Ramazan Bayramı', month: 3, dayStart: 30 }, // 2025 örnek
  { name: 'Kurban Bayramı', month: 6, dayStart: 6 },
];

const ARAÇ_VERGI_AYLARI = [3, 9]; // Mart ve Eylül
const CHECKUP_REMINDER_DAY = 15; // Ayın 15'i "kontrol zamanı" hatırlatması

function getUpcomingBayram() {
  const now = new Date();
  for (const b of BAYRAM_DATES) {
    const d = new Date(now.getFullYear(), b.month - 1, b.dayStart);
    if (d >= now) {
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      if (diff <= 60) return { text: `${b.name} yaklaşıyor`, days: diff };
    }
  }
  return null;
}

function getAracVergiReminder() {
  const now = new Date();
  const m = now.getMonth() + 1;
  if (ARAÇ_VERGI_AYLARI.includes(m)) {
    const names = { 3: 'Mart', 9: 'Eylül' };
    return { text: `Araç vergisi ${names[m]} ayında`, soft: true };
  }
  const next = ARAÇ_VERGI_AYLARI.find((a) => a > m) || ARAÇ_VERGI_AYLARI[0];
  const names = { 3: 'Mart', 9: 'Eylül' };
  return { text: `Araç vergisi: ${names[next]} ayı hatırlatması`, soft: true };
}

function getCheckupReminder() {
  const now = new Date();
  if (now.getDate() >= CHECKUP_REMINDER_DAY - 3 && now.getDate() <= CHECKUP_REMINDER_DAY + 3) {
    return { text: 'Sağlık kontrolü zamanı gelmiş olabilir', soft: true };
  }
  return null;
}

function getOzelGunPlaceholder() {
  return { text: 'Özel günlerinizi ekleyerek hatırlatma alabilirsiniz', soft: true };
}

/**
 * Sessiz bildirimler listesi. En fazla 2–3 öğe döner; öncelik: bayram > vergi > check-up > özel gün.
 */
export function getSocialMemoryItems() {
  const items = [];
  const bayram = getUpcomingBayram();
  if (bayram) items.push(bayram);
  const vergi = getAracVergiReminder();
  if (vergi) items.push(vergi);
  const checkup = getCheckupReminder();
  if (checkup) items.push(checkup);
  if (items.length < 2) items.push(getOzelGunPlaceholder());
  return items.slice(0, 3);
}
