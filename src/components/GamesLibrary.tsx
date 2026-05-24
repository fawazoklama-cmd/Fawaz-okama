import { useState } from 'react';
import { Search, Gamepad2, Sparkles, Filter } from 'lucide-react';
import { GAMES_LIST } from '../gamesData';
import { Language, GameCategory } from '../types';
import { translations } from '../translations';

interface GamesLibraryProps {
  lang: Language;
  onSelectGame: (gameId: number) => void;
  activeGameId?: number | null;
}

const CATEGORIES: { id: GameCategory | 'all'; labelEN: string; labelID: string }[] = [
  { id: 'all', labelEN: 'All Games', labelID: 'Semua Game' },
  { id: 'puzzle', labelEN: 'Puzzle & Logic', labelID: 'Teka-Teki & Logika' },
  { id: 'reaction', labelEN: 'Reaction & Speed', labelID: 'Refleks & Reaksi' },
  { id: 'casual', labelEN: 'Casual Fun', labelID: 'Santai & Seru' },
  { id: 'strategy', labelEN: 'Strategy Board', labelID: 'Papan Strategi' },
  { id: 'party', labelEN: 'Party Games', labelID: 'Game Pesta' },
];

export default function GamesLibrary({ lang, onSelectGame, activeGameId }: GamesLibraryProps) {
  const t = translations[lang];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');

  // Filter list matching search phrase in EN or ID
  const filteredGames = GAMES_LIST.filter((game) => {
    const title = lang === 'en' ? game.titleEN : game.titleID;
    const desc = lang === 'en' ? game.descriptionEN : game.descriptionID;
    const rules = lang === 'en' ? game.rulesEN : game.rulesID;
    const matchesSearch = 
      title.toLowerCase().includes(search.toLowerCase()) || 
      desc.toLowerCase().includes(search.toLowerCase()) ||
      rules.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 my-4">
      {/* Sledge banner details */}
      <div className="bg-gradient-to-r from-[#1E6FFF]/5 to-[#FF8FC8]/5 border border-blue-100/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-800 flex items-center gap-2">
            <Gamepad2 className="text-[#1E6FFF]" />
            <span>{t.gameSelectionHeader}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'en' 
              ? "Choose any of our 50 detailed mini-games below. Play cooperatively, competitively, or try demo moves."
              : "Pilih salah satu dari 50 kategori game seru kami di bawah ini. Mainkan secara kooperatif, kompetitif, atau coba demo cepat."
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3.5 py-1.5 rounded-2xl shadow-2xs">
          <Sparkles size={16} className="text-[#FF8FC8]" />
          <span className="text-xs font-mono font-black text-[#1E6FFF]">50 / 50 {lang === 'en' ? "GAMES HOSTED" : "GAME AKTIF"}</span>
        </div>
      </div>

      {/* Search and Filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search bar */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-[#1E6FFF] transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
        </div>

        {/* Categories Tab selector */}
        <div className="md:col-span-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter size={14} className="text-gray-400 shrink-0 hidden sm:inline ml-2" />
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const label = lang === 'en' ? cat.labelEN : cat.labelID;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isCatActive
                    ? "bg-[#1E6FFF] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-100 hover:border-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of All 50 Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="games-grid">
          {filteredGames.map((game, idx) => {
            const isSelected = activeGameId === game.id;
            const gameTitle = lang === 'en' ? game.titleEN : game.titleID;
            const gameDesc = lang === 'en' ? game.descriptionEN : game.descriptionID;
            const gameRules = lang === 'en' ? game.rulesEN : game.rulesID;
            const gameWin = lang === 'en' ? game.winConditionEN : game.winConditionID;

            // Soft Category Tag style helper
            let categoryLabel = "";
            let categoryClass = "text-[10px] font-bold px-2 py-0.5 rounded-md ";
            if (game.category === 'puzzle') {
              categoryLabel = lang === 'en' ? 'Puzzle' : 'Logika';
              categoryClass += "bg-blue-50 text-[#1E6FFF] border border-blue-100/50";
            } else if (game.category === 'reaction') {
              categoryLabel = lang === 'en' ? 'Reflex' : 'Reaksi';
              categoryClass += "bg-amber-50 text-amber-600 border border-amber-100/50";
            } else if (game.category === 'casual') {
              categoryLabel = lang === 'en' ? 'Casual' : 'Santai';
              categoryClass += "bg-emerald-50 text-emerald-600 border border-emerald-100/50";
            } else if (game.category === 'strategy') {
              categoryLabel = lang === 'en' ? 'Strategy' : 'Strategi';
              categoryClass += "bg-indigo-50 text-indigo-600 border border-indigo-100/50";
            } else {
              categoryLabel = lang === 'en' ? 'Party' : 'Pesta';
              categoryClass += "bg-pink-50 text-[#FF8FC8] border border-pink-100/50";
            }

            return (
              <div
                key={game.id}
                id={`game-card-${game.id}`}
                className={`bg-white rounded-3xl border border-gray-100 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group ${
                  isSelected ? 'ring-2 ring-[#1E6FFF]' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header Badge Row */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-300">
                      #{String(game.id).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={categoryClass}>{categoryLabel}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-800 tracking-tight group-hover:text-[#1E6FFF] transition-colors leading-tight">
                      {gameTitle}
                    </h3>
                  </div>

                  {/* Description text */}
                  <p className="text-xs text-gray-500 leading-relaxed font-normal min-h-[36px]">
                    {gameDesc}
                  </p>

                  {/* Micro Specs Drawer collapse details */}
                  <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-500 border border-gray-100 space-y-1 group-hover:bg-blue-50/10 transition-colors">
                    <div>
                      <span className="font-bold text-gray-600">{lang === 'en' ? "Rules:" : "Aturan:"} </span>
                      {gameRules}
                    </div>
                    <div className="pt-1 border-t border-gray-200/50">
                      <span className="font-bold text-gray-600">{lang === 'en' ? "Win:" : "Menang:"} </span>
                      {gameWin}
                    </div>
                  </div>
                </div>

                {/* Card Button */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono">Duo + Multiplayer</span>
                  <button
                    onClick={() => onSelectGame(game.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-[#1E6FFF]/10 to-[#FF8FC8]/10 text-gray-700 hover:from-[#1E6FFF] hover:to-[#4DA3FF] hover:text-white cursor-pointer hover:shadow-xs active:scale-95"
                  >
                    {t.playNow}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-400 text-sm">No games matching &ldquo;{search}&rdquo; found.</p>
          <button 
            onClick={() => { setSearch(""); setSelectedCategory("all"); }}
            className="mt-3 text-[#1E6FFF] text-xs font-bold hover:underline"
          >
            Clear current filters
          </button>
        </div>
      )}
    </div>
  );
}
