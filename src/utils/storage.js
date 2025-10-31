import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_SONGS_KEY = '@liked_songs';
const CUSTOM_PLAYLISTS_KEY = '@custom_playlists';
const RECENTLY_PLAYED_SONGS = '@recently_played_songs';

export const getLikedSongs = async () => {
  try {
    const liked = await AsyncStorage.getItem(LIKED_SONGS_KEY);
    return liked ? JSON.parse(liked) : [];
  } catch (error) {
    console.error('Error getting liked songs:', error);
    return [];
  }
};

export const likeSong = async (song) => {
  try {
    const liked = await getLikedSongs();
    const exists = liked.find(s => s.id === song.id);
    if (!exists) {
      liked.push(song);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(liked));
    }
    return liked;
  } catch (error) {
    console.error('Error liking song:', error);
    return [];
  }
};

export const unlikeSong = async (songId) => {
  try {
    const liked = await getLikedSongs();
    const filtered = liked.filter(s => s.id !== songId);
    await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error unliking song:', error);
    return [];
  }
};

export const isSongLiked = (songId, likedSongs) => {
  return likedSongs.some(s => s.id === songId);
};

export const getRandomLikedSongIds = async () => {
  try {
    const liked = await getLikedSongs();
    const ids = liked.map(song => song.id);
    if (ids.length <= 10) {
      return ids;
    }
    const shuffled = ids.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error('Error getting random liked song IDs:', error);
    return [];
  }
};


// --- Custom Playlists --- //

export const getCustomPlaylists = async () => {
  try {
    const playlists = await AsyncStorage.getItem(CUSTOM_PLAYLISTS_KEY);
    return playlists ? JSON.parse(playlists) : [];
  } catch (error) {
    console.error('Error getting custom playlists:', error);
    return [];
  }
};

export const saveCustomPlaylists = async (playlists) => {
  try {
    await AsyncStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(playlists));
    return true;
  } catch (error) {
    console.error('Error saving custom playlists:', error);
    return false;
  }
};

export const createPlaylist = async (playlistName) => {
  try {
    let playlists = await getCustomPlaylists();
    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      songs: [],
    };
    playlists.push(newPlaylist);
    await saveCustomPlaylists(playlists);
    return newPlaylist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

export const addSongToPlaylist = async (playlistId, song) => {
  try {
    let playlists = await getCustomPlaylists();
    const index = playlists.findIndex(pl => pl.id === playlistId);
    if (index !== -1) {
      const exists = playlists[index].songs.find(s => s.id === song.id);
      if (!exists) {
        playlists[index].songs.push(song);
        await saveCustomPlaylists(playlists);
      }
    }
  } catch (error) {
    console.error('Error adding song to playlist:', error);
  }
};



export const getRecentlyPlayedSongs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(RECENTLY_PLAYED_SONGS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch(e) {
    console.error(e);
    return [];
  }
};

export const addToRecentlyPlayed = async (song) => {
  try {
    let recents = await getRecentlyPlayedSongs();
    // Remove duplicate
    recents = recents.filter(s => s.id !== song.id);
    recents.unshift(song); // new song add on top
    if(recents.length > 20) recents.pop(); // max limit 20 songs
    await AsyncStorage.setItem(RECENTLY_PLAYED_SONGS, JSON.stringify(recents));
  } catch(e) {
    console.error(e);
  }
};


