import React, { useEffect } from 'react';
import { NUM_IMAGES } from '../utils/assets';

interface WinPopupProps {
  isOpen: boolean;
  num1: number;
  num2: number;
  onClose: () => void;
}

export const WinPopup: React.FC<WinPopupProps> = ({ isOpen, num1, num2, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-6 animate-popup mb-4">
        <div className="p-3 bg-[#0a141e] border-2 border-[#00ff88] rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.5)]">
          <img src={NUM_IMAGES[num1]} alt="" className="w-24 h-24 object-contain" />
        </div>
        <div className="p-3 bg-[#0a141e] border-2 border-amber-500 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.5)]">
          <img src={NUM_IMAGES[num2]} alt="" className="w-24 h-24 object-contain" />
        </div>
      </div>
      <div className="text-3xl font-black text-[#00ff88] tracking-widest font-mono text-center uppercase drop-shadow-[0_0_20px_#00ff88]">
        🏆 JACKPOT WIN 🏆
      </div>
    </div>
  );
};
