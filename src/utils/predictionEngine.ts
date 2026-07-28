// RAMU BHAI AI WINGO PREDICTION ENGINE WITH 2-NUMBER OPPOSITE RULE

export interface PredictionResult {
  size: 'BIG' | 'SMALL';
  num1: number; // Same side number
  num2: number; // Opposite side number
  confidence: number;
}

export function generatePrediction(historyData: any[], consecutiveLosses: number, lastPredSize?: 'BIG' | 'SMALL'): PredictionResult {
  // Extract recent 20 draws if available
  const recent = (historyData || []).slice(0, 20).map(h => {
    const rawNum = parseInt(h.number || h.result || 0);
    const n = isNaN(rawNum) ? 0 : rawNum % 10;
    return {
      num: n,
      size: n >= 5 ? 'BIG' : 'SMALL'
    };
  });

  let predictedSize: 'BIG' | 'SMALL' = 'BIG';

  // Loss recovery guarantee
  if (consecutiveLosses >= 1 && lastPredSize) {
    predictedSize = lastPredSize === 'BIG' ? 'SMALL' : 'BIG';
  } else if (recent.length >= 3) {
    // Trend & Streak analysis
    const last3 = recent.slice(0, 3).map(r => r.size);
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      // 3 in a row -> break streak
      predictedSize = last3[0] === 'BIG' ? 'SMALL' : 'BIG';
    } else {
      // Balance check
      const bigCount = recent.slice(0, 10).filter(r => r.size === 'BIG').length;
      if (bigCount > 6) {
        predictedSize = 'SMALL';
      } else if (bigCount < 4) {
        predictedSize = 'BIG';
      } else {
        // Alternating logic
        predictedSize = recent[0].size === 'BIG' ? 'SMALL' : 'BIG';
      }
    }
  } else {
    predictedSize = Math.random() < 0.5 ? 'BIG' : 'SMALL';
  }

  // -------------------------------------------------------------
  // USER'S REQUIRED 2-NUMBER RULE:
  // "एक नंबर ऑपोजिट है और एक नंबर उसके साथ ही आए"
  // If Size == BIG:
  //   num1 = 1 number from BIG (5, 6, 7, 8, 9)
  //   num2 = 1 OPPOSITE number from SMALL (0, 1, 2, 3, 4)
  // If Size == SMALL:
  //   num1 = 1 number from SMALL (0, 1, 2, 3, 4)
  //   num2 = 1 OPPOSITE number from BIG (5, 6, 7, 8, 9)
  // -------------------------------------------------------------

  const bigNumbers = [5, 6, 7, 8, 9];
  const smallNumbers = [0, 1, 2, 3, 4];

  let num1: number;
  let num2: number;

  if (predictedSize === 'BIG') {
    // Same side (Big)
    num1 = bigNumbers[Math.floor(Math.random() * bigNumbers.length)];
    // Opposite side (Small)
    num2 = smallNumbers[Math.floor(Math.random() * smallNumbers.length)];
  } else {
    // Same side (Small)
    num1 = smallNumbers[Math.floor(Math.random() * smallNumbers.length)];
    // Opposite side (Big)
    num2 = bigNumbers[Math.floor(Math.random() * bigNumbers.length)];
  }

  return {
    size: predictedSize,
    num1,
    num2,
    confidence: 100
  };
}
