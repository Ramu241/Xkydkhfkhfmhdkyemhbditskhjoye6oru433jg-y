import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, ChevronUp, ChevronDown, Send, ShieldCheck } from 'lucide-react';
import { PredictionResult } from '../utils/predictionEngine';
import { audioEngine } from '../utils/audio';

interface FloatingGameOverlayProps {
  isVisible: boolean;
  onCloseGameView: () => void;
  periodNumber: string;
  remainingSeconds: number;
  latestPrediction: PredictionResult | null;
  onGetPrediction: () => void;
  isPredictorLoading: boolean;
  historyLength: number;
}

export const FloatingGameOverlay: React.FC<FloatingGameOverlayProps> = ({
  isVisible,
  onCloseGameView,
  periodNumber,
  remainingSeconds,
  latestPrediction,
  onGetPrediction,
  isPredictorLoading,
  historyLength,
}) => {
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(true);

  return (
    <div
      className={`fixed inset-0 z-40 bg-black transition-all duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* FULL SCREEN GAME IFRAME */}
      <iframe
        src="https://bdgwin8.vip//#/register?invitationCode=2464715111335"
        className="w-full h-full border-none shadow-none"
        title="BDG Win Game"
        allow="fullscreen; autoplay"
      />

      {/* FLOATING PREDICTOR CONTROL BAR / OVERLAY */}
      <div className="fixed top-3 left-3 right-3 md:left-auto md:right-6 md:w-96 z-50 pointer-events-auto">
        <div className="bg-[#0a0f1d]/95 border-2 border-[#00ff88]/50 rounded-2xl p-3 shadow-[0_0_30px_rgba(0,255,136,0.3)] backdrop-blur-md">
          
          {/* HEADER ROW OF WIDGET */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#00ff88] text-black font-black flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.5)]">
                <Sparkles className="w-4 h-4 fill-black" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-mono tracking-wider">
                  🎭╰‿╯RAMUㅤᏴᎻᎪᏆ
                </h4>
                <p className="text-[9px] text-[#00ff88] font-mono tracking-widest">
                  LIVE WINGO PREDICTOR
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <a
                href="https://t.me/+qC6omd1OwAphYTc9"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audioEngine.playClick()}
                className="p-1.5 rounded-lg bg-[#0088cc]/20 border border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-all text-xs font-mono"
                title="Telegram Channel"
              >
                <Send className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setIsWidgetExpanded(!isWidgetExpanded);
                }}
                className="p-1.5 rounded-lg bg-black/60 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-xs"
              >
                {isWidgetExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  onCloseGameView();
                }}
                className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500 transition-all text-xs"
                title="Close Full Screen Game"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* EXPANDED CONTENT AREA */}
          {isWidgetExpanded && (
            <div className="mt-3 pt-3 border-t border-[#00ff88]/20 space-y-3 font-mono">
              
              {/* PERIOD & TIMER ROW */}
              <div className="grid grid-cols-2 gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10 text-center">
                <div>
                  <span className="text-[9px] text-[#00ff88] block tracking-wider">NEXT PERIOD</span>
                  <strong className="text-xs text-white font-bold tracking-widest">
                    {periodNumber || '----'}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-[#00ff88] block tracking-wider">TIMER</span>
                  <strong className="text-xs text-white font-bold tracking-widest">
                    00:{String(remainingSeconds).padStart(2, '0')}
                  </strong>
                </div>
              </div>

              {/* LATEST PREDICTION RESULT CARD */}
              {latestPrediction ? (
                <div className="p-3 bg-gradient-to-br from-[#00ff88]/10 to-transparent border border-[#00ff88]/40 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-gray-400 tracking-widest block">PREDICTED RESULT</span>
                  <div className="flex items-center justify-center space-x-2 text-lg font-black tracking-widest text-[#00ff88]">
                    <span>{latestPrediction.size}</span>
                    <span className="text-white text-xs">({latestPrediction.num1}, {latestPrediction.num2})</span>
                  </div>
                  <span className="text-[9px] text-amber-400 block font-bold">
                    🏆 1 Same Side ({latestPrediction.num1}) • 1 Opposite Side ({latestPrediction.num2})
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-black/40 border border-dashed border-[#00ff88]/30 rounded-xl text-center text-xs text-gray-400">
                  PRESS PETITION BUTTON TO GET RESULT
                </div>
              )}

              {/* GET PETITION RESULT BUTTON */}
              <button
                onClick={() => {
                  audioEngine.playClick();
                  onGetPrediction();
                }}
                disabled={isPredictorLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>GET PETITION RESULT</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
