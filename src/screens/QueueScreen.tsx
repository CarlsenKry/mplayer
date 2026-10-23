import React, { useState } from 'react';
import { Trash2, BookmarkPlus, Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const QueueScreen: React.FC = () => {
  const { queue, currentTrack, playTrack, removeFromQueue, saveQueueAsPlaylist, accentColor } = usePlayerStore();
  const [playlistName, setPlaylistName] = useState('');
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-black px-5 pt-8 pb-32 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Playback Queue</h1>
          <p className="text-white/40 text-xs">{queue.length} streams loaded</p>
        </div>
        <button 
          onClick={() => setShowSave(!showSave)}
          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center gap-1.5"
        >
          <BookmarkPlus size={14} style={{ color: accentColor }} /> Save Queue
        </button>
      </div>

      {showSave && (
        <div className="flex gap-2 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <input 
            type="text" 
            placeholder="Playlist name..." 
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none w-full"
          />
          <button 
            onClick={() => {
              if (playlistName) {
                saveQueueAsPlaylist(playlistName);
                setPlaylistName('');
                setShowSave(false);
              }
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold text-black"
            style={{ backgroundColor: accentColor }}
          >
            Save
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {queue.map((track, idx) => {
          const isCurrent = track.id === currentTrack?.id;
          return (
            <div 
              key={`${track.id}_${idx}`}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                isCurrent ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div 
                onClick={() => playTrack(track)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <span className="text-xs font-mono text-white/30 w-4">{idx + 1}</span>
                <img src={track.coverArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-white/40 text-[11px] truncate">{track.artist}</p>
                </div>
              </div>

              <button 
                onClick={() => removeFromQueue(idx)}
                className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-rose-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
