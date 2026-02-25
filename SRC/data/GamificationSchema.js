/**
 * V11.1 NEM v1.0 — Kaşif ve Date Doctor ünvanları, kota-ödül eşleşmeleri.
 * Kaşif: Çırak → Efsane. Date Doctor: Aşk Asistanı → Profesör.
 */

/** Kaşif (Influencer/Gezgin) kariyer basamakları — Şehir Efsanesi'ne kadar */
export const KASIF_UNVANLARI = [
  { id: 'cırak', level: 1, label: 'Çırak', minRota: 0, maxRota: 4, nextLabel: 'Kılavuz' },
  { id: 'kılavuz', level: 2, label: 'Kılavuz', minRota: 5, maxRota: 14, nextLabel: 'Kaşif' },
  { id: 'kasif', level: 3, label: 'Kaşif', minRota: 15, maxRota: 49, nextLabel: 'Usta Kaşif' },
  { id: 'usta', level: 4, label: 'Usta Kaşif', minRota: 50, maxRota: 149, nextLabel: 'Efsane' },
  { id: 'efsane', level: 5, label: 'Şehir Efsanesi', minRota: 150, maxRota: Infinity, nextLabel: null },
];

/** Date Doctor (Aşk Akademisi) ünvanları — Profesörlüğe kadar */
export const DATE_DOCTOR_UNVANLARI = [
  { id: 'asistan', level: 1, label: 'Aşk Asistanı', minPlan: 0, maxPlan: 4, nextLabel: 'Danışman' },
  { id: 'danisman', level: 2, label: 'Aşk Danışmanı', minPlan: 5, maxPlan: 19, nextLabel: 'Uzman' },
  { id: 'uzman', level: 3, label: 'Aşk Uzmanı', minPlan: 20, maxPlan: 49, nextLabel: 'Profesör' },
  { id: 'profesor', level: 4, label: 'Profesör', minPlan: 50, maxPlan: Infinity, nextLabel: null },
];

/** Kota doldukça verilen ödüller: Kaşif (rota satış adedi), Date Doctor (plan adedi) */
export const KASIF_ODULLERI = [
  { kota: 5, odul: 'Bedava kahve (Nar Rehberi partner mekan)', type: 'kahve' },
  { kota: 15, odul: 'Bir öğün yemek (partner restoran)', type: 'yemek' },
  { kota: 30, odul: 'Özel rozet + uygulama içi badge', type: 'badge' },
  { kota: 50, odul: 'Üst segment deneyim çeki', type: 'deneyim' },
  { kota: 100, odul: 'Şehir Efsanesi sertifikası ve yıllık özel etkinlik daveti', type: 'sertifika' },
];

export const DATE_DOCTOR_ODULLERI = [
  { kota: 5, odul: 'Bedava kahve (Aşk Akademisi partner)', type: 'kahve' },
  { kota: 15, odul: 'Zen Pırlanta veya partner restoran indirimi', type: 'indirim' },
  { kota: 30, odul: 'Profesör adayı rozeti', type: 'badge' },
  { kota: 50, odul: 'Profesör ünvanı ve özel masa ayrıcalığı', type: 'unvan' },
];

/**
 * Kaşif için mevcut ünvan ve bir sonraki kota hedefi.
 * @param { number } satilanRotaAdedi
 * @returns {{ unvan: object, sonrakiKota: number | null, odul: object | null }}
 */
export function getKasifUnvan(satilanRotaAdedi) {
  const n = Math.max(0, satilanRotaAdedi);
  for (let i = KASIF_UNVANLARI.length - 1; i >= 0; i--) {
    if (n >= KASIF_UNVANLARI[i].minRota)
      return {
        unvan: KASIF_UNVANLARI[i],
        sonrakiKota: KASIF_UNVANLARI[i].maxRota !== Infinity ? KASIF_UNVANLARI[i].maxRota + 1 : null,
        odul: KASIF_ODULLERI.find((o) => o.kota > n) || null,
      };
  }
  return { unvan: KASIF_UNVANLARI[0], sonrakiKota: KASIF_UNVANLARI[0].maxRota + 1, odul: KASIF_ODULLERI[0] };
}

/**
 * Date Doctor için mevcut ünvan ve bir sonraki kota hedefi.
 * @param { number } tamamlananPlanAdedi
 * @returns {{ unvan: object, sonrakiKota: number | null, odul: object | null }}
 */
export function getDateDoctorUnvan(tamamlananPlanAdedi) {
  const n = Math.max(0, tamamlananPlanAdedi);
  for (let i = DATE_DOCTOR_UNVANLARI.length - 1; i >= 0; i--) {
    if (n >= DATE_DOCTOR_UNVANLARI[i].minPlan)
      return {
        unvan: DATE_DOCTOR_UNVANLARI[i],
        sonrakiKota: DATE_DOCTOR_UNVANLARI[i].maxPlan !== Infinity ? DATE_DOCTOR_UNVANLARI[i].maxPlan + 1 : null,
        odul: DATE_DOCTOR_ODULLERI.find((o) => o.kota > n) || null,
      };
  }
  return { unvan: DATE_DOCTOR_UNVANLARI[0], sonrakiKota: DATE_DOCTOR_UNVANLARI[0].maxPlan + 1, odul: DATE_DOCTOR_ODULLERI[0] };
}

/**
 * Kota doldu mu kontrolü — ödül bildirimi tetiklenebilir.
 * @param { 'kasif' | 'datedoctor' } tip
 * @param { number } mevcutAdet
 * @param { number } oncekiAdet
 * @returns {{ odulVerildi: boolean, odul: object | null }}
 */
export function checkKotaOdulu(tip, mevcutAdet, oncekiAdet) {
  const list = tip === 'kasif' ? KASIF_ODULLERI : DATE_DOCTOR_ODULLERI;
  const hit = list.find((o) => oncekiAdet < o.kota && mevcutAdet >= o.kota);
  return { odulVerildi: !!hit, odul: hit || null };
}
