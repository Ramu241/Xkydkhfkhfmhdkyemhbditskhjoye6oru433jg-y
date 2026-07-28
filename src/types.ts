export type GameMode = '1m' | '30s';
export type PredictType = 'num' | 'size';

export interface HistoryItem {
  id: string;
  period: string;
  predictedSize: 'BIG' | 'SMALL';
  predictedNum1: number;
  predictedNum2: number;
  actualNumber: number;
  actualSize: 'BIG' | 'SMALL';
  result: 'JACKPOT' | 'WIN' | 'LOSS';
  timestamp: string;
}

export interface WinGoApiItem {
  issueNumber?: string;
  issue?: string;
  period?: string;
  number?: string | number;
  result?: string | number;
}
