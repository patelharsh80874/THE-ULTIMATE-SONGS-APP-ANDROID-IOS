// import React, { useState, useEffect } from 'react';
// import { Dimensions } from 'react-native';
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   RefreshControl,
//   StatusBar,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MusicIcon } from '../components/icons';
// import LanguageDropdown from '../components/LanguageDropdown';
// import HorizontalSongList from '../components/HorizontalSongList';
// import Section from '../components/Section';
// import { fetchSongs, fetchModules } from '../services/api';

// export default function Home({
//   playSong,
//   currentSong,
//   likedSongs,
//   updateLikedSongs,
//   openPlaylistDetails,
//   openAlbumDetails,
// }) {
//   const [selectedLanguage, setSelectedLanguage] = useState('hindi');
//   const [songs, setSongs] = useState([]);
//   const [modules, setModules] = useState({
//     albums: [],
//     playlists: [],
//     charts: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const { width } = Dimensions.get('window');

//   useEffect(() => {
//     loadData();
//   }, [selectedLanguage]);

//   const loadData = async () => {
//     setLoading(true);
//     const [songsData, modulesData] = await Promise.all([
//       fetchSongs(selectedLanguage),
//       fetchModules(selectedLanguage),
//     ]);
//     setSongs(songsData);
//     setModules(modulesData);
//     setLoading(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 bg-slate-950 justify-center items-center">
//         <ActivityIndicator size="large" color="#10b981" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-slate-950">
//       <StatusBar barStyle="light-content" backgroundColor="#020617" />
//       <SafeAreaView edges={['top']} className="flex-1">
//         {/* Premium Header */}
//         <View className="px-6 pt-6 pb-6">
//           <View className="flex-row items-center justify-between mb-2">
//             <View className="flex-row items-center gap-4">
//               <View className="w-14 h-14 bg-emerald-500 rounded-3xl items-center justify-center shadow-lg shadow-emerald-700/50">
//                 <MusicIcon size={24} color="#10b981" filled />
//               </View>

//               <View>
//                 <Text className="text-gray-400 text-xs font-semibold tracking-wide uppercase">
//                   Welcome to
//                 </Text>
//                 <Text
//                   className="text-white text-4xl font-extrabold tracking-tight"
//                   style={{ letterSpacing: 0.8 }}
//                 >
//                   The Ultimate
//                 </Text>
//               </View>
//             </View>

//             <View className="items-center">
//               <Text className="text-emerald-400 font-semibold tracking-wide text-xs">
//                 Made by
//               </Text>
//               <Text className="text-emerald-400 font-bold text-lg tracking-wider">
//                 Harsh Patel
//               </Text>
//             </View>
//           </View>

//           <View className="flex-row items-center gap-3">
//             <View
//               className="h-1 rounded-full"
//               style={{ width: width / 6, backgroundColor: '#10b981' }}
//             />
//             <Text className="text-emerald-400 text-4xl font-bold tracking-wide">
//               Songs
//             </Text>
//           </View>

//           <LanguageDropdown
//             selected={selectedLanguage}
//             onSelect={setSelectedLanguage}
//           />
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#10b981"
//             />
//           }
//         >
//           <View className="px-6 pb-32">
//             <Section title="Trending Songs" icon="fire">
//               <HorizontalSongList
//                 songs={songs}
//                 onPlay={song => playSong(song, songs)}
//                 currentSong={currentSong}
//                 likedSongs={likedSongs}
//                 updateLikedSongs={updateLikedSongs}
//               />
//             </Section>

//             <Section title="Top Charts" icon="chart">
//               <HorizontalSongList
//                 songs={modules.charts}
//                 onCardPress={openPlaylistDetails}
//                 currentSong={currentSong}
//                 isChart={true}
//               />
//             </Section>

//             <Section title="Curated Playlists" icon="playlist">
//               <HorizontalSongList
//                 songs={modules.playlists}
//                 onCardPress={openPlaylistDetails}
//                 currentSong={currentSong}
//                 isPlaylist={true}
//               />
//             </Section>

//             <Section title="New Albums" icon="disc">
//               <HorizontalSongList
//                 songs={modules.albums}
//                 onCardPress={openAlbumDetails}
//                 currentSong={currentSong}
//                 isAlbum={true}
//               />
//             </Section>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </View>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import {
//   Dimensions,
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   RefreshControl,
//   StatusBar,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MusicIcon } from '../components/icons';
// import LanguageDropdown from '../components/LanguageDropdown';
// import HorizontalSongList from '../components/HorizontalSongList';
// import Section from '../components/Section';
// import { fetchSongs, fetchModules } from '../services/api';

