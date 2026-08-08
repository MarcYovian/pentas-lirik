import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Square, EyeOff, Radio } from 'lucide-react';
import { LyricChunk } from '../../types';

interface MobileStepperProps {
  currentChunkIndex: number;
  totalChunks: number;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
  isLiveActive: boolean;
  hasSelectedSong: boolean;
  isModalOpen?: boolean;
}

export const MobileStepper: React.FC<MobileStepperProps> = ({
  currentChunkIndex,
  totalChunks,
  onNext,
  onPrev,
  onClear,
  isLiveActive,
  hasSelectedSong,
  isModalOpen = false,
}) => {
  if (isModalOpen) return null;

  const canGoPrev = hasSelectedSong && currentChunkIndex > 0;
  const canGoNext = hasSelectedSong && currentChunkIndex < totalChunks - 1;


  return createPortal(
    <div id="mobile-bottom-stepper-bar" className="fixed bottom-0 left-0 right-0 z-[90] pb-safe block md:hidden pointer-events-none">
      <div className="mx-auto max-w-lg px-3 pb-2 pt-1 pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl space-y-2">
          {/* Emergency & Quick Status Bar */}
          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-[11px] font-semibold text-slate-300 truncate">
                {hasSelectedSong && totalChunks > 0
                  ? `Bait ${currentChunkIndex >= 0 ? currentChunkIndex + 1 : 0} dari ${totalChunks}`
                  : 'Siap Menayangkan'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClear}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider transition min-h-[34px] flex items-center gap-1 ${
                  isLiveActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 active:scale-95'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Clear Screen</span>
              </button>
            </div>
          </div>

          {/* Primary Stepper Buttons */}
          <div className="flex items-center gap-2">
            {/* PREV STANZA Button */}
            <button
              onClick={onPrev}
              disabled={!canGoPrev}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-1.5 border transition touch-manipulation active:scale-[0.97] ${
                canGoPrev
                  ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border-slate-700 shadow-md'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
              }`}
              title="Bait Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
              <span>PREV</span>
            </button>

            {/* NEXT STANZA Button */}
            <button
              onClick={onNext}
              disabled={!hasSelectedSong || totalChunks === 0}
              className={`flex-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-2 transition shadow-lg touch-manipulation active:scale-[0.97] ${
                hasSelectedSong && totalChunks > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
              title="Bait Berikutnya"
            >
              <span>NEXT STANZA</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
