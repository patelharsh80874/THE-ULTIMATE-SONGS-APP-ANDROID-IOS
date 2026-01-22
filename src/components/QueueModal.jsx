// import React, { useEffect } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   Modal,
//   Animated,
// } from 'react-native';
// import DragList from 'react-native-draglist';
// import { PlaylistIcon, CloseCircleFill } from './icons';
// import { fetchNewRadioSongs } from '../services/api';

// const { height } = Dimensions.get('window');

// export default function QueueModal({
//   visible,
//   onClose,
//   songQueue,
//   hasRadioQueue,
//   setHasRadioQueue,
//   song,
//   currentSong,
//   setSongQueue,
//   stationId,
//   setStationId,
//   currentIndexRef,
//   playSong,
//   playNext,
//   openPlaylistModal,
//   removeFromQueue,
//   settings,
// }) {
//   const SelectFromQueue = true
//   const handleSelectFromQueue = item => {
//     playSong(item, songQueue,SelectFromQueue);
//     // onClose();
//   };

//   const handleGetNewRadioSongs = async () => {
//     // console.log(stationId);
//     // console.log(currentIndexRef);

//     const NewSongs = await fetchNewRadioSongs(stationId);

//     // ---------- 🔥 IMPORTANT LINE ----------
//     const finalQueue = [currentSong, ...NewSongs.data];

//     setSongQueue(finalQueue);
//     // console.log(finalQueue);

//     // Reset index
//     currentIndexRef.current = -1;

//     // console.log(currentIndexRef);
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide" // 👈 native slide-up animation
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <TouchableOpacity
//           style={styles.backdrop}
//           activeOpacity={1}
//           onPress={onClose}
//         />

//         <Animated.View style={styles.sheet}>
//           {/* Drag handle bar */}
//           <View style={styles.dragHandle} />

//           {/* Header */}
//           <View style={styles.header}>
//             <View className='flex flex-row justify-between items-center'>
//               <Text style={styles.title}>Now Playing Queue</Text>
//               <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
//                 <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
//                   Close
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {hasRadioQueue == true && <View className="flex flex-row justify-center items-center">
//               <TouchableOpacity
//                 style={styles.actionBtn}
//                 onPress={handleGetNewRadioSongs}
//               >
//                 <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
//                   Get New Radio Songs
//                 </Text>
//               </TouchableOpacity>
//             </View> }
//           </View>

//           {/* Song List */}
//           <DragList
//             data={songQueue}
//             keyExtractor={item => item.id}
//             onReordered={(from, to) => {
//               const updated = [...songQueue];
//               const moved = updated.splice(from, 1)[0];
//               updated.splice(to, 0, moved);
//               setSongQueue(updated);

//               // keep playback index synced
//               if (currentIndexRef?.current !== undefined) {
//                 const currentSongId = song?.id;
//                 const newIdx = updated.findIndex(s => s.id === currentSongId);
//                 if (newIdx !== -1) currentIndexRef.current = newIdx;
//               }
//             }}
//             renderItem={({ item, onDragStart, onDragEnd, isActive }) => (
//               <View
//                 style={[
//                   styles.row,
//                   {
//                     backgroundColor: isActive
//                       ? '#1f2937'
//                       : item.id === song.id
//                       ? 'rgba(16,185,129,0.08)'
//                       : '#1e293b',
//                   },
//                 ]}
//               >
//                 {/* Song Info */}
//                 <View style={styles.songInfo}>
//                   {/* ☰ drag handle */}
//                   <TouchableOpacity
//                     onPressIn={onDragStart}
//                     onPressOut={onDragEnd}
//                     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                   >
//                     <Text
//                       style={{ color: '#888', fontSize: 20, marginRight: 8 }}
//                     >
//                       ☰
//                     </Text>
//                   </TouchableOpacity>

//                   {/* Song press to play */}
//                   <TouchableOpacity
//                     onPress={() => handleSelectFromQueue(item)}
//                     activeOpacity={0.8}
//                     style={{ flexDirection: 'row', flex: 1 }}
//                   >
//                     <Image
//                       source={{
//                         uri:
//                           item.image?.[settings?.imageQualityIndex]?.url ||
//                           item.image?.[settings?.imageQualityIndex]?.link ||
//                           item.image,
//                       }}
//                       style={styles.img}
//                     />
//                     <View
//                       style={{
//                         flex: 1,
//                         marginLeft: 10,
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <Text
//                         numberOfLines={1}
//                         style={{
//                           color: item.id === song.id ? '#10b981' : '#fff',
//                           fontWeight: 'bold',
//                         }}
//                       >
//                         {item.name}
//                       </Text>
//                       <Text
//                         numberOfLines={1}
//                         style={{ color: '#aaa', fontSize: 12 }}
//                       >
//                         {item.artists?.primary?.[0]?.name || 'Unknown Artist'}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Actions */}
//                 <View style={styles.actions}>
//                   <TouchableOpacity
//                     onPress={() => playNext(item)}
//                     disabled={currentSong?.id === item.id}
//                     style={[
//                       styles.playNextBtn,
//                       currentSong?.id === item.id && { opacity: 0.4 },
//                     ]}
//                     //   className={`p-3 bg-gray-900 rounded-full ${
//                     //   currentSong.id == item.id && 'hidden'
//                     // }`}
//                   >
//                     <Text className="text-xs text-[#10b981] font-bold">
//                       Play Next
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => openPlaylistModal(item)}
//                     style={styles.actionBtn}
//                   >
//                     <PlaylistIcon size={18} color="#fff" />
//                   </TouchableOpacity>

