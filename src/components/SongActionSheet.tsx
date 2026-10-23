import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, PlusSquare, Trash2, X } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const SongActionSheet: React.FC = () => {
  const { isActionSheetOpen, actionSheetTrack, closeActionSheet, playTrack, toggleFavorite, accentColor } = usePlayerStore();

  if (!isActionSheetOpen || !actionSheetTrack) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={closeActionSheet}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
      >
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={actionSheetTrack.coverArt} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="text-white font-bold text-sm">{actionSheetTrack.title}</p>
                <p className="text-white/40 text-xs">{actionSheetTrack.artist}</p>
              </div>
            </div>
            <button onClick={closeActionSheet} className="text-white/50"><X size={20} /></button>
          </div>

          <div className="space-y-2 text-sm">
            <button 
              onClick={() => { playTrack(actionSheetTrack); closeActionSheet(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white"
            >
              <Play size={18} style={{ color: accentColor }} /> Play Now
            </button>
            <button 
              onClick={() => { toggleFavorite(actionSheetTrack.id); closeActionSheet(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white"
            >
              <Heart size={18} className={actionSheetTrack.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white/50'} />
              {actionSheetTrack.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
