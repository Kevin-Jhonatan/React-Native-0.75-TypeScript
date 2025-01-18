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
  const [userCount, setUserCount] = useState(0); // Estado para la cantidad de pasajeros

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

  // Recuperar y escuchar la cantidad de pasajeros en tiempo real
  const listenPassengerCount = () => {
    if (!driverPlate) {
      return;
    }

    const passengerRef = database().ref('/PASAJERO');

    // Escuchar los cambios en la cantidad de pasajeros
    passengerRef.on('value', snapshot => {
      if (snapshot.exists()) {
        setUserCount(snapshot.val());
      } else {
        setUserCount(0); // Si no hay datos, poner el conteo en 0
      }
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      passengerRef.off();
    };
  };

  const updateLocationInDatabase = async (
    latitude: number,
    longitude: number,
  ) => {
    if (!driverPlate) {
      console.log('Placa no definida. No se puede actualizar Firebase.');
      return;
    }

    try {
      const locationRef = database().ref(
        `/TRUFI/${driverPlate}/ubicacion_actual`,
      );

      locationRef.set({latitude, longitude});
      locationRef.onDisconnect().set({latitude, longitude}); // Mantener ubicación aunque se pierda la conexión

      console.log(`Ubicación actualizada para ${driverPlate}:`, {
        latitude,
        longitude,
      });
    } catch (error) {
      console.error('Error al actualizar la ubicación en Firebase:', error);
    }
  };

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

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido');
          startTracking();
        } else {
          Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
        }
      } catch (error) {
        console.warn(error);
      }
    } else {
      startTracking();
    }
  };

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
      {enableHighAccuracy: true, distanceFilter: 2},
    );
  };

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
    requestLocationPermission();

    // Empezar a escuchar la cantidad de pasajeros
    listenPassengerCount();

    return () => {
      stopTracking();
    };
  }, [driverCI, driverPlate]);

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
          <CustomFooter
            plate={driverPlate}
            name={driverName}
            userCount={userCount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DriverMapScreen;
