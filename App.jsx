import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
// If you really have global.css (rare for RN) - otherwise ignore
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* StatusBar: Keep it opaque for Android, translucent only if you want content under statusbar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === 'android' ? '#111827' : 'transparent'}
        translucent={Platform.OS !== 'android'}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

