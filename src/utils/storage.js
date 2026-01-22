// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LIKED_SONGS_KEY = '@liked_songs';
// const CUSTOM_PLAYLISTS_KEY = '@custom_playlists';
// const RECENTLY_PLAYED_SONGS = '@recently_played_songs';

// // --- Song & Image Quality Settings --- //
// const SETTINGS_KEY = '@app_settings';

// // Exported arrays so you can use them anywhere in app
// export const IMAGE_QUALITIES = ['50x50', '150x150', '500x500'];
// export const AUDIO_QUALITIES = ['12kbps', '48kbps', '96kbps', '160kbps', '320kbps'];


// /**
//  * Get user settings (indexes only)
//  * Example return: { imageQualityIndex: 1, audioQualityIndex: 3 }
//  */
// export const getAppSettings = async () => {
//   try {
//     const json = await AsyncStorage.getItem(SETTINGS_KEY);
//     if (json) {
//       const parsed = JSON.parse(json);
//       return {
//         imageQualityIndex:
//           typeof parsed.imageQualityIndex === 'number' ? parsed.imageQualityIndex : 1,
//         audioQualityIndex:
//           typeof parsed.audioQualityIndex === 'number' ? parsed.audioQualityIndex : 3,
//       };
//     }
//     // defaults if nothing saved
//     return { imageQualityIndex: 1, audioQualityIndex: 3 };
//   } catch (error) {
//     console.error('Error getting app settings:', error);
//     return { imageQualityIndex: 1, audioQualityIndex: 3 };
//   }
// };

// /**
//  * Save indexes only.
//  * Example: saveAppSettings({ imageQualityIndex: 2, audioQualityIndex: 4 })
//  */
// export const saveAppSettings = async (settings) => {
//   try {
//     await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
//   } catch (error) {
//     console.error('Error saving app settings:', error);
//   }
// };

// export const getLikedSongs = async () => {
//   try {
//     const liked = await AsyncStorage.getItem(LIKED_SONGS_KEY);
//     return liked ? JSON.parse(liked) : [];
//   } catch (error) {
//     console.error('Error getting liked songs:', error);
//     return [];
//   }
// };

// export const saveLikedSongs = async (songs) => {
//   try {
//     await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(songs));
//     return true;
//   } catch (error) {
//     console.error('Error saving liked songs:', error);
//     return false;
//   }
// };


// export const likeSong = async (song) => {
//   try {
//     const liked = await getLikedSongs();
//     const exists = liked.find(s => s.id === song.id);
//     if (!exists) {
//       liked.push(song);
//       await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(liked));
//     }
//     return liked;
//   } catch (error) {
//     console.error('Error liking song:', error);
//     return [];
//   }
// };

// export const unlikeSong = async (songId) => {
//   try {
//     const liked = await getLikedSongs();
//     const filtered = liked.filter(s => s.id !== songId);
//     await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(filtered));
//     return filtered;
//   } catch (error) {
//     console.error('Error unliking song:', error);
//     return [];
//   }
// };

// export const isSongLiked = (songId, likedSongs) => {
//   return likedSongs.some(s => s.id === songId);
// };

// export const getRandomLikedSongIds = async () => {
//   try {
//     const liked = await getLikedSongs();
//     const ids = liked.map(song => song.id);
//     if (ids.length <= 10) {
//       return ids;
//     }
//     const shuffled = ids.sort(() => Math.random() - 0.5);
//     return shuffled.slice(0, 10);
//   } catch (error) {
//     console.error('Error getting random liked song IDs:', error);
//     return [];
//   }
// };


// // --- Custom Playlists --- //

// export const getCustomPlaylists = async () => {
//   try {
//     const playlists = await AsyncStorage.getItem(CUSTOM_PLAYLISTS_KEY);
//     return playlists ? JSON.parse(playlists) : [];
//   } catch (error) {
//     console.error('Error getting custom playlists:', error);
//     return [];
//   }
// };

// export const saveCustomPlaylists = async (playlists) => {
//   try {
//     await AsyncStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(playlists));
//     return true;
//   } catch (error) {
//     console.error('Error saving custom playlists:', error);
//     return false;
//   }
// };

// export const createPlaylist = async (playlistName) => {
//   try {
//     let playlists = await getCustomPlaylists();
//     const newPlaylist = {
//       id: Date.now().toString(),
//       name: playlistName,
//       songs: [],
//     };
//     playlists.push(newPlaylist);
//     await saveCustomPlaylists(playlists);
//     return newPlaylist;
//   } catch (error) {
//     console.error('Error creating playlist:', error);
//     return null;
//   }
// };

// export const addSongToPlaylist = async (playlistId, song) => {
//   try {
//     let playlists = await getCustomPlaylists();
//     const index = playlists.findIndex(pl => pl.id === playlistId);
//     if (index !== -1) {
//       const exists = playlists[index].songs.find(s => s.id === song.id);
//       if (!exists) {
//         playlists[index].songs.push(song);
//         await saveCustomPlaylists(playlists);
//       }
//     }
//   } catch (error) {
//     console.error('Error adding song to playlist:', error);
//   }
// };



// export const getRecentlyPlayedSongs = async () => {
//   try {
//     const jsonValue = await AsyncStorage.getItem(RECENTLY_PLAYED_SONGS);
//     return jsonValue != null ? JSON.parse(jsonValue) : [];
//   } catch(e) {
//     console.error(e);
//     return [];
//   }
// };

