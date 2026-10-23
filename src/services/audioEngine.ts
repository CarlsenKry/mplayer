import { Track } from '../types/music';

class AudioEngine {
  private ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private gainNode: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  public eqFrequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    this.gainNode = this.ctx.createGain();

    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
    }

    // 10-Band EQ
    this.eqNodes = this.eqFrequencies.map((freq, index) => {
      const filter = this.ctx!.createBiquadFilter();
      if (index === 0) filter.type = 'lowshelf';
      else if (index === this.eqFrequencies.length - 1) filter.type = 'highshelf';
      else filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    let lastNode: AudioNode = this.sourceNode;
    this.eqNodes.forEach((node) => {
      lastNode.connect(node);
      lastNode = node;
    });

    lastNode.connect(this.gainNode);
    if (this.pannerNode) {
      this.gainNode.connect(this.pannerNode);
      this.pannerNode.connect(this.analyser);
    } else {
      this.gainNode.connect(this.analyser);
    }
    this.analyser.connect(this.ctx.destination);
  }

  getAudioElement() {
    return this.audioElement;
  }

  async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setBandGain(index: number, val: number) {
    if (this.eqNodes[index]) {
      this.eqNodes[index].gain.setTargetAtTime(val, this.ctx?.currentTime || 0, 0.05);
    }
  }

  setStereoWidth(val: number) {
    if (this.pannerNode) {
      this.pannerNode.pan.setTargetAtTime(Math.max(-1, Math.min(1, val)), this.ctx?.currentTime || 0, 0.05);
    }
  }

  setVolume(vol: number) {
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(vol, this.ctx?.currentTime || 0, 0.05);
    }
  }

  async generateDemoTrack(title: string, artist: string, tempo: number, mood: 'neon' | 'cyber'): Promise<Track> {
    const offlineCtx = new OfflineAudioContext(2, 44100 * 30, 44100);
    const chords = mood === 'neon' 
      ? [[261.63, 329.63, 392.00], [220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66]]
      : [[130.81, 164.81, 196.00], [110.00, 130.81, 164.81], [98.00, 123.47, 146.83], [87.31, 110.00, 130.81]];

    const stepDuration = 60 / tempo / 2;
    for (let i = 0; i < 60; i++) {
      const time = i * stepDuration;
      // Kick drum
      if (i % 4 === 0) {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.2);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(time);
        osc.stop(time + 0.2);
      }
      // Synth Arp
      const chordIndex = Math.floor(i / 8) % chords.length;
      const freq = chords[chordIndex][i % 3] * (mood === 'neon' ? 1.5 : 1);
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = mood === 'neon' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.9);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(time);
      osc.stop(time + stepDuration);
    }

    const rendered = await offlineCtx.startRendering();
    const blob = bufferToWav(rendered);
    const audioUrl = URL.createObjectURL(blob);

    // Canvas cover art
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, mood === 'neon' ? '#00F0FF' : '#8A2BE2');
    grad.addColorStop(1, mood === 'neon' ? '#FF2E93' : '#0B0D17');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    for (let c = 0; c < 400; c += 40) {
      ctx.beginPath();
      ctx.moveTo(c, 0); ctx.lineTo(c, 400);
      ctx.moveTo(0, c); ctx.lineTo(400, c);
      ctx.stroke();
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 200, 210);

    const coverArt = canvas.toDataURL('image/png');

    return {
      id: 'demo_' + Math.random().toString(36).substring(2, 8),
      title,
      artist,
      album: 'Neural Waves EP',
      duration: 30,
      coverArt,
      accentColor: mood === 'neon' ? '#00F0FF' : '#8A2BE2',
      audioUrl,
      addedAt: Date.now(),
      playCount: Math.floor(Math.random() * 25),
      genre: 'CyberSynth',
      lyrics: `[00:00.00]${title} - ${artist}\n[00:03.50]Glow on the wet asphalt\n[00:07.00]Electric impulses taking control\n[00:13.20]Synced at 128 cycles\n[00:18.00]Neural memory in resonance\n[00:24.00]Sound fades into tomorrow...`
    };
  }
}

function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0, pos = 0;

  function set16(d: number) { out.setUint16(pos, d, true); pos += 2; }
  function set32(d: number) { out.setUint32(pos, d, true); pos += 4; }

  set32(0x46464952); // "RIFF"
  set32(length - 8);
  set32(0x45564157); // "WAVE"
  set32(0x20746d66); // "fmt "
  set32(16);
  set16(1);
  set16(numOfChan);
  set32(sampleRate);
  set32(sampleRate * 2 * numOfChan);
  set16(numOfChan * 2);
  set16(16);
  set32(0x61746164); // "data"
  set32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([out.buffer], { type: 'audio/wav' });
}

export const audioEngine = new AudioEngine();
