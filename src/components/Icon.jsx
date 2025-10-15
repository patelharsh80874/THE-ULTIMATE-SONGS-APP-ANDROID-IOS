import React from 'react';
import {Text} from 'react-native';

// Unicode Icon Mapping
const ICONS = {
  // Navigation
  home: '🏠',
  homeFill: '🏠',
  search: '🔍',
  searchFill: '🔎',
  music: '🎵',
  musicFill: '🎶',
  user: '👤',
  userFill: '👤',
  disc: '💿',
  discFill: '💿',
  heart: '🤍',
  heartFill: '❤️',
  
  // Player Controls
  play: '▶️',
  pause: '⏸️',
  next: '⏭️',
  prev: '⏮️',
  shuffle: '🔀',
  
  // Actions
  close: '✕',
  down: '▼',
  up: '▲',
  check: '✓',
  dislike: '💔',
  
  // Others
  language: '🌐',
  equalizer: '📊',
};

export default function Icon({name, size = 24, color = '#fff', style}) {
  const icon = ICONS[name] || '•';
  
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          lineHeight: size + 4,
        },
        style,
      ]}>
      {icon}
    </Text>
  );
}

export {ICONS};
