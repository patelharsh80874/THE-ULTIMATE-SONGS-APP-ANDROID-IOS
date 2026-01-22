import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { PlayIcon, HeartIcon, EllipsisHorizontalIcon } from './icons';
import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';
import SongOptionsBottomSheet from './SongOptionsBottomSheet';
import PlaylistModal from './PlaylistModal';
import { playTrack } from '../services/audioService';

export default function HorizontalSongList({
  songs,
  onPlay,
  onCardPress,
  currentSong,
  setCurrentSong,
  handleNext,
  currentIndexRef,
  likedSongs = [],
  updateLikedSongs,
  isChart = false,
  isPlaylist = false,
  isAlbum = false,
  loading = false,
  songQueue,
  setSongQueue,
  hasRadioQueue,
  setHasRadioQueue,
  settings,
  CustomPlaylistUpdated,
  setCustomPlaylistUpdated,
  openAlbumPage,
}) {
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSong, setSheetSong] = useState(null);

  const openSheet = item => {
    setSheetSong(item);
    setSelectedSong(item);
    setSheetVisible(true);
  };
  const closeSheet = () => {
    setSheetVisible(false);
    setSheetSong(null);
  };

  const openPlaylistModal = song => {
    // setSelectedSong(song);
    setPlaylistModalVisible(true);
  };

  const closePlaylistModal = () => setPlaylistModalVisible(false);

  const handleLikeToggle = async (e, song) => {
    e.stopPropagation();
    const isLiked = isSongLiked(song.id, likedSongs);
    if (isLiked) await unlikeSong(song.id);
    else await likeSong(song);
    if (updateLikedSongs) await updateLikedSongs();
  };

  const handleCardPress = item => {
    if ((isChart || isPlaylist || isAlbum) && onCardPress) onCardPress(item.id);
    else if (onPlay) {
      onPlay(item);
      setHasRadioQueue(false);
    }
  };
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

  // Skeleton Card
  const SkeletonCard = (_, i) => (
    <View
      key={i}
      style={{
        marginRight: 16,
        width: 150,
        borderRadius: 6,
        backgroundColor: '#1e293b',
        overflow: 'hidden',
        height: 185,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#223042',
        padding: 0,
      }}
    >
      {/* Image rect */}
      <View
        style={{
          width: '100%',
          height: 115,
          backgroundColor: '#253146',
          opacity: 0.38,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      />
      {/* Song title skeleton */}
      <View
        style={{
          width: '70%',
          height: 15,
          backgroundColor: '#253146',
          marginTop: 16,
          marginHorizontal: 10,
          borderRadius: 8,
          opacity: 0.26,
        }}
      />
      {/* Artist skeleton */}
      <View
        style={{
          width: '50%',
          height: 12,
          backgroundColor: '#253146',
          marginTop: 8,
          marginHorizontal: 10,
          borderRadius: 7,
          opacity: 0.18,
        }}
      />
    </View>
  );

  // Render when loading
  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 24,
          paddingTop: 2,
          paddingBottom: 8,
        }}
      >
        {[...Array(5)].map(SkeletonCard)}
      </ScrollView>
    );
  }

  // Render normal data
  const renderCard = item => {
    const isPlaying = currentSong && currentSong.id === item.id;
    const isLiked = likedSongs && isSongLiked(item.id, likedSongs);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.85}
        style={{
          marginRight: 16,
          width: 150,
          borderWidth: isPlaying ? 2 : 0,
          borderColor: isPlaying ? '#10b981' : 'transparent',
          borderRadius: 5,
          overflow: 'hidden',
          // backgroundColor: '#1e293b',
          backgroundColor: 'rgb(17 24 39 / 0.6)',
          // shadowColor: '#064e3b',
          // shadowOffset: { width: 0, height: 8 },
          // shadowOpacity: 0.3,
          // shadowRadius: 10,
          // elevation: 6,
        }}
      >
        <View style={{ position: 'relative' }}>
          <Image
            // source={{ uri: item.image?.[2]?.url || item.image?.[2]?.link }}
            source={{
              uri:
                item.image?.[settings.imageQualityIndex]?.url ||
                item.image?.[settings.imageQualityIndex]?.link,
            }}
            style={{ width: '100%', height: 150 }}
            resizeMode="cover"
          />
          {isPlaying && !isChart && !isPlaylist && !isAlbum && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20,
                pointerEvents: 'none',
              }}
            >
              <PlayIcon size={50} color="#10b981" />
            </View>
          )}
        </View>
        <View
          style={{
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <View>
            <Text
              numberOfLines={1}
              style={{
                color: isPlaying ? '#10b981' : '#fff',
                fontWeight: '700',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {item.name
                ?.replace(/&quot;/g, '"')
                ?.replace(/&#039;/g, "'")
                ?.replace(/&amp;/g, '&') || item.title}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12 }} numberOfLines={1}>
              {item.artists?.primary?.[0]?.name ||
                item.primaryArtists?.[0]?.name ||
                'Unknown Artist'}
            </Text>
          </View>
          {!isChart && !isPlaylist && !isAlbum && (
            <TouchableOpacity
              // onPress={() => handleAddToQueue(item)}
              onPress={() => openSheet(item)}
              // className="p-3 flex justify-center items-center bg-gray-800  rounded-full"
              className="p-0 flex justify-center items-center bg-gray-800  rounded-full"
              activeOpacity={0.8}
            >
              {/* <Text className="text-xs text-[#10b981] font-bold">
                 More
              </Text> */}
              <EllipsisHorizontalIcon size={25} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
        {!isChart && !isPlaylist && !isAlbum && (
          <TouchableOpacity
            onPress={e => handleLikeToggle(e, item)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: 6,
              borderRadius: 16,
              backgroundColor: isLiked
                ? 'rgba(16,185,129,0.9)'
                : 'rgba(0,0,0,0.55)',
            }}
          >
            <HeartIcon size={18} color="#fff" filled={isLiked} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 24 }}
    >
      {songs.map(renderCard)}
      <SongOptionsBottomSheet
        isVisible={sheetVisible}
        onClose={closeSheet}
        song={sheetSong}
        HasThreeBT={false}
        onAddToPlaylist={openPlaylistModal}
        onPlayNext={handleAddToQueue}
        currentSong={currentSong}
        handlePlayNow={handlePlayNow}
      />
      <PlaylistModal
        visible={isPlaylistModalVisible}
        onClose={closePlaylistModal}
        song={selectedSong}
        onUpdated={() => setCustomPlaylistUpdated(!CustomPlaylistUpdated)}
      />
    </ScrollView>
  );
}
