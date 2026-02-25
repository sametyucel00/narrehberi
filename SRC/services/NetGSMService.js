/**
 * V11.1 NEM v1.0 — SMS & 0850 Onay Kodları / Ödül Bildirimleri (NetGSM).
 * V11.3 isLive: false = konsol/simülasyon; true = canlı NetGSM/0850.
 * V11.6 import.meta.env (Vite) + Safety Guard.
 */

import { isLive, PRIMARY_PHONE_RAW } from '../constants/Config';

/** Safety Guard: import.meta.env yoksa çökmemek için boş string. */
function getEnv(key) {
  try {
    const env = typeof import.meta !== 'undefined' && import.meta.env;
    if (!env) return '';
    return (env[key] ?? '') || '';
  } catch (_) {
    return '';
  }
}

const NETGSM_API = getEnv('VITE_NETGSM_API') || getEnv('REACT_APP_NETGSM_API') || 'https://api.netgsm.com.tr/sms/send/get';
const NAR_0850 = getEnv('VITE_NAR_0850') || getEnv('REACT_APP_NAR_0850') || '0850XXX'; // Canlıda gerçek 0850 numarası

/**
 * NetGSM ile SMS gönderir (Onay Kodu veya Ödül Bildirimi).
 * isLive false ise API çağrılmaz; konsola log + simülasyon (merkez hattına yönlendirme bilgisi).
 */
export async function sendSms(params) {
  const { gsm, message, msgHeader } = params || {};
  const normalizedGsm = String(gsm || '').replace(/\D/g, '');
  if (normalizedGsm.length < 10) return { ok: false, error: 'Geçersiz GSM' };
  if (!message?.trim()) return { ok: false, error: 'Mesaj boş' };

  if (!isLive) {
    console.log('[NetGSM Simülasyon]', { gsm: normalizedGsm, message: message.trim().substring(0, 160), msgHeader: msgHeader || 'NAR REHBERI', simülasyonHedef: PRIMARY_PHONE_RAW });
    return { ok: true, code: 'SIM' };
  }

  try {
    const body = new URLSearchParams({
      usercode: getEnv('VITE_NETGSM_USER') || getEnv('REACT_APP_NETGSM_USER') || '',
      password: getEnv('VITE_NETGSM_PASS') || getEnv('REACT_APP_NETGSM_PASS') || '',
      gsmno: normalizedGsm.length === 10 ? '0' + normalizedGsm : normalizedGsm,
      message: message.trim().substring(0, 160),
      msgheader: msgHeader || 'NAR REHBERI',
    });
    const res = await fetch(NETGSM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }).catch(() => null);
    const text = res ? await res.text() : '';
    const ok = String(text).trim().startsWith('0') || text === '00';
    return { ok, code: text };
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}

/**
 * Onay Kodu SMS'i (ödeme/üyelik doğrulama).
 * @param { string } gsm
 * @param { string } code - 4 veya 6 haneli kod
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendOnayKodu(gsm, code) {
  const message = `Nar Rehberi onay kodunuz: ${code}. Bu kodu kimseyle paylasmayin.`;
  return sendSms({ gsm, message, msgHeader: NAR_0850 });
}

/**
 * Ödül Bildirimi SMS'i (Kaşif/Date Doctor kota ödülleri: bedava kahve, yemek vb.).
 * @param { string } gsm
 * @param { string } odulMetni - Örn: "Kota odulunuz: Starbucks Erasta'da bedava kahve."
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendOdulBildirimi(gsm, odulMetni) {
  const message = `Nar Rehberi: ${odulMetni}`;
  return sendSms({ gsm, message, msgHeader: NAR_0850 });
}

/**
 * 0850 yönlendirme URL'i (acil hizmet). isLive false iken primary hattı kullanılır (Config).
 */
export function get0850RedirectUrl(serviceType = 'acil') {
  if (!isLive) return `tel:${PRIMARY_PHONE_RAW}`;
  const base = NAR_0850.replace(/\D/g, '');
  return `tel:${base}`;
}

export { NAR_0850 };
