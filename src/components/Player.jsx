// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {useAudioPro, AudioProState} from 'react-native-audio-pro';
// import {
//   HeartIcon,
//   SkipBackwardIcon,
//   SkipForwardIcon,
//   PlayIcon,
//   PauseIcon,
//   ShuffleIcon,
//   CloseIcon,
// } from './icons';
// import {
//   pauseAudio,
//   resumeAudio,
//   clearAudio,
//   seekToPosition,
// } from '../services/audioService';
// import {likeSong, unlikeSong, isSongLiked} from '../utils/storage';

// export default function Player({
//   song,
//   onNext,
//   onPrev,
//   onClose,
//   updateLikedSongs,
//   likedSongs,
// }) {
//   const {state, position, duration} = useAudioPro();
//   const slideAnim = useRef(new Animated.Value(300)).current;
//   const [isLiked, setIsLiked] = useState(false);
//   const [progressWidth, setProgressWidth] = useState(0);
//   const isPlaying = state === AudioProState.PLAYING;

//   useEffect(() => {
//     setIsLiked(isSongLiked(song.id, likedSongs));
//   }, [song.id, likedSongs]);

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 50,
//       friction: 8,
//     }).start();
//   }, []);

//   const handleClose = () => {
//     Animated.timing(slideAnim, {
//       toValue: 300,
//       duration: 250,
//       useNativeDriver: true,
//     }).start(() => {
//       clearAudio();
//       onClose();
//     });
//   };

//   const togglePlayback = async () => {
//     try {
//       if (isPlaying) {
//         await pauseAudio();
//       } else {
//         await resumeAudio();
//       }
//     } catch (error) {
//       console.error('Playback error:', error);
//     }
//   };

//   const handleLikeToggle = async () => {
//     try {
//       if (isLiked) {
//         await unlikeSong(song.id);
//       } else {
//         await likeSong(song);
//       }
//       await updateLikedSongs();
//     } catch (error) {
//       console.error('Like toggle error:', error);
//     }
//   };

//   const handleProgressBarPress = event => {
//     const touchX = event.nativeEvent.locationX;
//     const percentage = touchX / progressWidth;
//     const newPosition = Math.floor(percentage * duration);
//     seekToPosition(newPosition);
//   };

//   const formatTime = ms => {
//     const totalSeconds = Math.floor(ms / 1000);
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const progressPercentage =
//     duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

//   return (
//     <Animated.View
//       style={{
//         transform: [{translateY: slideAnim}],
//         position: 'absolute',
//         bottom: Platform.OS === 'ios' ? 83 : 65,
//         left: 0,
//         right: 0,
//         zIndex: 50,
//       }}>
//       {/* Solid Background - No Transparency */}
//       <View className="bg-slate-950 rounded-t-3xl shadow-2xl border-t-2 border-emerald-500">
//         <SafeAreaView edges={['bottom']}>
//           <View className="px-5 py-4">
//             {/* Compact Header */}
//             <View className="flex-row items-center justify-between mb-4">
//               <View className="flex-row items-center gap-2">
//                 {isPlaying && (
//                   <View className="w-2 h-2 bg-emerald-500 rounded-full" />
//                 )}
//                 <Text className="text-emerald-400 text-xs font-bold uppercase">
//                   {isPlaying ? 'Playing' : 'Paused'}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={handleClose}
//                 className="bg-gray-900 p-2.5 rounded-full"
//                 activeOpacity={0.7}>
//                 <CloseIcon size={16} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             {/* Compact Album Art & Info */}
//             <View className="flex-row items-center mb-4">
//               {/* Simple Image - No Animation */}
//               <Image
//                 source={{uri: song.image?.[2]?.url || song.image?.[2]?.link}}
//                 className="w-20 h-20 rounded-2xl"
//                 resizeMode="cover"
//               />

//               <View className="flex-1 ml-4">
//                 <Text
//                   numberOfLines={1}
//                   className="text-white font-bold text-lg mb-1">
//                   {song.name}
//                 </Text>
//                 <Text numberOfLines={1} className="text-gray-400 text-sm">
//                   {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
//                 </Text>
//               </View>
//             </View>

