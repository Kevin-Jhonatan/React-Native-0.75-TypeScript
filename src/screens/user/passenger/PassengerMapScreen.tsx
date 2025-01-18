import React, {useEffect, useState, useRef} from 'react';
import {Alert, StatusBar, View, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';
import styles from '../../../styles/global.style';
import CustomFooter from 'components/CustomFooter';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
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
  const [routePath, setRoutePath] = useState<
    {latitude: number; longitude: number}[]
  >([]);
  const [busCount, setBusCount] = useState(0);
  const [travelTime, setTravelTime] = useState(0); // Estado para el tiempo estimado
  const [userCount, setUserCount] = useState(0); // Estado para contar los usuarios

  const destination = {
    latitude: -17.39978814240143,
    longitude: -66.14228137977041,
  };

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

  // Referencia de Firebase para el contador de usuarios
  const userCountRef = database().ref('/PASAJERO');

  // Función para obtener el número de usuarios
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

  // Función para incrementar el contador de usuarios
  const incrementUserCount = async () => {
    try {
      const currentCount = (await userCountRef.once('value')).val() || 0;
      userCountRef.set(currentCount + 1);
    } catch (error) {
      console.error('Error al incrementar el contador de usuarios:', error);
    }
  };

  // Función para decrementar el contador de usuarios
  const decrementUserCount = async () => {
    try {
      const currentCount = (await userCountRef.once('value')).val() || 0;
      userCountRef.set(Math.max(currentCount - 1, 0)); // Para evitar números negativos
    } catch (error) {
      console.error('Error al decrementar el contador de usuarios:', error);
    }
  };

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
            setRoutePath(prevPath => [...prevPath, currentLocation]);

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
    // Incrementar el contador de usuarios cuando la pantalla se monta
    incrementUserCount();

    // Llamar a las funciones existentes
    fetchTrufiLocation();
    fetchDriverName();
    fetchBusCount();
    fetchUserCount();

    // Limpiar el contador cuando el componente se desmonte
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
          {/* Polyline de la ruta */}
          <Polyline
            coordinates={routePath}
            strokeColor="#FF5733"
            strokeWidth={4}
          />

          {/* Dirección y cálculo de tiempo */}
          {trufiLocation && (
            <MapViewDirections
              origin={trufiLocation}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="blue"
              onReady={result => {
                console.log('Tiempo estimado:', result.duration);
                const timeInSeconds = Math.round(result.duration * 60); // Convertir minutos a segundos
                setTravelTime(timeInSeconds);

                // Actualiza el tiempo en Firebase para el Trufi correspondiente
                if (driverPlate) {
                  const trufiRef = database().ref(`/TRUFI/${driverPlate}`);
                  trufiRef
                    .update({
                      tiempo: timeInSeconds, // Actualizar el campo "tiempo"
                    })
                    .then(() => {
                      console.log('Tiempo actualizado en Firebase');
                    })
                    .catch(error => {
                      console.error(
                        'Error al actualizar el tiempo en Firebase:',
                        error,
                      );
                    });
                }
              }}
              onError={errorMessage => {
                console.error('Error con Directions API:', errorMessage);
              }}
            />
          )}

          {/* Marcador de la ubicación del Trufi */}
          {trufiLocation && (
            <Marker
              coordinate={trufiLocation}
              title="Ubicación Actual del Trufi">
              <Bus width={50} height={50} />
            </Marker>
          )}

          {/* Marcador de destino */}
          <Marker coordinate={destination} title="Destino" />
        </MapView>

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
            time={travelTime} // Mostrar tiempo dinámico
            busCount={busCount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PassengerMapScreen;
