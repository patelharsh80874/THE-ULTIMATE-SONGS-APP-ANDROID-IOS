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
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {SearchIcon, CloseIcon, MusicIcon} from '../components/icons';

const {width} = Dimensions.get('window');
const cardWidth = (width - 48 - 12) / 2; // 48 = padding, 12 = gap

export default function Playlists({openPlaylistDetails}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const seenPlaylistIds = useRef(new Set());
  const cancelTokenSource = useRef(null);

  const searchPlaylists = async (query, pageNum = 1, isLoadMore = false) => {
    if (!query.trim()) {
      return;
    }

    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('New search initiated');
    }

    cancelTokenSource.current = axios.CancelToken.source();

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      seenPlaylistIds.current.clear();
    }

    try {
      const response = await axios.get(
        'https://jiosavan-api-with-playlist.vercel.app/api/search/playlists',
        {
          params: {
            query: query,
            page: pageNum,
            limit: 10,
          },
          cancelToken: cancelTokenSource.current.token,
          timeout: 10000,
        },
      );

      if (response.data.success && response.data.data?.results) {
        const newPlaylists = response.data.data.results.filter(playlist => {
          if (seenPlaylistIds.current.has(playlist.id)) {
            return false;
          }
          seenPlaylistIds.current.add(playlist.id);
          return true;
        });

        if (isLoadMore) {
          setPlaylists(prev => [...prev, ...newPlaylists]);
        } else {
          setPlaylists(newPlaylists);
        }

        setHasMore(newPlaylists.length === 10);
      } else {
        if (!isLoadMore) {
          setPlaylists([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Search error:', error);
        if (!isLoadMore) {
          setPlaylists([]);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchPress = () => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) {
      return;
    }
    setPlaylists([]);
    seenPlaylistIds.current.clear();
    setPage(1);
    setHasMore(true);
    searchPlaylists(searchQuery, 1, false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPlaylists([]);
    setPage(1);
    setHasMore(true);
    seenPlaylistIds.current.clear();
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Search cleared');
    }
  };

  const loadMorePlaylists = () => {
    if (!loadingMore && hasMore && searchQuery.trim() && playlists.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchPlaylists(searchQuery, nextPage, true);
    }
  };

  const renderPlaylistCard = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => openPlaylistDetails(item.id)}
        style={{width: cardWidth}}
        className="mb-4"
        activeOpacity={0.8}>
        <View className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Square Image */}
          <Image
            source={{uri: item.image?.[2]?.url}}
            style={{width: cardWidth, height: cardWidth}}
            resizeMode="cover"
          />
          {/* Info */}
          <View className="p-3">
            <Text numberOfLines={2} className="text-white text-sm font-bold mb-2">
              {item.name}
            </Text>
            <View className="bg-emerald-500/20 px-2 py-1 rounded-full self-start">
              <Text className="text-emerald-400 text-xs font-bold">
                {item.songCount} Songs
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 w-full">
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim() && playlists.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
            <MusicIcon size={48} color="#10b981" filled />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Discover Playlists
          </Text>
          <Text className="text-gray-400 text-center">
            Search for your favorite playlists
          </Text>
        </View>
      );
    }

    if (playlists.length === 0 && searchQuery.trim()) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">🎵</Text>
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            No Playlists Found
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
        <View className="px-6 pt-6 pb-4">
          <Text className="text-white text-3xl font-bold mb-6">Playlists</Text>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-gray-900/60 border border-gray-800 rounded-2xl flex-row items-center px-4 py-3">
              <SearchIcon size={20} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search playlists..."
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

            <TouchableOpacity
              onPress={handleSearchPress}
              disabled={!searchQuery.trim() || loading}
              className={`p-4 rounded-2xl ${
                searchQuery.trim() && !loading ? 'bg-emerald-600' : 'bg-gray-800'
              }`}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <SearchIcon size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {playlists.length > 0 && (
            <Text className="text-gray-400 text-sm mt-3">
              Found {playlists.length} playlists
            </Text>
          )}
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-400 mt-4">Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            renderItem={renderPlaylistCard}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMorePlaylists}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
