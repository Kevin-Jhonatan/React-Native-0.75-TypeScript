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
  const [driverName, setDriverName] = useState('');

  const fetchDriverName = async () => {
    if (!driverCI) {
      return;
    }

    try {
      const snapshot = await database()
        .ref(`/CONDUCTOR/${driverCI}/nombre`)
        .once('value');
      if (snapshot.exists()) {
        setDriverName(snapshot.val());
      } else {
        console.log(`No se encontró el conductor con CI: ${driverCI}`);
      }
    } catch (error) {
      console.error('Error al recuperar el nombre del conductor:', error);
    }
  };

  // Actualizar ubicación en Firebase
  const updateLocationInDatabase = async (
    latitude: number,
    longitude: number,
  ) => {
    if (!driverPlate) {
      console.log('Placa no definidos. No se puede actualizar Firebase.');
      return;
    }
    try {
      const locationRef = database().ref(
        `/TRUFI/${driverPlate}/ubicacion_actual`,
      );

      // Escribir datos en Firebase
      await locationRef.set({latitude, longitude});

      // Configurar onDisconnect
      locationRef.onDisconnect().remove();

      console.log(`Ubicación actualizada para ${driverPlate}:`, {
        latitude,
        longitude,
      });
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
    } else {
      // Si es iOS, no es necesario pedir el permiso manualmente en este caso
      startTracking();
    }
  };

  // Iniciar el rastreo de ubicación en tiempo real
  const startTracking = () => {
    if (!driverPlate) {
      console.log(
        'Datos de conductor no disponibles PLACA, no se puede iniciar el rastreo',
      );
      return;
    }

    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('Ubicación capturada:', {latitude, longitude});
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
      {enableHighAccuracy: true, distanceFilter: 2}, // Actualizar cada 2 metros
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
          console.log(
            `Datos recuperados: C.I.=${storedCI}, Placa=${storedPlate}`,
          );
          fetchDriverName();
        } else {
          console.log('No se encontraron datos del conductor en AsyncStorage.');
        }
      } catch (error) {
        console.error('Error al recuperar datos del conductor:', error);
      }
    };

    getDriverData();
    requestLocationPermission(); // Pedir permiso de ubicación

    return () => {
      stopTracking(); // Detener el seguimiento al desmontar el componente
    };
  }, [driverCI, driverPlate]); // Recalcular cada vez que el CI o la placa cambien

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
          <CustomFooter plate={driverPlate} name={driverName} userCount={5} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DriverMapScreen;
