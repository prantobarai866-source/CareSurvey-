import React, { useEffect } from 'react';
import { RunSummary } from '../types/game';
import confetti from 'canvas-confetti';
import { RotateCcw, ShoppingBag, Gauge, Crosshair, Zap, Car, Home } from 'lucide-react';

interface GameOverModalProps {
  summary: RunSummary;
  walletBalance: number;
  onRestart: () => void;
  onOpenShop: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  walletBalance,
  onRestart,
  onOpenShop,
  onGoHome,
}) => {
  useEffect(() => {
    if (summary.isNewRecord || summary.cashEarned >= 2000) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00e676', '#00eaff', '#ffd700', '#ff0077'],
        });
      } catch {}
    }
  }, [summary.isNewRecord, summary.cashEarned]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div className="w-full max-w-md bg-[#04081ae8] border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,0,60,0.35)] text-center text-white flex flex-col gap-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(255,0,60,0.5)]">
          💥
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-red-400">
            গাড়ি অ্যাক্সিডেন্ট হয়েছে!
          </h2>
          <div className="text-[10px] font-mono tracking-[3px] text-slate-400 uppercase mt-1">
            হাইওয়ে রেস সমাপ্ত হয়েছে
          </div>
        </div>

        {summary.isNewRecord && (
          <div className="py-1.5 px-4 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-black font-mono font-black text-xs shadow-[0_0_20px_rgba(255,170,0,0.6)] animate-pulse">
            🏆 নতুন হাই-স্কোর রেকর্ড!
          </div>
        )}

        {/* Highlight Earned Cash */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/60 rounded-2xl p-3.5 flex items-center justify-between text-left font-mono">
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-bold">এই রেসে মোট ইনকাম:</div>
            <div className="text-2xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(0,230,118,0.5)]">
              + ৳ {summary.cashEarned.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-400">মোট ওয়ালেট ব্যালেন্স:</div>
            <div className="text-sm font-bold text-white">৳ {walletBalance.toLocaleString()}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-left font-mono">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-cyan-400">মোট স্কোর</div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {summary.score.toLocaleString()}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-amber-400">দূরত্ব</div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {summary.distance.toLocaleString()} M
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-pink-400 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> সর্বোচ্চ গতি
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {summary.maxSpeed} KM/H
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3" /> রিস্কি ওভারটেক
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {summary.nearMisses} বার
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-black font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,234,255,0.4)] transition-transform active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> আবার খেলুন ও ইনকাম করুন
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenShop}
              className="py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> মেগা শপ (কিনুন)
            </button>

            <button
              onClick={onGoHome}
              className="py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" /> মেইন মেনু
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
