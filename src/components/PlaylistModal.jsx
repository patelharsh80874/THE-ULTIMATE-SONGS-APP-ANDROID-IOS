import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Keyboard,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  getCustomPlaylists,
  saveCustomPlaylists,
  createPlaylist,
  addSongToPlaylist,
} from '../utils/storage';
import CustomToast from './CustomToast';

const PlaylistModal = ({ visible, onClose, song, onUpdated }) => {
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [checkedPlaylists, setCheckedPlaylists] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = msg => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  const hideToast = () => setToastVisible(false);

  // ✅ Load playlists when modal opens
  useEffect(() => {
    if (visible && song) {
      loadPlaylists(song);
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
    } else {
      modalOpacity.setValue(0);
      modalScale.setValue(0.8);
    }
  }, [visible, song]);

  const loadPlaylists = async songItem => {
    const playlists = await getCustomPlaylists();
    setCustomPlaylists(playlists);
    const checks = {};
    playlists.forEach(
      pl => (checks[pl.id] = pl.songs.some(s => s.id === songItem.id)),
    );
    setCheckedPlaylists(checks);
  };

  const close = () => {
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
      Keyboard.dismiss();
      onClose();
      setNewPlaylistName('');
    });
  };

  const togglePlaylistCheck = async playlistId => {
    const isChecked = checkedPlaylists[playlistId];
    const newChecks = { ...checkedPlaylists, [playlistId]: !isChecked };
    // setCheckedPlaylists(newChecks);

    let playlists = await getCustomPlaylists();
    setCheckedPlaylists(newChecks);

    if (isChecked) {
      playlists = playlists.map(pl =>
        pl.id === playlistId
          ? { ...pl, songs: pl.songs.filter(s => s.id !== song.id) }
          : pl,
      );
      await saveCustomPlaylists(playlists);
      setCustomPlaylists(playlists);
      showToast(`${song?.name} Removed from playlist`);
    } else {
      await addSongToPlaylist(playlistId, song);
      playlists = await getCustomPlaylists();
      setCustomPlaylists(playlists);
      showToast(`${song?.name} Added to playlist`);
    }

    if (onUpdated) onUpdated();
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Please enter playlist name');
      return;
    }
    const newPlaylist = await createPlaylist(newPlaylistName.trim());
    if (newPlaylist) {
      await addSongToPlaylist(newPlaylist.id, song);
      // showToast('Playlist created & song added');
      showToast(
        `(${newPlaylist.name}) Playlist created and song (${song?.name
          ?.replace(/&quot;/g, '"')
          ?.replace(/&#039;/g, "'")
          ?.replace(/&amp;/g, '&')}) added`,
      );
      setNewPlaylistName('');
      await loadPlaylists(song);
      if (onUpdated) onUpdated();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                { opacity: modalOpacity, transform: [{ scale: modalScale }] },
              ]}
            >
              <Text style={styles.modalTitle}>Select Playlists</Text>

              <ScrollView style={styles.playlistScroll}>
                {customPlaylists.length === 0 ? (
                  <Text style={styles.noPlaylistsText}>
                    No playlists found.
                  </Text>
                ) : (
                  customPlaylists.map(pl => (
                    <TouchableOpacity
                      key={pl.id}
                      onPress={() => togglePlaylistCheck(pl.id)}
                      style={styles.playlistRow}
                    >
                      <View
                        style={[
                          styles.checkboxBase,
                          checkedPlaylists[pl.id] && styles.checkboxChecked,
                        ]}
                      >
                        {checkedPlaylists[pl.id] && (
                          <View style={styles.checkboxInner} />
                        )}
                      </View>
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
              />

              <TouchableOpacity
                style={styles.btnCreate}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createText}>Create Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={close} style={styles.btnCancel}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        onHide={hideToast}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default PlaylistModal;
