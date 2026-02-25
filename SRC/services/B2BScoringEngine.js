/**
 * V11.1 NEM v1.0 — B2B abonelik (Temel/Elit) ile Algoritma öneri skoru.
 * İşletmeler 2.500–7.500 TL aylık abonelikle Onaylı önerilerde üst sıralara tırmanır.
 */

/** Abonelik tipleri ve aylık band (TL) */
export const ABONELIK_TIPLERI = {
  temel: { id: 'temel', label: 'Temel', aylikMin: 2500, aylikMax: 4499, skorCarpani: 1 },
  elit: { id: 'elit', label: 'Elit', aylikMin: 4500, aylikMax: 7500, skorCarpani: 1.45 },
};

/**
 * İşletme abonelik tipine göre öneri skorunu hesaplar.
 * @param {{ baseSkor: number, abonelikTipi: 'temel' | 'elit' | null, ekPuan?: number }} params
 * @returns { number } 0–100 arası skor
 */
export function skorHesapla(params) {
  const { baseSkor = 50, abonelikTipi = null, ekPuan = 0 } = params || {};
  const tip = abonelikTipi && ABONELIK_TIPLERI[abonelikTipi] ? ABONELIK_TIPLERI[abonelikTipi] : ABONELIK_TIPLERI.temel;
  const carpan = tip.skorCarpani;
  const ham = Math.min(100, Math.max(0, (baseSkor * carpan) + ekPuan));
  return Math.round(ham * 100) / 100;
}

/**
 * Sıralama için işletme listesine skor ekler (dinamik).
 * @param { Array<{ id: string, ad: string, baseSkor?: number, abonelikTipi?: string }> } isletmeler
 * @returns { Array<{ id: string, ad: string, skor: number }> }
 */
export function isletmeleriSkorla(isletmeler) {
  return (isletmeler || []).map((i) => ({
    ...i,
    skor: skorHesapla({
      baseSkor: i.baseSkor ?? 50,
      abonelikTipi: i.abonelikTipi ?? 'temel',
      ekPuan: i.ekPuan ?? 0,
    }),
  })).sort((a, b) => (b.skor || 0) - (a.skor || 0));
}
