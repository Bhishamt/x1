import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const CAMPUS_LOCATIONS = [
  { id: '1', title: 'Admin Block', description: 'Main Administration Building', coordinate: { latitude: 28.7041, longitude: 77.1025 } },
  { id: '2', title: 'Computer Engineering Dept', description: 'Tech Labs & Classes', coordinate: { latitude: 28.7045, longitude: 77.1020 } },
  { id: '3', title: 'Central Library', description: 'Books, Journals, Study Area', coordinate: { latitude: 28.7035, longitude: 77.1028 } },
  { id: '4', title: 'Student Canteen', description: 'Food & Refreshments', coordinate: { latitude: 28.7038, longitude: 77.1018 } },
  { id: '5', title: 'Boys Hostel', description: 'Student Accommodation', coordinate: { latitude: 28.7050, longitude: 77.1030 } },
];

export default function CampusMapScreen() {
  const initialRegion = {
    // Center roughly around the campus average
    latitude: 28.7041,
    longitude: 77.1025,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Campus Map</Text>
        <Text style={styles.subtitle}>Find departments and facilities</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {/* If react-native-maps is not installed or configured, this assumes it is properly linked */}
        <MapView 
          style={styles.map} 
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {CAMPUS_LOCATIONS.map(loc => (
            <Marker 
              key={loc.id}
              coordinate={loc.coordinate}
              title={loc.title}
              description={loc.description}
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080c14',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#080c14',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d40',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    borderWidth: 1,
    borderColor: '#1e2d40',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
