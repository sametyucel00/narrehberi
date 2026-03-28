/**
 * V11.3 Geçici Merkez Hattı — Primary iletişim ve NetGSM standby.
 */

/** Geçici aktif iletişim numarası (Primary Route) */
export const PRIMARY_PHONE_DISPLAY = '+90 546 927 03 06';
export const PRIMARY_PHONE_RAW = '905469270306';
/** tel: ve wa.me için (ülke kodu + numara, boşluksuz) */
export const PRIMARY_PHONE_E164 = `+${PRIMARY_PHONE_RAW}`;

/** NetGSM & 0850: false = bildirimler konsola/simülasyon; true = canlı SMS/0850 */
export const isLive = false;
