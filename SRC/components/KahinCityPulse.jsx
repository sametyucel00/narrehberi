import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HaberlerTab from "./HaberlerTab";
import { db } from "../services/firebase";
import { collection, onSnapshot, query, where, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { ANTALYA_ETKINLIK_TAKVIMI_2026 } from "../data/antalyaEtkinlikTakvimi2026";
// AI service import removed as per user request to use static content
// import { askKahinWeb } from "../services/kahinAiService";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  KAHİN ÅEHİR NABZI v4
//  Rehbere Sor = Ticari Yönlendirme Motoru
//  PayTR + NetGSM entegrasyonu hazır
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.65)";
const GOLD_FAINT = "rgba(212,175,55,0.10)";
const TEXT = "rgba(240,234,218,0.90)";
const TEXT_DIM = "rgba(240,234,218,0.45)";
const CARD_BG = "rgba(255,255,255,0.025)";
const CARD_BOR = "rgba(212,175,55,0.09)";
const SERIF = "'Cormorant Garamond','Garamond','Times New Roman',serif";
const SANS = "'Jost','Segoe UI',sans-serif";
const PANEL_BG = "linear-gradient(160deg,#080610 0%,#0e0c1a 45%,#12101f 100%)";
const NETGSM = "0850 302 79 46";

// â”€â”€ PAZAR YERİ / İLANLAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ILAN_KATEGORILERI = [
  { id: "EMLAK", label: "Emlak", sub: "Konut, Arsa, Tarla vb.", icon: "🏠", renk: "#4a9abe" },
  { id: "ARAC", label: "Araç", sub: "Bireysel Satılık/Kiralık", icon: "🚗", renk: "#cc8833" },
  { id: "RENTACAR", label: "Rent A Car", sub: "Kurumsal kiralık araçlar", icon: "🏢", renk: "#6b8e9e" },
  { id: "IS", label: "İş ve Kariyer", sub: "İş arayanlar ve ilanlar", icon: "💼", renk: "#c4a020" },
];

const PAKET_SIRA = { ALTIN: 0, GUMUS: 1, BRONZ: 2, BIREYSEL: 3, STANDART: 3 };

const YASAL_ZIRH_KISA = "Nar Rehberi, alıcı ve satıcıyı buluşturan bağımsız bir rehber platformudur. İşlemlerden doğabilecek hiçbir hukuki veya mali yükümlülüğü kabul etmez. Tüm sorumluluk muhataplara aittir.";

