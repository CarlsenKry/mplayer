import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { VisualizerMode } from '../types/music';

interface Props {
  mode: VisualizerMode;
  accentColor: string;
  className?: string;
}

export const VisualizerCanvas: React.FC<Props> = ({ mode, accentColor, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const analyser = audioEngine.analyser;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (mode === 'radial') {
        const radius = Math.min(cx, cy) - 40;
        const bars = 64;
        const angleStep = (Math.PI * 2) / bars;

        for (let i = 0; i < bars; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = (val / 255) * 36;
          const angle = i * angleStep;

          const x1 = cx + Math.cos(angle) * radius;
          const y1 = cy + Math.sin(angle) * radius;
          const x2 = cx + Math.cos(angle) * (radius + barHeight);
          const y2 = cy + Math.sin(angle) * (radius + barHeight);

          ctx.beginPath();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 8;
          ctx.shadowColor = accentColor;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (mode === 'waveform') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = accentColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = accentColor;

        const sliceWidth = canvas.width / 64;
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const v = dataArray[i * 2] / 255.0;
          const y = (1 - v) * (canvas.height / 2) + canvas.height / 4;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Bars
        const barWidth = (canvas.width / 32) - 2;
        for (let i = 0; i < 32; i++) {
          const val = dataArray[i * 4] || 0;
          const barHeight = (val / 255) * canvas.height;
          ctx.fillStyle = accentColor;
          ctx.shadowBlur = 6;
          ctx.shadowColor = accentColor;
          ctx.fillRect(i * (barWidth + 2), canvas.height - barHeight, barWidth, barHeight);
        }
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [mode, accentColor]);

  return <canvas ref={canvasRef} width={340} height={340} className={className} />;
};
