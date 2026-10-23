import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.cyberbeat.musicplayer',
  appName: 'CyberBeat',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true
  }
};

export default config;