// â”€â”€ SABİT REHBER İÇERİÄİ (Web-Gemini yerine) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const REHBER_ICERIK = [
  {
    id: "EGITIM",
    label: "Eğitim",
    icon: "🎓",
    renk: "#4a9abe",
    sorular: [
      { q: "Özel ders öğretmeni arıyorum", a: "Antalya'da ilkokuldan üniversite hazırlığa kadar birçok branşta özel ders desteği bulunur. Öğretmen seçerken branş deneyimi, öğrenci seviyesiyle uyumu, yüz yüze veya online ders imkânı ve ders programının sürdürülebilir olması mutlaka değerlendirilmelidir." },
      { q: "Spor koçu ve antrenör bilgisi", a: "Kişisel antrenör veya spor koçu desteği; kilo verme, kondisyon artırma, kas geliştirme ya da sağlıklı yaşam hedefleri için tercih edilir. Antalya'da seçim yaparken eğitmenin uzmanlık alanı, çalıştığı salon veya açık alan imkânları, bireysel program hazırlayıp hazırlamadığı ve sakatlık geçmişine uygun planlama yapması önemlidir." },
      { q: "Özel eğitim ve rehabilitasyon", a: "Özel eğitim ve rehabilitasyon hizmetleri; gelişimsel, bilişsel, fiziksel veya dil ve konuşma güçlüğü yaşayan bireylerin potansiyellerini en üst seviyeye çıkarmayı hedefler. Kurum seçiminde uzman kadronun tecrübesi, bireyselleştirilmiş eğitim programları ve ailenin sürece dahil edilmesi kritik rol oynar." }
    ]
  },
  {
    id: "GUZELLIK",
    label: "Güzellik",
    icon: "✨",
    renk: "#d48ab1",
    sorular: [
      { q: "Cilt bakım merkezleri ve uygulamalar", a: "Cilt bakımı, cildin sağlığını korumak ve yaşlanma belirtilerini geciktirmek için düzenli olarak yapılmalıdır. Antalya'daki merkezlerde medikal cilt bakımı, hydrafacial ve anti-aging uygulamalar öne çıkar. Uzman estetisyen kontrolünde, cilt tipine uygun ürünlerle yapılan işlemler en verimli sonucu verir." },
      { q: "Saç tasarım ve bakım trendleri", a: "Saç tasarımı kişisel tarzın en önemli parçasıdır. Gelin saçı, mikro kaynak, profesyonel renklendirme (ombre/balyaj) ve keratin bakımı gibi işlemler için deneyimli kuaför salonları tercih edilmelidir. Kullanılan ürünlerin kalitesi ve salonun hijyen standartları memnuniyet açısından belirleyicidir." },
      { q: "El ve ayak sağlığı (Podoloji)", a: "El ve ayak sağlığı sadece estetik değil, genel sağlık için de önemlidir. Batık tırnak, nasır bakımı ve diyabetik ayak bakımı gibi konular profesyonel podoloji hizmeti gerektirir. Steril ekipman kullanımı ve düzenli periyotlarla yapılan medikal manikür-pedikür uygulamaları sağlığı korur." }
    ]
  },
  {
    id: "HUKUK",
    label: "Hukuk",
    icon: "⚖️",
    renk: "#8e9eab",
    sorular: [
      { q: "Boşanma dalı ve aile hukuku süreçleri", a: "Boşanma süreci; anlaşmalı veya çekişmeli olarak yürütülebilir. Protokol hazırlığı, velayet, nafaka, mal paylaşımı ve tazminat gibi konular uzman bir avukat rehberliğinde titizlikle takip edilmelidir. Hak kaybı yaşamamak adına usul kurallarına ve sürelere uyulması büyük önem taşır." },
      { q: "Gayrimenkul hukuku ve tapu davaları", a: "Gayrimenkul hukuku; tapu iptal ve tescil, izale-i şuyu (ortaklığın giderilmesi), kamulaştırma ve kira tahliye davalarını kapsar. Taşınmazlarla ilgili uyuşmazlıklarda güncel mevzuat takibi ve doğru hukuki strateji, mülkiyet haklarının korunmasını sağlar." },
      { q: "İcra takibi ve borç yapılandırma", a: "Alacakların tahsili için başlatılan icra süreçleri, hem alacaklı hem borçlu açısından hukuki denge gerektirir. İmzaya veya borca itiraz süreleri, haciz işlemleri ve borç yapılandırma imkanları konusunda hukuki destek almak, sürecin sağlıklı yönetilmesini sağlar." }
    ]
  },
  {
    id: "KARIYER",
    label: "İş ve Kariyer",
    icon: "💼",
    renk: "#c4a020",
    sorular: [
      { q: "İnsan kaynakları danışmanlığı", a: "İşletmelerin doğru yeteneğe ulaşması ve verimliliğini artırması için İK danışmanlığı kritik önemdedir. İşe alım süreçleri, bordrolama, performans yönetimi ve çalışan bağlılığı gibi alanlarda profesyonel destek, kurumsal yapının güçlenmesine katkı sağlar." },
      { q: "Mentorluk ve kariyer koçluğu", a: "Kariyer hedeflerine ulaşmak isteyen profesyoneller için mentorluk desteği rehber niteliğindedir.CV hazırlama, mülakat teknikleri, liderlik becerileri ve profesyonel ağ oluşturma konularında alınan koçluk, kariyer basamaklarını daha emin adımlarla çıkmayı sağlar." },
      { q: "Şirket içi eğitim ve gelişim programları", a: "Kurumsal başarının anahtarı, sürekli öğrenen bir ekip yapısıdır. Teknik becerilerin yanı sıra iletişim, zaman yönetimi ve kriz yönetimi gibi yumuşak becerilere (soft skills) yönelik düzenlenen eğitim programları, çalışan motivasyonunu ve şirket performansını yükseltir." }
    ]
  },
  {
    id: "MUHASEBE",
    label: "Mali Müşavir",
    icon: "📊",
    renk: "#6b8e9e",
    sorular: [
      { q: "Şirket kuruluşu ve mali danışmanlık", a: "Yeni bir iş kurarken şahıs, limited veya anonim şirket türlerinden hangisinin uygun olduğunu belirlemek ilk adımdır. Kuruluş sonrası vergi planlaması, muhasebe kayıtlarının tutulması ve yasal beyannamelerin takibi konusunda mali müşavir desteği yasal güvenliğinizi sağlar." },
      { q: "Vergi mevzuatı ve teşvikler", a: "Güncel vergi mevzuatını takip etmek, gereksiz maliyetlerin önüne geçer. Sektörel teşvikler, SGK prim indirimleri, KDV iadesi süreçleri ve yatırım teşvik belgeleri gibi konularda doğru yönlendirme, işletmelerin finansal yapısını optimize eder." },
      { q: "Finansal raporlama ve denetim", a: "İşletme performansının analiz edilmesi için gelir tablosu, bilanço ve nakit akım tablolarının düzenli takibi gerekir. İç denetim ve finansal raporlama hizmetleri, yönetimin doğru kararlar almasına yardımcı olurken, olası risklere karşı erken uyarı sistemi görevi görür." }
    ]
  },
  {
    id: "PSIKOLOJI",
    label: "Psikoloji",
    icon: "🧠",
    renk: "#9b8ec4",
    sorular: [
      { q: "Bireysel terapi ve danışmanlık", a: "Kişisel zorluklar, stres, kaygı veya duygusal süreçlerle başa çıkmak için profesyonel psikolojik destek almak önemlidir. Bilişsel davranışçı terapi veya diğer yöntemlerle yürütülen seanslar, bireyin kendisini tanımasına ve hayat kalitesini artırmasına yardımcı olur." },
      { q: "Aile ve çift danışmanlığı", a: "İlişkilerde yaşanan iletişim sorunları, çatışmalar veya uyum problemleri uzman desteğiyle çözülebilir. Çiftlerin birbirini daha iyi anlaması, sağlıklı sınırların belirlenmesi ve ortak çözüm yolları geliştirilmesi danışmanlık sürecinin temel hedefleridir." },
      { q: "Çocuk ve ergen psikolojisi", a: "Gelişim dönemlerindeki çocuklar ve gençler; sınav kaygısı, uyum sorunları veya davranışsal zorluklar yaşayabilir. Oyun terapisi ve ebeveyn danışmanlığı gibi yöntemlerle bu süreçlerin doğru yönetilmesi, sağlıklı bir gelecek inşasına katkıda bulunur." }
    ]
  },
  {
    id: "SAGLIK",
    label: "Sağlık",
    icon: "🏥",
    renk: "#c05050",
    sorular: [
      { q: "Check-up ve rutin kontroller", a: "Erken teşhis, sağlıklı yaşamın temelidir. Yaş ve cinsiyete uygun periyotlarla yapılan genel check-up taramaları, kan tahlilleri ve görüntüleme yöntemleri olası hastalık risklerini minimize eder. Uzman hekim görüşüyle hazırlanan takip planları sağlığınızı korur." },
      { q: "Beslenme ve diyet danışmanlığı", a: "Sağlıklı kilo yönetimi, sadece fiziksel görünüm için değil, kronik hastalıklardan korunmak için de gereklidir. Kişiye özel beslenme listeleri, kronik hastalıklarda beslenme ve sporcu beslenmesi gibi konularda diyetisyen desteği sürdürülebilir bir yaşam tarzı sunar." },
      { q: "Fizik tedavi ve rehabilitasyon", a: "Kas ve iskelet sistemi rahatsızlıkları, sakatlıklar veya ameliyat sonrası toparlanma süreçlerinde fizik tedavi şarttır. Manuel terapi, tıbbi egzersiz programları ve modern cihaz uygulamaları ile ağrıların azaltılması ve fonksiyonel mobilite artışına odaklanılır." }
    ]
  },
  {
    id: "ALTERNATIF",
    label: "Alternatif Terapi",
    icon: "🌿",
    renk: "#4caf7d",
    sorular: [
      { q: "Yoga ve meditasyon uygulamaları", a: "Zihin ve beden uyumu için yoga ve meditasyon en etkili yöntemler arasındadır. Antalya'da farklı seviyelere uygun grup dersleri veya bireysel seanslar bulunur. Esneklik kazanmak, stres yönetimi ve nefes farkındalığı ile gelen bir iç huzer hedeflenir." },
      { q: "Aromaterapi ve bitkisel destekler", a: "Uçucu yağların şifalı etkilerinden faydalanan aromaterapi; rahatlama, odaklanma ve uyku düzeni için tercih edilir. Doğru kullanılan bitkisel içerikler ve doğal yağlar, yaşam alanlarınıza huzur katarken bedensel zindeliği de destekler." },
      { q: "Nefes çalışmaları ve enerji şifası", a: "Doğru nefes teknikleri, vücuttaki oksijen seviyesini artırırken sinir sistemini yatıştırır. Enerji çalışmaları ve bütünsel terapi yöntemleri, bloke olmuş duyguların açığa çıkmasına ve bedensel-ruhsal dengenin yeniden kurulmasına yardımcı olur." }
    ]
  }
];

// â”€â”€ YARDIMCI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getCleanTel(v) {
  if (!v) return null;
  const t = v.telefon || v.tel;
  if (!t) return null;
  return t; // Completely remove strict check for rendering - let everything show!
}

const getMonth = () => new Date().getMonth() + 1;
const getHour = () => new Date().getHours();
const months = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const EVENT_ICON_BY_CATEGORY = {
  Fuar: "🏛️",
  Konser: "🎵",
  Spor: "🏃",
  Tiyatro: "🎭",
  Festival: "🎉",
};

