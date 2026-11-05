import React, { useState } from 'react';
import { CarConfig, RoadTheme, GlobalUpgrades } from '../types/game';
import { UPGRADE_TIERS, UNDERGLOW_PALETTES } from '../data/cars';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Car,
  MapPin,
  Zap,
  Sparkles,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Shield,
  Gauge,
  Magnet,
  TrendingUp,
  Coins,
} from 'lucide-react';

interface UnderglowItem {
  name: string;
  color: string;
  price: number;
  unlocked: boolean;
}

interface ShopModalProps {
  balance: number;
  cars: CarConfig[];
  selectedCarIndex: number;
  onSelectCar: (index: number) => void;
  onBuyCar: (index: number) => void;
  roads: RoadTheme[];
  selectedRoadIndex: number;
  onSelectRoad: (index: number) => void;
  onBuyRoad: (index: number) => void;
  upgrades: GlobalUpgrades;
  onUpgrade: (type: keyof GlobalUpgrades) => void;
  underglows: UnderglowItem[];
  selectedUnderglow: string;
  onSelectUnderglow: (color: string) => void;
  onBuyUnderglow: (color: string, price: number) => void;
  onClose: () => void;
  defaultTab?: 'cars' | 'roads' | 'upgrades' | 'neon';
}

export const ShopModal: React.FC<ShopModalProps> = ({
  balance,
  cars,
  selectedCarIndex,
  onSelectCar,
  onBuyCar,
  roads,
  selectedRoadIndex,
  onSelectRoad,
  onBuyRoad,
  upgrades,
  onUpgrade,
  underglows,
  selectedUnderglow,
  onSelectUnderglow,
  onBuyUnderglow,
  onClose,
  defaultTab = 'cars',
}) => {
  const [tab, setTab] = useState<'cars' | 'roads' | 'upgrades' | 'neon'>(defaultTab);
  const [activeCarIdx, setActiveCarIdx] = useState<number>(selectedCarIndex);

  const curCar = cars[activeCarIdx];

  const handleNextCar = () => {
    sound.tone(360, 0.05);
    setActiveCarIdx((prev) => (prev + 1) % cars.length);
  };

  const handlePrevCar = () => {
    sound.tone(320, 0.05);
    setActiveCarIdx((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-4xl max-h-[94vh] bg-[#030617f6] border border-cyan-500/50 rounded-3xl shadow-[0_0_80px_rgba(0,234,255,0.25)] flex flex-col overflow-hidden text-white">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,234,255,0.5)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                মেগা টাইকুন শপ <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">100% IN-GAME</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                রেসে আয় করা টাকা দিয়ে সুপারকার, হাইওয়ে রাস্তা ও পারফরম্যান্স কিনুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Wallet Balance */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
              <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left font-mono">
                <div className="text-[8px] text-emerald-400 uppercase font-bold">ব্যালেন্স</div>
                <div className="text-sm sm:text-base font-black text-emerald-300">
                  ৳ {balance.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-black/40 p-1 sm:p-2 gap-1 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => { setTab('cars'); sound.tone(400, 0.04); }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'cars'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold shadow-[0_0_15px_rgba(0,234,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" /> সুপারকার ({cars.length})
          </button>

          <button
            onClick={() => { setTab('roads'); sound.tone(450, 0.04); }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'roads'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/60 font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" /> হাইওয়ে রাস্তা ({roads.length})
          </button>

          <button
            onClick={() => { setTab('upgrades'); sound.tone(500, 0.04); }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'upgrades'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> টিউনিং ও আপগ্রেড
          </button>

          <button
            onClick={() => { setTab('neon'); sound.tone(550, 0.04); }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'neon'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-400/60 font-bold shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> নিয়ন আন্ডারগ্লো
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: CARS */}
          {tab === 'cars' && (
            <div className="flex flex-col gap-5">
              {/* Car Carousel Selector */}
              <div className="bg-gradient-to-b from-slate-950/80 to-[#050a20] border border-cyan-500/30 rounded-3xl p-5 relative overflow-hidden">
                <div
                  className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: curCar.underglow }}
                />

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevCar}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-400 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="text-center">
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                      {curCar.brand}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
                      {curCar.name}
                    </h3>
                  </div>

                  <button
                    onClick={handleNextCar}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-400 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Car 3D Spec Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" /> টপ স্পিড
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {curCar.topSpeed} <span className="text-xs text-cyan-300">KM/H</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> অ্যাক্সিলারেশন
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {curCar.accel} <span className="text-xs text-amber-300">/ 100</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
                      <Flame className="w-3.5 h-3.5 text-pink-400" /> নাইট্রো পাওয়ার
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      +{curCar.nitroBoost} <span className="text-xs text-pink-300">KM/H</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5 text-blue-400" /> বডি আর্মার
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {curCar.maxShields} <span className="text-xs text-blue-300">হিট</span>
                    </div>
                  </div>
                </div>

                {/* Car Action Button */}
                <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-left font-mono">
                    <div className="text-[10px] text-slate-400 uppercase">মূল্য</div>
                    <div className="text-xl font-black text-emerald-400">
                      {curCar.priceTaka === 0 ? 'ফ্রি (স্টক কার)' : `৳ ${curCar.priceTaka.toLocaleString()}`}
                    </div>
                  </div>

                  {curCar.unlocked ? (
                    selectedCarIndex === activeCarIdx ? (
                      <div className="px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-bold text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" /> নির্বাচিত (EQUIPPED)
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectCar(activeCarIdx);
                          sound.tone(600, 0.08);
                        }}
                        className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)] transition-all cursor-pointer"
                      >
                        ড্রাইভ করুন (SELECT)
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (balance >= curCar.priceTaka) {
                          onBuyCar(activeCarIdx);
                          sound.playBuySuccess();
                          triggerConfetti();
                        } else {
                          sound.tone(180, 0.15, 'sawtooth');
                        }
                      }}
                      disabled={balance < curCar.priceTaka}
                      className={`px-6 py-3 rounded-2xl font-mono font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                        balance >= curCar.priceTaka
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(0,230,118,0.5)]'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      {balance >= curCar.priceTaka
                        ? `৳ ${curCar.priceTaka.toLocaleString()} দিয়ে কিনুন`
                        : `আরও ৳ ${(curCar.priceTaka - balance).toLocaleString()} প্রয়োজন`}
                    </button>
                  )}
                </div>
              </div>

              {/* Roster Thumbnail Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono">
                {cars.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCarIdx(i);
                      sound.tone(420, 0.03);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeCarIdx === i
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,234,255,0.3)]'
                        : selectedCarIndex === i
                        ? 'bg-slate-900 border-emerald-500/50'
                        : 'bg-black/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                      <span>#{i + 1}</span>
                      {c.unlocked ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{c.name}</div>
                    <div className="text-[10px] text-emerald-400">
                      {c.priceTaka === 0 ? 'ফ্রি' : `৳ ${c.priceTaka.toLocaleString()}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROADS & ENVIRONMENTS */}
          {tab === 'roads' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              {roads.map((road, idx) => {
                const isSelected = selectedRoadIndex === idx;
                const canAfford = balance >= road.priceTaka;

                return (
                  <div
                    key={road.id}
                    className={`rounded-3xl p-5 border relative overflow-hidden transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                          হাইওয়ে ট্র্যাক #{idx + 1}
                        </div>
                        <h4 className="text-xl font-black text-white">{road.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-sans">{road.tagline}</p>
                      </div>

                      <div
                        className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `#${road.roadColor.toString(16).padStart(6, '0')}`,
                          borderColor: `#${road.lineColorA.toString(16).padStart(6, '0')}`,
                        }}
                      >
                        <MapPin
                          className="w-5 h-5"
                          style={{ color: `#${road.lineColorA.toString(16).padStart(6, '0')}` }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">মূল্য</div>
                        <div className="text-base font-bold text-emerald-400">
                          {road.priceTaka === 0 ? 'ফ্রি (ডিফল্ট)' : `৳ ${road.priceTaka.toLocaleString()}`}
                        </div>
                      </div>

                      {road.unlocked ? (
                        isSelected ? (
                          <span className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300 font-bold text-xs flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> অ্যাক্টিভ রাস্তা
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectRoad(idx);
                              sound.tone(600, 0.08);
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                          >
                            রাস্তা সিলেক্ট করুন
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              onBuyRoad(idx);
                              sound.playBuySuccess();
                              triggerConfetti();
                            } else {
                              sound.tone(180, 0.15, 'sawtooth');
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,230,118,0.5)]'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {canAfford ? 'কিনুন ও আনলক করুন' : 'পর্যাপ্ত টাকা নেই'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: UPGRADES & TUNING */}
          {tab === 'upgrades' && (
            <div className="flex flex-col gap-4 font-mono">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200">
                ⚡ <span className="font-bold text-amber-400">পারফরম্যান্স টিউনিং:</span> এখানে ক্রয় করা স্পিড, আর্মার ও ম্যাগনেট আপগ্রেড আপনার সবকটি গাড়িতে স্বয়ংক্রিয়ভাবে কার্যকর থাকবে!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Engine ECU */}
                {(() => {
                  const curLvl = upgrades.engineLevel;
                  const nextTier = UPGRADE_TIERS.engine[curLvl];
                  const maxed = curLvl >= 5;
                  const canAfford = nextTier && balance >= nextTier.cost;

                  return (
                    <div className="bg-slate-950/70 border border-cyan-500/30 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-base font-bold text-white">টপ স্পিড ইঞ্জিন টিউনিং</h4>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                            লেভেল {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          ইঞ্জিন রি-ম্যাপিং করে গাড়ির সর্বোচ্চ স্পিড বাড়িয়ে নিন।
                        </p>

                        <div className="flex items-center gap-1.5 my-3 h-2 bg-slate-900 rounded-full p-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full ${
                                i < curLvl ? 'bg-cyan-400 shadow-[0_0_8px_#00eaff]' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            {maxed ? 'সর্বোচ্চ বুস্ট' : `পরবর্তী: ${nextTier.boost}`}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {maxed ? 'ম্যাক্স লেভেল' : `৳ ${nextTier.cost.toLocaleString()}`}
                          </div>
                        </div>

                        {!maxed && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onUpgrade('engineLevel');
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,234,255,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> আপগ্রেড
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Nitro Boost */}
                {(() => {
                  const curLvl = upgrades.nitroLevel;
                  const nextTier = UPGRADE_TIERS.nitro[curLvl];
                  const maxed = curLvl >= 5;
                  const canAfford = nextTier && balance >= nextTier.cost;

                  return (
                    <div className="bg-slate-950/70 border border-pink-500/30 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-pink-400" />
                            <h4 className="text-base font-bold text-white">টার্বো নাইট্রো বুস্টার</h4>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                            লেভেল {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          নাইট্রো দ্রুত রিচার্জ ও দীর্ঘক্ষণ বুস্ট পাওয়ার ধরে রাখে।
                        </p>

                        <div className="flex items-center gap-1.5 my-3 h-2 bg-slate-900 rounded-full p-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full ${
                                i < curLvl ? 'bg-pink-400 shadow-[0_0_8px_#ff0077]' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            {maxed ? 'সর্বোচ্চ বুস্ট' : `পরবর্তী: ${nextTier.boost}`}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {maxed ? 'ম্যাক্স লেভেল' : `৳ ${nextTier.cost.toLocaleString()}`}
                          </div>
                        </div>

                        {!maxed && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onUpgrade('nitroLevel');
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-pink-500 hover:bg-pink-400 text-black shadow-[0_0_15px_rgba(255,0,119,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> আপগ্রেড
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Shield Plating */}
                {(() => {
                  const curLvl = upgrades.shieldLevel;
                  const nextTier = UPGRADE_TIERS.shield[curLvl];
                  const maxed = curLvl >= 5;
                  const canAfford = nextTier && balance >= nextTier.cost;

                  return (
                    <div className="bg-slate-950/70 border border-blue-500/30 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <h4 className="text-base font-bold text-white">আর্মার শিল্ড প্রটেকশন</h4>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                            লেভেল {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          ক্র্যাশ হলেও গাড়ি ধ্বংস হবে না; এক্সট্রা শিল্ড দিয়ে বেঁচে যাবেন!
                        </p>

                        <div className="flex items-center gap-1.5 my-3 h-2 bg-slate-900 rounded-full p-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full ${
                                i < curLvl ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            {maxed ? 'সর্বোচ্চ বুস্ট' : `পরবর্তী: ${nextTier.boost}`}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {maxed ? 'ম্যাক্স লেভেল' : `৳ ${nextTier.cost.toLocaleString()}`}
                          </div>
                        </div>

                        {!maxed && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onUpgrade('shieldLevel');
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-blue-500 hover:bg-blue-400 text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> আপগ্রেড
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Cash Magnet */}
                {(() => {
                  const curLvl = upgrades.magnetLevel;
                  const nextTier = UPGRADE_TIERS.magnet[curLvl];
                  const maxed = curLvl >= 5;
                  const canAfford = nextTier && balance >= nextTier.cost;

                  return (
                    <div className="bg-slate-950/70 border border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Magnet className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-base font-bold text-white">ক্যাশ ম্যাগনেট গ্যাজেট</h4>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            লেভেল {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          রাস্তার দূরের টাকার বান্ডিল ও কয়েন স্বয়ংক্রিয়ভাবে গাড়ির কাছে টেনে আনবে!
                        </p>

                        <div className="flex items-center gap-1.5 my-3 h-2 bg-slate-900 rounded-full p-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full ${
                                i < curLvl ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            {maxed ? 'সর্বোচ্চ বুস্ট' : `রেঞ্জ: ${nextTier.boost}`}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {maxed ? 'ম্যাক্স লেভেল' : `৳ ${nextTier.cost.toLocaleString()}`}
                          </div>
                        </div>

                        {!maxed && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onUpgrade('magnetLevel');
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> আপগ্রেড
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Income Multiplier */}
                {(() => {
                  const curLvl = upgrades.multiplierLevel;
                  const nextTier = UPGRADE_TIERS.multiplier[curLvl];
                  const maxed = curLvl >= 5;
                  const canAfford = nextTier && balance >= nextTier.cost;

                  return (
                    <div className="col-span-1 md:col-span-2 bg-slate-950/70 border border-amber-500/30 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                            <h4 className="text-base font-bold text-white">ইনকাম মাল্টিপ্লায়ার (Tycoon Bonus)</h4>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            লেভেল {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          রোডের ক্যাশ পিকআপ ও ওভারটেক বোনাস থেকে আরও বেশি বেশি টাকা আয় করুন (দ্বিগুণ পর্যন্ত)!
                        </p>

                        <div className="flex items-center gap-1.5 my-3 h-2 bg-slate-900 rounded-full p-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full ${
                                i < curLvl ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                        <div>
                          <div className="text-[10px] text-slate-400">
                            {maxed ? 'সর্বোচ্চ গুণক' : `ইনকাম বুস্ট: ${nextTier.boost}`}
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {maxed ? 'ম্যাক্স লেভেল' : `৳ ${nextTier.cost.toLocaleString()}`}
                          </div>
                        </div>

                        {!maxed && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onUpgrade('multiplierLevel');
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> আপগ্রেড
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: NEON UNDERGLOW */}
          {tab === 'neon' && (
            <div className="flex flex-col gap-4 font-mono">
              <p className="text-xs text-slate-400">
                আপনার গাড়ির নিচের নিয়ন আন্ডারগ্লো লাইটিং কাস্টমাইজ করুন। কেনা রঙগুলো সরাসরি গাড়িতে ইনস্টল হবে!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {underglows.map((item) => {
                  const isEquipped = selectedUnderglow === item.color;
                  const canAfford = balance >= item.price;

                  return (
                    <div
                      key={item.name}
                      className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,234,255,0.3)]'
                          : 'bg-black/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-2xl border shadow-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: item.color,
                            borderColor: item.color,
                            boxShadow: `0 0 16px ${item.color}`,
                          }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <div className="text-[10px] text-emerald-400">
                            {item.price === 0 ? 'ফ্রি' : `৳ ${item.price.toLocaleString()}`}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                        {item.unlocked ? (
                          isEquipped ? (
                            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> ইনস্টলড
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectUnderglow(item.color);
                                sound.tone(550, 0.05);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold cursor-pointer transition-all"
                            >
                              ইনস্টল করুন
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                onBuyUnderglow(item.color, item.price);
                                sound.playBuySuccess();
                                triggerConfetti();
                              } else {
                                sound.tone(180, 0.15, 'sawtooth');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(0,230,118,0.4)]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            {canAfford ? 'কিনুন' : 'টাকা কম'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
