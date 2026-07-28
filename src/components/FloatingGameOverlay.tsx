import React, { useState, useRef } from 'react';
import { Sparkles, X, Send, Wifi, Radio, RefreshCw, Zap, Copy } from 'lucide-react';
import { PredictionResult } from '../utils/predictionEngine';
import { audioEngine } from '../utils/audio';
import { APP_TITLE, ALONE_AVATAR, NUM_IMAGES, SIZE_IMAGES } from '../utils/assets';
import { WinGoApiItem } from '../types';

interface FloatingGameOverlayProps {
  isVisible: boolean;
  onCloseGameView: () => void;
  periodNumber: string;
  remainingSeconds: number;
  recentDraws: WinGoApiItem[];
  latestPrediction: PredictionResult | null;
  onGetPrediction: () => void;
  isPredictorLoading: boolean;
  historyLength: number;
  hasPredictedCurrentPeriod: boolean;
  predictionPeriod: string | null;
  gameMode: '1m' | '30s';
  onSetGameMode: (mode: '1m' | '30s') => void;
  predictType: 'num' | 'size';
  onSetPredictType: (type: 'num' | 'size') => void;
}

export const FloatingGameOverlay: React.FC<FloatingGameOverlayProps> = ({
  isVisible,
  onCloseGameView,
  periodNumber,
  remainingSeconds,
  recentDraws,
  latestPrediction,
  onGetPrediction,
  isPredictorLoading,
  hasPredictedCurrentPeriod,
  predictionPeriod,
  gameMode,
  onSetGameMode,
  predictType,
  onSetPredictType,
}) => {
  // State to control panel visibility overlay (opens when round avatar button is clicked)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Position for the floating circular avatar button
  const [btnPos, setBtnPos] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 85 : 280,
    y: 16,
  });

  // Dragging refs
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialBtnPosRef = useRef({ x: 0, y: 0 });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    initialBtnPosRef.current = { ...btnPos };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }

    const maxX = Math.max(0, window.innerWidth - 75);
    const maxY = Math.max(0, window.innerHeight - 75);

    const newX = Math.min(maxX, Math.max(10, initialBtnPosRef.current.x + dx));
    const newY = Math.min(maxY, Math.max(10, initialBtnPosRef.current.y + dy));

    setBtnPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // capture released automatically
    }

    // If it was a tap (didn't drag far), toggle panel
    if (!hasMovedRef.current) {
      audioEngine.playClick();
      setIsPanelOpen((prev) => !prev);
    }
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

  const isCurrentPeriodPredicted = hasPredictedCurrentPeriod && predictionPeriod === periodNumber;

  const handleReveal = () => {
    if (isPredictorLoading) return;

    if (isCurrentPeriodPredicted) {
      audioEngine.playLossTune();
      showToast("⚠ WAIT FOR NEXT PERIOD");
      return;
    }

    if (!periodNumber || periodNumber === '----') {
      showToast("⚠ CONNECTING TO SERVER...");
      return;
    }

    onGetPrediction();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black font-mono select-none overflow-hidden">
      
      {/* 1. FULL SCREEN GAME IFRAME */}
      <iframe
        src="https://bdgwin8.vip//#/register?invitationCode=2464715111335"
        className="w-full h-full border-0 shadow-none pointer-events-auto"
        title="BDG Win Game"
        allow="fullscreen; autoplay"
      />

      {/* 2. DRAGGABLE FLOATING ROUND AVATAR BUTTON WITH LIVE SERVER STATUS BADGE */}
      <div
        style={{ left: `${btnPos.x}px`, top: `${btnPos.y}px` }}
        className="fixed z-50 flex flex-col items-end space-y-1 touch-none cursor-grab active:cursor-grabbing"
      >
        {/* LIVE CONNECTED STATUS PILL */}
        <div className="flex items-center space-x-1.5 bg-black/80 border border-[#00ff88]/50 px-2.5 py-1 rounded-full text-[10px] text-[#00ff88] font-bold shadow-[0_0_15px_rgba(0,255,136,0.4)] backdrop-blur-md animate-pulse pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
          <Wifi className="w-3 h-3 text-[#00ff88]" />
          <span>LIVE 12ms</span>
        </div>

        {/* CIRCULAR PHOTO BUTTON WITH DRAG HANDLERS */}
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative group transition-transform active:scale-95 focus:outline-none touch-none"
          title="Drag anywhere or click to open VIP Predictor Panel"
        >
          {/* GLOW RING ANIMATION */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-[#00ff88] to-red-600 opacity-80 blur-sm group-hover:opacity-100 transition duration-300 animate-spin pointer-events-none" style={{ animationDuration: '6s' }} />

          {/* AVATAR IMAGE CONTAINER */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-[#00ff88] p-0.5 bg-black shadow-[0_0_25px_rgba(0,255,136,0.6)] overflow-hidden flex items-center justify-center pointer-events-none">
            <img
              src={ALONE_AVATAR}
              alt="ALONE BHAI"
              className="w-full h-full object-cover rounded-full pointer-events-none"
            />
          </div>

          {/* ACTIVE PANEL NOTIFICATION BADGE */}
          <div className="absolute -bottom-1 -left-1 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-white shadow-md uppercase tracking-tighter pointer-events-none">
            PANEL
          </div>
        </button>
      </div>

      {/* TOAST MESSAGE DISPLAY */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100000] bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black font-black px-6 py-2.5 rounded-full shadow-[0_0_30px_rgba(0,255,136,0.6)] border border-white/20 text-xs tracking-wider uppercase animate-bounce text-center max-w-[90vw]">
          {toastMsg}
        </div>
      )}

      {/* 3. COMPACT Floating VIP PREDICTOR PANEL (PERFECT SIZED OVERLAY) */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          
          <div className="w-full max-w-sm bg-[#0a101d]/95 border-2 border-[#00ff88]/60 rounded-3xl p-4 shadow-[0_0_50px_rgba(0,255,136,0.4)] space-y-3 font-mono relative overflow-hidden border-t-4 border-t-[#00ff88]">
            
            {/* CLOSE BUTTON & HEADER */}
            <div className="flex items-center justify-between border-b border-[#00ff88]/20 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <img src={ALONE_AVATAR} alt="" className="w-9 h-9 rounded-full border border-[#00ff88] object-cover shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <div>
                  <h3 className="text-xs font-black text-white tracking-wider truncate max-w-[190px]">
                    {APP_TITLE}
                  </h3>
                  <div className="flex items-center space-x-1 text-[9px] text-[#00ff88] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                    <span>LIVE SERVER CONNECTED</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <a
                  href="https://t.me/+qC6omd1OwAphYTc9"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audioEngine.playClick()}
                  className="p-1.5 rounded-xl bg-[#0088cc]/20 border border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-all text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    audioEngine.playClick();
                    setIsPanelOpen(false);
                  }}
                  className="p-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* WINGO MODE SWITCHER (1M vs 30S) */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { audioEngine.playClick(); onSetGameMode('1m'); }}
                className={`py-1.5 rounded-lg text-[11px] font-black tracking-wider transition-all ${
                  gameMode === '1m'
                    ? 'bg-[#00ff88] text-black shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                WINGO 1 MIN
              </button>
              <button
                onClick={() => { audioEngine.playClick(); onSetGameMode('30s'); }}
                className={`py-1.5 rounded-lg text-[11px] font-black tracking-wider transition-all ${
                  gameMode === '30s'
                    ? 'bg-[#00ff88] text-black shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                WINGO 30 SEC
              </button>
            </div>

            {/* PERIOD & TIMER ROW */}
            <div className="grid grid-cols-2 gap-2 bg-[#0d172a] border border-[#00ff88]/30 rounded-2xl p-2.5 text-center shadow-inner">
              <div>
                <span className="text-[9px] text-[#00ff88] font-bold block tracking-widest">PERIOD</span>
                <span className="text-sm font-black text-white tracking-widest">
                  {periodNumber || '----'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#00ff88] font-bold block tracking-widest">TIMER</span>
                <span className="text-sm font-black text-[#00ff88] tracking-widest">
                  00:{String(remainingSeconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* PREDICT TYPE SWITCHER (NUMBER MODE vs BIG/SMALL MODE) */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { audioEngine.playClick(); onSetPredictType('num'); }}
                className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                  predictType === 'num'
                    ? 'bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                NUMBER MODE
              </button>
              <button
                onClick={() => { audioEngine.playClick(); onSetPredictType('size'); }}
                className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                  predictType === 'size'
                    ? 'bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                BIG/SMALL MODE
              </button>
            </div>

            {/* PREDICTION DISPLAY BOX */}
            <div className="relative w-full h-44 bg-[#080d19] border border-[#00ff88]/40 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden">
              
              {/* SCANNING LASER EFFECT */}
              {isPredictorLoading ? (
                <div className="absolute inset-0 bg-[#080d19] z-20 flex flex-col justify-between overflow-hidden p-2">
                  <div className="flex justify-around text-[10px] font-bold text-[#00ff88] border-b border-[#00ff88]/20 pb-1">
                    <span>PERIOD</span>
                    <span>NUM</span>
                    <span>SIZE</span>
                  </div>

                  {/* LASER SCANNER LINE */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-[#00ff88] via-white to-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.8)] animate-laser z-30" />

                  {/* ROLLING DATA */}
                  <div className="flex-1 overflow-hidden relative">
                    <div className="flex flex-col space-y-2 py-1 animate-pulse">
                      {recentDraws.slice(0, 4).map((item, idx) => {
                        const n = parseInt(String(item.number || item.result || '0')) % 10;
                        const isBig = n >= 5;
                        return (
                          <div key={idx} className="flex justify-around items-center font-bold text-xs text-white">
                            <span className="text-gray-400 font-mono">{(item.issueNumber || item.issue || '').slice(-4)}</span>
                            <img src={NUM_IMAGES[n]} alt="" className="w-6 h-6 object-contain" />
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
                /* PREDICTION RESULT */
                <div className="relative z-10 space-y-1.5 animate-popup">
                  {predictType === 'num' ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 tracking-widest block font-bold">
                        PREDICTED NUMBERS
                      </span>

                      <div className="flex items-center justify-center space-x-4">
                        <div className="flex flex-col items-center">
                          <img src={NUM_IMAGES[latestPrediction.num1]} alt="" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(0,255,136,0.4)]" />
                          <span className="text-[10px] text-[#00ff88] font-black">NUM {latestPrediction.num1}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <img src={NUM_IMAGES[latestPrediction.num2]} alt="" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                          <span className="text-[10px] text-amber-400 font-black">NUM {latestPrediction.num2}</span>
                        </div>
                      </div>

                      <div className="text-sm font-black text-[#00ff88] tracking-widest pt-0.5">
                        PREDICTED: {latestPrediction.size}
                      </div>
                    </div>
                  ) : (
                    /* BIG / SMALL MODE RESULT */
                    <div className="space-y-1 flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 tracking-widest block font-bold">
                        PREDICTED RESULT
                      </span>

                      <img 
                        src={latestPrediction.size === 'BIG' ? SIZE_IMAGES.Big : SIZE_IMAGES.Small} 
                        alt="" 
                        className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]" 
                      />

                      <div className="text-lg font-black text-[#00ff88] tracking-widest">
                        {latestPrediction.size}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 text-gray-500">
                  <Zap className="w-8 h-8 text-[#00ff88]/40 mx-auto animate-pulse" />
                  <p className="text-[10px] tracking-widest">
                    CLICK GET RESULT TO START
                  </p>
                </div>
              )}
            </div>

            {/* GET RESULT BUTTON & COPY BUTTON */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReveal}
                disabled={isPredictorLoading || isCurrentPeriodPredicted}
                className={`flex-1 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 ${
                  isCurrentPeriodPredicted
                    ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black shadow-[0_0_25px_rgba(0,255,136,0.5)] hover:brightness-110 active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>
                  {isCurrentPeriodPredicted ? '⚠ WAIT FOR NEXT PERIOD' : '⚡ GET RESULT ⚡'}
                </span>
              </button>

              <button
                onClick={handleCopyPrediction}
                className="p-3 rounded-2xl bg-[#0d1829] border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)] active:scale-95 shrink-0"
                title="Copy Prediction"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
