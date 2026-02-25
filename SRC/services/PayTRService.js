/**
 * V11.1 NEM v1.0 — Ödeme altyapısı (PayTR entegrasyonu).
 * V11.6 import.meta.env (Vite) uyumluluğu.
 */

function getEnv(key) {
  try {
    const env = typeof import.meta !== 'undefined' && import.meta.env;
    return (env?.[key] ?? '') || '';
  } catch (_) {
    return '';
  }
}

const PAYTR_BASE_URL = getEnv('VITE_PAYTR_URL') || getEnv('REACT_APP_PAYTR_URL') || 'https://www.paytr.com/odeme/api/get-token';

/**
 * PayTR ile ödeme token'ı alır (iframe/API).
 * @param {{ merchantOid: string, amount: number, userEmail: string, userPhone: string, userAddress: string, basket: array }} params
 * @returns {Promise<{ token?: string, error?: string }>}
 */
export async function createPaymentToken(params) {
  try {
    const { merchantOid, amount, userEmail, userPhone, userAddress, basket } = params || {};
    if (!amount || amount < 0) return { error: 'Geçersiz tutar' };
    // Gerçek entegrasyonda: merchant_id, merchant_key, merchant_salt ile imza + POST
    const payload = {
      merchant_oid: merchantOid || `NR_${Date.now()}`,
      email: userEmail || '',
      payment_amount: Math.round(amount * 100) / 100,
      user_phone: userPhone || '',
      user_address: userAddress || '',
      merchant_ok_url: window.location?.origin + '/odeme-tamam',
      merchant_fail_url: window.location?.origin + '/odeme-hata',
      user_basket: Array.isArray(basket) ? basket : [['Rota veya Plan', (payload.payment_amount / 100).toFixed(2), 1]],
    };
    // Stub: canlı ortamda PayTR API çağrısı
    if (typeof fetch !== 'undefined') {
      const res = await fetch(PAYTR_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        return { token: data?.token };
      }
    }
    return { token: `stub_${Date.now()}` };
  } catch (e) {
    return { error: e?.message || 'Ödeme başlatılamadı' };
  }
}

/**
 * Nar Rehberi komisyonu: satıştan %30 (Kaşif), plan/affiliate oranları ayrı.
 * @param { number } amount - Brüt tutar (TL)
 * @param { 'kashif' | 'datedoctor' | 'lead' } type
 * @returns { number } Net komisyon (TL)
 */
export function getNarCommission(amount, type = 'kashif') {
  const rates = { kashif: 0.3, datedoctor: 0.15, lead: 1 };
  const rate = type === 'datedoctor' ? 0.2 : type === 'lead' ? 0 : rates.kashif;
  if (type === 'lead') return Math.min(250, Math.max(120, amount * 0.5));
  return Math.round(amount * rate * 100) / 100;
}
