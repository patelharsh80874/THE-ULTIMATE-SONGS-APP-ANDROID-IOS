import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageDropdown from '../components/LanguageDropdown';
import Section from '../components/Section';
import HorizontalSongList from '../components/HorizontalSongList';
import {
  fetchSongs,
  fetchModules,
  fetchUniqueSuggestedSongs,
  fetchArtistsRadios,
  fetchArtitsRadioSongs,
  fetchUniqueArtists,
  fetchStarringArtists,
  getTrendingLabels,
} from '../services/api';
import { GithubIcon, InstagramIcon, SettingsIcon } from '../components/icons';
import {
  getRecentlyPlayedSongs,
  getAppSettings,
  saveAppSettings,
  IMAGE_QUALITIES,
  AUDIO_QUALITIES,
  RADIO_QUANTITIES,
} from '../utils/storage';
import { fetchFeaturedRadios } from '../services/api';
import HorizontalRadioList from '../components/HorizontalRadioList';
import HorizontalLabelList from '../components/HorizontalLabelList';
import { fetchRadioSongs } from '../services/api';
import SongOptionsBottomSheet from '../components/SongOptionsBottomSheet';
import {
  pauseAudio,
  resumeAudio,
  clearAudio,
  seekToPosition,
} from '../services/audioService';

