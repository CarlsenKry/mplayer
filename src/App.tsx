import React, { useEffect, useState } from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import { LibraryScreen } from './screens/LibraryScreen';
import { QueueScreen } from './screens/QueueScreen';
import { EqualizerScreen } from './screens/EqualizerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LockscreenPlayer } from './screens/LockscreenPlayer';
import { FloatingMiniPlayer } from './components/FloatingMiniPlayer';
import { LyricsModal } from './components/LyricsModal';
import { SongActionSheet } from './components/SongActionSheet';
import { Library, ListMusic, Sliders, Settings } from 'lucide-react';

export default function App() {
  const { init, activeTab, setActiveTab, isLockscreenOpen, theme } = usePlayerStore();
  const [navScreen, setNavScreen] = useState<'library' | 'queue' | 'equalizer' | 'settings'>('library');

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={`w-full h-screen max-w-[420px] mx-auto bg-black text-white flex flex-col relative overflow-hidden select-none font-sans ${theme}`}>
      {/* Active Screen View */}
      {navScreen === 'library' && <LibraryScreen />}
      {navScreen === 'queue' && <QueueScreen />}
      {navScreen === 'equalizer' && <EqualizerScreen />}
      {navScreen === 'settings' && <SettingsScreen />}

      {/* Lark Mini-Player */}
      {!isLockscreenOpen && <FloatingMiniPlayer />}

      {/* Lockscreen Musicolet-style View */}
      <LockscreenPlayer />

      {/* Synced Lyrics Modal */}
      <LyricsModal />

      {/* Lark Options Sheet */}
      <SongActionSheet />

      {/* Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto h-16 bg-black/85 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-30 px-2">
        <button 
          onClick={() => setNavScreen('library')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${navScreen === 'library' ? 'text-cyan-400' : 'text-white/40'}`}
        >
          <Library size={18} /> Library
        </button>
        <button 
          onClick={() => setNavScreen('queue')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${navScreen === 'queue' ? 'text-cyan-400' : 'text-white/40'}`}
        >
          <ListMusic size={18} /> Queue
        </button>
        <button 
          onClick={() => setNavScreen('equalizer')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${navScreen === 'equalizer' ? 'text-cyan-400' : 'text-white/40'}`}
        >
          <Sliders size={18} /> Sound Lab
        </button>
        <button 
          onClick={() => setNavScreen('settings')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${navScreen === 'settings' ? 'text-cyan-400' : 'text-white/40'}`}
        >
          <Settings size={18} /> Settings
        </button>
      </nav>
    </div>
  );
}