//             {/* Compact Progress Bar */}
//             <View className="mb-4">
//               <TouchableWithoutFeedback onPress={handleProgressBarPress}>
//                 <View
//                   onLayout={e => setProgressWidth(e.nativeEvent.layout.width)}
//                   className="h-8 justify-center">
//                   <View className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
//                     <View
//                       className="h-full bg-emerald-500 rounded-full"
//                       style={{width: `${progressPercentage}%`}}
//                     />
//                   </View>
//                 </View>
//               </TouchableWithoutFeedback>

//               <View className="flex-row justify-between mt-1">
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   {formatTime(position)}
//                 </Text>
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   {formatTime(duration)}
//                 </Text>
//               </View>
//             </View>

//             {/* Compact Controls */}
//             <View className="flex-row items-center justify-between">
//               {/* Like Button */}
//               <TouchableOpacity
//                 onPress={handleLikeToggle}
//                 className={`p-2.5 rounded-xl ${
//                   isLiked ? 'bg-emerald-500/20' : 'bg-gray-900'
//                 }`}
//                 activeOpacity={0.7}>
//                 <HeartIcon
//                   size={20}
//                   color={isLiked ? '#10b981' : '#fff'}
//                   filled={isLiked}
//                 />
//               </TouchableOpacity>

//               {/* Previous */}
//               <TouchableOpacity
//                 onPress={onPrev}
//                 className="bg-gray-900 p-3 rounded-xl"
//                 activeOpacity={0.7}>
//                 <SkipBackwardIcon size={22} color="#fff" />
//               </TouchableOpacity>

//               {/* Play/Pause - Compact */}
//               <TouchableOpacity
//                 onPress={togglePlayback}
//                 className="w-16 h-16 rounded-full justify-center items-center bg-emerald-600 shadow-lg"
//                 activeOpacity={0.8}>
//                 {isPlaying ? (
//                   <PauseIcon size={28} color="#fff" />
//                 ) : (
//                   <PlayIcon size={28} color="#fff" />
//                 )}
//               </TouchableOpacity>

//               {/* Next */}
//               <TouchableOpacity
//                 onPress={onNext}
//                 className="bg-gray-900 p-3 rounded-xl"
//                 activeOpacity={0.7}>
//                 <SkipForwardIcon size={22} color="#fff" />
//               </TouchableOpacity>

//               {/* Shuffle */}
//               <TouchableOpacity
//                 className="bg-gray-900 p-2.5 rounded-xl"
//                 activeOpacity={0.7}>
//                 <ShuffleIcon size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </View>
//     </Animated.View>
//   );
// }






// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   TouchableWithoutFeedback,
//   Dimensions,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAudioPro, AudioProState } from 'react-native-audio-pro';
// import {
//   HeartIcon,
//   SkipBackwardIcon,
//   SkipForwardIcon,
//   PlayIcon,
//   PauseIcon,
//   ShuffleIcon,
//   CloseIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
//   DownloadIcon,
// } from './icons';
// import {
//   pauseAudio,
//   resumeAudio,
//   clearAudio,
//   seekToPosition,
// } from '../services/audioService';
// import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';
// import { downloadSong } from '../utils/downloadSong';

// const { height } = Dimensions.get('window');

// export default function Player({
//   song,
//   onNext,
//   onPrev,
//   onClose,
//   updateLikedSongs,
//   likedSongs,
// }) {
//   const { state, position, duration } = useAudioPro();
//   const slideAnim = useRef(new Animated.Value(300)).current;
//   const [isLiked, setIsLiked] = useState(false);
//   const [progressWidth, setProgressWidth] = useState(0);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const heightAnim = useRef(new Animated.Value(0)).current;
//   const isPlaying = state === AudioProState.PLAYING;
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadProgress, setDownloadProgress] = useState(0);

//   useEffect(() => {
//     setIsLiked(isSongLiked(song.id, likedSongs));
//   }, [song.id, likedSongs]);

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 50,
//       duration: 250,
//       friction: 8,
//     }).start();
//   }, []);

//   const handleClose = () => {
//     Animated.timing(slideAnim, {
//       toValue: 300,
//       duration: 250,
//       useNativeDriver: true,
//     }).start(() => {
//       clearAudio();
//       onClose();
//     });
//   };

