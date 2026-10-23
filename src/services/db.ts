import { openDB, DBSchema } from 'idb';
import { Track, Playlist } from '../types/music';

interface MusicDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-artist': string; 'by-album': string };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  settings: {
    key: string;
    value: any;
  };
}

export const getDB = () => {
  return openDB<MusicDB>('cyberbeat-db', 1, {
    upgrade(db) {
      const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
      trackStore.createIndex('by-artist', 'artist');
      trackStore.createIndex('by-album', 'album');
      db.createObjectStore('playlists', { keyPath: 'id' });
      db.createObjectStore('settings');
    }
  });
};
