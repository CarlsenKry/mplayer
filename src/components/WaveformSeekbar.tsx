import React, { useRef } from 'react';

interface Props {
  currentTime: number;
  duration: number;
  accentColor: string;
  onSeek: (time: number) => void;
}

export const WaveformSeekbar: React.FC<Props> = ({ currentTime, duration, accentColor, onSeek }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!barRef.current || duration === 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const update = (clientX: number) => {
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    };
    update(e.clientX);

    const onPointerMove = (ev: PointerEvent) => update(ev.clientX);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const format = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full select-none px-4 py-2">
      <div 
        ref={barRef}
        onPointerDown={handlePointerDown}
        className="relative h-6 flex items-center cursor-pointer group"
      >
        {/* Track Line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-75"
            style={{ width: `${progress}%`, backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />
        </div>

        {/* Draggable Thumb */}
        <div 
          className="absolute h-4 w-4 rounded-full border-2 border-white shadow-lg -ml-2 transition-transform scale-100 group-hover:scale-125"
          style={{ 
            left: `${progress}%`, 
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}` 
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono text-white/50 px-1 mt-1">
        <span>{format(currentTime)}</span>
        <span>-{format(Math.max(0, duration - currentTime))}</span>
      </div>
    </div>
  );
};
