import React from 'react';
import {View} from 'react-native';

export default function GradientView({colors, children, className, style, ...props}) {
  // Use first color as solid background
  const backgroundColor = colors ? colors[0] : 'transparent';
  
  return (
    <View 
      className={className} 
      style={[{backgroundColor}, style]} 
      {...props}>
      {children}
    </View>
  );
}