const MONTH_OPTIONS = [
  { value: 1, label: "Ocak" },
  { value: 2, label: "Şubat" },
  { value: 3, label: "Mart" },
  { value: 4, label: "Nisan" },
  { value: 5, label: "Mayıs" },
  { value: 6, label: "Haziran" },
  { value: 7, label: "Temmuz" },
  { value: 8, label: "Ağustos" },
  { value: 9, label: "Eylül" },
  { value: 10, label: "Ekim" },
  { value: 11, label: "Kasım" },
  { value: 12, label: "Aralık" },
];

const MONTH_LOOKUP = MONTH_OPTIONS.reduce((acc, item) => {
  acc[item.label.toLowerCase()] = item.value;
  return acc;
}, {});

function normalizeMonthValue(value) {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) return value.flatMap(normalizeMonthValue);
  if (typeof value === "number") return [value];
  const raw = String(value).trim();
  if (!raw) return [];
  if (/^\d+$/.test(raw)) return [Number(raw)];
  return raw.split(/[,/|]/).flatMap((part) => {
    const clean = part.trim().toLowerCase();
    if (!clean) return [];
    const direct = MONTH_LOOKUP[clean];
    if (direct) return [direct];
    const match = MONTH_OPTIONS.find((m) => clean.startsWith(m.label.toLowerCase().slice(0, 3)));
    return match ? [match.value] : [];
  });
}

function normalizeEvent(event) {
  if (!event) return null;
  const months = normalizeMonthValue(event.ay || event.month || event.months || event.aylar);
  const sortDate = event.sortDate || event.date || event.tarih_sira || null;
  return {
    ...event,
    ay: months.length ? months : normalizeMonthValue(getMonth()),
    sortDate,
    icon: event.icon || EVENT_ICON_BY_CATEGORY[event.kat] || "✨",
    kategori: event.kategori || event.kat,
  };
}

function getEventMonths(event) {
  const months = normalizeMonthValue(event?.ay || event?.month || event?.months || event?.aylar);
  return months.length ? months : [];
}

function sortEvents(a, b) {
  const ad = String(a?.sortDate || a?.date || a?.tarih || "");
  const bd = String(b?.sortDate || b?.date || b?.tarih || "");
  if (ad !== bd) return ad.localeCompare(bd, "tr");
  return String(a?.isim || "").localeCompare(String(b?.isim || ""), "tr");
}

