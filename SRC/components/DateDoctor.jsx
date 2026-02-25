import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAR_GOLD, NAR_ASH, NAR_VOID, CARD_BG, DEV_MODE } from '../constants';
import TypewriterText from './TypewriterText';
import EczaneSection from './Pharmacy';
import RandevuMuhurleme from './Calendar';
import { trackLead } from '../services/LeadService';
import { PRIMARY_PHONE_RAW } from '../constants/Config';

// ——— 12 kademeli matris: 3 adım × 4 seçenek ———
const DATE_DOCTOR_STEPS = [
  { key: 'aim', question: 'Amacınız ne?', options: [
    { id: 'romantic', label: 'Romantik buluşma' }, { id: 'business', label: 'İş yemeği' }, { id: 'friends', label: 'Arkadaş buluşması' }, { id: 'special', label: 'Özel gün kutlaması' },
  ]},
  { key: 'budget', question: 'Bütçe sınırınız?', options: [
    { id: 'low', label: 'Mütevazı' }, { id: 'mid', label: 'Orta segment' }, { id: 'high', label: 'Premium' }, { id: 'elite', label: 'Sınırsız' },
  ]},
  { key: 'vibe', question: 'Vibe nedir?', options: [
    { id: 'quiet', label: 'Sessiz ve sakin' }, { id: 'lively', label: 'Canlı ve enerjik' }, { id: 'intimate', label: 'Samimi ve özel' }, { id: 'view', label: 'Manzara ve atmosfer' },
  ]},
];

const SLOT_ITEM_HEIGHT = 220;
const SLOT_VIEWPORT_HEIGHT = 280;
const VENUE_SLOT_DATA = [
  { id: 'v1', name: 'Nar Elite Çilingir', category: 'Çilingir', imageUrl: 'https://picsum.photos/seed/nar1/800/600' },
  { id: 'v2', name: 'Konyaaltı Teras', imageUrl: 'https://picsum.photos/seed/nar2/800/600' },
  { id: 'v3', name: 'Deniz Köşkü', imageUrl: 'https://picsum.photos/seed/nar3/800/600' },
  { id: 'v4', name: 'Gece Işıkları', imageUrl: 'https://picsum.photos/seed/nar4/800/600' },
  { id: 'v5', name: 'Sahil Paviyonu', imageUrl: 'https://picsum.photos/seed/nar5/800/600' },
  { id: 'v6', name: 'Lara Bahçe', imageUrl: 'https://picsum.photos/seed/nar6/800/600' },
  { id: 'v7', name: 'Kaleiçi Avlu', imageUrl: 'https://picsum.photos/seed/nar7/800/600' },
  { id: 'v8', name: 'Gün Batımı', imageUrl: 'https://picsum.photos/seed/nar8/800/600' },
  { id: 'v9', name: 'Sistem Onaylı', imageUrl: 'https://picsum.photos/seed/nar9/800/600' },
  { id: 'v10', name: 'Nar Rehberi Özel', imageUrl: 'https://picsum.photos/seed/nar10/800/600' },
];

const DEFAULT_VENUE = { id: 'elite-cilingir-yakin', name: 'Nar Elite Çilingir', category: 'Çilingir', location: 'Konyaaltı, Antalya', description: '7/24 Acil Çilingir Hizmeti - Nar Onaylı Elite Usta.', routeId: 'liyakat-sofrasi', lat: 36.8841, lng: 30.7056, venueType: 'venue' };
const NATURE_ROUTE = { name: 'Konyaaltı Sahil / Manzara Noktası', location: 'Konyaaltı, Antalya', description: 'Sahil ve doğa rotası. Fotoğraf ile konum doğrulaması.', routeId: 'konyaalti-sahil', lat: 36.8789, lng: 30.6412, venueType: 'nature' };

/** Mimar Ece'nin Özel Reçetesi kartı */
const ELITE_SCENARIO = {
  architectName: 'Mimar Ece',
  title: "Mimar Ece'nin Özel Reçetesi",
  scenario: 'Saat 20:15. Işığın ve akustiğin uygun olduğu o masada yeriniz ayrıldı. Garsona fısıldamanız gereken şifre: Uygunluk.',
  tips: 'Pencere kenarı masa 7. Gün batımından 20 dk sonra ışık ayarı değişir.',
  note: 'Aşk Mimarı notu: Bu masa için rezervasyon önerilir.',
};

