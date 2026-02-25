/**
 * V10.1 Explorer Profesörü — Mekan keşfi, kahve, gece, Kırmızı Kod, zaman bazlı reçeteler.
 * Kimlik: Şehir rotaları ve anlık ihtiyaç. Ton: Keşifçi, sakin, yol arkadaşı.
 */
import {
  getKahveTescilLayers,
  getRedCodeTescilLayers,
  getTescilZamanLayers,
  getTimeBasedLayers,
} from '../utils/receteLayers';

const KAHVE_KEYWORDS = /kahve|kafe|kafein|mola|espresso|latte|white chocolate mocha/i;
const GECE_KEYWORDS = /gece|kırmızı kod|kirmizi kod|nöbetçi|nobetci|acil eczane|yol yardım|yolda kaldım/i;

export const TESCIL_ZAMAN_QUERY = '__tescil_zaman__';

export const ExplorerIdentity = {
  id: 'explorer',
  name: 'Explorer Profesörü',
  expertise: 'Mekan keşfi, kahve, gece rotaları ve Kırmızı Kod',
  tone: 'Keşifçi, sakin, yol arkadaşı',
  signature: 'Explorer Profesörü Onayıyla',
};

export function canHandle(query) {
  const q = (query || '').trim();
  if (q.length === 0) return false;
  if (q === TESCIL_ZAMAN_QUERY) return true;
  return KAHVE_KEYWORDS.test(q) || GECE_KEYWORDS.test(q);
}

export function processQuery(query, context = {}) {
  const { nabizCards = [], location = null } = context;
  const q = (query || '').trim();

  if (q === TESCIL_ZAMAN_QUERY) {
    const result = getTescilZamanLayers(nabizCards, location);
    return { layers: result.layers, signature: ExplorerIdentity.signature };
  }
  if (KAHVE_KEYWORDS.test(q)) {
    const result = getKahveTescilLayers(nabizCards);
    return { layers: result.layers, signature: ExplorerIdentity.signature };
  }
  if (GECE_KEYWORDS.test(q)) {
    const result = getRedCodeTescilLayers(nabizCards);
    return { layers: result.layers, signature: ExplorerIdentity.signature };
  }
  const result = getTimeBasedLayers(location);
  return { layers: result.layers, signature: ExplorerIdentity.signature };
}

export default { ExplorerIdentity, TESCIL_ZAMAN_QUERY, canHandle, processQuery };
