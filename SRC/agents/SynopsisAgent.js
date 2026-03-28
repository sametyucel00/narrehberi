/**
 * V10.1 Sinopsis Profesörü — Kültür, tiyatro, festival, sinopsis uzmanlığı.
 * Kimlik: Şehir yaşamı ve sanat reçeteleri. Ton: Nazik, entelektüel, davetkar.
 */
import { getCultureTescilLayers } from '../utils/receteLayers';

const CULTURE_KEYWORDS = /sanat|tiyatro|festival|kültür|kultur|etkinlik|konser|devlet tiyatrosu|sinopsis/i;

export const SynopsisIdentity = {
  id: 'synopsis',
  name: 'Sinopsis Profesörü',
  expertise: 'Kültür, tiyatro, festival ve şehir yaşamı reçeteleri',
  tone: 'Nazik, entelektüel, davetkar',
  signature: 'Sinopsis Profesörü Onayıyla',
};

export function canHandle(query) {
  const q = (query || '').trim();
  return q.length > 0 && CULTURE_KEYWORDS.test(q);
}

export function processQuery(query, context = {}) {
  const { nabizCards = [] } = context;
  const result = getCultureTescilLayers(nabizCards);
  return {
    layers: result.layers,
    signature: SynopsisIdentity.signature,
  };
}

export default { SynopsisIdentity, canHandle, processQuery };
