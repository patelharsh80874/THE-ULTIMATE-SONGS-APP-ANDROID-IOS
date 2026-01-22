import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  Keyboard,
  StyleSheet,
  Modal,
} from 'react-native';
import { useAudioPro, AudioProState } from 'react-native-audio-pro';
import {
  HeartIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
  ChevronDownIcon,
  DownloadIcon,
  PlaylistIcon,
  MusicIcon,
  CloseCircleFill,
} from './icons';
import {
  pauseAudio,
  resumeAudio,
  clearAudio,
  seekToPosition,
  playTrack,
} from '../services/audioService';
import {
  likeSong,
  unlikeSong,
  isSongLiked,
  getCustomPlaylists,
  createPlaylist,
  addSongToPlaylist,
  saveCustomPlaylists,
} from '../utils/storage';
import { downloadSong } from '../utils/downloadSong';
import CustomToast from './CustomToast';
import DragList from 'react-native-draglist';
import PlaylistModal from './PlaylistModal';
import QueueModal from './QueueModal';
import Slider from '@react-native-community/slider';

const { height } = Dimensions.get('window');

const CustomCheckbox = ({ checked, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.checkboxBase, checked && styles.checkboxChecked]}
    activeOpacity={0.7}
  >
    {checked && <View style={styles.checkboxInner} />}
  </TouchableOpacity>
);

