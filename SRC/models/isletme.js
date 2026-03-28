/**
 * V12.0 Economic Engine — İşletme modeli, abonelik ve skor ağırlığı.
 */

/** Abonelik kademeleri: sadece ELITE, PREMIUM, GUMUS öneri motoruna girer; BRONZ girmez. */
export const SUBSCRIPTION_TYPES = ['ELITE', 'PREMIUM', 'GUMUS', 'BRONZ'];

/** Abonelik tipine göre skor çarpanı (OneriAlgoritmasi'nda kullanılır). */
export const subscriptionWeight = {
  ELITE: 2.5,
  PREMIUM: 1.5,
  GUMUS: 1.2,
  BRONZ: 1,
};

/**
 * İşletme şeması (örnek alanlar).
 * @typedef {Object} Isletme
 * @property {string} id - businessId
 * @property {string} ad - Mekan adı
 * @property {string} subscription - ELITE | PREMIUM | GUMUS | BRONZ
 * @property {number} [baseSkor] - 0-100
 * @property {string} [imageUrl]
 * @property {string} [mapsQuery]
 */
export function createIsletme(overrides = {}) {
  return {
    id: '',
    ad: '',
    subscription: 'GUMUS',
    baseSkor: 50,
    imageUrl: '',
    mapsQuery: '',
    ...overrides,
  };
}

/** V12.2/V12.3 Beni Şaşırt havuzu — subscription !== BRONZ; lat/lng menzil filtresi için. */
import { YAKIN_TEST_ISLETMELER } from '../data/isletmeler';

const HAVUZ_ISLETMELER = [
  createIsletme({ id: 'elite-teras', ad: 'Elite Teras', subscription: 'ELITE', baseSkor: 85, imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', mapsQuery: 'Elite Teras Konyaalt1 Antalya', lat: 36.8841, lng: 30.7056 }),
  createIsletme({ id: 'deniz-kosk', ad: 'Deniz Köşkü', subscription: 'PREMIUM', baseSkor: 78, imageUrl: 'https://picsum.photos/seed/nar3/800/600', mapsQuery: 'Deniz Köşkü Lara Antalya', lat: 36.8541, lng: 30.7556 }),
  createIsletme({ id: 'gece-isiklari', ad: 'Gece Işıkları', subscription: 'GUMUS', baseSkor: 72, imageUrl: 'https://picsum.photos/seed/nar4/800/600', mapsQuery: 'Gece Işıkları Kaleiçi Antalya', lat: 36.8861, lng: 30.7036 }),
  createIsletme({ id: 'sahil-paviyon', ad: 'Sahil Paviyonu', subscription: 'PREMIUM', baseSkor: 75, imageUrl: 'https://picsum.photos/seed/nar5/800/600', mapsQuery: 'Sahil Paviyonu Konyaaltı Antalya', lat: 36.8789, lng: 30.6412 }),
  createIsletme({ id: 'lara-bahce', ad: 'Lara Bahçe', subscription: 'ELITE', baseSkor: 88, imageUrl: 'https://picsum.photos/seed/nar6/800/600', mapsQuery: 'Lara Bahçe Lara Antalya', lat: 36.8522, lng: 30.7489 }),
];

/** Yakın test verisi (Elite çilingir, Premium kafe ~500m) dahil; menzil filtresi bunları önceliklendirir. */
export const BENI_SASIRT_HAVUZ = [...HAVUZ_ISLETMELER, ...(YAKIN_TEST_ISLETMELER || [])];
