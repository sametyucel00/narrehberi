/**
 * V11.1 NEM v1.0 — Ödeme altyapısı (PayTR entegrasyonu).
 * V11.8 API tabanlı token alımı.
 */

const API_BASE_URL = '/api';

/**
 * PayTR ile ödeme token'ı alır (iframe için).
 * @param {{ amount: number, userEmail: string, userName: string, userPhone: string, userAddress: string, basket: array }} params
 * @returns {Promise<{ token?: string, error?: string }>}
 */
export async function createPaymentToken(params) {
  try {
    const { amount, userEmail, userName, userPhone, userAddress, basket } = params || {};

    if (!amount || amount < 1) {
      return { error: 'Minimum ödeme tutarı 1 TL olmalıdır.' };
    }

    const merchant_oid = `NR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Sepet formatı: [ [ürün adı, birim fiyat, adet] ]
    const final_basket = Array.isArray(basket) && basket.length > 0
      ? basket
      : [['Nar Puan Yükleme', amount.toString(), 1]];

    const response = await fetch(`${API_BASE_URL}/paytr-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        email: userEmail,
        user_name: userName || 'Nar Rehberi Kullanıcısı',
        user_phone: userPhone || '05555555555',
        user_address: userAddress || 'Antalya, Türkiye',
        merchant_oid,
        basket: final_basket
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return { token: data.token, merchant_oid };
    } else {
      return { error: data.reason || 'Token alınamadı' };
    }
  } catch (e) {
    console.error('PayTR Service Error:', e);
    return { error: 'Sunucuyla bağlantı kurulamadı.' };
  }
}

/**
 * Nar Rehberi komisyon hesaplama.
 */
export function getNarCommission(amount, type = 'kashif') {
  const rates = { kashif: 0.3, datedoctor: 0.2, lead: 0.5 };
  const rate = rates[type] || rates.kashif;
  return Math.round(amount * rate * 100) / 100;
}