//                   <TouchableOpacity onPress={() => removeFromQueue(item.id)}>
//                     <CloseCircleFill size={24} color="#dc2626" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//             contentContainerStyle={{ paddingBottom: 100 }}
//           />
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   sheet: {
//     backgroundColor: '#111827',
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//     padding: 16,
//     maxHeight: height * 0.7,
//   },
//   dragHandle: {
//     width: 50,
//     height: 5,
//     backgroundColor: '#374151',
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginBottom: 8,
//   },
//   header: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   title: { color: '#fff', fontWeight: '700', fontSize: 18 },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#1e293b',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 8,
//   },
//   songInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   img: { width: 56, height: 56, borderRadius: 8 },
//   actions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 8,
//     gap: 6,
//   },
//   playNextBtn: {
//     backgroundColor: '#111827',
//     padding: 10,
//     borderRadius: 100,
//   },
//   actionBtn: {
//     backgroundColor: '#222',
//     padding: 8,
//     borderRadius: 20,
//   },
// });



import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  ActivityIndicator,
  TextInput, // <-- added
} from 'react-native';
import DragList from 'react-native-draglist';
import { PlaylistIcon, CloseCircleFill } from './icons';
import { fetchNewRadioSongs } from '../services/api';

const { height } = Dimensions.get('window');
const ROW_HEIGHT = 82;

