import { AudioPro, AudioProContentType } from 'react-native-audio-pro';
import { addToRecentlyPlayed, getAppSettings } from '../utils/storage';
import { settingsRead } from '../navigation/AppNavigator';
import { fixSongFormat } from '../utils/fixSongFormat';

export function setupAudioService() {
  // Configure Audio Pro
  AudioPro.configure({
    contentType: AudioProContentType.MUSIC,
    debug: __DEV__,
    debugIncludesProgress: false,
    progressIntervalMs: 500,
    showNextPrevControls: true,
    showSkipControls: true,
  });
}

export async function playTrack(song) {
  if (song.downloadUrl) {
    
    const track = {
      id: song.id,
      url:
        song.downloadUrl?.[settingsRead.audioQualityIndex]?.url ||
        song.downloadUrl?.[settingsRead.audioQualityIndex]?.url ||
        '',
      title: song.name
        ?.replace(/&quot;/g, '"')
        ?.replace(/&#039;/g, "'")
        ?.replace(/&amp;/g, '&'),
      artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
      artwork:
        song.image?.[settingsRead.imageQualityIndex]?.url ||
        song.image?.[settingsRead.imageQualityIndex]?.link ||
        '',
      album: song.album?.name || '',
    };
    AudioPro.play(track, { autoPlay: true });
    await addToRecentlyPlayed(song);
  } else {
    const fixed = fixSongFormat(song);

    const track = {
      id: fixed.id,
      url:
        fixed.downloadUrl?.[settingsRead.audioQualityIndex]?.url ||
        fixed.downloadUrl?.[settingsRead.audioQualityIndex]?.url ||
        '',
      title: fixed.name
        ?.replace(/&quot;/g, '"')
        ?.replace(/&#039;/g, "'")
        ?.replace(/&amp;/g, '&'),
      artist: fixed.artists?.primary?.[0]?.name || 'Unknown Artist',
      artwork:
        fixed.image?.[settingsRead.imageQualityIndex]?.url ||
        fixed.image?.[settingsRead.imageQualityIndex]?.link ||
        '',
      album: fixed.album?.name || '',
    };
    AudioPro.play(track, { autoPlay: true });
  await addToRecentlyPlayed(fixed);
  }
}

export async function pauseAudio() {
  AudioPro.pause();
}

export async function resumeAudio() {
  AudioPro.resume();
}

export async function stopAudio() {
  AudioPro.stop();
}

export async function seekToPosition(positionMs) {
  AudioPro.seekTo(positionMs);
}

export async function skipForward() {
  AudioPro.seekForward(15000); // 15 seconds
}

export async function skipBackward() {
  AudioPro.seekBack(15000); // 15 seconds
}

export function clearAudio() {
  AudioPro.clear();
}
