import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KahinPanel, KahinTeaser } from "./KahinCityPulse.jsx";
import CanliDuvar from "./CanliDuvar.jsx";
import TimeSuggestion from "./TimeSuggestion.jsx";

const C = {
  bg: "#0a0a0f",
  panel: "#111118",
  card: "#14141b",
  border: "rgba(212,175,55,0.16)",
  gold: "#d4af37",
  text: "rgba(240,234,218,0.94)",
  muted: "rgba(190,178,150,0.62)",
  line: "rgba(212,175,55,0.12)",
  shadow: "0 20px 60px rgba(0,0,0,0.28)",
  serif: "'Cormorant Garamond','Garamond',serif",
  sans: "'Jost','Segoe UI',sans-serif",
};

const CATEGORY_CARDS = [
  {
    key: "SANAT_KULTUR",
    type: "live",
    title: "Sahne ve Sanat",
    badge: "NAR SEÇİMİ",
    subtitle: "Devlet Tiyatrosu · Sergi · Kültür",
    icon: "🎭",
    accent: "#2d7a74",
    aliases: ["SANAT_KULTUR", "SANAT", "KULTUR", "ETKINLIK", "TIYATRO", "SERGI"],
    description: "Şehrin sahne sanatları, konser ve kültür programları için editoryal seçki.",
  },
  {
    key: "GURME_DURAK",
    type: "live",
    title: "Gurme Duraklar",
    badge: "NAR SEÇİMİ",
    subtitle: "Specialty Coffee · Atölye · Lezzet",
    icon: "☕",
    accent: "#8b5c3a",
    aliases: ["GURME_DURAK", "GASTRONOMI", "YEME_ICME", "KAFE", "CAFE", "RESTORAN", "GEL_AL"],
    description: "Kahveden akşam yemeğine kadar özenli mutfak ve deneyim durakları.",
  },
  {
    key: "USTA_HIZMET",
    type: "live",
    title: "Usta / Hizmet",
    badge: "NAR SEÇİMİ",
    subtitle: "Çilingir · Oto · Tesisat · 7/24",
    icon: "🔧",
    accent: "#4b78b8",
    aliases: ["USTA_HIZMET", "OTOMOTIV", "SAGLIK_GUZELLIK", "HIZMET", "SERVIS", "BAKIM"],
    description: "Günün her saatinde güvenilir hizmet noktaları ve hızlı çözüm sağlayan işletmeler.",
  },
  {
    key: "GECE_HAYATI",
    type: "live",
    title: "Gece Hayatı",
    badge: "NAR SEÇİMİ",
    subtitle: "Kokteyl · Rooftop · Club · Bar",
    icon: "🌙",
    accent: "#7b55b5",
    aliases: ["GECE_HAYATI", "EGLENCE", "BAR", "CLUB", "KULUP", "ROOFTOP"],
    description: "Akşamın ritmine uygun bar, kulüp ve rooftop seçkileri burada toparlanır.",
  },
  {
    key: "EMLAK_ILANLARI",
    type: "ilan",
    title: "Emlak İlanları",
    badge: "İLAN VER",
    subtitle: "Kiralık · Satılık · Konut",
    icon: "🏢",
    accent: "#367cc2",
    formCategory: "EMLAK",
    description: "Bireysel emlak ilanı gönderin veya aktif portföy girişlerini takip edin.",
  },
  {
    key: "ARAC_ILANLARI",
    type: "ilan",
    title: "Araç İlanları",
    badge: "İLAN VER",
    subtitle: "Satılık · Kiralık · Galeri",
    icon: "🚗",
    accent: "#b96c2c",
    formCategory: "ARAC",
    description: "Araç ilanları için hızlı giriş ve kurallı yayın akışı bu alanda çalışır.",
  },
  {
    key: "ANTIK_REHBER",
    type: "antik",
    title: "Antik Rehber",
    badge: "NAR SEÇİMİ",
    subtitle: "Kaleiçi · Aspendos · Perge · Termessos",
    icon: "🏛️",
    accent: "#9a7a24",
    description: "Antalya'nın tarih aksı için hızlı rota ve keşif notları.",
  },
  {
    key: "TURIST_SURVIVAL_KIT",
    type: "survival",
    title: "Turist Survival Kit",
    badge: "RESMİ BİLGİ",
    subtitle: "Konsolosluk · Polis · Sağlık · Ulaşım",
    icon: "🛡️",
    accent: "#306fa8",
    description: "Acil temaslar, ulaşım düğümleri ve temel resmi bilgi noktaları.",
  },
];