export default function Player({
  song,
  stationId,
  setStationId,
  hasRadioQueue,
  setHasRadioQueue,
  currentSong,
  setCurrentSong,
  songQueue = [],
  setSongQueue = () => {},
  onNext,
  onPrev,
  onClose,
  updateLikedSongs,
  likedSongs,
  currentIndexRef,
  setCustomPlaylistUpdated,
  CustomPlaylistUpdated,
  settings,
  playSong = () => {},
}) {
  const { state, position, duration } = useAudioPro();
  const isPlaying = state === AudioProState.PLAYING;

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // ✅ Fixed missing
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const queueAnim = useRef(new Animated.Value(height)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  const [isLiked, setIsLiked] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);
  const [checkedPlaylists, setCheckedPlaylists] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isQueueVisible, setQueueVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setIsLiked(isSongLiked(song.id, likedSongs));
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [song.id, likedSongs]);

  useEffect(() => {
    if (songQueue.length && song) {
      const idx = songQueue.findIndex(s => s.id === song.id);
      if (idx !== -1) currentIndexRef.current = idx;
    }
  }, [songQueue, song]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      clearAudio();
      onClose();
    });
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const togglePlayback = async () => (isPlaying ? pauseAudio() : resumeAudio());
  const handleLikeToggle = async () => {
    if (isLiked) await unlikeSong(song.id);
    else await likeSong(song);
    await updateLikedSongs();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const result = await downloadSong(song, progress =>
      setDownloadProgress(progress),
    );

    if (result.success) {
      Alert.alert('Download Completed ✅', `Saved to: ${result.path}`);
    } else {
      Alert.alert(
        'Download Failed ❌',
        result.error?.message || 'Something went wrong.',
      );
    }
    setIsDownloading(false);
  };

  const handleProgressBarPress = e => {
    const touchX = e.nativeEvent.locationX;
    const percentage = touchX / progressWidth;
    seekToPosition(duration * percentage);
  };
  const formatTime = ms => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  const progressWidthSet = e => setProgressWidth(e.nativeEvent.layout.width);
  const progressPercent =
    duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  const openPlaylistModal = song => {
    setSelectedSong(song);
    setPlaylistModalVisible(true);
  };

  const closePlaylistModal = () => setPlaylistModalVisible(false);

  // // ✅ QUEUE MODAL
  // const openQueue = () => {
  //   setQueueVisible(true);
  //   Animated.timing(queueAnim, {
  //     toValue: 0,
  //     duration: 300,
  //     useNativeDriver: true,
  //   }).start();
  // };
  // const closeQueue = () => {
  //   Animated.timing(queueAnim, {
  //     toValue: height,
  //     duration: 250,
  //     useNativeDriver: true,
  //   }).start(() => setQueueVisible(false));
  // };

  const openQueue = () => setQueueVisible(true);
  const closeQueue = () => setQueueVisible(false);

  const removeFromQueue = id => {
    const q = songQueue.filter(s => s.id !== id);
    setSongQueue(q);
  };

  const playNext = s => {
    if (!songQueue.length) return;

    const currentIndex = songQueue.findIndex(i => i.id === song.id);
    if (currentIndex === -1) return;

    // 1️⃣ Copy queue (so we don’t mutate)
    const newQueue = [...songQueue];

    // 2️⃣ Remove song if already exists
    const existingIndex = newQueue.findIndex(i => i.id === s.id);
    if (existingIndex !== -1) {
      newQueue.splice(existingIndex, 1);

      // 🧠 If the song being removed was *before* the current one,
      // currentIndex should shift one step left.
      if (existingIndex < currentIndex) {
        currentIndexRef.current = Math.max(0, currentIndexRef.current - 1);
      }
    }

    // 3️⃣ Compute the final insert position (after current song)
    const insertIndex = currentIndexRef.current + 1;

    // 4️⃣ Insert the new song at correct spot
    newQueue.splice(insertIndex, 0, s);

    // 5️⃣ Update state
    setSongQueue(newQueue);

    // 6️⃣ Ensure currentIndexRef still points to current song
    const newCurrentIndex = newQueue.findIndex(i => i.id === song.id);
    if (newCurrentIndex !== -1) {
      currentIndexRef.current = newCurrentIndex;
    }

    // 7️⃣ (Optional) keep UI synced
    // if (setCurrentSong) setCurrentSong(song);
  };

  const handleSelectFromQueue = item => {
    playSong(item, songQueue);
    closeQueue();
  };

  // ✅ MAIN PLAYER UI
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {isMinimized ? (
        <TouchableOpacity onPress={toggleMinimize} style={styles.miniPlayer}>
          <Image
            source={{
              uri: song.image?.[settings.imageQualityIndex]?.url || song.image,
            }}
            style={styles.miniImage}
          />
          <Text numberOfLines={1} style={styles.miniTitle}>
            {song.name
              ?.replace(/&quot;/g, '"')
              ?.replace(/&#039;/g, "'")
              ?.replace(/&amp;/g, '&')}
          </Text>
          <TouchableOpacity onPress={onPrev} style={styles.controlBtn}>
            <SkipBackwardIcon size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayback} style={styles.controlBtn}>
            {isPlaying ? (
              <PauseIcon size={22} color="#fff" />
            ) : (
              <PlayIcon size={22} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.controlBtn}>
            <SkipForwardIcon size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.controlBtn}>
            <CloseIcon size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <Animated.View style={styles.fullPlayer}>
          <View style={styles.header}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              {isPlaying && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: '#10b981',
                    borderRadius: 3,
                  }}
                />
              )}
              <Text
                style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}
              >
                {isPlaying ? 'Playing' : 'Paused'}
              </Text>
            </View>
            <View style={styles.headerControls}>
              <TouchableOpacity
                onPress={async () => await playTrack(song)}
                style={{
                  backgroundColor: '#222',
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                {/* <MusicIcon size={18} color="#fff" /> */}
                <Text
                  style={{ fontSize: 13, color: '#fff', fontWeight: 'bold' }}
                >
                  Reload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openQueue}
                style={{
                  backgroundColor: '#222',
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                {/* <MusicIcon size={18} color="#fff" /> */}
                <Text
                  style={{ fontSize: 13, color: '#fff', fontWeight: 'bold' }}
                >
                  Queue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={openPlaylistModal}
                onPress={() => openPlaylistModal(currentSong)}
                style={styles.headerBtn}
              >
                <PlaylistIcon size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleMinimize}
                style={styles.headerBtn}
              >
                <ChevronDownIcon size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                <CloseIcon size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.albumInfo}>
            <Image
              source={{
                uri:
                  song.image?.[settings.imageQualityIndex]?.url || song.image,
              }}
              style={styles.albumImage}
            />
            <View style={styles.albumText}>
              <Text numberOfLines={1} style={styles.albumTitle}>
                {song.name
                  ?.replace(/&quot;/g, '"')
                  ?.replace(/&#039;/g, "'")
                  ?.replace(/&amp;/g, '&')}
              </Text>
              <Text numberOfLines={1} style={styles.albumArtist}>
                {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
              </Text>
            </View>
          </View>
          {/* 🔊 Modern Seekable Progress Bar */}
          <View style={{}}>
            <Slider
              value={position}
              minimumValue={0}
              maximumValue={duration}
              // onSlidingStart={() => pauseAudio()} // pause while dragging
              onSlidingComplete={value => seekToPosition(value)} // seek on release
              minimumTrackTintColor="#10b981"
              maximumTrackTintColor="#999"
              thumbTintColor="#10b981"
              style={{ width: '100%' }}
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handleLikeToggle}
              style={[styles.controlBtn, isLiked && styles.likedBtn]}
            >
              <HeartIcon
                size={22}
                color={isLiked ? '#10b981' : '#fff'}
                filled={isLiked}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPrev} style={styles.controlBtn}>
              <SkipBackwardIcon size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={togglePlayback}
              style={styles.playPauseBtn}
            >
              {isPlaying ? (
                <PauseIcon size={26} color="#fff" />
              ) : (
                <PlayIcon size={26} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} style={styles.controlBtn}>
              <SkipForwardIcon size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDownload}
              style={[styles.controlBtn, isDownloading && styles.disabledBtn]}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Text style={styles.downloadProgress}>
                  {Math.floor(downloadProgress)}%
                </Text>
              ) : (
                <DownloadIcon size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      <PlaylistModal
        visible={isPlaylistModalVisible}
        onClose={closePlaylistModal}
        song={selectedSong}
        onUpdated={() => setCustomPlaylistUpdated(!CustomPlaylistUpdated)}
      />
      <QueueModal
        visible={isQueueVisible}
        onClose={closeQueue}
        songQueue={songQueue}
        song={song}
        currentSong={currentSong}
        setSongQueue={setSongQueue}
        stationId={stationId}
        setStationId={setStationId}
        hasRadioQueue={hasRadioQueue}
        setHasRadioQueue={setHasRadioQueue}
        currentIndexRef={currentIndexRef}
        playSong={playSong}
        playNext={playNext}
        settings={settings}
        openPlaylistModal={openPlaylistModal}
        removeFromQueue={id => {
          const q = songQueue.filter(s => s.id !== id);
          setSongQueue(q);
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingBottom: 45,
    bottom: 75,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  miniImage: { width: 48, height: 48, borderRadius: 8 },
  miniTitle: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginHorizontal: 8,
  },
  controlBtn: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  fullPlayer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: { flexDirection: 'row', gap: 8 },
  headerBtn: { backgroundColor: '#222', padding: 8, borderRadius: 20 },
  albumInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  albumImage: { width: 80, height: 80, borderRadius: 7 },
  albumText: { flex: 1, marginLeft: 16 },
  albumTitle: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
  albumArtist: { fontSize: 14, color: '#aaa' },
  progressBarContainer: { height: 10, marginBottom: 0 },
  progressBarBackground: {
    backgroundColor: '#222',
    height: 6,
    borderRadius: 3,
  },
  progressBarFill: { backgroundColor: '#10b981', height: 6, borderRadius: 3 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: '#aaa', fontSize: 12 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playPauseBtn: {
    backgroundColor: '#10b981',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedBtn: { backgroundColor: 'rgba(16,185,129,0.3)' },
  disabledBtn: { backgroundColor: '#555' },
  downloadProgress: { color: '#fff', fontSize: 12 },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  playlistScroll: { maxHeight: 250, marginBottom: 12 },
  noPlaylistsText: { color: '#bbb', textAlign: 'center', marginVertical: 20 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playlistName: { flex: 1, color: 'white', fontSize: 16, marginLeft: 8 },
  songCount: { color: '#62d2a2', fontSize: 12 },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderColor: '#10b981',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#10b981' },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  textInput: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnCreate: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  createText: { color: '#fff', fontWeight: 'bold' },
  btnCancel: { alignItems: 'center' },
  cancelText: { color: '#bbb', fontWeight: 'bold' },
  queueOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  queueSheet: {
    backgroundColor: '#111827',
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: height * 0.8,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#374151',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  queueSongInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  queueImg: { width: 56, height: 56, borderRadius: 8 },
  queueActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  emptyQueueText: { color: '#bbb', textAlign: 'center', marginTop: 20 },
});
