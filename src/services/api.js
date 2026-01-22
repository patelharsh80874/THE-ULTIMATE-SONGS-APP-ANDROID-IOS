import axios from 'axios';
import { getRandomLikedSongIds, RADIO_QUANTITIES } from '../utils/storage';
import { settingsRead } from '../navigation/AppNavigator';

const BASE_URL = 'https://jiosaavan-api-2-harsh-patel.vercel.app/api';
const MODULES_URL = 'https://jiosaavan-harsh-patel.vercel.app';
const RADIO_BASE_URL = 'https://www.jiosaavn.com/api.php';
const SONG_DETAIL_API = 'https://jiosaavan-api-2-harsh-patel.vercel.app/api/songs';

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
      // console.log(uniqueSongs)
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

export const fetchFeaturedRadios = async (language = 'hindi') => {
  try {
    const response = await axios.get(
      `https://www.jiosaavn.com/api.php?__call=webradio.getFeaturedStations&api_version=4&_format=json&_marker=0&ctx=web6dot0&languages=${language}`
    );
    if (response.data) {
      return response.data;  // Adjust per actual API response shape
    }
    return [];
  } catch (error) {
    console.error('Error fetching radios');
    return [];
  }
};

export const fetchArtistsRadios = async (language = 'hindi') => {
  try {
    const response = await axios.get(
      `https://www.jiosaavn.com/api.php?__call=social.getTopArtists&api_version=4&_format=json&_marker=0&ctx=web6dot0}`
    );
    if (response) {
      return response.data.top_artists;  // Adjust per actual API response shape
    }
    return [];
  } catch (error) {
    console.error('Error fetching radios',error);
    return [];
  }
};


// 1. Create/Get station ID for clicked radio with language and radio name (id)
export async function createStationId(language, radioId) {
  try {
    const response = await axios.get(`https://www.jiosaavn.com/api.php?language=${language}&query=&name=${radioId}&mode=&artistid=&api_version=4&_format=json&_marker=0&ctx=web6dot0&__call=webradio.createFeaturedStation`);
    return response?.data?.stationid || null;
  } catch (error) {
    console.error('Error creating station ID', error);
    return null;
  }
}

// 1. Create/Get station ID for clicked radio with language and radio name (id)
export async function createArtitsStationId(radioId) {
  try {
    const response = await axios.get(`https://www.jiosaavn.com/api.php?language=hindi&pid=&query=${radioId}&name=${radioId}&mode=&artistid=&api_version=4&_format=json&_marker=0&ctx=wap6dot0&__call=webradio.createArtistStation`);
    return response?.data?.stationid || null;
  } catch (error) {
    console.error('Error creating station ID', error);
    return null;
  }
}

// 2. Get songs by station ID (returns list with basic song info including IDs)
export async function getSongsByStationId(stationId, limit = RADIO_QUANTITIES[settingsRead.radioSongQuantity], next = 1) {
  try {
    const response = await axios.get(`https://www.jiosaavn.com/api.php?__call=webradio.getSong&stationid=${stationId}&k=${limit}&next=${next}&api_version=4&_format=json&_marker=0&ctx=web6dot0`);
    return [response?.data] || []; // list of songs with at least id
  } catch (error) {
    console.error('Error fetching songs by station ID', error);
    return [];
  }
}


function extractSongIds(data) {
  // Filter out only numeric keys like "0", "1", "2" (exclude stationid)
  const songIds = Object.keys(data[0])
    .filter(key => !isNaN(key))
    .map(key => data[0][key].song.id);

  // Join them into a single comma-separated string
  return songIds;
}


// 3. Get full song details by song IDs (comma separated)
export async function getSongsDetailsByIds(songIds = []) {
  if (songIds.length === 0) return [];
  try {
    const idsParam = songIds.join(',');
    const response = await axios.get(`${SONG_DETAIL_API}/${idsParam}`);
    if (response.data) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching song details by IDs', error);
    return [];
  }
}

// Combined convenience function to fetch full songs for a radio
export async function fetchRadioSongs(language, radioId) {
  // console.log(language,radioId)
  const stationId = await createStationId(language, radioId);
  if (!stationId) return [];

  const songs = await getSongsByStationId(stationId);
  const songIds = extractSongIds(songs);
 

  if (songIds.length === 0) return [];
  const fullSongs = await getSongsDetailsByIds(songIds);

  return {fullSongs,stationId};
}

