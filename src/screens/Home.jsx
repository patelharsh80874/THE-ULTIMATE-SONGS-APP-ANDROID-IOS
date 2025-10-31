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
import { getRecentlyPlayedSongs } from '../utils/storage';

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
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
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

  useEffect(() => {
    (async () => {
      const recents = await getRecentlyPlayedSongs();
      setRecentlyPlayed(recents);
    })();
  }, [currentSong]);

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
            style={{ paddingHorizontal: 24, paddingTop: 0, paddingBottom: 0 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 0,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  // backgroundColor: '#6ee7b7',
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
                    fontSize: 10,
                    letterSpacing: 1,
                  }}
                >
                  Made by
                </Text>
                <Text
                  style={{
                    color: '#10b981',
                    fontWeight: 'bold',
                    fontSize: 10,
                    letterSpacing: 1,
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
          style={{ paddingHorizontal: 24, paddingTop: 0, paddingBottom: 0 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
            }}
          >
            <Text
              style={{
                color: '#fff',
                // backgroundColor: '#6ee7b7',
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
            {/* <View
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
            </View> */}
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
            {recentlyPlayed.length > 0 && (
              <Section title="Recently Played">
                <HorizontalSongList
                  songs={recentlyPlayed}
                  onPlay={song => playSong(song, recentlyPlayed)}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              </Section>
            )}
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
              // <Section title={`Songs For You`}>
              //   <HorizontalSongList
              //     songs={songsSug}
              //     onPlay={song => playSong(song, songsSug)}
              //     currentSong={currentSong}
              //     likedSongs={likedSongs}
              //     updateLikedSongs={updateLikedSongs}
              //   />
              // </Section>
              <Section>
                <View style={{ marginBottom: 8, marginTop: -20 }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}
                  >
                    Songs For You
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}
                  >
                    (based on your liked songs)
                  </Text>
                </View>

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
          <View style={{ alignItems: 'center',justifyContent:'center', flexDirection: 'row', gap: 10,marginBottom:10 }}>
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
                const url = 'https://github.com/patelharsh80874/THE-ULTIMATE-SONGS-APP-ANDROID-IOS';
                Linking.openURL(url).catch(err =>
                  console.error("Couldn't load page", err),
                );
              }}
            >
              <GithubIcon size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
