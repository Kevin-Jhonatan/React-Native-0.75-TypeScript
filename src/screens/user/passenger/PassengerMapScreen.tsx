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
  const [changeRoute, setChangeRoute] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);
  const [routeType, setRouteType] = useState('');

  const origin = {
    latitude: -17.33859257038202,
    longitude: -66.26531616476052,
  };

  const originCercado = {
    latitude: -17.402183531905933,
    longitude: -66.15742011441137,
  };

  const destination = {
    latitude: -17.39978814240143,
    longitude: -66.14228137977041,
  };

  const waypointsIda = [
    {latitude: -17.4021685925118, longitude: -66.15742588317967},
    {latitude: -17.33863446200111, longitude: -66.26309773059667},
    {latitude: -17.39100262021613, longitude: -66.25082495172785},
    {latitude: -17.392993815878185, longitude: -66.16107621597105},
    {latitude: -17.39818542462651, longitude: -66.1601214098827},
    {latitude: -17.398261321590045, longitude: -66.1604277696283},
    {latitude: -17.399502273449464, longitude: -66.15782401999437},
    {latitude: -17.398872578270336, longitude: -66.15321793439516},
    {latitude: -17.39759404160366, longitude: -66.14280356248285},
    {latitude: -17.398980875179223, longitude: -66.14250537172897},
  ];

  const waypointsVuelta = [
    {latitude: -17.39938461137184, longitude: -66.15769536892893},
    {latitude: -17.40019781173653, longitude: -66.16260822492248},
    {latitude: -17.39650205733427, longitude: -66.17088443375425},
    {latitude: -17.393486890387916, longitude: -66.17052883154157},
    {latitude: -17.39103868984605, longitude: -66.25084959132158},
    {latitude: -17.36427321158561, longitude: -66.25272991107234},
    {latitude: -17.34936655402069, longitude: -66.2571895670967},
    {latitude: -17.338620053424684, longitude: -66.26317401818653},
    {latitude: -17.338581047773562, longitude: -66.26391534423364},
    {latitude: -17.337784255795736, longitude: -66.26390366603778},
    {latitude: -17.337761961546608, longitude: -66.26595836266443},
    {latitude: -17.338587848459927, longitude: -66.266001996384},
    {latitude: -17.338594137487213, longitude: -66.26532234049256},
  ];

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

  const fetchRouteType = async () => {
    try {
      const plate = await AsyncStorage.getItem('driverPlate');
      if (plate && typeof plate === 'string' && plate.trim() !== '') {
        const routeRef = database().ref(`/TRUFI/${plate}/sentido_ruta`);
        routeRef.on('value', snapshot => {
          const route = snapshot.val();
          setRouteType(route || '');
        });
      }
    } catch (error) {
      console.error('Error al obtener el tipo de ruta de Firebase:', error);
    }
  };

  const fetchServiceStatus = async () => {
    try {
      const plate = await AsyncStorage.getItem('driverPlate');
      if (plate && typeof plate === 'string' && plate.trim() !== '') {
        const serviceRef = database().ref(`/TRUFI/${plate}/servicio`);
        serviceRef.on('value', snapshot => {
          const isActive = snapshot.val();
          setIsServiceActive(isActive === true);
        });
      }
    } catch (error) {
      console.error(
        'Error al obtener el estado de servicio de Firebase:',
        error,
      );
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

        const routeChangeRef = database().ref(`/TRUFI/${plate}/cambio_ruta`);
        routeChangeRef.on('value', snapshot => {
          const cambioRuta = snapshot.val();
          setChangeRoute(cambioRuta === true);
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
    const intervalId = setInterval(() => {
      checkResetTime();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    incrementUserCount();
    fetchTrufiLocation();
    fetchDriverName();
    fetchBusCount();
    fetchUserCount();
    fetchRouteType();

    return () => {
      decrementUserCount();
    };
  }, []);

  useEffect(() => {
    fetchServiceStatus();

    return () => {
      setIsServiceActive(true);
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
              destination={routeType === 'VUELTA' ? origin : destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="transparent"
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
          {/* Temporal */}
          <MapViewDirections
            origin={routeType === 'VUELTA' ? originCercado : origin}
            destination={routeType === 'VUELTA' ? origin : destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
          />

          {trufiLocation && (
            <Marker
              coordinate={trufiLocation}
              title="Ubicación Actual del Trufi">
              <Bus width={50} height={50} />
            </Marker>
          )}

          <Marker
            coordinate={origin}
            title="PARADA INICIAL EL PASO - CBBA"
            description="Esta es la parada principal"
          />

          <Marker
            coordinate={originCercado}
            title="PARADA INICIAL CERCADO CBBA - EL PASO"
            description="Esta es la parada principal de retorno al PASO"
          />

          <Marker
            coordinate={destination}
            title="PARADA FINAL CERCADO EL PASO - CBBA"
            description="El tiempo de llegada a esta parada debe ser de 40 MIN"
          />
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
        {/* Mostrar notificación de cambio de servicio */}
        {!isServiceActive && (
          <View
            style={tw`absolute top-43 left-0 right-0 flex justify-center items-center`}>
            <View
              style={tw`bg-yellow-600 bg-opacity-70 p-3 items-center rounded-lg w-[95%]`}>
              <Text style={tw`text-white text-lg font-bold text-center`}>
                ¡Atención! El trufi no está en servicio.
              </Text>
            </View>
          </View>
        )}

        <View
          style={tw`absolute left-0 right-0 bottom-24 bg-opacity-50 px-2 py-2 rounded-full flex-row items-start justify-start`}>
          <View
            style={tw`bg-green-600 bg-opacity-70 p-2 items-center rounded-lg w-[30%]`}>
            <Text style={tw`text-white font-bold text-center`}>
              {routeType === 'IDA'
                ? 'PASO -> CBBA'
                : routeType === 'VUELTA'
                ? 'CBBA -> PASO'
                : 'Sin ruta disponible'}
            </Text>
          </View>
        </View>

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