const ANTIK_ITEMS = [
  {
    name: "Kaleiçi",
    meta: "Tarih · Liman · Yürüyüş",
    note: "Dar sokaklar, surlar ve liman hattı için merkez başlangıç noktası.",
    href: mapsLink("Kaleiçi Antalya"),
  },
  {
    name: "Aspendos Antik Tiyatro",
    meta: "Serik · Antik Sahne",
    note: "Opera ve konserlerle yaşayan, dünyanın en güçlü akustiğine sahip sahnelerden biri.",
    href: mapsLink("Aspendos Antik Tiyatro Antalya"),
  },
  {
    name: "Perge",
    meta: "Aksu · Antik Kent",
    note: "Agora, sütunlu cadde ve stadyum hattı için yarım günlük rota.",
    href: mapsLink("Perge Antik Kenti Antalya"),
  },
  {
    name: "Termessos",
    meta: "Dağ Rotası · Doğa",
    note: "Doğa ve tarih iç içe; sabah saatlerinde gitmek en rahat deneyimi verir.",
    href: mapsLink("Termessos Antalya"),
  },
];

const SURVIVAL_ITEMS = [
  {
    name: "112 Acil Çağrı",
    meta: "Sağlık · Polis · İtfaiye",
    note: "Türkiye genel acil çağrı hattı.",
    href: "tel:112",
    cta: "Ara",
  },
  {
    name: "Antalya Havalimanı",
    meta: "Ulaşım · Terminal",
    note: "Terminal yönlendirme ve transfer başlangıç noktası.",
    href: mapsLink("Antalya Havalimanı"),
    cta: "Harita",
  },
  {
    name: "Antalya Otogar",
    meta: "Şehirlerarası Ulaşım",
    note: "Otobüs, tramvay ve transfer bağlantıları için ana merkez.",
    href: mapsLink("Antalya Şehirlerarası Otobüs Terminali"),
    cta: "Harita",
  },
  {
    name: "Antalya Eğitim ve Araştırma Hastanesi",
    meta: "Sağlık",
    note: "Merkezi sağlık erişimi için ana kamu hastanelerinden biri.",
    href: mapsLink("Antalya Eğitim ve Araştırma Hastanesi"),
    cta: "Harita",
  },
];

const CANLI_DUVAR_DATA = [
  {
    year: "MS 130",
    title: {
      TR: "Hadrian Kapısı",
      EN: "Hadrian's Gate",
      RU: "Ворота Адриана",
      DE: "Hadrianstor",
    },
    subtitle: {
      TR: "Roma İmparatorluğu",
      EN: "Roman Empire",
      RU: "Римская империя",
      DE: "Römisches Reich",
    },
    text: {
      TR: "Antalya surlarının kalbinde yükselen bu kapı, imparator Hadrianus'un ziyareti için inşa edildi. Mermer işçiliği ve üç kemerli yapısıyla şehir belleğinin en görkemli girişlerinden biri olarak yaşamaya devam ediyor.",
      EN: "At the heart of Antalya's old walls, this gate was built for Emperor Hadrian's visit. Its marble craftsmanship and triple-arched form still mark one of the city's most memorable entrances.",
      RU: "В самом сердце старых стен Анталии эти ворота были построены к приезду императора Адриана. Мраморная отделка и три арки до сих пор делают их одним из самых впечатляющих входов в город.",
      DE: "Im Herzen der alten Stadtmauern von Antalya wurde dieses Tor für den Besuch von Kaiser Hadrian errichtet. Die Marmordetails und die dreibogige Form machen es bis heute zu einem der eindrucksvollsten Stadteingänge.",
    },
  },
  {
    year: "MS 150",
    title: {
      TR: "Perge Sütunlu Cadde",
      EN: "Perge Colonnaded Street",
      RU: "Колонная улица Перге",
      DE: "Säulenstraße von Perge",
    },
    subtitle: {
      TR: "Antik Kent Yaşamı",
      EN: "Ancient City Life",
      RU: "Жизнь античного города",
      DE: "Leben in der antiken Stadt",
    },
    text: {
      TR: "Perge'nin ana caddesi yalnızca bir geçiş hattı değildi; ticaretin, törenlerin ve günlük şehrin ritmi burada akıyordu. Sütunların arasında dolaşırken kentin düzenli planını çıplak gözle okumak hâlâ mümkün.",
      EN: "Perge's main street was more than a route; it carried trade, ceremony, and the pulse of daily life. Even today, the city's orderly plan can be read between the columns.",
      RU: "Главная улица Перге была не просто дорогой; здесь проходили торговля, церемонии и повседневная жизнь города. И сегодня между колоннами можно увидеть строгий план античного города.",
      DE: "Die Hauptstraße von Perge war mehr als nur ein Weg; hier bündelten sich Handel, Zeremonien und das tägliche Leben. Noch heute lässt sich zwischen den Säulen der geordnete Stadtplan erkennen.",
    },
  },
  {
    year: "MS 180",
    title: {
      TR: "Aspendos Tiyatrosu",
      EN: "Aspendos Theatre",
      RU: "Театр Аспендоса",
      DE: "Theater von Aspendos",
    },
    subtitle: {
      TR: "Akustik Mirası",
      EN: "Acoustic Heritage",
      RU: "Акустическое наследие",
      DE: "Akustisches Erbe",
    },
    text: {
      TR: "Aspendos, yalnızca ayakta kalmış bir tiyatro değil; sesi hâlâ taşıyan yaşayan bir mimari. Üst sıralardan sahneye bakarken, taşın akustiğe nasıl dönüştüğünü hissetmek mümkün.",
      EN: "Aspendos is not only a surviving theatre but a living architecture that still carries sound. From the upper rows, you can feel how stone itself turns into acoustics.",
      RU: "Аспендос — это не просто хорошо сохранившийся театр, а живая архитектура, которая до сих пор несет звук. С верхних рядов можно почувствовать, как камень превращается в акустику.",
      DE: "Aspendos ist nicht nur ein erhaltenes Theater, sondern lebendige Architektur, die Klang noch immer trägt. Von den oberen Rängen lässt sich spüren, wie Stein zu Akustik wird.",
    },
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", icon: "📷", href: "https://www.instagram.com/" },
  { label: "Twitter / X", icon: "𝕏", href: "https://x.com/" },
  { label: "Facebook", icon: "👥", href: "https://www.facebook.com/" },
  { label: "TikTok", icon: "🎵", href: "https://www.tiktok.com/" },
];

const CONTENT_FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "LIVE", label: "Mekanlar" },
  { key: "ILAN", label: "İlanlar" },
  { key: "INFO", label: "Bilgi Kartları" },
];

