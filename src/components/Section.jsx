import React from 'react';
import {View, Text} from 'react-native';

export default function Section({title, icon, children}) {
  const getIcon = () => {
    switch (icon) {
      case 'fire':
        return '🔥';
      case 'chart':
        return '📈';
      case 'playlist':
        return '🎵';
      case 'disc':
        return '💿';
      default:
        return '🎶';
    }
  };

  return (
    <View className="mt-8">
      <View className="flex-row items-center gap-3 mb-4">
        {icon && (
          <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center">
            <Text className="text-xl">{getIcon()}</Text>
          </View>
        )}
        <Text className="text-white text-2xl font-bold flex-1">{title}</Text>
      </View>
      {children}
    </View>
  );
}
