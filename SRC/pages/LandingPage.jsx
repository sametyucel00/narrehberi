import React from 'react';
import SearchBar from '../components/SearchBar';
import LocationBar from '../components/LocationBar';
import TimeSuggestion from '../components/TimeSuggestion';

const QUICK_ICONS = [
  { id: 'cilingir', label: 'Çilingir', icon: '🔧' },
  { id: 'yemek', label: 'Yemek', icon: '🍕' },
  { id: 'kahve', label: 'Kahve', icon: '☕' },
  { id: 'taksi', label: 'Taksi', icon: '🚕' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-6 font-sans overflow-hidden">
      
      {/* 1. ÜST BAR: KONUM */}
      <div className="w-full max-w-md mb-16">
        <LocationBar />
      </div>

      {/* 2. ANA SORU (MERKEZİ OTORİTE) */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif text-white uppercase tracking-tighter mb-3">
          Neye ihtiyacın var Kadir?
        </h1>
        <p className="text-[10px] text-[#D4AF37] tracking-[0.4em] uppercase font-black opacity-80">
          Nar Akıllı Algoritma Emrinde
        </p>
      </div>

      {/* 3. ARAMA MOTORU (BÜYÜK FOCUS) */}
      <div className="w-full max-w-2xl mb-16 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
        <SearchBar placeholder="Hemen ara..." />
      </div>

      {/* 4. HIZLI ERİŞİM (QUICK ACTION GRID) */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-sm mb-24">
        {QUICK_ICONS.map(item => (
          <button key={item.id} className="flex flex-col items-center group transition-transform active:scale-90">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all">
              {item.icon}
            </div>
            <span className="text-[9px] mt-3 text-gray-500 uppercase tracking-[0.2em] font-medium group-hover:text-white transition-colors">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* 5. ALT BİLGİ: SAAT BAZLI ÖNERİ */}
      <div className="w-full max-w-md mt-auto pb-12">
        <TimeSuggestion />
      </div>
    </div>
  );
}