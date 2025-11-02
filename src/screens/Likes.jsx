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
} from '../utils/storage';
import { clearAudio } from '../services/audioService';
import { CloseCircleFill, DisLikeIcon } from '../components/icons';

export default function Likes({
  playSong,
  currentSong,
  likedSongs,
  updateLikedSongs,
  onClosePlayer,
  setSongQueue,
  CustomPlaylistUpdated,
}) {
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);
  const [activeTab, setActiveTab] = useState('liked');

  // Rename Modal States
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [playlistToRename, setPlaylistToRename] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

  const renderSong = (song, index, songsList, playlistId = null) => {
    const isPlaying = currentSong && currentSong.id === song.id;
    return (
      <TouchableOpacity
        key={song.id}
        onPress={() => playSong(song, songsList)}
        style={{
          flexDirection: 'row',
          padding: 12,
          alignItems: 'center',
          backgroundColor: isPlaying ? '#064e3b' : '#1f2937',
          borderRadius: 16,
          marginBottom: 12,
          marginLeft: playlistId ? 16 : 0,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: isPlaying ? '#047857' : '#374151',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Text
            style={{
              color: isPlaying ? 'white' : '#9ca3af',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </Text>
        </View>
        <Image
          source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
          style={{ width: 64, height: 64, borderRadius: 12, marginRight: 12 }}
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
            {song.name}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (playlistId) {
              handleRemoveSongFromPlaylist(playlistId, song.id);
            } else {
              handleRemoveLikedSong(song.id);
            }
          }}
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1,marginBottom:-50, backgroundColor: '#020617' }}>
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
          <FlatList
            data={likedSongs}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) =>
              renderSong(item, index, likedSongs)
            }
            contentContainerStyle={{
              paddingBottom: 300,
              paddingTop: 10,
              paddingHorizontal: 16,
            }}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 300 }}>
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
                    onPress={() =>
                      setExpandedPlaylistId(
                        expandedPlaylistId === pl.id ? null : pl.id,
                      )
                    }
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

                {expandedPlaylistId === pl.id &&
                  (pl.songs.length === 0 ? (
                    <Text
                      style={{ color: '#6b7280', marginTop: 6, marginLeft: 12 }}
                    >
                      No songs in this playlist.
                    </Text>
                  ) : (
                    pl.songs.map((song, idx) => (
                        <TouchableOpacity
                        key={song.id}
                        onPress={() => playSong(song, pl.songs)}
                        style={{
                          // width:'90%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor:
                            currentSong?.id === song.id ? '#064e3b' : '#111827',
                          borderRadius: 12,
                          padding: 10,
                          marginBottom: 10,
                          marginLeft: 0,
                          shadowColor: '#000',
                          shadowOpacity: currentSong?.id === song.id ? 0.5 : 0,
                          shadowRadius: 5,
                          elevation: currentSong?.id === song.id ? 6 : 0,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor:
                              currentSong?.id === song.id
                                ? '#10b981'
                                : '#374151',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {idx + 1}
                          </Text>
                        </View>
                        <Image
                          source={{
                            uri: song.image?.[2]?.url || song.image?.[2]?.link,
                          }}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 10,
                            marginRight: 12,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color:
                                currentSong?.id === song.id
                                  ? '#a7f3d0'
                                  : 'white',
                              fontWeight: 'bold',
                              fontSize: 16,
                            }}
                            numberOfLines={1}
                          >
                            {song.name}
                          </Text>
                          <Text
                            style={{ color: '#6b7280', fontSize: 12 }}
                            numberOfLines={1}
                          >
                            {song.artists?.primary?.[0]?.name ||
                              'Unknown Artist'}
                          </Text>
                        </View>
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveSongFromPlaylist(pl.id, song.id)
                            }
                            style={{
                              // paddingHorizontal: 8,
                              // paddingVertical: 6,
                              // backgroundColor: '#b91c1c',
                              // borderRadius: 7,
                              // marginLeft: 8,
                            
                            }}
                          >
                            <CloseCircleFill size={24} color="#dc2626" />
                          </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 9999,
                            justifyContent: 'center',
                            marginLeft:7,
                            // backgroundColor: 'white',
                            gap:10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => moveSongUp(pl.id, idx)}
                            disabled={idx === 0}
                          >
                            <Text
                              style={{
                                color: idx === 0 ? '#555' : '#2563eb',
                                fontSize: 18,
                              }}
                            >
                              ▲
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => moveSongDown(pl.id, idx)}
                            disabled={idx === pl.songs.length - 1}
                          >
                            <Text
                              style={{
                                color:
                                  idx === pl.songs.length - 1
                                    ? '#555'
                                    : '#2563eb',
                                fontSize: 18,
                              }}
                            >
                              ▼
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))
                  ))}
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
    </SafeAreaView>
  );
}
