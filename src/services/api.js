import axios from 'axios';
import { getRandomLikedSongIds } from '../utils/storage';

const BASE_URL = 'https://jiosaavan-api-2-harsh-patel.vercel.app/api';
const MODULES_URL = 'https://jiosaavan-harsh-patel.vercel.app';

// Generate random page number between 1-10
const getRandomPage = () => Math.floor(Math.random() * 10) + 1;

export const fetchSongs = async (language = 'hindi', page = null) => {
  try {
    const pageNum = page || getRandomPage();
    const response = await axios.get(
      `${BASE_URL}/search/songs?query=${language}&page=${pageNum}&limit=40`
    );
    
    if (response.data.success && response.data.data.results) {
      // Remove duplicates based on song ID
      const uniqueSongs = [];
      const seenIds = new Set();
      
      for (const song of response.data.data.results) {
        if (!seenIds.has(song.id)) {
          seenIds.add(song.id);
          uniqueSongs.push(song);
        }
      }
      
      return uniqueSongs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};

export const fetchModules = async (language = 'hindi') => {
  try {
    const response = await axios.get(
      `${MODULES_URL}/modules?language=${language}`
    );
    
    if (response.data.status === 'SUCCESS' && response.data.data) {
      return {
        albums: response.data.data.albums || [],
        playlists: response.data.data.playlists || [],
        charts: response.data.data.charts || [],
      };
    }
    return {albums: [], playlists: [], charts: []};
  } catch (error) {
    console.error('Error fetching modules:', error);
    return {albums: [], playlists: [], charts: []};
  }
};


export const fetchUniqueSuggestedSongs = async () => {
  try {
    const likedIds = await getRandomLikedSongIds();
    if (likedIds.length === 0) {
      return [];
    }

    const allSongs = [];
    const seenIds = new Set();

    for (const id of likedIds) {
      try {
        const response = await axios.get(`${BASE_URL}/songs/${id}/suggestions`);
        if (response.data.success && Array.isArray(response.data.data)) {
          for (const song of response.data.data) {
            if (!seenIds.has(song.id)) {
              seenIds.add(song.id);
              allSongs.push(song);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching suggestions for id ${id}:`, error);
      }
    }

    return allSongs;
  } catch (error) {
    console.error('Error in fetchUniqueSuggestedSongs:', error);
    return [];
  }
};

