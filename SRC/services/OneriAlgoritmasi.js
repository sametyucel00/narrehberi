/**
 * V12.0 Hard-Filter Öneri Motoru — Sadece ELITE, PREMIUM, GUMUS; ELITE skor x2.5.
 * V12.2 Beni Şaşırt: subscription !== BRONZ havuzundan tek mekan seçimi.
 * V12.3 Dinamik menzil: walking < 1.5km, driving < 7km; Elite Wall (sadece menzil içi + subscription !== BRONZ).
 */
import { subscriptionWeight, BENI_SASIRT_HAVUZ } from '../models/isletme';
import { haversineMeters } from '../utils/distance';

const ALLOWED_SUBSCRIPTIONS = ['ELITE', 'PREMIUM', 'GUMUS'];
const NON_BRONZ = ['ELITE', 'PREMIUM', 'GUMUS'];

/** V12.3 Menzil (metre): walking max 1.5km, driving max 7km. */
export const RANGE_WALKING_MAX_M = 1500;
export const RANGE_DRIVING_MAX_M = 7000;

/**
 * Sadece ELITE, PREMIUM, GUMUS üyeleri döndürür; ELITE skoruna x2.5 çarpanı uygular.
 * @param {Array<{ id: string, ad: string, subscription?: string, baseSkor?: number }>} isletmeler
 * @returns {Array<{ id: string, ad: string, subscription: string, skor: number }>}
 */
export function filtreleVeSkorla(isletmeler) {
  if (!Array.isArray(isletmeler)) return [];
  return isletmeler
    .filter((i) => ALLOWED_SUBSCRIPTIONS.includes(String(i.subscription || '').toUpperCase()))
    .map((i) => {
      const sub = String(i.subscription || 'GUMUS').toUpperCase();
      const weight = subscriptionWeight[sub] ?? 1;
      const base = Math.min(100, Math.max(0, Number(i.baseSkor) || 50));
      const skor = Math.round(base * weight * 100) / 100;
      return { ...i, subscription: sub, skor };
    })
    .sort((a, b) => (b.skor || 0) - (a.skor || 0));
}

/**
 * V12.3 Menzil + abonelik filtresi: Sadece menzil içinde ve subscription !== BRONZ olan işletmeler.
 * @param {Array<{ lat?: number, lng?: number, subscription?: string }>} isletmeler
 * @param {{ latitude: number, longitude: number }} userCoords
 * @param {'walking'|'driving'} transportMode
 * @returns {Array<{ ...item, distanceMeters: number }>}
 */
export function filterByRangeAndSubscription(isletmeler, userCoords, transportMode = 'walking') {
  if (!userCoords || typeof userCoords.latitude !== 'number' || typeof userCoords.longitude !== 'number') {
    return (isletmeler || []).filter((i) => NON_BRONZ.includes(String(i.subscription || '').toUpperCase()));
  }
  const maxM = transportMode === 'driving' ? RANGE_DRIVING_MAX_M : RANGE_WALKING_MAX_M;
  return (isletmeler || [])
    .filter((i) => NON_BRONZ.includes(String(i.subscription || '').toUpperCase()))
    .map((i) => {
      const lat = i.lat ?? i.latitude;
      const lng = i.lng ?? i.longitude;
      const distanceMeters =
        typeof lat === 'number' && typeof lng === 'number'
          ? haversineMeters(userCoords.latitude, userCoords.longitude, lat, lng)
          : 0;
      return { ...i, distanceMeters };
    })
    .filter((i) => i.distanceMeters <= maxM)
    .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

/**
 * V12.2/V12.3 Beni Şaşırt — Menzil içinde ve subscription !== BRONZ havuzundan bir mekan; Mekan Kartı için.
 * @param {{ latitude: number, longitude: number } | null} userCoords
 * @param {'walking'|'driving'} transportMode
 * @returns {{ venue: { id, name, imageUrl, mapsQuery, subscription }, distanceMeters: number }}
 */
export function getBeniSasirtVenue(userCoords = null, transportMode = 'walking') {
  const pool = filterByRangeAndSubscription(BENI_SASIRT_HAVUZ, userCoords || { latitude: 36.8841, longitude: 30.7056 }, transportMode);
  const fallback = {
    venue: {
      id: 'elite-teras',
      name: 'Elite Teras',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      mapsQuery: 'Elite Teras Konyaaltı Antalya',
      subscription: 'ELITE',
    },
    distanceMeters: 0,
  };
  if (pool.length === 0) return fallback;
  // Menzil filtresi tescil: pool mesafeye göre sıralı (en yakın önce); en yakın işletmeyi önceliklendir.
  const v = pool[0];
  return {
    venue: {
      id: v.id || v.ad,
      name: v.ad || v.name || 'Mekan',
      imageUrl: v.imageUrl || '',
      mapsQuery: v.mapsQuery || `${v.ad || v.name} Antalya`,
      subscription: String(v.subscription || 'GUMUS').toUpperCase(),
    },
    distanceMeters: v.distanceMeters ?? 0,
  };
}
