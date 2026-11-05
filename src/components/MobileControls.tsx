import React from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetBoost: (boosting: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSetBoost,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 sm:px-8 flex items-end justify-between pointer-events-none z-30 select-none">
      {/* Steering Arrows */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveLeft();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#030614dd] border-2 border-cyan-400/80 text-cyan-300 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,234,255,0.3)] active:scale-95 active:bg-cyan-950 transition-transform cursor-pointer"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-8 h-8" />
          <span className="text-[9px] font-mono font-bold">বামে</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onMoveRight();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#030614dd] border-2 border-pink-400/80 text-pink-300 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,0,119,0.3)] active:scale-95 active:bg-pink-950 transition-transform cursor-pointer"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-8 h-8" />
          <span className="text-[9px] font-mono font-bold">ডানে</span>
        </button>
      </div>

      {/* Big Nitro Boost Button */}
      <div className="pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSetBoost(true);
          }}
          onPointerUp={() => onSetBoost(false)}
          onPointerLeave={() => onSetBoost(false)}
          onPointerCancel={() => onSetBoost(false)}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 border-2 border-white text-white flex flex-col items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.6)] active:scale-95 transition-transform cursor-pointer"
          aria-label="Engage Nitro Boost"
        >
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse text-amber-200" />
          <span className="text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase mt-0.5">
            নাইট্রো
          </span>
        </button>
      </div>
    </div>
  );
};
