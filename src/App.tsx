/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { PredictorPanel } from './components/PredictorPanel';
import { HistoryModal } from './components/HistoryModal';
import { FloatingGameOverlay } from './components/FloatingGameOverlay';
import { generatePrediction, PredictionResult } from './utils/predictionEngine';
import { HistoryItem, WinGoApiItem } from './types';
import { audioEngine } from './utils/audio';

export default function App() {
  // App state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGameViewOpen, setIsGameViewOpen] = useState(false);

  // Game & prediction state
  const [gameMode, setGameMode] = useState<'1m' | '30s'>('1m');
  const [predictType, setPredictType] = useState<'num' | 'size'>('num');
  const [periodNumber, setPeriodNumber] = useState<string>('----');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);
  const [recentDraws, setRecentDraws] = useState<WinGoApiItem[]>([]);
  
  // Prediction result state
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [pendingPredictPeriod, setPendingPredictPeriod] = useState<string | null>(null);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);

  // In-memory history (not stored in localStorage, clears on app refresh as requested)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Ref to track evaluated periods so we don't evaluate the same period twice
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
    const interval = setInterval(fetchHistoryData, 2500);
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

      // Check for JACKPOT: actual number matches either primary or secondary predicted number
      if (actualNum === latestPrediction.num1 || actualNum === latestPrediction.num2) {
        resultStatus = 'JACKPOT';
        setConsecutiveLosses(0);
        audioEngine.playJackpotTune();
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

  // User triggers "Get Petition Result" button - generates prediction instantly
  const handleGetPredictionClick = () => {
    audioEngine.playScanSound();
    const pred = generatePrediction(recentDraws, consecutiveLosses, latestPrediction?.size);
    setLatestPrediction(pred);
    setPendingPredictPeriod(periodNumber);
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
          onSetGameMode={setGameMode}
          predictType={predictType}
          onSetPredictType={setPredictType}
        />
      </main>

      {/* FULL SCREEN GAME OVERLAY */}
      <FloatingGameOverlay
        isVisible={isGameViewOpen}
        onCloseGameView={() => setIsGameViewOpen(false)}
        periodNumber={periodNumber}
        remainingSeconds={remainingSeconds}
        latestPrediction={latestPrediction}
        onGetPrediction={handleGetPredictionClick}
        isPredictorLoading={false}
        historyLength={history.length}
      />

      {/* SESSION HISTORY MODAL */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

    </div>
  );
}
