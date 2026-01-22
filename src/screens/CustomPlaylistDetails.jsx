import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DragList from 'react-native-draglist';
import {
  ArrowLeftIcon,
  PlaylistIcon,
  HeartIcon,
  EllipsisVerticalIcon,
} from '../components/icons';
import {
  getCustomPlaylists,
  saveCustomPlaylists,
  isSongLiked,
  likeSong,
  unlikeSong,
} from '../utils/storage';
import PlaylistModal from '../components/PlaylistModal';
import SongOptionsBottomSheet from '../components/SongOptionsBottomSheet';
import { playTrack } from '../services/audioService';

const { width } = Dimensions.get('window');
const ROW_HEIGHT = 86; // for getItemLayout
const BATCH_SIZE = 25; // Turbo mode

export default function CustomPlaylistDetails({
  playlistId,
  onBack,
  playSong,
  currentSong,
  handleClosePlayer,
  setCurrentSong,
  likedSongs,
  updateLikedSongs,
  songQueue,
  setSongQueue,
  hasRadioQueue,
  setHasRadioQueue,
  CustomPlaylistUpdated,
  setCustomPlaylistUpdated,
  settings,
}) {
  const [playlistData, setPlaylistData] = useState(null);

  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSong, setSheetSong] = useState(null);

  // 🔍 Search + Virtualization
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [baseSongs, setBaseSongs] = useState([]); // full or filtered list
  const [visibleSongs, setVisibleSongs] = useState([]); // what DragList actually renders

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const listRef = useRef(null);

  const PlayFullPlaylist = true;

  const openSheet = song => {
    setSheetSong(song);
    setSheetVisible(true);
  };
  const closeSheet = () => {
    setSheetVisible(false);
    setSheetSong(null);
  };

  useEffect(() => {
    loadPlaylist();
  }, [playlistId, CustomPlaylistUpdated]);

  const loadPlaylist = async () => {
    const playlists = await getCustomPlaylists();
    const found = playlists.find(pl => pl.id === playlistId);
    setPlaylistData(found || { songs: [] });
  };

  const saveReorderedSongs = async newSongs => {
    if (!playlistData) return;
    const playlists = await getCustomPlaylists();
    const updated = playlists.map(pl =>
      pl.id === playlistData.id ? { ...pl, songs: newSongs } : pl,
    );
    await saveCustomPlaylists(updated);
    setPlaylistData({ ...playlistData, songs: newSongs });
  };

  const openPlaylistModal = song => {
    setSelectedSong(song);
    setPlaylistModalVisible(true);
  };

  const closePlaylistModal = () => setPlaylistModalVisible(false);

  const handleLikeToggle = async (songId, songObj) => {
    const liked = isSongLiked(songId, likedSongs);
    if (liked) await unlikeSong(songId);
    else await likeSong(songObj);
    await updateLikedSongs();
  };

  const handleAddToQueue = song => {
    if (!songQueue || !Array.isArray(songQueue)) return;
    const currentIndex = songQueue.findIndex(s => s.id === currentSong?.id);
    const newQueue = [...songQueue.filter(s => s.id !== song.id)];
    if (currentIndex >= 0) newQueue.splice(currentIndex + 1, 0, song);
    else newQueue.push(song);
    setSongQueue(newQueue);
  };

  const handleRemoveSong = async songId => {
    if (!playlistData) return;
    const newSongs = playlistData.songs.filter(s => s.id !== songId);
    await saveReorderedSongs(newSongs);
  };

  const handlePlayNow = async nextSong => {
    handleAddToQueue(nextSong);
    setCurrentSong(nextSong);
    await playTrack(nextSong);
  };

  // 🔍 Search + Virtual window recompute
  useEffect(() => {
    if (!playlistData) return;

    const all = playlistData.songs || [];
    const q = searchQuery.trim().toLowerCase();

    let base = all;
    if (q.length > 0) {
      base = all.filter(s => {
        const name = s.name?.toLowerCase() || '';
        const artist = s.artists?.primary?.[0]?.name?.toLowerCase() || '';
        const album = s.album?.name?.toLowerCase() || '';
        return name.includes(q) || artist.includes(q) || album.includes(q);
      });
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    setBaseSongs(base);
    setVisibleSongs(base.slice(0, visibleCount));
  }, [playlistData, searchQuery]);

  // Infinite scroll – load more only when user scrolls
  const handleEndReached = () => {
    if (visibleCount >= baseSongs.length) return;

    const newCount = Math.min(visibleCount + BATCH_SIZE, baseSongs.length);
    setVisibleCount(newCount);
  };

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  // Row renderer (memoized)
  const renderSong = useCallback(
    ({ item: songItem, onDragStart, onDragEnd, isActive }) => {
      const isPlaying = currentSong && currentSong.id === songItem.id;
      const isLiked = isSongLiked(songItem.id, likedSongs);

      return (
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isActive
                ? '#1f2937'
                : isPlaying
                ? '#064e3b'
                : '#111827',
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
              height: ROW_HEIGHT - 6,
            }}
          >
            {/* ☰ Drag Handle – disabled during search */}
            {!currentSong && !isSearching && (
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

            {/* Song Info */}
            <TouchableOpacity
              onPress={async () => {
                const playlists = await getCustomPlaylists();
                const found = playlists.find(pl => pl.id === playlistId);

                if (!found || !Array.isArray(found.songs)) return;

                playSong(songItem, found.songs);
                setHasRadioQueue(false);
              }}
              activeOpacity={0.8}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <Image
                source={{
                  uri:
                    songItem.image?.[settings.imageQualityIndex]?.url ||
                    songItem.image?.[settings.imageQualityIndex]?.link,
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
                  numberOfLines={1}
                  style={{
                    color: isPlaying ? '#a7f3d0' : 'white',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  {songItem.name
                    ?.replace(/&quot;/g, '"')
                    ?.replace(/&#039;/g, "'")
                    ?.replace(/&amp;/g, '&')}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: '#6b7280', fontSize: 12 }}
                >
                  {songItem.artists?.primary?.[0]?.name || 'Unknown Artist'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* ❤️ Like Button */}
            <TouchableOpacity
              onPress={() => handleLikeToggle(songItem.id, songItem)}
              style={{
                padding: 8,
                borderRadius: 100,
                marginLeft: 6,
                backgroundColor: isLiked ? '#064e3b' : '#1f2937',
              }}
            >
              <HeartIcon
                size={20}
                color={isLiked ? '#10b981' : '#9ca3af'}
                filled={isLiked}
              />
            </TouchableOpacity>

            {/* ⋮ Menu Button */}
            <TouchableOpacity
              onPress={() => openSheet(songItem)}
              style={{
                padding: 8,
                borderRadius: 100,
                marginLeft: 6,
                backgroundColor: '#1f2937',
              }}
            >
              <EllipsisVerticalIcon size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [currentSong?.id, likedSongs, isSearching, settings.imageQualityIndex],
  );

  const handleReorder = async (fromIndex, toIndex) => {
    if (isSearching) return;

    // 1. Update main playlist
    setPlaylistData(prev => {
      const updated = [...prev.songs];
      const moved = updated.splice(fromIndex, 1)[0];
      updated.splice(toIndex, 0, moved);
      saveReorderedSongs(updated);
      return { ...prev, songs: updated };
    });

    // 2. Update base songs (full list)
    setBaseSongs(prev => {
      const updated = [...prev];
      const moved = updated.splice(fromIndex, 1)[0];
      updated.splice(toIndex, 0, moved);
      return updated;
    });

    // 3. Do NOT touch visibleCount (keeps user scroll)
    // 4. Just regenerate visibleSongs from updated baseSongs
    setVisibleSongs(prev => {
      const updated = [...baseSongs];
      const count = visibleCount; // keep previous amount loaded
      return updated.slice(0, count);
    });
  };

  useEffect(() => {
    setVisibleSongs(baseSongs.slice(0, visibleCount));
  }, [baseSongs, visibleCount]);

  if (!playlistData) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  const noSongsInPlaylist = (playlistData.songs?.length || 0) === 0;
  const noSearchResults =
    !noSongsInPlaylist &&
    baseSongs.length === 0 &&
    searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-slate-950">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            className="bg-gray-900 p-3 rounded-full mr-4"
          >
            <ArrowLeftIcon size={20} color="#fff" />
          </TouchableOpacity>

          <Text
            className="text-white text-2xl font-bold flex-1"
            numberOfLines={1}
          >
            Custom Playlist
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View className="px-6 pt-3">
          {playlistData.songs?.length > 0 && (
            <>
              <TextInput
                placeholder="Search in this playlist…(song, artist, album)"
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  backgroundColor: '#020617',
                  color: 'white',
                  padding: 10,
                  fontSize: 14,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#1e293b',
                }}
              />
              {isSearching && (
                <Text
                  style={{
                    color: '#9ca3af',
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Drag reordering is disabled while searching.
                </Text>
              )}
            </>
          )}

          {/* <Text className="text-white text-xl font-bold mb-4">Songs</Text> */}
        </View>

        {/* FULL PAGE SCROLL & DRAG ONLY USING DragList */}
        <View style={{ flex: 1 }}>
          <DragList
            ref={listRef}
            // 🔥 All items inside ONE list: header card + search + songs
            data={[
              { type: 'CARD' },
              { type: 'SEARCH' },
              ...visibleSongs.map(s => ({ type: 'SONG', data: s })),
            ]}
            keyExtractor={(item, index) =>
              item.type === 'SONG'
                ? item.data.id
                : `static-${item.type}-${index}`
            }
            renderItem={({ item, onDragStart, onDragEnd, isActive }) => {
              // 🚨 ZERO-CRASH GUARD (skip React-element-like objects)
              if (item && item.$$typeof) return null;

              // 🚨 BLOCK 1 — Hard safety
              if (!item) return null;
              if (Array.isArray(item)) return null;
              if (typeof item !== 'object') return null;

              // 🚨 BLOCK 2 — Only known item types allowed
              if (
                !item.type ||
                !['CARD', 'SEARCH', 'SONG'].includes(item.type)
              ) {
                return null;
              }

              // 🚨 BLOCK 3 — SONG must contain proper data
              if (item.type === 'SONG') {
                if (!item.data || typeof item.data !== 'object') return null;
              }

              // 🚨 BLOCK 4 — CARD/SEARCH must NOT contain accidental data
              if (item.type !== 'SONG' && 'data' in item) {
                return null;
              }

              // 🚨 BLOCK 5 — DragList temporary placeholder skip
              if (item._id && item._id.startsWith('temp')) {
                return null;
              }

              // 1️⃣ HEADER CARD
              if (item.type === 'CARD') {
                return (
                  <View className="px-6 py-4">
                    <View className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden mb-6">
                      {/* Playlist cover grid */}
                      {playlistData.songs?.length > 0 ? (
                        <View
                          style={{
                            width: width - 43,
                            height: width - 48,
                            overflow: 'hidden',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            backgroundColor: '#1f2937',
                          }}
                        >
                          {playlistData.songs.slice(0, 4).map((s, i) => (
                            <Image
                              key={i}
                              source={{ uri: s.image?.[2]?.url }}
                              style={{
                                width:
                                  playlistData.songs.length === 1
                                    ? '100%'
                                    : '50%',
                                height:
                                  playlistData.songs.length === 1
                                    ? '100%'
                                    : '50%',
                              }}
                              resizeMode="cover"
                            />
                          ))}
                        </View>
                      ) : (
                        <View
                          style={{
                            width: width - 48,
                            height: width - 48,
                            backgroundColor: '#1f2937',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#aaa' }}>No Songs</Text>
                        </View>
                      )}

                      {/* Playlist info */}
                      <View className="p-5">
                        <Text className="text-white text-2xl font-bold mb-2">
                          {playlistData.name}
                        </Text>

                        {/* Songs count + Play Full Playlist Button */}
                        <View className="flex-row items-center gap-3 flex-wrap">
                          <View className="bg-emerald-500/20 px-4 py-2 rounded-full self-start">
                            <Text className="text-emerald-400 text-sm font-bold">
                              {playlistData.songs?.length || 0} Songs
                            </Text>
                          </View>

                          {/* 🔥 Play Full Playlist button added back */}
                          {playlistData.songs?.length > 0 && (
                            <TouchableOpacity
                              onPress={() => {
                                setHasRadioQueue(false);
                                playSong(
                                  playlistData.songs[0],
                                  playlistData.songs,
                                  PlayFullPlaylist,
                                );
                              }}
                              className="bg-emerald-500/20 px-4 py-2 rounded-full self-start"
                            >
                              <Text className="text-emerald-400 text-sm font-bold">
                                ▶️ Play Full Playlist
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }

              // 2️⃣ Songs text
              if (item.type === 'SEARCH') {
                return (
                  <Text className="text-white text-xl font-bold mb-4 px-6">
                    Songs
                  </Text>
                );
              }

              // 3️⃣ SONG RENDERING (DRAGGABLE)
              if (item.type === 'SONG') {
                const songItem = item.data;
                return renderSong({
                  item: songItem,
                  onDragStart,
                  onDragEnd,
                  isActive,
                });
              }

              return null;
            }}
            // ⭐ Drag only applies to song rows → not header/search
            onReordered={(from, to) => {
              const realFrom = from - 2;
              const realTo = to - 2;
              if (realFrom >= 0 && realTo >= 0) {
                handleReorder(realFrom, realTo);
              }
            }}
            contentContainerStyle={{ paddingBottom: 160 }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            // ⭐ Overflow fix → drag won't jump outside
            removeClippedSubviews={false}
          />
        </View>
      </SafeAreaView>

      <SongOptionsBottomSheet
        isVisible={sheetVisible}
        onClose={closeSheet}
        song={sheetSong}
        HasThreeBT={true}
        onAddToPlaylist={openPlaylistModal}
        onPlayNext={handleAddToQueue}
        onRemove={handleRemoveSong}
        currentSong={currentSong}
        handlePlayNow={handlePlayNow}
      />

      <PlaylistModal
        visible={isPlaylistModalVisible}
        onClose={closePlaylistModal}
        song={selectedSong}
        onUpdated={() => setCustomPlaylistUpdated(!CustomPlaylistUpdated)}
      />
    </View>
  );
}
