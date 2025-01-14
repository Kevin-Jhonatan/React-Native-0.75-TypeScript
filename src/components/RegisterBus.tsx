import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import BusBlack from '../assets/icons/home/busBlack.svg';
import {View, Text, TouchableOpacity, Alert, Switch} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import database from '@react-native-firebase/database';
import styles from '../styles/global.style';
import InputWithIcon from './Input';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

export const RegisterBus = ({navigation}: any) => {
  const [number, setNumber] = useState('');
  const [trufiNumber, setTrufiNumber] = useState('');
  const [serviceStatus, setServiceStatus] = useState(true);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [routeChange, setRouteChange] = useState(false);
  const [ci, setCI] = useState('');
  const [location, setLocation] = useState({
    latitude: -17.338151,
    longitude: -66.265726,
  });
  const [loading, setLoading] = useState(false); // Estado para el loader

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());
        console.log(
          `Ubicación actual - Latitud: ${latitude}, Longitud: ${longitude}`,
        );
      },
      error => {
        Alert.alert('Error', 'No se pudo obtener la ubicación actual');
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  const handleMapPress = e => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setLocation({latitude, longitude});
    setLatitude(latitude.toString());
    setLongitude(longitude.toString());
  };

  const toggleRouteChange = () => {
    setRouteChange(previousState => {
      const newState = !previousState;
      console.log(`Cambio de ruta está: ${newState ? 'Sí' : 'No'}`);
      return newState;
    });
  };

  const toggleServiceStatus = () => {
    setServiceStatus(previousState => {
      const newState = !previousState;
      console.log(`Estado del servicio: ${newState ? 'Activo' : 'Inactivo'}`);
      return newState;
    });
  };

  const saveTrufi = async () => {
    if (!number || !trufiNumber || !latitude || !longitude || !ci) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    setLoading(true); // Mostrar loader

    try {
      const formattedPlate = number.toUpperCase();
      const formattedTrufiNumber = trufiNumber.toUpperCase();

      const plateSnapshot = await database()
        .ref(`/TRUFI/${formattedPlate}`)
        .once('value');
      if (plateSnapshot.exists()) {
        Alert.alert('Error', 'La placa ya está registrada.');
        return;
      }

      const conductorSnapshot = await database()
        .ref(`/CONDUCTOR/${ci}`)
        .once('value');
      if (!conductorSnapshot.exists()) {
        Alert.alert('Error', 'El conductor no está registrado.');
        return;
      }

      const trufiNumberSnapshot = await database()
        .ref('/TRUFI')
        .orderByChild('numero_trufi')
        .equalTo(formattedTrufiNumber)
        .once('value');

      if (trufiNumberSnapshot.exists()) {
        Alert.alert('Error', 'El número del trufi ya está registrado.');
        return;
      }

      const data = {
        cambio_ruta: routeChange,
        conductor_ci: `/CONDUCTOR/${ci}`,
        numero_trufi: formattedTrufiNumber,
        servicio: serviceStatus,
        ubicacion_actual: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      };

      await database().ref(`/TRUFI/${formattedPlate}`).set(data);

      Alert.alert('Éxito', 'Trufi registrado correctamente.');
      console.log('Datos guardados:', data);

      setNumber('');
      setTrufiNumber('');
      setLatitude('');
      setLongitude('');
      setRouteChange(false);
      setServiceStatus(true);
      setCI('');

      navigation.navigate('SendDriverLocationMap');
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      Alert.alert('Error', 'No se pudo registrar el trufi.');
    } finally {
      setLoading(false); // Ocultar loader
    }
  };

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        Registro de Trufi
      </Text>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={number}
          onChangeText={setNumber}
          placeholder="Placa del Trufi"
          inputStyle="uppercase"
          iconComponent={<BusBlack width={25} height={25} style={tw`ml-2`} />}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={ci}
          onChangeText={setCI}
          placeholder="C.I. del Conductor"
          inputStyle="uppercase"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={trufiNumber}
          onChangeText={setTrufiNumber}
          placeholder="Número del Trufi"
          inputStyle="uppercase"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
      </View>

      <View style={tw`h-80`}>
        <MapView
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          style={{flex: 1}}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          onPress={handleMapPress}>
          <Marker coordinate={location} title="Ubicación Actual" />
        </MapView>
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Latitud de la Ubicación"
          inputStyle="uppercase"
          editable={false}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Longitud de la Ubicación"
          inputStyle="uppercase"
          editable={false}
        />
      </View>

      <View style={tw`mt-5 flex-row items-center justify-between`}>
        <Text style={tw`text-sm text-black`}>Cambio de Ruta</Text>
        <Switch
          onValueChange={toggleRouteChange}
          value={routeChange}
          thumbColor={routeChange ? '#33A852' : '#fff'}
          trackColor={{false: '#ccc', true: '#33A852'}}
        />
      </View>

      <View style={tw`mt-5 flex-row items-center justify-between`}>
        <Text style={tw`text-sm text-black`}>Estado del Servicio</Text>
        <Switch
          onValueChange={toggleServiceStatus}
          value={serviceStatus}
          thumbColor={serviceStatus ? '#33A852' : '#fff'}
          trackColor={{false: '#ccc', true: '#33A852'}}
        />
      </View>

      <TouchableOpacity
        style={[tw`bg-[#222936] py-2 mt-10 mx-auto w-full`, styles.border]}
        onPress={saveTrufi}
        disabled={loading}>
        <Text style={tw`text-white text-lg text-center uppercase`}>
          {loading ? 'Registrando...' : 'Registrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterBus;