//   const toggleMinimize = () => {
//     const toValue = isMinimized ? 0 : 1;
//     Animated.spring(heightAnim, {
//       toValue,
//       useNativeDriver: true,
//       tension: 50,
//       duration: 250,
//       friction: 8,
//     }).start();
//     setIsMinimized(!isMinimized);
//   };

//   const togglePlayback = async () => {
//     try {
//       if (isPlaying) {
//         await pauseAudio();
//       } else {
//         await resumeAudio();
//       }
//     } catch (error) {
//       console.error('Playback error:', error);
//     }
//   };

//   const handleLikeToggle = async () => {
//     try {
//       if (isLiked) {
//         await unlikeSong(song.id);
//       } else {
//         await likeSong(song);
//       }
//       await updateLikedSongs();
//     } catch (error) {
//       console.error('Like toggle error:', error);
//     }
//   };



// const handleDownload = async () => {
//   setIsDownloading(true);
//   setDownloadProgress(0);

//   const result = await downloadSong(song, (progress) => setDownloadProgress(progress));

//   if (result.success) {
//     Alert.alert('Download Completed ✅', `Saved to: ${result.path}`);
//   } else {
//     Alert.alert('Download Failed ❌', result.error?.message || 'Something went wrong.');
//   }

//   setIsDownloading(false);
// };








//   const handleProgressBarPress = event => {
//     const touchX = event.nativeEvent.locationX;
//     const percentage = touchX / progressWidth;
//     const newPosition = Math.floor(percentage * duration);
//     seekToPosition(newPosition);
//   };

//   const formatTime = ms => {
//     const totalSeconds = Math.floor(ms / 1000);
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const progressPercentage =
//     duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

//   // Mini Player View
//   if (isMinimized) {
//     return (
//       <Animated.View
//         style={{
//           transform: [{ translateY: slideAnim }],
//           position: 'absolute',
//           bottom: Platform.OS === 'ios' ? 83 : 70,
//           left: 0,
//           right: 0,
//           zIndex: 50,
//         }}
//       >
//         <TouchableOpacity
//           onPress={toggleMinimize}
//           activeOpacity={1}
//           className="bg-[#1e293b]  rounded-t-2xl"
//         >
//           <SafeAreaView edges={['bottom']}>
//             <View className="px-4 py-3 flex-row items-center">
//               {/* Album Art */}
//               <Image
//                 source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
//                 className="w-12 h-12 rounded-xl mr-3"
//                 resizeMode="cover"
//               />

//               {/* Song Info */}
//               <View className="flex-1">
//                 <Text
//                   numberOfLines={1}
//                   className="text-white font-bold text-sm"
//                 >
//                   {song.name}
//                 </Text>
//                 <Text
//                   numberOfLines={1}
//                   className="text-gray-400 text-xs mt-0.5"
//                 >
//                   {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
//                 </Text>
//               </View>
//               {/* Previous */}
//               <TouchableOpacity
//                 onPress={onPrev}
//                 className="bg-gray-900 p-3 ml-2 mr-2 rounded-xl"
//                 activeOpacity={0.7}
//               >
//                 <SkipBackwardIcon size={22} color="#fff" />
//               </TouchableOpacity>
//               {/* Play/Pause */}
//               <TouchableOpacity
//                 onPress={togglePlayback}
//                 className="w-10 h-10 bg-emerald-600 rounded-full items-center justify-center"
//                 activeOpacity={0.8}
//               >
//                 {isPlaying ? (
//                   <PauseIcon size={18} color="#fff" />
//                 ) : (
//                   <PlayIcon size={18} color="#fff" />
//                 )}
//               </TouchableOpacity>
//               {/* Next */}
//               <TouchableOpacity
//                 onPress={onNext}
//                 className="bg-gray-900 ml-2 mr-2 p-3 rounded-xl"
//                 activeOpacity={0.7}
//               >
//                 <SkipForwardIcon size={22} color="#fff" />
//               </TouchableOpacity>

