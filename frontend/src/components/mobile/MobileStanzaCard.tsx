import React from 'react';
import { Send, Eye, Radio } from 'lucide-react';
import { LyricChunk } from '../../types';

interface MobileStanzaCardProps {
  chunk: LyricChunk;
  isLive: boolean;
  isNext: boolean;
  onSendLive: (chunk: LyricChunk) => void;
}

export const MobileStanzaCard: React.FC<MobileStanzaCardProps> = ({
  chunk,
  isLive,
  isNext,
  onSendLive,
}) => {
  // Determine color styling based on stanza label category
  const getBadgeStyle = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('verse') || l.includes('bait')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else if (l.includes('chorus') || l.includes('reff')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    } else if (l.includes('bridge')) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    } else if (l.includes('tag') || l.includes('outro') || l.includes('intro')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  };

  return (
    <button
      id={`mobile-stanza-card-${chunk.id}`}
      onClick={() => onSendLive(chunk)}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden select-none active:scale-[0.98] min-h-[64px] flex flex-col justify-between mb-2.5 touch-manipulation ${
        isLive
          ? 'bg-indigo-950/90 border-2 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-950/80 text-white font-semibold'
          : isNext
          ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/40 hover:border-amber-400'
          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-100 hover:border-indigo-500/40'
      }`}
    >
      {/* Stanza Card Header Badge & Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider border mono ${getBadgeStyle(
            chunk.label
          )}`}
        >
          {chunk.label}
        </span>

        {isLive ? (
          <span className="flex items-center gap-1 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-md">
            <Radio className="w-3 h-3 text-white" />
            LIVE ON AIR
          </span>
        ) : isNext ? (
          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Eye className="w-3 h-3 text-amber-400" />
            NEXT UP
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Tap Send</span>
            <Send className="w-3 h-3 text-indigo-400" />
          </span>
        )}
      </div>

      {/* Stanza Lyric Text Lines */}
      <pre className="font-sans text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed tracking-wide text-white">
        {chunk.content}
      </pre>
    </button>
  );
};
