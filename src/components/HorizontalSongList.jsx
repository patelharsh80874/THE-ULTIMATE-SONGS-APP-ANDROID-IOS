// import React from 'react';
// import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
// import {PlayIcon, HeartIcon} from './icons';
// import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';

// export default function HorizontalSongList({
//   songs,
//   onPlay,
//   onCardPress,
//   currentSong,
//   likedSongs = [],
//   updateLikedSongs,
//   isChart = false,
//   isPlaylist = false,
//   isAlbum = false,
// }) {
//   const handleLikeToggle = async (e, song) => {
//     e.stopPropagation();
//     const isLiked = isSongLiked(song.id, likedSongs);
//     if (isLiked) {
//       await unlikeSong(song.id);
//     } else {
//       await likeSong(song);
//     }
//     if (updateLikedSongs) {
//       await updateLikedSongs();
//     }
//   };

//   const handleCardPress = item => {
//     // If it's chart, playlist, or album - open details page
//     if ((isChart || isPlaylist || isAlbum) && onCardPress) {
//       onCardPress(item.id);
//     } else if (onPlay) {
//       // If it's regular song - play it
//       onPlay(item);
//     }
//   };

//   const renderCard = item => {
//     const isPlaying = currentSong && currentSong.id === item.id;
//     const isLiked = likedSongs && isSongLiked(item.id, likedSongs);

//     return (
//       <TouchableOpacity
//         key={item.id}
//         onPress={() => handleCardPress(item)}
//         className="mr-4"
//         activeOpacity={0.8}>
//         <View className="w-40">
//           {/* Image Container */}
//           <View className="relative">
//             <Image
//               source={{uri: item.image?.[2]?.url || item.image?.[2]?.link}}
//               className="w-40 h-40 rounded-2xl"
//               resizeMode="cover"
//             />
//             {/* Playing Indicator */}
//             {isPlaying && !isChart && !isPlaylist && !isAlbum && (
//               <View className="absolute inset-0 bg-black/40 rounded-2xl items-center justify-center">
//                 <View className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center">
//                   <PlayIcon size={20} color="#fff" />
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Song Info */}
//           <View className="mt-3">
//             <Text numberOfLines={1} className="text-white font-bold text-sm">
//               {item.name || item.title}
//             </Text>
            
//             {/* Show song count for playlists/charts/albums */}
//             {(isChart || isPlaylist || isAlbum) ? (
//               <Text numberOfLines={1} className="text-gray-400 text-xs mt-1">
//                 {item.songCount || item.songs?.length || 0} Songs
//               </Text>
//             ) : (
//               <Text numberOfLines={1} className="text-gray-400 text-xs mt-1">
//                 {item.artists?.primary?.[0]?.name ||
//                   item.primaryArtists?.[0]?.name ||
//                   'Unknown Artist'}
//               </Text>
//             )}
//           </View>

//           {/* Like Button - Only for regular songs */}
//           {!isChart && !isPlaylist && !isAlbum && likedSongs && (
//             <TouchableOpacity
//               onPress={e => handleLikeToggle(e, item)}
//               className={`absolute top-2 right-2 p-2 rounded-full ${
//                 isLiked ? 'bg-emerald-500/90' : 'bg-black/50'
//               }`}>
//               <HeartIcon
//                 size={16}
//                 color={isLiked ? '#fff' : '#fff'}
//                 filled={isLiked}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{paddingRight: 24}}>
//       {songs.map(renderCard)}
//     </ScrollView>
//   );
// }





















// import React from 'react';
// import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
// import {PlayIcon, HeartIcon} from './icons';
// import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';

// export default function HorizontalSongList({
//   songs,
//   onPlay,
//   onCardPress,
//   currentSong,
//   likedSongs = [],
//   updateLikedSongs,
//   isChart = false,
//   isPlaylist = false,
//   isAlbum = false,
// }) {
//   const handleLikeToggle = async (e, song) => {
//     e.stopPropagation();
//     const isLiked = isSongLiked(song.id, likedSongs);
//     if (isLiked) {
//       await unlikeSong(song.id);
//     } else {
//       await likeSong(song);
//     }
//     if (updateLikedSongs) {
//       await updateLikedSongs();
//     }
//   };

//   const handleCardPress = item => {
//     if ((isChart || isPlaylist || isAlbum) && onCardPress) {
//       onCardPress(item.id);
//     } else if (onPlay) {
//       onPlay(item);
//     }
//   };