//               {/* Close */}
//               <TouchableOpacity
//                 onPress={handleClose}
//                 className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center"
//                 activeOpacity={0.7}
//               >
//                 <CloseIcon size={14} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             {/* Mini Progress Bar */}
//             <View className="">
//               <TouchableWithoutFeedback onPress={handleProgressBarPress}>
//                 <View
//                   onLayout={e => setProgressWidth(e.nativeEvent.layout.width)}
//                   className=" justify-center"
//                 >
//                   <View className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
//                     <View
//                       className="h-full bg-emerald-500 rounded-full"
//                       style={{ width: `${progressPercentage}%` }}
//                     />
//                   </View>
//                 </View>
//               </TouchableWithoutFeedback>
//             </View>
//           </SafeAreaView>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   }

//   // Full Player View
//   return (
//     <Animated.View
//       style={{
//         transform: [{ translateY: slideAnim }],
//         position: 'absolute',
//         bottom: Platform.OS === 'ios' ? 83 : 65,
//         left: 0,
//         right: 0,
//         zIndex: 50,
//       }}
//     >
//       <View className="bg-[#1e293b] rounded-t-2xl shadow-2xl">
//         <SafeAreaView edges={['bottom']}>
//           <View className="px-5 py-2">
//             {/* Header with Minimize Button */}
//             <View className="flex-row items-center justify-between mb-2">
//               <View className="flex-row items-center gap-2">
//                 {isPlaying && (
//                   <View className="w-2 h-2 bg-emerald-500 rounded-full" />
//                 )}
//                 <Text className="text-emerald-400 text-xs font-bold uppercase">
//                   {isPlaying ? 'Playing' : 'Paused'}
//                 </Text>
//               </View>

//               <View className="flex-row gap-2">
//                 {/* Minimize Button */}
//                 <TouchableOpacity
//                   onPress={toggleMinimize}
//                   className="bg-gray-900 p-2.5 rounded-full"
//                   activeOpacity={0.7}
//                 >
//                   <ChevronDownIcon size={16} color="#fff" />
//                 </TouchableOpacity>

//                 {/* Close Button */}
//                 <TouchableOpacity
//                   onPress={handleClose}
//                   className="bg-gray-900 p-2.5 rounded-full"
//                   activeOpacity={0.7}
//                 >
//                   <CloseIcon size={16} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Album Art & Info */}
//             <View className="flex-row items-center mb-1">
//               <Image
//                 source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
//                 className="w-20 h-20 rounded-lg"
//                 resizeMode="cover"
//               />

//               <View className="flex-1 ml-4">
//                 <Text
//                   numberOfLines={1}
//                   className="text-white font-bold text-lg mb-1"
//                 >
//                   {song.name}
//                 </Text>
//                 <Text numberOfLines={1} className="text-gray-400 text-sm">
//                   {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
//                 </Text>
//               </View>
//             </View>

//             {/* Progress Bar */}
//             <View className="">
//               <TouchableWithoutFeedback onPress={handleProgressBarPress}>
//                 <View
//                   onLayout={e => setProgressWidth(e.nativeEvent.layout.width)}
//                   className="h-8 justify-center"
//                 >
//                   <View className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
//                     <View
//                       className="h-full bg-emerald-500 rounded-full"
//                       style={{ width: `${progressPercentage}%` }}
//                     />
//                   </View>
//                 </View>
//               </TouchableWithoutFeedback>

//               <View className="flex-row justify-between ">
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   {formatTime(position)}
//                 </Text>
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   {formatTime(duration)}
//                 </Text>
//               </View>
//             </View>

//             {/* Controls */}
//             <View className="flex-row items-center justify-between">
//               <TouchableOpacity
//                 onPress={handleLikeToggle}
//                 className={`p-2.5 rounded-xl ${
//                   isLiked ? 'bg-emerald-500/20' : 'bg-gray-900'
//                 }`}
//                 activeOpacity={0.7}
//               >
//                 <HeartIcon
//                   size={20}
//                   color={isLiked ? '#10b981' : '#fff'}
//                   filled={isLiked}
//                 />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={onPrev}
//                 className="bg-gray-900 p-3 rounded-xl"
//                 activeOpacity={0.7}
//               >
//                 <SkipBackwardIcon size={22} color="#fff" />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={togglePlayback}
//                 className="w-16 h-16 rounded-full justify-center items-center bg-emerald-600 shadow-lg"
//                 activeOpacity={0.8}
//               >
//                 {isPlaying ? (
//                   <PauseIcon size={28} color="#fff" />
//                 ) : (
//                   <PlayIcon size={28} color="#fff" />
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={onNext}
//                 className="bg-gray-900 p-3 rounded-xl"
//                 activeOpacity={0.7}
//               >
//                 <SkipForwardIcon size={22} color="#fff" />
//               </TouchableOpacity>

