import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {
  HeartIcon,
  PlayIcon,
  ArrowLeftIcon,
  PlaylistIcon,
  EllipsisVerticalIcon,
} from '../components/icons';
import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';
import PlaylistModal from '../components/PlaylistModal';
import SongOptionsBottomSheet from '../components/SongOptionsBottomSheet';
import { playTrack } from '../services/audioService';

const { width } = Dimensions.get('window');

export default function AlbumDetails({
  albumId,
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
  openHomePage,
  currentHomeScreen,
}) {
  const PlayFullPlaylist = true;
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSong, setSheetSong] = useState(null);

  const openSheet = song => {
    setSheetSong(song);
    setSheetVisible(true);
  };
  const closeSheet = () => {
    setSheetVisible(false);
    setSheetSong(null);
  };

  useEffect(() => {
    if (albumId) {
      fetchAlbumDetails();
    }
  }, [albumId]);

  const fetchAlbumDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://jiosavan-api-with-playlist.vercel.app/api/albums',
        {
          params: {
            id: albumId,
          },
          timeout: 10000,
        },
      );

      if (response.data.success && response.data.data) {
        setAlbumData(response.data.data);
      }
    } catch (error) {
      console.error('Album details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async songId => {
    const isLiked = isSongLiked(songId, likedSongs);
    if (isLiked) {
      await unlikeSong(songId);
    } else {
      const song = albumData.songs.find(s => s.id === songId);
      if (song) {
        await likeSong(song);
      }
    }
    await updateLikedSongs();
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

  const renderSongItem = ({ item, index }) => {
    const isPlaying = currentSong && currentSong.id === item.id;
    const isLiked = isSongLiked(item.id, likedSongs);

    return (
      <TouchableOpacity
        onPress={() => {
          playSong(item, albumData.songs);
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
          {/* <View
            className={`w-10 h-10 rounded-xl ${
              isPlaying ? 'bg-emerald-600' : 'bg-gray-800'
            } justify-center items-center mr-3`}>
            <Text
              className={`text-sm font-bold ${
                isPlaying ? 'text-white' : 'text-gray-400'
              }`}>
              {index + 1}
            </Text>
          </View> */}

          <View className="relative mr-3">
            <Image
              source={{ uri: item.image?.[settings.imageQualityIndex]?.url }}
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
              {item.artists?.primary?.[0]?.name || 'Unknown Artist'}
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
          {/* ✅ Play Next Button */}
          {/* {currentSong &&
            <TouchableOpacity
              onPress={() => handleAddToQueue(item)}
              className="p-3 bg-gray-800 rounded-full ml-2"
              activeOpacity={0.8}>
              <Text className='text-xs text-[#10b981] font-bold'>Play Next</Text>
            </TouchableOpacity> } */}

          {/* ⋮ Menu Button */}
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

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-400 mt-4">Loading album...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Back Button Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            // onPress={()=>currentHomeScreen=='LabelDetails' ? openHomePage() : onBack() }
            className="bg-gray-900 p-3 rounded-full mr-4"
          >
            <ArrowLeftIcon size={20} color="#fff" />
          </TouchableOpacity>
          <Text
            className="text-white text-2xl font-bold flex-1"
            numberOfLines={1}
          >
            Album Details
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4 mb-96">
            {/* Square Album Header */}
            <View className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden mb-6">
              {/* Square Image */}
              <Image
                source={{ uri: albumData?.image?.[2]?.url }}
                style={{ width: width - 43, height: width - 48 }}
                resizeMode="cover"
              />
              <View className="p-5">
                <Text className="text-white text-2xl font-bold mb-2">
                  {albumData?.name}
                </Text>
                {albumData?.description && (
                  <Text
                    numberOfLines={2}
                    className="text-gray-400 text-sm mb-3"
                  >
                    {albumData.description}
                  </Text>
                )}
                <View className="flex-row items-center gap-3 flex-wrap">
                  <View className="bg-emerald-500/20 px-4 py-2 rounded-full">
                    <Text className="text-emerald-400 text-sm font-bold">
                      {albumData?.songCount} Songs
                    </Text>
                  </View>
                  {albumData?.year && (
                    <View className="bg-gray-800 px-4 py-2 rounded-full">
                      <Text className="text-gray-300 text-sm font-semibold">
                        {albumData.year}
                      </Text>
                    </View>
                  )}
                  {albumData?.language && (
                    <View className="bg-gray-800 px-4 py-2 rounded-full">
                      <Text className="text-gray-300 text-sm font-semibold capitalize">
                        {albumData.language}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setHasRadioQueue(false);
                      playSong(
                        albumData.songs[0],
                        albumData.songs,
                        PlayFullPlaylist,
                      );
                    }}
                    className="bg-emerald-500/20 px-4 py-2 rounded-full self-start"
                  >
                    <Text className="text-emerald-400 text-sm font-bold">
                      ▶️ Play Full Album
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Songs List */}
            <Text className="text-white text-xl font-bold mb-4">Songs</Text>

            <FlatList
              data={albumData?.songs || []}
              renderItem={renderSongItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
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
    </View>
  );
}
