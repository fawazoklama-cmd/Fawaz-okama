import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Shield, Info, Keyboard } from 'lucide-react';
import { Language, Player } from '../types';
import { translations } from '../translations';

interface VoiceChatProps {
  lang: Language;
  player: Player | null;
  partners: Player[];
  onVoiceStateChange: (isMicOn: boolean, usePTT: boolean, isSpeaking: boolean) => void;
}

export default function VoiceChat({
  lang,
  player,
  partners,
  onVoiceStateChange
}: VoiceChatProps) {
  const t = translations[lang];

  const [isMicOn, setIsMicOn] = useState(false);
  const [usePTT, setUsePTT] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(true);
  
  // Audio level visualizer State
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false);

  // Refs for Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync state up to parent/server whenever things alter
  useEffect(() => {
    onVoiceStateChange(isMicOn, usePTT, isCurrentlySpeaking);
  }, [isMicOn, usePTT, isCurrentlySpeaking]);

  // Request & Bind Native Microphone input for the audio bar
  useEffect(() => {
    if (isMicOn && !usePTT) {
      startAudioMonitoring();
    } else {
      stopAudioMonitoring();
    }

    return () => {
      stopAudioMonitoring();
    };
  }, [isMicOn, usePTT]);

  // Push to talk listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (usePTT && e.code === 'Space') {
        e.preventDefault();
        if (!isMicOn) {
          setIsMicOn(true);
          startAudioMonitoring();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (usePTT && e.code === 'Space') {
        e.preventDefault();
        setIsMicOn(false);
        stopAudioMonitoring();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [usePTT, isMicOn]);

  const startAudioMonitoring = async () => {
    try {
      if (streamRef.current) stopAudioMonitoring();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: noiseReduction,
          autoGainControl: true
        } 
      });

      streamRef.current = stream;
      setHasPermission(true);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
        
        setAudioLevel(normalizedVolume);

        // Threshold speaking active values (Noise gating)
        const activeThreshold = noiseReduction ? 18 : 8;
        const speaking = normalizedVolume > activeThreshold;
        setIsCurrentlySpeaking(speaking);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn("Natively accessing microphone stream failed or rejected:", err);
      setHasPermission(false);
      setIsMicOn(false);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsCurrentlySpeaking(false);
  };

  const handleMicToggle = () => {
    setIsMicOn(prev => !prev);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      
      {/* Title */}
      <div className="bg-gradient-to-r from-[#1E6FFF]/5 to-[#FF8FC8]/5 border border-blue-50/50 p-6 sm:p-8 rounded-3xl space-y-2">
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Mic className="text-[#1E6FFF] animate-bounce" />
          <span>{t.voiceChatTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          {t.voiceChatDesc}
        </p>
      </div>

      {/* Mic Main Console Unit */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 flex flex-col items-center justify-center gap-6 shadow-xs relative">
        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">AUDIO CONTROL UNIT</span>
        
        {/* Animated Glow Mic Orb button */}
        <div className="relative">
          {/* Symmetrical Ripple waves depending on levels */}
          <div 
            className="absolute -inset-4 rounded-full bg-[#1E6FFF]/5 transition-all duration-300 pointer-events-none scale-110"
            style={{ 
              transform: `scale(${1 + audioLevel / 80})`,
              opacity: isCurrentlySpeaking ? 1 : 0.3,
              backgroundColor: player?.avatarColor === '#FF8FC8' || player?.avatarColor === '#FFB7E5' ? 'rgba(255, 143, 200, 0.1)' : 'rgba(30, 111, 255, 0.1)'
            }}
          ></div>
          <div 
            className="absolute -inset-8 rounded-full bg-[#FF8FC8]/5 transition-all duration-300 pointer-events-none scale-120"
            style={{ 
              transform: `scale(${1 + audioLevel / 120})`,
              opacity: isCurrentlySpeaking ? 0.7 : 0.1,
              backgroundColor: player?.avatarColor === '#FF8FC8' || player?.avatarColor === '#FFB7E5' ? 'rgba(255, 143, 200, 0.05)' : 'rgba(30, 111, 255, 0.05)'
            }}
          ></div>

          {/* Core toggle button */}
          <button
            onClick={handleMicToggle}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-extrabold select-none transition-all duration-300 relative border-4 border-white cursor-pointer active:scale-95 shadow-lg ${
              isMicOn
                ? (player?.avatarColor === '#FF8FC8' || player?.avatarColor === '#FFB7E5')
                  ? "bg-[#FF8FC8] shadow-[#FF8FC8]/35"
                  : "bg-[#1E6FFF] shadow-[#1E6FFF]/35"
                : "bg-gray-400 shadow-gray-400/25"
            }`}
            id="voice-mic-main-button"
          >
            {isMicOn ? <Mic size={38} className="animate-pulse" /> : <MicOff size={38} />}
            <span className="text-[10px] uppercase tracking-wider font-sans font-black mt-2">
              {isMicOn ? "Live" : "Muted"}
            </span>
          </button>
        </div>

        {/* Live Decibel audio levels meter */}
        <div className="w-full space-y-2 max-w-sm pt-4">
          <div className="flex justify-between text-[11px] font-mono font-bold text-gray-500">
            <span>{t.voiceActiveIndicator}</span>
            <span className={isCurrentlySpeaking ? "text-emerald-500" : "text-gray-400"}>
              {isCurrentlySpeaking ? t.speakingStatus : "Silence Gate"}
            </span>
          </div>
          
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {/* Segments pattern */}
            {Array.from({ length: 15 }).map((_, idx) => {
              const activeRange = (idx / 15) * 100;
              const isFilled = audioLevel > activeRange;
              let fillClass = "bg-gray-200";
              if (isFilled) {
                fillClass = idx > 12 ? "bg-rose-500" : idx > 8 ? "bg-amber-400" : "bg-emerald-400";
              }
              return <div key={idx} className={`h-full flex-1 rounded-xs transition-colors duration-100 ${fillClass}`}></div>;
            })}
          </div>
        </div>

        {/* Console control options */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-2">
          {/* Push to talk checkbox */}
          <button
            onClick={() => {
              setUsePTT(prev => !prev);
              setIsMicOn(false);
              stopAudioMonitoring();
            }}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              usePTT
                ? "bg-[#1E6FFF]/5 border-[#1E6FFF]/35 text-[#1E6FFF]"
                : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
            }`}
          >
            <Keyboard size={16} />
            <div className="text-left">
              <div className="leading-tight">{t.pttToggleName}</div>
              <span className="text-[9px] font-normal text-gray-400">Hold SPACE to talk</span>
            </div>
          </button>

          {/* Noise reduction toggle */}
          <button
            onClick={() => {
              setNoiseReduction(prev => !prev);
              if (isMicOn && !usePTT) {
                // Restart to apply filter
                setTimeout(() => startAudioMonitoring(), 100);
              }
            }}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              noiseReduction
                ? "bg-[#FF8FC8]/5 border-[#FF8FC8]/35 text-[#FF8FC8]"
                : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
            }`}
          >
            <Shield size={16} />
            <div className="text-left">
              <div className="leading-tight">{t.noiseReductionName}</div>
              <span className="text-[9px] font-normal text-gray-400">Gate Filter Gate ON</span>
            </div>
          </button>
        </div>

        {/* Micro notifications warning */}
        {hasPermission === false && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] p-3 rounded-2xl text-center max-w-sm">
            {t.noAudioPermission}
          </div>
        )}
      </div>

      {/* Group Members Active Speaking list */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 font-heading">
          {lang === 'en' ? "Voice Channel Connected Minds" : "Anggota Saluran Obrolan Suara"}
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Local player */}
          {player && (
            <div className={`p-3 bg-gray-50 border border-gray-200/50 rounded-2xl flex items-center gap-2.5 transition-all ${
              isCurrentlySpeaking ? "ring-2 ring-emerald-400 bg-white" : ""
            }`}>
              <span className="text-2xl">{player.emoji}</span>
              <div className="overflow-hidden min-w-0">
                <div className="text-xs font-bold text-gray-800 truncate leading-tight select-none">{player.username}</div>
                <span className="text-[9px] font-semibold text-gray-400">
                  {isCurrentlySpeaking ? "Tapping Speak..." : "Muted Listening"}
                </span>
              </div>
            </div>
          )}

          {/* Remote partners */}
          {partners.map(p => (
            <div 
              key={p.id}
              className={`p-3 bg-gray-50 border border-gray-200/50 rounded-2xl flex items-center gap-2.5 transition-all ${
                p.isSpeaking ? "ring-2 ring-emerald-400 bg-white" : ""
              }`}
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="overflow-hidden min-w-0">
                <div className="text-xs font-bold text-gray-700 truncate leading-tight select-none">{p.username}</div>
                <span className="text-[9px] font-semibold text-gray-400">
                  {p.isSpeaking ? "Speaking..." : "Muted"}
                </span>
              </div>
            </div>
          ))}

          {partners.length === 0 && (
            <div className="col-span-3 text-center py-4 text-xs text-gray-400 font-normal">
              {t.noCompanionYet}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
