import { create } from 'zustand';
import { Track, Playlist, VisualizerMode, ThemeMode } from '../types/music';
import { audioEngine } from '../services/audioEngine';
import { getDB } from '../services/db';

interface PlayerState {
  tracks: Track[];
  queue: Track[];
  history: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  visualizerMode: VisualizerMode;
  theme: ThemeMode;
  accentColor: string;
  isLockscreenOpen: boolean;
  isLyricsOpen: boolean;
  isActionSheetOpen: boolean;
  actionSheetTrack: Track | null;
  activeTab: string;
  eqGains: number[];
  bassBoost: number;
  stereoWidth: number;
  playbackRate: number;
  sleepTimerEnd: number | null;
  
  // Actions
  init: () => Promise<void>;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setLockscreenOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;
  openActionSheet: (track: Track) => void;
  closeActionSheet: () => void;
  toggleFavorite: (trackId: string) => void;
  setEqGain: (bandIndex: number, gain: number) => void;
  setBassBoost: (val: number) => void;
  setStereoWidth: (val: number) => void;
  setPlaybackRate: (val: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  addTracks: (newTracks: Track[]) => Promise<void>;
  reorderQueue: (newQueue: Track[]) => void;
  removeFromQueue: (index: number) => void;
  saveQueueAsPlaylist: (name: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  queue: [],
  history: [],
  playlists: [],
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'all',
  visualizerMode: 'radial',
  theme: 'amoled',
  accentColor: '#00F0FF',
  isLockscreenOpen: true,
  isLyricsOpen: false,
  isActionSheetOpen: false,
  actionSheetTrack: null,
  activeTab: 'Songs',
  eqGains: Array(10).fill(0),
  bassBoost: 0,
  stereoWidth: 0,
  playbackRate: 1,
  sleepTimerEnd: null,

  init: async () => {
    audioEngine.init();
    const db = await getDB();
    const savedTracks = await db.getAll('tracks');
    const savedPlaylists = await db.getAll('playlists');

    if (savedTracks.length === 0) {
      // Build built-in demo tracks
      const t1 = await audioEngine.generateDemoTrack('Neon Horizons', 'Vector Prime', 124, 'neon');
      const t2 = await audioEngine.generateDemoTrack('Sublight Drift', 'Kavinsky Soul', 110, 'cyber');
      const t3 = await audioEngine.generateDemoTrack('Cyberpunk Echoes', 'NeuroLinker', 130, 'neon');
      for (const t of [t1, t2, t3]) await db.put('tracks', t);
      set({ tracks: [t1, t2, t3], queue: [t1, t2, t3], currentTrack: t1 });
    } else {
      set({ 
        tracks: savedTracks, 
        queue: savedTracks, 
        currentTrack: savedTracks[0], 
        playlists: savedPlaylists 
      });
    }

    const audio = audioEngine.getAudioElement();
    if (audio) {
      audio.ontimeupdate = () => {
        set({ currentTime: audio.currentTime });
        // Check sleep timer
        const timer = get().sleepTimerEnd;
        if (timer && Date.now() >= timer) {
          audio.pause();
          set({ isPlaying: false, sleepTimerEnd: null });
        }
      };
      audio.onloadedmetadata = () => {
        set({ duration: audio.duration });
      };
      audio.onended = () => {
        get().nextTrack();
      };
    }

    // Media Session Hook
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => get().togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => get().togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) get().seek(details.seekTime);
      });
    }
  },

  playTrack: (track: Track) => {
    audioEngine.resume();
    const audio = audioEngine.getAudioElement();
    if (!audio) return;

    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
      audio.playbackRate = get().playbackRate;
    }
    audio.play().catch(() => {});

    set((state) => {
      const history = state.currentTrack && state.currentTrack.id !== track.id 
        ? [state.currentTrack, ...state.history.slice(0, 19)] 
        : state.history;
      return {
        currentTrack: track,
        isPlaying: true,
        accentColor: track.accentColor || '#00F0FF',
        history
      };
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [{ src: track.coverArt, sizes: '512x512', type: 'image/png' }]
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, playTrack } = get();
    const audio = audioEngine.getAudioElement();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      if (!currentTrack && get().tracks.length > 0) {
        playTrack(get().tracks[0]);
      } else {
        audioEngine.resume();
        audio.play().catch(() => {});
        set({ isPlaying: true });
      }
    }
  },

  nextTrack: () => {
    const { queue, currentTrack, isShuffle, repeatMode, playTrack } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      get().seek(0);
      get().togglePlay();
      return;
    }

    if (isShuffle) {
      const randIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[randIndex]);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playTrack(queue[0]);
    } else {
      set({ isPlaying: false });
    }
  },

  prevTrack: () => {
    const { queue, currentTrack, playTrack } = get();
    const audio = audioEngine.getAudioElement();
    if (audio && audio.currentTime > 3) {
      get().seek(0);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  },

  seek: (time: number) => {
    const audio = audioEngine.getAudioElement();
    if (audio) {
      audio.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (val: number) => {
    audioEngine.setVolume(val);
    set({ volume: val });
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  
  cycleRepeat: () => set((state) => ({
    repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
  })),

  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  setTheme: (theme) => set({ theme }),
  setLockscreenOpen: (open) => set({ isLockscreenOpen: open }),
  setLyricsOpen: (open) => set({ isLyricsOpen: open }),
  openActionSheet: (track) => set({ isActionSheetOpen: true, actionSheetTrack: track }),
  closeActionSheet: () => set({ isActionSheetOpen: false, actionSheetTrack: null }),

  toggleFavorite: async (trackId: string) => {
    const db = await getDB();
    const tracks = get().tracks.map((t) => {
      if (t.id === trackId) {
        const updated = { ...t, isFavorite: !t.isFavorite };
        db.put('tracks', updated);
        return updated;
      }
      return t;
    });
    set({ tracks });
  },

  setEqGain: (bandIndex, gain) => {
    audioEngine.setBandGain(bandIndex, gain);
    set((state) => {
      const eqGains = [...state.eqGains];
      eqGains[bandIndex] = gain;
      return { eqGains };
    });
  },

  setBassBoost: (val) => {
    audioEngine.setBandGain(0, val * 1.5);
    audioEngine.setBandGain(1, val * 1.2);
    set({ bassBoost: val });
  },

  setStereoWidth: (val) => {
    audioEngine.setStereoWidth(val);
    set({ stereoWidth: val });
  },

  setPlaybackRate: (val) => {
    const audio = audioEngine.getAudioElement();
    if (audio) audio.playbackRate = val;
    set({ playbackRate: val });
  },

  setSleepTimer: (minutes) => {
    if (minutes === null) {
      set({ sleepTimerEnd: null });
    } else {
      set({ sleepTimerEnd: Date.now() + minutes * 60 * 1000 });
    }
  },

  addTracks: async (newTracks) => {
    const db = await getDB();
    for (const t of newTracks) await db.put('tracks', t);
    set((state) => ({
      tracks: [...newTracks, ...state.tracks],
      queue: [...state.queue, ...newTracks]
    }));
  },

  reorderQueue: (newQueue) => set({ queue: newQueue }),
  removeFromQueue: (index) => set((state) => {
    const q = [...state.queue];
    q.splice(index, 1);
    return { queue: q };
  }),

  saveQueueAsPlaylist: async (name: string) => {
    const { queue } = get();
    const newPlaylist: Playlist = {
      id: 'pl_' + Date.now(),
      name,
      trackIds: queue.map((t) => t.id),
      createdAt: Date.now()
    };
    const db = await getDB();
    await db.put('playlists', newPlaylist);
    set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
  },

  setActiveTab: (tab) => set({ activeTab: tab })
}));