//               {/* <TouchableOpacity
//                 onPress={() => downloadSong(song)}
//                 className="bg-gray-900 p-2.5 rounded-xl"
//                 activeOpacity={0.7}
//               >
//                 <DownloadIcon size={20} color="#fff" />
//               </TouchableOpacity> */}
//               <TouchableOpacity
//                 onPress={handleDownload}
//                 className={`p-2.5 rounded-xl ${
//                   isDownloading ? 'bg-gray-700' : 'bg-gray-900'
//                 }`}
//                 activeOpacity={isDownloading ? 1 : 0.7}
//                 disabled={isDownloading}
//               >
//                 {isDownloading ? (
//                   <Text className="text-white text-xs">
//                     {Math.floor(downloadProgress)}%
//                   </Text>
//                 ) : (
//                   <DownloadIcon size={20} color="#fff" />
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </View>
//     </Animated.View>
//   );
// }














import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPro, AudioProState } from 'react-native-audio-pro';
import {
  HeartIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
  PlayIcon,
  PauseIcon,
  ShuffleIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
} from './icons';
import {
  pauseAudio,
  resumeAudio,
  clearAudio,
  seekToPosition,
} from '../services/audioService';
import { likeSong, unlikeSong, isSongLiked } from '../utils/storage';
import { downloadSong } from '../utils/downloadSong';

const { height } = Dimensions.get('window');

