import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Logo from '../../../../assets/icons/home/logo.svg';
import styles from '../../../../styles/global.style';
import { RegisterForm } from 'components/RegisterForm';
import database from '@react-native-firebase/database';
import RegisterBus from 'components/RegisterBus';

export const RegisterScreen = ({ navigation }: any) => {
  const [conductorData, setConductorData] = useState(null);
  const [ci, setCI] = useState('12491899'); // CI del conductor a buscar

  // Función para leer los datos del conductor desde Realtime Database
  const fetchConductorData = async () => {
    try {
      const snapshot = await database().ref(`/CONDUCTOR/${ci}`).once('value');
      const data = snapshot.val();
      if (data) {
        // Asegúrate de agregar la clave `ci` al objeto recuperado
        setConductorData({ ...data, ci });
      } else {
        Alert.alert('Error', 'No se encontraron datos del conductor.');
      }
    } catch (error) {
      console.error('Error al leer los datos:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    }
  };

  // Llamar la función al montar el componente
  useEffect(() => {
    fetchConductorData();
  }, [/* ci */]);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={[tw`flex-1 justify-start items-center`, styles.container]}>
          <Logo width={400} height={350} />
          <Text style={tw`text-yellow-500 text-2xl font-bold uppercase`}>
            Línea
          </Text>
          <Text style={tw`text-white text-2xl font-bold mt-4 uppercase`}>
            210
          </Text>

          <View
            style={[
              tw`flex-1 flex-row justify-center items-center p-8`,
              styles.border,
            ]}>
            <RegisterForm />
          </View>
          <View
            style={[
              tw`flex-1 flex-row justify-center items-center p-8`,
              styles.border,
            ]}>
           <RegisterBus navigation={navigation} />
          </View>

          {/* Mostrar la información del conductor */}
          {conductorData ? (
            <View style={tw`mt-8 p-4 border rounded-xl bg-gray-200`}>
              <Text style={tw`text-lg font-bold text-black`}>
                Información del Conductor
              </Text>
              <Text style={tw`mt-2`}>C.I.: {conductorData.ci}</Text>
              <Text style={tw`mt-2`}>Placa: {conductorData.placa}</Text>
              <Text style={tw`mt-2`}>Nombre: {conductorData.nombre}</Text>
              <Text style={tw`mt-2`}>Apellido: {conductorData.apellido}</Text>
            </View>
          ) : (
            <Text style={tw`mt-4 text-center text-white`}>
              Cargando información del conductor...
            </Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('SendUbication')}
            style={[
              tw`w-[170px] h-[170px] justify-center items-center bg-white`,
              styles.border,
            ]}>
            <Text style={tw`text-lg uppercase font-bold text-black`}>
              Pasajero
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
