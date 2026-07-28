import React, { useState } from 'react';
import { Sparkles, History, Monitor, Zap, ShieldCheck, Flame } from 'lucide-react';
import { PredictionResult } from '../utils/predictionEngine';
import { WinGoApiItem } from '../types';
import { audioEngine } from '../utils/audio';

interface PredictorPanelProps {
  periodNumber: string;
  remainingSeconds: number;
  recentDraws: WinGoApiItem[];
  latestPrediction: PredictionResult | null;
  onGetPredictionClick: () => void;
  onOpenHistory: () => void;
  onOpenGameView: () => void;
  gameMode: '1m' | '30s';
  onSetGameMode: (mode: '1m' | '30s') => void;
  predictType: 'num' | 'size';
  onSetPredictType: (type: 'num' | 'size') => void;
}

export const PredictorPanel: React.FC<PredictorPanelProps> = ({
  periodNumber,
  remainingSeconds,
  recentDraws,
  latestPrediction,
  onGetPredictionClick,
  onOpenHistory,
  onOpenGameView,
  gameMode,
  onSetGameMode,
  predictType,
  onSetPredictType,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 font-mono pb-10">
      
      {/* TOP NAVIGATION & CONTROLS */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => { audioEngine.playClick(); onOpenGameView(); }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00ff88]/20 to-emerald-950/40 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/30 text-xs font-black tracking-wider transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,255,136,0.15)] active:scale-95"
        >
          <Monitor className="w-4 h-4 text-[#00ff88]" />
          <span>OPEN FULL SCREEN GAME</span>
        </button>

        <button
          onClick={() => { audioEngine.playClick(); onOpenHistory(); }}
          className="py-2.5 px-4 rounded-xl bg-black/60 border border-[#00ff88]/30 text-white hover:text-[#00ff88] text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95"
        >
          <History className="w-4 h-4 text-[#00ff88]" />
          <span>HISTORY</span>
        </button>
      </div>

      {/* BRANDING HEADER TITLE */}
      <div className="text-center space-y-1 pt-1">
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00ff88] to-[#00cc66] tracking-wider uppercase drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
          🎭╰‿╯RAMUㅤᏴᎻᎪᏆ
        </h2>
        <p className="text-[11px] text-[#00ff88] font-bold tracking-widest uppercase flex items-center justify-center space-x-1">
          <Flame className="w-3.5 h-3.5 fill-[#00ff88]" />
          <span>100% ACCURATE VIP WINGO PREDICTOR</span>
        </p>
      </div>

      {/* GAME MODE SWITCHER (WINGO 1M vs WINGO 30S) */}
      <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-2xl border border-[#00ff88]/30 shadow-inner">
        <button
          onClick={() => { audioEngine.playClick(); onSetGameMode('1m'); }}
          className={`py-2.5 rounded-xl font-black text-xs tracking-wider transition-all ${
            gameMode === '1m'
              ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          WINGO 1 MIN
        </button>
        <button
          onClick={() => { audioEngine.playClick(); onSetGameMode('30s'); }}
          className={`py-2.5 rounded-xl font-black text-xs tracking-wider transition-all ${
            gameMode === '30s'
              ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          WINGO 30 SEC
        </button>
      </div>

      {/* TIMER & PERIOD DISPLAY CARD */}
      <div className="bg-[#0b1329]/90 border-2 border-[#00ff88]/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#00ff88]/20 pb-2.5">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#00ff88] tracking-widest block font-bold">NEXT PERIOD</span>
            <span className="text-lg font-black text-white tracking-widest">
              {periodNumber || '----'}
            </span>
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] text-[#00ff88] tracking-widest block font-bold">REMAINING TIME</span>
            <span className="text-lg font-black text-[#00ff88] tracking-widest">
              00:{String(remainingSeconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* RECENT 5 DRAW BALLS */}
        <div>
          <span className="text-[10px] text-gray-400 tracking-wider block mb-2">RECENT DRAWS:</span>
          <div className="flex items-center justify-center space-x-2">
            {recentDraws.slice(0, 5).map((draw, idx) => {
              const rawNum = parseInt(draw.number || draw.result || '0');
              const num = isNaN(rawNum) ? 0 : rawNum % 10;
              const isBig = num >= 5;

              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm shadow-md ${
                    isBig
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-gradient-to-br from-cyan-500/20 to-blue-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PREDICTION TYPE SELECTOR (NUMBER vs BIG/SMALL) */}
      <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={() => { audioEngine.playClick(); onSetPredictType('num'); }}
          className={`py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
            predictType === 'num'
              ? 'bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          NUMBER MODE
        </button>
        <button
          onClick={() => { audioEngine.playClick(); onSetPredictType('size'); }}
          className={`py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
            predictType === 'size'
              ? 'bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          BIG / SMALL MODE
        </button>
      </div>

      {/* PREDICTION DISPLAY BOX */}
      <div className="relative w-full h-52 bg-[#0a0f1d] border-2 border-[#00ff88]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(0,255,136,0.15)] overflow-hidden">
        
        {/* Background glow lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#00ff88_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {latestPrediction ? (
          <div className="relative z-10 space-y-3 animate-in zoom-in-95 duration-300">
            <span className="text-xs text-gray-400 tracking-widest block font-bold">
              VIP AI PREDICTION RESULT
            </span>

            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00ff88] to-[#00cc66] tracking-widest">
              {latestPrediction.size}
            </div>

            {/* PREDICTED NUMBERS CHIPS (1 SAME SIDE, 1 OPPOSITE SIDE) */}
            <div className="flex items-center justify-center space-x-3 pt-1">
              <div className="px-3.5 py-1.5 bg-[#00ff88]/20 border border-[#00ff88] rounded-xl text-xs font-bold text-[#00ff88]">
                NUM {latestPrediction.num1} (SAME)
              </div>
              <div className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500 rounded-xl text-xs font-bold text-amber-400">
                NUM {latestPrediction.num2} (OPPOSITE)
              </div>
            </div>

            <p className="text-[10px] text-amber-300 tracking-wider">
              🏆 High Chance Jackpot if Number Matches Game Result!
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-2 text-gray-500">
            <Zap className="w-10 h-10 text-[#00ff88]/40 mx-auto animate-pulse" />
            <p className="text-xs tracking-widest">
              CLICK PETITION BUTTON BELOW TO GET RESULT
            </p>
          </div>
        )}
      </div>

      {/* GET PETITION RESULT BUTTON */}
      <button
        onClick={() => {
          audioEngine.playClick();
          onGetPredictionClick();
        }}
        className="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-5 h-5 fill-black" />
        <span>⚡ GET PETITION RESULT ⚡</span>
      </button>

      {/* RECENT DRAWS HISTORY TABLE */}
      <div className="bg-[#0b1329]/90 border border-[#00ff88]/30 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#00ff88]/20 pb-2">
          <span className="text-xs font-bold text-[#00ff88] tracking-wider">PERIOD</span>
          <span className="text-xs font-bold text-[#00ff88] tracking-wider">NUMBER</span>
          <span className="text-xs font-bold text-[#00ff88] tracking-wider">SIZE</span>
        </div>

        <div className="space-y-2 text-xs">
          {recentDraws.slice(0, 8).map((draw, idx) => {
            const rawNum = parseInt(draw.number || draw.result || '0');
            const num = isNaN(rawNum) ? 0 : rawNum % 10;
            const isBig = num >= 5;
            const periodStr = (draw.issueNumber || draw.issue || draw.period || '').slice(-6);

            return (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5 text-gray-300">
                <span className="font-mono">{periodStr || `10000${idx}`}</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-black/50 border border-white/10">
                  {num}
                </span>
                <span className={`font-black ${isBig ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {isBig ? 'BIG' : 'SMALL'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
