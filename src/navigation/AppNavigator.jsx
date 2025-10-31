import React, {useState, useEffect, useRef, useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform} from 'react-native';
import {AudioPro, AudioProEventType} from 'react-native-audio-pro';
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
import Artists from '../screens/Artists';
import ArtistDetails from '../screens/ArtistDetails';
import Albums from '../screens/Albums';
import AlbumDetails from '../screens/AlbumDetails';
import Likes from '../screens/Likes';
import Player from '../components/Player';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {addToRecentlyPlayed, getLikedSongs} from '../utils/storage';
import {playTrack} from '../services/audioService';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  const [currentSong, setCurrentSong] = useState(null);
  const [songQueue, setSongQueue] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [CustomPlaylistUpdated, setCustomPlaylistUpdated] = useState(false);

  // Home states
  const [currentHomeScreen, setCurrentHomeScreen] = useState('Home');
  const [selectedHomePlaylistId, setSelectedHomePlaylistId] = useState(null);
  const [selectedHomeAlbumId, setSelectedHomeAlbumId] = useState(null);

  // Playlist states
  const [currentPlaylistScreen, setCurrentPlaylistScreen] = useState('Playlists');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Artist states
  const [currentArtistScreen, setCurrentArtistScreen] = useState('Artists');
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  // Album states
  const [currentAlbumScreen, setCurrentAlbumScreen] = useState('Albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const currentIndexRef = useRef(0);

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

  const playSong = async (song, queue = []) => {
    setCurrentSong(song);
    setSongQueue(queue);
    const index = queue.findIndex(s => s.id === song.id);
    currentIndexRef.current = index >= 0 ? index : 0;
    await playTrack(song);
    // await addToRecentlyPlayed(song);
  };

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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            switch (route.name) {
              case 'Home':
                return <HomeIcon size={size} color={color} filled={focused} />;
              case 'Search':
                return <SearchIcon size={size} color={color} />;
              case 'Playlists':
                return <MusicIcon size={size} color={color} filled={focused} />;
              case 'Artists':
                return <UserIcon size={size} color={color} filled={focused} />;
              case 'Albums':
                return <DiscIcon size={size} color={color} filled={focused} />;
              case 'Likes':
                return <HeartIcon size={size} color={color} filled={focused} />;
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
            shadowOffset: {width: 0, height: -4},
            shadowOpacity: 0.3,
            shadowRadius: 12,
            height: Platform.OS === 'ios' ? 88 + insets.bottom : 70 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 10,
            zIndex: 51,
            // borderTopLeftRadius: 24,
            // borderTopRightRadius: 24,
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
                  currentSong={currentSong}
                  updateLikedSongs={updateLikedSongs}
                  likedSongs={likedSongs}
                  openPlaylistDetails={openHomePlaylistDetails}
                  openAlbumDetails={openHomeAlbumDetails}
                />
              ) : currentHomeScreen === 'PlaylistDetails' ? (
                <PlaylistDetails
                  {...props}
                  playlistId={selectedHomePlaylistId}
                  onBack={closeHomeDetails}
                  playSong={playSong}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              ) : (
                <AlbumDetails
                  {...props}
                  albumId={selectedHomeAlbumId}
                  onBack={closeHomeDetails}
                  playSong={playSong}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
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
              updateLikedSongs={updateLikedSongs}
              likedSongs={likedSongs}
              onClosePlayer={handleClosePlayer}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Playlists">
          {props => (
            <>
              {currentPlaylistScreen === 'Playlists' ? (
                <Playlists {...props} openPlaylistDetails={openPlaylistDetails} />
              ) : (
                <PlaylistDetails
                  {...props}
                  playlistId={selectedPlaylistId}
                  onBack={closePlaylistDetails}
                  playSong={playSong}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              )}
            </>
          )}
        </Tab.Screen>
        <Tab.Screen name="Artists">
          {props => (
            <>
              {currentArtistScreen === 'Artists' ? (
                <Artists {...props} openArtistDetails={openArtistDetails} />
              ) : (
                <ArtistDetails
                  {...props}
                  artistId={selectedArtistId}
                  onBack={closeArtistDetails}
                  playSong={playSong}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              )}
            </>
          )}
        </Tab.Screen>
        <Tab.Screen name="Albums">
          {props => (
            <>
              {currentAlbumScreen === 'Albums' ? (
                <Albums {...props} openAlbumDetails={openAlbumDetails} />
              ) : (
                <AlbumDetails
                  {...props}
                  albumId={selectedAlbumId}
                  onBack={closeAlbumDetails}
                  playSong={playSong}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  updateLikedSongs={updateLikedSongs}
                />
              )}
            </>
          )}
        </Tab.Screen>
        <Tab.Screen name="Likes">
          {props => (
            <Likes
              {...props}
              playSong={playSong}
              currentSong={currentSong}
              updateLikedSongs={updateLikedSongs}
              likedSongs={likedSongs}
              setSongQueue={setSongQueue}
              CustomPlaylistUpdated={CustomPlaylistUpdated}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {currentSong && (
        <Player
          song={currentSong}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClosePlayer}
          updateLikedSongs={updateLikedSongs}
          likedSongs={likedSongs}
          setCustomPlaylistUpdated={setCustomPlaylistUpdated}
          CustomPlaylistUpdated={CustomPlaylistUpdated}
        />
      )}
    </NavigationContainer>
  );
}

