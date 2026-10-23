import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Play, FolderPlus, Music2, Disc, User, Folder, Radio } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { LibraryTab, Track } from '../types/music';

export const LibraryScreen: React.FC = () => {
  const { tracks, playTrack, openActionSheet, accentColor, addTracks } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<LibraryTab>('Songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'title' | 'artist' | 'date'>('title');

  const tabs: LibraryTab[] = ['Songs', 'Albums', 'Artists', 'Playlists', 'Folders', 'Genres'];

  const filteredTracks = tracks.filter((t) => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortOption === 'title') return a.title.localeCompare(b.title);
    if (sortOption === 'artist') return a.artist.localeCompare(b.artist);
    return b.addedAt - a.addedAt;
  });

  const handleImportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks: Track[] = Array.from(files).map((f) => ({
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      title: f.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Artist',
      album: 'Local Storage',
      duration: 180,
      coverArt: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23111"/><text x="50" y="55" fill="%2300F0FF" font-size="28" text-anchor="middle">♫</text></svg>',
      accentColor: '#00F0FF',
      audioUrl: URL.createObjectURL(f),
      fileBlob: f,
      addedAt: Date.now(),
      playCount: 0,
      genre: 'Local Audio'
    }));
    addTracks(newTracks);
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden pt-8 pb-32">
      {/* Top Header */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            CYBER<span style={{ color: accentColor }}>BEAT</span>
          </h1>
          <p className="text-white/40 text-[11px] font-mono tracking-wider uppercase">Neural Audio Core</p>
        </div>

        <label className="cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-white">
          <FolderPlus size={14} style={{ color: accentColor }} />
          <span>Import</span>
          <input type="file" multiple accept="audio/*" onChange={handleImportFiles} className="hidden" />
        </label>
      </div>

      {/* Sticky Fuzzy Search */}
      <div className="px-5 mb-3">
        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Search size={16} className="text-white/40 mr-2" />
          <input 
            type="text" 
            placeholder="Search tracks, artists, frequencies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-white/30"
          />
        </div>
      </div>

      {/* Lark-style Segmented Indicator Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar px-5 gap-4 border-b border-white/5 mb-3">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-xs font-semibold whitespace-nowrap relative transition-colors ${
              activeTab === tab ? 'text-white' : 'text-white/40'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sort Chips */}
      <div className="px-5 flex gap-2 mb-3">
        {(['title', 'artist', 'date'] as const).map((s) => (
          <button 
            key={s}
            onClick={() => setSortOption(s)}
            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-mono tracking-wider border transition-all ${
              sortOption === s ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-white/30'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Virtualized Song List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2 relative">
        {filteredTracks.map((track) => (
          <motion.div 
            key={track.id}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors"
          >
            <div 
              onClick={() => playTrack(track)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            >
              <img 
                src={track.coverArt} 
                alt={track.title} 
                className="w-12 h-12 rounded-lg object-cover border border-white/10" 
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate leading-tight">{track.title}</p>
                <p className="text-white/40 text-xs truncate mt-0.5">{track.artist} • {track.genre}</p>
              </div>
            </div>

            <button 
              onClick={() => openActionSheet(track)}
              className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white"
            >
              <MoreVertical size={16} />
            </button>
          </motion.div>
        ))}

        {filteredTracks.length === 0 && (
          <div className="text-center py-16 text-white/30 text-xs">
            No matching audio streams found.
          </div>
        )}
      </div>
    </div>
  );
};
