/**
 * V10.1 Date Doctor Profesörü — Randevu, buluşma, romantik ve özel gün uzmanlığı.
 * Kimlik: İlişki ve zamanlama reçeteleri. Ton: Sıcak, profesyonel, güven veren.
 */
import { getDateDoctorTescilLayers } from '../components/DateDoctor';

const DATE_KEYWORDS = /buluşma|randevu|yıldönümü|yildonumu|özel gün|ozel gun|romantik|iş yemeği|is yemegi|arkadaş|arkadas|evlilik teklifi|ilk buluşma|özür|ozur|teklif/i;

export const DateDoctorIdentity = {
  id: 'datedoctor',
  name: 'Date Doctor Profesörü',
  expertise: 'Randevu, buluşma, romantik ve özel gün reçeteleri',
  tone: 'Sıcak, profesyonel, güven veren',
  signature: 'Date Doctor Profesörü Onayıyla',
};

export function canHandle(query) {
  const q = (query || '').trim();
  if (q.length === 0) return false;
  return DATE_KEYWORDS.test(q);
}

export function processQuery(query, context) {
  context = context || {};
  const layersResult = getDateDoctorTescilLayers(query);
  if (!layersResult || !layersResult.layers) {
    return {
      layers: [
        { label: 'Teşhis', text: 'Teşhis: Sorgu randevu alanına uymadı.' },
        { label: 'Reçete', text: 'Reçete: Randevu veya buluşma ile ilgili bir cümle yazabilirsin.' },
      ],
      signature: DateDoctorIdentity.signature,
    };
  }
  return {
    layers: layersResult.layers,
    signature: DateDoctorIdentity.signature,
  };
}

export default { DateDoctorIdentity, canHandle, processQuery };