export default function Home({
  playSong,
  handleNext,
  handleClosePlayer,
  currentIndexRef,
  stationId,
  setStationId,
  currentSong,
  setCurrentSong,
  likedSongs,
  updateLikedSongs,
  openPlaylistDetails,
  openAlbumDetails,
  songQueue,
  setSongQueue,
  hasRadioQueue,
  setHasRadioQueue,
  settings,
  setSettings,
  handleSaveSettings,
  isSettingsVisible,
  setIsSettingsVisible,
  CustomPlaylistUpdated,
  setCustomPlaylistUpdated,
  openLabelDetails,
  openAlbumPage,
  openPlaylistPage,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [songs, setSongs] = useState([]);
  const [songsSug, setSongsSug] = useState([]);
  const [radioStations, setRadioStations] = useState([]);
  const [RadioSongs, setRadioSongs] = useState([]);
  const [artistRadioStations, setArtistRadioStations] = useState([]);
  const [artistRadioSongs, setArtistRadioSongs] = useState([]);
  const [trendingArtistRadioStations, setTrendingArtistRadioStations] =
    useState([]);
  const [trendingArtistRadioSongs, setTrendingArtistRadioSongs] = useState([]);
  const [starringArtistRadioStations, setStarringArtistRadioStations] =
    useState([]);
  const [starringArtistRadioSongs, setStarringArtistRadioSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [modules, setModules] = useState({
    albums: [],
    playlists: [],
    charts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [trendingLabels, setTrendingLabels] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  useEffect(() => {
    async function loadTrendingLabels() {
      const data = await getTrendingLabels(selectedLanguage);
      setTrendingLabels(data);
    }
    loadTrendingLabels();
  }, [selectedLanguage]);

  useEffect(() => {
    async function loadRadios() {
      const radios = await fetchFeaturedRadios(selectedLanguage);
      setRadioStations(radios);
      // console.log(radios)

      const Artitsradios = await fetchArtistsRadios(selectedLanguage);
      setArtistRadioStations(Artitsradios);
      // console.log(Artitsradios)

      const UniqueArtists = await fetchUniqueArtists(selectedLanguage);
      setTrendingArtistRadioStations(UniqueArtists);
      // console.log(UniqueArtists)

      const StarringArtists = await fetchStarringArtists(selectedLanguage);
      setStarringArtistRadioStations(StarringArtists);
      // console.log(StarringArtists)
    }
    loadRadios();
  }, [selectedLanguage]);

  async function FinalfetchRadioSongs(language, radioId) {
    // const radioSongs = await fetchRadioSongs(language, radioId);
    const { fullSongs, stationId } = await fetchRadioSongs(language, radioId);
    setRadioSongs(fullSongs);
    setStationId(stationId);
    setHasRadioQueue(true);
    clearAudio();
    handleClosePlayer();
    playSong(fullSongs.data[0], fullSongs.data);
  }

  async function FinalfetchArtitsRadioSongs(language, radioId) {
    const { fullSongs, stationId } = await fetchArtitsRadioSongs(radioId);
    setArtistRadioSongs(fullSongs);
    setStationId(stationId);
    // console.log(RadioSongs.data[0])
    setHasRadioQueue(true);
    clearAudio();
    handleClosePlayer();
    playSong(fullSongs.data[0], fullSongs.data);
  }

  async function FinalfetchTrendingArtitsRadioSongs(language, radioId) {
    const { fullSongs, stationId } = await fetchArtitsRadioSongs(radioId);
    setTrendingArtistRadioSongs(fullSongs);
    setStationId(stationId);
    // console.log(RadioSongs.data[0])
    setHasRadioQueue(true);
    clearAudio();
    handleClosePlayer();
    playSong(fullSongs.data[0], fullSongs.data);
  }

  async function FinalfetchStarringArtitsRadioSongs(language, radioId) {
    const { fullSongs, stationId } = await fetchArtitsRadioSongs(radioId);
    setStarringArtistRadioSongs(fullSongs);
    setStationId(stationId);
    // console.log(RadioSongs.data[0])
    setHasRadioQueue(true);
    clearAudio();
    handleClosePlayer();
    playSong(fullSongs.data[0], fullSongs.data);
  }

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

  // -----------------------------
  // ⚙️ Settings Modal UI
  // -----------------------------
  const RenderSettingsModal = () => (
    <Modal
      visible={isSettingsVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setIsSettingsVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>App Settings</Text>

          <Text style={[styles.optionLabel, { marginTop: 20 }]}>
            📻 Radio Songs Quantity
          </Text>

          {RADIO_QUANTITIES.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSettings({ ...settings, radioSongQuantity: i })}
              style={[
                styles.optionBtn,
                settings.radioSongQuantity === i && styles.optionSelected,
              ]}
            >
              <Text
                style={{
                  color: settings.radioSongQuantity === i ? '#10b981' : '#ccc',
                  fontWeight: '600',
                }}
              >
                {q} Songs
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.optionLabel, { marginTop: 20 }]}>
            🎵 Audio Quality
          </Text>
          {AUDIO_QUALITIES.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSettings({ ...settings, audioQualityIndex: i })}
              style={[
                styles.optionBtn,
                settings.audioQualityIndex === i && styles.optionSelected,
              ]}
            >
              <Text
                style={{
                  color: settings.audioQualityIndex === i ? '#10b981' : '#ccc',
                  fontWeight: '600',
                }}
              >
                {q}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.optionLabel, { marginTop: 20 }]}>
            🖼️ Image Quality
          </Text>
          {IMAGE_QUALITIES.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSettings({ ...settings, imageQualityIndex: i })}
              style={[
                styles.optionBtn,
                settings.imageQualityIndex === i && styles.optionSelected,
              ]}
            >
              <Text
                style={{
                  color: settings.imageQualityIndex === i ? '#10b981' : '#ccc',
                  fontWeight: '600',
                }}
              >
                {q}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={handleSaveSettings} style={styles.saveBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
              gap: 3,
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

            {/* ⚙️ Settings Icon */}
            <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
              <SettingsIcon size={26} color="#10b981" />
            </TouchableOpacity>
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
                  setCurrentSong={setCurrentSong}
                  likedSongs={likedSongs}
                  songQueue={songQueue}
                  handleNext={handleNext}
                  currentIndexRef={currentIndexRef}
                  setSongQueue={setSongQueue}
                  hasRadioQueue={hasRadioQueue}
                  setHasRadioQueue={setHasRadioQueue}
                  updateLikedSongs={updateLikedSongs}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}
            <Section title="Trending Songs">
              <HorizontalSongList
                songs={songs}
                onPlay={song => playSong(song, songs)}
                currentSong={currentSong}
                setCurrentSong={setCurrentSong}
                likedSongs={likedSongs}
                songQueue={songQueue}
                handleNext={handleNext}
                currentIndexRef={currentIndexRef}
                setSongQueue={setSongQueue}
                hasRadioQueue={hasRadioQueue}
                setHasRadioQueue={setHasRadioQueue}
                updateLikedSongs={updateLikedSongs}
                settings={settings}
                CustomPlaylistUpdated={CustomPlaylistUpdated}
                setCustomPlaylistUpdated={setCustomPlaylistUpdated}
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
                  setCurrentSong={setCurrentSong}
                  likedSongs={likedSongs}
                  songQueue={songQueue}
                  handleNext={handleNext}
                  currentIndexRef={currentIndexRef}
                  setSongQueue={setSongQueue}
                  hasRadioQueue={hasRadioQueue}
                  setHasRadioQueue={setHasRadioQueue}
                  updateLikedSongs={updateLikedSongs}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}
            <Section title="Top Charts">
              <HorizontalSongList
                songs={modules.charts}
                // onCardPress={openPlaylistDetails}
                onCardPress={openPlaylistPage}
                currentSong={currentSong}
                songQueue={songQueue}
                setCurrentSong={setCurrentSong}
                setSongQueue={setSongQueue}
                currentIndexRef={currentIndexRef}
                handleNext={handleNext}
                hasRadioQueue={hasRadioQueue}
                setHasRadioQueue={setHasRadioQueue}
                settings={settings}
                CustomPlaylistUpdated={CustomPlaylistUpdated}
                setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                isChart
                openPlaylistPage={openPlaylistPage}
              />
            </Section>
            <Section title="Curated Playlists">
              <HorizontalSongList
                songs={modules.playlists}
                // onCardPress={openPlaylistDetails}
                onCardPress={openPlaylistPage}
                currentSong={currentSong}
                handleNext={handleNext}
                songQueue={songQueue}
                setCurrentSong={setCurrentSong}
                currentIndexRef={currentIndexRef}
                setSongQueue={setSongQueue}
                hasRadioQueue={hasRadioQueue}
                setHasRadioQueue={setHasRadioQueue}
                settings={settings}
                CustomPlaylistUpdated={CustomPlaylistUpdated}
                setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                isPlaylist
                openPlaylistPage={openPlaylistPage}
              />
            </Section>
            {radioStations.length > 0 && (
              <Section title="Radio Stations">
                <HorizontalRadioList
                  radios={radioStations}
                  onRadioPress={(language, id) =>
                    FinalfetchRadioSongs(language, id)
                  }
                  songQueue={songQueue}
                  setSongQueue={setSongQueue}
                  hasRadioQueue={hasRadioQueue}
                  setCurrentSong={setCurrentSong}
                  currentIndexRef={currentIndexRef}
                  setHasRadioQueue={setHasRadioQueue}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}

            {artistRadioStations.length > 0 && (
              <Section title="Top Artists Radio Stations">
                <HorizontalRadioList
                  radios={artistRadioStations}
                  onRadioPress={(language, id) =>
                    FinalfetchArtitsRadioSongs(language, id)
                  }
                  songQueue={songQueue}
                  setSongQueue={setSongQueue}
                  setCurrentSong={setCurrentSong}
                  currentIndexRef={currentIndexRef}
                  hasRadioQueue={hasRadioQueue}
                  setHasRadioQueue={setHasRadioQueue}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}

            {trendingArtistRadioStations.length > 0 && (
              <Section title="Trending Artists Radio Stations">
                <HorizontalRadioList
                  radios={trendingArtistRadioStations}
                  onRadioPress={(language, id) =>
                    FinalfetchTrendingArtitsRadioSongs(language, id)
                  }
                  songQueue={songQueue}
                  setSongQueue={setSongQueue}
                  hasRadioQueue={hasRadioQueue}
                  setCurrentSong={setCurrentSong}
                  currentIndexRef={currentIndexRef}
                  setHasRadioQueue={setHasRadioQueue}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}

            {starringArtistRadioStations.length > 0 && (
              <Section title="Actors Radio Stations">
                <HorizontalRadioList
                  radios={starringArtistRadioStations}
                  onRadioPress={(language, id) =>
                    FinalfetchStarringArtitsRadioSongs(language, id)
                  }
                  songQueue={songQueue}
                  setSongQueue={setSongQueue}
                  hasRadioQueue={hasRadioQueue}
                  currentIndexRef={currentIndexRef}
                  setCurrentSong={setCurrentSong}
                  setHasRadioQueue={setHasRadioQueue}
                  settings={settings}
                  CustomPlaylistUpdated={CustomPlaylistUpdated}
                  setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                />
              </Section>
            )}

            {trendingLabels.length > 0 && (
              <Section title="Trending Labels">
                <HorizontalLabelList
                  labels={trendingLabels}
                  loading={false}
                  onPressLabel={label => openLabelDetails(label)}
                />
              </Section>
            )}

            <Section title="New Albums">
              <HorizontalSongList
                songs={modules.albums}
                // onCardPress={openAlbumDetails}
                onCardPress={openAlbumPage}
                currentSong={currentSong}
                songQueue={songQueue}
                setSongQueue={setSongQueue}
                setCurrentSong={setCurrentSong}
                currentIndexRef={currentIndexRef}
                hasRadioQueue={hasRadioQueue}
                setHasRadioQueue={setHasRadioQueue}
                settings={settings}
                openAlbumPage={openAlbumPage}
                CustomPlaylistUpdated={CustomPlaylistUpdated}
                setCustomPlaylistUpdated={setCustomPlaylistUpdated}
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
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              marginBottom: 10,
            }}
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
                const url =
                  'https://github.com/patelharsh80874/THE-ULTIMATE-SONGS-APP-ANDROID-IOS';
                Linking.openURL(url).catch(err =>
                  console.error("Couldn't load page", err),
                );
              }}
            >
              <GithubIcon size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              const url =
                'https://github.com/patelharsh80874/THE-ULTIMATE-SONGS-APP-ANDROID-IOS';
              Linking.openURL(url).catch(err =>
                console.error("Couldn't load page", err),
              );
            }}
          >
            {/* <GithubIcon size={30} color="#fff" /> */}
            <Text className="text-gray-300 text-xs p-10 text-center mb-2">
              Check GitHub For Reguler Updates And New Release
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {RenderSettingsModal()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionLabel: {
    color: '#9ca3af',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
  },
  optionBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
});
