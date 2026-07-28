import React, { useEffect, useRef } from 'react';
import { NUM_IMAGES } from '../utils/assets';

interface WinPopupProps {
  isOpen: boolean;
  num1: number;
  num2: number;
  onClose: () => void;
}

export const WinPopup: React.FC<WinPopupProps> = ({ isOpen, num1, num2, onClose }) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (onCloseRef.current) {
          onCloseRef.current();
        }
      }, 1800); // Auto-closes after 1.8 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => onClose()}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer select-none"
    >
      <div className="flex items-center gap-6 animate-popup mb-4 pointer-events-none">
        <div className="p-3 bg-[#0a141e] border-2 border-[#00ff88] rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.6)]">
          <img src={NUM_IMAGES[num1]} alt={`Num ${num1}`} className="w-24 h-24 object-contain" />
        </div>
        <div className="p-3 bg-[#0a141e] border-2 border-amber-500 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.6)]">
          <img src={NUM_IMAGES[num2]} alt={`Num ${num2}`} className="w-24 h-24 object-contain" />
        </div>
      </div>

      <div className="text-3xl sm:text-4xl font-black text-[#00ff88] tracking-widest font-mono text-center uppercase drop-shadow-[0_0_25px_#00ff88] animate-pulse pointer-events-none">
        🏆 JACKPOT WIN 🏆
      </div>

      <p className="text-xs text-gray-400 mt-4 font-mono tracking-widest uppercase pointer-events-none">
        (TAP ANYWHERE TO CLOSE)
      </p>
    </div>
  );
};
