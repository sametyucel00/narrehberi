/**
 * 💊 PHARMACY SERVICE - Nar Rehberi v12.8
 * Fetches "Pharmacies on Duty" (Nöbetçi Eczaneler) from stable sources.
 * 
 * Sources:
 * 1. CollectAPI Health API (Structured JSON - Proper)
 * 2. Scraping (Antalya Eczacı Odası - Fallback)
 * 
 * Developer Note: Set VITE_COLLECTAPI_KEY in your environment for the "Proper" API.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Helper to get environment variables via Vite's import.meta.env
function getEnv(key) {
    try {
        const env = typeof import.meta !== 'undefined' && import.meta.env;
        return (env?.[key] ?? '') || '';
    } catch (_) {
        return '';
    }
}

const COLLECTAPI_KEY = getEnv('VITE_COLLECTAPI_KEY');
const PROXY_URL = "/api/nobetci"; // Configured in vite.config.js

/**
 * Main Fetcher: Tries structured API first, then falls back to scraper.
 */
export async function fetchNobetciEczaneler() {
    const bugun = new Date().toLocaleDateString("tr-TR");

    // 1. Check Firebase Cache (Fresh for today)
    try {
        const docRef = doc(db, "sistem", "nobetci_eczaneler");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().tarih === bugun) {
            console.info("Pharmacy: Loaded from Firebase cache.");
            return docSnap.data().data;
        }
    } catch (err) {
        console.warn("Pharmacy: Firebase cache check failed.", err);
    }

    // 2. Try CollectAPI if key exists
    if (COLLECTAPI_KEY) {
        try {
            console.info("Pharmacy: Fetching from CollectAPI...");
            const response = await fetch("https://api.collectapi.com/health/dutyPharmacy?il=Antalya", {
                headers: {
                    "content-type": "application/json",
                    "authorization": `apikey ${COLLECTAPI_KEY}`
                }
            });
            const result = await response.json();

            if (result.success && result.result.length > 0) {
                const grouped = groupByIlce(result.result.map(p => ({
                    id: p.name + "-" + p.dist,
                    name: p.name,
                    tel: p.phone,
                    telLink: `tel:${p.phone}`,
                    adres: p.address,
                    mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`,
                    ilce: p.dist
                })));

                await updateCache(grouped, bugun);
                return grouped;
            }
        } catch (err) {
            console.error("Pharmacy: CollectAPI failed, falling back to scraper.", err);
        }
    }

    // 3. Robust Fallback Scraper (Official Source via Proxy)
    try {
        console.info("Pharmacy: Fetching from official scraper...");
        const res = await fetch(PROXY_URL, {
            headers: {
                "Accept": "text/html",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!res.ok) throw new Error("Ağ hatası: " + res.status);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const ilceler = Array.from(doc.querySelectorAll(".nobetciler .ilce"));
        if (ilceler.length === 0) throw new Error("Sayfa yapısı değişmiş veya veri yok.");

        const listByIlce = {};
        ilceler.forEach((ilceDiv) => {
            const ilceIsimNode = ilceDiv.querySelector(".ilcebas span");
            const ilceIsim = ilceIsimNode ? ilceIsimNode.textContent.trim() : "Dier";

            const eczaneler = Array.from(ilceDiv.querySelectorAll(".nobetciDiv"));
            const eczaneList = eczaneler.map((eczane, idx) => {
                const nameNode = eczane.querySelector(".col-md-4 .hucre-ortala a");
                const telNode = eczane.querySelectorAll(".col-md-4 .hucre-ortala a")[1];
                const adresNode = eczane.querySelector(".col-md-8 .nadres");

                return {
                    id: `${ilceIsim}-${idx}`,
                    name: nameNode ? nameNode.textContent.trim() : "Eczane",
                    tel: telNode ? telNode.textContent.trim() : "",
                    telLink: telNode?.getAttribute("href") || "",
                    adres: adresNode ? adresNode.textContent.trim() : "",
                    mapsLink: adresNode?.getAttribute("href") || ""
                };
            });

            if (eczaneList.length > 0) listByIlce[ilceIsim] = eczaneList;
        });

        await updateCache(listByIlce, bugun);
        return listByIlce;

    } catch (err) {
        console.error("Pharmacy: Scraper failed.", err);
        throw err;
    }
}

/**
 * Updates Firebase Cache for the day.
 */
async function updateCache(data, tarih) {
    try {
        const docRef = doc(db, "sistem", "nobetci_eczaneler");
        await setDoc(docRef, { tarih, data });
        console.info("Pharmacy: Firebase cache updated.");
    } catch (err) {
        console.error("Pharmacy: Cache update failed.", err);
    }
}

/**
 * Group flat list by district (ilçe).
 */
function groupByIlce(list) {
    return list.reduce((acc, curr) => {
        const key = curr.ilce || "Diğer";
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});
}
