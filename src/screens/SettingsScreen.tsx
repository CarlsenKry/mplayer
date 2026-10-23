import React from 'react';
import { Download, Upload, Moon, Sliders, Palette, Zap } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { ThemeMode } from '../types/music';

export const SettingsScreen: React.FC = () => {
  const { theme, setTheme, setSleepTimer, tracks, playlists, accentColor } = usePlayerStore();

  const themes: { id: ThemeMode; label: string }[] = [
    { id: 'amoled', label: 'AMOLED Black' },
    { id: 'cyber', label: 'Neon Cyber' },
    { id: 'aurora', label: 'Aurora Borealis' },
    { id: 'light-glass', label: 'Light Glass' }
  ];

  const exportBackup = () => {
    const data = JSON.stringify({ tracks, playlists, exportedAt: Date.now() });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberbeat_backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-black px-5 pt-8 pb-32 overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Configuration</h1>
      <p className="text-white/40 text-xs mb-6">PWA & Hardware Options</p>

      {/* Theme selection */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
        <label className="text-xs font-bold text-white flex items-center gap-2 mb-3">
          <Palette size={16} style={{ color: accentColor }} /> UI Theme Profile
        </label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button 
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                theme === t.id ? 'bg-white/10 border-white/40 text-white' : 'border-white/5 text-white/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Timer */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
        <label className="text-xs font-bold text-white flex items-center gap-2 mb-3">
          <Moon size={16} style={{ color: accentColor }} /> Sleep Timer Quick Set
        </label>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((m) => (
            <button 
              key={m}
              onClick={() => setSleepTimer(m)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/70 hover:text-white"
            >
              {m}m
            </button>
          ))}
          <button 
            onClick={() => setSleepTimer(null)}
            className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400"
          >
            Off
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
        <label className="text-xs font-bold text-white flex items-center gap-2 mb-3">
          <Zap size={16} style={{ color: accentColor }} /> Storage & Recovery
        </label>
        <button 
          onClick={exportBackup}
          className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10"
        >
          <Download size={14} /> Export JSON Library Backup
        </button>
      </div>
    </div>
  );
};