export default function Player({
  song,
  onNext,
  onPrev,
  onClose,
  updateLikedSongs,
  likedSongs,
}) {
  const { state, position, duration } = useAudioPro();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isLiked, setIsLiked] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const isPlaying = state === AudioProState.PLAYING;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    setIsLiked(isSongLiked(song.id, likedSongs));
  }, [song.id, likedSongs]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      clearAudio();
      onClose();
    });
  };

  const toggleMinimize = () => {
    const toScale = isMinimized ? 1 : 0.96;
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: isMinimized ? 0 : 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: toScale,
        tension: 30,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setIsMinimized(!isMinimized);
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await pauseAudio();
      } else {
        await resumeAudio();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikeSong(song.id);
      } else {
        await likeSong(song);
      }
      await updateLikedSongs();
    } catch (error) {
      console.error('Like toggle error:', error);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const result = await downloadSong(song, (progress) => setDownloadProgress(progress));

    if (result.success) {
      Alert.alert('Download Completed ✅', `Saved to: ${result.path}`);
    } else {
      Alert.alert('Download Failed ❌', result.error?.message || 'Something went wrong.');
    }
    setIsDownloading(false);
  };

  const handleProgressBarPress = (event) => {
    const touchX = event.nativeEvent.locationX;
    const percentage = touchX / progressWidth;
    const newPosition = Math.floor(percentage * duration);
    seekToPosition(newPosition);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercentage =
    duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  // Mini Player View
  if (isMinimized) {
    return (
      <Animated.View
        style={{
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 83 : 65,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <TouchableOpacity
          onPress={toggleMinimize}
          activeOpacity={1}
          className="bg-[#1e293b] rounded-t-xl"
        >
          <SafeAreaView edges={['bottom']}>
            <View className="px-4 py-3 flex-row items-center">
              {/* Album Art */}
              <Image
                source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
                className="w-12 h-12 rounded-xl mr-3"
                resizeMode="cover"
              />

              {/* Song Info */}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-white font-bold text-sm"
                >
                  {song.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-gray-400 text-xs mt-0.5"
                >
                  {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
                </Text>
              </View>
              {/* Previous */}
              <TouchableOpacity
                onPress={onPrev}
                className="bg-gray-900 p-3 ml-2 mr-2 rounded-xl"
                activeOpacity={0.7}
              >
                <SkipBackwardIcon size={22} color="#fff" />
              </TouchableOpacity>
              {/* Play/Pause */}
              <TouchableOpacity
                onPress={togglePlayback}
                className="w-10 h-10 bg-emerald-600 rounded-full items-center justify-center"
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <PauseIcon size={18} color="#fff" />
                ) : (
                  <PlayIcon size={18} color="#fff" />
                )}
              </TouchableOpacity>
              {/* Next */}
              <TouchableOpacity
                onPress={onNext}
                className="bg-gray-900 ml-2 mr-2 p-3 rounded-xl"
                activeOpacity={0.7}
              >
                <SkipForwardIcon size={22} color="#fff" />
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <CloseIcon size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Mini Progress Bar */}
            <View className="">
              <TouchableWithoutFeedback onPress={handleProgressBarPress}>
                <View
                  onLayout={e => setProgressWidth(e.nativeEvent.layout.width)}
                  className=" justify-center"
                >
                  <View className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Full Player View
  return (
    <Animated.View
      style={{
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
        opacity: fadeAnim,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 83 : 65,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <View className="bg-[#1e293b] rounded-t-xl shadow-2xl">
        <SafeAreaView edges={['bottom']}>
          <View className="px-5 py-2">
            {/* Header with Minimize Button */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                {isPlaying && (
                  <View className="w-2 h-2 bg-emerald-500 rounded-full" />
                )}
                <Text className="text-emerald-400 text-xs font-bold uppercase">
                  {isPlaying ? 'Playing' : 'Paused'}
                </Text>
              </View>

              <View className="flex-row gap-2">
                {/* Minimize Button */}
                <TouchableOpacity
                  onPress={toggleMinimize}
                  className="bg-gray-900 p-2.5 rounded-full"
                  activeOpacity={0.7}
                >
                  <ChevronDownIcon size={16} color="#fff" />
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-gray-900 p-2.5 rounded-full"
                  activeOpacity={0.7}
                >
                  <CloseIcon size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Album Art & Info */}
            <View className="flex-row items-center mb-1">
              <Image
                source={{ uri: song.image?.[2]?.url || song.image?.[2]?.link }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />

              <View className="flex-1 ml-4">
                <Text
                  numberOfLines={1}
                  className="text-white font-bold text-lg mb-1"
                >
                  {song.name}
                </Text>
                <Text numberOfLines={1} className="text-gray-400 text-sm">
                  {song.artists?.primary?.[0]?.name || 'Unknown Artist'}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="">
              <TouchableWithoutFeedback onPress={handleProgressBarPress}>
                <View
                  onLayout={e => setProgressWidth(e.nativeEvent.layout.width)}
                  className="h-8 justify-center"
                >
                  <View className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <View className="flex-row justify-between ">
                <Text className="text-gray-500 text-xs font-semibold">
                  {formatTime(position)}
                </Text>
                <Text className="text-gray-500 text-xs font-semibold">
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleLikeToggle}
                className={`p-2.5 rounded-xl ${
                  isLiked ? 'bg-emerald-500/20' : 'bg-gray-900'
                }`}
                activeOpacity={0.7}
              >
                <HeartIcon
                  size={20}
                  color={isLiked ? '#10b981' : '#fff'}
                  filled={isLiked}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onPrev}
                className="bg-gray-900 p-3 rounded-xl"
                activeOpacity={0.7}
              >
                <SkipBackwardIcon size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayback}
                className="w-16 h-16 rounded-full justify-center items-center bg-emerald-600 shadow-lg"
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <PauseIcon size={28} color="#fff" />
                ) : (
                  <PlayIcon size={28} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onNext}
                className="bg-gray-900 p-3 rounded-xl"
                activeOpacity={0.7}
              >
                <SkipForwardIcon size={22} color="#fff" />
              </TouchableOpacity>

              {/* Download Button */}
              <TouchableOpacity
                onPress={handleDownload}
                className={`p-2.5 rounded-xl ${
                  isDownloading ? 'bg-gray-700' : 'bg-gray-900'
                }`}
                activeOpacity={isDownloading ? 1 : 0.7}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Text className="text-white text-xs">
                    {Math.floor(downloadProgress)}%
                  </Text>
                ) : (
                  <DownloadIcon size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Animated.View>
  );
}

