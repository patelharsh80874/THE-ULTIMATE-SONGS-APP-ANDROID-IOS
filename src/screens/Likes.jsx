// import React from 'react';
// import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import Icon from '../components/Icon';
// import {unlikeSong} from '../utils/storage';

// export default function Likes({
//   playSong,
//   currentSong,
//   likedSongs,
//   updateLikedSongs,
// }) {
//   const handleUnlike = async songId => {
//     await unlikeSong(songId);
//     await updateLikedSongs();

//     if (currentSong && currentSong.id === songId) {
//       playSong(null, []);
//     }
//   };

//   const renderSong = ({item, index}) => {
//     const isPlaying = currentSong && currentSong.id === item.id;

//     return (
//       <TouchableOpacity
//         onPress={() => playSong(item, likedSongs)}
//         className="mb-3"
//         activeOpacity={0.8}>
//         <View
//           className={`flex-row items-center p-4 rounded-2xl ${
//             isPlaying ? 'bg-emerald-800' : 'bg-gray-800'
//           }`}>
//           <View
//             className={`w-12 h-12 rounded-xl ${
//               isPlaying ? 'bg-emerald-600' : 'bg-gray-700'
//             } justify-center items-center mr-4`}>
//             <Text
//               className={`text-lg font-bold ${
//                 isPlaying ? 'text-white' : 'text-gray-300'
//               }`}>
//               {index + 1}
//             </Text>
//           </View>

//           <Image
//             source={{uri: item.image?.[2]?.url || item.image?.[2]?.link}}
//             className="w-16 h-16 rounded-xl mr-4"
//           />

//           <View className="flex-1">
//             <Text
//               numberOfLines={1}
//               className={`text-base font-bold ${
//                 isPlaying ? 'text-emerald-300' : 'text-white'
//               }`}>
//               {item.name}
//             </Text>
//             <Text numberOfLines={1} className="text-gray-400 text-sm mt-1">
//               {item.artists?.primary?.[0]?.name ||
//                 item.primaryArtists?.[0]?.name ||
//                 'Unknown Artist'}
//             </Text>
//           </View>

//           <TouchableOpacity
//             onPress={() => handleUnlike(item.id)}
//             className="p-3 bg-red-900 rounded-full">
//             <Icon name="dislike" size={20} color="#ef4444" />
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View className="flex-1 bg-slate-900">
//       <SafeAreaView edges={['top']} className="flex-1">
//         <View className="px-5 pt-4 pb-2">
//           <Text className="text-white text-4xl font-bold">Liked Songs</Text>
//           <Text className="text-gray-400 text-base mt-2">
//             {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
//           </Text>
//         </View>

//         {likedSongs.length === 0 ? (
//           <View className="flex-1 justify-center items-center px-8">
//             <View className="bg-gray-800 p-8 rounded-full mb-6">
//               <Icon name="heart" size={64} color="#6b7280" />
//             </View>
//             <Text className="text-gray-300 text-xl font-semibold text-center">
//               No liked songs yet
//             </Text>
//             <Text className="text-gray-500 text-sm text-center mt-2">
//               Start liking songs to see them here
//             </Text>
//           </View>
//         ) : (
//           <FlatList
//             data={likedSongs}
//             renderItem={renderSong}
//             keyExtractor={item => item.id}
//             contentContainerStyle={{padding: 20, paddingBottom: 100}}
//           />
//         )}
//       </SafeAreaView>
//     </View>
//   );
// }

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { unlikeSong } from '../utils/storage';
import { clearAudio } from '../services/audioService';
import { DisLikeIcon } from '../components/icons';

export default function Likes({
  playSong,
  currentSong,
  likedSongs,
  updateLikedSongs,
  onClosePlayer,
}) {
  const handleUnlike = async songId => {
    await unlikeSong(songId);
    await updateLikedSongs();

    if (currentSong && currentSong.id === songId) {
      await clearAudio(); // Stop audio playback
      if (onClosePlayer) {
        onClosePlayer(); // Close the player UI
      }
      playSong(null, []); // Reset playing song state
    }
  };

  const renderSong = ({ item, index }) => {
    const isPlaying = currentSong && currentSong.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => playSong(item, likedSongs)}
        className="mb-3"
        activeOpacity={0.8}
      >
        <View
          className={`flex-row items-center p-4 rounded-2xl ${
            isPlaying ? 'bg-emerald-800' : 'bg-gray-800'
          }`}
        >
          <View
            className={`w-12 h-12 rounded-xl ${
              isPlaying ? 'bg-emerald-600' : 'bg-gray-700'
            } justify-center items-center mr-4`}
          >
            <Text
              className={`text-lg font-bold ${
                isPlaying ? 'text-white' : 'text-gray-300'
              }`}
            >
              {index + 1}
            </Text>
          </View>

          <Image
            source={{ uri: item.image?.[2]?.url || item.image?.[2]?.link }}
            className="w-16 h-16 rounded-xl mr-4"
          />

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-base font-bold ${
                isPlaying ? 'text-emerald-300' : 'text-white'
              }`}
            >
              {item.name}
            </Text>
            <Text numberOfLines={1} className="text-gray-400 text-sm mt-1">
              {item.artists?.primary?.[0]?.name ||
                item.primaryArtists?.[0]?.name ||
                'Unknown Artist'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleUnlike(item.id)}
            className="p-3 bg-red-900 rounded-full"
          >
            {/* <Icon name="dislike" size={20} color="#ef4444" /> */}
            <DisLikeIcon name="dislike" size={20} color="#6ee7b7" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-5 pt-4 pb-2">
          <Text className="text-white text-4xl font-bold">Liked Songs</Text>
          <Text className="text-gray-400 text-base mt-2">
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
          {likedSongs.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <View className="bg-gray-800 p-8 rounded-full mb-6">
                <Icon name="heart" size={64} color="#6b7280" />
              </View>
              <Text className="text-gray-300 text-xl font-semibold text-center">
                No liked songs yet
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Start liking songs to see them here
              </Text>
            </View>
          ) : (
            <FlatList
              data={likedSongs}
              renderItem={renderSong}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20, paddingBottom: 300 }}
            />
          )}
      </SafeAreaView>
    </View>
  );
}
