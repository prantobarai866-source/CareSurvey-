import React from 'react';
import { Play, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onHome }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
      <div className="w-full max-w-xs bg-[#04081ae8] border border-cyan-500/40 rounded-3xl p-6 text-center text-white flex flex-col gap-4 shadow-[0_0_40px_rgba(0,234,255,0.25)]">
        <div>
          <div className="text-[10px] font-mono tracking-[4px] text-cyan-400 uppercase">
            গেম স্থগিত আছে
          </div>
          <h2 className="text-2xl font-black font-mono tracking-wider text-cyan-100 mt-1">
            PAUSED
          </h2>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black font-mono text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,234,255,0.4)] transition-transform active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> খেলা চালিয়ে যান
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" /> মেইন মেনু
          </button>
        </div>
      </div>
    </div>
  );
};
