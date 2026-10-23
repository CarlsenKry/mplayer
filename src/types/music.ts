export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverArt: string;
  accentColor: string;
  audioUrl: string;
  fileBlob?: Blob;
  addedAt: number;
  playCount: number;
  genre: string;
  lyrics?: string;
  isFavorite?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type VisualizerMode = 'radial' | 'waveform' | 'bars';
export type ThemeMode = 'amoled' | 'cyber' | 'aurora' | 'light-glass';
export type LibraryTab = 'Songs' | 'Albums' | 'Artists' | 'Playlists' | 'Folders' | 'Genres';
