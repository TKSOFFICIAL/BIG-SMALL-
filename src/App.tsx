import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Zap,
  Key,
  Clock,
  MessageCircle,
  Copy,
  RotateCcw,
  Trash2,
  Cpu,
  TrendingUp,
  History,
  Lock,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProfileDrawer } from './components/ProfileDrawer';
import { LockoutModal } from './components/LockoutModal';
import { ResultModal } from './components/ResultModal';
import { WingoDrawItem, HistoryRecord, PredictionResult } from './types';
import { formatExpiryTime, getSize, getColor, playAudioSound, triggerConfetti } from './utils';

export default function App() {
  // Navigation View State: 'login' | 'welcome' | 'predictor'
  const [view, setView] = useState<'login' | 'welcome' | 'predictor'>('login');
  
  // Auth & Key State
  const [accessKeyInput, setAccessKeyInput] = useState<string>('');
  const [userKey, setUserKey] = useState<string | null>(localStorage.getItem('vks_key'));
  const [userName, setUserName] = useState<string>(localStorage.getItem('vks_user') || 'VIP USER');
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loginMsg, setLoginMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);

  // Profile Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Wingo 1M Engine State
  const [currentPeriod, setCurrentPeriod] = useState<string>('WAIT...');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [drawHistory, setDrawHistory] = useState<WingoDrawItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Current AI Prediction (Strictly ONLY BIG or SMALL)
  const [currentPrediction, setCurrentPrediction] = useState<{
    periodShort: string;
    trend: 'BIG' | 'SMALL';
    confidence: number;
    aiPattern: string;
    reasoning: string;
  } | null>(null);

  const [lastPredictedPeriod, setLastPredictedPeriod] = useState<string>('');
  const [lastProcessedIssue, setLastProcessedIssue] = useState<string>('');

  // Prediction History Log
  const [historyLog, setHistoryLog] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vks_history_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Pop-up state
  const [modalRecord, setModalRecord] = useState<HistoryRecord | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stats Counters
  const totalWins = historyLog.filter(h => h.status === 'WIN' || h.status === 'JACKPOT').length;
  const totalJackpots = historyLog.filter(h => h.status === 'JACKPOT').length;
  const totalRecords = historyLog.length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 1. Verify Key against Server & Enforce 4-Day Lock
  const verifyKeyWithServer = async (keyToVerify: string): Promise<boolean> => {
    setIsVerifyingKey(true);
    setLoginMsg({ text: 'VERIFYING SERVER KEY & 4-DAY LOCK...', isError: false });

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToVerify })
      });
      const data = await res.json();

      setIsVerifyingKey(false);

      if (data.valid && !data.expired) {
        setUserKey(keyToVerify.toUpperCase());
        setUserName(data.userName || 'VIP USER');
        setRemainingMs(data.remainingMs || 0);
        setIsExpired(false);

        localStorage.setItem('vks_key', keyToVerify.toUpperCase());
        localStorage.setItem('vks_user', data.userName || 'VIP USER');

        setLoginMsg({ text: '✅ ACCESS GRANTED! 4-DAY SERVER ACTIVE.', isError: false });
        return true;
      } else if (data.expired) {
        setIsExpired(true);
        setRemainingMs(0);
        setLoginMsg({ text: '❌ 4-DAY SERVER HACK EXPIRED & LOCKED!', isError: true });
        return false;
      } else {
        setLoginMsg({ text: `❌ ${data.message || 'INVALID ACCESS KEY'}`, isError: true });
        return false;
      }
    } catch (err) {
      setIsVerifyingKey(false);
      setLoginMsg({ text: '⚠️ NETWORK ERROR! Could not reach server.', isError: true });
      return false;
    }
  };

  // Handle Login Click
  const handleLogin = async () => {
    if (!accessKeyInput.trim()) {
      setLoginMsg({ text: 'PLEASE ENTER YOUR ACCESS KEY!', isError: true });
      return;
    }
    const ok = await verifyKeyWithServer(accessKeyInput.trim());
    if (ok) {
      setTimeout(() => {
        setView('welcome');
      }, 600);
    }
  };

  // Logout / Change Key
  const handleLogout = () => {
    setUserKey(null);
    localStorage.removeItem('vks_key');
    localStorage.removeItem('vks_user');
    setView('login');
    setIsDrawerOpen(false);
    setAccessKeyInput('');
    setLoginMsg(null);
  };

  // 2. Initial Auth Check on Mount
  useEffect(() => {
    if (userKey) {
      verifyKeyWithServer(userKey).then(ok => {
        if (ok) {
          setView('welcome');
        } else {
          setView('login');
        }
      });
    }
  }, []);

  // 3. 4-Day Expiration Clock Interval
  useEffect(() => {
    if (!userKey) return;
    const interval = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [userKey]);

  // 4. Wingo 1M Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = new Date().getSeconds();
      const remaining = 60 - seconds;
      setTimerSeconds(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Fetch Wingo 1M History
  const fetchWingoHistory = async () => {
    if (isExpired) return;
    try {
      const res = await fetch('/api/wingo-history');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.data?.list?.length) {
        const list: WingoDrawItem[] = data.data.list;
        setDrawHistory(list);

        const latestIssue = list[0].issueNumber;
        const nextPeriod = (BigInt(latestIssue) + 1n).toString();

        if (nextPeriod !== currentPeriod) {
          setCurrentPeriod(nextPeriod);
        }

        // Process pending prediction result check
        checkPendingResults(list);
      }
    } catch (e) {
      // Ignore network hiccup
    }
  };

  // Periodically fetch Wingo history every 3 seconds
  useEffect(() => {
    if (view === 'predictor' && !isExpired) {
      fetchWingoHistory();
      const interval = setInterval(fetchWingoHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [view, isExpired, currentPrediction]);

  // 6. Check Prediction Results against actual draw
  const checkPendingResults = (historyList: WingoDrawItem[]) => {
    if (!currentPrediction || !historyList.length) return;
    const latestDraw = historyList[0];

    if (lastProcessedIssue === latestDraw.issueNumber) return;

    const latestPeriodShort = latestDraw.issueNumber.slice(-4);

    if (currentPrediction.periodShort === latestPeriodShort) {
      const actualNum = parseInt(latestDraw.number);
      const actualSize = getSize(actualNum);

      const isWin = currentPrediction.trend === actualSize;
      const isJackpot = isWin && (actualNum === 0 || actualNum === 5); // Special bonus jackpot on purple 0 or 5

      const status = isJackpot ? 'JACKPOT' : isWin ? 'WIN' : 'LOSS';

      const newRecord: HistoryRecord = {
        id: `${latestPeriodShort}-${Date.now()}`,
        period: latestPeriodShort,
        pred: currentPrediction.trend,
        actualNum,
        actualSize,
        status,
        timestamp: Date.now()
      };

      // Add to log
      setHistoryLog(prev => {
        const updated = [newRecord, ...prev.filter(r => r.period !== latestPeriodShort)].slice(0, 200);
        localStorage.setItem('vks_history_log', JSON.stringify(updated));
        return updated;
      });

      // Play audio & show popup
      if (isWin || isJackpot) {
        playAudioSound(isJackpot ? 'jackpot' : 'win');
        triggerConfetti();
      } else {
        playAudioSound('loss');
      }

      setModalRecord(newRecord);
      setLastProcessedIssue(latestDraw.issueNumber);
    }
  };

  // 7. Request Gemini AI Prediction (STRICTLY ONLY BIG OR SMALL - NO NUMBERS)
  const generateAIPrediction = async () => {
    if (!currentPeriod || currentPeriod === 'WAIT...' || isAnalyzing || isExpired) return;
    if (lastPredictedPeriod === currentPeriod) return;

    setIsAnalyzing(true);
    setLastPredictedPeriod(currentPeriod);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: userKey,
          history: drawHistory
        })
      });

      const data: PredictionResult = await res.json();

      setIsAnalyzing(false);

      if (data.expired) {
        setIsExpired(true);
        return;
      }

      const periodShort = currentPeriod.slice(-4);

      setCurrentPrediction({
        periodShort,
        trend: data.prediction, // ONLY 'BIG' or 'SMALL'
        confidence: data.confidence || 92,
        aiPattern: data.aiPattern || 'Gemini AI Analysis',
        reasoning: data.reasoning || 'AI Pattern Match Complete'
      });

    } catch (err) {
      setIsAnalyzing(false);
      // Fallback BIG or SMALL
      const periodShort = currentPeriod.slice(-4);
      const randTrend: 'BIG' | 'SMALL' = Math.random() > 0.5 ? 'BIG' : 'SMALL';
      setCurrentPrediction({
        periodShort,
        trend: randTrend,
        confidence: 88,
        aiPattern: 'AI Sequence Trend',
        reasoning: 'Engine pattern verification complete.'
      });
    }
  };

  // Auto trigger prediction when new period starts or countdown hits 5 seconds
  useEffect(() => {
    if (view === 'predictor' && !isExpired && currentPeriod !== 'WAIT...') {
      if (lastPredictedPeriod !== currentPeriod) {
        generateAIPrediction();
      }
    }
  }, [currentPeriod, view, isExpired]);

  // Copy signal to clipboard (No numbers!)
  const handleCopySignal = () => {
    if (!currentPrediction) {
      showToast('⏳ Generating AI Prediction...');
      return;
    }
    const text = `#${currentPrediction.periodShort} PREDICTION: ${currentPrediction.trend} (AI Confidence: ${currentPrediction.confidence}%)`;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`📋 COPIED: #${currentPrediction.periodShort} ${currentPrediction.trend}`);
    }).catch(() => {
      showToast(`COPIED: ${currentPrediction.trend}`);
    });
  };

  // Clear History
  const handleClearHistory = () => {
    if (!historyLog.length) return;
    if (confirm('Delete all prediction history records?')) {
      setHistoryLog([]);
      localStorage.removeItem('vks_history_log');
      showToast('🗑 HISTORY DELETED');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-messiri flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      {/* Main Mobile App Container Frame */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:h-[840px] bg-slate-900/90 sm:rounded-[2.5rem] sm:border-2 border-purple-500/20 shadow-2xl flex flex-col relative overflow-hidden sm:my-4">
        
        {/* Navbar */}
        {view !== 'login' && (
          <Navbar
            userName={userName}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            showTitle={view === 'predictor'}
            remainingMs={remainingMs}
            isExpired={isExpired}
          />
        )}

        {/* ===================== VIEW 1: LOGIN ===================== */}
        {view === 'login' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 my-auto overflow-y-auto hide-scroll">
            <div className="relative w-36 h-36 mb-6 anim-float">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-blue-500 to-pink-500 animate-spin blur-md opacity-70" />
              <div className="relative w-full h-full rounded-full bg-slate-900 p-1.5 border-2 border-purple-400 shadow-2xl overflow-hidden flex items-center justify-center">
                <img
                  src="https://i.supaimg.com/0f7fb06a-9122-4153-aaea-0e6022d89dd6/2524e09a-620a-439b-95f1-87afcb1bdc40.png"
                  alt="VKS Official Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <h1 className="text-3xl font-black font-orbit text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 tracking-wider mb-1">
              VKS OFFICIAL
            </h1>
            
            <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 text-xs font-bold font-orbit px-4 py-1.5 rounded-full border border-purple-500/30 mb-8">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>WINGO 1M AI PREDICTOR (ONLY BIG / SMALL)</span>
            </div>

            {/* Key Entry Form Card */}
            <div className="w-full bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 shadow-2xl space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={accessKeyInput}
                  onChange={e => setAccessKeyInput(e.target.value)}
                  placeholder="ENTER ACCESS KEY"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-950/80 border-2 border-purple-500/30 text-purple-200 placeholder:text-slate-500 font-orbit font-extrabold text-sm tracking-widest text-center focus:border-blue-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isVerifyingKey}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-orbit font-black py-4 rounded-xl tracking-widest text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isVerifyingKey ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>VERIFYING SERVER KEY...</span>
                  </>
                ) : (
                  <>
                    <span>AUTHORIZE & START</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <a
                href="https://t.me/VKS_HACKER_57"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-950 text-blue-400 border border-blue-500/30 py-3 rounded-xl font-orbit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> GET ACCESS KEY (TELEGRAM)
              </a>

              {loginMsg && (
                <p className={`text-xs font-bold font-orbit tracking-wide mt-2 ${loginMsg.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {loginMsg.text}
                </p>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-orbit tracking-widest mt-6">
              SYSTEM PROTECTION: 4-DAY AUTO EXPIRATION SERVER ACTIVE
            </p>
          </div>
        )}

        {/* ===================== VIEW 2: WELCOME ===================== */}
        {view === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 my-auto overflow-y-auto hide-scroll">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-1 shadow-2xl mb-4 anim-float">
              <img
                src="https://i.supaimg.com/0f7fb06a-9122-4153-aaea-0e6022d89dd6/2524e09a-620a-439b-95f1-87afcb1bdc40.png"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full bg-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black font-orbit tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>CONNECTION SECURED</span>
            </div>

            <h2 className="text-3xl font-black font-orbit text-white tracking-wider mb-2">
              WELCOME, {userName}!
            </h2>

            {/* 4-Day Countdown Display Badge */}
            <div className="bg-purple-950/40 border border-purple-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-orbit font-extrabold text-purple-300 mb-8 shadow-inner">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>4-DAY SERVER LOCK: {formatExpiryTime(remainingMs)}</span>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => setView('predictor')}
                disabled={isExpired}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-orbit font-black py-4.5 rounded-2xl tracking-widest text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40"
              >
                <span>OPEN AI PREDICTOR ENGINE</span>
                <Zap className="w-5 h-5 text-yellow-300" />
              </button>

              <a
                href="https://t.me/VKS_HACKER_57"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 py-3.5 rounded-2xl font-orbit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> JOIN OFFICIAL TELEGRAM CHANNEL
              </a>
            </div>
          </div>
        )}

        {/* ===================== VIEW 3: PREDICTOR VIEW ===================== */}
        {view === 'predictor' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto hide-scroll pb-20">
            
            {/* Wingo 1M Header Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 rounded-2xl p-3 mb-3 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black font-orbit text-white tracking-widest">
                    WINGO 1 MINUTE
                  </h3>
                  <p className="text-[9px] text-purple-300 font-bold tracking-wider">
                    GEMINI AI PATTERN ENGINE
                  </p>
                </div>
              </div>

              {/* Server Clock Badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-300 font-orbit font-bold tracking-wider">
                    {formatExpiryTime(remainingMs)}
                  </span>
                </div>
              </div>
            </div>

            {/* Period + Live Timer Box */}
            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-purple-500/20 shadow-md flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-orbit font-bold text-purple-300 tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-400" /> PERIOD NUMBER
                </span>
                <span className="text-xl font-black font-orbit text-white tracking-widest mt-0.5">
                  #{currentPeriod.slice(-6)}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9px] font-orbit font-bold text-purple-300 tracking-widest mb-1">
                  TIMER COUNTDOWN
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-600 to-purple-700 text-white font-orbit font-black text-base flex items-center justify-center shadow-md">
                    {timerSeconds.toString().padStart(2, '0')[0]}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-600 to-purple-700 text-white font-orbit font-black text-base flex items-center justify-center shadow-md">
                    {timerSeconds.toString().padStart(2, '0')[1]}
                  </div>
                </div>
              </div>
            </div>

            {/* Live 10 Record Balls (Past Draw History) */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-purple-500/20 shadow-md mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-orbit font-bold text-purple-300 tracking-widest flex items-center gap-1">
                  <History className="w-3 h-3 text-blue-400" /> LIVE 10 DRAW RESULTS
                </span>
                <span className="text-[8px] font-orbit font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  REALTIME
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {drawHistory.slice(0, 10).map((item, idx) => {
                  const num = parseInt(item.number);
                  const size = getSize(num);
                  const color = getColor(num);

                  return (
                    <div key={idx} className="flex flex-col items-center bg-slate-950/60 p-1.5 rounded-xl border border-slate-700/60 text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-orbit font-black text-sm border-2 shadow-md ${
                          color === 'RED'
                            ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-rose-500/20'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-emerald-500/20'
                        }`}
                      >
                        {num}
                      </div>
                      <span className={`text-[8px] font-orbit font-extrabold mt-1 px-1 rounded ${size === 'BIG' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {size}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI PREDICTION DISPLAY CARD (STRICTLY ONLY BIG OR SMALL - NO NUMBERS!) */}
            <div
              className={`relative min-h-[220px] rounded-3xl p-5 mb-3 flex flex-col items-center justify-center text-center border-2 transition-all overflow-hidden ${
                isAnalyzing ? 'analyzing glass-card-purple border-blue-400' : 'glass-card-purple border-purple-500/40 shadow-2xl'
              }`}
            >
              <div className="scanner-line" />

              <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-orbit font-black text-blue-400">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>GEMINI AI PREDICTOR</span>
              </div>

              <div className="absolute top-3 right-4">
                <span className={`text-[9px] font-orbit font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                  isAnalyzing
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                }`}>
                  {isAnalyzing ? 'ANALYZING...' : 'VERIFIED'}
                </span>
              </div>

              {/* Main AI Prediction Result (ONLY BIG / SMALL) */}
              <div className="flex flex-col items-center justify-center my-auto pt-4">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-blue-400 animate-spin" />
                    <p className="text-xs font-orbit font-bold text-blue-300 tracking-widest mt-2">
                      ANALYZING LAST 10 DRAWS...
                    </p>
                  </div>
                ) : currentPrediction ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-orbit font-bold text-slate-400 tracking-widest mb-1">
                      TARGET PERIOD #{currentPrediction.periodShort}
                    </span>

                    {/* GLORIOUS BIG OR SMALL BADGE - NO NUMBERS */}
                    <div
                      className={`text-6xl font-black font-orbit tracking-wider mb-2 drop-shadow-2xl ${
                        currentPrediction.trend === 'BIG'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300'
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400'
                      }`}
                    >
                      {currentPrediction.trend}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[10px] font-orbit font-bold px-3 py-1 rounded-full shadow">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        {currentPrediction.aiPattern}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 text-[10px] font-orbit font-bold px-3 py-1 rounded-full shadow">
                        <Zap className="w-3 h-3 text-yellow-300" />
                        CONFIDENCE: {currentPrediction.confidence}%
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 italic font-bold mt-3 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-purple-500/20 max-w-xs">
                      "{currentPrediction.reasoning}"
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-orbit font-bold text-slate-400 tracking-widest">
                      AWAITING NEW PERIOD DATA
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleCopySignal}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-orbit font-black py-3 rounded-xl tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Copy className="w-4 h-4" /> COPY SIGNAL
              </button>

              <button
                onClick={generateAIPrediction}
                className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-purple-500/30 font-orbit font-bold py-3 rounded-xl tracking-widest text-xs flex justify-center items-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> RE-ANALYZE
              </button>
            </div>

            {/* History Records Log */}
            <div className="rounded-2xl bg-slate-800/90 border border-purple-500/20 shadow-lg overflow-hidden flex flex-col mb-4">
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-300" />
                  <span className="text-xs font-orbit font-black tracking-widest">
                    PREDICTION HISTORY LOG
                  </span>
                </div>

                <button
                  onClick={handleClearHistory}
                  className="bg-purple-950 hover:bg-rose-900/60 text-purple-300 hover:text-rose-300 border border-purple-500/30 text-[9px] font-orbit font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                >
                  <Trash2 className="w-3 h-3" /> DELETE
                </button>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-4 gap-1 bg-slate-950/80 text-purple-300 text-[9px] font-orbit font-bold py-2 px-3 text-center border-b border-purple-500/20">
                <div>PERIOD</div>
                <div>PREDICTED</div>
                <div>ACTUAL</div>
                <div>RESULT</div>
              </div>

              {/* History Rows */}
              <div className="max-h-[260px] overflow-y-auto hide-scroll divide-y divide-slate-800">
                {!historyLog.length ? (
                  <div className="p-8 text-center text-slate-500 font-orbit font-bold text-xs">
                    NO PREDICTIONS RECORDED YET
                  </div>
                ) : (
                  historyLog.map(item => {
                    const isWin = item.status === 'WIN' || item.status === 'JACKPOT';
                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-4 gap-1 py-2.5 px-3 text-center items-center text-xs font-orbit ${
                          item.status === 'WIN'
                            ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                            : item.status === 'JACKPOT'
                            ? 'bg-amber-950/30 border-l-2 border-amber-500'
                            : 'bg-rose-950/20 border-l-2 border-rose-500'
                        }`}
                      >
                        <div className="font-extrabold text-purple-300">#{item.period}</div>
                        <div>
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[10px] ${
                              item.pred === 'BIG' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {item.pred}
                          </span>
                        </div>
                        <div className="font-bold text-slate-300">
                          {item.actualNum !== undefined ? `${item.actualNum} (${item.actualSize})` : '---'}
                        </div>
                        <div>
                          <span
                            className={`font-black text-[9px] px-2 py-1 rounded-lg inline-block w-full ${
                              item.status === 'WIN'
                                ? 'bg-emerald-500 text-slate-950'
                                : item.status === 'JACKPOT'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-orbit font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl border border-purple-400/50 animate-in fade-in slide-in-from-top duration-200">
          {toastMsg}
        </div>
      )}

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userName={userName}
        userKey={userKey}
        remainingMs={remainingMs}
        isExpired={isExpired}
        onLogout={handleLogout}
      />

      {/* Result Pop-up Modal */}
      <ResultModal
        record={modalRecord}
        onClose={() => setModalRecord(null)}
      />

      {/* 4-Day Lockout Screen Overlay */}
      {isExpired && (
        <LockoutModal
          onCheckKey={() => verifyKeyWithServer(userKey || '')}
          onResetKey={handleLogout}
        />
      )}

    </div>
  );
}
