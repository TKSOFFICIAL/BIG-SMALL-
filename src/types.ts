export interface WingoDrawItem {
  issueNumber: string;
  number: string;
  colour: string;
}

export interface PredictionResult {
  prediction: 'BIG' | 'SMALL';
  confidence: number;
  aiPattern: string;
  reasoning: string;
  expired?: boolean;
}

export interface HistoryRecord {
  id: string;
  period: string;
  pred: 'BIG' | 'SMALL';
  actualNum?: number;
  actualSize?: 'BIG' | 'SMALL';
  status: 'WIN' | 'LOSS' | 'JACKPOT' | 'PENDING';
  timestamp: number;
}

export interface KeyVerifyResponse {
  valid: boolean;
  expired: boolean;
  message: string;
  remainingMs: number;
  activatedAt?: number;
  expiresAt?: number;
  userName: string;
}
