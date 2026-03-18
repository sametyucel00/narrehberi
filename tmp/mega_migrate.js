
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { VENUES } from "../SRC/data/venues.js";

const firebaseConfig = {
    apiKey: "AIzaSyDVrufUynAnWdA7dBZ7PZjXYK6WcslU9r8",
    authDomain: "nar-rehberi-pro.firebaseapp.com",
    databaseURL: "https://nar-rehberi-pro-default-rtdb.firebaseio.com",
    projectId: "nar-rehberi-pro",
    storageBucket: "nar-rehberi-pro.firebasestorage.app",
    messagingSenderId: "712568563076",
    appId: "1:712568563076:web:a9c6f80d4ba8f5f4fe29d1",
    measurementId: "G-60H45904M0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data from KategoriVitrin.jsx
const ANTIK_ALANLAR = [
    {
        id: "kaleici", icon: "🏰", rozet: "UNESCO Adayı", rozetRenk: "#c9a227",
        konum: "Antalya Merkez", maps: "Kaleiçi Antalya tarihi kent",
        lat: 36.8849, lng: 30.7056,
        giris: { TR: "Ücretsiz", EN: "Free", RU: "Бесплатно", DE: "Kostenlos" },
        saat: { TR: "Her saat açık", EN: "Always open", RU: "Всегда открыто", DE: "Immer geöffnet" },
        sure: { TR: "2–4 saat", EN: "2–4 hours", RU: "2–4 часа", DE: "2–4 Stunden" },
        info: {
            TR: { baslik: "Kaleiçi — Tarihi Kent", ozet: "Roma surları, Osmanlı mahalleleri ve Akdeniz'in eşsiz manzarası. Antalya'nın 2.000 yıllık hafızası.", ozellik: ["Hadrian Kapısı (M.S. 130)", "Yivli Minare (13. yy)", "Saat Kulesi", "Antik Liman"], ipucu: "Sabah 07:00–09:00 arası en sakin vakittir. Güneş batarken liman manzarésı eşsizdir." },
            EN: { baslik: "Kaleiçi — Old City", ozet: "Roman walls, Ottoman quarters and a breathtaking Mediterranean view. 2,000 years of Antalya's memory.", ozellik: ["Hadrian's Gate (130 AD)", "Fluted Minaret (13th c.)", "Clock Tower", "Ancient Harbour"], ipucu: "Most peaceful between 07:00–09:00. Sunset view from the harbour is unmatched." },
            RU: { baslik: "Калейчи — Старый город", ozet: "Римские стены, османские кварталы и потрясающий вид на Средиземное море. 2000-летняя история Анталии.", ozellik: ["Ворота Адриана (130 г. н.э.)", "Рифлёный минарет (13 в.)", "Часовая башня", "Античная гавань"], ipucu: "Самое тихое время — 07:00–09:00. Закат над гаванью незабываем." },
            DE: { baslik: "Kaleiçi — Altstadt", ozet: "Römische Mauern, osmanische Viertel und ein atemberaubender Mittelmeerblick. 2.000 Jahre Geschichte.", ozellik: ["Hadriantor (130 n. Chr.)", "Gerilltes Minarett (13. Jh.)", "Uhrenturm", "Antiker Hafen"], ipucu: "Am ruhigsten zwischen 07:00–09:00. Der Sonnenuntergang am Hafen ist einmalig." },
        },
        timeline: [
            { year: 'M.Ö. 150', title: { TR: 'Kentin Kuruluşu', EN: 'Founding of the City' }, subtitle: { TR: 'ATTALOS\'UN VASİYETİ', EN: 'ATTALOS\'S LEGACY' }, text: { TR: "Bergama Kralı II. Attalos, askerlerine 'Gidin ve bana yeryüzündeki cenneti bulun' der. Askerler bugünkü Antalya'yı bulduklarında buranın o cennet olduğunu anlarlar.", EN: "Pergamon King Attalos II told his soldiers: 'Go and find me the paradise on earth.' Founded as Attaleia, the city became the Mediterranean's most strategic port." } },
            { year: 'M.S. 130', title: { TR: 'Hadrian\'ın Ziyareti', EN: 'Hadrian\'s Visit' }, subtitle: { TR: 'ÜÇ KAPILARIN GİZEMİ', EN: 'MYSTERY OF THE THREE GATES' }, text: { TR: "Roma İmparatoru Hadrian'ın kenti ziyareti onuruna 'Üç Kapılar' dediğimiz o görkemli zafer takı inşa edilir. Bu mermer yollar, Roma gücüyle birleşmenin en estetik kanıtıdır.", EN: "In honor of Roman Emperor Hadrian's visit, the magnificent triumphal arch we call 'Three Gates' was built. A timeless symbol of Roman power." } },
            { year: '1207', title: { TR: 'Selçuklu Fethi', EN: 'Seljuk Conquest' }, subtitle: { TR: 'TÜRK MÜHRÜ', EN: 'THE TURKISH SEAL' }, text: { TR: "Selçuklu Türkleri kenti fethettiğinde Kaleiçi'ne kendi damgalarını vururlar. Yivli Minare, kentin yeni silüetinin sembolü haline gelir.", EN: "When the Seljuk Turks conquered the city, they left their mark. The Fluted Minaret became the symbol of the city's new skyline." } },
            { year: 'Bugün', title: { TR: 'Yaşayan Hafıza', EN: 'Living Memory' }, subtitle: { TR: 'LABİRENT SOKAKLAR', EN: 'LABYRINTH STREETS' }, text: { TR: "Bugün Kaleiçi, her köşesinde bir sürpriz barındıran yaşayan bir müze. Arnavut kaldırımlı sokaklarda zamansız bir ruha yolculuk yaparsınız.", EN: "Today, Kaleiçi is a living museum with surprises at every corner. A timeless journey through cobbled streets." } }
        ]
    },
    {
        id: "aspendos", icon: "🎭", rozet: "M.Ö. 5. Yüzyıl", rozetRenk: "#9b8ec4",
        konum: "Serik, Antalya (47 km)", maps: "Aspendos Antik Tiyatrosu",
        lat: 36.9409, lng: 31.1721,
        giris: { TR: "₺ Ücretli (Müzekart geçerli)", EN: "Paid (Museum Card accepted)", RU: "Платно (Музейная карта)", DE: "Kostenpflichtig (Museumskarte)" },
        saat: { TR: "08:00–19:00 (yaz) / 08:00–17:00 (kış)", EN: "08:00–19:00 (summer) / 08:00–17:00 (winter)", RU: "08:00–19:00 (лето) / 08:00–17:00 (зима)", DE: "08:00–19:00 (Sommer) / 08:00–17:00 (Winter)" },
        sure: { TR: "1–2 saat", EN: "1–2 hours", RU: "1–2 часа", DE: "1–2 Stunden" },
        info: {
            TR: { baslik: "Aspendos Antik Tiyatrosu", ozet: "Dünyanın en iyi korunmuş Roma tiyatrosu. 15.000 kişilik kapasitesiyle hâlâ opera ve konser sahnesi.", ozellik: ["15.000 kişi kapasiteli sahne", "Akustik hâlâ kusursuz", "M.S. 155–162 inşaatı", "Uluslararası Opera Festivali (Eylül)"], ipucu: "Eylül'de Aspendos Opera ve Bale Festivali'ne denk getirin. Gece performansları için erken bilet alın." },
            EN: { baslik: "Aspendos Ancient Theatre", ozet: "The world's best-preserved Roman theatre. With 15,000-seat capacity, still hosts opera and concerts.", ozellik: ["15,000-seat stage", "Acoustics still perfect", "Built 155–162 AD", "International Opera Festival (September)"], ipucu: "Time your visit for the Aspendos Opera & Ballet Festival in September. Book evening tickets early." },
            RU: { baslik: "Античный театр Аспендос", ozet: "Лучший в мире сохранившийся римский театр. Вмещает 15 000 зрителей и до сих пор принимает оперу.", ozellik: ["Сцена на 15 000 мест", "Акустика по-прежнему идеальна", "Построен в 155–162 гг. н.э.", "Международный оперный фестиваль (сентябрь)"], ipucu: "Приезжайте в сентябре на фестиваль оперы и балета. Билеты на вечерние спектакли бронируйте заранее." },
            DE: { baslik: "Antikes Theater Aspendos", ozet: "Das am besten erhaltene römische Theater der Welt. Fasst 15.000 Zuschauer und ist noch heute Bühne für Oper.", ozellik: ["15.000 Sitzplätze", "Akustik noch immer perfekt", "Erbaut 155–162 n. Chr.", "Internationales Opernfestival (September)"], ipucu: "Besuchen Sie das Aspendos-Opern- und Balettfestival im September. Abendtickets frühzeitig buchen." },
        },
        timeline: [
            { year: 'M.S. 155', title: { TR: 'İlk Taş Yerleşiyor', EN: 'First Stone Placed' }, subtitle: { TR: 'İNŞAAT BAŞLANGICI', EN: 'CONSTRUCTION BEGINS' }, text: { TR: "Roma İmparatorluğu'nun en güçlü döneminde, İmparator Marcus Aurelius'un hükümranlığı altında Aspendos'ta büyük bir inşaat başlıyor. 15.000 kişilik bu yapı dünyayı büyüleyecek.", EN: "Under Emperor Marcus Aurelius, construction begins at Aspendos. A structure for 15,000 destined to amaze the world." } },
            { year: 'M.S. 200', title: { TR: 'Altın Çağ', EN: 'Golden Age' }, subtitle: { TR: 'ROMA İHTİŞAMI', EN: 'ROMAN MAGNIFICENCE' }, text: { TR: "Aspendos, Akdeniz'in en önemli ticaret merkezlerinden biri oldu. Akustik o kadar kusursuzdu ki, en arkadaki seyirci bile sahnedeki bir fısıltıyı duyabiliyordu.", EN: "Aspendos became a trade hub. Its acoustics were so perfect that even a whisper on stage could be heard from the back row." } },
            { year: '13. Yüzyıl', title: { TR: 'Selçuklu Mirası', EN: 'Seljuk Heritage' }, subtitle: { TR: 'SARAY VE KERVANSARAY', EN: 'PALACE AND CARAVANSERAI' }, text: { TR: "Sultan Alaeddin Keykubad yapıyı saray olarak kullandı. Selçuklu çinileri ve süslemeleri, iki büyük medeniyetin bu taşlarda buluştuğunun kanıtıdır.", EN: "Sultan Alaeddin Keykubad used the theatre as a palace, blending Seljuk art with Roman architecture." } },
            { year: 'Bugün', title: { TR: 'Yaşayan Sahne', EN: 'Living Stage' }, subtitle: { TR: 'MİLYONLARIN HAYRANLIĞI', EN: 'ADMIRED BY MILLIONS' }, text: { TR: "Aspendos bugün dünyanın en saygın festivallerinden birine ev sahipliği yapıyor. 2.000 yıl önceki gibi, sanatın büyüleyici etkisi aynı taşlarda devam ediyor.", EN: "Today, Aspendos remains a world-class stage, continuing its 2,000-year history of art." } }
        ]
    },
    {
        id: "perge", icon: "🏺", rozet: "M.Ö. 1000", rozetRenk: "#c07840",
        konum: "Aksu, Antalya (17 km)", maps: "Perge Antik Kenti Antalya",
        lat: 36.9615, lng: 30.8550,
        giris: { TR: "₺ Ücretli (Müzekart geçerli)", EN: "Paid (Museum Card accepted)", RU: "Платно (Музейная карта)", DE: "Kostenpflichtig (Museumskarte)" },
        saat: { TR: "08:00–19:00 (yaz) / 08:00–17:30 (kış)", EN: "08:00–19:00 (summer) / 08:00–17:30 (winter)", RU: "08:00–19:00 (лето) / 08:00–17:30 (зима)", DE: "08:00–19:00 (Sommer) / 08:00–17:30 (Winter)" },
        sure: { TR: "2–3 saat", EN: "2–3 hours", RU: "2–3 часа", DE: "2–3 Stunden" },
        info: {
            TR: { baslik: "Perge Antik Kenti", ozet: "Helenistik ve Roma dönemine ait olağanüstü bir şehir. Sütunlu caddeleri, stadyumu ve nymphaeum'uyla görülmesi zorunlu.", ozellik: ["Roma Stadyumu (12.000 koltuk)", "Sütunlu ana cadde", "Agora ve Bazilika", "Nymphaeum (çeşme anıtı)"], ipucu: "Perge heykellerinin büyük bölümü Antalya Müzesi'ndedir. Müze ziyaretiyle birleştirin." },
            EN: { baslik: "Perge Ancient City", ozet: "An extraordinary Hellenistic and Roman city. Its colonnaded streets, stadium and nymphaeum are unmissable.", ozellik: ["Roman Stadium (12,000 seats)", "Colonnaded main street", "Agora and Basilica", "Nymphaeum (monumental fountain)"], ipucu: "Most Perge sculptures are in Antalya Museum. Combine both visits for full context." },
            RU: { baslik: "Древний город Перге", ozet: "Выдающийся эллинистический и римский город. Колоннадные улицы, стадион и нимфей — обязательны к осмотру.", ozellik: ["Римский стадион (12 000 мест)", "Главная колоннадная улица", "Агора и базилика", "Нимфей (монументальный фонтан)"], ipucu: "Большинство скульптур Перге находится в Музее Анталии. Совместите оба посещения." },
            DE: { baslik: "Antike Stadt Perge", ozet: "Eine außergewöhnliche hellenistische und römische Stadt. Säulenstraßen, Stadion und Nymphaeum sind ein Muss.", ozellik: ["Römisches Stadion (12.000 Sitze)", "Hauptsäulenstraße", "Agora und Basilika", "Nymphaeum (monumentaler Brunnen)"], ipucu: "Die meisten Perge-Skulpturen befinden sich im Antalya-Museum. Beide Besuche kombinieren." },
        },
        timeline: [
            { year: 'M.Ö. 1200', title: { TR: 'Hatti Mirası', EN: 'Hattian Heritage' }, subtitle: { TR: 'PARHA\'NIN DOĞUŞU', EN: 'BIRTH OF PARHA' }, text: { TR: "Hitit tabletlerinde adı Parha olarak geçen Perge, Anadolu'nun en eski yerleşimlerinden biridir. Truva Savaşı'ndan dönen kahramanların izlerini taşıyan derin kökler.", EN: "Known as Parha in Hittite tablets, Perge is one of Anatolia's oldest settlements, founded by heroes of the Trojan War." } },
            { year: 'M.S. 2. Yüzyıl', title: { TR: 'Mermer Şehir', EN: 'The Marble City' }, subtitle: { TR: 'ROMA İHTİŞAMI', EN: 'ROMAN MAGNIFICENCE' }, text: { TR: "Roma dönemi Perge'nin devleştiği andır. Sütunlu caddeler, su kanalları ve devasa stadyum inşa edilir. Perge, dünyanın heykel başkenti haline gelir.", EN: "In the Roman era, Perge flourished with its colonnaded streets and monumental stadium, becoming the sculpture capital of the world." } },
            { year: 'M.S. 5. Yüzyıl', title: { TR: 'İnanç Merkezi', EN: 'Center of Faith' }, subtitle: { TR: 'AZİZ PAULOS\'UN YOLU', EN: 'ST. PAUL\'S JOURNEY' }, text: { TR: "Aziz Paulos ilk vaazlarından birini burada verir. Perge, Bizans döneminde önemli bir piskoposluk merkezi olur. İnanç ve mimari bu topraklarda harmanlanır.", EN: "St. Paul gave one of his first sermons here, making Perge a vital religious center in the Byzantine era." } },
            { year: 'Bugün', title: { TR: 'Heykeller Şehri', EN: 'City of Statues' }, subtitle: { TR: 'SESSİZ SÜTUNLAR', EN: 'SILENT COLUMNS' }, text: { TR: "Bugün Perge'de yürürken hala antik tekerlek izlerini görebilirsiniz. Perge, Antalya Müzesi'ndeki eşsiz heykellerin asıl ve derin evidir.", EN: "Walking through Perge today reveals ancient chariot tracks and the timeless rhythm of the Roman world." } }
        ]
    },
    {
        id: "termessos", icon: "⛰️", rozet: "Milli Park", rozetRenk: "#4caf7d",
        konum: "Güllük Dağı, Antalya (32 km)", maps: "Termessos Antik Kenti Antalya",
        lat: 37.0334, lng: 30.4658,
        giris: { TR: "₺ Ücretli (Müzekart + Milli Park)", EN: "Paid (Museum Card + National Park)", RU: "Платно (Музейная карта + нацпарк)", DE: "Kostenpflichtig (Museumskarte + Nationalpark)" },
        saat: { TR: "08:00–19:00 (yaz) / 08:00–17:00 (kış)", EN: "08:00–19:00 (summer) / 08:00–17:00 (winter)", RU: "08:00–19:00 (лето) / 08:00–17:00 (зима)", DE: "08:00–19:00 (Sommer) / 08:00–17:00 (Winter)" },
        sure: { TR: "3–5 saat (trekking)", EN: "3–5 hours (trekking)", RU: "3–5 часов (трекинг)", DE: "3–5 Stunden (Trekking)" },
        info: {
            TR: { baslik: "Termessos — Kartalların Yuvası", ozet: "Aleksandr'ın bile fethedemediği kayalık şehir. Güllük Dağı Milli Parkı içinde, 1.050 metre yükseklikte.", ozellik: ["Aleksander büyük kuşatma kuramadı", "Anadolu'nun en iyi korunmuş nekropolü", "Gürgen ve sedir ormanı", "Panoramik tiyatro (1.000 koltuk)"], ipucu: "Sabah erken gelin, öğleden sonra sis basar. Sağlam yürüyüş ayakkabısı şart. Su götürün." },
            EN: { baslik: "Termessos — Eagles' Nest", ozet: "The mountain city even Alexander the Great could not conquer. Inside Güllük Mountain National Park, at 1,050m altitude.", ozellik: ["Alexander couldn't besiege it", "Best-preserved necropolis in Anatolia", "Oak and cedar forest", "Panoramic theatre (1,000 seats)"], ipucu: "Arrive early morning — afternoon fog is common. Sturdy hiking shoes essential. Bring water." },
            RU: { baslik: "Термессос — Гнездо орлов", ozet: "Горный город, который не смог завоевать даже Александр Македонский. На высоте 1050 м в нацпарке Гюллюк.", ozellik: ["Александр не смог его осадить", "Лучший некрополь в Анатолии", "Дубовый и кедровый лес", "Панорамный театр (1000 мест)"], ipucu: "Приезжайте утром — после обеда часто туман. Нужна прочная обувь для ходьбы. Возьмите воду." },
            DE: { baslik: "Termessos — Adlernest", ozet: "Die Bergstadt, die selbst Alexander der Große nicht erobern konnte. Im Nationalpark Güllük-Berg, 1.050 m hoch.", ozellik: ["Alexander konnte es nicht belagern", "Besterhaltene Nekropole Anatoliens", "Eichen- und Zedernwald", "Panorama-Theater (1.000 Sitze)"], ipucu: "Morgens früh kommen — nachmittags oft Nebel. Festes Schuhwerk erforderlich. Wasser mitnehmen." },
        },
        timeline: [
            { year: 'M.Ö. 333', title: { TR: 'Boyun Eğmeyenler', EN: 'The Unbowed' }, subtitle: { TR: 'ALEKSANDR\'A DİRENİŞ', EN: 'RESISTANCE TO ALEXANDER' }, text: { TR: "Büyük İskender Termessos'un sarp kayalıklarını görür. 'Bu kartal yuvasını fethetmekle vakit harcayamam' diyerek geçer. İskender'in bile geçemediği nadir şehirlerdendir.", EN: "Alexander the Great, seeing the eagle's nest of Termessos, moved on: 'I cannot waste time conquering this nest.' An unconquered legend." } },
            { year: 'M.S. 1. Yüzyıl', title: { TR: 'Özgürlük Şehri', EN: 'City of Liberty' }, subtitle: { TR: 'ROMA DOSTLUĞU', EN: 'ROMAN FRIENDSHIP' }, text: { TR: "Roma Senatosu Termessos'u özgür müttefik ilan eder. Zirvedeki tiyatro, bu bağımsızlığın ve dağlarda yükselen medeniyetin en yüksek kürsüsüdür.", EN: "The Roman Senate recognized Termessos as a free ally. Its theatre stands as a monument to mountain-born liberty." } },
            { year: 'M.S. 243', title: { TR: 'Büyük Sarsıntı', EN: 'The Great Quake' }, subtitle: { TR: 'SESSİZLİĞE GÖMÜLÜŞ', EN: 'SINKING INTO SILENCE' }, text: { TR: "Büyük bir deprem kentin su yollarını yıkar. Şehir, kuşatılamayan surlarıyla doğanın kollarına emanet edilir. Zaman burada adeta mühürlenir.", EN: "A major earthquake shattered the water systems, forcing the city's abandonment. Time has been frozen in its silent walls since." } },
            { year: 'Bugün', title: { TR: 'Yaşayan Hafıza', EN: 'Living Memory' }, subtitle: { TR: 'GÖKYÜZÜ TİYATROSU', EN: 'SKY THEATRE' }, text: { TR: "Bugün Termessos, Anadolu'nun en vahşi ve dokunulmamış antik kenti. Bulutlarla ve tarihle baş başa kalacağınız bir gökyüzü tiyatrosu.", EN: "Today, Termessos remains the wildest ancient city in Anatolia. A sky-high theatre where history meets the clouds." } }
        ]
    },
];

const KONSOLOSLUKLAR = [
    { ulke: "Rusya", bayrak: "🇷🇺", tel: "+90 242 248 32 62", adres: "Konyaaltı, Antalya", maps: "Rusya Konsolosluğu Antalya" },
    { ulke: "Almanya", bayrak: "🇩🇪", tel: "+90 242 248 06 40", adres: "Elmalı Cd., Antalya", maps: "Almanya Fahri Konsolosluğu Antalya" },
    { ulke: "Ukrayna", bayrak: "🇺🇦", tel: "+90 242 330 20 10", adres: "Fener Mah., Antalya", maps: "Ukrayna Konsolosluğu Antalya" },
    { ulke: "İngiltere", bayrak: "🇬🇧", tel: "+90 242 244 53 13", adres: "Güzeloba, Antalya", maps: "İngiltere Konsolosluğu Antalya" },
    { ulke: "Hollanda", bayrak: "🇳🇱", tel: "+90 242 323 09 61", adres: "Antalya Merkez", maps: "Hollanda Fahri Konsolosluğu Antalya" },
    { ulke: "Belçika", bayrak: "🇧🇪", tel: "+90 242 248 25 00", adres: "Antalya Merkez", maps: "Belçika Fahri Konsolosluğu Antalya" },
];

const SURVIVAL_DATA = {
    acil: [
        { icon: "🚨", renk: "#e05555", tr: "Polis (Turizm)", en: "Police (Tourism)", ru: "Полиция (туризм)", de: "Polizei (Tourismus)", tel: "155", maps: "Antalya Turizm Polisi" },
        { icon: "🚑", renk: "#e05555", tr: "Ambulans", en: "Ambulance", ru: "Скорая помощь", de: "Krankenwagen", tel: "112", maps: "Antalya 112 Acil" },
        { icon: "🏥", renk: "#c04444", tr: "Şehir Hastanesi", en: "City Hospital", ru: "Городская больница", de: "Stadtspital", tel: "0242 276 50 00", maps: "Antalya Şehir Hastanesi" },
        { icon: "🏥", renk: "#c04444", tr: "Akdeniz Üni. Acil", en: "Akdeniz Uni. Emergency", ru: "Скорая помощь Акдениз", de: "Akdeniz Uni. Notaufnahme", tel: "0242 249 60 00", maps: "Akdeniz Üniversitesi Hastanesi" },
    ],
    pratik: [
        { icon: "✈️", renk: "#4a8fd4", tr: "Havalimanı (AYT)", en: "Airport (AYT)", ru: "Аэропорт (AYT)", de: "Flughafen (AYT)", tel: "0242 444 74 23", maps: "Antalya Havalimanı" },
        { icon: "🚌", renk: "#4a8fd4", tr: "HAVAŞ Transfer", en: "HAVAŞ Shuttle", ru: "Шаттл HAVAŞ", de: "HAVAŞ Shuttle", tel: "0242 330 36 30", maps: "HAVAŞ Antalya" },
        { icon: "🚖", renk: "#4a8fd4", tr: "Antalya Taksi", en: "Antalya Taxi", ru: "Такси Анталия", de: "Antalya Taxi", tel: "0242 230 31 40", maps: "Antalya Taksi Durağı" },
        { icon: "🚊", renk: "#4a8fd4", tr: "Tramvay (AntalyaKart)", en: "Tram (AntalyaCard)", ru: "Трамвай (AntalyaCard)", de: "Straßenbahn (AntalyaCard)", tel: "0242 444 00 77", maps: "Antalya Tramvay" },
        { icon: "💊", renk: "#44aa66", tr: "Nöbetçi Eczane", en: "On-duty Pharmacy", ru: "Дежурная аптека", de: "Notdienstapotheke", tel: "182", maps: "nöbetçi eczane antalya" },
        { icon: "🔑", renk: "#cc8833", tr: "7/24 Çilingir", en: "24h Locksmith", ru: "Слесарь 24/7", de: "Schlüsseldienst 24h", tel: "0544 333 22 11", maps: "çilingir antalya 7/24" },
    ],
    info: [
        { label: { TR: "Para Birimi", EN: "Currency", RU: "Валюта", DE: "Währung" }, value: "Türk Lirası (TRY / ₺)" },
        { label: { TR: "Zaman Dilimi", EN: "Timezone", RU: "Часовой пояс", DE: "Zeitzone" }, value: "UTC +3" },
        { label: { TR: "Musluk Suyu", EN: "Tap Water", RU: "Водопроводная вода", DE: "Leitungswasser" }, value: { TR: "Şebeke suyu içilmesi önerilmez, kapalı su tercih edin.", EN: "Not recommended for drinking, use bottled water.", RU: "Не рекомендуется пить, используйте воду в бутылках.", DE: "Nicht zum Trinken empfohlen, Flaschenwasser verwenden." } },
        { label: { TR: "Ulaşım", EN: "Transport", RU: "Транспорт", DE: "Verkehr" }, value: { TR: "Toplu taşıma için AntalyaKart gereklidir.", EN: "AntalyaCard is required for public transport.", RU: "Для общественного транспорта требуется карта AntalyaCard.", DE: "Für den öffentlichen Nahverkehr ist die AntalyaCard erforderlich." } },
        { label: { TR: "Turizm Ofisi", EN: "Tourism Office", RU: "Туристический офис", DE: "Tourismusbüro" }, value: "0242 247 76 60 (Cumhuriyet Meydanı)" },
    ],
};

const SURPRISE_SCENARIOS = [
    {
        id: 'fb1',
        ad: 'Kaleiçi Gizemi',
        mood: 'Romantik',
        step1: 'Yemek: Seraser Fine Dining',
        step2: 'Etkinlik: Devlet Tiyatrosu',
        step3: 'Keyif: Sheffield Pub',
        desc: 'Tarihin ve aşkın buluştuğu eşsiz bir rota.'
    },
    {
        id: 'fb2',
        ad: 'Lara Enerjisi',
        mood: 'Enerjik',
        step1: 'Yemek: Midye Lara',
        step2: 'Etkinlik: Holly Stone Performance Hall',
        step3: 'Keyif: Sheffield Pub',
        desc: 'Şehrin dinamik ritmine ayak uydurun.'
    },
    {
        id: 'fb3',
        ad: 'Sakin Huzur',
        mood: 'Sakin',
        step1: 'Yemek: Kıyı Restoran',
        step2: 'Etkinlik: Sahil Kitap Okuması',
        step3: 'Keyif: Bitki Çayı Deneyimi',
        desc: 'Ruhunuzu dinlendirecek huzurlu bir akşam.'
    }
];

const DATE_DOCTOR_CATEGORIES = [
    { id: '1', ad: 'İlk Buluşma', aciklama: 'Unutulmaz bir ilk izlenim', fiyat: "250 TL" },
    { id: '2', ad: 'Evlilik Teklifi', aciklama: 'Kusursuz an tasarımı', fiyat: "1500 TL" },
    { id: '3', ad: 'Yıldönümü', aciklama: 'Özel hissettiren bir akşam', fiyat: "500 TL" },
    { id: '4', ad: 'Barışma/Özür', aciklama: 'Buzları eritmek için', fiyat: "300 TL" },
    { id: '5', ad: 'Sürpriz', aciklama: 'Beklenmedik bir sevinç', fiyat: "400 TL" },
    { id: '6', ad: 'Sevgililer Günü', aciklama: 'Yılın en romantik günü', fiyat: "600 TL" },
    { id: '7', ad: 'İş Yemeği', aciklama: 'Etkileyici ve profesyonel', fiyat: "450 TL" },
    { id: '8', ad: 'Özel Misafir', aciklama: 'Ağırlama ve prestij', fiyat: "700 TL" },
];

const DATE_DOCTOR_VENUES = [
    { id: '1', ad: 'Seraser Fine Dining', adres: "Kaleiçi'nin kalbinde, Osmanlı konağında üstün mutfak sanatı", fotoUrl: 'https://picsum.photos/seed/seraser/800/400', butce: 'Premium', atmosfer: 'Eğlenceli', tercih: 'Alkolsüz', etiketler: "Lüks,Tarihi,Fine Dining,Kaleiçi" },
    { id: '2', ad: 'Vanilla Lounge', adres: "Modern ve tarihi doku bir arada", fotoUrl: 'https://picsum.photos/seed/vanilla/800/400', butce: 'Standart', atmosfer: 'Romantik', tercih: 'Alkollü', etiketler: "Romantik,Lounge,Kokteyl,Müzik" }
];

const EVENTS = [
    { id: "t1", kat: "Tiyatro", icon: "🎭", isim: "Othello (Antalya Devlet Tiyatrosu)", yer: "Haşim İşcan Kültür Merkezi - Sahne 1", tarih: "Her Cuma–Cumartesi", saat: "20:30", tel: "0242 243 60 26", maps: "Haşim İşcan Kültür Merkezi Antalya", not: "Liyakatli bir sahne performansı — biletler için biletinial.com", ay: [1, 2, 3, 11, 12], type: "event", active: true },
    { id: "t2", kat: "Tiyatro", icon: "🎭", isim: "Bekleme Odası (Antalya Devlet Tiyatrosu)", yer: "Haşim İşcan Kültür Merkezi - Küçük Sahne", tarih: "Çarşamba–Perşembe", saat: "20:00", tel: "0242 243 60 26", maps: "Haşim İşcan Kültür Merkezi Antalya", not: "Yalnızlaşan insanın trajedisi.", ay: [1, 2, 3, 10, 11, 12], type: "event", active: true },
    { id: "t3", kat: "Tiyatro", icon: "🎭", isim: "Medea", yer: "Atatürk Kültür Merkezi", tarih: "Cumartesi", saat: "20:30", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Sevginin en karanlık yüzü.", ay: [2, 3, 11, 12], type: "event", active: true },
    { id: "k1", kat: "Konser", icon: "🎵", isim: "Boğaziçi Caz Festivali – Antalya", yer: "Karaalioğlu Parkı Açık Sahne", tarih: "15–18 Mayıs", saat: "20:30", tel: "0242 249 17 47", maps: "Karaalioğlu Parkı Antalya", not: "Ücretsiz giriş. Açık hava.", ay: [5], type: "event", active: true },
    { id: "k2", kat: "Konser", icon: "🎸", isim: "Antalya Müzik Festivali", yer: "Aspendos Antik Tiyatro", tarih: "Temmuz", saat: "21:00", tel: "0242 735 10 34", maps: "Aspendos Antik Tiyatro Antalya", not: "Antik taşların altında müzik.", ay: [7], type: "event", active: true },
    { id: "k3", kat: "Konser", icon: "🎻", isim: "Devlet Senfoni Orkestrası", yer: "Atatürk Kültür Merkezi", tarih: "Her ay 1. Cumartesi", saat: "20:00", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Klasik müziğin başkenti.", ay: [1, 2, 3, 4, 5, 10, 11, 12], type: "event", active: true },
    { id: "k4", kat: "Konser", icon: "🥁", isim: "Antalya Caz Günleri", yer: "Kaleiçi Yat Limanı", tarih: "Haziran", saat: "20:00", tel: "0242 249 17 47", maps: "Kaleiçi Yat Limanı Antalya", not: "Tekne manzaralı açık hava sahnesinde caz.", ay: [6], type: "event", active: true },
    { id: "f1", kat: "Fuar", icon: "📚", isim: "Antalya Kitap Fuarı", yer: "Cam Piramit Kültür Merkezi", tarih: "Ocak sonu", saat: "10:00–20:00", tel: "0242 249 17 47", maps: "Cam Piramit Kültür Merkezi Antalya", not: "100+ yayınevi, imza günleri.", ay: [1], type: "event", active: true },
    { id: "f2", kat: "Fuar", icon: "🏡", isim: "Yörex Yöresel Ürünler Fuarı", yer: "Antalya Fuar Merkezi", tarih: "Mart", saat: "10:00–19:00", tel: "0242 316 00 00", maps: "Antalya Fuar Merkezi", not: "Türkiye'nin en büyük yöresel ürün fuarı.", ay: [3], type: "event", active: true },
    { id: "fe1", kat: "Festival", icon: "🎬", isim: "Altın Portakal Film Festivali", yer: "Atatürk Kültür Merkezi", tarih: "Ekim", saat: "Çeşitli", tel: "0242 238 54 00", maps: "Atatürk Kültür Merkezi Antalya", not: "Türkiye'nin en prestijli film festivali.", ay: [10], type: "event", active: true },
    { id: "fe2", kat: "Festival", icon: "🍊", isim: "Uluslararası Narenciye Festivali", yer: "Kepez Atatürk Meydanı", tarih: "Ocak", saat: "Tüm gün", tel: "0242 311 11 11", maps: "Kepez Atatürk Meydanı Antalya", not: "Şehrin rengi ve kokusu.", ay: [1], type: "event", active: true },
    { id: "fe3", kat: "Festival", icon: "🌊", isim: "Su Sporları Festivali", yer: "Konyaaltı Sahili", tarih: "Temmuz", saat: "09:00–18:00", tel: "0242 249 17 47", maps: "Konyaaltı Sahili Antalya", not: "Jet ski, sörf, parasailing gösterileri.", ay: [7], type: "event", active: true },
    { id: "fe4", kat: "Festival", icon: "🎪", isim: "Uluslararası Opera Festivali", yer: "Aspendos Antik Tiyatro", tarih: "Eylül", saat: "21:00", tel: "0242 735 10 34", maps: "Aspendos Antik Tiyatro Antalya", not: "Dünyanın en güzel sahnelerinden birinde opera.", ay: [9], type: "event", active: true },
    { id: "s1", kat: "Spor", icon: "🏃", isim: "Antalya Maratonu", yer: "Konyaaltı – Falezler", tarih: "Mart", saat: "08:00", tel: "0242 249 17 47", maps: "Konyaaltı Sahili Antalya", not: "Deniz manzaralı 42km.", ay: [3], type: "event", active: true },
    { id: "s2", kat: "Spor", icon: "⛷️", isim: "Saklıkent Kayak Sezonu", yer: "Saklıkent Kayak Merkezi", tarih: "Aralık–Mart", saat: "09:00–17:00", tel: "0242 744 30 50", maps: "Saklıkent Kayak Merkezi Antalya", not: "Denize 45dk, karda 1 gün.", ay: [12, 1, 2, 3], type: "event", active: true },
    { id: "s3", kat: "Spor", icon: "🚴", isim: "Likya Yolu Bisiklet Turu", yer: "Kalkan – Antalya", tarih: "Ekim–Kasım", saat: "Çok günlü", tel: "0242 249 17 47", maps: "Likya Yolu Antalya", not: "Türkiye'nin en güzel sahil bisiklet rotası.", ay: [10, 11], type: "event", active: true },
];

const SERVICES = [
    { id: "h1", kat: "Hastane", icon: "🏥", isim: "Akdeniz Üni. Hastanesi – Acil", tel: "0242 249 60 00", maps: "Akdeniz Üniversitesi Hastanesi Antalya acil", acil: true, renk: "#e05555", type: "service", active: true },
    { id: "h2", kat: "Hastane", icon: "🏥", isim: "Antalya Şehir Hastanesi – Acil", tel: "0242 276 50 00", maps: "Antalya Şehir Hastanesi acil", acil: true, renk: "#e05555", type: "service", active: true },
    { id: "h3", kat: "Hastane", icon: "🏥", isim: "Eğitim & Araştırma Hastanesi", tel: "0242 249 44 00", maps: "Antalya Eğitim Araştırma Hastanesi", acil: false, renk: "#c04444", type: "service", active: true },
    { id: "h4", kat: "Hastane", icon: "🏥", isim: "Özel Medline Hastanesi", tel: "0242 314 44 44", maps: "Medline Hastanesi Antalya", acil: false, renk: "#c04444", type: "service", active: true },
    { id: "e1", kat: "Eczane", icon: "💊", isim: "Nöbetçi Eczane – Resmi Liste", tel: "182", maps: "nöbetçi eczane antalya", acil: true, renk: "#44aa66", type: "service", active: true },
    { id: "v1", kat: "Veteriner", icon: "🐾", isim: "Antalya Veteriner Acil Klinik", tel: "0242 502 05 05", maps: "acil veteriner antalya 7/24", acil: true, renk: "#8877cc", type: "service", active: true },
    { id: "v2", kat: "Veteriner", icon: "🐾", isim: "Akdeniz Veteriner Kliniği", tel: "0242 311 22 33", maps: "veteriner kliniği antalya", acil: false, renk: "#8877cc", type: "service", active: true },
    { id: "c1", kat: "Yol Yardım", icon: "🚗", isim: "7/24 Oto Çekici Antalya", tel: "0542 777 88 99", maps: "oto çekici antalya 7/24", acil: true, renk: "#cc8833", type: "service", active: true },
    { id: "c2", kat: "Yol Yardım", icon: "🔧", isim: "Lastik & Yol Yardım", tel: "0532 444 55 66", maps: "yol yardım lastik antalya", acil: false, renk: "#cc8833", type: "service", active: true },
    { id: "ch1", kat: "Çilingir", icon: "🔑", isim: "7/24 Çilingir Antalya", tel: "0544 333 22 11", maps: "çilingir antalya 7/24 gece", acil: true, renk: "#d4af37", type: "service", active: true },
];

const COMMERCIAL_CATS = [
    {
        id: "saglik", icon: "🏥", label: "Sağlık",
        renk: "#e05555", ilanVar: false,
        sorular: [
            { q: "Özel hastane bilgisi almak istiyorum" },
            { q: "Diş kliniği arıyorum" },
            { q: "Fizik tedavi & fizyoterapi merkezi" },
            { q: "Hiperoks & oksijen terapisi" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: "En iyi, tek, birinci, uzman, garantili" KULLANMA. Sadece "hizmet veren, bu alanda çalışan" gibi nötr ifade kullan.
Kullanıcı sağlık/klinik konusunda bilgi istiyor. Samimi, bilgilendirici, doğrudan yönlendirici 2–3 cümle yaz. Son cümlede: "Nar Rehberi'nin bu alanda hizmet veren kliniklerinden biriyle sizi buluşturabiliriz. İlk görüşme ve detaylı bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "hukuk", icon: "⚖️", label: "Hukuk",
        renk: "#4a8fd4", ilanVar: false,
        sorular: [
            { q: "Boşanma avukatı arıyorum" },
            { q: "İcra ve borç süreci nasıl işler?" },
            { q: "İş hukuku — kıdem ve ihbar" },
            { q: "Miras ve tapu uyuşmazlığı" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: Avukatlık reklamında "en iyi, tek, uzman, başarılı, kazanan" KESİNLİKLE YASAK. Sadece "alanında çalışan, hizmet veren" kullan.
Kullanıcı hukuki konuda bilgi istiyor. Örnek ton: "Hukuki süreçler hem teknik hem duygusal olarak hassas dönemlerdir. Nar Rehberi'nin alanında çalışan avukatlarından biriyle sizi buluşturabiliriz. İlk görüşme ve detaylı bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Bu tarz samimi, bilgilendirici, yönlendirici 3–4 cümle yaz.`,
    },
    {
        id: "mali", icon: "📊", label: "Mali Müşavir",
        renk: "#44aa66", ilanVar: false,
        sorular: [
            { q: "Vergi beyannamesi süreci" },
            { q: "Şirket kuruluş aşamaları" },
            { q: "SGK ve bordro yönetimi" },
            { q: "Bireysel muhasebe desteği" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: "En iyi, tek, uzman, garantili" KULLANMA. Sadece "alanında çalışan, hizmet veren" kullan.
Kullanıcı mali müşavir/muhasebe konusunda bilgi istiyor. Samimi, bilgilendirici 2–3 cümle + "Nar Rehberi'nde bu alanda çalışan mali müşavirler hakkında bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "psikoloji", icon: "🧠", label: "Psikoloji",
        renk: "#9b8ec4", ilanVar: false,
        sorular: [
            { q: "Bireysel psikolojik destek" },
            { q: "Stres ve tükenmişlik hakkında bilgi" },
            { q: "Kişisel gelişim koçluğu" },
            { q: "Çocuk & ergen psikolojisi" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: "En iyi, tek, garantili sonuç" KULLANMA. Sadece "bu alanda hizmet veren" kullan.
Kullanıcı psikoloji/koçluk konusunda bilgi istiyor. Şefkatli, normalize edici 2–3 cümle + "Nar Rehberi'nde bu alanda hizmet veren psikolog ve koçlar hakkında bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "guzellik", icon: "✨", label: "Güzellik",
        renk: "#d4709a", ilanVar: false,
        sorular: [
            { q: "Saç ekim merkezi hakkında bilgi" },
            { q: "Spa & masaj merkezi" },
            { q: "Güzellik merkezi arıyorum" },
            { q: "Cilt bakımı & estetik" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: "En iyi, tek, garantili sonuç" KULLANMA. Sadece "hizmet veren" kullan.
Kullanıcı güzellik/estetik konusunda bilgi istiyor. Samimi, bilgilendirici 2–3 cümle + "Bu alanda hizmet veren merkezler hakkında bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "egitim", icon: "📚", label: "Eğitim",
        renk: "#e8914a", ilanVar: false,
        sorular: [
            { q: "Özel ders öğretmeni arıyorum" },
            { q: "Spor koçu & antrenör bilgisi" },
            { q: "Özel eğitim & rehabilitasyon" },
            { q: "Yabancı dil kursu" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. Nötr dil kullan; "en iyi, tek" gibi ifadeler kullanma.
Kullanıcı eğitim/özel ders konusunda bilgi istiyor. Destekleyici 2–3 cümle + "Nar Rehberi'nde kayıtlı öğretmen ve eğitimciler hakkında bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "terapi", icon: "🌿", label: "Alternatif Terapi",
        renk: "#5aaa77", ilanVar: false,
        sorular: [
            { q: "At terapisi hakkında bilgi" },
            { q: "Hidro terapi nedir, nasıl işler?" },
            { q: "Nefes & meditasyon çalışmaları" },
            { q: "Fizik tedavi & fizyoterapi" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. YASAL: "En iyi, tek, garantili" KULLANMA. Sadece "hizmet veren" kullan.
Kullanıcı alternatif terapi konusunda bilgi istiyor. İlham veren, merak uyandıran 2–3 cümle + "Bu alanda hizmet veren merkezler hakkında bilgi için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
    {
        id: "is", icon: "💼", label: "İş & Kariyer",
        renk: "#c4a020", ilanVar: true,
        ilanTipleri: [
            { tip: "İş Arıyorum", icon: "👤" },
            { tip: "Eleman Arıyorum", icon: "🏢" },
            { tip: "Freelance & Proje", icon: "💻" },
            { tip: "Staj İlanı", icon: "🎓" },
        ],
        sorular: [
            { q: "İş ararken nereden başlamalıyım?" },
            { q: "CV hazırlama süreci" },
            { q: "Serbest çalışmak istiyorum" },
            { q: "Staj ve yeni mezun fırsatları" },
        ],
        kahin_prompt: `Sen Nar Rehberi'nin şehir bilgi asistanısın. Kullanıcı iş/kariyer konusunda bilgi istiyor. Umut veren, pratik 2–3 cümle + "Nar Rehberi üye işletmelerinin ilanlarını görmek veya kendi ilanınızı vermek için 0850 302 79 46'yı arayabilir veya WhatsApp'tan yazabilirsiniz." Maksimum 4 cümle.`,
    },
];

function cleanObject(obj) {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

async function migrate() {
    console.log("Starting FINAL Mega Migration...");

    // 1. Venues
    console.log(`Migrating ${VENUES.length} venues...`);
    const CHUNK_SIZE = 400;
    for (let i = 0; i < VENUES.length; i += CHUNK_SIZE) {
        const chunk = VENUES.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(v => {
            const cleaned = cleanObject(v);
            const ref = cleaned.id ? doc(collection(db, "venues"), String(cleaned.id)) : doc(collection(db, "venues"));
            batch.set(ref, { ...cleaned, aktif: true, olusturma_tarihi: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
        console.log(`Venues: Committed chunk ${Math.floor(i / CHUNK_SIZE) + 1}`);
    }

    // 2. Historic Sites
    console.log(`Migrating Historic Sites...`);
    const historicBatch = writeBatch(db);
    ANTIK_ALANLAR.forEach(a => {
        const ref = doc(collection(db, "historic_sites"), a.id);
        historicBatch.set(ref, a, { merge: true });
    });
    await historicBatch.commit();

    // 3. Survival Kit
    console.log(`Migrating Survival Kit...`);
    const survivalBatch = writeBatch(db);
    const survivalRef = doc(collection(db, "survival_kit"), "main");
    survivalBatch.set(survivalRef, { data: SURVIVAL_DATA, consulates: KONSOLOSLUKLAR }, { merge: true });
    await survivalBatch.commit();

    // 4. Surprise Scenarios
    console.log(`Migrating Surprise Scenarios...`);
    const surpriseBatch = writeBatch(db);
    SURPRISE_SCENARIOS.forEach(s => {
        const ref = doc(collection(db, "surprise_scenarios"), s.id);
        surpriseBatch.set(ref, s, { merge: true });
    });
    await surpriseBatch.commit();

    // 5. Date Doctor
    console.log(`Migrating Date Doctor Data...`);
    const ddBatch = writeBatch(db);
    DATE_DOCTOR_CATEGORIES.forEach(c => {
        const ref = doc(collection(db, "date_doctor_categories"), c.id);
        ddBatch.set(ref, c, { merge: true });
    });
    DATE_DOCTOR_VENUES.forEach(v => {
        const ref = doc(collection(db, "date_doctor_venues"), v.id);
        ddBatch.set(ref, v, { merge: true });
    });
    await ddBatch.commit();

    // 6. City Pulse (Events & Services)
    console.log("Migrating City Pulse...");
    const pulseBatch = writeBatch(db);
    EVENTS.forEach(e => {
        const ref = doc(collection(db, "city_pulse"), e.id);
        pulseBatch.set(ref, e, { merge: true });
    });
    SERVICES.forEach(s => {
        const ref = doc(collection(db, "city_pulse"), s.id);
        pulseBatch.set(ref, s, { merge: true });
    });
    await pulseBatch.commit();

    // 7. Commercial Categories
    console.log("Migrating Commercial Categories...");
    const commBatch = writeBatch(db);
    COMMERCIAL_CATS.forEach(c => {
        const ref = doc(collection(db, "commercial_categories"), c.id);
        commBatch.set(ref, c, { merge: true });
    });
    await commBatch.commit();

    console.log("Final Mega Migration complete!");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
