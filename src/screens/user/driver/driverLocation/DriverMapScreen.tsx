import React, {useEffect, useState, useRef} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StatusBar,
  View,
  TouchableOpacity,
  Switch,
  Text,
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
import MapViewDirections from 'react-native-maps-directions';
import Logout from 'assets/icons/home/logout.svg';

export const DriverMapScreen = ({navigation}: any) => {
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
  const [userCount, setUserCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const GOOGLE_MAPS_APIKEY = 'AIzaSyAfctC8adBPlAm9I-jaH0kJNTnzEhKqMa0';

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

  const updateTimeInFirebase = timeInSeconds => {
    if (driverPlate) {
      const trufiRef = database().ref(`/TRUFI/${driverPlate}`);
      trufiRef
        .update({
          tiempo: timeInSeconds,
        })
        .then(() => {
          console.log('Tiempo actualizado en Firebase');
        })
        .catch(error => {
          console.error('Error al actualizar el tiempo en Firebase:', error);
        });
    }
  };

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

  const listenPassengerCount = () => {
    if (!driverPlate) {
      return;
    }

    const passengerRef = database().ref('/PASAJERO');
    passengerRef.on('value', snapshot => {
      if (snapshot.exists()) {
        setUserCount(snapshot.val());
      } else {
        setUserCount(0);
      }
    });

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
      locationRef.onDisconnect().set({latitude, longitude});
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
        updateLocationInDatabase(latitude, longitude);
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {latitude, longitude, latitudeDelta: 0.003, longitudeDelta: 0.003},
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
        updateLocationInDatabase(latitude, longitude);
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

  const toggleSwitch = async () => {
    const newValue = isEnabled ? 'VUELTA' : 'IDA';
    setIsEnabled(!isEnabled);

    if (driverPlate) {
      const trufiRef = database().ref(`/TRUFI/${driverPlate}`);
      try {
        await trufiRef.update({
          sentido_ruta: newValue,
        });
        console.log('Sentido de ruta actualizado a:', newValue);
      } catch (error) {
        console.error('Error al actualizar el sentido de la ruta:', error);
      }
    }
  };

  const setSentidoRuta = plate => {
    const trufiRef = database().ref(`/TRUFI/${plate}`);
    trufiRef.once('value', snapshot => {
      if (!snapshot.exists() || !snapshot.child('sentido_ruta').exists()) {
        trufiRef.update({
          sentido_ruta: 'IDA',
        });
        setIsEnabled(false);
        console.log('Campo sentido_ruta inicializado con IDA');
      } else {
        const sentidoRuta = snapshot.child('sentido_ruta').val();
        setIsEnabled(sentidoRuta === 'VUELTA');
      }
    });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('driverCI');
      await AsyncStorage.removeItem('driverPlate');
      console.log('Sesión cerrada y datos eliminados');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
          setSentidoRuta(storedPlate);
        } else {
          console.log('No se encontraron datos del conductor en AsyncStorage.');
        }
      } catch (error) {
        console.error('Error al recuperar datos del conductor:', error);
      }
    };

    getDriverData();
    requestLocationPermission();

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
          {location && destination && (
            <MapViewDirections
              origin={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              destination={isEnabled ? destination : origin}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="transparent"
              onReady={result => {
                console.log('Tiempo estimado en minutos:', result.duration);
                const timeInSeconds = Math.round(result.duration * 60);
                updateTimeInFirebase(timeInSeconds);
              }}
              onError={errorMessage => {
                console.error('Error con Directions API:', errorMessage);
              }}
            />
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

        <TouchableOpacity
          style={[
            tw`absolute top-20 right-3 bg-[#222936] bg-opacity-50 p-3 rounded-full`,
          ]}
          onPress={logout}>
          <Logout width={30} height={30} fill={'white'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`absolute bottom-25 right-4 bg-[#222936] bg-opacity-50 p-2 rounded-full`,
          ]}
          onPress={getUsersCurrentLocation}>
          <Location width={35} height={35} />
        </TouchableOpacity>

        <View
          style={tw`absolute bottom-26 left-32 bg-[#222936] bg-opacity-50 px-4 py-2 rounded-full flex-row items-center justify-center`}>
          <Text style={tw`text-white text-sm`}>PASO</Text>

          <Switch
            onValueChange={toggleSwitch}
            value={isEnabled}
            thumbColor={isEnabled ? '#33A852' : '#FFCC00'}
            trackColor={{false: '#fff', true: '#fff'}}
            style={tw`mx-2`}
          />

          <Text style={tw`text-white text-sm`}>CBBA</Text>
        </View>

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
