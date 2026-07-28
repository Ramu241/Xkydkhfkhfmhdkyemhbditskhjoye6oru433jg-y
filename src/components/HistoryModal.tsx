import React from 'react';
import { History, X, Trophy, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';
import { audioEngine } from '../utils/audio';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0a0f1d] border-2 border-[#00ff88]/40 rounded-3xl p-4 md:p-6 shadow-[0_0_60px_rgba(0,255,136,0.2)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00ff88]/20 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono tracking-wider uppercase">
                SESSION PREDICTION HISTORY
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Memory Only • Clears when app is closed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={() => { audioEngine.playClick(); onClearHistory(); }}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-all flex items-center space-x-1"
                title="Clear Session History"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">CLEAR</span>
              </button>
            )}

            <button
              onClick={() => { audioEngine.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 font-mono">
          {history.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto animate-bounce" />
              <p className="text-sm text-gray-400 font-mono">
                NO PREDICTION RECORDS IN THIS SESSION YET
              </p>
              <p className="text-xs text-gray-600">
                Generate predictions on the panel to track live results!
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${
                  item.result === 'JACKPOT'
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : item.result === 'WIN'
                    ? 'bg-[#00ff88]/10 border-[#00ff88]/40 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                    : 'bg-red-950/20 border-red-500/30'
                }`}
              >
                {/* Left: Period & Time */}
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 font-mono">
                    PERIOD: <strong className="text-white font-bold">{item.period.slice(-6)}</strong>
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {item.timestamp}
                  </span>
                </div>

                {/* Middle: Panel Prediction vs Actual */}
                <div className="flex items-center space-x-3 text-xs">
                  {/* PANEL PRED */}
                  <div className="flex flex-col items-center px-2.5 py-1 bg-black/60 rounded-xl border border-white/10">
                    <span className="text-[9px] text-gray-400">PANEL PRED</span>
                    <span className="font-bold text-white tracking-wider">
                      {item.predictedSize} ({item.predictedNum1}, {item.predictedNum2})
                    </span>
                  </div>

                  <span className="text-gray-500 font-bold">VS</span>

                  {/* ACTUAL RESULT */}
                  <div className="flex flex-col items-center px-2.5 py-1 bg-black/60 rounded-xl border border-white/10">
                    <span className="text-[9px] text-gray-400">GAME RESULT</span>
                    <span className="font-bold text-[#00ff88] tracking-wider">
                      NUM {item.actualNumber} ({item.actualSize})
                    </span>
                  </div>
                </div>

                {/* Right: Outcome Tag */}
                <div className="shrink-0">
                  {item.result === 'JACKPOT' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs tracking-widest flex items-center space-x-1 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      <Trophy className="w-3.5 h-3.5 fill-black" />
                      <span>JACKPOT #{item.actualNumber}</span>
                    </span>
                  ) : item.result === 'WIN' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-[#00ff88] text-black font-black text-xs tracking-widest flex items-center space-x-1 shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-black" />
                      <span>WIN</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-xs tracking-widest flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>LOSS</span>
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
