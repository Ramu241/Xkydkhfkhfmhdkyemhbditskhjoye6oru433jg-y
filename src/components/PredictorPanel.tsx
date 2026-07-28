import React, { useState, useEffect } from 'react';
import { Sparkles, History, Monitor, Zap, Flame, Copy, Check } from 'lucide-react';
import { PredictionResult } from '../utils/predictionEngine';
import { WinGoApiItem } from '../types';
import { audioEngine } from '../utils/audio';
import { APP_TITLE, NUM_IMAGES, SIZE_IMAGES } from '../utils/assets';

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
  isScanning: boolean;
  hasPredictedCurrentPeriod: boolean;
  predictionPeriod: string | null;
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
  isScanning,
  hasPredictedCurrentPeriod,
  predictionPeriod,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyPrediction = () => {
    audioEngine.playClick();
    const divider = "═════════════════════════";
    let copyText = `${divider}\n👑  ${APP_TITLE} VIP PREDICTION  👑\n${divider}\n\n📌  PERIOD : ${periodNumber || '----'}\n\n`;

    if (latestPrediction) {
      copyText += `🎯  RESULT : ${latestPrediction.size}\n\n`;
      copyText += `🔢  NUMBERS : ${latestPrediction.num1} | ${latestPrediction.num2}\n\n`;
      copyText += `⚡  STATUS : 100% CONFIRMED ⚡\n${divider}`;
    } else {
      copyText += `⚡  STATUS : WAITING FOR RESULT...\n${divider}`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText);
      showToast("📋 COPIED TO CLIPBOARD!");
    } else {
      showToast("📋 FAILED TO COPY");
    }
  };

  const handleRevealClick = () => {
    if (isScanning) return;

    if (hasPredictedCurrentPeriod && predictionPeriod === periodNumber) {
      audioEngine.playLossTune();
      showToast("⚠ WAIT FOR NEXT PERIOD");
      return;
    }

    if (!periodNumber || periodNumber === '----') {
      showToast("⚠ NO DATA YET");
      return;
    }

    onGetPredictionClick();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 font-mono pb-10 relative">
      
      {/* TOAST MESSAGE NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100000] bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black font-black px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,255,136,0.5)] border border-white/20 text-xs tracking-wider uppercase animate-bounce text-center max-w-[90vw]">
          {toastMsg}
        </div>
      )}

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
          {APP_TITLE}
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
            <span className="text-[10px] text-[#00ff88] tracking-widest block font-bold">PERIOD</span>
            <span className="text-lg font-black text-white tracking-widest">
              {periodNumber || '----'}
            </span>
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] text-[#00ff88] tracking-widest block font-bold">TIMER</span>
            <span className="text-lg font-black text-[#00ff88] tracking-widest">
              00:{String(remainingSeconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* RECENT 5 DRAW BALLS (USING IMAGE ASSETS) */}
        <div>
          <span className="text-[10px] text-gray-400 tracking-wider block mb-2">RECENT DRAWS:</span>
          <div className="flex items-center justify-center space-x-2">
            {recentDraws.slice(0, 5).map((draw, idx) => {
              const rawNum = parseInt(String(draw.number || draw.result || '0'));
              const num = isNaN(rawNum) ? 0 : rawNum % 10;
              const imgUrl = NUM_IMAGES[num] || NUM_IMAGES[0];

              return (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Ball ${num}`}
                  className="w-11 h-11 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-110"
                />
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

      {/* PREDICTION DISPLAY SHADOW BOX (WITH LASER SCANNING) */}
      <div className="relative w-full h-64 bg-[#0a141e]/95 border-2 border-[#00ff88]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_40px_50px_-20px_rgba(0,255,136,0.05),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* LASER SCANNING OVERLAY WHEN SCANNING */}
        {isScanning ? (
          <div className="absolute inset-0 bg-[#0a141e] z-20 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-around text-xs font-bold text-[#00ff88] py-2 border-b border-[#00ff88]/20 bg-[#0a141e]/90">
              <span>PERIOD</span>
              <span>NUM</span>
              <span>SIZE</span>
            </div>

            {/* LASER SCANNER LINE */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-[#00ff88] via-[#00cc66] to-[#00ff88] shadow-[0_0_30px_10px_rgba(0,255,136,0.5)] z-30 animate-laser" />

            {/* ROLLING DATA ROWS */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col space-y-3 py-2 animate-[pulse_0.2s_infinite]">
                {recentDraws.slice(0, 6).map((item, idx) => {
                  const n = parseInt(String(item.number || item.result || '0')) % 10;
                  const isBig = n >= 5;
                  return (
                    <div key={idx} className="flex justify-around items-center font-bold text-sm text-white border-b border-white/5 py-1">
                      <span className="text-gray-400 font-mono">{(item.issueNumber || item.issue || '').slice(-5)}</span>
                      <img src={NUM_IMAGES[n]} alt="" className="w-8 h-8 object-contain" />
                      <span className={isBig ? 'text-rose-400' : 'text-emerald-400'}>
                        {isBig ? 'BIG' : 'SMALL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : latestPrediction ? (
          /* PREDICTION RESULT DISPLAY (WITH CUSTOM IMAGES) */
          <div className="relative z-10 space-y-3 animate-popup">
            
            {predictType === 'num' ? (
              <div className="space-y-2">
                <span className="text-xs text-gray-400 tracking-widest block font-bold">
                  PREDICTED NUMBERS
                </span>
                
                {/* NUMBER IMAGES DISPLAY */}
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex flex-col items-center space-y-1">
                    <img 
                      src={NUM_IMAGES[latestPrediction.num1]} 
                      alt={`Num ${latestPrediction.num1}`} 
                      className="w-20 h-20 object-contain drop-shadow-[0_0_25px_rgba(0,255,136,0.4)]"
                    />
                    <span className="text-xs text-[#00ff88] font-black">NUM {latestPrediction.num1}</span>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <img 
                      src={NUM_IMAGES[latestPrediction.num2]} 
                      alt={`Num ${latestPrediction.num2}`} 
                      className="w-20 h-20 object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                    />
                    <span className="text-xs text-amber-400 font-black">NUM {latestPrediction.num2}</span>
                  </div>
                </div>

                <div className="text-xl font-black text-[#00ff88] tracking-widest pt-1">
                  PREDICTED: {latestPrediction.size}
                </div>
              </div>
            ) : (
              /* BIG / SMALL IMAGE DISPLAY */
              <div className="space-y-2 flex flex-col items-center">
                <span className="text-xs text-gray-400 tracking-widest block font-bold">
                  PREDICTED RESULT
                </span>

                <img 
                  src={latestPrediction.size === 'BIG' ? SIZE_IMAGES.Big : SIZE_IMAGES.Small} 
                  alt={latestPrediction.size}
                  className="w-32 h-32 object-contain drop-shadow-[0_0_35px_rgba(0,255,136,0.5)]"
                />

                <div className="text-2xl font-black text-[#00ff88] tracking-widest">
                  {latestPrediction.size}
                </div>
              </div>
            )}

            <p className="text-[10px] text-amber-300 tracking-wider">
              🏆 1 Same Side ({latestPrediction.num1}) • 1 Opposite Side ({latestPrediction.num2})
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-2 text-gray-500">
            <Zap className="w-10 h-10 text-[#00ff88]/40 mx-auto animate-pulse" />
            <p className="text-xs tracking-widest">
              CLICK GET RESULT BUTTON TO START
            </p>
          </div>
        )}
      </div>

      {/* GET PETITION RESULT BUTTON & COPY BUTTON */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRevealClick}
          disabled={isScanning || (hasPredictedCurrentPeriod && predictionPeriod === periodNumber)}
          className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center space-x-2 border-2 ${
            hasPredictedCurrentPeriod && predictionPeriod === periodNumber
              ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black border-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:brightness-110 active:scale-[0.98]'
          }`}
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>
            {hasPredictedCurrentPeriod && predictionPeriod === periodNumber
              ? '⚠ WAIT FOR NEXT PERIOD'
              : '⚡ GET RESULT ⚡'}
          </span>
        </button>

        <button
          onClick={handleCopyPrediction}
          className="p-4 rounded-2xl bg-[#0d1829] border-2 border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.2)] active:scale-95"
          title="Copy Prediction & Period"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {/* RECENT DRAWS HISTORY TABLE WITH NUMBER IMAGES */}
      <div className="bg-[#0b1329]/90 border border-[#00ff88]/30 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#00ff88]/20 pb-2 text-xs font-bold text-[#00ff88] tracking-wider">
          <span>PERIOD</span>
          <span>NUMBER</span>
          <span>SIZE</span>
        </div>

        <div className="space-y-2 text-xs">
          {recentDraws.slice(0, 10).map((draw, idx) => {
            const rawNum = parseInt(String(draw.number || draw.result || '0'));
            const num = isNaN(rawNum) ? 0 : rawNum % 10;
            const isBig = num >= 5;
            const periodStr = (draw.issueNumber || draw.issue || draw.period || '').slice(-5);

            return (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 text-gray-300">
                <span className="font-mono text-gray-400">{periodStr || `1000${idx}`}</span>
                <img src={NUM_IMAGES[num]} alt={`Num ${num}`} className="w-7 h-7 object-contain" />
                <span className={`font-black ${isBig ? 'text-rose-400' : 'text-emerald-400'}`}>
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
