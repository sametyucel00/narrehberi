/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — KAHİN MOTORU v2                              ║
 * ║     src/services/aiService.js                                   ║
 * ║     VENUES: src/data/venues.js (Mekan Veritabanı v4)            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */



// ─── ÜYELİK SEVİYESİ AĞIRLIKLARI ─────────────────────────────────────────────

export const UYELIK_AGIRLIGI = {
  PLATINUM: 1.00,   // Tam ağırlık
  GOLD: 0.75,
  BRONZE: 0.45,
};

// ─── KATEGORİLER ─────────────────────────────────────────────────────────────

/** Standart kategoriler (venues.js ile birebir aynı) */
export const KATEGORILER = {
  GASTRONOMI: { etiket: "Gastronomi / Gurme", renk: "#D4AF37" },
  USTA_HIZMET: { etiket: "Usta / Hizmet", renk: "#4080c0" },
  SAGLIK_GUZELLIK: { etiket: "Sağlık & Güzellik", renk: "#a070d0" },
  SANAT_KULTUR: { etiket: "Sanat & Kültür", renk: "#4caf7d" },
};

// ─── YARDIMCI: HAVERSINE ─────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── YARDIMCI: YAPAY GECİKME ─────────────────────────────────────────────────

const dusun = () => new Promise(r => setTimeout(r, 1500 + Math.random() * 600));

// ─── LİYAKAT HAVUZU ─────────────────────────────────────────────────────────
//
// Şema:
// {
//   id, ad, kategori, uyelik, aktif,
//   adres, lat, lng, telefon, description,
//   nar_secimi_skoru,        // 0-100, editoryal puan
//   intentTags,           // intent eşleşme anahtar kelimeleri
//   type,                 // "venue" | "event"
//   // Ticari alanlar:
//   paytr_id,             // PayTR entegrasyon ID'si
//   leads_count,          // yönlendirilen müşteri sayısı
//   netgsm_logs,          // son SMS logu array'i
// }

// ─── SEÇİM MOTORU ────────────────────────────────────────────────────────────

