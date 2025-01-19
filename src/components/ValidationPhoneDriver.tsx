import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import tw from 'twrnc';
import styles from '../styles/global.style';
import InputWithIcon from '../components/Input';
import PhoneBlack from '../assets/icons/home/phone-black.svg';
import CodeIcon from '../assets/icons/home/message-black.svg';

const ValidationPhoneDriver = ({navigation}: any) => {
  const [phoneNumber, setPhoneNumber] = useState('+591'); // Número de teléfono inicial con código de país
  const [confirm, setConfirm] = useState(null); // Almacena la confirmación del OTP
  const [code, setCode] = useState(''); // Código OTP ingresado por el usuario
  const [loading, setLoading] = useState(false); // Estado para el loader
  const [confirming, setConfirming] = useState(false); // Estado para confirmar el código

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('Usuario autenticado:', user);
        Alert.alert(
          'Autenticación exitosa',
          'Validación de socio correctamente.',
        );
        // Redirigir después de autenticación exitosa
        navigation.navigate('RegisterDriver');
      }
    });

    return subscriber; // Desuscribirse al desmontar
  }, [navigation]);

  const signInWithPhoneNumber = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Por favor ingrese un número de teléfono válido.');
      return;
    }

    setLoading(true); // Activar el loader
    try {
      console.log('Enviando código al número:', phoneNumber);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      Alert.alert(
        'Código enviado',
        'Revisa tu teléfono e ingresa el código recibido.',
      );
    } catch (error) {
      console.error('Error al enviar el código:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el código. Verifica el número e inténtalo nuevamente.',
      );
    } finally {
      setLoading(false); // Desactivar el loader
    }
  };

  const confirmCode = async () => {
    if (!confirm) {
      Alert.alert('Error', 'Primero debes enviar el código de verificación.');
      return;
    }

    if (!code || code.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos.');
      return;
    }

    setConfirming(true); // Activar el estado de confirmación
    try {
      console.log('Confirmando código:', code);
      await confirm.confirm(code);
      console.log('Código confirmado correctamente.');
      // Redirigir a RegisterDriver una vez confirmado el código
      navigation.navigate('RegisterDriver');
    } catch (error) {
      console.error('Error al confirmar el código:', error);
      Alert.alert('Error', 'El código ingresado no es válido.');
    } finally {
      setConfirming(false); // Desactivar el estado de confirmación
    }
  };

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        {confirm ? 'Ingresa el Código de SMS' : 'Validacion de socio'}
      </Text>

      {!confirm ? (
        <InputWithIcon
          value={phoneNumber}
          onChangeText={text => {
            if (!text.startsWith('+591')) {
              setPhoneNumber('+591');
            } else {
              setPhoneNumber(text);
            }
          }}
          placeholder="+591XXXXXXXX"
          iconComponent={<PhoneBlack width={25} height={25} style={tw`ml-2`} />}
          inputType="number"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
        />
      ) : (
        <InputWithIcon
          value={code}
          onChangeText={setCode}
          placeholder="Código SMS"
          keyboardType="number-pad"
          iconComponent={<CodeIcon width={25} height={25} style={tw`ml-2`} />}
          inputType="number"
          autoCapitalize="characters"
          maxLength={6}
        />
      )}

      <TouchableOpacity
        style={[tw`bg-[#222936] py-2 mt-10 mx-auto w-full`, styles.border]}
        onPress={
          confirm ? confirmCode : () => signInWithPhoneNumber(phoneNumber)
        }
        disabled={loading || confirming}>
        <Text style={tw`text-white text-lg text-center uppercase`}>
          {loading
            ? 'Enviando...'
            : confirming
            ? 'Confirmando...'
            : confirm
            ? 'Confirmar Código'
            : 'Enviar Código'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ValidationPhoneDriver;
