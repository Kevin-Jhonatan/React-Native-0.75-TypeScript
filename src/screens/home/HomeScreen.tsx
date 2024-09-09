import React from 'react';
import {Text, View} from 'react-native';
import Car from '../../assets/icons/home/car.svg';
import tw from 'twrnc';

export const HomeScreen = () => {
  return (
    <View style={tw`flex-1 justify-center items-center bg-blue-500`}>
      <Text style={tw`text-black text-lg`}>Home Screen User Kev</Text>
      <Car width={120} height={40} />
    </View>
  );
};
