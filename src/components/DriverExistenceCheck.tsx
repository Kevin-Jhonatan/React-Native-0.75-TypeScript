import React from 'react';
import tw from 'twrnc';
import Ci from '../assets/icons/home/ci.svg';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import styles from '../styles/global.style';
import InputWithIcon from './Input';
import database from '@react-native-firebase/database';

export const DriverExistenceCheck = ({navigation}: any) => {
  const [ci, setCI] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Función para verificar si el C.I. ya existe en la base de datos
  const checkDriverExistence = async () => {
    if (!ci) {
      Alert.alert('Error', 'Por favor ingrese un C.I.');
      return;
    }

    setLoading(true);

    try {
      // Verificar si el conductor existe en la base de datos
      const snapshot = await database().ref(`/CONDUCTOR/${ci}`).once('value');
      if (snapshot.exists()) {
        const driverData = snapshot.val();
        Alert.alert(
          'Conductor encontrado',
          `Conductor: ${driverData.nombre} ${driverData.apellido}`,
        );
        navigation.navigate('SendDriverLocationMap');
      } else {
        Alert.alert(
          'No encontrado',
          'No se ha encontrado un conductor con ese C.I.',
        );
      }
    } catch (error) {
      console.error('Error al verificar el conductor:', error);
      Alert.alert('Error', 'Hubo un problema al verificar el C.I.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        Verificación del Conductor
      </Text>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={ci}
          onChangeText={setCI}
          placeholder="C.I."
          inputStyle="uppercase"
          iconComponent={
            <Ci width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
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
