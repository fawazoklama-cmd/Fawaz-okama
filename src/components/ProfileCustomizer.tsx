import { useState, useEffect } from 'react';
import { Sparkles, Save, Shuffle, Check } from 'lucide-react';
import { Profile, Language } from '../types';
import { translations } from '../translations';

interface ProfileCustomizerProps {
  lang: Language;
  onSave: (profile: Profile) => void;
  initialProfile: Profile;
}

const EMOJIS = ['☁️', '🎮', '🐱', '🐼', '🦊', '🌟', '⚡', '🚀', '🍕', '🍩', '🫧', '✨', '🐬', '🐥', '🧩', '🦖'];
const SHAPES = ['circle', 'square', 'cloud', 'blob'] as const;
const COLORS = [
  { id: '#1E6FFF', name: 'colorBlue', bgClass: 'bg-[#1E6FFF]' },
  { id: '#FF8FC8', name: 'colorPink', bgClass: 'bg-[#FF8FC8]' },
  { id: '#FFFFFF', name: 'colorWhite', bgClass: 'bg-[#FFFFFF] border-2 border-gray-200' },
  { id: '#4DA3FF', name: 'Faw Soft Blue', bgClass: 'bg-[#4DA3FF]' },
  { id: '#FFB7E5', name: 'Man Soft Pink', bgClass: 'bg-[#FFB7E5]' }
];

export default function ProfileCustomizer({ lang, onSave, initialProfile }: ProfileCustomizerProps) {
  const t = translations[lang];

  const [username, setUsername] = useState(initialProfile.username);
  const [avatarShape, setAvatarShape] = useState<Profile['avatarShape']>(initialProfile.avatarShape);
  const [avatarColor, setAvatarColor] = useState(initialProfile.avatarColor);
  const [emoji, setEmoji] = useState(initialProfile.emoji);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Set default randomized names if empty
  const defaultPrefixes = ['Sparkle', 'Sky', 'Awan', 'Symmetrical', 'Pixel', 'Sonic', 'Super', 'Friendly'];
  const defaultNouns = ['Glider', 'Roller', 'Gamer', 'Explorer', 'Bubbler', 'Panda', 'Dolphin', 'Player'];

  const handleRandomize = () => {
    const randomPrefix = defaultPrefixes[Math.floor(Math.random() * defaultPrefixes.length)];
    const randomNoun = defaultNouns[Math.floor(Math.random() * defaultNouns.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    
    setUsername(`${randomPrefix}${randomNoun}${randomNum}`);
    setAvatarShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    setAvatarColor(COLORS[Math.floor(Math.random() * COLORS.length)].id);
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  };

  const handleSave = () => {
    const finalUsername = username.trim() || 'Anonymous Explorer';
    const updatedProfile: Profile = {
      id: initialProfile.id,
      username: finalUsername,
      avatarShape,
      avatarColor,
      emoji
    };
    onSave(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Shape rendering helper
  const renderAvatarPreview = () => {
    let shapeClass = "w-28 h-28 flex items-center justify-center text-5xl transition-all duration-300 shadow-lg relative border border-white/20 ";
    if (avatarShape === 'circle') {
      shapeClass += "rounded-full";
    } else if (avatarShape === 'square') {
      shapeClass += "rounded-3xl";
    } else if (avatarShape === 'cloud') {
      shapeClass += "rounded-t-3xl rounded-b-xl";
    } else if (avatarShape === 'blob') {
      shapeClass += "rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]";
    }

    return (
      <div 
        className={shapeClass} 
        style={{ backgroundColor: avatarColor }}
        id="avatar-preview-box"
      >
        <span className="drop-shadow-sm select-none animate-bounce">{emoji}</span>
        {/* Halo overlay glowing border corresponding to colors */}
        <div className="absolute inset-0 border-2 border-white/40 rounded-[inherit] pointer-events-none"></div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs max-w-2xl mx-auto my-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-100/50 rounded-2xl text-[#1E6FFF]">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 tracking-tight">
            {t.profileTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t.profileDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
        
        {/* Left column: Visual Avatar Preview Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200/50">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Preview</span>
          <div className="relative">
            {renderAvatarPreview()}
          </div>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white px-3 py-1.5 rounded-xl border border-gray-200 transition-all cursor-pointer active:scale-95 shadow-2xs mt-2"
          >
            <Shuffle size={14} className="text-[#1E6FFF]" />
            {t.randomize}
          </button>
        </div>

        {/* Right column: Form controls */}
        <div className="md:col-span-8 space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
              {t.usernameLabel}
            </label>
            <input
              type="text"
              maxLength={25}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. FawSkyRunner"
              className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E6FFF]/20 focus:border-[#1E6FFF] transition-all font-medium text-gray-800"
            />
          </div>

          {/* Avatar Shapes Select grid */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
              {t.avatarShapeLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setAvatarShape(shape)}
                  className={`py-2 text-xs font-medium border rounded-xl capitalize transition-all cursor-pointer ${
                    avatarShape === shape
                      ? "border-[#1E6FFF] bg-blue-50/50 text-[#1E6FFF] font-bold"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {shape === 'circle' ? t.shapeCircle : shape === 'square' ? t.shapeSquare : shape === 'cloud' ? t.shapeCloud : t.shapeBlob}
                </button>
              ))}
            </div>
          </div>

          {/* Colors selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
              {t.avatarColorLabel}
            </label>
            <div className="flex items-center gap-3">
              {COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setAvatarColor(col.id)}
                  title={col.name}
                  className={`w-9 h-9 rounded-full relative transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-90 ${col.bgClass}`}
                >
                  {avatarColor === col.id && (
                    <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                      <Check size={14} className={col.id === '#FFFFFF' ? "text-gray-800" : "text-white"} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Emojis tags */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
              {t.emojiTagLabel}
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200/50 rounded-2xl">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 flex items-center justify-center text-lg rounded-xl transition-all cursor-pointer hover:bg-white hover:scale-110 ${
                    emoji === em 
                    ? "bg-white border border-[#1E6FFF]/45 shadow-2xs scale-105" 
                    : "opacity-75"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Footer trigger button */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
        <span className="text-xs text-[#FF8FC8] font-bold">
          {t.noRomanticDisclaimer}
        </span>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 text-white font-bold text-sm transition-all shadow-md shadow-[#1E6FFF]/20 cursor-pointer active:scale-95"
        >
          {savedSuccess ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              {t.saveProfile}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
