import React from 'react';
import { GameStats } from '../types/game';
import { Volume2, VolumeX, Pause, Zap, Shield, AlertTriangle, ShoppingBag, Flame, Magnet } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  walletBalance: number;
  isMuted: boolean;
  cashToast: { amount: number; label: string } | null;
  nearMissToast: { combo: number; bonusTaka: number; label?: string } | null;
  onToggleSound: () => void;
  onPause: () => void;
  onOpenShop: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  walletBalance,
  isMuted,
  cashToast,
  nearMissToast,
  onToggleSound,
  onPause,
  onOpenShop,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top HUD Bar */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-2">
        <div className="bg-[#030615ee] border border-cyan-500/40 rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-md shadow-[0_0_35px_rgba(0,234,255,0.2)] flex items-center justify-between gap-3">
          {/* Speedometer */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 font-mono font-bold">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 font-semibold">
                গতি / SPEED
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                {stats.speed}{' '}
                <span className="text-xs text-cyan-300 font-normal">KM/H</span>
              </div>
            </div>
          </div>

          {/* Dynamic Weather Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-sm">
            <span className="text-base sm:text-lg">{stats.weather.icon}</span>
            <div className="text-left font-mono leading-tight">
              <div className="text-[9px] uppercase font-bold text-slate-300">
                {stats.weather.name}
              </div>
              <div className="text-[10px] text-cyan-300 flex items-center gap-1">
                <span>{stats.weather.gripFactor < 1 ? `গ্রিপ ${Math.round(stats.weather.gripFactor * 100)}%` : 'গ্রিপ 100%'}</span>
                {stats.weather.bonusMultiplier > 1 && (
                  <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded text-[9px]">
                    +{Math.round((stats.weather.bonusMultiplier - 1) * 100)}% ৳
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pursuit Alert */}
          {stats.policeActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500 shadow-[0_0_20px_rgba(255,0,60,0.6)] animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-red-300">
                🚨 পুলিশ ধাওয়া করছে!
              </span>
            </div>
          )}

          {/* Real-Time Earned Cash */}
          <div className="text-center">
            <div className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
              ইনকাম / EARNINGS
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300 tabular-nums drop-shadow-[0_0_12px_rgba(0,230,118,0.5)]">
              ৳ {stats.cashCollectedThisRun.toLocaleString()}
              {stats.combo > 1 && (
                <span className="ml-1.5 text-xs text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                  {stats.combo.toFixed(1)}x
                </span>
              )}
            </div>
          </div>

          {/* In-Game Tycoon Shop Quick Link */}
          <button
            onClick={onOpenShop}
            className="hidden sm:flex pointer-events-auto items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <div className="text-left font-mono text-xs">
              <div className="text-[8px] text-emerald-400/80 uppercase">টাইকুন শপ</div>
              <div className="font-bold text-white">৳ {walletBalance.toLocaleString()}</div>
            </div>
          </button>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-colors"
              title="সাউন্ড অন/অফ"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPause}
              className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-colors"
              title="পজ করুন"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Patrol Police Escort Active Banner */}
        {stats.policeEscortActive && (
          <div className="bg-gradient-to-r from-blue-950/95 via-indigo-900/95 to-red-950/95 border-2 border-cyan-400 rounded-xl px-3.5 py-1.5 shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg animate-bounce">🚨</span>
              <div className="text-left font-mono leading-tight">
                <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5">
                  <span>সিকিউরিটি পেট্রোল (POLICE ESCORT) সক্রিয়</span>
                  <span className="hidden sm:inline text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/40">
                    🛡️ সংঘর্ষ অভেদ্য
                  </span>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">
                  হাই-স্পিড ক্রুজে {stats.policeEscortMultiplier || 2.5}x অতিরিক্ত স্কোর ও ট্রাফিক ক্লিয়ারেন্স!
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-400/50 text-amber-300 font-mono font-bold text-xs tabular-nums">
                ⏳ {stats.policeEscortTimer}s
              </div>
            </div>
          </div>
        )}

        {/* Sub-Bars: Nitro, Shield, Mission Contract */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {/* Nitro Gauge */}
          <div className="bg-[#030614cc] border border-cyan-500/30 rounded-xl px-3 py-1.5 backdrop-blur-sm">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-cyan-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-cyan-300" /> নাইট্রো বুস্ট
              </span>
              <span className="text-cyan-200 font-bold tabular-nums">{stats.nitro}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${stats.nitro}%` }}
              />
            </div>
          </div>

          {/* Shield Status */}
          <div className="bg-[#030614cc] border border-blue-500/30 rounded-xl px-3 py-1.5 backdrop-blur-sm flex flex-col justify-center">
            <div className="flex justify-between items-center text-[10px] text-blue-400 mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> শিল্ড প্রটেকশন
              </span>
              <span className="text-blue-200 font-bold">{stats.shields} / {stats.maxShields}</span>
            </div>
            <div className="flex items-center gap-1.5 h-2">
              {Array.from({ length: stats.maxShields }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-full transition-colors ${
                    idx < stats.shields ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Cash Mission Contract */}
          <div className="col-span-2 sm:col-span-1 bg-[#030614cc] border border-amber-500/30 rounded-xl px-3 py-1.5 backdrop-blur-sm flex items-center justify-between">
            <div className="truncate">
              <div className="text-[9px] text-amber-400 uppercase font-bold flex items-center gap-1">
                🎯 {stats.activeMission.title}
              </div>
              <div className="text-[11px] text-amber-100 truncate">
                {stats.activeMission.desc} ({Math.floor(stats.activeMission.progress)}/{stats.activeMission.target})
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                +৳ {stats.activeMission.rewardTaka}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cash Collect, Near-Miss & Dynamic Weather Notifications */}
      <div className="self-center flex flex-col items-center gap-2 max-w-md w-full px-4">
        {stats.weatherAlert && (
          <div
            className={`w-full px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r ${stats.weatherAlert.color} border border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.35)] backdrop-blur-md flex items-center gap-3 animate-bounce`}
          >
            <span className="text-2xl sm:text-3xl shrink-0">{stats.weatherAlert.icon}</span>
            <div className="text-left font-mono">
              <div className="text-xs sm:text-sm font-black text-white tracking-wide">
                {stats.weatherAlert.title}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-white/95">
                {stats.weatherAlert.subtitle}
              </div>
            </div>
          </div>
        )}

        {cashToast && (
          <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 border border-emerald-400 shadow-[0_0_35px_rgba(0,230,118,0.7)] text-center animate-bounce">
            <div className="text-sm font-mono font-black text-white tracking-wider">
              💵 {cashToast.label} সংগৃহীত: +৳ {cashToast.amount}
            </div>
          </div>
        )}

        {nearMissToast && (
          <div className="px-5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-600/90 to-purple-600/90 border border-pink-400 shadow-[0_0_30px_rgba(255,0,119,0.6)] text-center animate-pulse">
            <div className="text-xs font-mono font-black text-white">
              ⚡ {nearMissToast.label || 'রিস্কি ওভারটেক বোনাস'}: +৳ {nearMissToast.bonusTaka} ({nearMissToast.combo.toFixed(1)}x)
            </div>
          </div>
        )}
      </div>

      {/* Bottom Spacer for Mobile Controls */}
      <div className="h-24 sm:h-8" />
    </div>
  );
};
