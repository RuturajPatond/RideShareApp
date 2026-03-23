import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type HomeMapProps = {
  location: {
    latitude: number;
    longitude: number;
  } | null;
};

export default function HomeMap({ location }: HomeMapProps) {
  return (
    <View style={styles.mapContainer}>
      {location ? (
        <View style={styles.webMapFallback}>
          <View style={styles.iconWrap}>
            <Ionicons name="location" size={28} color="#46C96B" />
          </View>
          <Text style={styles.fallbackTitle}>Map preview is mobile-only</Text>
          <Text style={styles.fallbackSubtext}>
            Current location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#46C96B" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f7f5',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d9e5dc',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e3a33',
  },
  fallbackSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7a71',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
