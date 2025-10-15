import {AudioPro, AudioProContentType} from 'react-native-audio-pro';

export function setupAudioService() {
  // Configure Audio Pro
  AudioPro.configure({
    contentType: AudioProContentType.MUSIC,
    debug: __DEV__,
    debugIncludesProgress: false,
    progressIntervalMs: 500,
    showNextPrevControls: true,
    showSkipControls: false,
  });
}

export async function playTrack(song) {
  const track = {
    id: song.id,
    url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || '',
    title: song.name,
    artist: song.artists?.primary?.[0]?.name || 'Unknown Artist',
    artwork: song.image?.[2]?.url || song.image?.[2]?.link || '',
    album: song.album?.name || '',
  };

  AudioPro.play(track, {autoPlay: true});
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
