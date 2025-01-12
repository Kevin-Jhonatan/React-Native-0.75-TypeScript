import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import styles from '../../../../styles/global.style';
import Logo from '../../../../assets/icons/home/logo.svg';
import RegisterBus from 'components/RegisterBus';

export const RegisterBusScreen = ({navigation}: any) => {
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
            <RegisterBus navigation={navigation} />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterDriver')}
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