//   const renderCard = item => {
//     const isPlaying = currentSong && currentSong.id === item.id;
//     const isLiked = likedSongs && isSongLiked(item.id, likedSongs);

//     return (
//       <TouchableOpacity
//         key={item.id}
//         onPress={() => handleCardPress(item)}
//         activeOpacity={0.85}
//         style={{
//           marginRight: 16,
//           width: 150,
//           borderWidth: isPlaying ? 2 : 0,
//           borderColor: isPlaying ? '#10b981' : 'transparent',
//           borderRadius: 5,
//           overflow: 'hidden',
//           backgroundColor: '#1e293b',
//           shadowColor: '#064e3b',
//           shadowOffset: {width: 0, height: 8},
//           shadowOpacity: 0.3,
//           shadowRadius: 10,
//           elevation: 6,
//         }}>
//         <View style={{position: 'relative'}}>
//           <Image
//             source={{uri: item.image?.[2]?.url || item.image?.[2]?.link}}
//             style={{width: '100%', height: 150}}
//             resizeMode="cover"
//           />
//           {isPlaying && !isChart && !isPlaylist && !isAlbum && (
//             <View
//               style={{
//                 position: 'absolute',
//                 left: 0,
//                 right: 0,
//                 top: 0,
//                 bottom: 0,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 borderRadius: 20,
//                 pointerEvents: 'none',
//               }}>
//               <PlayIcon size={50} color="#10b981" />
//             </View>
//           )}
//         </View>
//         <View style={{padding: 10}}>
//           <Text
//             numberOfLines={1}
//             style={{
//               color: isPlaying ? '#10b981' : '#fff',
//               fontWeight: '700',
//               fontSize: 14,
//               marginBottom: 4,
//             }}>
//             {item.name || item.title}
//           </Text>
//           <Text style={{color: '#94a3b8', fontSize: 12}} numberOfLines={1}>
//             {item.artists?.primary?.[0]?.name ||
//               item.primaryArtists?.[0]?.name ||
//               'Unknown Artist'}
//           </Text>
//         </View>
//         {!isChart && !isPlaylist && !isAlbum && (
//           <TouchableOpacity
//             onPress={e => handleLikeToggle(e, item)}
//             style={{
//               position: 'absolute',
//               top: 8,
//               right: 8,
//               padding: 6,
//               borderRadius: 16,
//               backgroundColor: isLiked ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.55)',
//             }}>
//             <HeartIcon size={18} color="#fff" filled={isLiked} />
//           </TouchableOpacity>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{paddingRight: 24}}>
//       {songs.map(renderCard)}
//     </ScrollView>
//   );
// }












import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { PlayIcon, HeartIcon } from './icons';
import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';

export default function HorizontalSongList({
  songs,
  onPlay,
  onCardPress,
  currentSong,
  likedSongs = [],
  updateLikedSongs,
  isChart = false,
  isPlaylist = false,
  isAlbum = false,
  loading = false,
}) {
  const handleLikeToggle = async (e, song) => {
    e.stopPropagation();
    const isLiked = isSongLiked(song.id, likedSongs);
    if (isLiked) await unlikeSong(song.id);
    else await likeSong(song);
    if (updateLikedSongs) await updateLikedSongs();
  };

  const handleCardPress = item => {
    if ((isChart || isPlaylist || isAlbum) && onCardPress) onCardPress(item.id);
    else if (onPlay) onPlay(item);
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
        contentContainerStyle={{ paddingRight: 24, paddingTop: 2, paddingBottom: 8 }}
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
          backgroundColor: '#1e293b',
          shadowColor: '#064e3b',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 6,
        }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.image?.[2]?.url || item.image?.[2]?.link }}
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
              }}>
              <PlayIcon size={50} color="#10b981" />
            </View>
          )}
        </View>
        <View style={{ padding: 10 }}>
          <Text
            numberOfLines={1}
            style={{
              color: isPlaying ? '#10b981' : '#fff',
              fontWeight: '700',
              fontSize: 14,
              marginBottom: 4,
            }}>
            {item.name || item.title}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }} numberOfLines={1}>
            {item.artists?.primary?.[0]?.name ||
              item.primaryArtists?.[0]?.name ||
              'Unknown Artist'}
          </Text>
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
              backgroundColor: isLiked ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.55)',
            }}>
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
    </ScrollView>
  );
}
