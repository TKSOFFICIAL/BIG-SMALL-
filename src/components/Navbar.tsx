import React from 'react';
import { ShieldCheck, User, MessageCircle, Clock } from 'lucide-react';

interface NavbarProps {
  userName: string;
  onOpenDrawer: () => void;
  showTitle?: boolean;
  remainingMs?: number;
  isExpired?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onOpenDrawer,
  showTitle = true,
  remainingMs,
  isExpired
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/20 px-4 py-3 shadow-lg flex items-center justify-between">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 shadow-md shadow-purple-500/20">
          <img
            src="https://i.supaimg.com/0f7fb06a-9122-4153-aaea-0e6022d89dd6/2524e09a-620a-439b-95f1-87afcb1bdc40.png"
            alt="VKS Official"
            className="w-full h-full object-cover rounded-full bg-slate-900 p-0.5"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          </span>
        </div>

        {showTitle && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 font-orbit leading-tight">
                VKS OFFICIAL
              </h1>
              <span className="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30 font-orbit">
                4-DAY SERVER
              </span>
            </div>
            <span className="text-[10px] text-blue-400 font-bold tracking-[0.25em] font-orbit">
              WINGO 1M AI ENGINE
            </span>
          </div>
        )}
      </div>

      {/* Action buttons & Drawer toggle */}
      <div className="flex items-center gap-2">
        <a
          href="https://t.me/VKS_HACKER_57"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>TELEGRAM</span>
        </a>

        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-purple-500/30 p-1.5 pr-3 rounded-full transition-all active:scale-95 shadow-md"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-purple-400/40">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-200 tracking-wider line-clamp-1 max-w-[80px]">
              {userName}
            </span>
            <span className="text-[8px] text-emerald-400 font-extrabold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
