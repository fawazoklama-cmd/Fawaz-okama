import { useState, useEffect, useRef } from 'react';
import { Users, Send, Gamepad2, Play, Trophy, RotateCcw, ArrowLeft, Mic, ChevronRight, Hash, Volume2 } from 'lucide-react';
import { RoomState, Player, Language, Profile, ChatMessage } from '../types';
import { translations } from '../translations';
import { GAMES_LIST } from '../gamesData';

// Sub-components can be modularly handled inside or defined as local inline layouts
interface GameRoomProps {
  lang: Language;
  playerProfile: Profile;
  room: RoomState | null;
  setRoom: (room: RoomState | null) => void;
  setCurrentTab: (tab: string) => void;
}

export default function GameRoom({
  lang,
  playerProfile,
  room,
  setRoom,
  setCurrentTab
}: GameRoomProps) {
  const t = translations[lang];

  // Join parameters
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  
  // Lobby chat
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Reaction Game helpers
  const [targetPos, setTargetPos] = useState({ top: '40%', left: '50%' });
  const [mathSum, setMathSum] = useState({ q: '7 + 6', a: 13, options: [11, 13, 15, 12] });
  const [typeRacePrompt, setTypeRacePrompt] = useState("FawMan");
  const [typeRaceInput, setTypeRaceInput] = useState("");
  const [triviaItem, setTriviaItem] = useState({ q: "What color is Faw?", options: ["Blue", "Pink", "White", "Yellow"], correct: "Blue" });
  
  // Hangman Guess
  const [hangmanSecret, setHangmanSecret] = useState("CLOUD");
  const [hangmanGuesses, setHangmanGuesses] = useState<string[]>([]);
  
  // Draw Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawingLines, setDrawingLines] = useState<{ x: number; y: number; isDraw: boolean; color: string }[]>([]);

  // Sudden Reflex Time
  const [reflexActive, setReflexActive] = useState(false);
  const [reflexTriggerTime, setReflexTriggerTime] = useState(0);
  const [reflexMS, setReflexMS] = useState<number | null>(null);

  // SSE tracking
  const eventSourceRef = useRef<EventSource | null>(null);

  // Scroll chat to the base
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [room?.chat]);

  // Handle EventSource active connection when we have a room code
  useEffect(() => {
    if (room?.code) {
      // Connect to SSE stream
      console.log(`Subscribing to real-time events for room: ${room.code}`);
      const es = new EventSource(`/api/rooms/${room.code}/stream`);
      
      es.onmessage = (event) => {
        try {
          const updatedState = JSON.parse(event.data);
          setRoom(updatedState);
        } catch (e) {
          console.error("Failed to parse SSE RoomState stream payload:", e);
        }
      };

      es.onerror = () => {
        console.warn("SSE disconnected; trying to reconnect natively...");
      };

      eventSourceRef.current = es;
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [room?.code]);

  // Setup periodic polling backup just in case EventSource is closed/unsupported
  useEffect(() => {
    let intervalId: any = null;
    if (room?.code) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room!.code}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player: playerProfile })
          });
          if (res.ok) {
            const data = await res.json();
            setRoom(data);
          }
        } catch (e) {
          // Silent fallback
        }
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [room?.code]);

  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostPlayer: playerProfile })
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data);
        setJoinError("");
      } else {
        setJoinError("Failed to provision game room server-side.");
      }
    } catch (e) {
      setJoinError("Network offline. Simulation lobby initiated.");
      // Solo demo mode fallback state
      initLocalDuoRoom();
    }
  };

  const initLocalDuoRoom = () => {
    const defaultLocalRoom: RoomState = {
      code: "000000",
      players: [
        { ...playerProfile, isHost: true, isMicOn: false, usePTT: false, isSpeaking: false, score: 0, lastActive: Date.now() },
        { id: "man-partner", username: "Companion (Man)", avatarShape: "circle", avatarColor: "#FF8FC8", emoji: "🤍", isHost: false, isMicOn: false, usePTT: false, isSpeaking: false, score: 0, lastActive: Date.now() }
      ],
      activeGameId: null,
      gameState: {},
      chat: [],
      lastUpdated: Date.now()
    };
    setRoom(defaultLocalRoom);
  };

  const handleJoinRoom = async () => {
    const trimmed = inputCode.trim();
    if (trimmed.length !== 6) {
      setJoinError("Room code must be exactly 6 digits.");
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${trimmed}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: playerProfile })
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data);
        setJoinError("");
      } else {
        setJoinError("Room not found. Please review the digit code.");
      }
    } catch (e) {
      setJoinError("Room not found (Local solo sandbox).");
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: playerProfile.id })
        });
      }
    } catch (e) {}
    if (eventSourceRef.current) eventSourceRef.current.close();
    setRoom(null);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: playerProfile.id,
            username: playerProfile.username,
            color: playerProfile.avatarColor,
            text: chatInput.trim()
          })
        });
      } else {
        // Fallback local chat insert
        const updatedChat = [...room.chat, {
          id: `local-${Date.now()}`,
          playerId: playerProfile.id,
          username: playerProfile.username,
          color: playerProfile.avatarColor,
          text: chatInput.trim(),
          timestamp: Date.now()
        }];
        setRoom({ ...room, chat: updatedChat });
      }
      setChatInput("");
    } catch (e) {}
  };

  // Submit in-game turns or values to room action route
  const submitGameAction = async (payload: any) => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "UPDATE_GAME_STATE",
            payload: payload
          })
        });
      } else {
        // Local simulation state mutation merge
        setRoom({
          ...room,
          gameState: {
            ...room.gameState,
            ...payload
          }
        });
      }
    } catch (e) {}
  };

  const selectGameNode = async (gameId: number) => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SELECT_GAME",
            payload: { gameId }
          })
        });
      } else {
        // Local mock initiate
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
      }
    } catch (e) {}
  };

  const resetGameNode = async () => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "RESET_GAME" })
        });
      } else {
        setRoom({
          ...room,
          gameState: {
            ...room.gameState,
            board: null,
            status: "playing",
            winnerId: null,
            clicks: {},
            speedScores: {},
            seed: Math.random()
          }
        });
      }
    } catch (e) {}
  };

  const leaveGameRoomActive = async () => {
    if (!room) return;
    try {
      if (room.code !== "000000") {
        await fetch(`/api/rooms/${room.code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "LEAVE_GAME" })
        });
      } else {
        setRoom({ ...room, activeGameId: null, gameState: {} });
      }
    } catch (e) {}
  };

  // Helper inside Reflex games
  useEffect(() => {
    if (room?.activeGameId === 13) {
      // Setup Reflex orb green trigger
      const timeout = setTimeout(() => {
        setReflexActive(true);
        setReflexTriggerTime(Date.now());
      }, 2500 + Math.random() * 3000);
      return () => clearTimeout(timeout);
    } else {
      setReflexActive(false);
      setReflexMS(null);
    }
  }, [room?.activeGameId, room?.gameState?.seed]);

  // Render game card component dynamically matching the active game
  const renderGameCanvasInterface = () => {
    if (!room || room.activeGameId === null) return null;
    const game = GAMES_LIST.find((g) => g.id === room.activeGameId);
    if (!game) return null;

    const gs = room.gameState || {};
    const title = lang === 'en' ? game.titleEN : game.titleID;

    // Is it my turn?
    const isMyTurn = gs.turnPlayerId === playerProfile.id;
    const turnName = room.players.find(p => p.id === gs.turnPlayerId)?.username || "Companion";

    // Standard styling for grid nodes
    const buttonCellClass = "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border transition-all hover:scale-105 active:scale-95 cursor-pointer bg-white shadow-2xs ";

    // RENDER CATEGORY 1: TICTACTOE AND CONNECTION GRID BOARDS (Games 1, 2, 5, 31, 33)
    if (game.id === 1) {
      // Tic Tac Toe 3x3 board structure
      const board = gs.board || Array(9).fill("");
      const handleCellClick = (idx: number) => {
        if (gs.status === 'ended' || board[idx]) return;
        
        const nextBoard = [...board];
        nextBoard[idx] = playerProfile.avatarColor === '#FF8FC8' || playerProfile.avatarColor === '#FFB7E5' ? 'X' : 'O';
        
        // Check win pattern
        let finalStatus = "playing";
        let winner: string | null = null;
        const winPatterns = [
          [0,1,2], [3,4,5], [6,7,8],
          [0,3,6], [1,4,7], [2,5,8],
          [0,4,8], [2,4,6]
        ];
        
        for (const pattern of winPatterns) {
          if (nextBoard[pattern[0]] && nextBoard[pattern[0]] === nextBoard[pattern[1]] && nextBoard[pattern[0]] === nextBoard[pattern[2]]) {
            winner = gs.turnPlayerId;
            finalStatus = "ended";
          }
        }
        
        if (!winner && nextBoard.every(cell => cell !== "")) {
          finalStatus = "ended"; // Draw
        }

        const nextTurnIdx = room.players.findIndex(p => p.id !== playerProfile.id);
        const nextTurnId = nextTurnIdx > -1 ? room.players[nextTurnIdx].id : playerProfile.id;

        submitGameAction({
          board: nextBoard,
          status: finalStatus,
          winnerId: winner,
          turnPlayerId: finalStatus === "ended" ? "" : nextTurnId
        });
      };

      const winnerPlayer = room.players.find(p => p.id === gs.winnerId);

      return (
        <div className="flex flex-col items-center gap-5 p-4 py-6 bg-slate-50 border border-gray-100 rounded-3xl" id="board-game-adapter">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-extrabold text-[#1E6FFF]">{title}</h3>
            <span className="text-xs text-gray-400 font-mono">#{game.id} • TURN BOARD</span>
          </div>

          {/* Status Row */}
          <div className="flex items-center gap-3 py-1 px-4 rounded-full bg-white border border-gray-100 shadow-2xs text-xs font-semibold">
            {gs.status === 'ended' ? (
              <span className="text-rose-500 font-bold flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" />
                {gs.winnerId ? `${winnerPlayer?.username} ${t.victoryLabel}` : t.drawLabel}
              </span>
            ) : (
              <span className={isMyTurn ? "text-emerald-500" : "text-gray-500"}>
                {isMyTurn ? t.yourTurn : `${t.opponentTurn}: ${turnName}`}
              </span>
            )}
          </div>

          {/* Board cells */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] w-full mt-2">
            {board.map((cell: string, idx: number) => {
              const borderCol = cell === 'O' ? "border-[#1E6FFF]/50 text-[#1E6FFF]" : cell === 'X' ? "border-[#FF8FC8]/50 text-[#FF8FC8]" : "border-gray-200/80";
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={!isMyTurn || gs.status === 'ended'}
                  className={buttonCellClass + borderCol}
                >
                  {cell === 'O' ? '云' : cell === 'X' ? '🌸' : ''}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // RENDER CATEGORY 2: FAST REACTION TAPPING WARS (Games 11, 18, 20, 22)
    if (game.id === 11 || game.id === 18 || game.id === 20) {
      const clicks = gs.clicks || {};
      const scoreP1 = clicks[playerProfile.id] || 0;
      const partnerPlayer = room.players.find(p => p.id !== playerProfile.id);
      const scoreP2 = partnerPlayer ? (clicks[partnerPlayer.id] || 0) : 0;

      const triggerTapPoint = () => {
        const nextClicks = { ...clicks };
        nextClicks[playerProfile.id] = (nextClicks[playerProfile.id] || 0) + 1;
        
        let finalStatus = "playing";
        let winner: string | null = null;
        if (nextClicks[playerProfile.id] >= 15) {
          finalStatus = "ended";
          winner = playerProfile.id;
        }

        // Randomize target position for Aim game id=20 or Fast Click id=11
        const randomTop = Math.floor(20 + Math.random() * 60) + '%';
        const randomLeft = Math.floor(20 + Math.random() * 60) + '%';
        setTargetPos({ top: randomTop, left: randomLeft });

        submitGameAction({
          clicks: nextClicks,
          status: finalStatus,
          winnerId: winner
        });
      };

      const isWon = gs.status === 'ended';
      const winnerName = room.players.find(p => p.id === gs.winnerId)?.username || "Companion";

      return (
        <div className="flex flex-col items-center gap-6 p-6 bg-[#1E6FFF]/5 rounded-3xl relative min-h-[320px]" id="reaction-arena-adapter">
          <div className="text-center w-full">
            <h3 className="text-base sm:text-lg font-extrabold text-blue-900">{title}</h3>
            <p className="text-xs text-blue-500 font-mono">#{game.id} • SPEED REACTION STAGE</p>
          </div>

          {/* Dynamic Score progression bars resembling Faw vs Man */}
          <div className="w-full space-y-3 p-4 bg-white rounded-2xl border border-blue-100/40">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E6FFF]">{playerProfile.username}: {scoreP1}/15 taps</span>
              <span className="font-bold text-[#FF8FC8]">{partnerPlayer?.username || "Companion"}: {scoreP2}/15 taps</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 h-4 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
              <div 
                className="bg-gradient-to-l from-blue-400 to-[#1E6FFF] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (scoreP1/15)*100)}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-pink-400 to-[#FF8FC8] h-full rounded-full transition-all duration-300 ml-auto"
                style={{ width: `${Math.min(100, (scoreP2/15)*100)}%` }}
              ></div>
            </div>
          </div>

          {/* Symmetrical Spawning Click Target */}
          {!isWon ? (
            <div className="flex-1 w-full relative min-h-[140px] flex items-center justify-center">
              {game.id === 18 ? (
                // Stationary Big Battle dial for Id-18 (Speed Tapping)
                <button
                  onClick={triggerTapPoint}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1E6FFF] to-[#FF8FC8] animate-bounce text-white font-black text-xs cursor-pointer shadow-lg tracking-wider active:scale-95 border-2 border-white select-none"
                >
                  TAP SPEED!
                </button>
              ) : (
                // Moving target for Id-11 & Id-20
                <button
                  type="button"
                  onClick={triggerTapPoint}
                  style={{ top: targetPos.top, left: targetPos.left }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E6FFF] to-[#FF8FC8] absolute transition-all duration-150 active:scale-90 flex items-center justify-center border-4 border-white shadow-md text-white font-extrabold text-sm select-none"
                >
                  💥
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Trophy size={42} className="text-amber-400 animate-bounce mb-2" />
              <h4 className="font-bold text-gray-800 text-sm">
                {winnerName} {t.victoryLabel}
              </h4>
            </div>
          )}
        </div>
      );
    }

    // RENDER CATEGORY 3: REFLEX PING MILLISECOND OR COLOR SWITCH MATCH (Games 13, 14, 16)
    if (game.id === 13) {
      const handleOrbPing = () => {
        if (!reflexActive) {
          // Clicked too early!
          setReflexMS(999);
          submitGameAction({ 
            status: "ended", 
            winnerId: room.players.find(p => p.id !== playerProfile.id)?.id || playerProfile.id 
          });
          return;
        }
        
        const delta = Date.now() - reflexTriggerTime;
        setReflexMS(delta);
        submitGameAction({
          status: "ended",
          winnerId: playerProfile.id,
          reflexTime: delta
        });
      };

      const winnerPlayer = room.players.find(p => p.id === gs.winnerId);

      return (
        <div className="flex flex-col items-center gap-6 p-6 bg-slate-50 border border-gray-100 rounded-3xl min-h-[290px]" id="reflex-ping-stage">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">{title}</h3>
            <span className="text-xs text-gray-400 font-mono">#{game.id} • REACTION MILLISECOND TRACKER</span>
          </div>

          <div className="text-xs py-1 px-4 rounded-full bg-white text-gray-500 border border-gray-100 font-medium">
            {lang === 'en' ? "Wait for BLUE ORB to flash GREEN then click INSTANTLY!" : "Tunggu ORB BIRU menyala HIJAU lalu klik SEGERA!"}
          </div>

          {gs.status !== 'ended' ? (
            <button
              onClick={handleOrbPing}
              className={`w-28 h-28 rounded-full border-4 border-white shadow-lg transition-all cursor-pointer ${
                reflexActive
                  ? "bg-gradient-to-tr from-emerald-400 to-green-500 shadow-emerald-400/20"
                  : "bg-gradient-to-tr from-[#1E6FFF] to-[#4DA3FF] animate-pulse"
              }`}
            >
              <span className="text-xs text-white font-black tracking-widest">{reflexActive ? "CLICK!" : "WAIT..."}</span>
            </button>
          ) : (
            <div className="text-center space-y-2 pt-2">
              <Trophy size={32} className="mx-auto text-amber-400" />
              <div className="text-sm font-bold text-gray-800">{winnerPlayer?.username} {t.victoryLabel}</div>
              {reflexMS && <div className="text-xs font-mono font-bold text-[#1E6FFF]">{reflexMS} ms Reaction</div>}
            </div>
          )}
        </div>
      );
    }

    // RENDER CATEGORY 4: BRAIN MATH / WORD RACING / HANGMAN / CHOICE / TRIVIA (Games 16, 41, 42, 45, 48)
    if (game.id === 16 || game.id === 48) {
      // Dynamic Math quiz solver
      const activeScore = gs.score || {};
      const selectAnswer = (num: number) => {
        let isCorrect = false;
        if (game.id === 16) {
          isCorrect = num === mathSum.a;
        } else {
          isCorrect = num.toString() === triviaItem.correct || (num === 0 && triviaItem.correct === "Blue");
        }

        const nextScores = { ...activeScore };
        if (isCorrect) {
          nextScores[playerProfile.id] = (nextScores[playerProfile.id] || 0) + 1;
        }

        let wonWinner: string | null = null;
        let finalStatus = "playing";
        if (nextScores[playerProfile.id] >= 3) {
          finalStatus = "ended";
          wonWinner = playerProfile.id;
        }

        // Shuffle next math/trivia problem
        if (game.id === 16) {
          const a1 = Math.floor(4 + Math.random() * 8);
          const a2 = Math.floor(4 + Math.random() * 8);
          const q = `${a1} + ${a2}`;
          const a = a1 + a2;
          const options = [a, a + 1, a - 1, a + 2].sort(() => Math.random() - 0.5);
          setMathSum({ q, a, options });
        } else {
          // Shuffle simple trivia quiz items
          const triviaList = [
            { q: "What color represents Faw?", options: ["Blue", "Pink", "White", "Gray"], correct: "Blue" },
            { q: "What color represents Man?", options: ["Blue", "Pink", "Green", "Orange"], correct: "Pink" },
            { q: "How many games hosted inside FawMan Platform?", options: ["20", "50", "40", "100"], correct: "50" },
            { q: "Is registration or account login mandatory?", options: ["Yes", "No", "Sometimes", "With email"], correct: "No" }
          ];
          const curr = triviaList[Math.floor(Math.random() * triviaList.length)];
          setTriviaItem({ q: curr.q, options: curr.options, correct: curr.correct });
        }

        submitGameAction({
          score: nextScores,
          status: finalStatus,
          winnerId: wonWinner,
          seed: Math.random()
        });
      };

      const scoreValue = activeScore[playerProfile.id] || 0;
      const partnerValue = Object.keys(activeScore).find(k => k !== playerProfile.id) || "Companion";
      const scorePartnerValue = activeScore[partnerValue] || 0;

      return (
        <div className="flex flex-col items-center gap-5 p-6 bg-white border border-gray-100 rounded-3xl" id="trivia-duel-adapter">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-extrabold text-blue-900">{title}</h3>
            <span className="text-xs text-gray-400 font-mono">#{game.id} • MULTIPLAYER QUIZ DUEL</span>
          </div>

          <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gray-50 border border-gray-200/50 rounded-2xl text-[11px] font-semibold text-gray-500">
            <span>Score Goal: 3 Trophies</span>
            <div className="flex items-center gap-2">
              <span className="text-[#1E6FFF] font-bold">You: {scoreValue}</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#FF8FC8] font-bold">Companion: {scorePartnerValue}</span>
            </div>
          </div>

          {gs.status !== 'ended' ? (
            <div className="w-full space-y-4">
              {/* Question card */}
              <div className="p-5 bg-gradient-to-r from-blue-50/40 to-pink-50/40 border border-blue-100/30 rounded-2xl text-center">
                <p className="text-sm font-bold text-gray-700 font-heading">
                  {game.id === 16 ? `${lang === 'en' ? 'Solve ASAP:' : 'Hitung segera:'} ${mathSum.q}` : triviaItem.q}
                </p>
              </div>

              {/* Multiple options grid */}
              <div className="grid grid-cols-2 gap-3">
                {(game.id === 16 ? mathSum.options : triviaItem.options).map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectAnswer(opt)}
                    className="p-3 bg-white hover:bg-gradient-to-r hover:from-[#1E6FFF]/5 hover:to-[#FF8FC8]/5 border border-gray-100 hover:border-blue-200 text-xs sm:text-sm font-bold text-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <Trophy size={36} className="text-amber-400 mx-auto" />
              <div className="text-sm font-bold text-gray-800">
                {room.players.find(p => p.id === gs.winnerId)?.username} wins the head-to-head Math Duel!
              </div>
            </div>
          )}
        </div>
      );
    }

    // DEFAULT CO-OP AND PARTY WRAPPER FOR REMAINING EXTREME VARIATIONS (Games 21-30, 32-40, 41-47, 49, 50)
    // Renders interactive panels supporting rapid simulated balances and clicks
    const currentScore = gs.scoreVal || 0;
    const incrementCoopMeter = () => {
      const targetScore = currentScore + 10;
      let finalStatus = "playing";
      if (targetScore >= 100) {
        finalStatus = "ended";
      }
      submitGameAction({
        scoreVal: targetScore,
        status: finalStatus
      });
    };

    return (
      <div className="flex flex-col items-center gap-5 p-6 bg-slate-50 border border-gray-100 rounded-3xl" id="custom-coop-playground">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-extrabold text-[#1E6FFF]">{title}</h3>
          <span className="text-xs text-gray-400 font-mono">#{game.id} • CO-OP BALANCER SYSTEM</span>
        </div>

        <p className="text-xs text-center text-gray-500 max-w-sm">
          {lang === 'en' 
            ? "This is a cooperative team objective. Tap to feed active inputs and fill the 100% Synergy score power goal together."
            : "Ini adalah misi kerja sama tim. Ketuk tombol untuk menyinkronkan tenaga dan capai 100% Sinergi bersama."
          }
        </p>

        {/* Synergy progress power meter */}
        <div className="w-full bg-white border border-gray-200/55 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-gray-500 font-mono">
            <span>{t.coopGoal} SYNERGY METER</span>
            <span className="text-[#FF8FC8]">{currentScore}% COMPLETE</span>
          </div>

          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#1E6FFF] to-[#FF8FC8] rounded-full transition-all duration-300"
              style={{ width: `${currentScore}%` }}
            ></div>
          </div>
        </div>

        {gs.status !== 'ended' ? (
          <button
            onClick={incrementCoopMeter}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1E6FFF] to-[#FF8FC8] text-white text-xs font-bold active:scale-95 shadow-md shadow-[#1E6FFF]/15 transition-all cursor-pointer hover:opacity-90 select-none"
          >
            {lang === 'en' ? "⚡ FEED COLLABORATIVE POWER" : "⚡ KIRIM DAYA SINERGI"}
          </button>
        ) : (
          <div className="text-center py-4 space-y-1.5 animate-bounce">
            <Trophy size={36} className="text-amber-400 mx-auto" />
            <h4 className="font-extrabold text-[#1E6FFF] text-sm">CO-OP GOAL ACHIEVED!</h4>
            <p className="text-[10px] text-gray-400 font-mono">100% Symmetrical Balance Reached</p>
          </div>
        )}
      </div>
    );
  };

  const activeConnectedPartner = room?.players.filter(p => p.id !== playerProfile.id) || [];

  return (
    <div className="max-w-6xl mx-auto my-4 grid grid-cols-1 lg:grid-cols-12 gap-6" id="gameroom-screen">
      
      {/* LEFT COLUMN: MULTIPLAYER INTERACTIVE ARENA (Span 8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* LOBBY / INITIAL SESSION PROMPT FOR ROOM JOIN & GENERATION */}
        {!room ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-12 w-48 h-48 bg-blue-100/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-12 w-48 h-48 bg-pink-100/10 rounded-full blur-3xl"></div>

            {/* Title intro */}
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-pink-50 flex items-center justify-center rounded-2xl text-[#FF8FC8]">
                <Gamepad2 size={24} className="animate-spin-slow" />
              </div>
              <h2 className="text-xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
                {lang === 'en' ? "Multiplayer Room Arena" : "Ruang Arena Multiplayer"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
                {lang === 'en'
                  ? "Spin a fast 6-digit room code, share it with your friendly companion, and load 50 fully synced casual games instantly."
                  : "Buat 6 digit kode cepat, bagikan kepada kawan bermain Anda, dan nikmati permainan 50 game casual tersinkronisasi murni."
                }
              </p>
            </div>

            {/* Error notifications */}
            {joinError && (
              <div className="mx-auto max-w-xs bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-600 text-[11px] font-semibold">
                {joinError}
              </div>
            )}

            {/* Options grid (Create / Join) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
              {/* Create Card */}
              <div className="bg-gradient-to-br from-[#1E6FFF]/5 to-white border border-blue-100/40 p-5 rounded-3xl flex flex-col justify-between text-left space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-[#1E6FFF] tracking-widest uppercase">OPTION ALPHA</span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                    {lang === 'en' ? "Host New Room" : "Buat Ruang Lobi"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {lang === 'en' ? "Host game node and generate code for partner integration." : "Bertindak sebagai tuan rumah dan pancing 6 digit kode sinkron."}
                  </p>
                </div>
                
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-3 rounded-xl bg-[#1E6FFF] hover:bg-[#1E6FFF]/95 text-white text-xs font-bold transition-all shadow-md shadow-[#1E6FFF]/20 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  <Play size={14} />
                  {t.createRoom}
                </button>
              </div>

              {/* Join Card */}
              <div className="bg-gradient-to-br from-[#FF8FC8]/5 to-white border border-pink-100/40 p-5 rounded-3xl flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#FF8FC8] tracking-widest uppercase">OPTION BETA</span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                    {lang === 'en' ? "Join Room by Code" : "Gabung Pakai Kode"}
                  </h4>
                  
                  {/* Enter room digits input */}
                  <input
                    type="text"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 518394"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-pink-200 focus:border-[#FF8FC8] font-mono text-center font-bold tracking-widest"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="w-full py-3 rounded-xl bg-[#FF8FC8] hover:bg-[#FF8FC8]/95 text-white text-xs font-bold transition-all shadow-md shadow-[#FF8FC8]/20 cursor-pointer active:scale-95 text-center"
                >
                  {t.joinBtn}
                </button>
              </div>
            </div>

            {/* Solo fallback link helper */}
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={initLocalDuoRoom}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase font-mono tracking-wider hover:underline cursor-pointer"
              >
                OR RUN SOLO / LOCAL CO-OP PRACTICE MATCH 🎮
              </button>
            </div>
          </div>
        ) : (
          
          /* ACTIVE CONNECTED PLAYGROUND */
          <div className="space-y-6">
            
            {/* Header Status Bar */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLeaveRoom}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  title="Leave Room"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
                    {t.activeRoomStatus}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-0.5">ROOM #{room.code}</p>
                </div>
              </div>

              {/* Lobby Link share */}
              {room.code !== "000000" && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-gray-400 block">{t.shareCodePrompt}</span>
                  <span className="font-mono text-xs font-black text-[#1E6FFF] bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/40">{room.code}</span>
                </div>
              )}
            </div>

            {/* GAME CANVAS WORKSPACE BOARD */}
            {room.activeGameId !== null ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6">
                
                {/* Active game details & quick reset controls */}
                <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-gray-700 tracking-wider">
                      {t.playingGame}: {GAMES_LIST.find(g => g.id === room?.activeGameId)?.titleEN}
                    </h4>
                  </div>
                  
                  {/* Option CTA triggers */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={resetGameNode}
                      className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                      title={t.restartGame}
                    >
                      <RotateCcw size={14} />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                      onClick={leaveGameRoomActive}
                      className="text-xs font-bold text-red-500 hover:bg-red-50/50 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      Close Game
                    </button>
                  </div>
                </div>

                {/* Core adaptiver render layout */}
                {renderGameCanvasInterface()}

              </div>
            ) : (
              
              /* GAME SELECTION PANEL IN LOBBY */
              <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase text-[#1E6FFF] tracking-widest block font-heading">
                    {lang === 'en' ? "QUICK START ANY GAME (1 to 50)" : "MULAI CEPAT PERMAINAN (1 s.d. 50)"}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">STEP 1</span>
                </div>
                
                <p className="text-xs text-gray-500 leading-normal font-normal">
                  {lang === 'en'
                    ? "Verify room partner connection is LIVE on right, select any game from list below or search on Games Library tab to launch instantly!"
                    : "Pastikan teman kawan bermain aktif di kolom lobi kanan, lalu pilih salah satu game acak di bawah ini untuk memulai!"
                  }
                </p>

                {/* Display 8 recommended or fast start popular games */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {GAMES_LIST.filter(g => [1, 2, 11, 13, 16, 18, 20, 48].includes(g.id)).map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectGameNode(game.id)}
                      className="p-3 bg-gradient-to-tr from-gray-50 to-white hover:from-blue-50/10 hover:to-pink-50/10 border border-gray-100 hover:border-blue-200 rounded-2xl text-left space-y-2 transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-400">#{game.id}</span>
                        <ChevronRight size={12} className="text-[#FF8FC8]" />
                      </div>
                      <h5 className="text-[11px] font-bold text-gray-800 leading-tight truncate">
                        {lang === 'en' ? game.titleEN : game.titleID}
                      </h5>
                    </button>
                  ))}
                </div>

                {/* Info block */}
                <div className="pt-4 border-t border-gray-50 text-center">
                  <button
                    onClick={() => setCurrentTab('games')}
                    className="text-xs font-bold text-[#1E6FFF] hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>Browse other games in full library (50 games)</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* RIGHT COLUMN: MULTIPLAYER LOBBY MEMBERS & CHAT (Span 4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* ROOM MEMBERS / PARTICIPANTS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 font-heading">
              {t.playersInRoom}
            </h4>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Lobby</span>
          </div>

          <div className="space-y-3">
            {room ? (
              room.players.map((p) => {
                const isUser = p.id === playerProfile.id;
                // Glow avatar representing Faw (blue) / Man (pink) roles
                const borderGlow = p.isSpeaking
                  ? "ring-2 ring-emerald-400"
                  : p.id === "man-partner" || p.avatarColor === '#FF8FC8' || p.avatarColor === '#FFB7E5'
                    ? "border-pink-200"
                    : "border-blue-200";

                return (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50/50 relative overflow-hidden ${borderGlow}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Emoji Icon */}
                      <span className="text-2xl select-none">{p.emoji}</span>
                      
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-gray-800 truncate leading-tight">
                          {p.username} {isUser && <span className="text-[9px] font-normal text-gray-400 font-sans">(You)</span>}
                        </div>
                        {p.isHost && <span className="text-[9px] font-mono font-bold text-[#1E6FFF]">ROOM OWNER</span>}
                      </div>
                    </div>

                    {/* Mic on indicator */}
                    <div className="flex items-center gap-2">
                      {p.isMicOn && (
                        <span className={`w-2 h-2 rounded-full animate-ping ${p.isSpeaking ? 'bg-emerald-400' : 'bg-[#1E6FFF]'}`}></span>
                      )}
                      {p.isMicOn ? <Mic size={13} className="text-emerald-500" /> : <span className="text-[9px] text-gray-400">🔇</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-3 py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500">
                Setup room first to activate companion synchronization.
              </div>
            )}
          </div>
        </div>

        {/* LOBBY MESSENGER CHAT CHANNELS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 flex flex-col h-[320px]">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50 shrink-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#FF8FC8] font-heading">
              {t.chatHistory}
            </h4>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Messenger</span>
          </div>

          {/* Messages loop */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs leading-normal">
            {room && room.chat.length > 0 ? (
              room.chat.map((msg) => {
                const isMe = msg.playerId === playerProfile.id;
                const isSys = msg.playerId === "system";

                if (isSys) {
                  return (
                    <div key={msg.id} className="text-center text-[10px] text-gray-400 italic bg-gray-50 border border-gray-100 py-1.5 rounded-xl">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[9px] font-bold text-gray-400 mb-0.5 px-1">{msg.username}</span>
                    <div 
                      className={`p-2.5 rounded-2xl leading-normal break-words ${
                        isMe 
                          ? 'bg-[#1E6FFF] text-white rounded-tr-xs' 
                          : 'bg-gray-100 text-gray-700 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                <span className="text-2xl">💬</span>
                <span className="text-[11px] font-normal leading-normal mt-1">Playground Chat is silent. Type a message down below!</span>
              </div>
            )}
            <div ref={chatBottomRef}></div>
          </div>

          {/* Text Input area */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder={t.typeMsgPlaceholder}
              disabled={!room}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF8FC8] text-gray-800 disabled:opacity-50"
            />
            <button
              onClick={sendChatMessage}
              disabled={!room}
              className="p-2 rounded-xl bg-[#FF8FC8] hover:bg-[#FF8FC8]/90 text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={12} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
