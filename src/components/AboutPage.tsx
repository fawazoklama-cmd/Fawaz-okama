import { Info, Sparkles, Smile, ShieldCheck, HeartOff } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AboutPageProps {
  lang: Language;
}

export default function AboutPage({ lang }: AboutPageProps) {
  const t = translations[lang];

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-8">
      {/* Intro hero banner */}
      <div className="bg-gradient-to-br from-white to-sky-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FC8]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1E6FFF]/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <div className="mx-auto w-12 h-12 bg-blue-50 flex items-center justify-center rounded-2xl text-[#1E6FFF] mb-4">
          <Info size={24} />
        </div>
        
        <h2 className="text-xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
          {t.aboutTitle}
        </h2>
        <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto mt-3 leading-relaxed">
          {t.aboutIntro}
        </p>
      </div>

      {/* Symmetrical Dual Brand Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faw Box */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E6FFF] flex items-center justify-center text-white font-bold shadow-md shadow-[#1E6FFF]/25">
              F
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#1E6FFF]">
                Faw (Cosmic Blue)
              </h3>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">CALM ENGINE</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed pt-2">
            {t.aboutBlueFaw}
          </p>
        </div>

        {/* Man Box */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8FC8] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF8FC8]/25">
              M
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#FF8FC8]">
                Man (Soft Pink)
              </h3>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">CREATIVE BOUNCE</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed pt-2">
            {t.aboutPinkMan}
          </p>
        </div>
      </div>

      {/* core features bullet points bento */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 space-y-6">
        <h3 className="text-base sm:text-xl font-heading font-extrabold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-[#FF8FC8]" />
          <span>Core Design Philosophies</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Platonic Safe */}
          <div className="p-4 bg-pink-50/30 rounded-2xl border border-pink-100/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-[#FF8FC8]">
              <HeartOff size={18} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-800">
              {lang === 'en' ? "100% Platonic Space" : "100% Platonic"}
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {lang === 'en' 
                ? "This website is free of match-making symbols or couple tracking. Simply two friends bonding over games."
                : "Bebas dari simbol cinta atau pelacakan pasangan romantis. Hanya dua kawan asyik bermain bersama."
              }
            </p>
          </div>

          {/* Zero Hassle */}
          <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E6FFF]">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-800">
              {lang === 'en' ? "No Login or Tracking" : "Bebas Login & Akun"}
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {lang === 'en'
                ? "Your customized character profile stays secure on your local localStorage sandbox. Fast and clean."
                : "Karakter Anda dilestarikan di laci penyimpanan lokal browser Anda sendiri. Aman tanpa gangguan."
              }
            </p>
          </div>

          {/* Fast Connectivity */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/55 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <Smile size={18} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-800">
              {lang === 'en' ? "50 Live Mini-Games" : "50 Permainan Aktif"}
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {lang === 'en'
                ? "From strategic chess mini-boards to extreme typing battles and memory grid games, all in one site."
                : "Dari papan catur mini hingga balap ketik kilat, tebak corat-coret, dan uji ingatan, lengkap satu lobi."
              }
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center pt-2 italic">
          {t.aboutGoal}
        </p>
      </div>
    </div>
  );
}