// export default function Home({
//   playSong,
//   currentSong,
//   likedSongs,
//   updateLikedSongs,
//   openPlaylistDetails,
//   openAlbumDetails,
// }) {
//   const [selectedLanguage, setSelectedLanguage] = useState('hindi');
//   const [songs, setSongs] = useState([]);
//   const [modules, setModules] = useState({
//     albums: [],
//     playlists: [],
//     charts: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const { width } = Dimensions.get('window');

//   useEffect(() => {
//     loadData();
//   }, [selectedLanguage]);

//   const loadData = async () => {
//     setLoading(true);
//     const [songsData, modulesData] = await Promise.all([
//       fetchSongs(selectedLanguage),
//       fetchModules(selectedLanguage),
//     ]);
//     setSongs(songsData);
//     setModules(modulesData);
//     setLoading(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 bg-slate-950 justify-center items-center">
//         <ActivityIndicator size="large" color="#10b981" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-slate-950">
//       <StatusBar barStyle="light-content" backgroundColor="#020617" />
//       <SafeAreaView edges={['top']} className="flex-1">
//         {/* Header */}
//         <View className="px-6 pt-3 pb-3">
//           <View className="flex-row items-center justify-evenly mb-2">
//             {/* App Name */}
//             <Text
//               className="text-white text-[6vw]  font-extrabold tracking-wide text-center"
//               style={{ letterSpacing: 0.6 }}
//               numberOfLines={1}
//             >
//               The Ultimate Songs
//             </Text>

//             {/* Made by */}
//             <View className="items-center">
//               <Text className="text-emerald-400 font-semibold tracking-wide text-[2vw]">
//                 Made by
//               </Text>
//               <Text className="text-emerald-400 font-bold text-[3vw] tracking-wider">
//                 Harsh Patel
//               </Text>
//             </View>
//           </View>

//           {/* Language Dropdown */}
//           <View className="mt-1">
//             <LanguageDropdown
//               selected={selectedLanguage}
//               onSelect={setSelectedLanguage}
//             />
//           </View>
//         </View>

//         {/* Songs Sections */}
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#10b981"
//             />
//           }
//         >
//           <View className="px-6 pb-32">
//             <Section title="Trending Songs" icon="fire">
//               <HorizontalSongList
//                 songs={songs}
//                 onPlay={song => playSong(song, songs)}
//                 currentSong={currentSong}
//                 likedSongs={likedSongs}
//                 updateLikedSongs={updateLikedSongs}
//               />
//             </Section>

//             <Section title="Top Charts" icon="chart">
//               <HorizontalSongList
//                 songs={modules.charts}
//                 onCardPress={openPlaylistDetails}
//                 currentSong={currentSong}
//                 isChart
//               />
//             </Section>

//             <Section title="Curated Playlists" icon="playlist">
//               <HorizontalSongList
//                 songs={modules.playlists}
//                 onCardPress={openPlaylistDetails}
//                 currentSong={currentSong}
//                 isPlaylist
//               />
//             </Section>

//             <Section title="New Albums" icon="disc">
//               <HorizontalSongList
//                 songs={modules.albums}
//                 onCardPress={openAlbumDetails}
//                 currentSong={currentSong}
//                 isAlbum
//               />
//             </Section>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </View>
//   );
// }

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageDropdown from '../components/LanguageDropdown';
import Section from '../components/Section';
import HorizontalSongList from '../components/HorizontalSongList';
import {
  fetchSongs,
  fetchModules,
  fetchUniqueSuggestedSongs,
} from '../services/api';
import { GithubIcon, InstagramIcon } from '../components/icons';

