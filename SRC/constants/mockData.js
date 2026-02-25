/**
 * V4.3 Mock Mode — Statik veri, mesaj kotası harcanmadan daktilo ve kart üretimi.
 * Gemini önerisi: Antalya Nar Festivali, Starbucks Erasta Kafein Reçetesi, Gece Kırmızı Kod.
 * Sonsuz döngü: getMockNabizCards() her zaman bu üç seti döndürür (tarih/saat bağımsız).
 */

/** Antalya Nar Festivali — 23-25 Şubat, Cam Piramit, Zülfü Livaneli (kristal netlikte görseller) */
export const MOCK_FESTIVAL = {
  id: 'festival',
  type: 'heyet-culture',
  icon: '🍎',
  title: 'Anlık Nabız: Cam Piramit Nar Festivali',
  subtitle: '23-25 Şubat. Cam Piramit şu an şehrin en canlı noktası; Zülfü Livaneli ile buluşma.',
  teşhis: 'Herkes orada, sistem senin de yerini almanı öneriyor.',
  event: {
    title: 'Zülfü Livaneli — 60. Sanat Yılı',
    text: 'Kitap fuarı kapsamında 25 Şubat\'ta Nazım Hikmet Kongre Merkezi\'nde. Cam Piramit etkinlik alanı.',
    cta: 'Bu rotayı takvimine "Mühürle"',
    query: 'Nazım Hikmet Kongre Merkezi Antalya',
  },
  cta: null,
  images: [
    { url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=90', alt: 'Cam Piramit etkinlik alanı' },
    { url: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=1200&q=90', alt: 'Nar Festivali' },
    { url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=90', alt: 'Zülfü Livaneli konser sahnesi' },
  ],
};

/** Starbucks Erasta Kafein Reçetesi — Erasta/Özdilek, daktilo ile */
export const MOCK_STARBUCKS = {
  id: 'kahve',
  type: 'heyet-kahve',
  icon: '☕',
  title: 'Saat 15:00: Kahve ve Dopamin Dengesi',
  subtitle: 'Erasta veya ÖzdilekPark civarındaysan, uygun bir mola zamanı.',
  teşhis: 'Teşhis: Akut Kafein Eksikliği.',
  eczane: [
    { name: 'Starbucks Coffee - ErastaPark', distance: '1 km', query: 'Starbucks ErastaPark Antalya' },
    { name: 'Starbucks Coffee - ÖzdilekPark', distance: '1.7 km', query: 'Starbucks ÖzdilekPark Antalya' },
  ],
  reçete: 'Bir White Chocolate Mocha ve o beklediğin Cheesecake. "Bu bir harcama değil, ruhsal bir kalibrasyondur."',
  cta: 'En Yakın Eczane (Kahve)',
  useTypewriter: true,
};

/** Gece Kırmızı Kod — nöbetçi eczane + acil yol yardım */
export const MOCK_RED_CODE = {
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
};

/** Sonsuz döngü: Mock modda her zaman bu üç kartı döndür (tarih/saat kontrolü yok, kota harcanmaz). */
export function getMockNabizCards() {
  return [MOCK_STARBUCKS, MOCK_FESTIVAL, MOCK_RED_CODE];
}
