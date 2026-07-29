import React, { useState, useEffect } from 'react';
import { Key, Lock, ShieldCheck, Sparkles, Send, X, Clock, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import { KeyValidationResult, activateKey, getSavedKeyStatus, generateKey } from '../utils/keySystem';
import { audioEngine } from '../utils/audio';
import { APP_TITLE, ALONE_AVATAR } from '../utils/assets';

interface KeyActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: () => void;
}

export const KeyActivationModal: React.FC<KeyActivationModalProps> = ({
  isOpen,
  onClose,
  onActivated,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<KeyValidationResult>({ isValid: false, message: 'NO_KEY' });
  const [remainingText, setRemainingText] = useState<string>('');

  // Admin tab inside modal (unlocked with admin pass code "9999")
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'1H' | '1D' | '7D' | '30D' | 'PERM'>('1D');
  const [generatedKeyOutput, setGeneratedKeyOutput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateStatus();
    }
  }, [isOpen]);

  // Timer for active key remaining time countdown
  useEffect(() => {
    if (!status.isValid || !status.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = status.expiresAt! - now;

      if (diff <= 0) {
        setStatus({ isValid: false, message: 'EXPIRED' });
        setRemainingText('EXPIRED');
        return;
      }

      if (status.isMaster || status.durationType === 'PERM') {
        setRemainingText('UNLIMITED LIFETIME ACCESS');
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setRemainingText(`${days} Days ${hours % 24} Hours Left`);
      } else {
        setRemainingText(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const updateStatus = () => {
    const current = getSavedKeyStatus();
    setStatus(current);
  };

  const handleActivate = () => {
    if (!keyInput.trim()) {
      setErrorMsg('ENTER KEY FIRST');
      audioEngine.playLossTune();
      return;
    }

    const res = activateKey(keyInput.trim());
    if (res.isValid) {
      audioEngine.playJackpotTune();
      setStatus(res);
      setErrorMsg(null);
      setKeyInput('');
      onActivated();
    } else {
      audioEngine.playLossTune();
      setErrorMsg('INVALID OR EXPIRED VIP KEY');
    }
  };

  const handleUnlockAdmin = () => {
    if (adminPin.trim() === '9999' || adminPin.trim().toUpperCase() === 'ALONE') {
      setIsAdminUnlocked(true);
      audioEngine.playWinTune();
      const newKey = generateKey(selectedDuration);
      setGeneratedKeyOutput(newKey);
    } else {
      audioEngine.playLossTune();
      alert('INCORRECT ADMIN PIN (DEFAULT: 9999)');
    }
  };

  const handleGenerateNewKey = (dur: '1H' | '1D' | '7D' | '30D' | 'PERM') => {
    setSelectedDuration(dur);
    const k = generateKey(dur);
    setGeneratedKeyOutput(k);
    audioEngine.playClick();
  };

  const handleCopyGenerated = () => {
    if (!generatedKeyOutput) return;
    navigator.clipboard.writeText(generatedKeyOutput);
    setCopiedKey(true);
    audioEngine.playClick();
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none font-mono animate-in fade-in duration-200">
      
      <div className="w-full max-w-md bg-[#090d16] border-2 border-[#00ff88]/60 rounded-3xl p-5 shadow-[0_0_60px_rgba(0,255,136,0.3)] space-y-4 relative overflow-hidden border-t-4 border-t-[#00ff88]">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-[#00ff88]/20 pb-3">
          <div className="flex items-center space-x-3">
            <img src={ALONE_AVATAR} alt="" className="w-10 h-10 rounded-full border border-[#00ff88] object-cover shadow-[0_0_12px_rgba(0,255,136,0.5)]" />
            <div>
              <h2 className="text-sm font-black text-white tracking-wider">
                VIP ACCESS KEY
              </h2>
              <span className="text-[10px] text-[#00ff88] font-bold block">
                {APP_TITLE}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATUS CARD */}
        {status.isValid ? (
          <div className="bg-[#0e1726] border border-[#00ff88] rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-[#00ff88] mx-auto animate-bounce" />
            <span className="text-xs font-black text-[#00ff88] tracking-widest block uppercase">
              VIP KEY ACTIVATED
            </span>
            <div className="text-lg font-black text-white tracking-widest bg-black/60 py-2 px-3 rounded-xl border border-[#00ff88]/30">
              {remainingText}
            </div>
            <p className="text-[10px] text-gray-400">
              Your server connection is 100% active and verified.
            </p>
          </div>
        ) : (
          <div className="bg-[#12080a] border border-red-500/40 rounded-2xl p-3 flex items-center space-x-3 text-red-400 text-xs">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-500 animate-pulse" />
            <div>
              <span className="font-bold block">ACCESS RESTRICTED</span>
              <span className="text-[10px] text-gray-400">
                Enter VIP key to activate server prediction predictor.
              </span>
            </div>
          </div>
        )}

        {/* KEY INPUT FORM */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-[#00ff88] tracking-widest block uppercase">
            🔑 ENTER VIP ACCESS CODE:
          </label>

          <div className="relative">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. ALONE-1D-XXXX-XXXX"
              className="w-full bg-[#050912] border-2 border-[#00ff88]/40 focus:border-[#00ff88] text-white px-4 py-3 rounded-2xl font-mono font-bold text-sm outline-none transition-all uppercase placeholder:text-gray-600 shadow-inner"
            />
            <button
              onClick={() => {
                navigator.clipboard.readText().then((txt) => {
                  if (txt) setKeyInput(txt);
                });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00ff88]/20 hover:bg-[#00ff88] hover:text-black text-[#00ff88] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-[#00ff88]/50 transition-all"
            >
              PASTE
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-bold text-center animate-shake">
              ⚠ {errorMsg}
            </p>
          )}

          <button
            onClick={handleActivate}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-black font-black text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(0,255,136,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>VERIFY & ACTIVATE KEY</span>
          </button>
        </div>

        {/* TELEGRAM BUY KEY BUTTON */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className="text-gray-400">DON'T HAVE A KEY?</span>
          <a
            href="https://t.me/+qC6omd1OwAphYTc9"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioEngine.playClick()}
            className="flex items-center space-x-1.5 bg-[#0088cc]/20 border border-[#0088cc] text-[#0088cc] px-3 py-1.5 rounded-xl font-bold hover:bg-[#0088cc] hover:text-white transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>BUY FROM ADMIN (TELEGRAM)</span>
          </a>
        </div>

        {/* ADMIN PANEL INTEGRATION SECTION */}
        <div className="pt-2 border-t border-white/10">
          {!isAdminUnlocked ? (
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-2xl border border-white/10 text-xs">
              <span className="text-gray-400 text-[10px]">ADMIN GENERATOR PIN:</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="PIN"
                  className="w-16 bg-black border border-gray-700 text-white px-2 py-1 rounded-xl text-center text-xs outline-none focus:border-[#00ff88]"
                />
                <button
                  onClick={handleUnlockAdmin}
                  className="bg-amber-500/20 border border-amber-500 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                >
                  ADMIN
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1320] border border-amber-500/50 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between text-amber-400 text-[11px] font-black border-b border-amber-500/20 pb-1.5">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ADMIN KEY GENERATOR</span>
                </span>
                <span className="text-[9px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                  ADMIN ACTIVE
                </span>
              </div>

              {/* DURATION SELECTOR */}
              <div className="grid grid-cols-5 gap-1">
                {(['1H', '1D', '7D', '30D', 'PERM'] as const).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleGenerateNewKey(dur)}
                    className={`py-1 rounded-lg text-[9px] font-bold transition-all ${
                      selectedDuration === dur
                        ? 'bg-amber-500 text-black font-black shadow-md'
                        : 'bg-black/60 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {dur === 'PERM' ? 'PERM' : dur}
                  </button>
                ))}
              </div>

              {/* GENERATED KEY OUTPUT */}
              <div className="flex items-center justify-between bg-black p-2 rounded-xl border border-amber-500/40 text-xs">
                <span className="font-mono text-amber-300 font-bold truncate max-w-[210px] select-all">
                  {generatedKeyOutput}
                </span>
                <button
                  onClick={handleCopyGenerated}
                  className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-black transition-all shrink-0 text-[10px] font-bold flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
