import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {SearchIcon, HeartIcon, PlayIcon, CloseIcon} from '../components/icons';
import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';
import {clearAudio} from '../services/audioService';

export default function Search({
  playSong,
  currentSong,
  likedSongs,
  updateLikedSongs,
  onClosePlayer, // New prop to close player
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const seenSongIds = useRef(new Set());
  const cancelTokenSource = useRef(null);

  // Search songs with axios
  const searchSongs = async (query, pageNum = 1, isLoadMore = false) => {
    if (!query.trim()) {
      return;
    }

    // Cancel previous request
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('New search initiated');
    }

    // Create new cancel token
    cancelTokenSource.current = axios.CancelToken.source();

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      seenSongIds.current.clear();
    }

    try {
      const response = await axios.get(
        'https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/songs',
        {
          params: {
            query: query,
            page: pageNum,
            limit: 40,
          },
          cancelToken: cancelTokenSource.current.token,
          timeout: 10000,
        },
      );

      if (response.data.success && response.data.data?.results) {
        // Filter out duplicates
        const newSongs = response.data.data.results.filter(song => {
          if (seenSongIds.current.has(song.id)) {
            return false;
          }
          seenSongIds.current.add(song.id);
          return true;
        });

        if (isLoadMore) {
          setSongs(prev => [...prev, ...newSongs]);
        } else {
          setSongs(newSongs);
        }

        setHasMore(newSongs.length === 40);
      } else {
        if (!isLoadMore) {
          setSongs([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Search error:', error);
        if (!isLoadMore) {
          setSongs([]);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle search button press
  const handleSearchPress = () => {
    Keyboard.dismiss();
    
    if (!searchQuery.trim()) {
      return;
    }

    // Close player and clear queue
    if (onClosePlayer) {
      onClosePlayer();
    }
    clearAudio();

    // Clear previous data
    setSongs([]);
    seenSongIds.current.clear();
    setPage(1);
    setHasMore(true);

    // Start new search
    searchSongs(searchQuery, 1, false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSongs([]);
    setPage(1);
    setHasMore(true);
    seenSongIds.current.clear();

    // Cancel any pending requests
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Search cleared');
    }

    // Close player
    if (onClosePlayer) {
      onClosePlayer();
    }
    clearAudio();
  };

  // Load more songs (infinite scroll)
  const loadMoreSongs = () => {
    if (!loadingMore && hasMore && searchQuery.trim() && songs.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchSongs(searchQuery, nextPage, true);
    }
  };

  // Handle like toggle
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

  // Render song item
  const renderSongItem = ({item, index}) => {
    const isPlaying = currentSong && currentSong.id === item.id;
    const isLiked = isSongLiked(item.id, likedSongs);

    return (
      <TouchableOpacity
        onPress={() => playSong(item, songs)}
        className="mb-3"
        activeOpacity={0.8}>
        <View
          className={`flex-row items-center p-4 rounded-2xl ${
            isPlaying
              ? 'bg-emerald-900/40 border-2 border-emerald-500/50'
              : 'bg-gray-900/60 border border-gray-800'
          }`}>
          {/* Rank Number */}
          <View
            className={`w-10 h-10 rounded-xl ${
              isPlaying ? 'bg-emerald-600' : 'bg-gray-800'
            } justify-center items-center mr-3`}>
            <Text
              className={`text-sm font-bold ${
                isPlaying ? 'text-white' : 'text-gray-400'
              }`}>
              {index + 1}
            </Text>
          </View>

          {/* Album Art */}
          <View className="relative mr-3">
            <Image
              source={{uri: item.image?.[2]?.url || item.image?.[2]?.link}}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />
            {isPlaying && (
              <View className="absolute inset-0 rounded-xl bg-emerald-500/20 justify-center items-center">
                <PlayIcon size={20} color="#10b981" />
              </View>
            )}
          </View>

          {/* Song Info */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-base font-bold ${
                isPlaying ? 'text-emerald-300' : 'text-white'
              }`}>
              {item.name}
            </Text>
            <Text numberOfLines={1} className="text-gray-400 text-sm mt-1">
              {item.artists?.primary?.[0]?.name ||
                item.primaryArtists?.[0]?.name ||
                'Unknown Artist'}
            </Text>
          </View>

          {/* Like Button */}
          <TouchableOpacity
            onPress={() => handleLikeToggle(item.id)}
            className={`p-3 rounded-full ml-2 ${
              isLiked ? 'bg-emerald-500/20' : 'bg-gray-800'
            }`}>
            <HeartIcon
              size={20}
              color={isLiked ? '#10b981' : '#9ca3af'}
              filled={isLiked}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Footer component
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim() && songs.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
            <SearchIcon size={48} color="#10b981" />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Search Songs
          </Text>
          <Text className="text-gray-400 text-center">
            Enter a song name and tap the search button
          </Text>
        </View>
      );
    }

    if (songs.length === 0 && searchQuery.trim()) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">🎵</Text>
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            No Results Found
          </Text>
          <Text className="text-gray-400 text-center">
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-white text-3xl font-bold mb-6">Search</Text>

          {/* Search Bar with Button */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-gray-900/60 border border-gray-800 rounded-2xl flex-row items-center px-4 py-3">
              <SearchIcon size={20} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search songs, artists..."
                placeholderTextColor="#6b7280"
                className="flex-1 text-white text-base ml-3"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearchPress}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} className="p-1">
                  <CloseIcon size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              onPress={handleSearchPress}
              disabled={!searchQuery.trim() || loading}
              className={`p-4 rounded-2xl ${
                searchQuery.trim() && !loading
                  ? 'bg-emerald-600'
                  : 'bg-gray-800'
              }`}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <SearchIcon size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Results Count */}
          {songs.length > 0 && (
            <Text className="text-gray-400 text-sm mt-3">
              Found {songs.length} songs
            </Text>
          )}
        </View>

        {/* Loading State */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-400 mt-4">Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreSongs}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
