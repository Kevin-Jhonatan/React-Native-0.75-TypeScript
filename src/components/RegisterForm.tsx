import React from 'react';
import tw from 'twrnc';
import BusBlack from '../assets/icons/home/busBlack.svg';
import UserIcon from '../assets/icons/home/userIcon.svg';
import Ci from '../assets/icons/home/ci.svg';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../styles/global.style';
import InputWithIcon from './Input';

export const RegisterForm = ({navigation}: any) => {
  const [plate, setPlate] = React.useState('');
  const [name, setName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [ci, setCI] = React.useState('');

  return (
    <View style={[tw`bg-white flex-1 justify-center p-8`, styles.border]}>
      <Text style={tw`font-bold text-lg text-center uppercase text-black`}>
        Registro
      </Text>
      <View style={tw`flex-row items-center`}>
        <InputWithIcon
          value={plate}
          onChangeText={setPlate}
          placeholder="PLACA"
          inputStyle="uppercase"
          iconComponent={<BusBlack width={25} height={25} style={tw`ml-2`} />}
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
        />
      </View>

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
        onPress={() => {
          navigation.navigate('SendUbication');
        }}>
        <Text style={tw`text-white text-lg text-center uppercase`}>
          Registrar
        </Text>
      </TouchableOpacity>
    </View>
  );
};
