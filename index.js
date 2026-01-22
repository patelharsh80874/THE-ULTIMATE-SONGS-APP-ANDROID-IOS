import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupAudioService} from './src/services/audioService';
import {AudioPro, AudioProEventType} from 'react-native-audio-pro';

// Setup audio outside React lifecycle
setupAudioService();

// Global event listeners (outside React)
AudioPro.addEventListener(event => {
  switch (event.type) {
    case AudioProEventType.TRACK_ENDED:
      // console.log('Track ended');
      // Handle track end - play next song
      break;

    case AudioProEventType.REMOTE_NEXT:
      // console.log('User pressed Next button');
      // Handle next track
      break;

    case AudioProEventType.REMOTE_PREV:
      // console.log('User pressed Previous button');
      // Handle previous track
      break;

    case AudioProEventType.PLAYBACK_ERROR:
      console.error('Playback error:', event.payload?.error);
      break;
  }
});

AppRegistry.registerComponent(appName, () => App);  