// ---- 🔥 AUTO DUPLICATE REMOVER ---- //
const uniqueById = arr => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item?.id) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default function QueueModal({
  visible,
  onClose,
  songQueue,
  hasRadioQueue,
  setHasRadioQueue,
  song,
  currentSong,
  setSongQueue,
  stationId,
  setStationId,
  currentIndexRef,
  playSong,
  playNext,
  openPlaylistModal,
  removeFromQueue,
  settings,
}) {
  const SelectFromQueue = true;

  // -------- PERFORMANCE STATES -------- //
  const [visibleQueue, setVisibleQueue] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const listRef = useRef(null);
  const BATCH_SIZE = 40;

  // ---- SEARCH STATES ---- //
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredQueue, setFilteredQueue] = useState([]);

  // ---- INITIAL VIRTUAL LOAD ---- //
  useEffect(() => {
    if (!songQueue) return;

    const cleaned = uniqueById(songQueue);

    // ---- 🔍 Apply Search if active ---- //
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = cleaned.filter(s => {
        const name = s.name?.toLowerCase() || '';
        const artist = s.artists?.primary?.[0]?.name?.toLowerCase() || '';
        const album = s.album?.name?.toLowerCase() || '';
        return name.includes(q) || artist.includes(q) || album.includes(q);
      });

      setFilteredQueue(filtered);
      setIsSearching(true);
      setVisibleQueue(filtered.slice(0, BATCH_SIZE));
      return;
    }

    // // ---- normal (non-search) load ---- //
    setIsSearching(false);
    setVisibleQueue(cleaned.slice(0, BATCH_SIZE));
  }, [songQueue, searchQuery]);

  // ---- INFINITE LOAD ---- //
  const handleEndReached = () => {
    const cleaned = uniqueById(songQueue);

    const base = isSearching ? filteredQueue : cleaned;

    if (visibleQueue.length >= base.length) return;

    const more = base.slice(
      visibleQueue.length,
      visibleQueue.length + BATCH_SIZE,
    );

    setVisibleQueue(prev => [...prev, ...more]);
  };

  // ---- RESTORE SCROLL POSITION ---- //
  useEffect(() => {
    if (visible && listRef.current) {
      setTimeout(() => {
        try {
          listRef.current.scrollToOffset({
            offset: scrollOffset,
            animated: false,
          });
        } catch (e) {}
      }, 50);
    }
  }, [visible]);

  // ---- SELECT SONG ---- //
  const handleSelectFromQueue = item => {
    playSong(item, songQueue, SelectFromQueue);
  };

  // ---- REORDER ---- //
  const handleReorder = (from, to) => {
    if (isSearching) return; // disable reorder during search

    const cleaned = uniqueById(songQueue);

    const updated = [...cleaned];
    const moved = updated.splice(from, 1)[0];
    updated.splice(to, 0, moved);

    setSongQueue(updated);

    if (currentIndexRef?.current !== undefined) {
      const currentId = currentSong?.id;
      const newIndex = updated.findIndex(s => s.id === currentId);
      if (newIndex !== -1) currentIndexRef.current = newIndex;
    }
  };

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  // ---- RADIO FETCH ---- //
  const handleGetNewRadioSongs = async () => {
    const NewSongs = await fetchNewRadioSongs(stationId);
    const finalQueue = [currentSong, ...NewSongs.data];

    setSongQueue(finalQueue);
    currentIndexRef.current = -1;
  };

  // ---- RENDER ROW ---- //
  const renderItem = useCallback(
    ({ item, onDragStart, onDragEnd, isActive }) => (
      <View
        style={[
          styles.row,
          {
            height: ROW_HEIGHT - 8,
            backgroundColor: isActive
              ? '#1f2937'
              : item.id === song.id
              ? 'rgba(16,185,129,0.08)'
              : '#1e293b',
          },
        ]}
      >
        {/* Song Info */}
        <View style={styles.songInfo}>
          {isSearching === false && (
            <TouchableOpacity
              onPressIn={onDragStart}
              onPressOut={onDragEnd}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isSearching} // disable drag handle in search mode
            >
              <Text style={{ color: '#888', fontSize: 20, marginRight: 8 }}>
                ☰
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleSelectFromQueue(item)}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', flex: 1 }}
          >
            <Image
              source={{
                uri:
                  item.image?.[settings?.imageQualityIndex]?.url ||
                  item.image?.[settings?.imageQualityIndex]?.link ||
                  item.image,
              }}
              style={styles.img}
            />
            <View style={{ flex: 1, marginLeft: 10, justifyContent: 'center' }}>
              <Text
                numberOfLines={1}
                style={{
                  color: item.id === song.id ? '#10b981' : '#fff',
                  fontWeight: 'bold',
                }}
              >
                {item.name}
              </Text>
              <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 12 }}>
                {item.artists?.primary?.[0]?.name || 'Unknown Artist'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => playNext(item)}
            disabled={currentSong?.id === item.id}
            style={[
              styles.playNextBtn,
              currentSong?.id === item.id && { opacity: 0.4 },
            ]}
          >
            <Text
              style={{ color: '#10b981', fontWeight: 'bold', fontSize: 10 }}
            >
              Next
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openPlaylistModal(item)}
            style={styles.actionBtn}
          >
            <PlaylistIcon size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => removeFromQueue(item.id)}>
            <CloseCircleFill size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [song, currentSong, settings, isSearching],
  );

  // ---- JUMP TO CURRENT ---- //
  const jumpToCurrent = () => {
    const base = isSearching ? filteredQueue : visibleQueue;
    const index = base.findIndex(s => s.id === currentSong?.id);

    if (index !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true });
    }
  };



  // ----------------------- UI ----------------------- //

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View className="flex-row items-center justify-between w-full ">
              <Text style={styles.title}>Now Playing Queue</Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={jumpToCurrent}
                  style={styles.actionBtn}
                >
                  <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
                    Jump to Current
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
                  <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {hasRadioQueue && (
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: 10 }]}
                onPress={handleGetNewRadioSongs}
              >
                <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
                  Get New Radio Songs
                </Text>
              </TouchableOpacity>
            )}

            {/* 🔍 SEARCH BAR */}
            <TextInput
              placeholder="Search in queue (song, artist, album)..."
              placeholderTextColor="#6b7280"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {isSearching && (
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
                Drag & reorder is disabled while searching.
              </Text>
            )}
          </View>

          {/* LOADER + EMPTY SEARCH MESSAGE */}
          {visibleQueue.length === 0 ? (
            searchQuery.length > 0 ? (
              // 🔍 NO RESULTS UI
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text
                  style={{ fontSize: 16, color: '#ccc', fontWeight: '600' }}
                >
                  No results found
                </Text>
                <Text style={{ marginTop: 6, color: '#888', fontSize: 12 }}>
                  Try a different keyword
                </Text>
              </View>
            ) : (
              // ⏳ NORMAL LOADING
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ marginTop: 10, color: '#ccc' }}>Loading…</Text>
              </View>
            )
          ) : (
            <DragList
              ref={listRef}
              data={visibleQueue}
              keyExtractor={(item, index) => item.id + '-' + index}
              onReordered={handleReorder}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 100 }}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.6}
              getItemLayout={getItemLayout}
              initialNumToRender={12}
              maxToRenderPerBatch={18}
              windowSize={12}
              updateCellsBatchingPeriod={40}
              removeClippedSubviews
              onScroll={e => setScrollOffset(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    maxHeight: height * 0.7,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#374151',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  img: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 6,
  },
  playNextBtn: {
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 100,
  },
  actionBtn: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 20,
  },

  // 🔍 Search
  searchInput: {
    backgroundColor: '#020617',
    color: 'white',
    padding: 10,
    fontSize: 14,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    width: '100%',
  },
});
