import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {HeartIcon, PlayIcon} from './icons';
import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';

export default function SongCard({
  song,
  index,
  onPlay,
  isPlaying,
  likedSongs = [],
  updateLikedSongs,
  isChart = false,
  isPlaylist = false,
  isAlbum = false,
}) {
  const isLiked = isSongLiked(song.id, likedSongs);

  const handleLikeToggle = async () => {
    if (isLiked) {
      await unlikeSong(song.id);
    } else {
      await likeSong(song);
    }
    if (updateLikedSongs) {
      await updateLikedSongs();
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPlay(song)}
      activeOpacity={0.9}
      className="mr-4 w-44">
      <View
        className={`rounded-3xl p-3 ${
          isPlaying
            ? 'bg-emerald-900/40 border-2 border-emerald-500/50'
            : 'bg-gray-900/60 border border-gray-800'
        }`}>
        {/* Image Container */}
        <View className="relative mb-3">
          <Image
            source={{uri: song.image?.[2]?.url || song.image?.[2]?.link}}
            className="w-full h-44 rounded-2xl"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />

          {/* Number Badge */}
          <View
            className={`absolute top-3 left-3 px-3 py-1.5 rounded-full ${
              isPlaying
                ? 'bg-emerald-500'
                : 'bg-black/70 backdrop-blur-xl border border-white/10'
            }`}>
            <Text className="font-bold text-white text-xs">#{index + 1}</Text>
          </View>

          {/* Play Indicator */}
          {isPlaying && (
            <View className="absolute inset-0 justify-center items-center">
              <View className="bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/50">
                <PlayIcon size={24} color="#fff" />
              </View>
            </View>
          )}
        </View>

        {/* Song Info */}
        <Text
          numberOfLines={1}
          className={`text-sm font-bold mb-1 ${
            isPlaying ? 'text-emerald-400' : 'text-white'
          }`}>
          {song.name || song.title}
        </Text>

        {!isChart && !isPlaylist && !isAlbum && (
          <View className="flex-row justify-between items-center">
            <Text numberOfLines={1} className="text-gray-400 text-xs flex-1 mr-2">
              {song.artists?.primary?.[0]?.name ||
                song.primaryArtists?.[0]?.name ||
                'Unknown'}
            </Text>
            {updateLikedSongs && (
              <TouchableOpacity
                onPress={handleLikeToggle}
                className={`p-2 rounded-full ${
                  isLiked ? 'bg-emerald-500/20' : 'bg-gray-800'
                }`}>
                <HeartIcon
                  size={14}
                  color={isLiked ? '#10b981' : '#9ca3af'}
                  filled={isLiked}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {(isChart || isPlaylist) && (
          <Text numberOfLines={1} className="text-gray-400 text-xs">
            {song.subtitle || 'Playlist'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
