import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function HorizontalRadioList({ radios, onRadioPress,  hasRadioQueue, setHasRadioQueue, loading = false}) {

  // Skeleton Card for loading state
  const SkeletonCard = (_, i) => (
    <View key={i} style={{
      marginRight: 16,
      width: 140,
      height: 140,
      borderRadius: 5,
      backgroundColor: '#334155',
    }} />
  );

  // Render one radio card
  const renderCard = (radio) => {
    return (
      <TouchableOpacity
        key={radio.id || radio.stationid || radio.title || radio.artistid}  // unique key fallback
        activeOpacity={0.85}
        // onPress={HasArtitsRadio == true ? () => onRadioPress('hindi' ,radio.name):() => onRadioPress(radio.more_info.language ,radio.id)}
        onPress={() => onRadioPress(radio.more_info?.language || radio?.language || 'hindi' ,radio?.name || radio?.id)}
        style={{
          marginRight: 16,
          width: 150,
          borderRadius: 5,
          overflow: 'hidden',
          backgroundColor: '#1e293b',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Image
          source={{ uri: radio.image || radio.logo || radio.cover }}
          style={{ width: '100%', height: 140 }}
          resizeMode="cover"
        />
        <View style={{ padding: 8 }}>
          <Text
            numberOfLines={1}
            style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}
          >
            {radio.title || radio.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}
          >
            {/* {radio.subtitle || radio.language || 'Radio Station'} */}
            {'Radio Station'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
        {[...Array(5)].map(SkeletonCard)}
      </ScrollView>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 0 }}>
      {radios.map(renderCard)}
    </ScrollView>
  );
}
