import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import Logo from '../../assets/icons/home/logo.svg';
import User from '../../assets/icons/home/user.svg';
import Bus from '../../assets/icons/home/bus.svg';
import styles from '../../styles/global.style';

export const HomeScreen = ({navigation}: any) => {
  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={[tw`flex-1 justify-start items-center`, styles.container]}>
          <StatusBar hidden={false} />
          <Logo width={400} height={400} />
          <Text style={tw`text-yellow-500 text-2xl font-bold uppercase`}>
            Bienvenido
          </Text>
          <Text style={tw`text-yellow-500 text-2xl font-bold mt-5 uppercase`}>
            Línea
          </Text>
          <Text style={tw`text-white text-2xl font-bold mt-5 uppercase`}>
            210
          </Text>
          <View
            style={tw`flex-1 flex-row justify-center items-center w-full p-8 gap-4`}>
            <TouchableOpacity
              onPress={() => navigation.navigate('DriverExistenceCheck')}
              style={[
                tw`w-[170px] h-[170px] justify-center items-center bg-white`,
                styles.border,
              ]}>
              <Bus width={90} height={90} />
              <Text style={tw`text-lg uppercase font-bold text-black`}>
                Conductor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ListBus')}
              style={[
                tw`w-[170px] h-[170px] justify-center items-center bg-white`,
                styles.border,
              ]}>
              <User width={90} height={90} />
              <Text style={tw`text-lg uppercase font-bold text-black`}>
                Pasajero
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
