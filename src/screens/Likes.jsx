import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCustomPlaylists,
  unlikeSong,
  saveCustomPlaylists,
  saveLikedSongs,
} from '../utils/storage';
import { clearAudio } from '../services/audioService';
import {
  CloseCircleFill,
  DisLikeIcon,
  EllipsisVerticalIcon,
  PlaylistIcon,
} from '../components/icons';
import DragList from 'react-native-draglist';
import PlaylistModal from '../components/PlaylistModal';
import SongOptionsBottomSheet from '../components/SongOptionsBottomSheet';
import ImportJioSaavnModal from '../components/ImportJioSaavnModal';
import { playTrack } from '../services/audioService';

export default function Likes({
  playSong,
  currentSong,
  setCurrentSong,
  likedSongs,
  setLikedSongs,
  updateLikedSongs,
  onClosePlayer,
  songQueue,
  setSongQueue,
  hasRadioQueue,
  setHasRadioQueue,
  CustomPlaylistUpdated,
  setCustomPlaylistUpdated,
  openCustomPlaylistDetails,
  settings,
}) {
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);
  const [activeTab, setActiveTab] = useState('liked');

  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);

  // Rename Modal States
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [playlistToRename, setPlaylistToRename] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSong, setSheetSong] = useState(null);

  const [isImportVisible, setIsImportVisible] = useState(false);

  const openSheet = song => {
    setSheetSong(song);
    setSheetVisible(true);
  };
  const closeSheet = () => {
    setSheetVisible(false);
    setSheetSong(null);
  };

  useEffect(() => {
    (async () => {
      const playlists = await getCustomPlaylists();
      setCustomPlaylists(playlists);
    })();
  }, [likedSongs, CustomPlaylistUpdated]);

  // Dislike/remove liked song
  const handleRemoveLikedSong = async songId => {
    await unlikeSong(songId);
    await updateLikedSongs();
    if (currentSong && currentSong.id === songId) {
      await clearAudio();
      if (onClosePlayer) onClosePlayer();
      playSong(null, []);
    }
  };

  // Delete playlist
  const handleDeletePlaylist = playlistId => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = customPlaylists.filter(pl => pl.id !== playlistId);
            await saveCustomPlaylists(updated);
            setCustomPlaylists(updated);
            if (expandedPlaylistId === playlistId) setExpandedPlaylistId(null);
          },
        },
      ],
    );
  };

  // Rename playlist modal handlers
  const openRenameModal = playlist => {
    setPlaylistToRename(playlist);
    setNewPlaylistName(playlist.name);
    setRenameModalVisible(true);
  };

  const closeRenameModal = () => {
    setRenameModalVisible(false);
    setPlaylistToRename(null);
    setNewPlaylistName('');
  };

  const handleRenamePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Please enter a valid playlist name');
      return;
    }
    const updatedPlaylists = customPlaylists.map(pl => {
      if (pl.id === playlistToRename.id) {
        return { ...pl, name: newPlaylistName.trim() };
      }
      return pl;
    });
    await saveCustomPlaylists(updatedPlaylists);
    setCustomPlaylists(updatedPlaylists);
    closeRenameModal();
  };

  const moveSongUp = async (playlistId, songIndex) => {
    if (songIndex === 0) return; // already top

    const updatedPlaylists = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        const newSongs = [...pl.songs];
        [newSongs[songIndex - 1], newSongs[songIndex]] = [
          newSongs[songIndex],
          newSongs[songIndex - 1],
          setSongQueue(newSongs),
        ];
        return { ...pl, songs: newSongs };
      }
      return pl;
    });
    await saveCustomPlaylists(updatedPlaylists);
    setCustomPlaylists(updatedPlaylists);
  };

  const moveSongDown = async (playlistId, songIndex) => {
    const playlist = customPlaylists.find(pl => pl.id === playlistId);
    if (!playlist || songIndex === playlist.songs.length - 1) return; // already bottom

    const updatedPlaylists = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        const newSongs = [...pl.songs];
        [newSongs[songIndex], newSongs[songIndex + 1]] = [
          newSongs[songIndex + 1],
          newSongs[songIndex],
          setSongQueue(newSongs),
        ];
        return { ...pl, songs: newSongs };
      }
      return pl;
    });
    await saveCustomPlaylists(updatedPlaylists);
    setCustomPlaylists(updatedPlaylists);
  };

  // Remove song from playlist
  const handleRemoveSongFromPlaylist = async (playlistId, songId) => {
    const updatedPlaylists = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
      }
      return pl;
    });
    await saveCustomPlaylists(updatedPlaylists);
    setCustomPlaylists(updatedPlaylists); // UI update here
  };

  const openPlaylistModal = song => {
    setSelectedSong(song);
    setPlaylistModalVisible(true);
  };

  const closePlaylistModal = () => setPlaylistModalVisible(false);

  // ✅ Add to Queue (Play Next)
  const handleAddToQueue = song => {
    if (!songQueue || !Array.isArray(songQueue)) return;

    const currentIndex = songQueue.findIndex(s => s.id === currentSong?.id);
    const newQueue = [...songQueue.filter(s => s.id !== song.id)]; // avoid duplicates
    // insert just after the currently playing song
    if (currentIndex >= 0) newQueue.splice(currentIndex + 1, 0, song);
    else newQueue.push(song);
    setSongQueue(newQueue);
  };

  const handlePlayNow = async nextSong => {
    handleAddToQueue(nextSong);
    setCurrentSong(nextSong);
    await playTrack(nextSong);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, marginBottom: -50, backgroundColor: '#020617' }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity onPress={() => setActiveTab('liked')}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: activeTab === 'liked' ? 'white' : '#6b7280',
            }}
          >
            Liked Songs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('playlists')}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: activeTab === 'playlists' ? 'white' : '#6b7280',
            }}
          >
            Playlists
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'liked' ? (
        likedSongs.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: '#6b7280', fontSize: 18 }}>
              No liked songs
            </Text>
          </View>
        ) : (
          <DragList
            data={likedSongs}
            keyExtractor={item => item.id}
            onReordered={async (fromIndex, toIndex) => {
              const updated = [...likedSongs];
              const moved = updated.splice(fromIndex, 1)[0];
              updated.splice(toIndex, 0, moved);
              setLikedSongs(updated);

              // ✅ persist new order
              await saveLikedSongs(updated);
            }}
            renderItem={({
              item: song,
              onDragStart,
              onDragEnd,
              isActive,
              index,
            }) => {
              const isPlaying = currentSong && currentSong.id === song.id;
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 12,
                    alignItems: 'center',
                    backgroundColor: isPlaying
                      ? '#064e3b'
                      : 'rgb(17 24 39 / 0.6)',
                    borderRadius: 16,
                    marginBottom: 12,
                  }}
                >
                  {/* ☰ drag handle */}
                  {!currentSong && (
                    <TouchableOpacity
                      onPressIn={onDragStart}
                      onPressOut={onDragEnd}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 8,
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ color: '#888', fontSize: 20 }}>☰</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      playSong(song, likedSongs);
                      setHasRadioQueue(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          song.image?.[settings.imageQualityIndex]?.url ||
                          song.image?.[settings.imageQualityIndex]?.link,
                      }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        marginRight: 12,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: isPlaying ? '#a7f3d0' : 'white',
                          fontWeight: 'bold',
                          fontSize: 16,
                        }}
                      >
                        {song.name
                          ?.replace(/&quot;/g, '"')
                          ?.replace(/&#039;/g, "'")
                          ?.replace(/&amp;/g, '&')}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>
                        {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRemoveLikedSong(song.id)}
                    style={{
                      padding: 8,
                      backgroundColor: '#b91c1c',
                      borderRadius: 100,
                      marginLeft: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <DisLikeIcon size={20} color="#6ee7b7" />
                  </TouchableOpacity>
                  {!currentSong && (
                    <TouchableOpacity
                      onPress={() => openPlaylistModal(song)}
                      className={'p-3 rounded-full ml-2 bg-gray-800'}
                    >
                      <PlaylistIcon size={18} color="#fff" />
                    </TouchableOpacity>
                  )}

                  {/* {currentSong && (
                    <TouchableOpacity
                      onPress={() => handleAddToQueue(song)}
                      className="p-3 bg-gray-800 rounded-full ml-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-xs text-[#10b981] font-bold">
                        Play Next
                      </Text>
                    </TouchableOpacity>
                  )} */}

                  {/* ⋮ Menu Button */}
                  {currentSong && (
                    <TouchableOpacity
                      onPress={() => openSheet(song)}
                      style={{
                        padding: 8,
                        borderRadius: 100,
                        marginLeft: 6,
                        backgroundColor: '#1f2937',
                      }}
                    >
                      <EllipsisVerticalIcon size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            contentContainerStyle={{
              paddingBottom: 300,
              paddingTop: 10,
              paddingHorizontal: 16,
            }}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 300 }}>
          {activeTab === 'playlists' && (
            <TouchableOpacity
              onPress={() => setIsImportVisible(true)}
              style={{
                backgroundColor: '#0ea5e9',
                padding: 12,
                borderRadius: 10,
                marginHorizontal: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}
              >
                Import your custom playlist from JioSaavn
              </Text>
            </TouchableOpacity>
          )}

          {customPlaylists.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>No playlists found</Text>
            </View>
          ) : (
            customPlaylists.map(pl => (
              <View
                key={pl.id}
                style={{
                  marginBottom: 24,
                  backgroundColor: '#1e293b',
                  borderRadius: 12,
                  padding: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    key={pl.id}
                    activeOpacity={0.8}
                    onPress={() => openCustomPlaylistDetails(pl.id)}
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={{
                        color:
                          expandedPlaylistId === pl.id ? '#a7f3d0' : 'white',
                        fontWeight: 'bold',
                        fontSize: 20,
                      }}
                    >
                      {pl.name} ({pl.songs.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openRenameModal(pl)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: '#2563eb',
                      borderRadius: 7,
                      marginLeft: 10,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      Rename
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePlaylist(pl.id)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: '#dc2626',
                      borderRadius: 7,
                      marginLeft: 10,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRenameModal}
      >
        <TouchableWithoutFeedback onPress={closeRenameModal}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '90%',
                  backgroundColor: '#222',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    marginBottom: 12,
                    fontWeight: 'bold',
                  }}
                >
                  Rename Playlist
                </Text>
                <TextInput
                  placeholder="New playlist name"
                  placeholderTextColor="#999"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  style={{
                    backgroundColor: '#111',
                    color: '#fff',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                    fontSize: 16,
                  }}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleRenamePlaylist}
                  style={{
                    backgroundColor: '#10b981',
                    padding: 14,
                    borderRadius: 8,
                    marginBottom: 10,
                    alignItems: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeRenameModal}
                  style={{ alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#bbb', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <PlaylistModal
        visible={isPlaylistModalVisible}
        onClose={closePlaylistModal}
        song={selectedSong}
        onUpdated={() => setCustomPlaylistUpdated(!CustomPlaylistUpdated)}
      />
      <SongOptionsBottomSheet
        isVisible={sheetVisible}
        onClose={closeSheet}
        song={sheetSong}
        onAddToPlaylist={openPlaylistModal}
        onPlayNext={handleAddToQueue}
        HasThreeBT={false}
        currentSong={currentSong}
        handlePlayNow={handlePlayNow}
      />
      <ImportJioSaavnModal
        visible={isImportVisible}
        setCustomPlaylistUpdated={setCustomPlaylistUpdated}
        CustomPlaylistUpdated={CustomPlaylistUpdated}
        onClose={() => setIsImportVisible(false)}
      />
    </SafeAreaView>
  );
}