export default function Home({
  playSong,
  currentSong,
  likedSongs,
  updateLikedSongs,
  openPlaylistDetails,
  openAlbumDetails,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [songs, setSongs] = useState([]);
  const [songsSug, setSongsSug] = useState([]);
  const [modules, setModules] = useState({
    albums: [],
    playlists: [],
    charts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  // const loadData = async () => {
  //   setLoading(true);
  //   const [songsData, modulesData] = await Promise.all([
  //     fetchSongs(selectedLanguage),
  //     fetchModules(selectedLanguage),
  //   ]);
  //   setSongs(songsData);
  //   setModules(modulesData);
  //   setLoading(false);
  // };

  const loadData = async () => {
    setLoading(true);
    const [songsData, modulesData, songSugData] = await Promise.all([
      fetchSongs(selectedLanguage),
      fetchModules(selectedLanguage),
      fetchUniqueSuggestedSongs(),
    ]);
    setSongs(songsData);
    setModules(modulesData);
    setSongsSug(songSugData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Custom skeleton card
  const SkeletonCard = () => (
    <View
      style={{
        marginRight: 16,
        width: 150,
        height: 170,
        borderRadius: 12,
        backgroundColor: '#233048',
        opacity: 0.28,
      }}
    />
  );

  // Section skeleton loader
  const SkeletonSection = ({ label }) => (
    <View style={{ marginBottom: 32 }}>
      <View
        style={{
          width: 120,
          height: 20,
          backgroundColor: '#253146',
          borderRadius: 8,
          marginBottom: 10,
          opacity: 0.38,
        }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[...Array(5)].map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View
            style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: '#0000',
                  backgroundColor: '#6ee7b7',
                  padding: 5,
                  marginRight: 5,
                  borderRadius: 8,
                  fontSize: 23,
                  fontWeight: 'bold',
                  letterSpacing: 0.6,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                The Ultimate Songs
              </Text>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#10b981',
                    fontWeight: '600',
                    fontSize: 13,
                    letterSpacing: 1,
                  }}
                >
                  Made by
                </Text>
                <Text
                  style={{
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: 15,
                    letterSpacing: 2,
                  }}
                >
                  Harsh Patel
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 4 }}>
              <LanguageDropdown
                selected={selectedLanguage}
                onSelect={setSelectedLanguage}
              />
            </View>
          </View>
          <ScrollView style={{ paddingHorizontal: 24, paddingBottom: 60 }}>
            <SkeletonSection label="Trending Songs" />
            <SkeletonSection label="Top Charts" />
            <SkeletonSection label="Curated Playlists" />
            <SkeletonSection label="New Albums" />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // normal app code - no change needed here
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View
          style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: '#0000',
                backgroundColor: '#6ee7b7',
                padding: 5,
                borderRadius: 8,
                fontSize: 23,
                fontWeight: 'bold',
                letterSpacing: 0.6,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              The Ultimate Songs
            </Text>
            <View
              style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}
            >
              <TouchableOpacity
                onPress={() => {
                  const url = 'https://instagram.com/patelharsh.in';
                  Linking.openURL(url).catch(err =>
                    console.error("Couldn't load page", err),
                  );
                }}
              >
                <InstagramIcon size={30} color="#d62976" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const url = 'https://github.com/patelharsh80874';
                  Linking.openURL(url).catch(err =>
                    console.error("Couldn't load page", err),
                  );
                }}
              >
                <GithubIcon size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ marginTop: 4 }}>
            <LanguageDropdown
              selected={selectedLanguage}
              onSelect={setSelectedLanguage}
            />
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
        >
          <View style={{ paddingHorizontal: 24, paddingBottom: 250 }}>
            <Section title="Trending Songs">
              <HorizontalSongList
                songs={songs}
                onPlay={song => playSong(song, songs)}
                currentSong={currentSong}
                likedSongs={likedSongs}
                updateLikedSongs={updateLikedSongs}
              />
            </Section>
            {songsSug.length > 0 && (
              <Section title={`Songs For You`}>
                <HorizontalSongList
                  songs={songsSug}
                  onPlay={song => playSong(song, songsSug)}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              </Section>
            )}
            <Section title="Top Charts">
              <HorizontalSongList
                songs={modules.charts}
                onCardPress={openPlaylistDetails}
                currentSong={currentSong}
                isChart
              />
            </Section>
            <Section title="Curated Playlists">
              <HorizontalSongList
                songs={modules.playlists}
                onCardPress={openPlaylistDetails}
                currentSong={currentSong}
                isPlaylist
              />
            </Section>
            <Section title="New Albums">
              <HorizontalSongList
                songs={modules.albums}
                onCardPress={openAlbumDetails}
                currentSong={currentSong}
                isAlbum
              />
            </Section>
          </View>
          <Text className="text-gray-300 text-xs p-10 text-center mb-2">
            THE ULTIMATE SONGS is not affiliated with JioSaavn. All trademarks
            and copyrights belong to their respective owners. All media, images,
            and songs are the property of their respective owners. This site is
            for educational purposes only.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
