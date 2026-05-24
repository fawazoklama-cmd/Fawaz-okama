/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Gamepad2, Mic, User2, Info, ArrowRight, ShieldCheck, HeartOff, Sparkles, Languages } from 'lucide-react';
import Header from './components/Header';
import ProfileCustomizer from './components/ProfileCustomizer';
import GamesLibrary from './components/GamesLibrary';
import GameRoom from './components/GameRoom';
import VoiceChat from './components/VoiceChat';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/SettingsPage';
import { Profile, Language, RoomState, Player } from './types';
import { translations } from './translations';

export default function App() {
  // Global Bilingual state stored in LocalStorage
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('fawman_lang');
    return (saved === 'id' ? 'id' : 'en') as Language;
  });

  // Track active navigation tabs
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Track user Profile State cached in LocalStorage
  const [playerProfile, setPlayerProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('fawman_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Random default initial profile matching specs
    const randomId = `p-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const shapes: Profile['avatarShape'][] = ['circle', 'square', 'cloud', 'blob'];
    const emojis = ['🎈', '🎨', '🧩', '🚀', '🐤', '🐼', '🦊', '⚡', '🐬'];
    
    return {
      id: randomId,
      username: `Teammate${Math.floor(10 + Math.random() * 90)}`,
      avatarShape: shapes[Math.floor(Math.random() * shapes.length)],
      avatarColor: '#1E6FFF', // Blue Faw default
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
  });

  // Track active room session
  const [room, setRoom] = useState<RoomState | null>(null);

  // Sync lang changes to storage
  useEffect(() => {
    localStorage.setItem('fawman_lang', lang);
  }, [lang]);

  // Sync profile changes to storage
  useEffect(() => {
    localStorage.setItem('fawman_profile', JSON.stringify(playerProfile));
  }, [playerProfile]);

  // Reset local cache trigger
  const handleResetData = () => {
    localStorage.removeItem('fawman_profile');
    localStorage.removeItem('fawman_lang');
    
    // Set default randomized states
    const defaultId = `p-${Date.now()}`;
    const defaultProfile: Profile = {
      id: defaultId,
      username: "GuestCompanion",
      avatarShape: "circle",
      avatarColor: "#FF8FC8", // Man Pink Default
      emoji: "🫧"
    };
    
    setPlayerProfile(defaultProfile);
    setLang('en');
    setRoom(null);
    setCurrentTab('home');
    alert(translations[lang].dataClearedMsg);
  };

  const handleProfileSave = (updated: Profile) => {
    setPlayerProfile(updated);
    // If in an active room, push changes to the server to update teammate displays
    if (room && room.code !== "000000") {
      fetch(`/api/rooms/${room.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: updated })
      }).catch(() => {});
    }
  };

  // Sync voice indicators state modifications up to backend
  const handleVoiceStateChange = async (isMicOn: boolean, usePTT: boolean, isSpeaking: boolean) => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: playerProfile.id,
            isMicOn,
            usePTT,
            isSpeaking
          })
        });
      } else {
        // Local state reflection
        const nextPlayers = room.players.map((p) => {
          if (p.id === playerProfile.id) {
            return { ...p, isMicOn, usePTT, isSpeaking };
          }
          return p;
        });
        setRoom({ ...room, players: nextPlayers });
      }
    } catch (e) {}
  };

  const onSelectGameFromLibrary = (gameId: number) => {
    // If room session exists, trigger game start in that room code
    if (room) {
      // API call to select the active game
      fetch(`/api/rooms/${room.code}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SELECT_GAME",
          payload: { gameId }
        })
      }).then(() => {
        setCurrentTab('room');
      }).catch(() => {
        // Fallback for local practice
        setRoom({
          ...room,
          activeGameId: gameId,
          gameState: {
            gameId,
            turnPlayerId: playerProfile.id,
            board: null,
            score: { [playerProfile.id]: 0, "man-partner": 0 },
            status: "playing",
            winnerId: null,
            clicks: {},
            speedScores: {},
            seed: Math.random()
          }
        });
        setCurrentTab('room');
      });
    } else {
      // Solo demo mode: Setup room lobby auto
      const defaultLocalRoom: RoomState = {
        code: "000000",
        players: [
          { ...playerProfile, isHost: true, isMicOn: false, usePTT: false, isSpeaking: false, score: 0, lastActive: Date.now() },
          { id: "man-partner", username: "Companion (Man)", avatarShape: "circle", avatarColor: "#FF8FC8", emoji: "🤍", isHost: false, isMicOn: false, usePTT: false, isSpeaking: false, score: 0, lastActive: Date.now() }
        ],
        activeGameId: gameId,
        gameState: {
          gameId,
          turnPlayerId: playerProfile.id,
          board: null,
          score: { [playerProfile.id]: 0, "man-partner": 0 },
          status: "playing",
          winnerId: null,
          clicks: {},
          speedScores: {},
          seed: Math.random()
        },
        chat: [],
        lastUpdated: Date.now()
      };
      setRoom(defaultLocalRoom);
      setCurrentTab('room');
    }
  };

  const handleLeaveRoom = () => {
    setRoom(null);
    setCurrentTab('home');
  };

  // Content translating dictionary ref
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E6FFF]/5 via-white to-[#FF8FC8]/5 flex flex-col font-sans text-gray-800">
      
      {/* Dynamic Navigation Header */}
      <Header 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        room={room}
        player={playerProfile}
        onLeaveRoom={handleLeaveRoom}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* TAB 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-12 py-4">
            {/* Sky Pastel Hero Banner */}
            <div className="bg-gradient-to-br from-white via-sky-50/60 to-pink-50/40 border border-white rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden shadow-2xs">
              
              {/* Symmetrical background cloud structures */}
              <div className="absolute top-12 left-10 w-24 h-12 bg-white/70 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-12 right-12 w-32 h-16 bg-white/60 rounded-full blur-xl animate-pulse"></div>

              <div className="max-w-3xl mx-auto space-y-4">
                {/* Symmetrical Cloud minimal badges */}
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6FFF]"></span>
                  <span className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Safe Cozy Hub</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF8FC8]"></span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight leading-none">
                  Faw<span className="text-[#FF8FC8]">Man</span> Playground
                </h1>
                
                <p className="text-base sm:text-lg font-medium text-gray-600 leading-tight">
                  {t.tagline}
                </p>
                
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                  {t.disclaimer}
                </p>

                {/* Symmetrical Main CTAs row */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                  {/* Enter room lobbies button */}
                  <button
                    onClick={() => setCurrentTab('room')}
                    className="px-6 py-3.5 rounded-2xl bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 shadow-md shadow-[#1E6FFF]/15 text-white font-extrabold text-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <Gamepad2 size={18} />
                    <span>Lobby Rooms</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Explore library cards list button */}
                  <button
                    onClick={() => setCurrentTab('games')}
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-100/60 border border-gray-200 shadow-2xs text-gray-700 font-extrabold text-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    Explore 50 Games
                  </button>
                </div>
              </div>
            </div>

            {/* Symmetrical Brand Concept / Non-Romantic Disclaimer bar */}
            <div className="bg-white/90 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-pink-100/30 text-[#FF8FC8] rounded-xl shrink-0">
                  <HeartOff size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
                    Friendly & Platonic Teammates Space
                  </h4>
                  <p className="text-xs text-gray-500 leading-tight">
                    {t.noRomanticDisclaimer}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 font-mono shrink-0 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-3xs">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>COP_VERIFY APPROVED</span>
              </div>
            </div>

            {/* Platform Feature Bento Box grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 Card (50 detailed games) */}
              <div 
                onClick={() => setCurrentTab('games')}
                className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#1E6FFF]/30 shadow-3xs hover:shadow-xs transition-all duration-300 cursor-pointer space-y-4 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-100/40 text-[#1E6FFF] flex items-center justify-center">
                  <Gamepad2 size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-800 group-hover:text-[#1E6FFF] transition-colors leading-tight">
                    50 Casual Game Nodes
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal font-normal">
                    Search and launch fully functional Tic-Tac-Toe grids, typing reflexes, emoji trivia, word stories, and co-op gliders instantly.
                  </p>
                </div>
              </div>

              {/* Feature 2 Card (Voice Chat Room) */}
              <div 
                onClick={() => setCurrentTab('voice')}
                className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#FF8FC8]/30 shadow-3xs hover:shadow-xs transition-all duration-300 cursor-pointer space-y-4 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-pink-100/40 text-[#FF8FC8] flex items-center justify-center">
                  <Mic size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-800 group-hover:text-[#FF8FC8] transition-colors leading-tight">
                    Dedicated Voice Channels
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal font-normal">
                    Live mic audio decibel visuals with low-latency push-to-talk toggling and integrated noise reduction filters seamlessly.
                  </p>
                </div>
              </div>

              {/* Feature 3 Card (Profile Customizer) */}
              <div 
                onClick={() => setCurrentTab('profile')}
                className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-blue-100 shadow-3xs hover:shadow-xs transition-all duration-300 cursor-pointer space-y-4 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
                  <User2 size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-800 group-hover:text-[#1E6FFF] transition-colors leading-tight">
                    Character Cust_mizations
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal font-normal">
                    Finetune cloud/blob avatar shapes, faw blue or man pink theme colors, and cool emoji expression badges kept safely on local caching.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: LIBRARY PAGE */}
        {currentTab === 'games' && (
          <GamesLibrary 
            lang={lang}
            onSelectGame={onSelectGameFromLibrary}
            activeGameId={room?.activeGameId}
          />
        )}

        {/* TAB 3: GAME ROOM / LOBBY ARENA */}
        {currentTab === 'room' && (
          <GameRoom 
            lang={lang}
            playerProfile={playerProfile}
            room={room}
            setRoom={setRoom}
            setCurrentTab={setCurrentTab}
          />
        )}

        {/* TAB 4: VOICE CHAT */}
        {currentTab === 'voice' && (
          <VoiceChat 
            lang={lang}
            player={playerProfile}
            partners={activeConnectedPartner(room, playerProfile.id)}
            onVoiceStateChange={handleVoiceStateChange}
          />
        )}

        {/* TAB 5: PROFILE PAGE */}
        {currentTab === 'profile' && (
          <ProfileCustomizer 
            lang={lang}
            onSave={handleProfileSave}
            initialProfile={playerProfile}
          />
        )}

        {/* TAB 6: ABOUT PAGE */}
        {currentTab === 'about' && (
          <AboutPage lang={lang} />
        )}

        {/* TAB 7: SETTINGS PAGE */}
        {currentTab === 'settings' && (
          <SettingsPage 
            lang={lang}
            setLang={setLang}
            onResetData={handleResetData}
          />
        )}

      </main>

      {/* Symmetrical Flat Footer */}
      <footer className="w-full border-t border-gray-100 bg-white/60 py-5 text-center shrink-0">
        <p className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-wide">
          FawMan Playground • Clean Blue & Pink Cloud Hub • All rights reserved &copy; 2026.
        </p>
      </footer>

    </div>
  );
}

// Minimal helper to grab remote partners lists in Voice channel
function activeConnectedPartner(room: RoomState | null, meId: string): Player[] {
  if (!room) return [];
  return room.players.filter(p => p.id !== meId);
}