function mapsLink(query) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("tr-TR");
}

function normalizeUpper(value) {
  return String(value || "")
    .toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I")
    .replace(/Ç/g, "C")
    .replace(/Ğ/g, "G")
    .replace(/Ö/g, "O")
    .replace(/Ş/g, "S")
    .replace(/Ü/g, "U");
}

function membershipRank(level) {
  switch (String(level || "").toUpperCase()) {
    case "PLATINUM":
      return 0;
    case "GOLD":
      return 1;
    case "SILVER":
      return 2;
    case "BRONZE":
      return 3;
    default:
      return 4;
  }
}

function distanceKm(coords, venue) {
  if (!coords || venue?.lat == null || venue?.lng == null) return null;
  const R = 6371;
  const dLat = ((venue.lat - coords.lat) * Math.PI) / 180;
  const dLng = ((venue.lng - coords.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((coords.lat * Math.PI) / 180) *
      Math.cos((venue.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function enrichAndSortVenues(venues, coords) {
  return venues
    .filter((venue) => venue && venue.aktif !== false)
    .map((venue) => ({ ...venue, _distance: distanceKm(coords, venue) }))
    .sort((a, b) => {
      const membershipDiff = membershipRank(a.uyelik) - membershipRank(b.uyelik);
      if (membershipDiff !== 0) return membershipDiff;
      if (a._distance != null && b._distance != null && a._distance !== b._distance) {
        return a._distance - b._distance;
      }
      const scoreA = Number(a.nar_secimi_skoru || a.puan || 0);
      const scoreB = Number(b.nar_secimi_skoru || b.puan || 0);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return String(a.ad || a.isim || "").localeCompare(String(b.ad || b.isim || ""), "tr");
    });
}

function formatDistance(distance) {
  if (distance == null) return null;
  return `${distance.toFixed(1)} km`;
}

function venueMatchesCard(venue, card) {
  const haystack = [venue?.kategori, venue?.category, venue?.tip, venue?.tags]
    .filter(Boolean)
    .map(normalizeUpper)
    .join(" ");
  return (card.aliases || []).some((alias) => haystack.includes(alias));
}

function getIlanTitle(ilan) {
  return ilan?.baslik || ilan?.title || "İlan";
}

function getIlanAddress(ilan) {
  return ilan?.konum || ilan?.adres || ilan?.ilce || ilan?.semt || "Konum bilgisi girilmemiş";
}

function getIlanSummary(ilan) {
  return [ilan?.islem, ilan?.tip, ilan?.metrekare ? `${ilan.metrekare} m²` : null, ilan?.odaSayisi]
    .filter(Boolean)
    .join(" · ");
}

function categoryMatches(card, query, venues, ilanItems) {
  if (!query) return true;
  const text = [card.title, card.subtitle, card.description].map(normalize).join(" ");
  if (text.includes(query)) return true;
  if (card.type === "live") {
    return venues.some((venue) =>
      [venue.ad, venue.isim, venue.adres, venue.description, venue.mahalle]
        .map(normalize)
        .join(" ")
        .includes(query),
    );
  }
  if (card.type === "ilan") {
    return ilanItems.some((ilan) =>
      [ilan.baslik, ilan.aciklama, ilan.fiyat, ilan.tip, ilan.islem, ilan.adres]
        .map(normalize)
        .join(" ")
        .includes(query),
    );
  }
  if (card.type === "antik") {
    return ANTIK_ITEMS.some((item) => normalize(`${item.name} ${item.meta} ${item.note}`).includes(query));
  }
  if (card.type === "survival") {
    return SURVIVAL_ITEMS.some((item) => normalize(`${item.name} ${item.meta} ${item.note}`).includes(query));
  }
  return false;
}

function pillStyle(color, bg) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px 10px",
    borderRadius: 999,
    border: `1px solid ${color}55`,
    background: bg,
    color,
    fontFamily: C.sans,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    whiteSpace: "nowrap",
  };
}

function actionStyle(accent) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    background: `${accent}1f`,
    border: `1px solid ${accent}55`,
    color: accent,
    fontFamily: C.sans,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
  };
}

function solidActionStyle(accent) {
  return {
    minWidth: 118,
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    background: accent,
    color: "#0a0a0f",
    fontFamily: C.sans,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function outlineButtonStyle(accent) {
  return {
    minWidth: 118,
    padding: "11px 16px",
    borderRadius: 10,
    border: `1px solid ${accent}55`,
    background: "transparent",
    color: accent,
    fontFamily: C.sans,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function viewToggleStyle(active) {
  return {
    minWidth: 82,
    padding: "9px 14px",
    borderRadius: 10,
    border: `1px solid ${active ? C.gold : C.border}`,
    background: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
    color: active ? C.gold : C.text,
    fontFamily: C.sans,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function emptyBoxStyle() {
  return {
    padding: "16px 18px",
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.02)",
    color: C.muted,
    fontFamily: C.sans,
    fontSize: 13,
    lineHeight: 1.7,
  };
}

function infoListStyle(accent) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    padding: "16px 18px",
    borderRadius: 14,
    border: `1px solid ${accent}33`,
    background: "rgba(255,255,255,0.02)",
  };
}

function SectionToolbar({ contentFilter, setContentFilter, viewMode, setViewMode, counts }) {
  return (
    <section
      style={{
        marginBottom: 18,
        padding: "14px 16px",
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.02)",
        display: "grid",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.18em", color: C.gold, textTransform: "uppercase" }}>
            Vitrin Kontrolleri
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginTop: 6 }}>
            Filtreleme, görünüm ve içerik dağılımı bu alandan yönetiliyor.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setViewMode?.("LIST")} style={viewToggleStyle(viewMode === "LIST")}>
            Liste
          </button>
          <button type="button" onClick={() => setViewMode?.("CARD")} style={viewToggleStyle(viewMode === "CARD")}>
            Kart
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CONTENT_FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setContentFilter(item.key)}
            style={{
              borderRadius: 999,
              border: `1px solid ${contentFilter === item.key ? C.gold : C.border}`,
              background: contentFilter === item.key ? "rgba(212,175,55,0.14)" : "transparent",
              color: contentFilter === item.key ? C.gold : C.text,
              fontFamily: C.sans,
              fontSize: 12,
              fontWeight: 600,
              padding: "9px 14px",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: C.muted, fontSize: 12, fontFamily: C.sans }}>
        <span>{counts.live} mekan eşleşti</span>
        <span>{counts.ilan} ilan yayında</span>
        <span>{counts.info} bilgi kartı açık</span>
      </div>
    </section>
  );
}

function SearchResultCard({ venue }) {
  const title = venue.ad || venue.isim || "Mekan";
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: C.sans, fontSize: 17, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 4 }}>
            {venue.adres || venue.mahalle || "Adres bilgisi hazırlanıyor"}
          </div>
        </div>
        {venue.uyelik && (
          <span style={pillStyle(C.gold, "rgba(212,175,55,0.10)")}>{String(venue.uyelik).toUpperCase()}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: C.muted }}>
        {venue._distance != null && <span>📍 {formatDistance(venue._distance)}</span>}
        {venue.telefon && <span>📞 {venue.telefon}</span>}
        {(venue.nar_secimi_skoru || venue.puan) && <span>★ {venue.nar_secimi_skoru || venue.puan}</span>}
      </div>
    </div>
  );
}

