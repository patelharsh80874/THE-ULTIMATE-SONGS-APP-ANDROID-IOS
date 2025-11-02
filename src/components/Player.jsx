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
  KeyboardAvoidingView,
  Keyboard,
  SafeAreaView,
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
} from './icons';
import {
  pauseAudio,
  resumeAudio,
  clearAudio,
  seekToPosition,
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
  onNext,
  onPrev,
  onClose,
  updateLikedSongs,
  likedSongs,
  setCustomPlaylistUpdated,
  CustomPlaylistUpdated,
}) {
  const { state, position, duration } = useAudioPro();
  const isPlaying = state === AudioProState.PLAYING;

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [isLiked, setIsLiked] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);
  const [checkedPlaylists, setCheckedPlaylists] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    setIsLiked(isSongLiked(song.id, likedSongs));
  }, [song.id, likedSongs]);

   const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };


  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openPlaylistModal = async () => {
    const playlists = await getCustomPlaylists();
    setCustomPlaylists(playlists);
    const checks = {};
    playlists.forEach(pl => {
      checks[pl.id] = pl.songs.some(s => s.id === song.id);
    });
    setCheckedPlaylists(checks);
    setPlaylistModalVisible(true);
    modalOpacity.setValue(0);
    modalScale.setValue(0.8);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePlaylistModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPlaylistModalVisible(false);
      setCheckedPlaylists({});
      Keyboard.dismiss();
    });
  };

  const togglePlaylistCheck = async playlistId => {
    const isChecked = checkedPlaylists[playlistId];
    const newChecks = { ...checkedPlaylists, [playlistId]: !isChecked };
    setCheckedPlaylists(newChecks);

    let playlists = await getCustomPlaylists();
    if (isChecked) {
      playlists = playlists.map(pl =>
        pl.id === playlistId
          ? { ...pl, songs: pl.songs.filter(s => s.id !== song.id) }
          : pl,
      );
      await saveCustomPlaylists(playlists);
      setCustomPlaylists(playlists);
      showToast(`(${song.name}) Removed from playlist`);
      // Alert.alert('Removed from playlist');
      setCustomPlaylistUpdated(!CustomPlaylistUpdated)
    } else {
      await addSongToPlaylist(playlistId, song);
      playlists = await getCustomPlaylists();
      setCustomPlaylists(playlists);
        showToast(`(${song.name}) Added to playlist`);
      // Alert.alert('Added to playlist');
      setCustomPlaylistUpdated(!CustomPlaylistUpdated)
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Please enter playlist name');
      return;
    }
    const newPlaylist = await createPlaylist(newPlaylistName.trim());
    if (newPlaylist) {
      await addSongToPlaylist(newPlaylist.id, song);
      // Alert.alert(`(${newPlaylist.name}) Playlist created and song (${song.name}) added`);
      showToast(`(${newPlaylist.name}) Playlist created and song (${song.name}) added`);
      setNewPlaylistName('');
      // closePlaylistModal();
    const playlists = await getCustomPlaylists();
    setCustomPlaylists(playlists);
    openPlaylistModal();
    setCustomPlaylistUpdated(!CustomPlaylistUpdated)
    }
  };

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

  const toggleMinimize = () => {
    const toScale = isMinimized ? 1 : 1;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: toScale,
        duration:250,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    setIsMinimized(!isMinimized);
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await resumeAudio();
    }
  };

  const handleLikeToggle = async () => {
    if (isLiked) {
      await unlikeSong(song.id);
    } else {
      await likeSong(song);
    }
    await updateLikedSongs();
  };

    const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const result = await downloadSong(song, (progress) => setDownloadProgress(progress));

    if (result.success) {
      Alert.alert('Download Completed ✅', `Saved to: ${result.path}`);
    } else {
      Alert.alert('Download Failed ❌', result.error?.message || 'Something went wrong.');
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

  const PlaylistModal = () => {
    return (
      <Modal
        visible={isPlaylistModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePlaylistModal}
        hardwareAccelerated={true}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={closePlaylistModal}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Playlists</Text>
              <ScrollView style={styles.playlistScroll}>
                {customPlaylists.length === 0 ? (
                  <Text style={styles.noPlaylistsText}>
                    No playlists found. Create one below.
                  </Text>
                ) : (
                  customPlaylists.map(pl => (
                    <TouchableOpacity
                      key={pl.id}
                      onPress={() => togglePlaylistCheck(pl.id)}
                      style={styles.playlistRow}
                      activeOpacity={0.7}
                    >
                      <CustomCheckbox
                        checked={!!checkedPlaylists[pl.id]}
                        onPress={() => togglePlaylistCheck(pl.id)}
                      />
                      <Text style={styles.playlistName}>{pl.name}</Text>
                      <Text style={styles.songCount}>
                        {pl.songs.length} songs
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              <TextInput
                placeholder="New playlist name"
                placeholderTextColor="#999"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                style={styles.textInput}
                autoFocus
              />
              <TouchableOpacity
                style={styles.btnCreate}
                onPress={handleCreatePlaylist}
                activeOpacity={0.8}
              >
                <Text style={styles.createText}>Create Playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closePlaylistModal}
                style={styles.btnCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
        <CustomToast visible={toastVisible} message={toastMessage} onHide={hideToast} />
      </Modal>
    );
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: fadeAnim }]}>
    {/* Mini Player  */}
      {isMinimized ? (
        <Animated.View style={[styles.miniPlayer, { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: fadeAnim }]}>
    <TouchableOpacity onPress={toggleMinimize} style={styles.miniPlayer}>
          <Image
            source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
            style={styles.miniImage}
          />
          <Text numberOfLines={1} style={styles.miniTitle}>
            {song.name}
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
  </Animated.View>
        
      ) : (
        /* Full Player */
         <Animated.View style={[styles.fullPlayer, { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View className="flex-row items-center gap-2">
                 {isPlaying && (
                   <View className="w-2 h-2 bg-emerald-500 rounded-full" />
                 )}
                <Text className="text-emerald-400 text-xs font-bold uppercase">
                   {isPlaying ? 'Playing' : 'Paused'}
                 </Text>
              </View>

            <View style={styles.headerControls}>
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
              source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
              style={styles.albumImage}
            />
            <View style={styles.albumText}>
              <Text numberOfLines={1} style={styles.albumTitle}>
                {song.name}
              </Text>
              <Text numberOfLines={1} style={styles.albumArtist}>
                {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openPlaylistModal}
              style={styles.controlBtn}
            >
              {/* <Text style={styles.addPlaylistText}>Add to Playlist</Text> */}
              <PlaylistIcon size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableWithoutFeedback onPress={handleProgressBarPress}>
            <View
              onLayout={progressWidthSet}
              style={styles.progressBarContainer}
            >
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
      {PlaylistModal()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50, // ensures it’s above everything
    backgroundColor: '#1e293b',
    // important: handle both gesture and 3-button nav
    paddingBottom: Platform.OS === 'android' ? 115 : 83,
    elevation: 20,
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
  miniImage: { width: 48, height: 48, borderRadius: 10, marginRight: 10 },
  miniTitle: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 14 },
  controlBtn: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullPlayer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -8 },
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  statusText: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  headerControls: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 20,
  },

  albumInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  albumImage: { width: 80, height: 80, borderRadius: 7 },
  albumText: { flex: 1, marginLeft: 16 },
  albumTitle: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
  albumArtist: { fontSize: 14, color: '#aaa', marginTop: 4 },

  progressBarContainer: { height: 10, marginBottom: 0 },
  progressBarBackground: {
    backgroundColor: '#222',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#10b981',
    height: 6,
    borderRadius: 3,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  timeText: { color: '#aaa', fontSize: 12 },

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  likedBtn: { backgroundColor: 'rgba(16,185,129,0.3)' },
  playPauseBtn: {
    backgroundColor: '#10b981',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#555' },
  downloadProgress: { color: '#fff', fontSize: 12 },
  addPlaylistText: { color: '#fff', fontSize: 14 },

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
    borderRadius: 1,
    backgroundColor: '#fff',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { color: 'white', fontSize: 18, marginBottom: 12 },

  playlistScroll: { maxHeight: 250, marginBottom: 12 },
  noPlaylistsText: { color: '#bbb', marginBottom: 12 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playlistName: { flex: 1, color: 'white', fontSize: 16, marginLeft: 10 },
  songCount: { color: '#62d2a2', fontSize: 12 },

  textInput: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  btnCreate: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  createText: { color: 'white', fontWeight: 'bold' },
  btnCancel: { marginTop: 8, alignItems: 'center' },
  cancelText: { color: '#bbb' },

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
  playlistScroll: {
    maxHeight: 250,
    marginBottom: 12,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playlistName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  songCount: {
    color: '#62d2a2',
    fontSize: 12,
  },
  noPlaylistsText: {
    color: '#bbb',
    textAlign: 'center',
    marginVertical: 20,
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
  createText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  btnCancel: {
    alignItems: 'center',
  },
  cancelText: {
backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    fontWeight: 'bold',
  },
});