// Combined convenience function to fetch full songs for a radio
export async function fetchNewRadioSongs(stationId) {

  const songs = await getSongsByStationId(stationId);
  const songIds = extractSongIds(songs);
 

  if (songIds.length === 0) return [];
  const fullSongs = await getSongsDetailsByIds(songIds);

  return fullSongs;
}

// Combined convenience function to fetch full songs for a radio
export async function fetchArtitsRadioSongs(radioId) {
  // console.log(radioId)
  const stationId = await createArtitsStationId(radioId);
  if (!stationId) return [];

  const songs = await getSongsByStationId(stationId);
  const songIds = extractSongIds(songs);
 

  if (songIds.length === 0) return [];
  const fullSongs = await getSongsDetailsByIds(songIds);

  return {fullSongs,stationId};
}




export const fetchUniqueArtists = async (language) => {
  // console.log(language)
  try {
    const url =
      `https://www.jiosaavn.com/api.php?__call=content.getTrending&api_version=4&_format=json&_marker=0&ctx=web6dot0&entity_type=song&entity_language=${language}`;

    const { data } = await axios.get(url);

    let uniqueArtists = [];
    let addedIds = new Set();

    data.forEach(song => {
      const primaryArtists = song?.more_info?.artistMap?.primary_artists || [];
      const language = song?.language || "";

      primaryArtists.forEach(artist => {

        // ❌ Skip if not singer
        // if (artist.role !== "singer") return;

        // ❌ Skip if image empty
        if (!artist.image || artist.image.trim() === "") return;

        // ❌ Skip if image does NOT contain "artists"
        if (!artist.image.includes("artists")) return;

        // ❌ Skip duplicates
        if (addedIds.has(artist.id)) return;

        // ✅ Add valid artist
        uniqueArtists.push({
          ...artist,
          language: language,
        });

        addedIds.add(artist.id);
      });
    });

    return uniqueArtists;

  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};




export const fetchStarringArtists = async (language) => {
  try {
    const url =
      `https://www.jiosaavn.com/api.php?p=1&q=${language}&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=40&__call=search.getResults`;

    const { data } = await axios.get(url);

    let uniqueArtists = [];
    let addedIds = new Set();

    data?.results?.forEach(song => {
      const artists = song?.more_info?.artistMap?.artists || [];
      const language = song?.language || "";

      artists.forEach(artist => {
        // 🔥 Only starring role allowed
        if (artist.role !== "starring") return;

        // 🔥 Image should NOT be empty
        if (!artist.image || artist.image.trim() === "") return;

        // 🔥 Image must include "artists"
        if (!artist.image.includes("artists")) return;

        // 🔥 Avoid duplicates
        if (addedIds.has(artist.id)) return;

        // ✅ Add artist
        uniqueArtists.push({
          ...artist,
          language: language,
        });

        addedIds.add(artist.id);
      });
    });

    return uniqueArtists;

  } catch (error) {
    console.error("Error fetching starring artists:", error);
    return [];
  }
};




export const getTrendingLabels = async (language = 'hindi') => {
  try {
    const trending = await axios.get(
      `https://www.jiosaavn.com/api.php?__call=content.getTrending&api_version=4&_format=json&_marker=0&ctx=web6dot0&entity_type=song&entity_language=${language}`
    );

    const items = trending.data;  // trending list
    const unique = new Set();
    const results = [];

    for (const item of items) {
      const label_url = item?.more_info?.label_url;
      if (!label_url) continue;

      // extract token (exact as is)
      const parts = label_url.split("/");
      const token = parts[parts.length - 1];   // KEEP underscore "_"

      if (unique.has(token)) continue;
      unique.add(token);

      // second API call
      const detailRes = await axios.get(
        `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${token}&type=label&p=0&n_song=1&n_album=1&category=popularity&sort_order=desc&language=&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`
      );

      const detail = detailRes?.data;
      if (!detail) continue;

      results.push({
        label_url,              // as requested
        token,                  // EXACT token with underscore
        labelId: detail.labelId,
        name: detail.name,
        image: detail.image,
      });
    }
    return results;
  } catch (e) {
    console.log("ERROR @ getTrendingLabels =>", e);
    return [];
  }
};





