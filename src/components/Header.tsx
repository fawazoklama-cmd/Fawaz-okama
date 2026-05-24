import { Dispatch, SetStateAction } from 'react';
import { Gamepad2, Mic, User2, Info, Settings, Languages, Users } from 'lucide-react';
import { Language, RoomState, Player } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
  lang: Language;
  setLang: (lang: Language) => void;
  room: RoomState | null;
  player: Player | null;
  onLeaveRoom: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  room,
  player,
  onLeaveRoom
}: HeaderProps) {
  const t = translations[lang];

  const menuItems = [
    { id: 'home', label: t.navHome, icon: Gamepad2 },
    { id: 'games', label: t.navGames, icon: Gamepad2 },
    { id: 'voice', label: t.navVoice, icon: Mic },
    { id: 'profile', label: t.navProfile, icon: User2 },
    { id: 'about', label: t.navAbout, icon: Info },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Symmetrical Dual Character Logo */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
            id="logo-brand"
          >
            <div className="flex items-center -space-x-1.5">
              {/* Faw Cloud Ball (Blue) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E6FFF] to-[#4DA3FF] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#1E6FFF]/20 animate-pulse">
                F
              </div>
              {/* Symmetrical Minimal Split Circle Center */}
              <div className="w-5 h-5 rounded-full bg-white border border-gray-200 z-10 flex items-center justify-center text-[8px] font-bold text-gray-500 shadow-xs">
                ×
              </div>
              {/* Man Cloud Ball (Pink) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8FC8] to-[#FFB7E5] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#FF8FC8]/20 animate-pulse">
                M
              </div>
            </div>
            
            <div className="hidden md:flex flex-col">
              <span className="font-heading font-extrabold text-[#1E6FFF] tracking-tight text-lg">
                Faw<span className="text-[#FF8FC8]">Man</span>
                <span className="text-gray-500 font-medium ml-1 text-sm bg-gray-100 px-1.5 py-0.5 rounded-full">Playground</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest leading-none mt-0.5">DUO SPHERE SYSTEM</span>
            </div>
          </div>

          {/* Connected Room Badge */}
          {room && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-gray-600 font-mono">
                {t.roomCode}: <span className="text-[#1E6FFF] font-bold">{room.code}</span>
              </span>
              <div className="h-3 w-[1px] bg-gray-200 hidden sm:block"></div>
              <span className="text-gray-500 text-[11px] hidden sm:inline flex items-center gap-1">
                <Users size={12} className="text-[#FF8FC8]" />
                {room.players.length}/10 {t.players}
              </span>
              <button
                onClick={onLeaveRoom}
                className="ml-2 text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded-md transition-colors"
              >
                {t.leaveRoom}
              </button>
            </div>
          )}

          {/* Language Switcher Fast Access */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200/80 bg-gray-50/50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all cursor-pointer shadow-xs active:scale-95"
              id="header-lang-switcher"
              aria-label="Toggle language"
            >
              <Languages size={14} className="text-[#1E6FFF]" />
              <span className="font-mono font-bold">{lang.toUpperCase()}</span>
            </button>
          </div>

        </div>

        {/* Responsive Horizontal Scroll Menu / Navigation Tab rail */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-2 border-t border-gray-50 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="flex space-x-1 min-w-max">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              // Custom highlighting colors depending on tabs
              const activeClass = isActive 
                ? "bg-gradient-to-r from-blue-50 to-pink-50 text-[#1E6FFF] border-b-2 border-b-[#1E6FFF]" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80";

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${activeClass}`}
                >
                  <Icon size={14} className={isActive ? "text-[#1E6FFF]" : "text-gray-400"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
