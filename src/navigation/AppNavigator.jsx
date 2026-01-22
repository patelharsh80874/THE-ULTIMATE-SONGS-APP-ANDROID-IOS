import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Settings, StyleSheet, View } from 'react-native';
import { AudioPro, AudioProEventType } from 'react-native-audio-pro';
import {
  HomeIcon,
  SearchIcon,
  MusicIcon,
  UserIcon,
  DiscIcon,
  HeartIcon,
} from '../components/icons';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Playlists from '../screens/Playlists';
import PlaylistDetails from '../screens/PlaylistDetails';
import CustomPlaylistDetails from '../screens/CustomPlaylistDetails';
import Artists from '../screens/Artists';
import ArtistDetails from '../screens/ArtistDetails';
import Albums from '../screens/Albums';
import AlbumDetails from '../screens/AlbumDetails';
import LabelDetails from '../screens/LabelDetails';
import Likes from '../screens/Likes';
import Player from '../components/Player';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  addToRecentlyPlayed,
  getLikedSongs,
  getAppSettings,
  IMAGE_QUALITIES,
  AUDIO_QUALITIES,
  saveAppSettings,
} from '../utils/storage';
import { playTrack } from '../services/audioService';
import { Text } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

export const navigationRef = createNavigationContainerRef();

export var settingsRead = {};
// export var currentIndexRef = useRef(0);

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  const [currentSong, setCurrentSong] = useState(null);
  const [songQueue, setSongQueue] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [CustomPlaylistUpdated, setCustomPlaylistUpdated] = useState(false);
  const [stationId, setStationId] = useState(null);

  const [hasRadioQueue, setHasRadioQueue] = useState(false);

  // Home states
  const [currentHomeScreen, setCurrentHomeScreen] = useState('Home');
  const [selectedHomePlaylistId, setSelectedHomePlaylistId] = useState(null);
  const [selectedHomeAlbumId, setSelectedHomeAlbumId] = useState(null);

  // Playlist states
  const [currentPlaylistScreen, setCurrentPlaylistScreen] =
    useState('Playlists');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Likes (Custom Playlist) states
  const [currentLikesScreen, setCurrentLikesScreen] = useState('Likes');
  const [selectedCustomPlaylistId, setSelectedCustomPlaylistId] =
    useState(null);

  // Artist states
  const [currentArtistScreen, setCurrentArtistScreen] = useState('Artists');
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  // Album states
  const [currentAlbumScreen, setCurrentAlbumScreen] = useState('Albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  // Label states inside Home tab
  const [currentLabelScreen, setCurrentLabelScreen] = useState('Home');
  const [selectedLabelData, setSelectedLabelData] = useState(null);

  // ⚙️ Settings modal
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const [settings, setSettings] = useState({
    imageQualityIndex: 2, // default (500x500)
    audioQualityIndex: 4, // default (320kbps)
    radioSongQuantity: 1, // 👉 default = 10 (index 1)
  });

  // Load saved settings once
  useEffect(() => {
    (async () => {
      const saved = await getAppSettings();
      setSettings(saved);
      settingsRead = saved;
    })();
  }, []);

  const handleSaveSettings = async () => {
    await saveAppSettings(settings);
    settingsRead = settings;
    setIsSettingsVisible(false);
  };

  var currentIndexRef = useRef(0);

  useEffect(() => {
    loadLikedSongs();

    const subscription = AudioPro.addEventListener(event => {
      if (event.type === AudioProEventType.REMOTE_NEXT) {
        handleNext();
      } else if (event.type === AudioProEventType.REMOTE_PREV) {
        handlePrev();
      } else if (event.type === AudioProEventType.TRACK_ENDED) {
        handleNext();
      }
    });

    return () => subscription.remove();
  }, [songQueue]);

  const loadLikedSongs = async () => {
    const liked = await getLikedSongs();
    setLikedSongs(liked);
  };

  // ✅ Add to Queue
  const handleAddToQueue = song => {
    if (!songQueue || !Array.isArray(songQueue)) return;

    const currentIndex = songQueue.findIndex(s => s.id === currentSong?.id);
    const newQueue = [...songQueue.filter(s => s.id !== song.id)]; // avoid duplicates
    // insert just after the currently playing song
    if (currentIndex >= 0) newQueue.splice(currentIndex + 1, 0, song);
    else newQueue.push(song);
    setSongQueue(newQueue);
  };

  // const playSong = async (song, queue = []) => {
  //   setCurrentSong(song);
  //   setSongQueue(queue);
  //   const index = queue.findIndex(s => s.id === song.id);
  //   currentIndexRef.current = index >= 0 ? index : 0;
  //   await playTrack(song,settings);
  // };

  const playSong = async (
    song,
    queue = [],
    PlayFullPlaylist,
    SelectFromQueue,
  ) => {
    if (PlayFullPlaylist) {
      setCurrentSong(song);
      setSongQueue(queue);
      const index = queue.findIndex(s => s.id === song.id);
      currentIndexRef.current = index >= 0 ? index : 0;
      await playTrack(song, settings);
    } else {
      if (SelectFromQueue) {
        setCurrentSong(song);
        setSongQueue(queue);
        const index = queue.findIndex(s => s.id === song.id);
        currentIndexRef.current = index >= 0 ? index : 0;
        await playTrack(song, settings);
        return; // 🚀 important → stop here
      }
      // 1) Check if song already exists inside queue
      const alreadyExists = songQueue.find(s => s.id === song.id);

      if (alreadyExists) {
        console.log('Song already exists in queue → running alternate flow');

        // Run your alternate logic
        handleAddToQueue(song);
        setCurrentSong(song);
        await playTrack(song, settings);

        return; // 🚀 important → stop here
      }

      // 2) Normal flow (song does NOT exist in queue)
      // console.log('Song not found → running normal flow');

      // setCurrentSong(song);
      // setSongQueue(queue);

      // const index = queue.findIndex(s => s.id === song.id);
      // currentIndexRef.current = index >= 0 ? index : 0;

      // await playTrack(song, settings);

      

      // 2) Normal flow (song does NOT exist in queue)

      setCurrentSong(song);

      // 🔥 STEP 1: find index of current song
      const index = queue.findIndex(s => s.id === song.id);

      // 🔥 STEP 2: take songs from current song onward
      const slicedQueue =
        index >= 0 ? queue.slice(index, index + 100) : queue.slice(0, 100);

      // 🔥 STEP 3: set queue (max 100 songs)
      setSongQueue(slicedQueue);

      // 🔥 STEP 4: update current index
      currentIndexRef.current = 0;

      // 🔥 STEP 5: play
      await playTrack(song, settings);
    }
  };

  // const playSong = async (song, queue = []) => {
  //   // 1) Check if song already exists inside queue
  //   const alreadyExists = songQueue.find(s => s.id === song.id);

  //   if (alreadyExists) {
  //     console.log('Song already exists in queue → running alternate flow');

  //     // Run your alternate logic
  //     handleAddToQueue(song);
  //     setCurrentSong(song);
  //     await playTrack(song, settings);

  //     return; // 🚀 important → stop here
  //   }

  //   // 2) Normal flow (song does NOT exist in queue)
  //   console.log('Song not found → running normal flow');

  //   setCurrentSong(song);
  //   setSongQueue(queue);

  //   const index = queue.findIndex(s => s.id === song.id);
  //   currentIndexRef.current = index >= 0 ? index : 0;

  //   await playTrack(song, settings);
  // };

  const handleNext = async () => {
    if (songQueue.length === 0) return;
    const nextIndex = (currentIndexRef.current + 1) % songQueue.length;
    currentIndexRef.current = nextIndex;
    const nextSong = songQueue[nextIndex];
    setCurrentSong(nextSong);
    await playTrack(nextSong);
  };

  const handlePrev = async () => {
    if (songQueue.length === 0) return;
    const prevIndex =
      currentIndexRef.current === 0
        ? songQueue.length - 1
        : currentIndexRef.current - 1;
    currentIndexRef.current = prevIndex;
    const prevSong = songQueue[prevIndex];
    setCurrentSong(prevSong);
    await playTrack(prevSong);
  };

  const handleClosePlayer = () => {
    setCurrentSong(null);
    setSongQueue([]);
    currentIndexRef.current = 0;
  };

  const updateLikedSongs = useCallback(async () => {
    const liked = await getLikedSongs();
    setLikedSongs(liked);
  }, []);

  // Home handlers
  const openHomePlaylistDetails = playlistId => {
    setSelectedHomePlaylistId(playlistId);
    setCurrentHomeScreen('PlaylistDetails');
  };

  const openHomeAlbumDetails = albumId => {
    setSelectedHomeAlbumId(albumId);
    setCurrentHomeScreen('AlbumDetails');
  };

  const closeHomeDetails = () => {
    setSelectedHomePlaylistId(null);
    setSelectedHomeAlbumId(null);
    setCurrentHomeScreen('Home');
  };

  // Playlist handlers
  const openPlaylistDetails = playlistId => {
    setSelectedPlaylistId(playlistId);
    setCurrentPlaylistScreen('PlaylistDetails');
  };

  const closePlaylistDetails = () => {
    setSelectedPlaylistId(null);
    setCurrentPlaylistScreen('Playlists');
  };

  // Artist handlers
  const openArtistDetails = artistId => {
    setSelectedArtistId(artistId);
    setCurrentArtistScreen('ArtistDetails');
  };

  const closeArtistDetails = () => {
    setSelectedArtistId(null);
    setCurrentArtistScreen('Artists');
  };

  // Album handlers
  const openAlbumDetails = albumId => {
    setSelectedAlbumId(albumId);
    setCurrentAlbumScreen('AlbumDetails');
  };

  const closeAlbumDetails = () => {
    setSelectedAlbumId(null);
    setCurrentAlbumScreen('Albums');
  };

  const openLabelDetails = labelData => {
    setSelectedLabelData(labelData);
    setCurrentHomeScreen('LabelDetails');
  };

  const closeLabelDetails = () => {
    setSelectedLabelData(null);
    setCurrentHomeScreen('Home');
  };

  useEffect(() => {
    globalThis.handleNext = handleNext; // next song function (already exists)
    globalThis.handlePrev = handlePrev; // prev song function (already exists)
    globalThis.handlePlayPause = isPlay => {
      if (isPlay) {
        AudioProModule.resume(); // your audio-pro resume function
      } else {
        AudioProModule.pause(); // your audio-pro pause function
      }
    };
  }, [songQueue]);

  globalThis.openAlbumPage = albumId => {
    // console.log("OpenAlbumPage called:", albumId);

    if (navigationRef.isReady()) {
      globalThis.setSelectedAlbumId(albumId);
      globalThis.setCurrentAlbumScreen('AlbumDetails');
      // 1) Switch to Albums tab
      navigationRef.navigate('Albums');
    }
  };

  globalThis.openPlaylistPage = playlistId => {
    // console.log("OpenAlbumPage called:", albumId);

    if (navigationRef.isReady()) {
      globalThis.setSelectedPlaylistId(playlistId);
      globalThis.setCurrentPlaylistScreen('PlaylistDetails');
      // 1) Switch to Playlists tab
      navigationRef.navigate('Playlists');
    }
  };

  globalThis.openHomePage = () => {
    try {
      console.log('openHomePage called');

      if (navigationRef.isReady()) {
        globalThis.setCurrentHomeScreen?.('LabelDetails');
        globalThis.setSelectedHomePlaylistId?.(null);
        globalThis.setSelectedHomeAlbumId?.(null);

        // Tab → Home
        navigationRef.navigate('Home');
      }
    } catch (err) {
      console.log('openHomePage error:', err);
    }
  };

  useEffect(() => {
    // Album
    globalThis.setSelectedAlbumId = setSelectedAlbumId;
    globalThis.setCurrentAlbumScreen = setCurrentAlbumScreen;

    // Playlists
    globalThis.setSelectedPlaylistId = setSelectedPlaylistId;
    globalThis.setCurrentPlaylistScreen = setCurrentPlaylistScreen;

    // ⭐ HOME STATE setters
    globalThis.setCurrentHomeScreen = setCurrentHomeScreen;
    globalThis.setSelectedHomePlaylistId = setSelectedHomePlaylistId;
    globalThis.setSelectedHomeAlbumId = setSelectedHomeAlbumId;
  }, []);

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              switch (route.name) {
                case 'Home':
                  return (
                    <HomeIcon size={size} color={color} filled={focused} />
                  );
                case 'Search':
                  return <SearchIcon size={size} color={color} />;
                case 'Playlists':
                  return (
                    <MusicIcon size={size} color={color} filled={focused} />
                  );
                case 'Artists':
                  return (
                    <UserIcon size={size} color={color} filled={focused} />
                  );
                case 'Albums':
                  return (
                    <DiscIcon size={size} color={color} filled={focused} />
                  );
                case 'Likes':
                  return (
                    <HeartIcon size={size} color={color} filled={focused} />
                  );
                default:
                  return null;
              }
            },
            tabBarActiveTintColor: '#10b981',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: {
              backgroundColor: 'rgba(17, 24, 39, 0.98)',
              backgroundColor: '#1e293b',
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              height:
                Platform.OS === 'ios' ? 88 + insets.bottom : 75 + insets.bottom,
              paddingBottom: insets.bottom,
              paddingTop: 10,
              zIndex: 51,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerShown: false,
            tabBarHideOnKeyboard: true,
          })}
        >
          <Tab.Screen name="Home">
            {props => (
              <>
                {currentHomeScreen === 'Home' ? (
                  <Home
                    {...props}
                    playSong={playSong}
                    handleClosePlayer={handleClosePlayer}
                    stationId={stationId}
                    setStationId={setStationId}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    updateLikedSongs={updateLikedSongs}
                    likedSongs={likedSongs}
                    songQueue={songQueue}
                    handleNext={handleNext}
                    currentIndexRef={currentIndexRef}
                    setSongQueue={setSongQueue}
                    openPlaylistDetails={openHomePlaylistDetails}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    openAlbumDetails={openHomeAlbumDetails}
                    settings={settings}
                    handleSaveSettings={handleSaveSettings}
                    setSettings={setSettings}
                    isSettingsVisible={isSettingsVisible}
                    setIsSettingsVisible={setIsSettingsVisible}
                    openLabelDetails={openLabelDetails}
                    openAlbumPage={openAlbumPage}
                    openPlaylistPage={openPlaylistPage}
                  />
                ) : currentHomeScreen === 'PlaylistDetails' ? (
                  <PlaylistDetails
                    {...props}
                    playlistId={selectedHomePlaylistId}
                    onBack={closeHomeDetails}
                    playSong={playSong}
                    handleClosePlayer={handleClosePlayer}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    updateLikedSongs={updateLikedSongs}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                    openPlaylistPage={openPlaylistPage}
                  />
                ) : currentHomeScreen === 'AlbumDetails' ? (
                  <AlbumDetails
                    {...props}
                    albumId={selectedHomeAlbumId}
                    onBack={closeHomeDetails}
                    playSong={playSong}
                    handleClosePlayer={handleClosePlayer}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    updateLikedSongs={updateLikedSongs}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                    openAlbumPage={openAlbumPage}
                  />
                ) : (
                  <LabelDetails
                    {...props}
                    labelData={selectedLabelData}
                    onBack={closeLabelDetails}
                    playSong={playSong}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    settings={settings}
                    handleClosePlayer={handleClosePlayer}
                    stationId={stationId}
                    setStationId={setStationId}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    updateLikedSongs={updateLikedSongs}
                    likedSongs={likedSongs}
                    handleNext={handleNext}
                    currentIndexRef={currentIndexRef}
                    openPlaylistDetails={openHomePlaylistDetails}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    openAlbumDetails={openHomeAlbumDetails}
                    handleSaveSettings={handleSaveSettings}
                    setSettings={setSettings}
                    isSettingsVisible={isSettingsVisible}
                    setIsSettingsVisible={setIsSettingsVisible}
                    openLabelDetails={openLabelDetails}
                    openAlbumDetailsFromAlbum={openAlbumDetails}
                    openAlbumPage={openAlbumPage}
                  />
                )}
              </>
            )}
          </Tab.Screen>
          <Tab.Screen name="Search">
            {props => (
              <Search
                {...props}
                playSong={playSong}
                currentSong={currentSong}
                handleClosePlayer={handleClosePlayer}
                setCurrentSong={setCurrentSong}
                updateLikedSongs={updateLikedSongs}
                likedSongs={likedSongs}
                songQueue={songQueue}
                setSongQueue={setSongQueue}
                hasRadioQueue={hasRadioQueue}
                setHasRadioQueue={setHasRadioQueue}
                onClosePlayer={handleClosePlayer}
                CustomPlaylistUpdated={CustomPlaylistUpdated}
                setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                settings={settings}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Playlists">
            {props => (
              <>
                {currentPlaylistScreen === 'Playlists' ? (
                  <Playlists
                    {...props}
                    openPlaylistDetails={openPlaylistDetails}
                    settings={settings}
                  />
                ) : (
                  <PlaylistDetails
                    {...props}
                    playlistId={selectedPlaylistId}
                    onBack={closePlaylistDetails}
                    playSong={playSong}
                    handleClosePlayer={handleClosePlayer}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    updateLikedSongs={updateLikedSongs}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                  />
                )}
              </>
            )}
          </Tab.Screen>
          <Tab.Screen name="Artists">
            {props => (
              <>
                {currentArtistScreen === 'Artists' ? (
                  <Artists
                    {...props}
                    openArtistDetails={openArtistDetails}
                    settings={settings}
                  />
                ) : (
                  <ArtistDetails
                    {...props}
                    artistId={selectedArtistId}
                    onBack={closeArtistDetails}
                    playSong={playSong}
                    handleClosePlayer={handleClosePlayer}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    updateLikedSongs={updateLikedSongs}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                  />
                )}
              </>
            )}
          </Tab.Screen>
          <Tab.Screen name="Albums">
            {props => (
              <>
                {currentAlbumScreen === 'Albums' ? (
                  <Albums
                    {...props}
                    openAlbumDetails={openAlbumDetails}
                    settings={settings}
                    openHomePage={openHomePage}
                    currentHomeScreen={currentHomeScreen}
                  />
                ) : (
                  <AlbumDetails
                    {...props}
                    albumId={selectedAlbumId}
                    onBack={closeAlbumDetails}
                    playSong={playSong}
                    currentSong={currentSong}
                    handleClosePlayer={handleClosePlayer}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    updateLikedSongs={updateLikedSongs}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                    openHomePage={openHomePage}
                    currentHomeScreen={currentHomeScreen}
                  />
                )}
              </>
            )}
          </Tab.Screen>
          {/* <Tab.Screen name="Likes">
          {props => (
            <Likes
              {...props}
              playSong={playSong}
              currentSong={currentSong}
              updateLikedSongs={updateLikedSongs}
              likedSongs={likedSongs}
              setLikedSongs={setLikedSongs}
              setSongQueue={setSongQueue}
              songQueue={songQueue}
              CustomPlaylistUpdated={CustomPlaylistUpdated}
              setCustomPlaylistUpdated={setCustomPlaylistUpdated}
            />
          )}
        </Tab.Screen> */}

          <Tab.Screen name="Likes">
            {props => (
              <>
                {currentLikesScreen === 'Likes' ? (
                  <Likes
                    {...props}
                    playSong={playSong}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    updateLikedSongs={updateLikedSongs}
                    likedSongs={likedSongs}
                    setLikedSongs={setLikedSongs}
                    setSongQueue={setSongQueue}
                    handleClosePlayer={handleClosePlayer}
                    songQueue={songQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    settings={settings}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    openCustomPlaylistDetails={playlistId => {
                      setSelectedCustomPlaylistId(playlistId);
                      setCurrentLikesScreen('CustomPlaylistDetails');
                    }}
                  />
                ) : (
                  <CustomPlaylistDetails
                    {...props}
                    playlistId={selectedCustomPlaylistId}
                    onBack={() => {
                      setSelectedCustomPlaylistId(null);
                      setCurrentLikesScreen('Likes');
                    }}
                    playSong={playSong}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    likedSongs={likedSongs}
                    handleClosePlayer={handleClosePlayer}
                    updateLikedSongs={updateLikedSongs}
                    songQueue={songQueue}
                    setSongQueue={setSongQueue}
                    hasRadioQueue={hasRadioQueue}
                    setHasRadioQueue={setHasRadioQueue}
                    CustomPlaylistUpdated={CustomPlaylistUpdated}
                    setCustomPlaylistUpdated={setCustomPlaylistUpdated}
                    settings={settings}
                  />
                )}
              </>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      {currentSong && (
        // <View style={{ position:'absolute', bottom:300, left:0, right:0, zIndex:999, elevation:50,backgroundColor: '#1e293b' }}>
        <Player
          song={currentSong}
          songQueue={songQueue}
          setSongQueue={setSongQueue}
          stationId={stationId}
          setStationId={setStationId}
          hasRadioQueue={hasRadioQueue}
          setHasRadioQueue={setHasRadioQueue}
          playSong={playSong} // your playSong function that sets currentSong and calls playTrack
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClosePlayer}
          updateLikedSongs={updateLikedSongs}
          likedSongs={likedSongs}
          currentIndexRef={currentIndexRef}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          setCustomPlaylistUpdated={setCustomPlaylistUpdated}
          CustomPlaylistUpdated={CustomPlaylistUpdated}
          settings={settings}
        />
        // </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 75,
    left: 0,
    right: 0,
    zIndex: 999, // 👈 ensures it floats ABOVE all screens and tabs
  },
});
