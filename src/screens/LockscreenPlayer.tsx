import React, { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Heart, ChevronDown, ListMusic, Mic2, Moon 
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { VisualizerCanvas } from '../components/VisualizerCanvas';
import { WaveformSeekbar } from '../components/WaveformSeekbar';

export const LockscreenPlayer: React.FC = () => {
  const {
    currentTrack, isPlaying, currentTime, duration,
    togglePlay, nextTrack, prevTrack, seek,
    isShuffle, toggleShuffle, repeatMode, cycleRepeat,
    visualizerMode, setVisualizerMode, accentColor,
    isLockscreenOpen, setLockscreenOpen, setLyricsOpen,
    toggleFavorite, setSleepTimer
  } = usePlayerStore();

  const [clock, setClock] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLockscreenOpen || !currentTrack) return null;

  const cycleVisualizer = () => {
    const nextMode = visualizerMode === 'radial' ? 'waveform' : visualizerMode === 'waveform' ? 'bars' : 'radial';
    setVisualizerMode(nextMode);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) setLockscreenOpen(false);
    if (info.offset.x < -80) nextTrack();
    if (info.offset.x > 80) prevTrack();
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col justify-between overflow-hidden select-none pb-6"
    >
      {/* Dynamic drifting background glow */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-35 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Lockscreen Status Header */}
      <div className="pt-8 px-6 flex flex-col items-center">
        <button 
          onClick={() => setLockscreenOpen(false)}
          className="w-12 h-1.5 rounded-full bg-white/20 mb-4 active:scale-95"
        />
        <div className="flex justify-between w-full items-center text-white/50 text-xs">
          <span>{dateStr}</span>
          <ChevronDown size={20} className="text-white/40 cursor-pointer" onClick={() => setLockscreenOpen(false)} />
          <span className="font-mono text-emerald-400">99%</span>
        </div>
        <h1 className="text-6xl font-light tracking-tighter text-white mt-1 font-mono">{clock}</h1>
      </div>

      {/* Hero Album Art with Radial Visualizer Orbit */}
      <div className="relative w-full flex items-center justify-center my-auto">
        <VisualizerCanvas 
          mode={visualizerMode} 
          accentColor={accentColor} 
          className="absolute z-0 pointer-events-none"
        />

        <motion.div 
          onClick={cycleVisualizer}
          whileTap={{ scale: 0.96 }}
          className="relative z-10 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl cursor-pointer border border-white/10"
          style={{ boxShadow: `0 0 35px ${accentColor}40` }}
        >
          <img 
            src={currentTrack.coverArt} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-mono text-white/70 uppercase">
            {visualizerMode}
          </div>
        </motion.div>
      </div>

      {/* Track Info & Controls */}
      <div className="px-6 flex flex-col items-center w-full">
        <div className="w-full flex items-center justify-between mb-2">
          <div className="min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-white truncate tracking-tight">{currentTrack.title}</h2>
            <p className="text-sm font-medium text-white/50 truncate mt-0.5">{currentTrack.artist}</p>
          </div>
          <button 
            onClick={() => toggleFavorite(currentTrack.id)} 
            className="w-11 h-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90"
          >
            <Heart 
              size={20} 
              className={currentTrack.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white/60'} 
            />
          </button>
        </div>

        {/* Scrub Seekbar */}
        <WaveformSeekbar 
          currentTime={currentTime}
          duration={duration}
          accentColor={accentColor}
          onSeek={seek}
        />

        {/* Primary Playback Buttons */}
        <div className="flex items-center justify-between w-full mt-2 px-2">
          <button 
            onClick={toggleShuffle} 
            className={`p-2 transition-colors ${isShuffle ? 'text-cyan-400' : 'text-white/30'}`}
          >
            <Shuffle size={20} />
          </button>

          <button 
            onClick={prevTrack} 
            className="w-12 h-12 flex items-center justify-center text-white/80 active:scale-90"
          >
            <SkipBack size={26} />
          </button>

          {/* Morphing Big Play Button */}
          <motion.button 
            onClick={togglePlay}
            whileTap={{ scale: 0.92 }}
            className="w-18 h-18 rounded-full flex items-center justify-center shadow-xl p-5"
            style={{ 
              backgroundColor: accentColor, 
              boxShadow: `0 0 25px ${accentColor}80` 
            }}
          >
            {isPlaying ? (
              <Pause size={30} fill="#000" className="text-black" />
            ) : (
              <Play size={30} fill="#000" className="text-black ml-1" />
            )}
          </motion.button>

          <button 
            onClick={nextTrack} 
            className="w-12 h-12 flex items-center justify-center text-white/80 active:scale-90"
          >
            <SkipForward size={26} />
          </button>

          <button 
            onClick={cycleRepeat} 
            className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-white/30'}`}
          >
            <Repeat size={20} />
          </button>
        </div>

        {/* Bottom Lockscreen Action Bar */}
        <div className="flex items-center justify-around w-full mt-6 pt-4 border-t border-white/5 text-white/50">
          <button onClick={() => setLyricsOpen(true)} className="flex items-center gap-1.5 text-xs hover:text-white">
            <Mic2 size={16} /> Lyrics
          </button>
          <button onClick={() => setSleepTimer(30)} className="flex items-center gap-1.5 text-xs hover:text-white">
            <Moon size={16} /> 30m Sleep
          </button>
          <button onClick={() => setLockscreenOpen(false)} className="flex items-center gap-1.5 text-xs hover:text-white">
            <ListMusic size={16} /> Library
          </button>
        </div>
      </div>
    </motion.div>
  );
};
