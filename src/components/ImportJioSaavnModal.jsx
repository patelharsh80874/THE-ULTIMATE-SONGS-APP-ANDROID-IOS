import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { getCustomPlaylists, saveCustomPlaylists } from '../utils/storage';

export default function ImportJioSaavnModal({ visible, onClose,CustomPlaylistUpdated,setCustomPlaylistUpdated }) {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const extractTokenFromUrl = url => {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1]; // last part F,ns8If...
    } catch {
      return null;
    }
  };

  const importPlaylist = async () => {
    if (!link.trim()) return alert('Please paste JioSaavn playlist link');

    setLoading(true);

    try {
      // 1️⃣ EXTRACT TOKEN
      const token = extractTokenFromUrl(link);
      if (!token) {
        alert('Invalid JioSaavn link');
        setLoading(false);
        return;
      }

      // 2️⃣ GET list_count FROM FIRST API
      const infoUrl =
        'https://www.jiosaavn.com/api.php?__call=webapi.get&token=' +
        token +
        '&type=playlist&p=1&n=20&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0';

      const infoRes = await axios.get(infoUrl);
      const raw = infoRes.data;

      const parsed =
        typeof raw === 'string' ? JSON.parse(raw.replace(/^\{|\}$/g, '')) : raw;

      const listCount = Number(parsed.list_count || 20);

      // 3️⃣ FETCH FULL PLAYLIST USING SUMIT API
      const finalUrl =
        'https://jiosaavan-api-2-harsh-patel.vercel.app/api/playlists?&link=' +
        link +
        '&page=0&limit=' +
        listCount;

        

      const finalRes = await axios.get(finalUrl);

      if (!finalRes.data?.success) {
        alert('Failed to fetch playlist');
        setLoading(false);
        return;
      }

      const playlistData = finalRes.data.data;
      const playlistName = playlistData.name || 'Imported Playlist';
      const songs = playlistData.songs || [];

      // 4️⃣ SAVE TO LOCAL STORAGE
      let playlists = await getCustomPlaylists();

      const newPlaylist = {
        id: Date.now().toString(),
        name: playlistName,
        songs: songs, // full songs array
      };

      playlists.push(newPlaylist);
      await saveCustomPlaylists(playlists);

      // 5️⃣ FINALLY CLOSE MODAL
      setLoading(false);
      onClose();
      setLink('');
      
      setCustomPlaylistUpdated(!CustomPlaylistUpdated)
      alert('Playlist imported successfully!');
    } catch (err) {
      console.log(err);
      alert('Import failed. Check your link.');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: '90%',
                backgroundColor: '#1e293b',
                borderRadius: 15,
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 10,
                }}
              >
                Import JioSaavn Playlist
              </Text>

              <Text style={{ color: '#9ca3af', marginBottom: 15 }}>
                Paste your JioSaavn playlist link:
              </Text>
              <Text
                style={{ color: '#fbbf24', marginBottom: 10, fontSize: 13 }}
              >
                ⚠️ Important: We can import only public JioSaavn playlists. If
                your playlist is set to private, open JioSaavn → make it public (change its visibility to public) → copy
                the link → paste here.
              </Text>

              <TextInput
                placeholder="https://www.jiosaavn.com/s/playlist/..."
                placeholderTextColor="#6b7280"
                value={link}
                onChangeText={setLink}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 16,
                  marginBottom: 20,
                }}
              />

              {/* LOADING BUTTON */}
              {loading ? (
                <View
                  style={{
                    backgroundColor: '#0d9488',
                    padding: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Importing...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={importPlaylist}
                  style={{
                    backgroundColor: '#10b981',
                    padding: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
                  >
                    Import Playlist
                  </Text>
                </TouchableOpacity>
              )}

              {!loading && (
                <TouchableOpacity
                  onPress={onClose}
                  style={{ alignItems: 'center' }}
                >
                  <Text style={{ color: '#9ca3af', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
