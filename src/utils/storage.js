import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_SONGS_KEY = '@liked_songs';

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

    // Agar liked songs 10 se kam hai to saari ids return karo
    if (ids.length <= 10) {
      return ids;
    }

    // 10 se jayada hai to randomly 10 ids nikalo
    const shuffled = ids.sort(() => Math.random() - 0.5);
    // First 10 ids
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error('Error getting random liked song IDs:', error);
    return [];
  }
};

