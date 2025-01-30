import React from 'react';
import tw from 'twrnc';
import UserIcon from '../assets/icons/home/userIcon.svg';
import Ci from '../assets/icons/home/ci.svg';
import EmailIcon from '../assets/icons/home/email-black.svg';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import database from '@react-native-firebase/database';
import styles from '../styles/global.style';
import InputWithIcon from './Input';

export const RegisterDriver = ({navigation}: any) => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [ci, setCI] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const saveDrive = async () => {
    if (!name || !lastName || !ci) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const snapshot = await database().ref(`/CONDUCTOR/${ci}`).once('value');
      if (snapshot.exists()) {
        Alert.alert('Error', 'El número de C.I. ya está registrado.');
        return;
      }

      console.log('Datos a guardar en Firebase:', {
        nombre: name,
        apellido: lastName,
        correo: email,
      });

      await database().ref(`/CONDUCTOR/${ci}`).set({
        nombre: name.toUpperCase(),
        apellido: lastName.toUpperCase(),
        correo: email.toLowerCase(),
      });

      Alert.alert('Éxito', 'Conductor registrado correctamente.');
      console.log('Datos guardados en Firebase:', {email, name, lastName});

      setName('');
      setLastName('');
      setEmail('');
      setCI('');

      navigation.navigate('RegisterBus');
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      Alert.alert('Error', 'No se pudo registrar el conductor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        Registro de Conductor
      </Text>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={ci}
          onChangeText={setCI}
          placeholder="CÉDULA DE IDENTIDAD"
          inputStyle="uppercase"
          iconComponent={
            <Ci width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
          required={true}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={name}
          onChangeText={setName}
          placeholder="NOMBRE(S)"
          inputStyle="uppercase"
          iconComponent={
            <UserIcon width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={25}
          required={true}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={lastName}
          onChangeText={setLastName}
          placeholder="APELLIDO(S)"
          inputStyle="uppercase"
          iconComponent={
            <UserIcon width={25} height={25} style={tw`ml-2`} fill={'black'} />
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={25}
          required={true}
        />
      </View>

      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={email}
          onChangeText={setEmail}
          placeholder="CORREO ELECTRÓNICO"
          inputType="email"
          iconComponent={<EmailIcon width={25} height={25} style={tw`ml-2`} />}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={40}
          inputStyle="lowercase"
          autoCompleteType="off"
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={[tw`bg-[#222936] py-2 mt-10 mx-auto w-full`, styles.border]}
        onPress={saveDrive}
        disabled={loading}>
        <Text style={tw`text-white text-lg text-center uppercase`}>
          {loading ? 'Registrando...' : 'Registrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterDriver;
