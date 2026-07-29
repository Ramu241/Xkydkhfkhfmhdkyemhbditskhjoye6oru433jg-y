import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { PredictorPanel } from './components/PredictorPanel';
import { HistoryModal } from './components/HistoryModal';
import { FloatingGameOverlay } from './components/FloatingGameOverlay';
import { WinPopup } from './components/WinPopup';
import { KeyActivationModal } from './components/KeyActivationModal';
import { generatePrediction, PredictionResult } from './utils/predictionEngine';
import { HistoryItem, WinGoApiItem } from './types';
import { audioEngine } from './utils/audio';
import { getSavedKeyStatus } from './utils/keySystem';

export default function App() {
  // App state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGameViewOpen, setIsGameViewOpen] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Game & prediction state
  const [gameMode, setGameMode] = useState<'1m' | '30s'>('1m');
  const [predictType, setPredictType] = useState<'num' | 'size'>('num');
  const [periodNumber, setPeriodNumber] = useState<string>('----');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);
  const [recentDraws, setRecentDraws] = useState<WinGoApiItem[]>([]);
  
  // Prediction result state
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [predictionPeriod, setPredictionPeriod] = useState<string | null>(null);
  const [pendingPredictPeriod, setPendingPredictPeriod] = useState<string | null>(null);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasPredictedCurrentPeriod, setHasPredictedCurrentPeriod] = useState<boolean>(false);

  // Win Popup state
  const [winPopupData, setWinPopupData] = useState<{ isOpen: boolean; num1: number; num2: number }>({
    isOpen: false,
    num1: 0,
    num2: 0,
  });

  // In-memory history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Ref to track evaluated periods
  const evaluatedPeriodsRef = useRef<Set<string>>(new Set());

  // Handle sound toggle
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audioEngine.setSoundEnabled(nextState);
  };

  // Timer Tick (1s interval)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let rem = 0;
      if (gameMode === '1m') {
        rem = 60 - now.getUTCSeconds();
      } else {
        rem = 30 - (now.getSeconds() % 30);
      }
      setRemainingSeconds(rem);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode]);

  // Reset current period prediction state when period changes
  useEffect(() => {
    if (periodNumber && periodNumber !== predictionPeriod) {
      setHasPredictedCurrentPeriod(false);
    }
  }, [periodNumber, predictionPeriod]);

  // Fetch Live WinGo History
  const fetchHistoryData = useCallback(async () => {
    try {
      const endpoint = gameMode === '1m' ? '/api/wingo/1m' : '/api/wingo/30s';
      let data: any = null;

      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Backend route fallback to direct fetch:', e);
      }

      // Direct fallback if proxy unavailable
      if (!data) {
        const directUrl = gameMode === '1m'
          ? 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json'
          : 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json';
        const res = await fetch(directUrl, { cache: 'no-store' });
        data = await res.json();
      }

      let list: WinGoApiItem[] = [];
      if (data) {
        if (Array.isArray(data?.data?.list)) {
          list = data.data.list;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        }
      }

      if (list.length > 0) {
        setRecentDraws(list);

        // Compute next period number
        const latestIssue = list[0].issueNumber || list[0].issue || list[0].period || '';
        if (latestIssue) {
          try {
            const nextPeriod = String(BigInt(latestIssue) + 1n);
            setPeriodNumber(nextPeriod);
          } catch (e) {
            setPeriodNumber(latestIssue);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, [gameMode]);

  // Fetch history periodically
  useEffect(() => {
    fetchHistoryData();
    const interval = setInterval(fetchHistoryData, 2000);
    return () => clearInterval(interval);
  }, [fetchHistoryData]);

  // Evaluate Pending Prediction when new draw arrives
  useEffect(() => {
    if (!pendingPredictPeriod || recentDraws.length === 0 || !latestPrediction) return;

    const latestDraw = recentDraws[0];
    const latestIssue = String(latestDraw.issueNumber || latestDraw.issue || latestDraw.period || '');

    // Check if the latest finished draw corresponds to our pending prediction period
    if (latestIssue === pendingPredictPeriod && !evaluatedPeriodsRef.current.has(pendingPredictPeriod)) {
      evaluatedPeriodsRef.current.add(pendingPredictPeriod);

      const rawNum = parseInt(String(latestDraw.number || latestDraw.result || '0'));
      const actualNum = isNaN(rawNum) ? 0 : rawNum % 10;
      const actualSize: 'BIG' | 'SMALL' = actualNum >= 5 ? 'BIG' : 'SMALL';

      // Evaluate result: JACKPOT, WIN, or LOSS
      let resultStatus: 'JACKPOT' | 'WIN' | 'LOSS' = 'LOSS';

      if (actualNum === latestPrediction.num1 || actualNum === latestPrediction.num2) {
        resultStatus = 'JACKPOT';
        setConsecutiveLosses(0);
        audioEngine.playJackpotTune();
        setWinPopupData({ isOpen: true, num1: latestPrediction.num1, num2: latestPrediction.num2 });
      } else if (actualSize === latestPrediction.size) {
        resultStatus = 'WIN';
        setConsecutiveLosses(0);
        audioEngine.playWinTune();
      } else {
        resultStatus = 'LOSS';
        setConsecutiveLosses((prev) => prev + 1);
        audioEngine.playLossTune();
      }

      // Add to session history
      const newHistoryItem: HistoryItem = {
        id: `${pendingPredictPeriod}-${Date.now()}`,
        period: pendingPredictPeriod,
        predictedSize: latestPrediction.size,
        predictedNum1: latestPrediction.num1,
        predictedNum2: latestPrediction.num2,
        actualNumber: actualNum,
        actualSize: actualSize,
        result: resultStatus,
        timestamp: new Date().toLocaleTimeString(),
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setPendingPredictPeriod(null);
    }
  }, [pendingPredictPeriod, recentDraws, latestPrediction]);

  // User triggers "Get Petition Result" button
  const handleGetPredictionClick = () => {
    if (isScanning || (hasPredictedCurrentPeriod && predictionPeriod === periodNumber)) return;

    // Check if user has an active VIP key
    const keyStatus = getSavedKeyStatus();
    if (!keyStatus.isValid) {
      setIsKeyModalOpen(true);
      audioEngine.playLossTune();
      return;
    }

    setIsScanning(true);
    audioEngine.playScanSound();

    setTimeout(() => {
      setIsScanning(false);
      audioEngine.playWinTune();

      const pred = generatePrediction(recentDraws, consecutiveLosses, latestPrediction?.size);
      setLatestPrediction(pred);
      setPredictionPeriod(periodNumber);
      setPendingPredictPeriod(periodNumber);
      setHasPredictedCurrentPeriod(true);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans selection:bg-[#00ff88]/30 selection:text-[#00ff88] relative">
      
      {/* HEADER */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onToggleGameView={() => setIsGameViewOpen(!isGameViewOpen)}
        isGameViewOpen={isGameViewOpen}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 px-3 pt-4">
        <PredictorPanel
          periodNumber={periodNumber}
          remainingSeconds={remainingSeconds}
          recentDraws={recentDraws}
          latestPrediction={latestPrediction}
          onGetPredictionClick={handleGetPredictionClick}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onOpenGameView={() => setIsGameViewOpen(true)}
          gameMode={gameMode}
          onSetGameMode={(mode) => {
            setGameMode(mode);
            setLatestPrediction(null);
            setHasPredictedCurrentPeriod(false);
          }}
          predictType={predictType}
          onSetPredictType={setPredictType}
          isScanning={isScanning}
          hasPredictedCurrentPeriod={hasPredictedCurrentPeriod}
          predictionPeriod={predictionPeriod}
        />
      </main>

      {/* FULL SCREEN GAME OVERLAY */}
      <FloatingGameOverlay
        isVisible={isGameViewOpen}
        onCloseGameView={() => setIsGameViewOpen(false)}
        periodNumber={periodNumber}
        remainingSeconds={remainingSeconds}
        recentDraws={recentDraws}
        latestPrediction={latestPrediction}
        onGetPrediction={handleGetPredictionClick}
        isPredictorLoading={isScanning}
        historyLength={history.length}
        hasPredictedCurrentPeriod={hasPredictedCurrentPeriod}
        predictionPeriod={predictionPeriod}
        gameMode={gameMode}
        onSetGameMode={(mode) => {
          setGameMode(mode);
          setLatestPrediction(null);
          setHasPredictedCurrentPeriod(false);
        }}
        predictType={predictType}
        onSetPredictType={setPredictType}
      />

      {/* SESSION HISTORY MODAL */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      {/* WIN POPUP */}
      <WinPopup
        isOpen={winPopupData.isOpen}
        num1={winPopupData.num1}
        num2={winPopupData.num2}
        onClose={() => setWinPopupData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* KEY ACTIVATION MODAL */}
      <KeyActivationModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onActivated={() => {
          setIsKeyModalOpen(false);
        }}
      />

    </div>
  );
}