// export const addToRecentlyPlayed = async (song) => {
//   try {
//     let recents = await getRecentlyPlayedSongs();
//     // Remove duplicate
//     recents = recents.filter(s => s.id !== song.id);
//     recents.unshift(song); // new song add on top
//     if(recents.length > 20) recents.pop(); // max limit 20 songs
//     await AsyncStorage.setItem(RECENTLY_PLAYED_SONGS, JSON.stringify(recents));
//   } catch(e) {
//     console.error(e);
//   }
// };






// storage.js (react-native-mmkv version)
import { createMMKV } from 'react-native-mmkv';

// ✅ Create MMKV instance
export const storage = createMMKV({
  id: 'user-storage',
});

// --- Keys --- //
const LIKED_SONGS_KEY = '@liked_songs';
const CUSTOM_PLAYLISTS_KEY = '@custom_playlists';
const RECENTLY_PLAYED_SONGS = '@recently_played_songs';
const SETTINGS_KEY = '@app_settings';

// --- Song & Image Quality Settings --- //
export const IMAGE_QUALITIES = ['50x50 (Low)', '150x150 (Medium)', '500x500 (High)'];
export const AUDIO_QUALITIES = ['12kbps (Very low quality)', '48kbps (Low quality)', '96kbps (Fair quality)', '160kbps (Good quality)', '320kbps (High quality)'];
export const RADIO_QUANTITIES = [5, 10, 20];


// ✅ Utility helpers
const getParsed = key => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : [];
};

const setParsed = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

// --- App Settings --- //
export const getAppSettings = () => {
  try {
    const json = storage.getString(SETTINGS_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return {
        imageQualityIndex:
          typeof parsed.imageQualityIndex === 'number' ? parsed.imageQualityIndex : 2,
        audioQualityIndex:
          typeof parsed.audioQualityIndex === 'number' ? parsed.audioQualityIndex : 4,
        radioSongQuantity:
          typeof parsed.radioSongQuantity === 'number' ? parsed.radioSongQuantity : 1, // default = index 1 (10 songs)
      };
    }
    return { imageQualityIndex: 2, audioQualityIndex: 4,radioSongQuantity: 1, };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return { imageQualityIndex: 2, audioQualityIndex: 4,radioSongQuantity: 1, };
  }
};

export const saveAppSettings = settings => {
  try {
    storage.set(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving app settings:', error);
  }
};

// --- Liked Songs --- //
export const getLikedSongs = () => {
  try {
    return getParsed(LIKED_SONGS_KEY);
  } catch (error) {
    console.error('Error getting liked songs:', error);
    return [];
  }
};

export const saveLikedSongs = songs => {
  try {
    setParsed(LIKED_SONGS_KEY, songs);
    return true;
  } catch (error) {
    console.error('Error saving liked songs:', error);
    return false;
  }
};

export const likeSong = song => {
  try {
    const liked = getLikedSongs();
    const exists = liked.find(s => s.id === song.id);
    if (!exists) {
      liked.push(song);
      setParsed(LIKED_SONGS_KEY, liked);
    }
    return liked;
  } catch (error) {
    console.error('Error liking song:', error);
    return [];
  }
};

export const unlikeSong = songId => {
  try {
    const liked = getLikedSongs();
    const filtered = liked.filter(s => s.id !== songId);
    setParsed(LIKED_SONGS_KEY, filtered);
    return filtered;
  } catch (error) {
    console.error('Error unliking song:', error);
    return [];
  }
};

export const isSongLiked = (songId, likedSongs) => {
  return likedSongs.some(s => s.id === songId);
};

export const getRandomLikedSongIds = () => {
  try {
    const liked = getLikedSongs();
    const ids = liked.map(song => song.id);
    if (ids.length <= 10) return ids;
    const shuffled = ids.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error('Error getting random liked song IDs:', error);
    return [];
  }
};

// --- Custom Playlists --- //
export const getCustomPlaylists = () => {
  try {
    return getParsed(CUSTOM_PLAYLISTS_KEY);
  } catch (error) {
    console.error('Error getting custom playlists:', error);
    return [];
  }
};

export const saveCustomPlaylists = playlists => {
  try {
    setParsed(CUSTOM_PLAYLISTS_KEY, playlists);
    return true;
  } catch (error) {
    console.error('Error saving custom playlists:', error);
    return false;
  }
};

export const createPlaylist = playlistName => {
  try {
    let playlists = getCustomPlaylists();
    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      songs: [],
    };
    playlists.push(newPlaylist);
    saveCustomPlaylists(playlists);
    return newPlaylist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

export const addSongToPlaylist = (playlistId, song) => {
  try {
    let playlists = getCustomPlaylists();
    const index = playlists.findIndex(pl => pl.id === playlistId);
    if (index !== -1) {
      const exists = playlists[index].songs.find(s => s.id === song.id);
      if (!exists) {
        playlists[index].songs.push(song);
        saveCustomPlaylists(playlists);
      }
    }
  } catch (error) {
    console.error('Error adding song to playlist:', error);
  }
};

// --- Recently Played --- //
export const getRecentlyPlayedSongs = () => {
  try {
    return getParsed(RECENTLY_PLAYED_SONGS);
  } catch (e) {
    console.error('Error getting recently played:', e);
    return [];
  }
};

export const addToRecentlyPlayed = song => {
  try {
    let recents = getRecentlyPlayedSongs();
    recents = recents.filter(s => s.id !== song.id);
    recents.unshift(song);
    if (recents.length > 20) recents.pop();
    setParsed(RECENTLY_PLAYED_SONGS, recents);
  } catch (e) {
    console.error('Error adding to recently played:', e);
  }
};
