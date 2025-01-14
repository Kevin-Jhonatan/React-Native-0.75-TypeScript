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
import Bus from 'assets/icons/home/bus.svg';
import Location from 'assets/icons/home/location.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';

const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

export const DriverMapScreen = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState({
    latitude: -17.338151,
    longitude: -66.265726,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [driverCI, setDriverCI] = useState('');
  const [driverPlate, setDriverPlate] = useState('');
  const watchId = useRef<number | null>(null);

  // Actualizar ubicación en Firebase
  const updateLocationInDatabase = async (latitude: number, longitude: number) => {
    if (!driverCI || !driverPlate) {
      return; // Evitar llamadas innecesarias si no están los datos
    }
    try {
      await database()
        .ref(`/TRUFI/${driverPlate}/ubicacion_actual`)
        .set({latitude, longitude});
      console.log(`Ubicación actualizada para ${driverPlate}:`, {latitude, longitude});
    } catch (error) {
      console.error('Error al actualizar la ubicación en Firebase:', error);
    }
  };

  // Obtener la ubicación del usuario y actualizar en Firebase
  const getUsersCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        updateLocationInDatabase(latitude, longitude); // Actualizar en Firebase
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            },
            1000,
          );
        }
      },
      error => {
        console.log('Error al obtener la ubicación:', error);
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 10000},
    );
  };

  // Solicitar permiso de ubicación
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido');
          startTracking(); // Iniciar el rastreo de ubicación
        } else {
          Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  // Iniciar el rastreo de ubicación en tiempo real
  const startTracking = () => {
    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        updateLocationInDatabase(latitude, longitude); // Actualizar en Firebase
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
      },
      error => {
        console.log('Error al rastrear ubicación:', error);
      },
      {enableHighAccuracy: true, distanceFilter: 2}, // Actualizar cada 10 metros
    );
  };

  // Detener el rastreo de ubicación
  const stopTracking = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  useEffect(() => {
    const getDriverData = async () => {
      try {
        const storedCI = await AsyncStorage.getItem('driverCI');
        const storedPlate = await AsyncStorage.getItem('driverPlate');
        if (storedCI && storedPlate) {
          setDriverCI(storedCI);
          setDriverPlate(storedPlate);
          console.log(`Datos recuperados: C.I.=${storedCI}, Placa=${storedPlate}`);
        } else {
          console.log('No se encontraron datos del conductor en AsyncStorage.');
        }
      } catch (error) {
        console.error('Error al recuperar datos del conductor:', error);
      }
    };

    getDriverData();
    requestLocationPermission();

    return () => {
      stopTracking(); // Detener el seguimiento al desmontar el componente
    };
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
          showsMyLocationButton={false}>
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Ubicación Actual">
            <Bus width={50} height={50} />
          </Marker>
        </MapView>
        <TouchableOpacity
          style={[
            tw`absolute bottom-25 right-4 bg-[#222936] bg-opacity-50 p-2 rounded-full`,
          ]}
          onPress={getUsersCurrentLocation}>
          <Location width={35} height={35} />
        </TouchableOpacity>
        <View style={tw`absolute bottom-0 left-0 right-0`}>
          <CustomFooter plate={driverPlate} name="Conductor" userCount={5} />
        </View>
      </View>
    </SafeAreaView>
  );
};
