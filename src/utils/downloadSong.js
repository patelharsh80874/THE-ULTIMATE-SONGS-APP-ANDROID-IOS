import RNFS from 'react-native-fs';
import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Base URL for generating audio
const BASE_URL = 'https://the-ultimate-songs-download-server-python.vercel.app/generate-audio';

/**
 * Main download function
 * @param {Object} song - song object
 * @param {Function} onProgress - callback for download progress
 * @returns {Object} { success: boolean, path?: string, error?: any }
 */
export async function downloadSong(song, onProgress) {
  // Android 10 ya niche par runtime permission check
  if (Platform.OS === 'android' && Platform.Version <= 29) {
    let storagePermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    if (storagePermission !== RESULTS.GRANTED) {
      storagePermission = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (storagePermission !== RESULTS.GRANTED) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to download and save the song. Please allow access.',
        );
        return { success: false, error: 'Permission denied' };
      }
    }
  }
  try {
    const audioUrl = song.downloadUrl[4].url;
    const imageUrl = song.image[2]?.url || '';
    const songName = song.name;
    const artist = song.artists.primary.map(a => a.name).join(',');
    const album = song.album.name;
    const year = song.year.toString();

    const url = `${BASE_URL}?audioUrl=${encodeURIComponent(audioUrl)}&imageUrl=${encodeURIComponent(imageUrl)}&songName=${encodeURIComponent(songName)}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&year=${encodeURIComponent(year)}`;

    const safeName = songName.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_') + '.m4a';
    let path = Platform.select({
      android: `${RNFS.DownloadDirectoryPath}/TheUltimateSongsApp/${safeName}`, // Android
      ios: `${RNFS.DocumentDirectoryPath}/${safeName}`, // iOS
    });

    // Folder ensure
    const folderPath = path.substring(0, path.lastIndexOf('/'));
    const folderExists = await RNFS.exists(folderPath);
    if (!folderExists) {
      await RNFS.mkdir(folderPath);
    }

    // Download start
    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
      background: true,
      progressDivider: 1,
      progress: ({ bytesWritten, contentLength }) => {
        const progressPercent = (bytesWritten / contentLength) * 100;
        onProgress(progressPercent);
      },
    });

    const result = await download.promise;

    if (result.statusCode === 200) {
      return { success: true, path };
    } else {
      return { success: false, error: `HTTP Status ${result.statusCode}` };
    }
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error };
  }
}
