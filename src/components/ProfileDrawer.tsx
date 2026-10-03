import React from 'react';
import { X, ShieldCheck, Clock, MessageCircle, Key, Server, Lock } from 'lucide-react';
import { formatExpiryTime } from '../utils';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userKey: string | null;
  remainingMs: number;
  isExpired: boolean;
  onLogout: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  userName,
  userKey,
  remainingMs,
  isExpired,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative w-[85%] max-w-[340px] h-full bg-slate-900 border-l border-purple-500/30 flex flex-col shadow-2xl overflow-y-auto hide-scroll z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header banner */}
        <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 border-b border-purple-500/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-orbit font-bold text-purple-300 tracking-widest">
              AI SERVER ACCOUNT
            </span>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5 shadow-lg shadow-purple-500/30">
              <img
                src="https://i.supaimg.com/0f7fb06a-9122-4153-aaea-0e6022d89dd6/2524e09a-620a-439b-95f1-87afcb1bdc40.png"
                alt="User Avatar"
                className="w-full h-full object-cover rounded-full bg-slate-900"
              />
            </div>
            <div>
              <h3 className="text-lg font-black font-orbit text-white tracking-wider">
                {userName}
              </h3>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-300 font-bold tracking-widest font-orbit">
                  VERIFIED KEY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key & 4-Day Server Lock Status */}
        <div className="p-5 space-y-4">
          <div className={`p-4 rounded-2xl border ${isExpired ? 'bg-rose-950/40 border-rose-500/40' : 'bg-purple-950/30 border-purple-500/30'} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 font-orbit flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" /> ACTIVE KEY
              </span>
              <span className="font-orbit font-extrabold text-xs text-yellow-400">
                {userKey || 'DEMO-4DAY'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
              <span className="text-xs font-bold text-slate-300 font-orbit flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> 4-DAY SERVER LOCK
              </span>
              <span className={`font-orbit font-black text-xs ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpired ? 'EXPIRED & LOCKED' : formatExpiryTime(remainingMs)}
              </span>
            </div>
          </div>

          {/* Admin Owner Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-blue-500/30 shadow-lg relative">
            <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[9px] font-black font-orbit tracking-widest px-3 py-0.5 rounded-full shadow">
              SYSTEM OWNER
            </div>

            <div className="flex items-center gap-3 mt-2 mb-3">
              <img
                src="https://i.supaimg.com/0f7fb06a-9122-4153-aaea-0e6022d89dd6/2524e09a-620a-439b-95f1-87afcb1bdc40.png"
                alt="Owner"
                className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover shadow-md"
              />
              <div>
                <h4 className="text-sm font-black text-purple-200 font-orbit tracking-wider">
                  VKS OFFICIAL
                </h4>
                <p className="text-[10px] text-blue-400 font-bold tracking-wider">
                  SYSTEM ADMIN & DEVELOPER
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/50 p-2.5 rounded-xl border border-purple-500/20 mb-4">
              "Contact me on Telegram for access key renewal or 4-day server license extensions."
            </p>

            <a
              href="https://t.me/VKS_HACKER_57"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-orbit font-black tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" /> JOIN TELEGRAM
            </a>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="mt-auto p-5 border-t border-purple-500/20">
          <button
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-rose-950/60 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 border border-slate-700 py-3 rounded-xl font-orbit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" /> EXIT / CHANGE KEY
          </button>
        </div>
      </div>
    </div>
  );
};
