/**
 * V11.1 NEM v1.0 — Acil hizmet lead kaydı (çilingir, çekici, veteriner).
 * V11.3 Tüm ticari CTAlar Config.PRIMARY_PHONE + WhatsApp şablonu.
 * V11.6 import.meta.env (Vite) uyumluluğu.
 */

import { get0850RedirectUrl } from './NetGSMService';
import { PRIMARY_PHONE_RAW } from '../constants/Config';

function getEnv(key) {
  try {
    const env = typeof import.meta !== 'undefined' && import.meta.env;
    return (env?.[key] ?? '') || '';
  } catch (_) {
    return '';
  }
}

const LEAD_COMMISSION_MIN = 120;
const LEAD_COMMISSION_MAX = 250;
const ACIL_HIZMET_KEYWORDS = /çilingir|cekici|çekici|veteriner|su tesisatı|su tesisati|tesisatçı|tesisatci|acil tamir|acil servis/i;

/** Hizmet adı (WhatsApp şablonu için) */
const HIZMET_ADI = { cilingir: 'Çilingir', cekici: 'Çekici', veteriner: 'Veteriner', tesisat: 'Tesisatçı' };

/**
 * Sorgunun acil hizmet (lead) gerektirip gerektirmediğini döner.
 * @param { string } query
 * @returns { boolean }
 */
export function isAcilHizmetQuery(query) {
  return ACIL_HIZMET_KEYWORDS.test(String(query || '').trim());
}

/**
 * Lead tipine göre komisyon (TL).
 * @param { 'cilingir' | 'cekici' | 'veteriner' | 'tesisat' } serviceType
 * @returns { number }
 */
export function getLeadCommission(serviceType) {
  const map = {
    cilingir: 200,
    cekici: 220,
    veteriner: 180,
    tesisat: 150,
  };
  return Math.min(LEAD_COMMISSION_MAX, Math.max(LEAD_COMMISSION_MIN, map[serviceType] ?? 185));
}

/**
 * Sorgudan lead tipi çıkarır.
 * @param { string } query
 * @returns { 'cilingir' | 'cekici' | 'veteriner' | 'tesisat' }
 */
export function getLeadTypeFromQuery(query) {
  const q = String(query || '').toLowerCase();
  if (/çilingir|cilingir/i.test(q)) return 'cilingir';
  if (/çekici|cekici/i.test(q)) return 'cekici';
  if (/veteriner/i.test(q)) return 'veteriner';
  if (/su tesisatı|su tesisati|tesisat/i.test(q)) return 'tesisat';
  return 'cilingir';
}

/**
 * Acil Yardım WhatsApp şablonu (Pre-Production Test): "Merhaba Nar Rehberi, [Hizmet Adı] konusunda acil desteğe ihtiyacım var."
 */
export function getAcilYardimWhatsAppMessage(serviceType) {
  const hizmetAdi = HIZMET_ADI[serviceType] || 'Acil Hizmet';
  return `Merhaba Nar Rehberi, ${hizmetAdi} konusunda acil desteğe ihtiyacım var.`;
}

/**
 * Primary hatta WhatsApp deep link (Config numarasına, şablon metinle).
 */
export function getAcilWhatsAppUrl(serviceType) {
  const text = encodeURIComponent(getAcilYardimWhatsAppMessage(serviceType));
  return `https://wa.me/${PRIMARY_PHONE_RAW}?text=${text}`;
}

/**
 * V11.4 Beni Şaşırt / genel rehberlik için WhatsApp linki (0546 927 03 06).
 */
export function getGenericRehberlikWhatsAppUrl() {
  const text = encodeURIComponent('Merhaba Nar Rehberi, rehberlik desteğine ihtiyacım var.');
  return `https://wa.me/${PRIMARY_PHONE_RAW}?text=${text}`;
}

/**
 * V11.4 Context Logging — komisyon takibi için konsola "Yönlendirme Yapıldı: [Hizmet Adı] - [Tarih]".
 */
export function logYonlendirme(hizmetAdi, meta = {}) {
  const tarih = new Date().toLocaleString('tr-TR');
  const msg = `Yönlendirme Yapıldı: ${hizmetAdi || 'Rehberlik'} - ${tarih}`;
  console.log(msg, meta);
}

/**
 * Lead kaydı oluşturur (API veya yerel log).
 * Tüm ticari yönlendirme: Config primary numaraya Ara + WhatsApp.
 * @param {{ query: string, userLocation?: string, userId?: string }} params
 * @returns {Promise<{ leadId: string, redirectUrl: string, callUrl: string, whatsappUrl: string }>}
 */
