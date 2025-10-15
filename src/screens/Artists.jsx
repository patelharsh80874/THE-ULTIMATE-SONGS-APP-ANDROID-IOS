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
import {SearchIcon, CloseIcon, UserIcon} from '../components/icons';

const {width} = Dimensions.get('window');
const cardWidth = (width - 48 - 12) / 2;

export default function Artists({openArtistDetails}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const cancelTokenSource = useRef(null);

  const searchArtists = async query => {
    if (!query.trim()) {
      return;
    }

    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('New search initiated');
    }

    cancelTokenSource.current = axios.CancelToken.source();
    setLoading(true);

    try {
      const response = await axios.get(
        'https://jiosavan-api-with-playlist.vercel.app/api/search/artists',
        {
          params: {
            query: query,
            limit: 100,
          },
          cancelToken: cancelTokenSource.current.token,
          timeout: 10000,
        },
      );

      if (response.data.success && response.data.data?.results) {
        setArtists(response.data.data.results);
      } else {
        setArtists([]);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Search error:', error);
        setArtists([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = () => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) {
      return;
    }
    searchArtists(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setArtists([]);
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Search cleared');
    }
  };

  const renderArtistCard = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => openArtistDetails(item.id)}
        style={{width: cardWidth}}
        className="mb-4"
        activeOpacity={0.8}>
        <View className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden items-center p-4">
          {/* Circular Artist Image */}
          <Image
            source={{uri: item.image?.[2]?.url}}
            style={{width: cardWidth - 32, height: cardWidth - 32}}
            className="rounded-full mb-3"
            resizeMode="cover"
          />
          {/* Artist Name */}
          <Text numberOfLines={2} className="text-white text-sm font-bold text-center">
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim() && artists.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
            <UserIcon size={48} color="#10b981" filled />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Discover Artists
          </Text>
          <Text className="text-gray-400 text-center">
            Search for your favorite artists
          </Text>
        </View>
      );
    }

    if (artists.length === 0 && searchQuery.trim()) {
      return (
        <View className="flex-1 justify-center items-center px-8 mt-20">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            No Artists Found
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
          <Text className="text-white text-3xl font-bold mb-6">Artists</Text>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-gray-900/60 border border-gray-800 rounded-2xl flex-row items-center px-4 py-3">
              <SearchIcon size={20} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search artists..."
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

          {artists.length > 0 && (
            <Text className="text-gray-400 text-sm mt-3">
              Found {artists.length} artists
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
            data={artists}
            renderItem={renderArtistCard}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
