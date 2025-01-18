import React, {useEffect, useState, useRef} from 'react';
import {Alert, StatusBar, View, TouchableOpacity, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';
import styles from '../../../styles/global.style';
import CustomFooter from 'components/CustomFooter';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Bus from 'assets/icons/home/bus.svg';
import Location from 'assets/icons/home/location.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';

export const PassengerMapScreen = () => {
  const mapRef = useRef(null);
  const [trufiLocation, setTrufiLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [driverPlate, setDriverPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [busCount, setBusCount] = useState(0);
  const [travelTime, setTravelTime] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [changeRoute, setChangeRoute] = useState(false); // Nuevo estado para manejar el cambio de ruta

  const destination = {
    latitude: -17.39978814240143,
    longitude: -66.14228137977041,
  };

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

  const userCountRef = database().ref('/PASAJERO');

  const fetchUserCount = async () => {
    try {
      userCountRef.on('value', snapshot => {
        const count = snapshot.val();
        setUserCount(count || 0);
      });
    } catch (error) {
      console.error('Error al obtener el contador de usuarios:', error);
    }
  };

  const incrementUserCount = async () => {
    try {
      const currentCount = (await userCountRef.once('value')).val() || 0;
      userCountRef.set(currentCount + 1);
    } catch (error) {
      console.error('Error al incrementar el contador de usuarios:', error);
    }
  };

  const decrementUserCount = async () => {
    try {
      const currentCount = (await userCountRef.once('value')).val() || 0;
      userCountRef.set(Math.max(currentCount - 1, 0));
    } catch (error) {
      console.error('Error al decrementar el contador de usuarios:', error);
    }
  };

  const resetUserCount = async () => {
    try {
      const currentCount = (await userCountRef.once('value')).val() || 0;
      if (currentCount > 0) {
        userCountRef.set(0);
      }
    } catch (error) {
      console.error('Error al resetear el contador de usuarios:', error);
    }
  };

  const checkResetTime = () => {
    const resetHour = 3;
    const resetMinute = 0;

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    if (currentHour === resetHour && currentMinute === resetMinute) {
      resetUserCount();
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkResetTime();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchTrufiLocation = async () => {
    try {
      const plate = await AsyncStorage.getItem('driverPlate');
      if (plate && typeof plate === 'string' && plate.trim() !== '') {
        setDriverPlate(plate);

        const locationRef = database().ref(`/TRUFI/${plate}/ubicacion_actual`);
        locationRef.on('value', snapshot => {
          const data = snapshot.val();
          if (data?.latitude && data?.longitude) {
            const currentLocation = {
              latitude: data.latitude,
              longitude: data.longitude,
            };

            setTrufiLocation(currentLocation);
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  ...currentLocation,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                },
                1000,
              );
            }
          }
        });

        // Escuchar cambios en el campo cambio_ruta
        const routeChangeRef = database().ref(`/TRUFI/${plate}/cambio_ruta`);
        routeChangeRef.on('value', snapshot => {
          const cambioRuta = snapshot.val();
          setChangeRoute(cambioRuta === true); // Actualizar el estado si hay un cambio de ruta
        });
      }
    } catch (error) {
      console.error('Error al obtener la ubicación de Firebase:', error);
    }
  };

  const fetchDriverName = async () => {
    try {
      const ci = await AsyncStorage.getItem('driverCI');
      if (ci && typeof ci === 'string' && ci.trim() !== '') {
        const driverRef = database().ref(`/CONDUCTOR/${ci}/nombre`);
        driverRef.once('value').then(snapshot => {
          const name = snapshot.val();
          if (name) {
            setDriverName(name);
          }
        });
      }
    } catch (error) {
      console.error('Error al obtener el nombre del conductor:', error);
    }
  };

  const fetchBusCount = async () => {
    try {
      const trufiRef = database().ref('/TRUFI');
      trufiRef.on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
          const activeTrufis = Object.values(data).filter(
            (trufi: any) => trufi.servicio === true,
          );
          setBusCount(activeTrufis.length);
        } else {
          setBusCount(0);
        }
      });
    } catch (error) {
      console.error('Error al contar los Trufis en servicio:', error);
    }
  };

  const handleCenterLocation = () => {
    if (trufiLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...trufiLocation,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        1000,
      );
    } else {
      Alert.alert(
        'Ubicación no disponible',
        'No se ha cargado la ubicación del Trufi.',
      );
    }
  };

  useEffect(() => {
    incrementUserCount();
    fetchTrufiLocation();
    fetchDriverName();
    fetchBusCount();
    fetchUserCount();

    return () => {
      decrementUserCount();
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
          showsScale={true}
          showsTraffic={true}
          showsBuildings={true}
          region={
            trufiLocation
              ? {
                  ...trufiLocation,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }
              : {
                  latitude: -17.338151,
                  longitude: -66.265726,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }
          }>
          {trufiLocation && (
            <MapViewDirections
              origin={trufiLocation}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="blue"
              onReady={result => {
                console.log('Tiempo estimado:', result.duration);
                const timeInSeconds = Math.round(result.duration * 60);
                setTravelTime(timeInSeconds);
              }}
              onError={errorMessage => {
                console.error('Error con Directions API:', errorMessage);
              }}
            />
          )}

          {trufiLocation && (
            <Marker
              coordinate={trufiLocation}
              title="Ubicación Actual del Trufi">
              <Bus width={50} height={50} />
            </Marker>
          )}

          <Marker coordinate={destination} title="Destino" />
        </MapView>

        {/* Mostrar notificación de cambio de ruta */}
        {changeRoute && (
          <View
            style={tw`absolute top-20 left-0 right-0 flex justify-center items-center`}>
            <View
              style={tw`bg-red-600 bg-opacity-70 p-3 items-center rounded-lg w-[95%]`}>
              <Text style={tw`text-white text-lg font-bold text-center`}>
                ¡Atención! El trufi ha cambiado de ruta. Esté atento a la
                navegación.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            tw`absolute bottom-25 right-4 bg-[#222936] bg-opacity-50 p-2 rounded-full`,
          ]}
          onPress={handleCenterLocation}>
          <Location width={35} height={35} />
        </TouchableOpacity>

        <View style={tw`absolute bottom-0 left-0 right-0`}>
          <CustomFooter
            plate={driverPlate}
            name={driverName}
            time={travelTime}
            busCount={busCount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PassengerMapScreen;
