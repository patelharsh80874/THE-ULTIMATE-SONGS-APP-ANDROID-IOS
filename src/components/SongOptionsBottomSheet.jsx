import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function SongOptionsBottomSheet({
  isVisible,
  onClose,
  song,
  onAddToPlaylist,
  onPlayNext,
  onRemove,
  HasThreeBT,
  currentSong,
  handlePlayNow,
}) {
  if (!song) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Dimmed background */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <View style={styles.sheetContainer}>
        {/* Drag handle bar */}
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Song Options</Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Playlist */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onAddToPlaylist?.(song);
            onClose();
          }}
        >
          <Text style={styles.optionText}>➕ Add to Playlist</Text>
        </TouchableOpacity>

        {/* Play Next (hide if it’s the current song) */}
        {currentSong && currentSong?.id !== song?.id && (
          <TouchableOpacity
            style={styles.option}
            // disabled={currentSong?.id !== song?.id}
            onPress={() => {
              onPlayNext?.(song);
              onClose();
            }}
          >
            <Text style={[styles.optionText, { color: '#10b981' }]}>
              ⏯️ Play Next
            </Text>
          </TouchableOpacity>
        )}

               {/* Play Next (hide if it’s the current song) */}
        {currentSong && currentSong?.id !== song?.id && (
          <TouchableOpacity
            style={styles.option}
            // disabled={currentSong?.id !== song?.id}
            onPress={() => {
              handlePlayNow?.(song);
              onClose();
            }}
          >
            <Text style={[styles.optionText, { color: '#10b981' }]}>
              ▶️ Play Now
            </Text>
          </TouchableOpacity>
        )}

        {/* Remove from Playlist */}
        {HasThreeBT === true && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onRemove?.(song.id);
              onClose();
            }}
          >
            <Text style={[styles.optionText, { color: '#f87171' }]}>
              ❌ Remove from Playlist
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: height * 0.5,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#374151',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  option: {
    paddingVertical: 12,
    borderBottomColor: '#374151',
    borderBottomWidth: 1,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight:'bold'
  },
});