const RECIPE_TEXTS = [
  { id: 1, label: 'İlk Buluşma', aim: 'romantic', budget: 'mid', vibe: 'intimate', teşhis: 'Teşhis: İlk Buluşma Heyecanı / Akut Nabız Yüksekliği.', reçete: 'Reçete: Saat 20:00\'da mekanın loş ışıklı kuzey masasında yeriniz ayrıldı. Göz teması süresi toplam sürenin %60\'ından az olmamalıdır. Tedavi protokolünün tamamlanması için aşağıdaki dozlar zorunludur. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 2, label: 'Özür Protokolü', aim: 'romantic', budget: 'low', vibe: 'quiet', teşhis: 'Teşhis: Akut Özür Eksikliği ve Samimiyet Kırığı.', reçete: 'Reçete: Sessiz, kalabalıktan uzak bir mekânda yüz yüze görüşme zorunludur. Savunma mekanizmaları devre dışı bırakılmalı, dinleme süresi konuşma süresinin en az iki katı olmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 3, label: 'Evlilik Teklifi', aim: 'special', budget: 'high', vibe: 'intimate', teşhis: 'Teşhis: Evlilik Teklifi Stresi / Kusursuz An Arayışı.', reçete: 'Reçete: Sistem tarafından onaylı, özel an için rezerve edilebilir mekân protokolü devreye alınmalıdır. Işık, ses ve zamanlama milimetrik ayarlanmalı; teklif anı dışında kimse rahatsız etmemelidir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 4, label: 'Yıl Dönümü', aim: 'special', budget: 'mid', vibe: 'view', teşhis: 'Teşhis: Yıl Dönümü Rutini / Romantik Disiplin Eksikliği.', reçete: 'Reçete: Alışılagelmiş mekânlardan kaçınılmalı; manzara veya atmosfer odaklı, hatırlanacak bir akşam planlanmalıdır. Sistem onaylı masa ve saat protokolü uygulanmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 5, label: 'İş Yemeği - Mütevazı', aim: 'business', budget: 'low', vibe: 'quiet', teşhis: 'Teşhis: İş Yemeği / Görüşme Disiplini.', reçete: 'Reçete: Sessiz, profesyonel bir ortamda masa ayırımı yapılmalı; konuşma konuları önceden belirlenmeli, süre aşımı yapılmamalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 6, label: 'İş Yemeği - Premium', aim: 'business', budget: 'high', vibe: 'view', teşhis: 'Teşhis: Üst Düzey İş Yemeği / İmaj ve Konfor Dengesi.', reçete: 'Reçete: Manzaralı, prestijli bir mekânda rezervasyon zorunludur. Görüşme süresi ve menü seçimi sistem protokolüne uygun olmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 7, label: 'Arkadaş Buluşması - Canlı', aim: 'friends', budget: 'mid', vibe: 'lively', teşhis: 'Teşhis: Arkadaş Buluşması / Enerji ve Sosyal Doz.', reçete: 'Reçete: Canlı, enerjik bir mekân seçilmeli; masa süresi sınırsız olmamalı, sonraki adım (bar, yürüyüş) planı hazır tutulmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 8, label: 'Arkadaş Buluşması - Sakin', aim: 'friends', budget: 'low', vibe: 'quiet', teşhis: 'Teşhis: Arkadaş Buluşması / Sohbet Odaklı Sakinlik.', reçete: 'Reçete: Sessiz, kalabalıktan uzak bir ortamda derin sohbet protokolü uygulanmalıdır. Telefonlar sessize alınmalı, dinleme oranı yüksek tutulmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 9, label: 'Romantik - Sınırsız Bütçe', aim: 'romantic', budget: 'elite', vibe: 'intimate', teşhis: 'Teşhis: Akut Kararsızlık ve Romantik Disiplin Eksikliği.', reçete: 'Reçete: Sınırsız segmentte heyet onaylı tek masa protokolü devreye alınmalıdır. Işık, çiçek ve servis zamanlaması milimetrik ayarlanmalı; alternatif sunulmaz. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 10, label: 'Özel Gün - Premium', aim: 'special', budget: 'high', vibe: 'intimate', teşhis: 'Teşhis: Özel Gün Kutlaması / Kusursuz An Talebi.', reçete: 'Reçete: Doğum günü, nişan veya benzeri özel gün için özel masa ve sürpriz protokolü uygulanmalıdır. Mekân önceden bilgilendirilmeli, zamanlama sistem tarafından onaylanmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 11, label: 'İlk Buluşma - Sessiz', aim: 'romantic', budget: 'low', vibe: 'quiet', teşhis: 'Teşhis: İlk Buluşma / Sessiz ve Güvenli Ortam İhtiyacı.', reçete: 'Reçete: Kalabalıktan uzak, konuşmanın rahat süreceği bir mekân seçilmeli. Süre 90 dakikayı aşmamalı, sonraki adım net bırakılmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 12, label: 'İlk Buluşma - Manzara', aim: 'romantic', budget: 'mid', vibe: 'view', teşhis: 'Teşhis: İlk Buluşma Heyecanı / Görsel Destek Talebi.', reçete: 'Reçete: Manzara veya atmosfer odaklı bir mekânda kuzey/pencereli masa ayrılmalı. Gün batımı veya akşam ışığı protokolüne uyulmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 13, label: 'İş Yemeği - Orta', aim: 'business', budget: 'mid', vibe: 'quiet', teşhis: 'Teşhis: İş Yemeği / Orta Segment Protokolü.', reçete: 'Reçete: Ne çok resmî ne çok gürültülü bir mekân; masa ayırımı ve süre sınırı konulmalıdır. Görüşme öncesi menü tercihi sistem tarafından önerilir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 14, label: 'Arkadaş - Manzara', aim: 'friends', budget: 'mid', vibe: 'view', teşhis: 'Teşhis: Arkadaş Buluşması / Manzara ve Keyif.', reçete: 'Reçete: Manzaralı bir mekânda uzun sohbet protokolü uygulanabilir. Fotoğraf ve anı biriktirme serbest; süre esnek bırakılabilir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 15, label: 'Özür - Orta Segment', aim: 'romantic', budget: 'mid', vibe: 'intimate', teşhis: 'Teşhis: Özür ve Onarım / Samimiyet Protokolü.', reçete: 'Reçete: Samimi ama kalabalık olmayan bir ortam; çiçek veya küçük jest protokolü isteğe bağlıdır. Dinleme süresi konuşma süresini geçmeli. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 16, label: 'Evlilik Teklifi - Sınırsız', aim: 'special', budget: 'elite', vibe: 'view', teşhis: 'Teşhis: Evlilik Teklifi / Kusursuz An.', reçete: 'Reçete: Özel rezervasyon, özel masa, ışık ve müzik kontrolü sistem tarafından koordine edilir. Teklif anı dışında müdahale yasaktır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 17, label: 'Yıl Dönümü - Sessiz', aim: 'special', budget: 'high', vibe: 'quiet', teşhis: 'Teşhis: Yıl Dönümü / Sessiz Lüks.', reçete: 'Reçete: Sessiz, lüks bir mekânda özel masa; menü önceden seçilmeli, sürpriz detaylar sistem onayına sunulmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 18, label: 'Romantik - Canlı', aim: 'romantic', budget: 'mid', vibe: 'lively', teşhis: 'Teşhis: Romantik Buluşma / Enerjik Atmosfer.', reçete: 'Reçete: Canlı ama özel alan sunan bir mekân; müzik ve ışık dengeli olmalı, masa konuşmaya uygun olmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 19, label: 'İş - Canlı', aim: 'business', budget: 'mid', vibe: 'lively', teşhis: 'Teşhis: İş Yemeği / Dinamik Ortam.', reçete: 'Reçete: Canlı bir mekânda kısa ve net görüşme protokolü; süre aşımı yapılmamalı, sonuç maddeleri not alınmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 20, label: 'Özel Gün - Mütevazı', aim: 'special', budget: 'low', vibe: 'intimate', teşhis: 'Teşhis: Özel Gün / Mütevazı Kutlama.', reçete: 'Reçete: Samimi, küçük bir mekânda sade kutlama; pastane veya kahve protokolü uygulanabilir. Önemli olan niyet ve birlikteliktir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 21, label: 'İlk Buluşma - Canlı', aim: 'romantic', budget: 'high', vibe: 'lively', teşhis: 'Teşhis: İlk Buluşma / Enerjik Başlangıç.', reçete: 'Reçete: Canlı bir mekânda buz kırıcı ortam; süre 2 saati aşmamalı, sonraki randevu netleştirilmelidir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 22, label: 'Arkadaş - Sınırsız', aim: 'friends', budget: 'elite', vibe: 'view', teşhis: 'Teşhis: Arkadaş Buluşması / Lüks Keyif.', reçete: 'Reçete: Manzaralı, lüks bir mekânda uzun keyif protokolü; süre sınırı yok, heyet onaylı masa ayrılır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 23, label: 'Özür - Premium', aim: 'romantic', budget: 'high', vibe: 'quiet', teşhis: 'Teşhis: Özür / Ciddi Onarım Protokolü.', reçete: 'Reçete: Sessiz, lüks bir ortamda yüz yüze görüşme; çiçek veya küçük hediye protokolü uygulanabilir. Savunma kaldırılmalı, dinleme önceliklidir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 24, label: 'Yıl Dönümü - Samimi', aim: 'special', budget: 'mid', vibe: 'intimate', teşhis: 'Teşhis: Yıl Dönümü / Samimi Kutlama.', reçete: 'Reçete: Samimi, özel bir masa; menü ve içecek önceden seçilmeli, sürpriz not veya küçük hediye protokolü önerilir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 25, label: 'Evlilik Teklifi - Orta', aim: 'special', budget: 'mid', vibe: 'view', teşhis: 'Teşhis: Evlilik Teklifi / Orta Segment.', reçete: 'Reçete: Manzaralı, özel hissettiren bir mekânda rezervasyon; teklif anı için köşe masa önerilir. Işık ve zamanlama milimetrik ayarlanmalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 26, label: 'Romantik - Manzara', aim: 'romantic', budget: 'high', vibe: 'view', teşhis: 'Teşhis: Romantik Buluşma / Manzara Odaklı.', reçete: 'Reçete: Manzara veya gün batımı odaklı mekân; masa pencereli veya teras olmalı. Işık değişimine göre zamanlama sistem tarafından belirlenir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 27, label: 'İş - Samimi', aim: 'business', budget: 'high', vibe: 'intimate', teşhis: 'Teşhis: İş Yemeği / Samimi Ama Profesyonel.', reçete: 'Reçete: Özel ama iş odaklı bir ortam; konuşma konuları sınırlı, süre 2 saati aşmamalıdır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 28, label: 'Arkadaş - Samimi', aim: 'friends', budget: 'low', vibe: 'intimate', teşhis: 'Teşhis: Arkadaş Buluşması / Derin Sohbet.', reçete: 'Reçete: Küçük, samimi bir mekânda uzun sohbet; menü ikincil, birliktelik önceliklidir. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 29, label: 'Özel Gün - Canlı', aim: 'special', budget: 'mid', vibe: 'lively', teşhis: 'Teşhis: Özel Gün / Eğlenceli Kutlama.', reçete: 'Reçete: Canlı, kutlama havasında bir mekân; pasta veya özel menü önceden sipariş edilmeli. Süre esnek, keyif protokolü uygulanır. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
  { id: 30, label: 'Genel Protokol', aim: null, budget: null, vibe: null, teşhis: 'Teşhis: Akut Kararsızlık ve Romantik Disiplin Eksikliği.', reçete: 'Reçete: Sistem tarafından seçilen mekân ve saat protokolü uygulanmalıdır. Göz teması, dinleme süresi ve zamanlama kuralları milimetrik takip edilmeli. Aşağıdaki tedavi protokolü milimetrik uygulanmalıdır.' },
];

function getRecipeLiyakatScore(recipe, answers) {
  let score = 0;
  if (recipe.aim && answers.aim === recipe.aim) score += 30;
  if (recipe.budget && answers.budget === recipe.budget) score += 25;
  if (recipe.vibe && answers.vibe === recipe.vibe) score += 25;
  return score;
}

function selectBaşhekimRecipe(answers) {
  let best = RECIPE_TEXTS[0];
  let bestScore = getRecipeLiyakatScore(best, answers);
  for (let i = 1; i < RECIPE_TEXTS.length; i++) {
    const s = getRecipeLiyakatScore(RECIPE_TEXTS[i], answers);
    if (s > bestScore) { bestScore = s; best = RECIPE_TEXTS[i]; }
  }
  return best;
}

/** V7.6 Bütünleşik asistan: buluşma/randevu/yıldönümü sorgularında 12 kademeli matris tescil katmanları */
const DATE_KEYWORDS = /buluşma|randevu|yıldönümü|yildonumu|özel gün|ozel gun|romantik|iş yemeği|is yemegi|arkadaş|arkadas|evlilik teklifi|ilk buluşma|özür|ozur|teklif/i;
const DATE_RECIPE_MAP = [
  { kw: /yıldönümü|yildonumu/, id: 4 }, { kw: /evlilik|teklif/, id: 3 }, { kw: /iş yemeği|is yemegi/, id: 5 },
  { kw: /arkadaş|arkadas/, id: 7 }, { kw: /romantik/, id: 1 }, { kw: /özel gün|ozel gun|doğum günü/, id: 10 },
  { kw: /ilk buluşma|ilk bulusma/, id: 1 }, { kw: /özür|ozur/, id: 2 }, { kw: /buluşma|bulusma|randevu/, id: 1 },
];
export function getDateDoctorTescilLayers(query) {
  if (!DATE_KEYWORDS.test(query)) return null;
  const q = String(query).toLowerCase();
  for (const { kw, id } of DATE_RECIPE_MAP) {
    if (kw.test(q)) {
      const recipe = RECIPE_TEXTS.find((r) => r.id === id) || RECIPE_TEXTS[29];
      return {
        source: 'Date Doctor',
        layers: [
          { label: 'Teşhis', text: recipe.teşhis },
          { label: 'Reçete', text: recipe.reçete },
        ],
      };
    }
  }
  const recipe = RECIPE_TEXTS[29];
  return {
    source: 'Date Doctor',
    layers: [ { label: 'Teşhis', text: recipe.teşhis }, { label: 'Reçete', text: recipe.reçete } ],
  };
}

const TRIAL_LIMIT = 5;
const TRIAL_STORAGE_KEY_PREFIX = 'nar_tadimlik_';
const ARCHITECT_STORAGE_KEY = 'nar_ask_mimari_ece';
const USER_LIYAKAT_KEY = 'nar_user_liyakat';
const GPS_RADIUS_METERS = 120;
const LIYAKAT_POINTS_PER_VERIFY = 15;
const PULSE_COMMENTS_KEY_PREFIX = 'nar_pulse_';
const ELIT_ESIK_ACTIVE = 12;

function getDeviceFingerprint() {
  try {
    let id = localStorage.getItem('nar_device_id');
    if (!id) { id = 'nf_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36); localStorage.setItem('nar_device_id', id); }
    return id;
  } catch { return 'unknown'; }
}

function getTrialCount() {
  try {
    const n = parseInt(localStorage.getItem(TRIAL_STORAGE_KEY_PREFIX + getDeviceFingerprint()), 10);
    return isNaN(n) ? 0 : Math.min(n, TRIAL_LIMIT);
  } catch { return 0; }
}

function setTrialUsed() {
  try {
    const key = TRIAL_STORAGE_KEY_PREFIX + getDeviceFingerprint();
    const cur = getTrialCount();
    if (cur < TRIAL_LIMIT) localStorage.setItem(key, String(cur + 1));
  } catch {}
}

function getTrialUsed() { return getTrialCount() >= TRIAL_LIMIT; }

function getArchitectProfile() {
  try { const raw = localStorage.getItem(ARCHITECT_STORAGE_KEY); if (raw) return JSON.parse(raw); } catch {}
  return { purchaseCount: 0, liyakatPuan: 0 };
}

function incrementArchitectOnPurchase() {
  const p = getArchitectProfile();
  p.purchaseCount += 1;
  p.liyakatPuan += 10;
  try { localStorage.setItem(ARCHITECT_STORAGE_KEY, JSON.stringify(p)); } catch {}
  return p;
}

function addUserLiyakatPoints(points = LIYAKAT_POINTS_PER_VERIFY) {
  try {
    const cur = parseInt(localStorage.getItem(USER_LIYAKAT_KEY), 10) || 0;
    localStorage.setItem(USER_LIYAKAT_KEY, String(cur + points));
    return cur + points;
  } catch { return 0; }
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getPulseComments(routeId) {
  try {
    const raw = localStorage.getItem(PULSE_COMMENTS_KEY_PREFIX + routeId);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-50) : [];
  } catch { return []; }
}

function addPulseComment(routeId, text) {
  const trimmed = String(text).trim().slice(0, 140);
  if (!trimmed) return;
  const comments = getPulseComments(routeId);
  comments.push({ text: trimmed, at: Date.now(), id: 'anon-' + Math.random().toString(36).slice(2, 9) });
  try { localStorage.setItem(PULSE_COMMENTS_KEY_PREFIX + routeId, JSON.stringify(comments.slice(-100))); } catch {}
}

function useRoutePulse(routeId) {
  const [activeCount, setActiveCount] = useState(5);
  const [sealCount, setSealCount] = useState(42);
  const [comments, setComments] = useState(() => getPulseComments(routeId || ''));

  useEffect(() => {
    if (!routeId) return;
    setComments(getPulseComments(routeId));
    const storedActive = parseInt(localStorage.getItem('nar_route_' + routeId + '_active'), 10);
    const storedSeal = parseInt(localStorage.getItem('nar_route_' + routeId + '_seal'), 10);
    if (!isNaN(storedActive)) setActiveCount(storedActive);
    if (!isNaN(storedSeal)) setSealCount(storedSeal);
  }, [routeId]);

  const isOverThreshold = activeCount >= ELIT_ESIK_ACTIVE;
  const incrementSeal = () => {
    setSealCount((n) => {
      const next = n + 1;
      try { localStorage.setItem('nar_route_' + (routeId || '') + '_seal', String(next)); } catch {}
      return next;
    });
  };

  return { activeCount, sealCount, comments, isOverThreshold, setComments, incrementSeal };
}

// ——— Slot makinesi ———
function VenueSlotStrip({ onComplete }) {
  const [landed, setLanded] = useState(null);
  const stripRepeat = 3;
  const stripItems = Array.from({ length: VENUE_SLOT_DATA.length * stripRepeat }, (_, i) => VENUE_SLOT_DATA[i % VENUE_SLOT_DATA.length]);
  const winnerOffset = VENUE_SLOT_DATA.length + Math.floor(Math.random() * VENUE_SLOT_DATA.length);
  const finalY = -(winnerOffset * SLOT_ITEM_HEIGHT - (SLOT_VIEWPORT_HEIGHT / 2 - SLOT_ITEM_HEIGHT / 2));
  const winnerVenue = VENUE_SLOT_DATA[winnerOffset % VENUE_SLOT_DATA.length];

  const handleAnimationComplete = () => {
    setLanded(winnerVenue);
    setTimeout(() => onComplete?.(), 1200);
  };

  if (landed) {
    return (
      <motion.div className="venue-slot-strip venue-slot-landed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <motion.div className="venue-slot-winner" initial={{ scale: 0.95, opacity: 0.8 }} animate={{ scale: 1, opacity: 1, boxShadow: '0 0 40px rgba(201, 162, 77, 0.5), 0 0 80px rgba(201, 162, 77, 0.2)' }} transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}>
          <div className="venue-slot-winner-bg" style={{ backgroundImage: `url(${landed.imageUrl})` }} />
          <div className="venue-slot-winner-band">
            <span className="venue-slot-winner-name" style={{ fontFamily: 'var(--font-heading)', color: NAR_GOLD }}>{landed.name}</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="venue-slot-strip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="venue-slot-viewport" style={{ height: SLOT_VIEWPORT_HEIGHT }}>
        <motion.div className="venue-slot-track" style={{ height: stripItems.length * SLOT_ITEM_HEIGHT }} initial={{ y: 0 }} animate={{ y: finalY }} transition={{ duration: 5, ease: [0.22, 0.61, 0.36, 1] }} onAnimationComplete={handleAnimationComplete}>
          {stripItems.map((venue, i) => (
            <div key={`${venue.id}-${i}`} className="venue-slot-card" style={{ height: SLOT_ITEM_HEIGHT }}>
              <div className="venue-slot-card-bg" style={{ backgroundImage: `url(${venue.imageUrl})` }} />
              <div className="venue-slot-card-band">
                <span className="venue-slot-card-name" style={{ fontFamily: 'var(--font-heading)', color: NAR_GOLD }}>{venue.name}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function BashekimBlock({ recipe, onTypewriterComplete }) {
  const [done, setDone] = useState(false);
  const fullText = `${recipe.teşhis} ${recipe.reçete}`;
  const handleComplete = () => { setDone(true); onTypewriterComplete?.(); };
  return (
    <div className="bashekim-block recepte-kart">
      <p className="bashekim-text kart-metin" style={{ color: NAR_ASH }}>
        {done ? fullText : <TypewriterText text={fullText} speed={32} onComplete={handleComplete} />}
      </p>
    </div>
  );
}

function DualRecipeDisplay({ answers, onRecepteOnayla, hasTrialLeft, onElitePurchase, elitePaid, pulse, onGoreviTamamla, onVerificationSuccess, onRandevuMuhurle }) {
  const [eliteRevealPart, setEliteRevealPart] = useState(0);
  const venue = DEFAULT_VENUE;
  const elite = ELITE_SCENARIO;

  const handleNavigate = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.location)}`, '_blank');

  return (
    <motion.div className="date-doctor-result dual-recipe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="dual-recipe-grid">
        <div className="recepte-kart recipe-standart">
          <h3 className="recipe-standart-title" style={{ color: NAR_GOLD }}>Standart Reçete</h3>
          <p className="kart-metin venue-name">{venue.name}</p>
          <p className="kart-metin venue-location">{venue.location}</p>
          <p className="kart-metin venue-desc">{venue.description}</p>
          {pulse && <LivePulse routeId={venue.routeId} pulse={pulse} />}
          <button type="button" className="btn-cta btn-navigate" onClick={handleNavigate}>Navigasyonu Başlat</button>
          {onGoreviTamamla && <button type="button" className="btn-cta btn-ghost-overlay" style={{ marginTop: 8 }} onClick={() => onGoreviTamamla(venue)}>Görevi Tamamla</button>}
          {onRandevuMuhurle && <button type="button" className="btn-cta" style={{ marginTop: 10 }} onClick={onRandevuMuhurle}>Randevu Mühürle</button>}
        </div>
        <div className="recepte-kart recipe-elite">
          <h3 className="recipe-elite-title" style={{ color: NAR_GOLD }}>{elite.title}</h3>
          <div className={`recipe-elite-content ${elitePaid ? 'revealed' : 'blurred'}`} style={elitePaid ? {} : { filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' }}>
            {!elitePaid ? <p className="kart-metin">Ödeme sonrası senaryo ve Aşk Mimarı notu açılır.</p> : (
              <>
                <p className="kart-metin">{eliteRevealPart >= 1 ? elite.scenario : <TypewriterText text={elite.scenario} speed={36} onComplete={() => setEliteRevealPart(1)} />}</p>
                {eliteRevealPart >= 1 && <p className="kart-tips">{elite.tips}</p>}
                {eliteRevealPart >= 1 && <p className="kart-not">{elite.note}</p>}
              </>
            )}
          </div>
          {pulse && <LivePulse routeId={venue.routeId} pulse={pulse} />}
          {!elitePaid ? <button type="button" className="btn-cta" onClick={() => onElitePurchase?.()}>Reçeteyi Satın Al</button> : (
            <>
              <p className="kart-not">Alternatif sunulmaz.</p>
              {onRandevuMuhurle && <button type="button" className="btn-cta" style={{ marginTop: 8 }} onClick={onRandevuMuhurle}>Randevu Mühürle</button>}
              {onGoreviTamamla && <button type="button" className="btn-cta btn-ghost-overlay" style={{ marginTop: 8 }} onClick={() => onGoreviTamamla(NATURE_ROUTE)}>Doğa rotası doğrula (Fotoğraf)</button>}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VerificationPortal({ target, onSuccess, onClose }) {
  const [step, setStep] = useState('capture');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [captureDone, setCaptureDone] = useState(false);
  const [capturePreview, setCapturePreview] = useState(null);
  const [aiVerifying, setAiVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const isVenue = target?.venueType === 'venue';
  const isNature = target?.venueType === 'nature';

  const getGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) { setGpsError('Tarayıcı konum desteklemiyor.'); return; }
    navigator.geolocation.getCurrentPosition((pos) => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStep('gps_check'); }, () => setGpsError('Konum alınamadı. Lütfen konum iznini açın.'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  const checkGpsAndConfirm = () => {
    if (target?.lat == null || target?.lng == null) return;
    if (!gpsCoords) { getGps(); return; }
    const dist = distanceMeters(gpsCoords.lat, gpsCoords.lng, target.lat, target.lng);
    if (dist > GPS_RADIUS_METERS) { setGpsError(`Konum eşleşmedi. Hedef noktaya ${Math.round(dist)}m uzaktasınız (max ${GPS_RADIUS_METERS}m).`); return; }
    setGpsError(null);
    addUserLiyakatPoints();
    setVerifySuccess(true);
    setStep('comment');
  };

  const handleQrOrPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCapturePreview(reader.result); setCaptureDone(true); if (isNature) { setAiVerifying(true); setTimeout(() => setAiVerifying(false), 1800); } };
    reader.readAsDataURL(file);
  };

  const handleConfirmCapture = () => { if (isNature && !captureDone) return; getGps(); };

  const handleSubmitComment = () => {
    const t = comment.trim().slice(0, 140);
    if (t && target?.routeId) { addPulseComment(target.routeId, t); setCommentSent(true); setTimeout(() => { onSuccess?.(); onClose?.(); }, 800); } else { onSuccess?.(); onClose?.(); }
  };

  return (
    <motion.div className="verification-portal overlay-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <div className="verification-portal-inner">
        <h2 className="overlay-title" style={{ color: NAR_GOLD }}>Uygunluk Kanıtı — Doğrulama</h2>
        <p className="kart-metin">Hedef: {target?.name}. Konum reçete koordinatlarıyla eşleşmeli.</p>
        {step === 'capture' && (
          <>
            {isVenue && (<><p className="kart-metin">Masadaki fiziksel QR kodu okutun veya fotoğrafını yükleyin.</p>
              <label className="btn-cta btn-cta-secondary" style={{ display: 'inline-block', marginTop: 8 }}>QR / Fotoğraf Yükle<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => handleQrOrPhoto(e.target.files?.[0])} /></label></>)}
            {isNature && (<><p className="kart-metin">O anki manzarayı çekip yükleyin. AI Destekli Mekan Fotoğrafı modülüyle doğrulanacak.</p>
              <label className="btn-cta btn-cta-secondary" style={{ display: 'inline-block', marginTop: 8 }}>Fotoğraf Yükle<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => handleQrOrPhoto(e.target.files?.[0])} /></label></>)}
            {capturePreview && (
              <div className="verification-preview">
                <img src={capturePreview} alt="Yüklenen" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'cover' }} />
                {aiVerifying && <p className="kart-metin" style={{ color: NAR_GOLD, marginTop: 8 }}>AI doğrulama yapılıyor...</p>}
                {captureDone && !aiVerifying && <button type="button" className="btn-cta" style={{ marginTop: 12 }} onClick={handleConfirmCapture}>Konumu Doğrula (GPS)</button>}
              </div>
            )}
          </>
        )}
        {step === 'gps_check' && gpsCoords && (<><p className="kart-metin">Konum alındı. Reçete koordinatlarıyla karşılaştırılıyor.</p>{gpsError && <p className="kart-metin" style={{ color: '#c66' }}>{gpsError}</p>}<button type="button" className="btn-cta" onClick={() => checkGpsAndConfirm()}>Doğrulamayı Tamamla</button></>)}
        {step === 'comment' && (
          <><p className="kart-metin" style={{ color: NAR_GOLD }}>Uygunluk Puanı tanımlandı (+{LIYAKAT_POINTS_PER_VERIFY}).</p><p className="kart-metin">Mimar Ece&apos;nin bu rotası hakkında ne düşünüyorsun?</p>
            <textarea className="verification-comment-input" placeholder="Teşhis notu (max 140 karakter)" maxLength={140} value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            <div className="verification-comment-meta">{comment.length}/140</div>
            {commentSent ? <p className="kart-metin" style={{ color: NAR_GOLD }}>Teşekkürler. Nabız yorumu kaydedildi.</p> : <button type="button" className="btn-cta" onClick={handleSubmitComment}>Gönder ve Kapat</button>}
          </>
        )}
        <button type="button" className="btn-cta btn-ghost-overlay" style={{ marginTop: 16 }} onClick={onClose}>İptal</button>
      </div>
    </motion.div>
  );
}

function LivePulse({ routeId, pulse: pulseProp }) {
  const pulseFromHook = useRoutePulse(routeId);
  const pulse = pulseProp ?? pulseFromHook;
  const { activeCount, sealCount, comments, isOverThreshold } = pulse;
  const recentComments = (comments || []).slice(-3).reverse();
  return (
    <div className="live-pulse">
      <div className="live-pulse-stats"><span className="live-pulse-dot" /><span className="live-pulse-text">Şu an bu rotada {activeCount} Elite üye var</span></div>
      <p className="live-pulse-seal kart-metin">Bu reçete bugün {sealCount} kez mühürlendi.</p>
      {isOverThreshold && <p className="live-pulse-warning" style={{ color: NAR_GOLD }}>Yüksek Talep: Gizlilik Koruması Aktif</p>}
      {recentComments.length > 0 && (
        <div className="live-pulse-comments">
          <span className="live-pulse-comments-title">Nabız yorumları</span>
          {recentComments.map((c) => <p key={c.id} className="live-pulse-comment kart-metin">"{c.text}"</p>)}
        </div>
      )}
    </div>
  );
}

export default function TheDateDoctor({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('form');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState('trial');
  const [elitePaid, setElitePaid] = useState(false);
  const [bashekimTypewriterDone, setBashekimTypewriterDone] = useState(false);
  const [eczanePaid, setEczanePaid] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState(null);
  const hasTrialLeft = DEV_MODE || !getTrialUsed();
  const selectedRecipe = phase === 'result' ? selectBaşhekimRecipe(answers) : null;
  const routePulse = useRoutePulse(DEFAULT_VENUE.routeId);

  const currentStep = DATE_DOCTOR_STEPS[step];
  const isLastStep = step === DATE_DOCTOR_STEPS.length - 1;

  const handleSelect = (key, id) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    if (isLastStep) setPhase('loading');
    else setStep((s) => s + 1);
  };

  const handleLoadingComplete = () => {
    if (!hasTrialLeft) { setPhase('payment_required'); setPaymentModalType('trial'); setPaymentModalOpen(true); }
    else { setTrialUsed(); setPhase('result'); }
  };

  const handleElitePurchase = () => { setPaymentModalType('elite'); setPaymentModalOpen(true); };
  const handleElitePaymentConfirm = () => { incrementArchitectOnPurchase(); setElitePaid(true); setPaymentModalOpen(false); };
  const handleEczaneClick = () => { setPaymentModalType('eczane'); setPaymentModalOpen(true); };
  const handleEczanePaymentConfirm = () => { setEczanePaid(true); setPaymentModalOpen(false); };

  const handleGoreviTamamla = (target) => { setVerificationTarget(target || DEFAULT_VENUE); setVerificationOpen(true); };
  const handleVerificationSuccess = () => {
    if (verificationTarget?.routeId) { routePulse.incrementSeal(); routePulse.setComments(getPulseComments(verificationTarget.routeId)); }
  };

  const handleBack = () => {
    if (phase === 'randevu') setPhase('result');
    else if (phase === 'form' && step > 0) setStep((s) => s - 1);
    else if (phase === 'form' && step === 0) onClose?.();
    else if (phase === 'result') onClose?.();
    else if (phase === 'payment_required') onClose?.();
  };

  return (
    <div className="date-doctor-overlay" style={{ backgroundColor: NAR_VOID }}>
      <div className="date-doctor-panel" style={{ backgroundColor: CARD_BG }}>
        <button type="button" className="btn-geri btn-geri-panel" onClick={handleBack} aria-label="Geri">← Geri</button>
        <button type="button" className="date-doctor-close" onClick={onClose} aria-label="Kapat">×</button>

        <div className="date-doctor-scroll" style={{ overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="date-doctor-scroll-inner" style={{ minWidth: 320 }}>
            <AnimatePresence mode="wait">
              {phase === 'form' && currentStep && (
                <motion.div key={step} className="date-doctor-step" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
                  <h2 className="date-doctor-question" style={{ color: NAR_GOLD }}>{currentStep.question}</h2>
                  <div className="date-doctor-options">
                    {currentStep.options.map((opt) => (
                      <button key={opt.id} type="button" className="recepte-kart date-doctor-option" onClick={() => handleSelect(currentStep.key, opt.id)}>
                        <span className="option-label">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'loading' && <VenueSlotStrip onComplete={handleLoadingComplete} />}

              {phase === 'payment_required' && (
                <motion.div className="date-doctor-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="recepte-kart date-doctor-scenario">
                    <p className="kart-metin" style={{ color: NAR_ASH }}>Bu teşhis Elite yetki gerektirir. Tadımlık hakkınız kullanıldı.</p>
                    <button type="button" className="btn-cta" onClick={onClose}>Kapat</button>
                  </div>
                </motion.div>
              )}

              {phase === 'result' && selectedRecipe && (
                <motion.div className="date-doctor-result-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <BashekimBlock recipe={selectedRecipe} onTypewriterComplete={() => setBashekimTypewriterDone(true)} />
                  <EczaneSection typewriterDone={bashekimTypewriterDone} eczanePaid={eczanePaid} onEczaneClick={handleEczaneClick} />
                  <DualRecipeDisplay answers={answers} onRecepteOnayla={() => { setTrialUsed(); onClose?.(); }} hasTrialLeft={hasTrialLeft} onElitePurchase={handleElitePurchase} elitePaid={elitePaid} pulse={routePulse} onGoreviTamamla={handleGoreviTamamla} onVerificationSuccess={handleVerificationSuccess} onRandevuMuhurle={() => setPhase('randevu')} />
                </motion.div>
              )}

              {phase === 'randevu' && <RandevuMuhurleme onBack={() => setPhase('result')} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {paymentModalOpen && (
          <>
            <motion.div className="overlay-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaymentModalOpen(false)} aria-hidden />
            <motion.div className="overlay-panel payment-modal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}>
              <div className="overlay-panel-inner">
                {paymentModalType === 'trial' && (<><h2 className="overlay-title">Bu teşhis Elite yetki gerektirir</h2><p className="overlay-trust">Tadımlık reçeteniz kullanıldı. Devam etmek için Elite üyelik veya tek seferlik ödeme. PayTR entegrasyonu hazırlanıyor.</p><button type="button" className="btn-cta overlay-close" onClick={() => setPaymentModalOpen(false)}>Kapat</button></>)}
                {paymentModalType === 'eczane' && (<><h2 className="overlay-title">Eczane — İlaç Protokolü</h2><p className="overlay-trust">Tedavi için eczaneye giriş yapın. Ödeme tamamlandığında indirimli ilaç (çiçek, takı, özel sürpriz) butonları açılır. PayTR ile güvenli ödeme.</p><button type="button" className="btn-cta" onClick={handleEczanePaymentConfirm}>İlaçlarımı Al</button><button type="button" className="btn-cta btn-ghost-overlay" onClick={() => setPaymentModalOpen(false)}>İptal</button></>)}
                {paymentModalType === 'elite' && (<><h2 className="overlay-title">Elite Reçete — Ödeme</h2><p className="overlay-trust">PayTR ile güvenli ödeme. Ödeme onayı sonrası Mimar Ece&apos;nin senaryosu daktilo ile açılır.</p><button type="button" className="btn-cta" onClick={handleElitePaymentConfirm}>Ödemeyi Onayla</button><button type="button" className="btn-cta btn-ghost-overlay" onClick={() => setPaymentModalOpen(false)}>İptal</button></>)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verificationOpen && verificationTarget && (
          <>
            <motion.div className="overlay-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVerificationOpen(false)} aria-hidden />
            <VerificationPortal target={verificationTarget} onSuccess={handleVerificationSuccess} onClose={() => setVerificationOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
