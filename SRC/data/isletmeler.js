/**
 * Nar Rehberi Ticari Test Verisi - V12.8 (Primary Data Source)
 * Referans: Antalya merkez 36.8841, 30.7056
 * App.jsx ve VenueDetailCard bu diziyi tek kaynak olarak kullanır.
 */

export const REFERANS_KOORDINAT = { lat: 36.8841, lng: 30.7056 };

export const YAKIN_TEST_ISLETMELER = [
  {
    id: 'elite-cilingir-yakin',
    name: 'Nar Elite Çilingir', // 'ad' yerine 'name' kullanarak standart sağlandı
    subscription: 'ELITE',
    category: 'Çilingir',      // KESİN ÇÖZÜM: 'VenueDetailCard' içindeki listeyle birebir eşleşme
    type: 'service',           // Yedek kontrol için
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    mapsQuery: 'Antalya Çilingir',
    lat: 36.8886,
    lng: 30.7056,
    description: '7/24 Acil Çilingir Hizmeti - Nar Onaylı Elite Usta',
  },
  {
    id: 'premium-kafe-yakin',
    name: 'Nar Premium Kafe',
    subscription: 'PREMIUM',
    category: 'Kafe',
    type: 'venue',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    mapsQuery: 'Antalya Popüler Kafe',
    lat: 36.8841,
    lng: 30.7112,
    description: 'Özel Kavrulmuş Kahveler ve Huzurlu Ortam',
  },
];

export const TEST_ISLETMELER = [...YAKIN_TEST_ISLETMELER];