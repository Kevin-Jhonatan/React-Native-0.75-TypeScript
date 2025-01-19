import React from 'react';
import tw from 'twrnc';
import Ci from '../assets/icons/home/ci.svg';
import Plate from '../assets/icons/home/bus.svg';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import styles from '../styles/global.style';
import InputWithIcon from './Input';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DriverExistenceCheck = ({navigation}: any) => {
  const [ci, setCI] = React.useState('');
  const [plate, setPlate] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const checkDriverExistence = async () => {
    if (!ci || !plate) {
      Alert.alert(
        'Error',
        `Por favor ingrese los datos faltantes: ${!ci ? 'C.I.' : ''} ${
          !plate ? 'Placa' : ''
        }`,
      );
      return;
    }

    setLoading(true);

    try {
      // Convertir placa a mayúsculas para asegurar consistencia
      const normalizedPlate = plate.toUpperCase();

      // Verificar si el registro de TRUFI existe
      const plateSnapshot = await database()
        .ref(`/TRUFI/${normalizedPlate}`)
        .once('value');

      if (!plateSnapshot.exists()) {
        console.error(`La placa ${normalizedPlate} no fue encontrada.`);
        Alert.alert('Error', 'No se ha encontrado un registro con esa placa.');
      } else {
        const trufiData = plateSnapshot.val();
        const conductorCIPath = trufiData.conductor_ci;

        if (!conductorCIPath) {
          console.error('El campo "conductor_ci" no está definido en TRUFI.');
          Alert.alert(
            'Error',
            'No se encontró un conductor asociado a esta placa.',
          );
          return;
        }

        // Extraer el C.I. del path
        const expectedCI = conductorCIPath.split('/').pop(); // Obtiene "1234567899" de "/CONDUCTOR/1234567899"

        if (ci !== expectedCI) {
          console.error(
            `El C.I. ingresado (${ci}) no coincide con el registrado (${expectedCI}).`,
          );
          Alert.alert(
            'Error',
            'El C.I. ingresado no coincide con el registrado para esta placa.',
          );
        } else {
          console.log(
            `Validación exitosa para C.I.=${ci} y Placa=${normalizedPlate}`,
          );

          // Guardar C.I. y placa en AsyncStorage
          await AsyncStorage.setItem('driverCI', ci);
          await AsyncStorage.setItem('driverPlate', normalizedPlate);

          console.log(
            'Datos guardados en AsyncStorage:',
            await AsyncStorage.getItem('driverCI'),
            await AsyncStorage.getItem('driverPlate'),
          );

          Alert.alert(
            'Validación exitosa',
            'Bienvenido señor conductor que tenga un buen día 🚗',
          );
          navigation.navigate('SendDriverLocationMap');
        }
      }
    } catch (error) {
      console.error('Error al verificar los datos:', error);
      Alert.alert('Error', 'Hubo un problema al verificar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        Verificación del Conductor
      </Text>

      {/* Input para C.I. */}
      <View style={tw`flex-row items-center mt-4`}>
        <InputWithIcon
          value={ci}
          onChangeText={setCI}
          placeholder="Cedula de identidad"
          inputStyle="uppercase"
          iconComponent={
            <Ci width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
      </View>

      {/* Input para Placa */}
      <View style={tw`flex-row items-center mt-4`}>
        <InputWithIcon
          value={plate}
          onChangeText={text => setPlate(text.toUpperCase())} // Convertir a mayúsculas automáticamente
          placeholder="Placa"
          inputStyle="uppercase"
          iconComponent={
            <Plate width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
      </View>

      <TouchableOpacity
        style={[tw`bg-[#222936] py-2 mt-10 mx-auto w-full`, styles.border]}
        onPress={checkDriverExistence}
        disabled={loading}>
        <Text style={tw`text-white text-lg text-center uppercase`}>
          {loading ? 'Verificando...' : 'Verificar'}
        </Text>
      </TouchableOpacity>

      <Text style={tw`text-lg font-bold text-black text-center pt-4 uppercase`}>
        ¿No estoy registrado?
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('ValidationDriver')}
        style={[tw`w-auto mx-auto`, styles.border]}>
        <Text
          style={tw`text-lg font-bold text-yellow-500 underline text-center pt-2 uppercase`}>
          Registrarte
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DriverExistenceCheck;