function parseEventDate(ev) {
  const raw = ev?.sortDate || ev?.date || ev?.tarih || "";
  if (!raw) return null;
  if (raw instanceof Date) return new Date(raw.getTime());
  const str = String(raw).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parsed = new Date(`${str}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dmY = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmY) {
    const [, d, m, y] = dmY;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getEventPriorityLabel(ev, today) {
  const eventDate = parseEventDate(ev);
  if (!eventDate || !today) return null;
  const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Bugün";
  if (diffDays > 0 && diffDays <= 7) return "Bu hafta";
  return null;
}

function mergeEventLists(...lists) {
  const map = new Map();
  lists.flat().forEach((item) => {
    const ev = normalizeEvent(item);
    if (!ev) return;
    const key = [
      String(ev.type || "event"),
      String(ev.sortDate || ev.tarih || ""),
      String(ev.isim || ev.ad || ""),
      String(ev.yer || ev.location || ""),
      String(ev.saat || ""),
    ].join("|").toLowerCase();
    if (!map.has(key)) map.set(key, ev);
  });
  return [...map.values()].sort(sortEvents);
}

function dedupeServiceList(items = []) {
  const map = new Map();
  items.forEach((item) => {
    const key = [
      String(item?.type || "service"),
      String(item?.kat || item?.kategori || ""),
      String(item?.isim || item?.ad || ""),
      String(item?.telefon || item?.tel || ""),
      String(item?.adres || item?.yer || ""),
    ].join("|").toLocaleLowerCase("tr-TR");
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return [...map.values()];
}

function filterEventsByMonth(events, month) {
  const selected = Number(month) || getMonth();
  return (events || []).filter((e) => {
    const months = getEventMonths(e);
    return months.length ? months.includes(selected) : false;
  });
}

function hexToRgb(h) {
  if (!h || h.length < 7) return "212,175,55";
  return `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`;
}

function btnStyle(color, small = false) {
  return {
    display: "inline-flex", alignItems: "center", gap: "4px",
    padding: small ? "4px 9px" : "5px 11px", borderRadius: "3px",
    background: `rgba(${hexToRgb(color)},0.10)`,
    border: `1px solid ${color}45`,
    color, fontSize: small ? "9px" : "10px", fontFamily: SANS,
    letterSpacing: "0.05em", textDecoration: "none",
    cursor: "pointer", transition: "opacity 0.2s", whiteSpace: "nowrap"
  };
}

const getTimeTheme = (h) => {
  if (h >= 5 && h < 9) return { label: "Sabah", gold: GOLD, dim: GOLD_DIM };
  if (h >= 9 && h < 13) return { label: "Öğle", gold: GOLD, dim: GOLD_DIM };
  if (h >= 13 && h < 18) return { label: "İkindi", gold: GOLD, dim: GOLD_DIM };
  if (h >= 18 && h < 22) return { label: "Akşam", gold: "#e8914a", dim: "rgba(232,145,74,0.65)" };
  return { label: "Gece", gold: "#9b8ec4", dim: "rgba(155,142,196,0.65)" };
};

// â”€â”€ ÇEVİRİLER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TRANS_KAHIN = {
  TR: {
    news: "Haberler", events: "Etkinlik ve Takvim", emergency: "Acil ve Hizmetler", ask: "Rehbere Sor",
    listings: "İlanlar", evaluating: "Değerlendiriliyor...", pulse: "ŞEHİR NABZI", all: "Tümü",
    pharmacyTitle: "Nöbetçi Eczane",
    pharmacySub: "İl Sağlık Müdürlüğü resmi listesi", pharmacyBtn: "🌐 Nöbetçi Eczaneleri Gör",
    mapSearch: "Haritada Bul",
    askIntro: "Antalya'nın kapsamlı rehberine hoş geldiniz. Merak ettiğiniz konuyu seçin.",
    askNotice: "Aradığınız yanıtı ve en uygun işletmeleri sizin için bir araya getiriyoruz.",
    emergencyNote: "Acil durumlarda lütfen doğrudan resmi kurum numaralarını (112) arayınız.",
    mainLine: "Ana İletişim Hattı", mainLineSub: "Üyelik, ilan, işbirliği", discover: "Keşfet",
    preparing: "Antalya şehir takvimi hazırlanıyor...",
  }
};


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TEASER BANDI
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function KahinTeaser({ onOpen, lang = "TR" }) {
  const [pulse, setPulse] = useState(false);
  const [tickIdx, setTickIdx] = useState(0);
  const [liveEvents, setLiveEvents] = useState([]);
  const h = getHour();
  const tt = getTimeTheme(h);
  const T = TRANS_KAHIN[lang] || TRANS_KAHIN.TR;

  useEffect(() => {
    const q = query(collection(db, "city_pulse"), where("active", "==", true), where("type", "==", "event"));
    const unsub = onSnapshot(q, (snap) => {
      setLiveEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const allEvents = useMemo(() => mergeEventLists(ANTALYA_ETKINLIK_TAKVIMI_2026, liveEvents), [liveEvents]);
  const evts = useMemo(() => filterEventsByMonth(allEvents, getMonth()).sort(sortEvents), [allEvents]);

  useEffect(() => {
    const iv1 = setInterval(() => setPulse(p => !p), 3500);
    const iv2 = setInterval(() => setTickIdx(p => p + 1), 4200);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, []);

  const current = evts.length > 0 ? evts[tickIdx % evts.length] : null;

  return (
    <motion.div onClick={onOpen} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ position: "relative", width: "100%", padding: "clamp(8px, 2vw, 12px) clamp(12px, 4vw, 20px)", background: "linear-gradient(135deg,rgba(212,175,55,0.055) 0%,rgba(10,10,15,0.98) 65%)", borderBottom: `1px solid rgba(212,175,55,0.13)`, cursor: "pointer", overflow: "hidden", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "13px", flex: 1, minWidth: 0 }}>
        <div style={{ position: "relative", flexShrink: 0, width: "10px", height: "10px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: tt.gold }} />
          <motion.div animate={{ scale: pulse ? 3.2 : 1, opacity: pulse ? 0 : 0.45 }} transition={{ duration: 1.5 }} style={{ position: "absolute", inset: "-5px", borderRadius: "50%", border: `1px solid ${tt.gold}`, pointerEvents: "none" }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ fontFamily: SANS, fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: tt.dim, display: "block", marginBottom: "4px" }}>{T.pulse} · {tt.label}</span>
          <div style={{ overflow: "hidden", height: "24px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={tickIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} style={{ fontFamily: SERIF, fontSize: "16px", color: TEXT, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "24px" }}>
                {current ? `${current.icon}  ${current.isim}  ·  ${current.tarih}  ·  ${current.yer}` : `...  ${T.preparing}`}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <motion.div
        whileHover={{ x: 3, scale: 1.05 }}
        style={{
          fontFamily: SANS,
          fontSize: "12px",
          color: "#fff",
          background: "linear-gradient(90deg, #D4AF37, #B8952A)",
          padding: "clamp(5px, 1.5vw, 8px) clamp(10px, 3vw, 18px)",
          borderRadius: "4px",
          fontWeight: "700",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 15px rgba(212,175,55,0.3)"
        }}
      >
        {T.discover} <span style={{ fontSize: "14px", fontWeight: "bold" }}>›</span>
      </motion.div>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }} style={{ position: "absolute", bottom: 0, left: "20px", right: "20px", height: "1px", background: `linear-gradient(90deg,transparent,${tt.gold} 35%,${tt.gold} 65%,transparent)`, opacity: 0.3, transformOrigin: "left" }} />
    </motion.div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PANEL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function KahinPanel({ onClose, ilanlar: ilanlarFromApp = [], lang = "TR", viewMode = "LIST", setViewMode }) {
  const T = TRANS_KAHIN[lang] || TRANS_KAHIN.TR;
  const [tab, setTab] = useState("haberler");
  const [eKat, setEKat] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [sKat, setSKat] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [lastSoru, setLastSoru] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [liveServices, setLiveServices] = useState([]);
  const [commercialCats, setCommercialCats] = useState([]);
  const [venues, setVenues] = useState([]);
  const [ilanMode, setIlanMode] = useState(false);
  const [ilanForm, setIlanForm] = useState({ tip: "", baslik: "", aciklama: "", fiyat: "", tel: "" });
  const [ilanlarKat, setIlanlarKat] = useState(null);
  const [ilanDetay, setIlanDetay] = useState(null);

  useEffect(() => {
    const qPulse = query(collection(db, "city_pulse"), where("active", "==", true));
    const unsubPulse = onSnapshot(qPulse, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveEvents(docs.filter(d => d.type === "event"));
      setLiveServices(dedupeServiceList(docs.filter(d => d.type === "service")));
    });
    // Dynamically commercial categories fetch removed as per user request to use static content
    // const unsubComm = onSnapshot(collection(db, "commercial_categories"), (snap) => {
    //   setCommercialCats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    // });
    const unsubVenues = onSnapshot(query(collection(db, "venues"), where("aktif", "==", true)), (snap) => {
      setVenues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubPulse(); unsubVenues(); };
  }, []);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({});


  const h = getHour();
  const tt = getTimeTheme(h);
  const allEvents = useMemo(() => mergeEventLists(ANTALYA_ETKINLIK_TAKVIMI_2026, liveEvents), [liveEvents]);
  const monthEvents = useMemo(() => filterEventsByMonth(allEvents, selectedMonth).sort(sortEvents), [allEvents, selectedMonth]);
  const servicesList = useMemo(() => dedupeServiceList(liveServices), [liveServices]);
  const mapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const callUrl = (tel) => `tel:${String(tel || "").replace(/\D/g, "")}`;
  const waUrl = (tel, message) => `https://wa.me/${String(tel).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  const isAll = (val) => val === null || val === undefined || val === "" || val === "Tümü" || val === "All" || val === T.all;

  // Kategori normalizasyonu -  SÜPER ROBUST VERSİYON (Tüm aksanları ve özel harfleri temizler)
  const normKat = (s) => {
    if (!s) return "";
    return String(s).trim().toLocaleLowerCase('tr-TR')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Aksanları temizle
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
  };

  const extractCategories = (list) => {
    const set = new Set();
    const result = [];
    list.forEach(item => {
      const kats = Array.isArray(item.kat) ? item.kat : String(item.kat || "").split(",");
      kats.forEach(k => {
        const clean = String(k || "").trim();
        if (!clean) return;
        const norm = normKat(clean);
        if (!set.has(norm)) {
          set.add(norm);
          result.push(clean);
        }
      });
    });
    return result.sort();
  };

  const eKatsRaw = extractCategories(monthEvents);
  const eKats = [null, ...eKatsRaw];
  const selectedMonthLabel = MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || months[getMonth()];

  const sKatsRaw = extractCategories(servicesList);
  const sKats = [null, ...sKatsRaw];

  // Birebir kategori eşleşmesi -  "Fuar" sadece "Fuar" olanları gösterir
  const matchesKat = (itemKat, targetKat) => {
    if (isAll(targetKat)) return true;
    const t = normKat(targetKat);
    if (!t) return true;

    const kArr = Array.isArray(itemKat)
      ? itemKat
      : String(itemKat || "").split(",").map(x => x.trim());

    return kArr.some(k => normKat(k) === t);
  };

  const shownEvts = monthEvents.filter(e => {
    const isMatched = matchesKat(e.kat, eKat);
    return isMatched;
  });
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const shownEvtsUpcoming = useMemo(() => {
    return shownEvts
      .map((ev) => ({ ev, date: parseEventDate(ev) }))
      .filter((item) => !item.date || item.date >= today)
      .sort((a, b) => {
        const ad = a.date ? a.date.getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.date ? b.date.getTime() : Number.MAX_SAFE_INTEGER;
        if (ad !== bd) return ad - bd;
        return sortEvents(a.ev, b.ev);
      })
      .map((item) => item.ev);
  }, [shownEvts, today]);
  const shownEvtsPast = useMemo(() => {
    return shownEvts
      .map((ev) => ({ ev, date: parseEventDate(ev) }))
      .filter((item) => item.date && item.date < today)
      .sort((a, b) => {
        const ad = a.date ? a.date.getTime() : 0;
        const bd = b.date ? b.date.getTime() : 0;
        if (ad !== bd) return bd - ad;
        return sortEvents(a.ev, b.ev);
      })
      .map((item) => item.ev);
  }, [shownEvts, today]);
  const shownSvcs = servicesList.filter(s => matchesKat(s.kat, sKat));

  useEffect(() => {
    if (eKat) console.log("[Kahin] Kategori Filtresi Aktif:", eKat, "Bulunan Sonuç:", shownEvts.length);
  }, [eKat, shownEvts.length]);

  const tumIlanlar = (ilanlarFromApp || []).filter(i => i != null && (typeof i === "object") && String(i.baslik || "").trim().length > 0);
  const ilanlarFiltreli = ilanlarKat ? tumIlanlar.filter((i) => (String(i.kategori || "").toUpperCase().trim()) === (String(ilanlarKat || "").toUpperCase().trim()) && getCleanTel(i)).sort((a, b) => (PAKET_SIRA[a.paket] || 3) - (PAKET_SIRA[b.paket] || 3)) : [];
  const commercialCatsList = REHBER_ICERIK;

  const TABS = [
    { id: "haberler", label: T.news, icon: "📰" },
    { id: "etkinlik", label: T.events, icon: "🗓️" },
    { id: "acil", label: T.emergency, icon: "🚨" },
    { id: "rehber", label: T.ask, icon: "🔮" },
    { id: "ilanlar", label: T.listings, icon: "📋" },
  ];

  const askCommercial = async (cat, soru, index) => {
    setActiveQuestionIdx(index);
    if (questionAnswers[index]) return; // Zaten cevaplandıysa tekrar sorma

    // Static content handling - finding the answer from REHBER_ICERIK
    const category = REHBER_ICERIK.find(c => c.id === cat.id);
    if (category) {
      const item = category.sorular.find(s => s.q === soru);
      if (item) {
        setQuestionAnswers(prev => ({ ...prev, [index]: item.a }));
        return;
      }
    }

    // Fallback or general questions (custom input)
    setQuestionAnswers(prev => ({ ...prev, [index]: "Aradığınız konuda şu an için spesifik bir rehber içeriği bulunmuyor. Lütfen kategoriler üzerinden ilerleyin." }));
  };

  const sendAppointmentRequest = (cat, soru) => {
    const msg = `Merhaba, Nar Rehberi üzerinden "${cat.label}" kategorisinde bilgi almak istiyorum. Konu: ${soru || "Genel bilgi"}`;
    window.open(waUrl(NETGSM, msg), "_blank");
    setSent(true);
    addDoc(collection(db, "kahin_logs"), { type: "appointment_request", category: cat.id, query: soru, timestamp: serverTimestamp() });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", background: PANEL_BG, border: `1px solid ${CARD_BOR}`, borderRadius: "3px", overflow: "hidden", position: "relative" }}>
      <div style={{ height: "1px", background: `linear-gradient(90deg,transparent,${tt.gold} 30%,${tt.gold} 70%,transparent)`, opacity: 0.4 }} />
      <div style={{ padding: "15px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: SERIF, fontSize: "17px", color: TEXT, letterSpacing: "0.04em" }}>Şehir Nabzı</span>
          <span style={{ fontFamily: SANS, fontSize: "9px", color: tt.dim, letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginTop: "2px" }}>Antalya · {months[getMonth()]}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: "16px", padding: "4px" }}>✕</button>
      </div>
      <div style={{
        display: "flex", // Changed from grid for horizontal scroll
        overflowX: "auto", // Added scroll
        WebkitOverflowScrolling: "touch", // Smooth scroll for iOS
        msOverflowStyle: "none", // Hide scrollbar IE
        scrollbarWidth: "none", // Hide scrollbar Firefox
        padding: "8px 10px 0",
        borderBottom: `1px solid ${CARD_BOR}`,
        marginTop: "12px",
        gap: 4
      }} className="hide-scrollbar">
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {TABS.map((t, i) => (
          <button key={`tab-btn-${t.id}-${i}`} onClick={() => {
            setTab(t.id);
            setEKat(null); setSKat(null);
            setSelCat(null); setAnswer(null); setLastSoru(null);
            setIlanMode(false); setIlanForm({ tip: "", baslik: "", aciklama: "", fiyat: "", tel: "" });
            setSent(false); setIlanlarKat(null); setIlanDetay(null);
          }} style={{
            background: tab === t.id ? `rgba(${hexToRgb(tt.gold)}, 0.12)` : "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px", // Increased padding for better touch
            borderRadius: "4px 4px 0 0",
            flexShrink: 0, // Prevent shrinking
            flex: "0 0 auto", // Allow natural width
            minWidth: "75px", // Minimum width for each tab
            fontFamily: SANS,
            fontSize: "10px", // Slightly larger font
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: tab === t.id ? tt.gold : TEXT_DIM,
            borderBottom: tab === t.id ? `2px solid ${tt.gold}` : "2px solid transparent",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4 // More gap between icon and text
          }}>
            <span style={{ fontSize: "16px" }}>{t.icon}</span>
            <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px) 20px", maxHeight: "520px", overflowY: "auto", scrollbarWidth: "none" }}>
        <AnimatePresence mode="wait">
          {tab === "haberler" && <motion.div key="haberler" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ width: "100%" }}><HaberlerTab /></motion.div>}
          {tab === "etkinlik" && (
            <motion.div key="etkinlik" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "6px", paddingBottom: "4px", width: "100%" }}>
                    {MONTH_OPTIONS.map((m) => {
                      const active = Number(selectedMonth) === m.value;
                      return (
                        <button
                          key={`month-${m.value}`}
                          onClick={() => setSelectedMonth(m.value)}
                          style={{
                            padding: "7px 8px", cursor: "pointer", borderRadius: "18px",
                            fontFamily: SANS, fontSize: "10px", letterSpacing: "0.05em",
                            textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
                            background: active ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.03)",
                            border: active ? `1px solid ${tt.gold}` : `1px solid ${CARD_BOR}`,
                            color: active ? tt.gold : TEXT_DIM,
                            fontWeight: active ? 600 : 400,
                            transition: "all 0.15s",
                            minWidth: 0,
                            width: "100%",
                            textAlign: "center",
                            justifyContent: "center"
                          }}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: "4px", padding: "2px", border: `1px solid ${CARD_BOR}` }}>
                    <button onClick={() => setViewMode("LIST")} style={{ background: viewMode === "LIST" ? "rgba(212,175,55,0.15)" : "transparent", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "3px", color: viewMode === "LIST" ? tt.gold : TEXT_DIM, fontSize: "10px" }}>Liste</button>
                    <button onClick={() => setViewMode("CARD")} style={{ background: viewMode === "CARD" ? "rgba(212,175,55,0.15)" : "transparent", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "3px", color: viewMode === "CARD" ? tt.gold : TEXT_DIM, fontSize: "10px" }}>Kart</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", msOverflowStyle: "none", scrollbarWidth: "none" }} className="hide-scrollbar">
                  {eKats.map((k, i) => (
                    <button
                      key={`ekat-${k || 'all'}-${i}`}
                      onClick={() => setEKat(k)}
                      style={{
                        padding: "6px 14px", cursor: "pointer", borderRadius: "20px",
                        fontFamily: SANS, fontSize: "10px", letterSpacing: "0.05em",
                        textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
                        background: ((k === null && eKat === null) || (eKat === k)) ? `rgba(212,175,55,0.2)` : "rgba(255,255,255,0.03)",
                        border: ((k === null && eKat === null) || (eKat === k)) ? `1px solid ${tt.gold}` : `1px solid ${CARD_BOR}`,
                        color: ((k === null && eKat === null) || (eKat === k)) ? tt.gold : TEXT_DIM,
                        fontWeight: ((k === null && eKat === null) || (eKat === k)) ? 600 : 400,
                        transition: "all 0.15s"
                      }}
                    >
                      {k === null ? T.all : k}
                      {(eKat === k && k !== null) && <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>({shownEvts.length})</span>}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "10px", color: TEXT_DIM, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {selectedMonthLabel} ayı öncelikli gösteriliyor. Kategori seçince yalnızca bu ayın o kategorideki etkinlikleri görünür.
                </div>
              </div>
              {shownEvts.length === 0 ? <p style={{ fontFamily: SERIF, fontSize: "13px", color: TEXT_DIM, fontStyle: "italic", textAlign: "center", padding: "28px 0" }}>{selectedMonthLabel} ayında seçili kategoride etkinlik bulunamadı...</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {shownEvtsUpcoming.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: tt.gold, boxShadow: `0 0 0 4px ${tt.gold}20` }} />
                        <span style={{ fontFamily: SANS, fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: tt.gold }}>Yaklaşan</span>
                      </div>
                      <div style={viewMode === "LIST" ? { display: "flex", flexDirection: "column", gap: "8px" } : { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                        {shownEvtsUpcoming.map((ev, i) => {
                          const priorityLabel = getEventPriorityLabel(ev, today);
                          return (
                            <motion.div
                              key={`upcoming-${ev.id || i}-${i}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              style={{
                                padding: viewMode === "LIST" ? "12px 14px" : "16px",
                                background: CARD_BG,
                                border: `1px solid ${CARD_BOR}`,
                                borderRadius: "4px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                boxShadow: viewMode === "CARD" ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: viewMode === "CARD" ? "12px" : "0" }}>
                                <span style={{ fontSize: viewMode === "CARD" ? "24px" : "18px", flexShrink: 0 }}>{ev.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                                    <span style={{ fontFamily: SERIF, fontSize: "14px", color: TEXT, fontWeight: 600 }}>{ev.isim}</span>
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                      {priorityLabel === "Bugün" && <span style={{ fontSize: "8px", color: tt.gold, border: `1px solid ${tt.gold}55`, padding: "2px 6px", borderRadius: "10px", background: "rgba(212,175,55,0.12)" }}>Bugün</span>}
                                      {priorityLabel === "Bu hafta" && <span style={{ fontSize: "8px", color: "#8ecae6", border: "1px solid rgba(142,202,230,0.45)", padding: "2px 6px", borderRadius: "10px", background: "rgba(142,202,230,0.10)" }}>Bu hafta</span>}
                                      {String(ev.kat || "").split(",").map((k, idx) => (
                                        <span
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const cleaned = k.trim();
                                            setEKat(cleaned);
                                          }}
                                          style={{
                                            fontSize: "8px", color: tt.dim, border: `1px solid ${tt.gold}30`,
                                            padding: "2px 6px", borderRadius: "10px", cursor: "pointer",
                                            background: normKat(eKat) === normKat(k.trim()) ? `rgba(212,175,55,0.2)` : "transparent"
                                          }}
                                        >
                                          {k.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "4px 0 2px" }}>📍 {ev.yer}</p>
                                  <p style={{ fontFamily: SANS, fontSize: "10px", color: tt.gold, margin: "0 0 4px" }}>🕐 {ev.tarih} · {ev.saat}</p>
                                  {ev.adres && <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "0 0 2px", lineHeight: 1.45 }}>🏠 {ev.adres}</p>}
                                  {ev.tel && <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "0 0 8px", lineHeight: 1.45 }}>📞 {ev.tel}</p>}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <a href={mapsUrl(ev.mapsQuery || [ev.yer, ev.adres].filter(Boolean).join(" "))} target="_blank" rel="noopener noreferrer" style={btnStyle("#4285F4", true)}>🗺️ Yol Tarifi</a>
                                {ev.tel && <a href={callUrl(ev.tel)} style={btnStyle(GOLD, true)}>📞 Ara</a>}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {shownEvtsPast.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: TEXT_DIM, boxShadow: `0 0 0 4px rgba(255,255,255,0.04)` }} />
                        <span style={{ fontFamily: SANS, fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: TEXT_DIM }}>Geçmiş</span>
                      </div>
                      <div style={viewMode === "LIST" ? { display: "flex", flexDirection: "column", gap: "8px" } : { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                        {shownEvtsPast.map((ev, i) => (
                          <motion.div
                            key={`past-${ev.id || i}-${i}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            style={{
                              padding: viewMode === "LIST" ? "12px 14px" : "16px",
                              background: "rgba(255,255,255,0.02)",
                              border: `1px solid ${CARD_BOR}`,
                              borderRadius: "4px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              opacity: 0.78,
                              boxShadow: viewMode === "CARD" ? "0 4px 12px rgba(0,0,0,0.08)" : "none"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: viewMode === "CARD" ? "12px" : "0" }}>
                              <span style={{ fontSize: viewMode === "CARD" ? "24px" : "18px", flexShrink: 0 }}>{ev.icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                                  <span style={{ fontFamily: SERIF, fontSize: "14px", color: TEXT, fontWeight: 600 }}>{ev.isim}</span>
                                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    <span style={{ fontSize: "8px", color: TEXT_DIM, border: `1px solid ${CARD_BOR}`, padding: "2px 6px", borderRadius: "10px" }}>Geçti</span>
                                    {String(ev.kat || "").split(",").map((k, idx) => (
                                      <span
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const cleaned = k.trim();
                                          setEKat(cleaned);
                                        }}
                                        style={{
                                          fontSize: "8px", color: tt.dim, border: `1px solid ${tt.gold}30`,
                                          padding: "2px 6px", borderRadius: "10px", cursor: "pointer",
                                          background: normKat(eKat) === normKat(k.trim()) ? `rgba(212,175,55,0.2)` : "transparent"
                                        }}
                                      >
                                        {k.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "4px 0 2px" }}>📍 {ev.yer}</p>
                                <p style={{ fontFamily: SANS, fontSize: "10px", color: tt.gold, margin: "0 0 4px" }}>🕐 {ev.tarih} · {ev.saat}</p>
                                {ev.adres && <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "0 0 2px", lineHeight: 1.45 }}>🏠 {ev.adres}</p>}
                                {ev.tel && <p style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, margin: "0 0 8px", lineHeight: 1.45 }}>📞 {ev.tel}</p>}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <a href={mapsUrl(ev.mapsQuery || [ev.yer, ev.adres].filter(Boolean).join(" "))} target="_blank" rel="noopener noreferrer" style={btnStyle("#4285F4", true)}>🗺️ Yol Tarifi</a>
                              {ev.tel && <a href={callUrl(ev.tel)} style={btnStyle(GOLD, true)}>📞 Ara</a>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {tab === "acil" && (
            <motion.div key="acil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {(!sKat || normKat(sKat) === "eczane" || normKat(sKat) === "nobetci eczane") && (
                <>
                  <div style={{ padding: "8px 12px", marginBottom: "14px", background: "rgba(224,85,85,0.07)", border: "1px solid rgba(224,85,85,0.18)", borderRadius: "2px", display: "flex", alignItems: "center", gap: "8px" }}><span>🚨</span><p style={{ fontFamily: SANS, fontSize: "10px", color: "rgba(224,100,100,0.85)", margin: 0 }}>{T.emergencyNote}</p></div>
                  <div style={{ padding: "12px 14px", marginBottom: "12px", background: "rgba(68,170,102,0.06)", border: "1px solid rgba(68,170,102,0.18)", borderRadius: "2px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>💊</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: SERIF, fontSize: "14px", color: TEXT, display: "block" }}>{T.pharmacyTitle}</span>
                        <p style={{ fontFamily: SANS, fontSize: "10px", color: "rgba(68,170,102,0.7)", margin: "3px 0 8px" }}>{T.pharmacySub}</p>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <a href="https://www.antalyaeo.org.tr/tr/nobetci-eczaneler" target="_blank" rel="noopener noreferrer" style={btnStyle("#44aa66")}>{T.pharmacyBtn}</a>
                          <a href={mapsUrl("nöbetçi eczane antalya")} target="_blank" rel="noopener noreferrer" style={btnStyle("#4285F4")}>Harita</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div style={{ 
                display: "flex", 
                gap: "6px", 
                overflowX: "auto", 
                marginBottom: "12px",
                paddingBottom: "4px",
                msOverflowStyle: "none",
                scrollbarWidth: "none"
              }} className="hide-scrollbar">
                {sKats.map((k, i) => (
                  <button
                    key={`skat-${k || 'all'}-${i}`}
                    onClick={() => setSKat(k)}
                    style={{
                      padding: "6px 14px", cursor: "pointer", borderRadius: "20px",
                      fontFamily: SANS, fontSize: "10px", whiteSpace: "nowrap", flexShrink: 0,
                      background: ((k === null && sKat === null) || (sKat === k)) ? `rgba(212,175,55,0.2)` : "rgba(255,255,255,0.03)",
                      border: ((k === null && sKat === null) || (sKat === k)) ? `1px solid ${GOLD}` : `1px solid ${CARD_BOR}`,
                      color: ((k === null && sKat === null) || (sKat === k)) ? GOLD : TEXT_DIM,
                      fontWeight: ((k === null && sKat === null) || (sKat === k)) ? 600 : 400,
                      transition: "all 0.15s"
                    }}
                  >
                    {k === null ? T.all : k}
                    {(sKat === k && k !== null) && <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>({shownSvcs.length})</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {shownSvcs.map((sv, i) => (
                  <motion.div key={`svc-item-${sv.id || i}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035 }} style={{ padding: "10px 14px", borderRadius: "4px", background: sv.acil ? `rgba(${hexToRgb(sv.renk)},0.05)` : CARD_BG, border: `1px solid ${sv.acil ? sv.renk + "28" : CARD_BOR}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>{sv.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: SERIF, fontSize: "13px", color: TEXT }}>{sv.isim}</span>
                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        {sv.tel && <a href={callUrl(sv.tel)} style={btnStyle(sv.renk || GOLD, true)}>📞 Ara</a>}
                        {sv.maps && <a href={mapsUrl(sv.maps)} target="_blank" rel="noopener noreferrer" style={btnStyle("#4285F4", true)}>📍 Harita</a>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          {tab === "rehber" && (
            <motion.div key="rehber" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {!selCat && !ilanMode && (<>
                <div style={{ padding: "11px 14px", background: "rgba(212,175,55,0.04)", border: `1px solid ${GOLD_FAINT}`, borderRadius: "2px", marginBottom: "14px" }}>
                  <p style={{ fontFamily: SERIF, fontSize: "12px", color: TEXT, margin: "0 0 2px" }}>{T.askIntro}</p>
                  <p style={{ fontFamily: SANS, fontSize: "8.5px", color: GOLD_DIM, margin: 0 }}>{T.askNotice}</p>
                </div>

                {/* ÖZEL SORU SORMA ALANI KALDIRILDI (STATIK REHBER MODU) */}
                <div style={{ padding: "14px", background: "rgba(212,175,55,0.06)", border: `1px solid ${GOLD_FAINT}`, borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
                   <p style={{ fontSize: "11px", color: GOLD, margin: 0, letterSpacing: "0.05em" }}>Lütfen merak ettiğiniz başlığı aşağıdan seçin.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "7px", marginBottom: "12px" }}>
                  {commercialCatsList.map((cat, ci) => (
                    <motion.button key={`comm-cat-${cat.id || ci}-${ci}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelCat(cat); setAnswer(null); setLastSoru(null); setSent(false); setIlanMode(false); setQuestionAnswers({}); }} style={{ padding: "11px 13px", borderRadius: "3px", cursor: "pointer", background: `rgba(${hexToRgb(cat.renk)},0.07)`, border: `1px solid ${cat.renk}22`, textAlign: "left", position: "relative" }}>
                      <span style={{ fontSize: "19px" }}>{cat.icon}</span>
                      <span style={{ fontFamily: SERIF, fontSize: "12.5px", color: TEXT, display: "block", marginTop: "5px" }}>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </>)}
              {selCat && !ilanMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button onClick={() => setSelCat(null)} style={{ background: "none", border: "none", color: GOLD_DIM, fontSize: "10px", cursor: "pointer", marginBottom: "12px" }}>← Kategoriler</button>

                  {/* BAŞLIK VE İLANLAR (BAŞLIĞIN İÇİNDE İLANLAR) */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "24px" }}>{selCat.icon}</span>
                      <h3 style={{ fontFamily: SERIF, fontSize: "20px", color: TEXT, margin: 0 }}>{selCat.label}</h3>
                    </div>

                    {/* Bu kategoriye uygun ilanların başlık altında listelenmesi (Kullanıcı Talebi: Başlığın içine yerleştir) */}
                    {(() => {
                      const relatedIlanlar = tumIlanlar.filter(i =>
                        normKat(i.kategori) === normKat(selCat.id) ||
                        normKat(i.kategori) === normKat(selCat.label)
                      ).slice(0, 2);

                      if (relatedIlanlar.length > 0) {
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                            {relatedIlanlar.map((ilan, idx) => (
                              <motion.div key={`rel-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                style={{ padding: "10px 12px", background: `rgba(${hexToRgb(selCat.renk)}, 0.08)`, border: `1px solid ${selCat.renk}30`, borderRadius: "4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "13px", color: TEXT, fontWeight: 600 }}>{ilan.baslik}</span>
                                  <span style={{ fontSize: "10px", color: GOLD }}>{ilan.fiyat || "Fiyat Sorun"}</span>
                                </div>
                                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                  <a href={`tel:${getCleanTel(ilan)}`} style={btnStyle(selCat.renk, true)}>📞 Ara</a>
                                  <a href={waUrl(getCleanTel(ilan), `Merhaba, Nar Rehberi'ndeki "${ilan.baslik}" ilanınız için yazıyorum.`)} style={btnStyle("#25D366", true)}>💬 Yaz</a>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        );
                      } else {
                        // İLAN YOKSA: Otomatik olarak "Nar Rehberi Güvencesiyle" önerisi oluştur
                        return (
                          <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: `1px dashed ${GOLD_DIM}`, borderRadius: "4px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "10px", color: GOLD, letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>NAR REHBERİ ÖNERİSİ</span>
                            <p style={{ fontSize: "12px", color: TEXT_DIM, margin: 0 }}>Antalya genelinde {selCat.label} alanında size en iyi hizmeti verecek olan partnerlerimizi listeliyoruz. Henüz bir ilan yayınlanmamış olsa da, liyakatli işletmelere doğrudan ulaşabilirsiniz.</p>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {(selCat.sorular || []).map((s, si) => (
                      <div key={`faq-cont-${si}`}>
                        <button onClick={() => askCommercial(selCat, s.q, si)} style={{ width: "100%", padding: "12px 14px", background: activeQuestionIdx === si ? `rgba(${hexToRgb(selCat.renk)}, 0.12)` : CARD_BG, border: `1px solid ${activeQuestionIdx === si ? selCat.renk : CARD_BOR}`, borderRadius: "3px", textAlign: "left", color: TEXT, fontFamily: SERIF, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px" }}>{s.q}</span>
                          <span style={{ opacity: 0.5, fontSize: "12px", transition: "transform 0.3s", transform: activeQuestionIdx === si ? "rotate(90deg)" : "none" }}>?</span>
                        </button>
                        <AnimatePresence>
                          {activeQuestionIdx === si && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                              <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${CARD_BOR}`, borderTop: "none", borderRadius: "0 0 4px 4px", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(240,234,218,0.75)" }}>
                                {loading && !questionAnswers[si] ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div className="kahin-loading" style={{ width: "12px", height: "12px", border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%" }} />
                                    <span style={{ fontSize: "11px", color: GOLD_DIM, letterSpacing: "1px" }}>KAHİN DÜŞÜNÜYOR...</span>
                                  </div>
                                ) : (
                                  <>
                                    {questionAnswers[si]}
                                    {/* Soruyla ilgili ilanları da cevap altına ekle */}
                                    {(() => {
                                      const sq = normKat(s.q || "");
                                      const qMatches = tumIlanlar.filter(i =>
                                        normKat(i.baslik).includes(sq) ||
                                        normKat(i.aciklama).includes(sq) ||
                                        (normKat(i.kategori) === normKat(selCat.id))
                                      ).slice(0, 2);

                                      if (qMatches.length > 0) {
                                        return (
                                          <div style={{ marginTop: "14px", borderTop: "1px solid rgba(212,175,55,0.1)", paddingTop: "10px" }}>
                                            <span style={{ fontSize: "9px", color: GOLD, letterSpacing: "1.5px", display: "block", marginBottom: "6px" }}>İLGİLİ HİZMETLER</span>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                              {qMatches.map((ilan, idx) => (
                                                <div key={idx} style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", border: `1px solid ${GOLD_FAINT}` }}>
                                                  <div style={{ fontSize: "11px", color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ilan.baslik}</div>
                                                  <a href={`tel:${getCleanTel(ilan)}`} style={{ fontSize: "10px", color: GOLD, textDecoration: "none", marginTop: "4px", display: "inline-block" }}>📞 Hemen Ara</a>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {tab === "ilanlar" && (
            <motion.div key="ilanlar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {!ilanlarKat ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                  {ILAN_KATEGORILERI.map((k, ki) => <button key={`ilan-cat-${k.id}-${ki}`} onClick={() => setIlanlarKat(k.id)} style={{ padding: "14px", background: `rgba(${hexToRgb(k.renk)},0.08)`, border: `1px solid ${k.renk}20`, borderRadius: "3px", textAlign: "left", color: TEXT }}><span style={{ fontSize: "20px" }}>{k.icon}</span><br /><span style={{ fontSize: "12px", fontWeight: 600 }}>{k.label}</span></button>)}
                </div>
              ) : (
                <>
                  <button onClick={() => setIlanlarKat(null)} style={{ background: "none", border: "none", color: GOLD_DIM, fontSize: "10px", cursor: "pointer", marginBottom: "12px" }}>← Kategoriler</button>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {ilanlarFiltreli.map((ilan, ii) => (
                      <div key={`ilan-item-${ilan.id || ii}-${ii}`} style={{ padding: "14px", background: CARD_BG, border: `1px solid ${CARD_BOR}`, borderRadius: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{ilan.baslik}</span>
                        <p style={{ fontSize: "12px", color: GOLD, margin: "4px 0" }}>{ilan.fiyat}</p>
                        <button onClick={() => setIlanDetay(ilan)} style={{ fontSize: "10px", color: GOLD_DIM, background: "none", border: "none", cursor: "pointer" }}>DETAYLARI GÖR</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ padding: "10px", textAlign: "center", borderTop: `1px solid ${CARD_BOR}` }}><span style={{ fontSize: "8px", color: TEXT_DIM, letterSpacing: "2px" }}>KAHİN · NAR REHBERİ</span></div>
    </motion.div>
  );
}

export default function KahinCityPulse({ sticky = false, headerH = 52, lang = "TR", viewMode = "LIST", setViewMode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ width: "100%", position: sticky ? "sticky" : "relative", top: sticky ? `${headerH}px` : "auto", zIndex: sticky ? 150 : "auto", background: sticky ? "#0a0a0f" : "transparent" }}>
      <KahinTeaser onOpen={() => setOpen(true)} lang={lang} />
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.38 }} style={{ overflow: "hidden" }}><KahinPanel onClose={() => setOpen(false)} lang={lang} viewMode={viewMode} setViewMode={setViewMode} /></motion.div>}</AnimatePresence>
    </div>
  );
}



