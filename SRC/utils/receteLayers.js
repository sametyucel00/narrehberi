/**
 * Ortak reçete katmanı üreticileri — ajanlar ve orkestra tarafından kullanılır.
 */
import { getTimeBasedRecipe } from '../components/KahinEngine';
import { MOCK_STARBUCKS, MOCK_RED_CODE } from '../constants/mockData';

export function getCultureTescilLayers(nabizCards) {
  const cultureCards = (nabizCards || []).filter(
    (c) => c.type === 'heyet-culture' || c.id === 'festival' || c.event
  );
  if (cultureCards.length === 0) {
    return {
      layers: [
        { label: 'Teşhis', text: 'Teşhis: Şehirde bu hafta kayıtlı kültür etkinliği bulunamadı.' },
        { label: 'Reçete', text: 'Reçete: Devlet Tiyatroları ve Nar Festivali takvimini kontrol edin. Yakında Nazım Hikmet Kongre Merkezi etkinlikleri açılacaktır.' },
      ],
    };
  }
  const card = cultureCards[0];
  const teşhis = card.teşhis || `Teşhis: ${card.title}. ${card.subtitle || ''}`;
  let reçete = card.reçete || card.subtitle || '';
  if (card.event) {
    reçete = `Reçete: ${card.event.title}. ${card.event.text || ''} ${card.event.cta ? `— ${card.event.cta}` : ''}`;
  } else if (!reçete.startsWith('Reçete:')) {
    reçete = `Reçete: ${reçete}`;
  }
  return {
    layers: [
      { label: 'Teşhis', text: teşhis },
      { label: 'Reçete', text: reçete },
    ],
  };
}

export function getKahveTescilLayers(nabizCards) {
  const card = (nabizCards || []).find((c) => c.id === 'kahve' || c.type === 'heyet-kahve') || MOCK_STARBUCKS;
  const teşhis = card.teşhis || 'Teşhis: Akut Kafein Eksikliği.';
  const venueNames = (card.eczane || []).map((e) => e.name);
  const uygunMekan = venueNames[0] || 'Starbucks Coffee - ErastaPark';
  const reçete = card.reçete
    ? `${card.reçete} Onaylandı: En uygun mekân — ${uygunMekan}.`
    : `Reçete: White Chocolate Mocha ve uygun mola. Onaylandı: En uygun mekân — ${uygunMekan}.`;
  return {
    layers: [
      { label: 'Teşhis', text: teşhis },
      { label: 'Reçete', text: reçete },
    ],
  };
}

export function getRedCodeTescilLayers(nabizCards) {
  const card = (nabizCards || []).find((c) => c.id === 'kirmizi' || c.type === 'heyet-redcode') || MOCK_RED_CODE;
  const teşhis = card.teşhis || card.subtitle || 'Gece yarısından sonra Nar Rehberi "Kırmızı Kod" birimi nöbette.';
  const nobetciLines = (card.nöbetçi || []).map((n) => `${n.district}: ${n.name} — ${n.address}`).join('. ');
  const yolYardim = card.yolYardim
    ? `Acil Yol Yardım: ${card.yolYardim.tel}. `
    : '';
  const reçete = `${card.reçete || 'Nöbetçi eczane ve acil yol yardım aşağıda.'} Nöbetçi eczaneler: ${nobetciLines}. ${yolYardim}`;
  return {
    layers: [
      { label: 'Teşhis', text: teşhis },
      { label: 'Reçete', text: reçete },
    ],
  };
}

export function getTescilZamanLayers(nabizCards, location) {
  const recipe = getTimeBasedRecipe(location);
  const h = new Date().getHours();
  let reçete = recipe.reçete || '';
  if (h >= 0 && h < 5) {
    const card = (nabizCards || []).find((c) => c.id === 'kirmizi') || MOCK_RED_CODE;
    const nobetci = (card.nöbetçi || []).map((n) => `${n.name} (${n.district})`).join(', ');
    const yol = card.yolYardim ? `Acil Yol Yardım: ${card.yolYardim.tel}` : '';
    reçete = `${reçete} Nöbetçi eczaneler: ${nobetci}. ${yol}`;
  } else if (h >= 14 && h < 18) {
    const card = (nabizCards || []).find((c) => c.id === 'kahve') || MOCK_STARBUCKS;
    const uygun = (card.eczane && card.eczane[0]?.name) ? card.eczane[0].name : 'Starbucks Coffee - ErastaPark';
    reçete = `${reçete} Onaylandı: En uygun mekân — ${uygun}.`;
  }
  return {
    layers: [
      { label: null, text: recipe.message || recipe.text },
      { label: 'Reçete', text: reçete },
    ],
  };
}

export function getTimeBasedLayers(location) {
  const recipe = getTimeBasedRecipe(location);
  return {
    layers: [
      { label: null, text: recipe.message || recipe.text },
      ...(recipe.reçete ? [{ label: 'Reçete', text: recipe.reçete }] : []),
    ],
  };
}
