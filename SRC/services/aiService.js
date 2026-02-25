/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     NAR REHBERİ — KAHİN MOTORU v2                              ║
 * ║     src/services/aiService.js                                   ║
 * ║                                                                  ║
 * ║     500+ İşletme Altyapısı                                      ║
 * ║     Üyelik: PLATINUM · GOLD · BRONZE                            ║
 * ║     Ticari Alan: paytr_id · netgsm_logs · leads_count           ║
 * ║     Sıralama: distance × nar_secimi_skoru ağırlıklı               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── ÜYELİK SEVİYESİ AĞIRLIKLARI ─────────────────────────────────────────────

export const UYELIK_AGIRLIGI = {
    PLATINUM: 1.00,   // Tam ağırlık
    GOLD:     0.75,
    BRONZE:   0.45,
  };
  
  // ─── KATEGORİLER ─────────────────────────────────────────────────────────────
  
  export const KATEGORILER = {
    GASTRONOMI:    { etiket: "Gastronomi",       renk: "#D4AF37" },
    GURME_DURAK:   { etiket: "Gurme Duraklar",   renk: "#c07840" },
    USTA_HIZMET:   { etiket: "Usta / Hizmet",    renk: "#4080c0" },
    SANAT_KULTUR:  { etiket: "Sanat & Kültür",   renk: "#4caf7d" },
    GECE_HAYATI:   { etiket: "Gece Hayatı",      renk: "#a070d0" },
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
  
  export const VENUES = [
  
    // ═══════════════════════════════════════════
    // GASTRONOMI
    // ═══════════════════════════════════════════
  
    {
      id: "g_seraser",
      ad: "Seraser Fine Dining",
      kategori: "GASTRONOMI", uyelik: "PLATINUM", aktif: true,
      adres: "Kaleiçi, Hesapçı Sk. No:37, Antalya",
      lat: 36.8847, lng: 30.7066,
      telefon: "902423473490",
      description: "Osmanlı konağının avlusunda, Akdeniz'in seçkin içdenizlerinden ilham alan menüsüyle şehrin tartışmasız zirvesi. Rezervasyon zorunlu.",
      nar_secimi_skoru: 98,
      intentTags: ["yemek", "romantik", "akşam yemeği", "özel", "fine dining", "restoran", "lüks", "sofra", "pasta", "şef"],
      type: "venue",
      paytr_id: "PTR_10001", leads_count: 214,
      netgsm_logs: [
        { tip: "REZERVASYON_ONAY", mesaj: "Rezervasyonunuz onaylandı. Seraser, 20:30.", tarih: "2025-03-20T18:00:00" },
        { tip: "LEAD_BILDIRIMI",   mesaj: "Yeni müşteri yönlendirmesi: Kadir Y.", tarih: "2025-03-19T14:22:00" },
      ],
    },
    {
      id: "g_vanilla",
      ad: "Vanilla Lounge",
      kategori: "GASTRONOMI", uyelik: "GOLD", aktif: true,
      adres: "Şirinyalı Mah. Atatürk Blv., Antalya",
      lat: 36.8691, lng: 30.7204,
      telefon: "902423000501",
      description: "Akdeniz mutfağının modern yorumu. Cam cepheli salonunda şehir manzarasıyla kusursuz bir öğle molası deneyimi.",
      nar_secimi_skoru: 88,
      intentTags: ["yemek", "öğle", "mola", "modern", "restoran", "manzara"],
      type: "venue",
      paytr_id: "PTR_10002", leads_count: 97,
      netgsm_logs: [
        { tip: "LEAD_BILDIRIMI", mesaj: "Yeni yönlendirme: Elena S.", tarih: "2025-03-18T12:10:00" },
      ],
    },
    {
      id: "g_hasanaga",
      ad: "Hasanağa Restaurant",
      kategori: "GASTRONOMI", uyelik: "GOLD", aktif: true,
      adres: "Kaleiçi, Antalya",
      lat: 36.8838, lng: 30.7075,
      telefon: "902423241800",
      description: "Tarihi Kaleiçi'nin kalbinde otantik Türk mutfağı. Turist rehberlerinin gizli tuttuğu o lokal lezzet.",
      nar_secimi_skoru: 85,
      intentTags: ["türk mutfağı", "geleneksel", "kaleiçi", "otantik", "yemek", "restoran"],
      type: "venue",
      paytr_id: "PTR_10003", leads_count: 143,
      netgsm_logs: [],
    },
    {
      id: "g_portofinno",
      ad: "Porto Fino İtalian",
      kategori: "GASTRONOMI", uyelik: "BRONZE", aktif: true,
      adres: "Lara Mah., Antalya",
      lat: 36.8621, lng: 30.7389,
      telefon: "902423000600",
      description: "Napoli geleneğini Akdeniz'e taşıyan pizza ve makarna ustası.",
      nar_secimi_skoru: 76,
      intentTags: ["pizza", "italyan", "makarna", "lara", "yemek"],
      type: "venue",
      paytr_id: "PTR_10004", leads_count: 61,
      netgsm_logs: [],
    },
  
    // ═══════════════════════════════════════════
    // GURME DURAKLAR
    // ═══════════════════════════════════════════
  
    {
      id: "gd_petra",
      ad: "Petra Roasting Co.",
      kategori: "GURME_DURAK", uyelik: "PLATINUM", aktif: true,
      adres: "Sinan Mah. Haşim İşcan Cd., Antalya",
      lat: 36.8902, lng: 30.6971,
      telefon: "902423000111",
      description: "Üçüncü nesil kahve kültürünün Antalya'daki tek gerçek temsilcisi. Tek-köken çekirdekleri yerinde kavuran bu atölye sabah ritüelinizi seremoni düzeyine taşır.",
      nar_secimi_skoru: 96,
      intentTags: ["kahve", "sabah", "üçüncü nesil", "specialty", "espresso", "flat white", "çalışma", "laptop", "atölye"],
      type: "venue",
      paytr_id: "PTR_20001", leads_count: 389,
      netgsm_logs: [
        { tip: "LEAD_BILDIRIMI", mesaj: "Yeni yönlendirme: Sarah J.", tarih: "2025-03-21T09:05:00" },
        { tip: "LEAD_BILDIRIMI", mesaj: "Yeni yönlendirme: Marco R.", tarih: "2025-03-21T10:14:00" },
      ],
    },
    {
      id: "gd_moka",
      ad: "Moka Atelier",
      kategori: "GURME_DURAK", uyelik: "GOLD", aktif: true,
      adres: "Meltem Mah., Antalya",
      lat: 36.8811, lng: 30.6893,
      telefon: "902423000112",
      description: "Şehrin gürültüsünden arınmış, cam cepheli bu atölye sessizlik arayanlar için seçilmiş bir sığınak. Öğle molalarında izole bir lezzet deneyimi.",
      nar_secimi_skoru: 88,
      intentTags: ["kahve", "sessiz", "sakin", "öğle", "mola", "çalışma"],
      type: "venue",
      paytr_id: "PTR_20002", leads_count: 167,
      netgsm_logs: [],
    },
    {
      id: "gd_dondurmaci",
      ad: "Maraş Ustası Dondurma",
      kategori: "GURME_DURAK", uyelik: "BRONZE", aktif: true,
      adres: "Muratpaşa, Antalya",
      lat: 36.8845, lng: 30.7021,
      telefon: "902423000220",
      description: "Kuzey'den gelen kakao çiçeği sakızıyla hazırlanan dondurma, şehrin en sık tekrar ziyaret edilen lezzet durağı.",
      nar_secimi_skoru: 79,
      intentTags: ["dondurma", "tatlı", "çocuk", "aile", "yaz", "sokak yemeği"],
      type: "venue",
      paytr_id: "PTR_20003", leads_count: 44,
      netgsm_logs: [],
    },
  
    // ═══════════════════════════════════════════
    // USTA / HİZMET
    // ═══════════════════════════════════════════
  
    {
      id: "h_elite_cilingir",
      ad: "Elite Çilingir – 7/24 VIP",
      kategori: "USTA_HIZMET", uyelik: "PLATINUM", aktif: true,
      adres: "Merkez, Antalya (Mobil)",
      lat: 36.8969, lng: 30.7133,
      telefon: "905327000001",
      description: "Şehrin en hızlı yanıt süresine sahip, lisanslı ustalardan oluşan bu ekip ortalama 12 dakikada kapınızda. 7/24 kesintisiz, VIP müşterilere öncelikli sıralama.",
      nar_secimi_skoru: 95,
      intentTags: ["çilingir", "kilit", "acil", "kapı", "araba kapısı", "hizmet", "kilitli", "7/24"],
      type: "venue",
      paytr_id: "PTR_30001", leads_count: 528,
      netgsm_logs: [
        { tip: "REZERVASYON_ONAY", mesaj: "Ustamız 12 dk içinde yerinde olacak.", tarih: "2025-03-20T22:14:00" },
        { tip: "LEAD_BILDIRIMI",   mesaj: "Yeni çağrı: Ayşe K.", tarih: "2025-03-20T22:10:00" },
      ],
    },
    {
      id: "h_prestige_oto",
      ad: "Prestige Oto Yol Yardım",
      kategori: "USTA_HIZMET", uyelik: "GOLD", aktif: true,
      adres: "Lara Bulvarı, Antalya",
      lat: 36.8752, lng: 30.7401,
      telefon: "905327000002",
      description: "Akü, lastik, çekici — tek bir çağrıda tüm araç acilleri için elite müdahale hattı.",
      nar_secimi_skoru: 90,
      intentTags: ["araba", "oto", "lastik", "akü", "çekici", "yol yardım", "benzin", "motor"],
      type: "venue",
      paytr_id: "PTR_30002", leads_count: 302,
      netgsm_logs: [
        { tip: "LEAD_BILDIRIMI", mesaj: "Yeni yönlendirme: Hans M.", tarih: "2025-03-17T16:40:00" },
      ],
    },
    {
      id: "h_su_tesisatci",
      ad: "Antalya Su & Tesisat Ustası",
      kategori: "USTA_HIZMET", uyelik: "GOLD", aktif: true,
      adres: "Kepez, Antalya",
      lat: 36.9102, lng: 30.6888,
      telefon: "905327000010",
      description: "Su tesisatı, kombi bakımı ve acil müdahale hizmetlerinde şehrin en güvenilir ustası. Pazar dahil 7/24.",
      nar_secimi_skoru: 86,
      intentTags: ["tesisat", "su", "musluk", "boru", "kombi", "ısıtma", "kaçak"],
      type: "venue",
      paytr_id: "PTR_30003", leads_count: 189,
      netgsm_logs: [],
    },
    {
      id: "h_elektrik_usta",
      ad: "Volt Elektrik Ustası",
      kategori: "USTA_HIZMET", uyelik: "BRONZE", aktif: true,
      adres: "Muratpaşa, Antalya",
      lat: 36.8901, lng: 30.7055,
      telefon: "905327000020",
      description: "Elektrik arızaları, komple tesisat ve sigorta sorunları için lisanslı usta.",
      nar_secimi_skoru: 78,
      intentTags: ["elektrik", "sigorta", "arıza", "kablo", "aydınlatma", "usta"],
      type: "venue",
      paytr_id: "PTR_30004", leads_count: 94,
      netgsm_logs: [],
    },
  
    // ═══════════════════════════════════════════
    // SANAT & KÜLTÜR
    // ═══════════════════════════════════════════
  
    {
      id: "sk_othello",
      ad: "Othello — Antalya Devlet Tiyatrosu",
      kategori: "SANAT_KULTUR", uyelik: "PLATINUM", aktif: true,
      adres: "Haşim İşcan Kültür Merkezi, Antalya",
      lat: 36.8912, lng: 30.6978,
      telefon: "902423241600",
      description: "Shakespeare'in kıskançlık üzerine yazdığı bu kara şiir, bu akşam Türkiye'nin en güçlü yorumuyla sahneye çıkıyor. Perdeler kapanmadan bu deneyimi kaçırmak bir kayıptır.",
      nar_secimi_skoru: 97,
      intentTags: ["tiyatro", "sinopsis", "sahne", "oyun", "othello", "shakespeare", "kültür", "sanat", "gösteri", "etkinlik"],
      type: "event",
      paytr_id: "PTR_40001", leads_count: 231,
      netgsm_logs: [
        { tip: "LEAD_BILDIRIMI", mesaj: "Yeni bilet sorgusu: Elena S.", tarih: "2025-03-20T15:00:00" },
      ],
    },
    {
      id: "sk_sergi_dijital",
      ad: "Dijital Anılar — Atatürk Müzesi",
      kategori: "SANAT_KULTUR", uyelik: "GOLD", aktif: true,
      adres: "Atatürk Evi Müzesi, Antalya",
      lat: 36.8834, lng: 30.7089,
      telefon: "902423241700",
      description: "Arşiv fotoğrafları ve dijital enstalasyonların iç içe geçtiği bu sergi, şehrin kolektif hafızasını bir odaya sığdırıyor. Ücretsiz giriş.",
      nar_secimi_skoru: 85,
      intentTags: ["sergi", "müze", "kültür", "sanat", "dijital", "fotoğraf", "tarih", "ücretsiz", "etkinlik"],
      type: "event",
      paytr_id: "PTR_40002", leads_count: 89,
      netgsm_logs: [],
    },
    {
      id: "sk_cam_piramit",
      ad: "Cam Piramit Kitap Fuarı",
      kategori: "SANAT_KULTUR", uyelik: "GOLD", aktif: true,
      adres: "Cam Piramit AVM, Antalya",
      lat: 36.8774, lng: 30.7112,
      telefon: "902423000800",
      description: "Yılın en büyük kitap buluşması. 200+ yayınevi, imza günleri ve edebiyat söyleşileri. Bu hafta sonu son gün.",
      nar_secimi_skoru: 82,
      intentTags: ["kitap", "fuar", "yazar", "okuma", "edebiyat", "kültür", "etkinlik", "cam piramit"],
      type: "event",
      paytr_id: "PTR_40003", leads_count: 56,
      netgsm_logs: [],
    },
  
    // ═══════════════════════════════════════════
    // GECE HAYATI
    // ═══════════════════════════════════════════
  
    {
      id: "gh_360_bar",
      ad: "The 360 Rooftop Bar",
      kategori: "GECE_HAYATI", uyelik: "PLATINUM", aktif: true,
      adres: "Şirinyalı Mah., Antalya",
      lat: 36.8659, lng: 30.7182,
      telefon: "902423000222",
      description: "Antalya silüetinin tamamını gören bu çatı katında masterbarmen ekolünden imza kokteyller sizi bekliyor. Günün yorgunluğunu atmak için şehrin en elite çıkış noktası.",
      nar_secimi_skoru: 93,
      intentTags: ["kokteyl", "bar", "akşam", "gece", "içki", "yorgunluk", "çıkış", "eğlence", "rooftop", "manzara"],
      type: "venue",
      paytr_id: "PTR_50001", leads_count: 276,
      netgsm_logs: [
        { tip: "REZERVASYON_ONAY", mesaj: "Masanız hazır. The 360, 22:00.", tarih: "2025-03-21T19:30:00" },
      ],
    },
    {
      id: "gh_kaledaki",
      ad: "Kaledaki Club",
      kategori: "GECE_HAYATI", uyelik: "GOLD", aktif: true,
      adres: "Kaleiçi, Antalya",
      lat: 36.8851, lng: 30.7061,
      telefon: "902423000300",
      description: "Tarihi Kaleiçi surlarının içinde, canlı DJ performansları ve Akdeniz rüzgarıyla açık hava partilerinin adresi.",
      nar_secimi_skoru: 87,
      intentTags: ["club", "dj", "dans", "parti", "gece", "eğlence", "müzik", "kaleiçi"],
      type: "venue",
      paytr_id: "PTR_50002", leads_count: 154,
      netgsm_logs: [],
    },
    {
      id: "gh_liman_bar",
      ad: "Liman Bistro & Bar",
      kategori: "GECE_HAYATI", uyelik: "BRONZE", aktif: true,
      adres: "Yat Limanı, Antalya",
      lat: 36.8871, lng: 30.6948,
      telefon: "902423000400",
      description: "Yatlara bakan terasta canlı akustik müzik. Rahat atmosfer, seçkin şarap listesi.",
      nar_secimi_skoru: 80,
      intentTags: ["bar", "bistro", "şarap", "akustik", "liman", "terasa", "gece"],
      type: "venue",
      paytr_id: "PTR_50003", leads_count: 88,
      netgsm_logs: [],
    },
  ];
  
  // ─── SEÇİM MOTORU ────────────────────────────────────────────────────────────
  
  function intentTokenize(query) {
    const SINONIM = {
      "kapım kilitli": "çilingir", "bir şeyler içmek": "kokteyl",
      "yemek yemek": "yemek", "tiyatroya git": "tiyatro",
      "kahvalti": "kahve", "caffe": "kahve", "cafe": "kahve",
      "restaurant": "restoran",
    };
    let q = query.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [k, v] of Object.entries(SINONIM)) q = q.replace(k, v);
    return q.split(/\s+/).filter(t => t.length > 1);
  }
  
  function scoreVenue(venue, tokens, userLat, userLng) {
    if (!venue.aktif) return null;
  
    const eslesen = tokens.filter(t =>
      venue.intentTags.some(tag => tag.includes(t) || t.includes(tag))
    ).length;
  
    if (eslesen === 0) return null;
  
    // Intent skoru (0-100)
    const intentScore = Math.min(eslesen * 22, 100);
  
    // Üyelik çarpanı
    const uyelikCarpan = UYELIK_AGIRLIGI[venue.uyelik] ?? 0.4;
  
    // Nar Seçimi skoru (üyelik ağırlıklı)
    const liyakatScore = venue.nar_secimi_skoru * uyelikCarpan;
  
    // Mesafe skoru (0-100): 0 km = 100p, 10 km = 0p
    let mesafeScore = 50;
    if (userLat != null && userLng != null) {
      const km = haversineKm(userLat, userLng, venue.lat, venue.lng);
      mesafeScore = Math.max(0, 100 - km * 10);
    }
  
    // Ağırlıklı final skor
    // %45 intent · %35 liyakat(üyelik ağırlıklı) · %20 mesafe
    const finalScore =
      intentScore  * 0.45 +
      liyakatScore * 0.35 +
      mesafeScore  * 0.20;
  
    return { venue, finalScore, km: userLat != null
      ? haversineKm(userLat, userLng, venue.lat, venue.lng) : null };
  }
  
  // ─── ANA FONKSİYON ──────────────────────────────────────────────────────────
  
  /**
   * @param {string} query       Kullanıcı serbest metin
   * @param {{ lat: number, lng: number } | null} coords GPS
   * @param {{ kategori?: string, uyelik?: string }} filtreler Opsiyonel filtre
   * @returns {Promise<ResultObject | null>}
   */
  export async function routeAndProcess(query, coords = null, filtreler = {}) {
    if (!query || query.trim().length < 2) return null;
  
    await dusun();
  
    const tokens = intentTokenize(query);
    if (tokens.length === 0) return null;
  
    const userLat = coords?.lat ?? null;
    const userLng = coords?.lng ?? null;
  
    let havuz = VENUES;
  
    // Opsiyonel filtreler
    if (filtreler.kategori) havuz = havuz.filter(v => v.kategori === filtreler.kategori);
    if (filtreler.uyelik)   havuz = havuz.filter(v => v.uyelik   === filtreler.uyelik);
  
    const skorlar = havuz
      .map(v => scoreVenue(v, tokens, userLat, userLng))
      .filter(Boolean)
      .sort((a, b) => b.finalScore - a.finalScore);
  
    if (skorlar.length === 0) return null;
  
    const { venue, km } = skorlar[0];
  
    return {
      ad:          venue.ad,
      kategori:    venue.kategori,
      adres:       venue.adres,
      description: venue.description,
      telefon:     venue.telefon,
      lat:         venue.lat,
      lng:         venue.lng,
      type:        venue.type,
      uyelik:      venue.uyelik,
      mesafe_km:   km ? km.toFixed(1) : null,
      leads_count: venue.leads_count,
    };
  }
  
  /**
   * Toplu sıralama — Master Admin ve analitik için
   * @returns Skorlanmış venue listesi (tek sonuç değil)
   */
  export function topluSirala(query, coords = null, limit = 10) {
    const tokens = intentTokenize(query);
    const userLat = coords?.lat ?? null;
    const userLng = coords?.lng ?? null;
  
    return VENUES
      .map(v => scoreVenue(v, tokens, userLat, userLng))
      .filter(Boolean)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit)
      .map(({ venue, finalScore, km }) => ({ ...venue, finalScore, km }));
  }