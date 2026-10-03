import React from 'react';
import { Lock, ShieldAlert, AlertTriangle, MessageCircle, RefreshCw } from 'lucide-react';

interface LockoutModalProps {
  onCheckKey: () => void;
  onResetKey: () => void;
}

export const LockoutModal: React.FC<LockoutModalProps> = ({ onCheckKey, onResetKey }) => {
  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 text-center shadow-2xl shadow-rose-950/80 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Top Glow & Icon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />
        
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center mb-4 text-rose-500 shadow-lg shadow-rose-500/30 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-[10px] font-black font-orbit px-3 py-1 rounded-full border border-rose-500/40 mb-2">
          <ShieldAlert className="w-3.5 h-3.5" /> 4-DAY SERVER LOCK ACTIVE
        </div>

        <h2 className="text-2xl font-black font-orbit text-white tracking-wider mb-2">
          HACK EXPIRED & OFF
        </h2>

        <p className="text-xs text-rose-200/90 leading-relaxed font-bold mb-6 bg-slate-950/60 p-3 rounded-xl border border-rose-500/20">
          "Aapka 4-day pass/key expire ho gaya hai. Ab ye hack open nahi hoga jab tak naya server key add na karein."
        </p>

        <div className="space-y-3">
          <a
            href="https://t.me/VKS_HACKER_57"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white py-3.5 rounded-xl font-orbit font-black tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" /> CONTACT ADMIN FOR NEW KEY
          </a>

          <button
            onClick={onResetKey}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-3 rounded-xl font-orbit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> ENTER DIFFERENT KEY
          </button>
        </div>

        <p className="text-[9px] text-slate-500 mt-5 font-orbit tracking-widest">
          VKS OFFICIAL SECURITY SYSTEM © 2026
        </p>
      </div>
    </div>
  );
};
