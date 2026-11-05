import React, { useState, useRef } from 'react';
import { X, Sparkles, Trophy, Coins } from 'lucide-react';
import { sound } from '../audio/sound';
import confetti from 'canvas-confetti';

interface LuckySpinModalProps {
  balance: number;
  onReward: (rewardTaka: number, message: string) => void;
  onClose: () => void;
  freeSpinAvailable: boolean;
}

const SEGMENTS = [
  { label: '৳ ১০,০০০', type: 'cash', value: 10000, color: '#f59e0b', textColor: '#000' },
  { label: '৳ ১,০০০', type: 'cash', value: 1000, color: '#06b6d4', textColor: '#fff' },
  { label: '🛡️ শিল্ড + ৳১,৫০০', type: 'cash', value: 1500, color: '#3b82f6', textColor: '#fff' },
  { label: '৳ ৫,০০০', type: 'cash', value: 5000, color: '#10b981', textColor: '#000' },
  { label: '৳ ৫০০', type: 'cash', value: 500, color: '#64748b', textColor: '#fff' },
  { label: '⚡ নাইট্রো + ৳২,০০০', type: 'cash', value: 2000, color: '#ec4899', textColor: '#fff' },
  { label: '৳ ২,৫০০', type: 'cash', value: 2500, color: '#8b5cf6', textColor: '#fff' },
  { label: '৳ ৮,০০০ জ্যাকপট', type: 'cash', value: 8000, color: '#eab308', textColor: '#000' },
];

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  balance,
  onReward,
  onClose,
  freeSpinAvailable,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const spinCost = 500;

  const currentRotationRef = useRef(0);

  const handleSpin = () => {
    if (spinning) return;
    if (!freeSpinAvailable && balance < spinCost) {
      sound.tone(180, 0.15, 'sawtooth');
      return;
    }

    setSpinning(true);
    setWonPrize(null);

    sound.playSpin();

    // Pick random prize index
    const prizeIdx = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final angle (extra spins + target index)
    const extraRotations = 5 * 360;
    const targetAngle = extraRotations + (SEGMENTS.length - prizeIdx) * segmentAngle - segmentAngle / 2;

    const newTotal = currentRotationRef.current + targetAngle;
    currentRotationRef.current = newTotal;
    setRotation(newTotal);

    setTimeout(() => {
      setSpinning(false);
      const prize = SEGMENTS[prizeIdx];
      setWonPrize(prize.label);

      sound.playBuySuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch {}

      onReward(prize.value, prize.label);
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-md bg-[#05081c] border border-amber-500/50 rounded-3xl p-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col items-center text-center text-white relative">
        <button
          onClick={onClose}
          disabled={spinning}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono text-amber-300 uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> লাকি হুইল রিওয়ার্ড
        </div>

        <h3 className="text-2xl font-black font-mono tracking-tight text-white">
          ভাগ্য চাকা <span className="text-amber-400">স্পিন অ্যান্ড উইন</span>
        </h3>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          চাকা ঘুরিয়ে জিতে নিন মেগা ক্যাশ জ্যাকপট ও শিল্ড বোনাস!
        </p>

        {/* Live Wallet */}
        <div className="my-3 px-4 py-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-300 font-bold">
            ওয়ালেট: ৳ {balance.toLocaleString()}
          </span>
        </div>

        {/* Wheel Container */}
        <div className="relative my-4 w-64 h-64 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

          {/* Wheel Graphic */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)] overflow-hidden relative transition-transform duration-[4200ms] ease-[cubic-bezier(0.12,0.8,0.33,1)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                ${SEGMENTS[0].color} 0deg 45deg,
                ${SEGMENTS[1].color} 45deg 90deg,
                ${SEGMENTS[2].color} 90deg 135deg,
                ${SEGMENTS[3].color} 135deg 180deg,
                ${SEGMENTS[4].color} 180deg 225deg,
                ${SEGMENTS[5].color} 225deg 270deg,
                ${SEGMENTS[6].color} 270deg 315deg,
                ${SEGMENTS[7].color} 315deg 360deg
              )`,
            }}
          >
            {/* Center Hub */}
            <div className="absolute inset-[32%] rounded-full bg-[#0a0f29] border-4 border-amber-400 flex items-center justify-center shadow-inner z-10">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Result Announcement */}
        {wonPrize && (
          <div className="mb-3 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-sm animate-bounce">
            🎉 অভিনন্দন! আপনি জিতেছেন: {wonPrize}!
          </div>
        )}

        {/* Spin Trigger Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || (!freeSpinAvailable && balance < spinCost)}
          className={`w-full py-3.5 rounded-2xl font-mono font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            freeSpinAvailable
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:brightness-110'
              : balance >= spinCost
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,230,118,0.4)]'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {spinning ? (
            'চাকা ঘুরছে...'
          ) : freeSpinAvailable ? (
            '🎁 ফ্রি স্পিন করুন!'
          ) : (
            `৳ ${spinCost} দিয়ে স্পিন করুন`
          )}
        </button>
      </div>
    </div>
  );
};