export async function createLeadRecord(params) {
  const { query, userLocation, userId } = params || {};
  const serviceType = getLeadTypeFromQuery(query);
  const leadId = `LEAD_${serviceType.toUpperCase()}_${Date.now()}`;
  const payload = {
    leadId,
    serviceType,
    query: String(query || '').trim(),
    userLocation: userLocation || null,
    userId: userId || null,
    timestamp: new Date().toISOString(),
    commission: getLeadCommission(serviceType),
  };
  try {
    const endpoint = getEnv('VITE_LEAD_API') || getEnv('REACT_APP_LEAD_API') || '/api/leads';
    if (typeof fetch !== 'undefined' && endpoint.startsWith('http')) {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (_) {}
  const hizmetAdi = HIZMET_ADI[serviceType] || 'Acil Hizmet';
  logYonlendirme(hizmetAdi, { leadId, serviceType });
  const callUrl = get0850RedirectUrl(serviceType);
  const whatsappUrl = getAcilWhatsAppUrl(serviceType);
  return {
    leadId,
    redirectUrl: callUrl,
    callUrl,
    whatsappUrl,
  };
}

/** V12.0 / V12.2 Conversion tracking — Global lead hook; kategorize rapor (Nar Raporu). */
const ADMIN_LEADS_KEY = 'nar_admin_leads';
const COMMISSION_PER_LEAD = 50;

/** V12.2 Kategoriler: AdminDashboard Nar Raporu dökümü. */
export const LEAD_CATEGORIES = {
  YEME_ICME: 'Yeme-İçme Leads',
  HIZMET_USTA: 'Hizmet/Usta Leads',
  OZEL_DENEYIM: 'Özel Deneyim Leads',
};

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function defaultByCategory() {
  return { YEME_ICME: 0, HIZMET_USTA: 0, OZEL_DENEYIM: 0 };
}

/**
 * V12.2 Global lead hook — Tüm modüller (App, DateDoctor, Beni Şaşırt, Usta) tek noktadan kayıt.
 * V12.5 Hizmet CTA: meta ile action_type, venue category, venue_id, timestamp kaydedilir.
 * @param {string} businessIdOrSource - İşletme id veya lead kaynağı (venue_id)
 * @param {'YEME_ICME'|'HIZMET_USTA'|'OZEL_DENEYIM'} category
 * @param {{ action_type?: string, category?: string, venue_id?: string, timestamp?: string }} [meta] - V12.5 call lead için
 */
export function trackLead(businessIdOrSource, category = 'YEME_ICME', meta = null) {
  const cat = LEAD_CATEGORIES[category] ? category : 'YEME_ICME';
  try {
    const key = getTodayKey();
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_LEADS_KEY) : null;
    const data = raw ? JSON.parse(raw) : {};
    const day = data[key] || { count: 0, byCategory: defaultByCategory(), leads: [] };
    day.count = (day.count || 0) + 1;
    day.byCategory = day.byCategory || defaultByCategory();
    day.byCategory[cat] = (day.byCategory[cat] || 0) + 1;
    day.lastLeadAt = new Date().toISOString();
    if (!day.leads) day.leads = [];
    const leadEntry = {
      businessId: businessIdOrSource || '',
      category: cat,
      ts: Date.now(),
      ...(meta && typeof meta === 'object' ? { action_type: meta.action_type || 'lead', venue_category: meta.category, venue_id: meta.venue_id, timestamp: meta.timestamp || new Date().toISOString() } : {}),
    };
    day.leads.push(leadEntry);
    data[key] = day;
    if (typeof localStorage !== 'undefined') localStorage.setItem(ADMIN_LEADS_KEY, JSON.stringify(data));
    logYonlendirme(LEAD_CATEGORIES[cat] || 'Lead', { businessId: businessIdOrSource, category: cat, ...meta });
  } catch (_) {}
}

/**
 * İşletme/mekan lead'ini kaydeder (localStorage). V12.2: trackLead(id, 'YEME_ICME') çağırır.
 * @param {string} businessId - İşletme/mekan id
 */
export function track(businessId) {
  trackLead(businessId || '', 'YEME_ICME');
}

/**
 * Bugünkü lead sayısı, komisyon ve kategorilere göre döküm (Nar Raporu).
 * @returns {{ count: number, commission: number, byCategory: { YEME_ICME: number, HIZMET_USTA: number, OZEL_DENEYIM: number } }}
 */
export function getTodayLeadStats() {
  try {
    const key = getTodayKey();
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_LEADS_KEY) : null;
    const data = raw ? JSON.parse(raw) : {};
    const day = data[key] || { count: 0, byCategory: defaultByCategory() };
    const count = day.count || 0;
    const byCategory = { ...defaultByCategory(), ...(day.byCategory || {}) };
    return { count, commission: count * COMMISSION_PER_LEAD, byCategory };
  } catch (_) {
    return { count: 0, commission: 0, byCategory: defaultByCategory() };
  }
}
