import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {HeartIcon, PlayIcon, CloseIcon} from './icons';
import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';

export default function PlaylistDetailsModal({
  visible,
  playlistId,
  onClose,
  playSong,
  currentSong,
  likedSongs,
  updateLikedSongs,
}) {
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && playlistId) {
      fetchPlaylistDetails();
    }
  }, [visible, playlistId]);

  const fetchPlaylistDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://jiosavan-api-with-playlist.vercel.app/api/playlists',
        {
          params: {
            id: playlistId,
            limit: 100,
          },
          timeout: 10000,
        },
      );

      if (response.data.success && response.data.data) {
        setPlaylistData(response.data.data);
      }
    } catch (error) {
      console.error('Playlist details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async songId => {
    const isLiked = isSongLiked(songId, likedSongs);
    if (isLiked) {
      await unlikeSong(songId);
    } else {
      const song = playlistData.songs.find(s => s.id === songId);
      if (song) {
        await likeSong(song);
      }
    }
    await updateLikedSongs();
  };

  const renderSongItem = (item, index) => {
    const isPlaying = currentSong && currentSong.id === item.id;
    const isLiked = isSongLiked(item.id, likedSongs);

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        onPress={() => playSong(item, playlistData.songs)}
        className="mb-3"
        activeOpacity={0.8}>
        <View
          className={`flex-row items-center p-4 rounded-2xl ${
            isPlaying
              ? 'bg-emerald-900/40 border-2 border-emerald-500/50'
              : 'bg-gray-900/60 border border-gray-800'
          }`}>
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

          <View className="relative mr-3">
            <Image
              source={{uri: item.image?.[2]?.url}}
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
              }`}>
              {item.name}
            </Text>
            <Text numberOfLines={1} className="text-gray-400 text-sm mt-1">
              {item.artists?.primary?.[0]?.name || 'Unknown Artist'}
            </Text>
          </View>

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen">
      <View className="flex-1 bg-slate-950">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-900 p-3 rounded-full mr-4">
              <CloseIcon size={18} color="#fff" />
            </TouchableOpacity>
            <Text
              className="text-white text-2xl font-bold flex-1"
              numberOfLines={1}>
              Playlist
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="text-gray-400 mt-4">Loading playlist...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="px-6 py-4">
                <View className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden mb-6">
                  <Image
                    source={{uri: playlistData?.image?.[2]?.url}}
                    className="w-full h-64"
                    resizeMode="cover"
                  />
                  <View className="p-5">
                    <Text className="text-white text-2xl font-bold mb-2">
                      {playlistData?.name}
                    </Text>
                    {playlistData?.description && (
                      <Text
                        numberOfLines={2}
                        className="text-gray-400 text-sm mb-3">
                        {playlistData.description}
                      </Text>
                    )}
                    <View className="flex-row items-center gap-3">
                      <View className="bg-emerald-500/20 px-4 py-2 rounded-full">
                        <Text className="text-emerald-400 text-sm font-bold">
                          {playlistData?.songCount} Songs
                        </Text>
                      </View>
                      {playlistData?.language && (
                        <View className="bg-gray-800 px-4 py-2 rounded-full">
                          <Text className="text-gray-300 text-sm font-semibold capitalize">
                            {playlistData.language}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <Text className="text-white text-xl font-bold mb-4">Songs</Text>

                {playlistData?.songs?.map((item, index) =>
                  renderSongItem(item, index),
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
