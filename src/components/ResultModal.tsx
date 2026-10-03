import React from 'react';
import { Trophy, Flame, AlertCircle, X, Sparkles } from 'lucide-react';
import { HistoryRecord } from '../types';

interface ResultModalProps {
  record: HistoryRecord | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const isWin = record.status === 'WIN' || record.status === 'JACKPOT';
  const isJackpot = record.status === 'JACKPOT';

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${
          isJackpot
            ? 'bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-amber-500 shadow-amber-500/40'
            : isWin
            ? 'bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500 shadow-emerald-500/40'
            : 'bg-gradient-to-b from-rose-950/90 via-slate-900 to-slate-950 border-rose-500 shadow-rose-500/40'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 shadow-lg ${
            isJackpot
              ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500 animate-bounce'
              : isWin
              ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 animate-bounce'
              : 'bg-rose-500/20 text-rose-400 border-2 border-rose-500'
          }`}
        >
          {isJackpot ? (
            <Sparkles className="w-10 h-10" />
          ) : isWin ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <AlertCircle className="w-10 h-10" />
          )}
        </div>

        <div className="text-[10px] font-black font-orbit tracking-widest text-slate-400">
          PERIOD #{record.period}
        </div>

        <h3
          className={`text-3xl font-black font-orbit tracking-wider my-1 ${
            isJackpot
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500'
              : isWin
              ? 'text-emerald-400'
              : 'text-rose-400'
          }`}
        >
          {record.status}
        </h3>

        <div className="text-xs font-extrabold text-slate-300 tracking-wider mb-5 font-orbit">
          {isWin ? '✓ PREDICTION ACCURATE' : '⚠️ RECOVERY MODE ARMED'}
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[9px] font-orbit font-bold text-slate-400 block mb-1">
              PREDICTED
            </span>
            <span
              className={`text-lg font-black font-orbit ${
                record.pred === 'BIG' ? 'text-blue-400' : 'text-amber-400'
              }`}
            >
              {record.pred}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[9px] font-orbit font-bold text-slate-400 block mb-1">
              ACTUAL DRAW
            </span>
            <span className="text-lg font-black font-orbit text-purple-300">
              {record.actualNum !== undefined ? `${record.actualNum} (${record.actualSize})` : '---'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl font-orbit font-black tracking-widest text-xs shadow-lg transition-all active:scale-95 text-white ${
            isJackpot
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500'
              : isWin
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500'
          }`}
        >
          CONTINUE ENGINE
        </button>
      </div>
    </div>
  );
};
