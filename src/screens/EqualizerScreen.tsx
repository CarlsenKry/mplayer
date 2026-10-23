import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { audioEngine } from '../services/audioEngine';

export const EqualizerScreen: React.FC = () => {
  const { eqGains, setEqGain, bassBoost, setBassBoost, stereoWidth, setStereoWidth, playbackRate, setPlaybackRate, accentColor } = usePlayerStore();

  const presets = [
    { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 1, 2, 3, 4] },
    { name: 'Vocal', gains: [-2, -1, 0, 3, 5, 4, 2, 0, -1, -2] },
    { name: 'Cinematic', gains: [5, 4, 2, -1, -2, 1, 3, 4, 6, 6] }
  ];

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto px-5 pt-8 pb-32">
      <h1 className="text-2xl font-bold text-white mb-1">Sound Lab & EQ</h1>
      <p className="text-white/40 text-xs mb-6">10-Band Biquad Hardware DSP</p>

      {/* Preset Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {presets.map((p) => (
          <button 
            key={p.name}
            onClick={() => p.gains.forEach((g, idx) => setEqGain(idx, g))}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:text-white"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* 10-Band EQ Sliders */}
      <div className="grid grid-cols-5 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
        {audioEngine.eqFrequencies.map((freq, idx) => (
          <div key={freq} className="flex flex-col items-center">
            <span className="text-[10px] text-white/40 mb-2">{freq < 1000 ? `${freq}Hz` : `${freq / 1000}k`}</span>
            <input 
              type="range" 
              min="-12" 
              max="12" 
              step="0.5" 
              value={eqGains[idx] || 0}
              onChange={(e) => setEqGain(idx, parseFloat(e.target.value))}
              className="h-28 -rotate-90 my-6 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-white/60 mt-2">{eqGains[idx] || 0}dB</span>
          </div>
        ))}
      </div>

      {/* DSP Modifiers */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex justify-between text-xs text-white mb-2">
            <span>Bass Booster</span>
            <span className="font-mono text-cyan-400">+{bassBoost} dB</span>
          </div>
          <input 
            type="range" min="0" max="10" step="0.5" value={bassBoost} 
            onChange={(e) => setBassBoost(parseFloat(e.target.value))} 
            className="w-full accent-cyan-400" 
          />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex justify-between text-xs text-white mb-2">
            <span>Stereo Widening (Virtualizer)</span>
            <span className="font-mono text-cyan-400">{stereoWidth.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="-1" max="1" step="0.1" value={stereoWidth} 
            onChange={(e) => setStereoWidth(parseFloat(e.target.value))} 
            className="w-full accent-cyan-400" 
          />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex justify-between text-xs text-white mb-2">
            <span>Playback Pitch / Speed</span>
            <span className="font-mono text-cyan-400">{playbackRate}x</span>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1" value={playbackRate} 
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} 
            className="w-full accent-cyan-400" 
          />
        </div>
      </div>
    </div>
  );
};