/** Yemek adı / türü araması: tam eşleşme yoksa GASTRONOMI liyakat listesi için kullanılır */
const YEMEK_ANAHTAR_KELIMELERI = [
  "doner", "döner", "tost", "kokorec", "kebap", "kebab", "lahmacun", "pide", "pizza",
  "makarna", "corba", "çorba", "pilav", "kuru", "fasulye", "mercimek", "borek", "börek",
  "kahvalti", "kahve", "cay", "çay", "tatli", "tatlı", "baklava", "kunefe", "künefe",
  "sütlac", "sutlac", "dondurma", "sandvic", "sandviç", "hamburger", "pasta", "kek",
  "balik", "balık", "izgara", "kofte", "köfte", "sac", "tandir", "tandır", "gözleme",
  "menemen", "sucuk", "pastirma", "pastırma", "lokum", "restoran", "cafe", "caffe",
  "yemek", "lezzet", "acik", "açık", "büfe", "bufe", "lokanta", "esnaf", "ocakbasi", "ocakbaşı",
];
function normalizeQuery(q) {
  return (q || "").toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function isYemekAramasi(query) {
  const n = normalizeQuery(query);
  if (n.length < 2) return false;
  const kelimeler = n.split(/\s+/);
  return kelimeler.some(k =>
    YEMEK_ANAHTAR_KELIMELERI.some(y => k.includes(y) || y.includes(k))
  );
}

/** Arama kelimesi → kategori: usta/tesisat/çilingir vb. USTA_HIZMET ile eşleşsin */
const ARAMA_KELIME_KATEGORI = {
  usta: "USTA_HIZMET", tesisat: "USTA_HIZMET", tesisatci: "USTA_HIZMET", çilingir: "USTA_HIZMET", cilingir: "USTA_HIZMET",
  tamir: "USTA_HIZMET", servis: "USTA_HIZMET", teknik: "USTA_HIZMET", elektrik: "USTA_HIZMET", boya: "USTA_HIZMET",
  insaat: "USTA_HIZMET", inşaat: "USTA_HIZMET", mimar: "USTA_HIZMET", tadilat: "USTA_HIZMET", montaj: "USTA_HIZMET",
  "su kaçak": "USTA_HIZMET", musluk: "USTA_HIZMET", klima: "USTA_HIZMET",
};

function intentTokenize(query) {
  const SINONIM = {
    "kapım kilitli": "çilingir", "bir şeyler içmek": "kokteyl",
    "yemek yemek": "yemek", "tiyatroya git": "tiyatro",
    "kahvalti": "kahve", "caffe": "kahve", "cafe": "kahve",
    "restaurant": "restoran",
    "tesisatçı": "tesisat", "tesisatci": "tesisat", "su kaçağı": "tesisat",
  };
  let q = normalizeQuery(query);
  for (const [k, v] of Object.entries(SINONIM)) q = q.replace(normalizeQuery(k), v);
  return q.split(/\s+/).filter(t => t.length > 1);
}

function scoreVenue(venue, tokens, userLat, userLng) {
  if (!venue.aktif) return null;

  const adNorm = (venue.ad || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tagMatch = tokens.filter(t =>
    venue.intentTags && venue.intentTags.some(tag => tag.includes(t) || t.includes(tag))
  ).length;
  const adMatch = tokens.filter(t => adNorm.includes(t)).length;
  // Sadece ad veya intentTags'ta arama kelimesi geçenlere puan; kategori tek başına puan vermez (tesisat'ta ilgisiz USTA çıkmasın)
  const eslesen = tagMatch + (adMatch > 0 ? adMatch * 2 : 0);

  if (eslesen === 0) return null;

  // Intent skoru (0-100): ad ve kategori eşleşmesi de dahil
  const intentScore = Math.min(eslesen * 18, 100);

  // Üyelik çarpanı
  const uyelikCarpan = UYELIK_AGIRLIGI[venue.uyelik] ?? 0.4;

  // Nar Seçimi skoru (üyelik ağırlıklı)
  const liyakatScore = (venue.nar_secimi_skoru ?? 50) * uyelikCarpan;

  // Mesafe skoru (0-100): 0 km = 100p, 10 km = 0p
  let mesafeScore = 50;
  if (userLat != null && userLng != null && venue.lat != null && venue.lng != null) {
    const km = haversineKm(userLat, userLng, venue.lat, venue.lng);
    mesafeScore = Math.max(0, 100 - km * 10);
  }

  // Ağırlıklı final skor
  const finalScore =
    intentScore * 0.45 +
    liyakatScore * 0.35 +
    mesafeScore * 0.20;

  return {
    venue, finalScore, km: userLat != null && venue.lat != null
      ? haversineKm(userLat, userLng, venue.lat, venue.lng) : null
  };
}

/** Usta/tesisat araması fallback: USTA_HIZMET liyakat + mesafe sıralı */
function ustaFallbackSiralama(havuz, userLat, userLng) {
  return havuz
    .filter(v => v.aktif && v.kategori === "USTA_HIZMET")
    .map(v => ({
      venue: v,
      km: userLat != null && v.lat != null ? haversineKm(userLat, userLng, v.lat, v.lng) : null,
      nar_secimi_skoru: v.nar_secimi_skoru ?? 50,
    }))
    .sort((a, b) => {
      if (b.nar_secimi_skoru !== a.nar_secimi_skoru) return b.nar_secimi_skoru - a.nar_secimi_skoru;
      if (a.km != null && b.km != null) return a.km - b.km;
      return 0;
    });
}

/** Yemek araması fallback: GASTRONOMI liyakat (nar_secimi_skoru) + mesafe sıralı */
function yemekFallbackSiralama(havuz, userLat, userLng) {
  return havuz
    .filter(v => v.aktif && v.kategori === "GASTRONOMI")
    .map(v => ({
      venue: v,
      km: userLat != null && v.lat != null ? haversineKm(userLat, userLng, v.lat, v.lng) : null,
      nar_secimi_skoru: v.nar_secimi_skoru ?? 50,
    }))
    .sort((a, b) => {
      if (b.nar_secimi_skoru !== a.nar_secimi_skoru) return b.nar_secimi_skoru - a.nar_secimi_skoru;
      if (a.km != null && b.km != null) return a.km - b.km;
      return 0;
    });
}

// ─── ANA FONKSİYON ──────────────────────────────────────────────────────────

/**
 * @param {string} query       Kullanıcı serbest metin
 * @param {{ lat: number, lng: number } | null} coords GPS
 * @param {{ kategori?: string, uyelik?: string }} filtreler Opsiyonel filtre
 * @param {Array} venuesList   Mekan Listesi (Firestore'dan gelen liveVenues)
 * @returns {Promise<ResultObject | null>}
 */
export async function routeAndProcess(query, coords = null, filtreler = {}, venuesList = []) {
  if (!query || query.trim().length < 2) return null;

  await dusun();

  const tokens = intentTokenize(query);
  const userLat = coords?.lat ?? null;
  const userLng = coords?.lng ?? null;

  let havuz = venuesList && venuesList.length > 0 ? venuesList : [];
  if (filtreler.kategori) havuz = havuz.filter(v => v.kategori === filtreler.kategori);
  if (filtreler.uyelik) havuz = havuz.filter(v => v.uyelik === filtreler.uyelik);

  let skorlar = havuz
    .map(v => scoreVenue(v, tokens, userLat, userLng))
    .filter(Boolean)
    .sort((a, b) => b.finalScore - a.finalScore);

  // Tam eşleşme yoksa: yemek adı aranıyorsa GASTRONOMI liyakat sıralı listele
  if (skorlar.length === 0 && isYemekAramasi(query)) {
    const fallback = yemekFallbackSiralama(havuz, userLat, userLng);
    if (fallback.length === 0) return null;
    const { venue, km } = fallback[0];
    return {
      ad: venue.ad,
      kategori: venue.kategori,
      adres: venue.adres,
      description: venue.description,
      telefon: venue.telefon,
      lat: venue.lat,
      lng: venue.lng,
      type: venue.type,
      uyelik: venue.uyelik,
      mesafe_km: km != null ? km.toFixed(1) : null,
      leads_count: venue.leads_count,
    };
  }

  if (skorlar.length === 0) return null;

  const { venue, km } = skorlar[0];
  return {
    ad: venue.ad,
    kategori: venue.kategori,
    adres: venue.adres,
    description: venue.description,
    telefon: venue.telefon,
    lat: venue.lat,
    lng: venue.lng,
    type: venue.type,
    uyelik: venue.uyelik,
    mesafe_km: km ? km.toFixed(1) : null,
    leads_count: venue.leads_count,
  };
}

/**
 * Toplu sıralama — Master Admin ve analitik için
 */
function isUstaAramasi(query) {
  const n = normalizeQuery(query);
  const kelimeler = n.split(/\s+/);
  return kelimeler.some(k => Object.prototype.hasOwnProperty.call(ARAMA_KELIME_KATEGORI, k));
}

export function topluSirala(query, coords = null, limit = 10, venuesList = []) {
  const tokens = intentTokenize(query);
  const userLat = coords?.lat ?? null;
  const userLng = coords?.lng ?? null;

  const currentVenues = venuesList && venuesList.length > 0 ? venuesList : [];

  let sonuclar = currentVenues
    .map(v => scoreVenue(v, tokens, userLat, userLng))
    .filter(Boolean)
    .sort((a, b) => b.finalScore - a.finalScore);

  if (sonuclar.length === 0 && isYemekAramasi(query)) {
    const fallback = yemekFallbackSiralama(currentVenues, userLat, userLng)
      .slice(0, limit)
      .map(({ venue, km }) => ({ ...venue, finalScore: venue.nar_secimi_skoru ?? 50, km }));
    return fallback;
  }
  if (sonuclar.length === 0 && isUstaAramasi(query)) {
    const fallback = ustaFallbackSiralama(currentVenues, userLat, userLng)
      .slice(0, limit)
      .map(({ venue, km }) => ({ ...venue, finalScore: venue.nar_secimi_skoru ?? 50, km }));
    return fallback;
  }

  return sonuclar
    .slice(0, limit)
    .map(({ venue, finalScore, km }) => ({ ...venue, finalScore, km }));
}

/**
 * Arama kutusu → vitrin: Sorguya göre en uyumlu mekanları listeler (mesafe + intent).
 * KategoriVitrin bu fonksiyonu searchQuery ile kullanır.
 * @param {string} query Arama metni (örn. "tost")
 * @param {{ lat: number, lng: number } | null} coords Konum
 * @param {number} limit Maksimum sonuç sayısı
 * @returns Skorlanmış venue listesi (her biri: ...venue, finalScore, km)
 */
export function getBestMatch(query, coords = null, limit = 20, venuesList = []) {
  return topluSirala(query, coords, limit, venuesList);
}