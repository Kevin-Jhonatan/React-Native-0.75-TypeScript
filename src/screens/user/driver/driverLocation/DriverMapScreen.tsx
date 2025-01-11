import React, {useEffect, useState, useRef} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StatusBar,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';
import styles from '../../../../styles/global.style';
import CustomFooter from 'components/CustomFooter';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Bus from 'assets/icons/home/bus.svg';
import Location from 'assets/icons/home/location.svg';

const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

export const DriverMapScreen = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState({
    latitude: -17.338151,
    longitude: -66.265726,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [duration, setDuration] = useState(0);

  const origin = {
    latitude: -17.338552892340243,
    longitude: -66.26542967194706,
  };

  const destination = {
    latitude: -17.39978814240143,
    longitude: -66.14228137977041,
  };

  const waypoints = [
    {latitude: -17.349325, longitude: -66.257205},
    {latitude: -17.39107676884926, longitude: -66.25080724762616},
    {latitude: -17.39388, longitude: -66.174089},
    {latitude: -17.394047, longitude: -66.17075},
    {latitude: -17.393026, longitude: -66.161082},
    {latitude: -17.399382486699547, longitude: -66.16044390689545},
    {latitude: -17.39714245915778, longitude: -66.145297195534},
    {latitude: -17.39814994910454, longitude: -66.13992678007511},
  ];

  const getUsersCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Ubicación actual:', position);
        const {latitude, longitude} = position.coords;
        if (latitude && longitude) {
          setLocation({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          });
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003,
              },
              1000,
            );
          }
        } else {
          console.log('Error en las coordenadas');
        }
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 10000},
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido');
          getUsersCurrentLocation();
        } else {
          Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <SafeAreaView style={[tw`flex-1`, styles.container]}>
      <StatusBar hidden={false} />
      <View style={tw`flex-1 relative`}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{flex: 1}}
          region={location}
          showsUserLocation={true}
          followsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={region => console.log('Region:', region)}>
          <Marker coordinate={origin} title="Punto A" />
          <Marker coordinate={destination} title="Punto B" />
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Ubicación Actual">
            <Bus width={50} height={50} />
          </Marker>
          <MapViewDirections
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={6}
            strokeColor="blue"
            onReady={result => {
              setDuration(Math.round(result.duration * 60));
              console.log(`Distancia: ${result.distance} km`);
              console.log(`Duración: ${result.duration} min`);
            }}
            onError={errorMessage => {
              console.log('Error:', errorMessage);
            }}
          />
        </MapView>
        <TouchableOpacity
          style={[
            tw`absolute bottom-25 right-4 bg-[#222936] bg-opacity-50 p-2 rounded-full`,
          ]}
          onPress={getUsersCurrentLocation}>
          <Location width={35} height={35} />
        </TouchableOpacity>
        <View style={tw`absolute bottom-0 left-0 right-0`}>
          <CustomFooter plate="ABC-1234" name="Kevin Jhonatan" userCount={5} />
        </View>
      </View>
    </SafeAreaView>
  );
};
