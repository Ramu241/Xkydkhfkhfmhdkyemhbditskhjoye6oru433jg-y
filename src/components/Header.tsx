import React from 'react';
import { Send, Volume2, VolumeX, History, Monitor, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onToggleGameView: () => void;
  isGameViewOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onToggleGameView,
  isGameViewOpen,
}) => {
  return (
    <header className="w-full bg-[#0a0f1d]/90 border-b-2 border-[#00ff88]/30 px-3 py-2.5 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        
        {/* BRAND TITLE */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00cc66] flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(0,255,136,0.5)] border border-white/20">
            <Sparkles className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black text-white font-mono tracking-wider truncate flex items-center gap-1">
              <span>🎭╰‿╯RAMUㅤᏴᎻᎪᏆ</span>
            </h1>
            <p className="text-[10px] text-[#00ff88] font-mono tracking-widest leading-none font-bold">
              VIP WINGO PREDICTOR
            </p>
          </div>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 md:gap-2">
          
          {/* TELEGRAM LINK BUTTON */}
          <a
            href="https://t.me/+qC6omd1OwAphYTc9"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioEngine.playClick()}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#0088cc]/20 border border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,136,204,0.3)] active:scale-95"
            title="Join Telegram Channel"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TELEGRAM</span>
          </a>

          {/* FULL GAME VIEW TOGGLE */}
          <button
            onClick={() => {
              audioEngine.playClick();
              onToggleGameView();
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all active:scale-95 border ${
              isGameViewOpen
                ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.5)]'
                : 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/40 hover:bg-[#00ff88]/20'
            }`}
            title="Toggle Live Game Screen"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isGameViewOpen ? 'PANEL VIEW' : 'GAME VIEW'}</span>
          </button>

          {/* HISTORY BUTTON */}
          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenHistory();
            }}
            className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/20 font-mono text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
            title="View Prediction History"
          >
            <History className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">HISTORY</span>
          </button>

          {/* AUDIO SOUND MUTE TOGGLE */}
          <button
            onClick={() => {
              onToggleSound();
              audioEngine.playClick();
            }}
            className="p-2 rounded-lg bg-black/40 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all active:scale-95"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

        </div>

      </div>
    </header>
  );
};
