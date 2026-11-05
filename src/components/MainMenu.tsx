import React from 'react';
import { CarConfig, RoadTheme, GlobalUpgrades } from '../types/game';
import {
  Play,
  Volume2,
  VolumeX,
  Award,
  Gauge,
  Flame,
  Shield,
  Coins,
  Sparkles,
  ShoppingBag,
  MapPin,
  Magnet,
  Zap,
} from 'lucide-react';

interface MainMenuProps {
  selectedCar: CarConfig;
  selectedRoad: RoadTheme;
  upgrades: GlobalUpgrades;
  walletBalance: number;
  highScore: number;
  isMuted: boolean;
  freeSpinAvailable: boolean;
  onStartGame: () => void;
  onOpenShop: (tab?: 'cars' | 'roads' | 'upgrades' | 'neon') => void;
  onOpenLuckySpin: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCar,
  selectedRoad,
  upgrades,
  walletBalance,
  highScore,
  isMuted,
  freeSpinAvailable,
  onStartGame,
  onOpenShop,
  onOpenLuckySpin,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-b from-black/40 via-black/60 to-black/85 backdrop-blur-[2px] font-sans overflow-y-auto">
      <div className="w-full max-w-lg bg-[#030617f0] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_70px_rgba(0,234,255,0.25)] text-center text-white flex flex-col gap-3.5 my-auto">
        {/* Top Tag & Sound */}
        <div className="flex items-center justify-between">
          <div className="inline-flex px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 tracking-[2px] uppercase">
            3D হাইওয়ে কার রেসার · টাইকুন শপ
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="সাউন্ড"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,234,255,0.6)]">
            SPEED <span className="text-emerald-400 drop-shadow-[0_0_25px_rgba(0,230,118,0.7)]">TYCOON</span>
          </h1>
          <div className="text-[11px] font-mono tracking-[3px] text-cyan-300 uppercase mt-0.5">
            হাইওয়ে কার রেসার ও টাকা ইনকাম
          </div>
        </div>

        {/* Big In-Game Wallet & Shop Action */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/60 rounded-2xl p-3.5 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-emerald-400 uppercase font-bold">ইন-গেম ক্যাশ ওয়ালেট</div>
              <div className="text-2xl font-black font-mono text-emerald-300">
                ৳ {walletBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenShop('cars')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(0,230,118,0.5)] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            মেগা শপ
          </button>
        </div>

        {/* Action Hub: Selected Car & Road */}
        <div className="grid grid-cols-2 gap-2 text-left font-mono">
          {/* Selected Car */}
          <div
            onClick={() => onOpenShop('cars')}
            className="p-3 rounded-2xl bg-black/50 border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-[9px] text-cyan-400 uppercase flex items-center justify-between">
                <span>সুপারকার</span>
                <span className="text-slate-500 group-hover:text-cyan-300 text-[8px]">বদলান ❯</span>
              </div>
              <div className="text-sm font-bold text-white truncate mt-0.5">
                {selectedCar.name}
              </div>
            </div>
            <div className="text-[10px] text-cyan-300 mt-2 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> {selectedCar.topSpeed} KM/H
            </div>
          </div>

          {/* Selected Road */}
          <div
            onClick={() => onOpenShop('roads')}
            className="p-3 rounded-2xl bg-black/50 border border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="text-[9px] text-purple-400 uppercase flex items-center justify-between">
                <span>রাস্তা ও পরিবেশ</span>
                <span className="text-slate-500 group-hover:text-purple-300 text-[8px]">বদলান ❯</span>
              </div>
              <div className="text-sm font-bold text-white truncate mt-0.5">
                {selectedRoad.name}
              </div>
            </div>
            <div className="text-[10px] text-purple-300 mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> ট্র্যাক পরিবেশ
            </div>
          </div>
        </div>

        {/* Upgrades & Tuning Quick Badges */}
        <div
          onClick={() => onOpenShop('upgrades')}
          className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between font-mono text-xs"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-bold">টিউনিং আপগ্রেড:</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              স্পিড L{upgrades.engineLevel}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
              শিল্ড L{upgrades.shieldLevel}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center gap-0.5">
              <Magnet className="w-2.5 h-2.5" /> L{upgrades.magnetLevel}
            </span>
          </div>
        </div>

        {/* Lucky Spin Banner */}
        <button
          onClick={onOpenLuckySpin}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-300 font-mono font-bold text-xs flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>ভাগ্য চাকা (Lucky Spin)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px]">
            {freeSpinAvailable ? '🎁 ফ্রি স্পিন!' : 'স্পিন করুন'}
          </span>
        </button>

        {/* High Score & Play Button */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> হাই-স্কোর
            </span>
            <span className="font-bold text-white">{highScore.toLocaleString()} PTS</span>
          </div>

          <button
            onClick={onStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 hover:brightness-110 text-black font-mono font-black text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(0,234,255,0.7)] transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-black" />
            রেস শুরু করুন (START RACE)
          </button>
        </div>

        {/* Control Tips */}
        <div className="text-[10px] text-slate-400 font-mono">
          🕹️ <span className="text-slate-300">PC:</span> A/D বা Arrow Keys · <span className="text-slate-300">নাইট্রো:</span> W বা Up Arrow | <span className="text-slate-300">Mobile:</span> টাচ বাটন ও সোয়াইপ
        </div>
      </div>
    </div>
  );
};