function VenuePreview({ venue, accent, compact = false }) {
  const title = venue.ad || venue.isim || "Mekan";
  const text = venue.aciklama || venue.description || "Detay bilgisi hazırlanıyor";
  const address = venue.adres || venue.mahalle || "Adres bilgisi hazırlanıyor";

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${accent}33`,
        background: "rgba(255,255,255,0.02)",
        padding: compact ? "14px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: C.sans, fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.65 }}>
            {text}
          </div>
        </div>
        {venue.uyelik && <span style={pillStyle(C.gold, "rgba(212,175,55,0.10)")}>{venue.uyelik}</span>}
      </div>

      <div style={{ fontFamily: C.sans, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
        <strong style={{ color: accent }}>Adres:</strong> {address}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: C.muted, fontSize: 12 }}>
        {venue._distance != null && <span>📍 {formatDistance(venue._distance)}</span>}
        {(venue.nar_secimi_skoru || venue.puan) && <span>★ {venue.nar_secimi_skoru || venue.puan}</span>}
        {venue.telefon && <span>📞 {venue.telefon}</span>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {venue.telefon && (
          <a href={`tel:${String(venue.telefon).replace(/\s+/g, "")}`} style={actionStyle(accent)}>
            Ara
          </a>
        )}
        {address && (
          <a href={mapsLink(`${title} ${address}`)} target="_blank" rel="noreferrer" style={actionStyle(accent)}>
            Harita
          </a>
        )}
      </div>
    </div>
  );
}

function IlanPreview({ ilan, accent, compact = false, onOpenIlanForm }) {
  const title = getIlanTitle(ilan);
  const meta = getIlanSummary(ilan);
  const address = getIlanAddress(ilan);

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${accent}33`,
        background: "rgba(255,255,255,0.02)",
        padding: compact ? "14px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: C.sans, fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, color: C.gold, marginTop: 6 }}>{ilan.fiyat || "Fiyat görüşülür"}</div>
        </div>
        <span style={pillStyle(accent, `${accent}16`)}>{ilan.kategori || "İlan"}</span>
      </div>

      {meta && <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted }}>{meta}</div>}
      <div style={{ fontFamily: C.sans, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
        <strong style={{ color: accent }}>Konum:</strong> {address}
      </div>
      {ilan.aciklama && (
        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
          {String(ilan.aciklama).slice(0, compact ? 90 : 150)}
          {String(ilan.aciklama).length > (compact ? 90 : 150) ? "..." : ""}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ilan.tel && (
          <a href={`tel:${String(ilan.tel).replace(/\s+/g, "")}`} style={actionStyle(accent)}>
            İlan Sahibine Ulaş
          </a>
        )}
        <button type="button" onClick={() => onOpenIlanForm?.(ilan.kategori === "ARAC" ? "ARAC" : "EMLAK")} style={outlineButtonStyle(accent)}>
          Yeni İlan Ver
        </button>
      </div>
    </div>
  );
}

function PromoModule({ title, subtitle, accent, borderAccent, badge, icon, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "18px 20px",
        borderRadius: 16,
        border: `1px solid ${borderAccent}`,
        borderLeft: `4px solid ${accent}`,
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 24 }}>{icon}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: C.sans, fontSize: 24, fontWeight: 700, color: accent }}>{title}</span>
              {badge && <span style={pillStyle("#fff", `${accent}`)}>{badge}</span>}
            </div>
            <div style={{ fontFamily: C.serif, fontSize: 24, color: C.text, opacity: 0.85 }}>{subtitle}</div>
          </div>
        </div>
        <span style={{ color: accent, fontSize: 24 }}>→</span>
      </div>
    </motion.button>
  );
}

