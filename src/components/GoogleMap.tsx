import React from 'react';
import {StyleSheet, View} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Bus from '../assets/icons/home/bus.svg';
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

type MarkerProps = {
  latitude: number;
  longitude: number;
  title?: string;
};

type GoogleMapProps = {
  initialRegion?: Region;
  markers?: MarkerProps[];
  directions?: {
    origin: MarkerProps;
    destination: MarkerProps;
  }[];
  busLocation?: MarkerProps;
};

export const GoogleMap = ({
  initialRegion = {
    latitude: -17.338151,
    longitude: -66.265726,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  },
  markers = [],
  directions = [],
  busLocation = {
    latitude: -17.34,
    longitude: -66.26,
  },
}: GoogleMapProps) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
          />
        ))}

        <Marker coordinate={busLocation} title="Ubicación del Bus">
          <Bus width={100} height={100} />
        </Marker>

        {directions.map((direction, index) => (
          <MapViewDirections
            key={index}
            origin={{
              latitude: direction.origin.latitude,
              longitude: direction.origin.longitude,
            }}
            destination={{
              latitude: direction.destination.latitude,
              longitude: direction.destination.longitude,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        ))}
      </MapView>
    </View>
  );
};
