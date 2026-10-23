import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const FloatingMiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, nextTrack, setLockscreenOpen, accentColor } = usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) : 0;
  const strokeDashoffset = 100 - (progress * 100);

  return (
    <motion.div 
      layoutId="player-body"
      onClick={() => setLockscreenOpen(true)}
      className="fixed bottom-16 left-4 right-4 h-16 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center justify-between px-3 shadow-2xl z-40 cursor-pointer overflow-hidden"
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.img 
          layoutId="player-art"
          src={currentTrack.coverArt} 
          alt={currentTrack.title} 
          className="w-11 h-11 rounded-xl object-cover border border-white/10"
        />
        <div className="min-w-0 pr-2">
          <p className="text-white text-sm font-semibold truncate leading-tight">{currentTrack.title}</p>
          <p className="text-white/40 text-xs truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Play with circular progress */}
        <button 
          onClick={togglePlay}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 active:scale-90 transition-transform"
        >
          <svg className="w-10 h-10 absolute -rotate-90">
            <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
            <circle 
              cx="20" cy="20" r="16" 
              fill="transparent" 
              stroke={accentColor} 
              strokeWidth="2.5"
              strokeDasharray="100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
        </button>

        <button 
          onClick={nextTrack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 active:scale-90"
        >
          <SkipForward size={18} />
        </button>
      </div>
    </motion.div>
  );
};