function CategoryCard({
  card,
  venues,
  ilanlar,
  onOpenIlanForm,
  showSysNotify,
  viewMode,
}) {
  const [open, setOpen] = useState(false);
  const previewCount = card.type === "live" ? venues.length : card.type === "ilan" ? ilanlar.length : 0;
  const previewVenue = venues[0];

  const bodyLayout =
    viewMode === "CARD"
      ? { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }
      : { display: "grid", gap: 12 };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          width: "100%",
          textAlign: "left",
          borderRadius: open ? "16px 16px 0 0" : 16,
          border: `1px solid ${open ? `${card.accent}66` : C.border}`,
          background: open ? `linear-gradient(135deg, ${card.accent}18, rgba(255,255,255,0.02))` : C.card,
          padding: "18px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          boxShadow: open ? C.shadow : "none",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            background: `${card.accent}1c`,
            border: `1px solid ${card.accent}33`,
          }}
        >
          {card.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: C.sans, fontSize: 18, fontWeight: 700, color: C.text }}>{card.title}</span>
            <span style={pillStyle(C.gold, "rgba(212,175,55,0.10)")}>{card.badge}</span>
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginTop: 6 }}>{card.subtitle}</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, color: C.text, marginTop: 8, opacity: 0.86 }}>
            {card.type === "live" && previewVenue
              ? `${previewCount} mekan · ${previewVenue.adres || previewVenue.mahalle || "Adres bilgisi hazır"}`
              : card.type === "ilan"
                ? `${previewCount} ilan yayında`
                : card.type === "antik"
                  ? `${ANTIK_ITEMS.length} rota hazır`
                  : `${SURVIVAL_ITEMS.length} resmi temas noktası`}
          </div>
        </div>

        <motion.span animate={{ rotate: open ? 90 : 0 }} style={{ color: C.muted, fontSize: 22 }}>
          ›
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "16px 18px 18px",
                border: `1px solid ${card.accent}44`,
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0, flex: 1 }}>
                  {card.description}
                </p>
                {(card.type === "live" || card.type === "ilan") && (
                  <span style={pillStyle(card.accent, `${card.accent}16`)}>
                    {card.type === "live" ? `${venues.length} kayıt` : `${ilanlar.length} ilan`}
                  </span>
                )}
              </div>

              {card.type === "live" && (
                <div style={bodyLayout}>
                  {venues.length > 0 ? (
                    venues.slice(0, 6).map((venue) => (
                      <VenuePreview
                        key={venue.id || venue.ad || venue.isim}
                        venue={venue}
                        accent={card.accent}
                        compact={viewMode === "CARD"}
                      />
                    ))
                  ) : (
                    <div style={emptyBoxStyle()}>
                      Bu kategoride görünür kayıt henüz yok. Panelden eklenen aktif mekanlar burada listelenecek.
                    </div>
                  )}
                </div>
              )}

              {card.type === "ilan" && (
                <div style={{ display: "grid", gap: 12 }}>
                  {ilanlar.length > 0 ? (
                    <div style={bodyLayout}>
                      {ilanlar.slice(0, 6).map((ilan) => (
                        <IlanPreview
                          key={ilan.id || ilan.baslik}
                          ilan={ilan}
                          accent={card.accent}
                          compact={viewMode === "CARD"}
                          onOpenIlanForm={onOpenIlanForm}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={emptyBoxStyle()}>
                      Bu kategori için henüz aktif ilan yok. Yeni ilanları doğrudan form üzerinden ekleyebilirsin.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => onOpenIlanForm?.(card.formCategory)} style={solidActionStyle(card.accent)}>
                      İlan Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => showSysNotify?.(`${card.title} modülü hazır. Form üzerinden ilan girişi yapılabilir.`, "gold")}
                      style={outlineButtonStyle(card.accent)}
                    >
                      Bilgi
                    </button>
                  </div>
                </div>
              )}

              {card.type === "antik" && (
                <div style={{ display: "grid", gap: 12 }}>
                  {ANTIK_ITEMS.map((item) => (
                    <div key={item.name} style={infoListStyle(card.accent)}>
                      <div>
                        <div style={{ fontFamily: C.sans, fontSize: 15, fontWeight: 600, color: C.text }}>{item.name}</div>
                        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.gold, marginTop: 4 }}>{item.meta}</div>
                        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{item.note}</div>
                      </div>
                      <a href={item.href} target="_blank" rel="noreferrer" style={actionStyle(card.accent)}>
                        Harita
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {card.type === "survival" && (
                <div style={{ display: "grid", gap: 12 }}>
                  {SURVIVAL_ITEMS.map((item) => (
                    <div key={item.name} style={infoListStyle(card.accent)}>
                      <div>
                        <div style={{ fontFamily: C.sans, fontSize: 15, fontWeight: 600, color: C.text }}>{item.name}</div>
                        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.gold, marginTop: 4 }}>{item.meta}</div>
                        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{item.note}</div>
                      </div>
                      <a href={item.href} target="_blank" rel="noreferrer" style={actionStyle(card.accent)}>
                        {item.cta}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SecondaryModules({ onCanliDuvarOpen }) {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel, padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase" }}>
              Canlı Duvar
            </div>
            <div style={{ fontFamily: C.serif, fontSize: 28, color: C.text, marginTop: 6 }}>
              Taşların Hatırladıkları
            </div>
          </div>
          <div style={{ fontSize: 26 }}>🗿</div>
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
          Antik Antalya anlatısını çok dilli ve sesli akışla tekrar görünür kılan modül aktif durumda.
        </div>
        <button type="button" onClick={onCanliDuvarOpen} style={solidActionStyle(C.gold)}>
          Canlı Duvarı Aç
        </button>
      </div>

      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel, padding: "18px 18px 16px" }}>
        <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>
          Turist Bilgilendirme Kartı
        </div>
        <div style={{ fontFamily: C.serif, fontSize: 28, color: C.text, marginBottom: 14 }}>
          Hızlı Resmi Erişim
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {SURVIVAL_ITEMS.slice(0, 4).map((item) => (
            <div key={item.name} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px 14px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: C.sans, fontSize: 14, fontWeight: 600, color: C.text }}>{item.name}</div>
              <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 4 }}>{item.meta}</div>
              <div style={{ marginTop: 8 }}>
                <a href={item.href} target="_blank" rel="noreferrer" style={actionStyle("#306fa8")}>
                  {item.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterBlock() {
  return (
    <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
      <section
        style={{
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          background: C.panel,
          padding: "20px 22px",
        }}
      >
        <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.24em", color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
          Güvenli Altyapı
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
          <FooterMeta icon="🔒" title="PayTR Güvenli Ödeme" subtitle="256-bit SSL · 3D Secure" />
          <FooterMeta icon="🧮" title="Kurumsal Destek Hattı" subtitle="NetGSM · SMS ve WhatsApp" />
          <FooterMeta icon="📧" title="E-Posta Adresi" subtitle="bilgi@narrehberi.com" />
          <FooterMeta icon="📍" title="Resmi Adres" subtitle="Kepez / ANTALYA" />
        </div>
      </section>

      <section
        style={{
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          background: C.panel,
          padding: "20px 22px",
        }}
      >
        <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.24em", color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
          Resmi Sosyal Medya
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: C.text,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.03)",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: C.sans,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <div style={{ textAlign: "center", color: "rgba(190,178,150,0.45)", fontFamily: C.sans, fontSize: 12, marginTop: 20 }}>
          © 2026 NAR REHBERİ · TÜM HAKLARI SAKLIDIR
        </div>
      </section>
    </div>
  );
}

function FooterMeta({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: C.sans, fontSize: 14, fontWeight: 600, color: C.text }}>{title}</div>
        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginTop: 4 }}>{subtitle}</div>
      </div>
    </div>
  );
}

export default function KategoriVitrin({
  coords,
  lang = "TR",
  liveVenues = [],
  globalArama = "",
  onDateDoctorOpen,
  onBeniSasirtOpen,
  onBireyselIlanFormuAc,
  bireyselIlanlar = [],
  showSysNotify,
  viewMode = "LIST",
  setViewMode,
}) {
  const [kahinOpen, setKahinOpen] = useState(false);
  const [canliDuvarOpen, setCanliDuvarOpen] = useState(false);
  const [query, setQuery] = useState(globalArama || "");
  const [contentFilter, setContentFilter] = useState("ALL");

  useEffect(() => {
    setQuery(globalArama || "");
  }, [globalArama]);

  const normalizedQuery = normalize(query.trim());

  const liveMap = useMemo(() => {
    return CATEGORY_CARDS.reduce((acc, card) => {
      if (card.type === "live") {
        acc[card.key] = enrichAndSortVenues(liveVenues.filter((venue) => venueMatchesCard(venue, card)), coords);
      }
      return acc;
    }, {});
  }, [coords, liveVenues]);

  const ilanMap = useMemo(() => {
    return {
      EMLAK: bireyselIlanlar.filter((ilan) => normalizeUpper(ilan?.kategori || ilan?.tip).includes("EMLAK")),
      ARAC: bireyselIlanlar.filter((ilan) => {
        const text = normalizeUpper(ilan?.kategori || ilan?.tip);
        return text.includes("ARAC") || text.includes("ARAÇ");
      }),
    };
  }, [bireyselIlanlar]);

  const allSearchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return enrichAndSortVenues(
      liveVenues.filter((venue) =>
        [venue.ad, venue.isim, venue.adres, venue.description, venue.mahalle, venue.kategori]
          .map(normalize)
          .join(" ")
          .includes(normalizedQuery),
      ),
      coords,
    ).slice(0, 10);
  }, [coords, liveVenues, normalizedQuery]);

  const visibleCards = useMemo(() => {
    return CATEGORY_CARDS.filter((card) => {
      const typePass =
        contentFilter === "ALL" ||
        (contentFilter === "LIVE" && card.type === "live") ||
        (contentFilter === "ILAN" && card.type === "ilan") ||
        (contentFilter === "INFO" && ["antik", "survival"].includes(card.type));

      if (!typePass) return false;

      return categoryMatches(card, normalizedQuery, liveMap[card.key] || [], ilanMap[card.formCategory] || []);
    });
  }, [contentFilter, ilanMap, liveMap, normalizedQuery]);

  const counts = useMemo(() => {
    const live = Object.values(liveMap).reduce((sum, items) => sum + items.length, 0);
    const ilan = Object.values(ilanMap).reduce((sum, items) => sum + items.length, 0);
    const info = CATEGORY_CARDS.filter((card) => ["antik", "survival"].includes(card.type)).length;
    return { live, ilan, info };
  }, [ilanMap, liveMap]);

  const showPromos = !normalizedQuery;

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 16px 80px" }}>
      {showPromos && (
        <div style={{ display: "grid", gap: 18, marginBottom: 28 }}>
          <div style={{ overflow: "hidden", borderRadius: 16, border: `1px solid ${C.line}` }}>
            <KahinTeaser onOpen={() => setKahinOpen(true)} lang={lang} />
          </div>

          <AnimatePresence>
            {kahinOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <KahinPanel
                  onClose={() => setKahinOpen(false)}
                  ilanlar={bireyselIlanlar}
                  lang={lang}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <PromoModule
              title="DATE DOCTOR"
              subtitle="Kusursuz buluşma planı"
              accent="#d4af37"
              borderAccent="rgba(212,175,55,0.28)"
              icon="🩺"
              onClick={onDateDoctorOpen}
            />
            <PromoModule
              title="BENİ ŞAŞIRT"
              subtitle="Nar Tech AI planlasın"
              accent="#e1584b"
              borderAccent="rgba(225,88,75,0.28)"
              badge="YENİ"
              icon="✨"
              onClick={onBeniSasirtOpen}
            />
          </div>

          <div
            style={{
              margin: "0 auto",
              width: "fit-content",
              maxWidth: "100%",
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(109,124,173,0.35)",
              background: "rgba(45,54,84,0.28)",
              color: "rgba(213,224,255,0.92)",
              fontFamily: C.sans,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textAlign: "center",
            }}
          >
            NAR REHBERİ · ANTALYA DEVLET TİYATROSU MÜDÜRLÜĞÜ İLE İŞ BİRLİĞİ İÇERİSİNDEDİR.
          </div>
        </div>
      )}

      <section style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)`, marginBottom: 12 }} />
        <div style={{ fontFamily: C.sans, fontSize: 11, letterSpacing: "0.28em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>
          Editörün Notu
        </div>
        <h2 style={{ fontFamily: C.serif, fontSize: "clamp(38px, 5vw, 54px)", fontWeight: 500, color: C.text, margin: 0 }}>
          Nar Seçimi Vitrin
        </h2>
        <p style={{ fontFamily: C.sans, fontSize: 16, color: C.muted, margin: "12px auto 0", maxWidth: 760, lineHeight: 1.7 }}>
          Antalya'nın seçkin rehberi · Konumunuza veya Google puanlarına göre dilediğiniz gibi sıralanır.
        </p>
      </section>

      <SectionToolbar
        contentFilter={contentFilter}
        setContentFilter={setContentFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        counts={counts}
      />

      {normalizedQuery && (
        <section style={{ marginBottom: 24, display: "grid", gap: 12 }}>
          <div style={{ fontFamily: C.sans, fontSize: 12, letterSpacing: "0.14em", color: C.gold, textTransform: "uppercase" }}>
            Arama Sonuçları · {query}
          </div>
          {allSearchResults.length > 0 ? (
            allSearchResults.map((venue) => <SearchResultCard key={venue.id || venue.ad || venue.isim} venue={venue} />)
          ) : (
            <div style={emptyBoxStyle()}>
              "{query}" için doğrudan mekan sonucu bulunamadı. Eşleşen kategoriler aşağıda listeleniyor.
            </div>
          )}
        </section>
      )}

      <section style={{ display: "grid", gap: 14 }}>
        {visibleCards.map((card) => (
          <CategoryCard
            key={card.key}
            card={card}
            venues={liveMap[card.key] || []}
            ilanlar={ilanMap[card.formCategory] || []}
            onOpenIlanForm={onBireyselIlanFormuAc}
            showSysNotify={showSysNotify}
            viewMode={viewMode}
          />
        ))}
      </section>

      {!normalizedQuery && (
        <div style={{ marginTop: 26, display: "grid", gap: 18 }}>
          <SecondaryModules onCanliDuvarOpen={() => setCanliDuvarOpen(true)} />
          <TimeSuggestion />
          <FooterBlock />
        </div>
      )}

      <AnimatePresence>
        {canliDuvarOpen && (
          <CanliDuvar data={CANLI_DUVAR_DATA} lang={lang} onKapat={() => setCanliDuvarOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
