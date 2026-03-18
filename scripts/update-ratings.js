import fs from "fs";
import path from "path";

// ⚠️ Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyAM7CBdHZjn2zK7-llRH3iZZqjk21MPJQY";

const VENUES_FILE_PATH = path.join(process.cwd(), "SRC", "data", "venues.js");

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGoogleRating(venueName, lat, lng) {
    try {
        // 1. Find Place by Name & Location
        const query = encodeURIComponent(venueName);
        let findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${GOOGLE_MAPS_API_KEY}`;

        if (lat && lng) {
            findUrl += `&locationbias=circle:1000@${lat},${lng}`;
        }

        const findRes = await fetch(findUrl);
        const findData = await findRes.json();

        if (findData.status !== "OK" || !findData.candidates || findData.candidates.length === 0) {
            console.log(`❌ Bulunamadı: ${venueName} (${findData.status})`);
            return null;
        }

        const placeId = findData.candidates[0].place_id;

        // 2. Get Details (rating + user_ratings_total)
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        if (detailsData.status === "OK" && detailsData.result) {
            return {
                rating: detailsData.result.rating,
                user_ratings_total: detailsData.result.user_ratings_total
            };
        } else {
            console.log(`⚠️ Detay alınamadı: ${venueName}`);
        }
    } catch (error) {
        console.error(`💥 Hata: ${venueName}`, error.message);
    }
    return null;
}

async function updateVenues() {
    console.log("🚀 Google Maps Puan Güncelleme Scripti Başlıyor...");

    if (!fs.existsSync(VENUES_FILE_PATH)) {
        console.error("❌ venues.js dosyası bulunamadı:", VENUES_FILE_PATH);
        return;
    }

    let fileContent = fs.readFileSync(VENUES_FILE_PATH, "utf-8");

    // Çok kaba bir parsing işlemi yerine, dosyadaki veriyi alıp json objesine çevirmemiz zor (export const VENUES_RAW...).
    // Bu yüzden Regex ile description veya yeni alanlar ekleyerek güncelleyeceğiz.
    // venues.js içerisinde "google_rating" ve "google_ratings_total" adında iki yeni anahtar ekleyeceğiz veya güncelleyeceğiz.

    // JavaScript objelerini regex ile yakalamak risklidir, ancak bu sadece script amaçlı düzgün formatlanmış dosya için kullanılabilir.
    // Daha güvenlisi: Dosyayı import edip işleyip tekrar yazmak. Ancak JS/ESM olduğu için okuyup değiştirmek için AST veya string replace gerekir.
    // Kolaylaştırılmış string okuma (Öncelikle nesneleri bulalım)

    const venueBlockRegex = /id:\s*["'](ven_\d+)["'][^}]+?ad:\s*["']([^"']+)["'][^}]+?lat:\s*([\d.]+)[^}]+?lng:\s*([\d.]+)/gs;
    let match;
    const updates = [];

    while ((match = venueBlockRegex.exec(fileContent)) !== null) {
        updates.push({
            id: match[1],
            ad: match[2],
            lat: parseFloat(match[3]),
            lng: parseFloat(match[4]),
            startIndex: match.index,
            endIndex: venueBlockRegex.lastIndex
        });
    }

    console.log(`Toplam ${updates.length} mekan yakalandı. İşlem uzun sürebilir, API limitlerine takılmamak için delay eklendi.`);

    let updatedContent = fileContent;
    let basarili = 0;

    for (let i = 0; i < updates.length; i++) {
        const venue = updates[i];
        console.log(`[${i + 1}/${updates.length}] Aranıyor: ${venue.ad}`);

        const googleData = await fetchGoogleRating(venue.ad, venue.lat, venue.lng);

        if (googleData) {
            console.log(`  ✅ Bulundu: Puan ${googleData.rating} - Yorum: ${googleData.user_ratings_total}`);

            // Regex ile ekleme/değiştirme
            // Varsa güncelle, yoksa description sonrasına ekle
            const idRegex = new RegExp(`id:\\s*["']${venue.id}["'].*?\\n(.*?description:.*?\\n)`, 's');

            updatedContent = updatedContent.replace(idRegex, (match, p1) => {
                // Eğer daha önce eklenmişse değiştir
                if (match.includes('google_rating:')) {
                    match = match.replace(/google_rating:\s*[\d.]+,\n/, `google_rating: ${googleData.rating},\n`);
                    match = match.replace(/google_ratings_total:\s*\d+,\n/, `google_ratings_total: ${googleData.user_ratings_total},\n`);
                    return match;
                } else {
                    // Eklenmemişse yapıştır
                    return match + `    google_rating: ${googleData.rating},\n    google_ratings_total: ${googleData.user_ratings_total},\n`;
                }
            });
            basarili++;
        }

        // Google API Rate Limitine takılmamak için saniyede maks 2-3 istek (find + details = 2 istek)
        await sleep(500);
    }

    fs.writeFileSync(VENUES_FILE_PATH, updatedContent, "utf-8");
    console.log(`\n🎉 Güncelleme Tamamlandı! Toplam ${basarili} mekanın puanı güncellendi.`);
}

updateVenues();
