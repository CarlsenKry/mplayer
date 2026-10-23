import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const LyricsModal: React.FC = () => {
  const { isLyricsOpen, setLyricsOpen, currentTrack, currentTime, seek, accentColor } = usePlayerStore();

  const parsedLyrics = useMemo(() => {
    if (!currentTrack?.lyrics) return [];
    return currentTrack.lyrics.split('\n').map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
        return { time, text: match[3].trim() };
      }
      return { time: 0, text: line };
    }).filter(l => l.text.length > 0);
  }, [currentTrack?.lyrics]);

  const activeIndex = useMemo(() => {
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) return i;
    }
    return 0;
  }, [currentTime, parsedLyrics]);

  return (
    <AnimatePresence>
      {isLyricsOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-white text-lg font-bold">Synced Lyrics</h2>
              <p className="text-white/40 text-xs">{currentTrack?.title}</p>
            </div>
            <button 
              onClick={() => setLyricsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 flex flex-col items-center justify-center text-center px-4">
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <p 
                    key={idx}
                    onClick={() => seek(item.time)}
                    className={`transition-all duration-300 cursor-pointer font-bold select-none ${
                      isActive 
                        ? 'text-2xl scale-110 drop-shadow-md' 
                        : 'text-lg text-white/30 hover:text-white/60'
                    }`}
                    style={{ color: isActive ? accentColor : undefined }}
                  >
                    {item.text}
                  </p>
                );
              })
            ) : (
              <p className="text-white/30 text-sm">No synchronized LRC lyrics available for this track.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
