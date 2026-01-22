import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {
  HeartIcon,
  PlayIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PlaylistIcon,
} from '../components/icons';
import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';
import PlaylistModal from '../components/PlaylistModal';
import SongOptionsBottomSheet from '../components/SongOptionsBottomSheet';
import { playTrack } from '../services/audioService';

export default function LabelDetails({
  labelData,
  onBack,
  playSong,
  currentSong,
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
  openAlbumDetails,
  openAlbumDetailsFromAlbum,
  openAlbumPage,
}) {
  const PlayFullPlaylist = true;

  const [loading, setLoading] = useState(true);
  const [loadingMoreSongs, setLoadingMoreSongs] = useState(false);
  const [loadingMoreAlbums, setLoadingMoreAlbums] = useState(false);

  const [labelName, setLabelName] = useState('');
  const [labelImage, setLabelImage] = useState('');
  const [totalSongs, setTotalSongs] = useState(0);
  const [totalAlbums, setTotalAlbums] = useState(0);

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMoreSongs, setHasMoreSongs] = useState(true);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);

  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [selectedCategory, setSelectedCategory] = useState('popularity'); // popularity | latest | alphabetical
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  const [activeTab, setActiveTab] = useState('songs'); // songs | albums

  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSong, setSheetSong] = useState(null);

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const seenSongIds = useRef(new Set());
  const seenAlbumIds = useRef(new Set());

  const categoryOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'latest', label: 'Latest' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  const sortOptions = [
    { value: 'desc', label: 'Desc' },
    { value: 'asc', label: 'Asc' },
  ];

  const openSheet = song => {
    setSheetSong(song);
    setSheetVisible(true);
  };
  const closeSheet = () => {
    setSheetVisible(false);
    setSheetSong(null);
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

    if (currentIndex >= 0) newQueue.splice(currentIndex + 1, 0, song);
    else newQueue.push(song);

    setSongQueue(newQueue);
  };

  const handlePlayNow = async nextSong => {
    handleAddToQueue(nextSong);
    setCurrentSong(nextSong);
    await playTrack(nextSong);
  };

  const handleLikeToggle = async songId => {
    const isLiked = isSongLiked(songId, likedSongs);
    if (isLiked) {
      await unlikeSong(songId);
    } else {
      const song = songs.find(s => s.id === songId);
      if (song) {
        await likeSong(song);
      }
    }
    await updateLikedSongs();
  };

  // 🔄 Normalize song into your app's common structure
  const normalizeSong = raw => {
    if (!raw) return null;
    const img = raw.image || '';
    const imgArr = img
      ? [
          { url: img },
          { url: img },
          { url: img }, // 3 indexes so settings.imageQualityIndex safe rahe
        ]
      : [];

    return {
      id: raw.id,
      name: raw.title,
      title: raw.title,
      image: imgArr,
      album: { name: raw.more_info?.album || '' },
      artists: {
        primary: raw.more_info?.artistMap?.primary_artists || [],
      },
      language: raw.language,
      year: raw.year,
      // original raw bhi rakh dete hain
      raw,
    };
  };

  const normalizeAlbum = raw => {
    if (!raw) return null;
    const img = raw.image || '';
    const imgArr = img ? [{ url: img }, { url: img }, { url: img }] : [];

    return {
      id: raw.id,
      title: raw.title,
      subtitle: raw.subtitle,
      image: imgArr,
      year: raw.year,
      perma_url: raw.perma_url,
      raw,
    };
  };

  const fetchLabelData = async (pageNum, isLoadMore = false) => {
    if (!labelData) return;

    if (isLoadMore) {
      if (activeTab === 'songs') setLoadingMoreSongs(true);
      if (activeTab === 'albums') setLoadingMoreAlbums(true);
    } else {
      setLoading(true);
      seenSongIds.current.clear();
      seenAlbumIds.current.clear();
      setHasMoreSongs(true);
      setHasMoreAlbums(true);
      setSongs([]);
      setAlbums([]);
    }

    try {
      const url = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${labelData.token}&type=label&p=${pageNum}&n_song=20&n_album=20&category=${selectedCategory}&sort_order=${sortOrder}&language=${selectedLanguage}&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`;

      const response = await axios.get(url, {
        timeout: 10000,
      });

      const data = response.data;

      if (!data) {
        setHasMoreSongs(false);
        setHasMoreAlbums(false);
        return;
      }

      if (!isLoadMore) {
        setLabelName(data.name || '');
        setLabelImage(data.image || '');
        setTotalSongs(data.topSongs?.total || 0);
        setTotalAlbums(data.topAlbums?.total || 0);

        if (Array.isArray(data.availableLanguages)) {
          setAvailableLanguages(data.availableLanguages);
          // agar current selectedLanguage list mein nahi hai → first option se set
          if (
            data.availableLanguages.length > 0 &&
            !data.availableLanguages.includes(selectedLanguage)
          ) {
            setSelectedLanguage(data.availableLanguages[0]);
          }
        }
      }

      // ✅ songs
      const rawSongs = data.topSongs?.songs || [];
      const newSongs = rawSongs
        .filter(song => {
          if (seenSongIds.current.has(song.id)) return false;
          seenSongIds.current.add(song.id);
          return true;
        })
        .map(normalizeSong)
        .filter(Boolean);

      // ✅ albums
      const rawAlbums = data.topAlbums?.albums || [];
      const newAlbums = rawAlbums
        .filter(album => {
          if (seenAlbumIds.current.has(album.id)) return false;
          seenAlbumIds.current.add(album.id);
          return true;
        })
        .map(normalizeAlbum)
        .filter(Boolean);

      if (isLoadMore) {
        setSongs(prev => [...prev, ...newSongs]);
        setAlbums(prev => [...prev, ...newAlbums]);
      } else {
        setSongs(newSongs);
        setAlbums(newAlbums);
      }

      setHasMoreSongs(newSongs.length > 0);
      setHasMoreAlbums(newAlbums.length > 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Label details error:', err);
      setHasMoreSongs(false);
      setHasMoreAlbums(false);
    } finally {
      setLoading(false);
      setLoadingMoreSongs(false);
      setLoadingMoreAlbums(false);
    }
  };

  // initial + on filter change
  useEffect(() => {
    if (!labelData) return;
    fetchLabelData(0, false);
  }, [labelData, selectedLanguage, selectedCategory, sortOrder]);

  const loadMoreSongs = () => {
    if (!loadingMoreSongs && hasMoreSongs) {
      fetchLabelData(page + 1, true);
    }
  };

  const loadMoreAlbums = () => {
    if (!loadingMoreAlbums && hasMoreAlbums) {
      fetchLabelData(page + 1, true);
    }
  };

  const renderSongItem = ({ item, index }) => {
    const isPlaying = currentSong && currentSong.id === item.id;
    const isLiked = isSongLiked(item.id, likedSongs);

    return (
      <TouchableOpacity
        onPress={() => {
          playSong(item, songs, PlayFullPlaylist);
          setHasRadioQueue(false);
        }}
        className="mb-3"
        activeOpacity={0.8}
      >
        <View
          className={`flex-row items-center p-4 rounded-2xl ${
            isPlaying
              ? 'bg-emerald-900/40 border-2 border-emerald-500/50'
              : 'bg-gray-900/60 border border-gray-800'
          }`}
        >
          <View className="relative mr-3">
            <Image
              source={{
                uri:
                  item.image?.[settings.imageQualityIndex]?.url ||
                  item.image?.[0]?.url,
              }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />
            {isPlaying && (
              <View className="absolute inset-0 rounded-xl bg-emerald-500/20 justify-center items-center">
                <PlayIcon size={20} color="#10b981" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-base font-bold ${
                isPlaying ? 'text-emerald-300' : 'text-white'
              }`}
            >
              {item.name
                ?.replace(/&quot;/g, '"')
                ?.replace(/&#039;/g, "'")
                ?.replace(/&amp;/g, '&')}
            </Text>
            <Text numberOfLines={1} className="text-gray-400 text-sm mt-1">
              {item.album?.name || 'Unknown Album'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleLikeToggle(item.id)}
            className={`p-3 rounded-full ml-2 ${
              isLiked ? 'bg-emerald-500/20' : 'bg-gray-800'
            }`}
          >
            <HeartIcon
              size={20}
              color={isLiked ? '#10b981' : '#9ca3af'}
              filled={isLiked}
            />
          </TouchableOpacity>

          {!currentSong && (
            <TouchableOpacity
              onPress={() => openPlaylistModal(item)}
              className={'p-3 rounded-full ml-2 bg-gray-800'}
            >
              <PlaylistIcon size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {currentSong && (
            <TouchableOpacity
              onPress={() => openSheet(item)}
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
      </TouchableOpacity>
    );
  };

  const renderSongsFooter = () => {
    if (!loadingMoreSongs) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  };

  const renderAlbumsFooter = () => {
    if (!loadingMoreAlbums) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
      {/* Back + Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeftIcon size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Label Details
        </Text>
      </View>

      {/* Label main info */}
      <View style={styles.labelInfoContainer}>
        <Image
          source={{ uri: labelImage }}
          style={styles.labelImage}
          resizeMode="cover"
        />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.labelName} numberOfLines={1}>
            {labelName || 'Unknown Label'}
          </Text>
          <Text style={styles.labelCounts}>
            {totalSongs} Songs • {totalAlbums} Albums
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (songs.length === 0) return;
              setHasRadioQueue(false);
              playSong(songs[0], songs, PlayFullPlaylist);
            }}
            style={styles.playLabelButton}
            activeOpacity={0.8}
          >
            <Text style={styles.playLabelText}>▶️ Play {labelName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Pills Row */}
      <View style={styles.filterRow}>
        {/* Language */}
        <TouchableOpacity
          style={styles.filterPill}
          activeOpacity={0.8}
          onPress={() => {
            if (availableLanguages.length > 0) setLangModalVisible(true);
          }}
        >
          <Text style={styles.filterPillText}>
            {selectedLanguage.charAt(0).toUpperCase() +
              selectedLanguage.slice(1)}
          </Text>
        </TouchableOpacity>

        {/* Category */}
        <TouchableOpacity
          style={styles.filterPill}
          activeOpacity={0.8}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.filterPillText}>
            {categoryOptions.find(c => c.value === selectedCategory)?.label ??
              'Category'}
          </Text>
        </TouchableOpacity>

        {/* Sort order */}
        <TouchableOpacity
          style={styles.filterPill}
          activeOpacity={0.8}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.filterPillText}>
            {sortOptions.find(s => s.value === sortOrder)?.label ?? 'Sort'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs like Likes.jsx */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('songs')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'songs' && styles.tabTextActive,
            ]}
          >
            Top Songs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('albums')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'albums' && styles.tabTextActive,
            ]}
          >
            Top Albums
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAlbumItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.albumCard}
        activeOpacity={0.85}
        // onPress={() => openAlbumDetailsFromAlbum(item.id)}
        onPress={() => openAlbumPage(item.id)}
      >
        <Image
          source={{
            uri:
              item.image?.[settings.imageQualityIndex]?.url ||
              item.image?.[0]?.url,
          }}
          style={styles.albumImage}
          resizeMode="cover"
        />
        <View style={{ marginTop: 6 }}>
          <Text numberOfLines={2} style={styles.albumTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.albumSubtitle}>
            {item.subtitle || item.year || ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && songs.length === 0 && albums.length === 0) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-400 mt-4">Loading label...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {activeTab === 'songs' && (
          <FlatList
            key={'SONGS_LIST'} // ← IMPORTANT
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderSongsFooter}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
            }}
            onEndReached={loadMoreSongs}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        )}

        {activeTab === 'albums' && (
          <FlatList
            key={'ALBUMS_GRID'} // ← IMPORTANT
            data={albums}
            renderItem={renderAlbumItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
            }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderAlbumsFooter}
            onEndReached={loadMoreAlbums}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {/* Playlist Modal */}
      <PlaylistModal
        visible={isPlaylistModalVisible}
        onClose={closePlaylistModal}
        song={selectedSong}
        onUpdated={() => setCustomPlaylistUpdated(!CustomPlaylistUpdated)}
      />

      {/* Bottom Sheet */}
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

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLangModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Language</Text>
                {availableLanguages.map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.optionBtn,
                      selectedLanguage === lang && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setLangModalVisible(false);
                      setSelectedLanguage(lang);
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedLanguage === lang ? '#10b981' : '#e5e7eb',
                      }}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sort By</Text>
                {categoryOptions.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.optionBtn,
                      selectedCategory === cat.value && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setCategoryModalVisible(false);
                      setSelectedCategory(cat.value);
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedCategory === cat.value
                            ? '#10b981'
                            : '#e5e7eb',
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Sort Order Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sort Order</Text>
                {sortOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionBtn,
                      sortOrder === opt.value && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setSortModalVisible(false);
                      setSortOrder(opt.value);
                    }}
                  >
                    <Text
                      style={{
                        color: sortOrder === opt.value ? '#10b981' : '#e5e7eb',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  labelInfoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  labelImage: {
    width: 150,
    height: 150,
    borderRadius: 999,
    marginBottom: 10,
  },
  labelName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  labelCounts: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  playLabelButton: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  playLabelText: {
    color: '#6ee7b7',
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  filterPill: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  filterPillText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  tabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  albumCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 14,
    padding: 8,
    marginBottom: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  albumImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  albumTitle: {
    color: '#f9fafb',
    fontWeight: '600',
    fontSize: 13,
  },
  albumSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    marginBottom: 6,
  },
  optionSelected: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
});
