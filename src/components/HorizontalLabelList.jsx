import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

export default function HorizontalLabelList({
  labels = [],
  onPressLabel,
  loading = false,
}) {
  // Skeleton Card
  const SkeletonCard = (_, i) => (
    <View
      key={i}
      style={{
        marginRight: 16,
        width: 150,
        borderRadius: 6,
        backgroundColor: "rgb(17 24 39 / 0.6)",
        overflow: "hidden",
        height: 185,
        borderWidth: 1,
        borderColor: "#223042",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 115,
          backgroundColor: "#253146",
          opacity: 0.38,
        }}
      />
      <View
        style={{
          width: "70%",
          height: 15,
          backgroundColor: "#253146",
          marginTop: 16,
          marginHorizontal: 10,
          borderRadius: 8,
          opacity: 0.26,
        }}
      />
      <View
        style={{
          width: "50%",
          height: 12,
          backgroundColor: "#253146",
          marginTop: 8,
          marginHorizontal: 10,
          borderRadius: 7,
          opacity: 0.18,
        }}
      />
    </View>
  );

  // Loading Shimmer
  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 24,
          paddingTop: 2,
          paddingBottom: 8,
        }}
      >
        {[...Array(6)].map(SkeletonCard)}
      </ScrollView>
    );
  }

  // Main Card
  const renderCard = (item) => {
    return (
      <TouchableOpacity
        key={item.token}
        activeOpacity={0.85}
        onPress={() => onPressLabel(item)}
        style={{
          marginRight: 16,
          width: 150,
          borderRadius: 6,
          overflow: "hidden",
          backgroundColor: "rgb(17 24 39 / 0.6)",
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 150 }}
          resizeMode="cover"
        />

        <View style={{ padding: 10 }}>
          <Text
            numberOfLines={1}
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{ color: "#94a3b8", fontSize: 12 }}
          >
            Label
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 24 }}
    >
      {labels.map(renderCard)}
    </ScrollView>
  );
}
