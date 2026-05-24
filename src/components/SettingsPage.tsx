import { Settings, Languages, RotateCcw, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SettingsPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onResetData: () => void;
}

export default function SettingsPage({ lang, setLang, onResetData }: SettingsPageProps) {
  const t = translations[lang];

  return (
    <div className="max-w-xl mx-auto my-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-8">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-100/50 rounded-2xl text-[#FF8FC8]">
          <Settings size={22} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 tracking-tight">
            {t.settingsTitle}
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest mt-0.5">LOCAL PREFERENCES ENGINE</p>
        </div>
      </div>

      {/* Language system switcher row */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/50">
        <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
          <Languages size={16} className="text-[#1E6FFF]" />
          <span>{t.settingsLanguage}</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`py-3 text-sm font-semibold rounded-xl text-center cursor-pointer transition-all ${
              lang === 'en'
                ? "bg-[#1E6FFF] text-white font-extrabold shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-100/50"
            }`}
          >
            🇬🇧 English (EN)
          </button>
          
          <button
            type="button"
            onClick={() => setLang('id')}
            className={`py-3 text-sm font-semibold rounded-xl text-center cursor-pointer transition-all ${
              lang === 'id'
                ? "bg-[#FF8FC8] text-white font-extrabold shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-100/50"
            }`}
          >
            🇮🇩 Bahasa Indonesia (ID)
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Local Data cache */}
      <div className="space-y-4 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
          <ShieldAlert size={16} />
          <span>Danger Zone / Batas Bahaya</span>
        </div>
        
        <div className="p-4 bg-red-50/40 border border-red-100 rounded-2xl space-y-4">
          <p className="text-xs text-red-700/80 leading-relaxed font-normal">
            {lang === 'en'
              ? "Clearing your local cached profile data will destroy your current customized character shapes, nickname, and room sessions from this browser's localStorage instantly."
              : "Menghapus cache data profil lokal Anda akan menghapus bentuk karakter kustom kustomisasi, nama panggilan, serta sesi lobi Anda di browser ini saat ini."
            }
          </p>
          
          <button
            type="button"
            onClick={() => {
              if (window.confirm(lang === 'en' ? 'Are you sure you want to reset all data?' : 'Apakah Anda yakin ingin menghapus semua data lokal?')) {
                onResetData();
              }
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            {t.resetDataBtn}
          </button>
        </div>
      </div>

      {/* Meta Specs footer */}
      <div className="text-center pt-8 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-mono">
          {t.credits}
        </p>
      </div>

    </div>
  );
}
