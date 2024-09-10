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
import Car from '../../assets/icons/home/car.svg';

export const HomeScreen = ({navigation}: any) => {
  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View
          style={[
            tw`flex-1 justify-start items-center`,
            {backgroundColor: '#21252B'},
          ]}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />

          <Car width={400} height={400} />

          <Text style={tw`text-white text-2xl font-bold uppercase`}>
            Bienvenidos
          </Text>
          <Text style={tw`text-white text-2xl font-bold mt-5 uppercase`}>
            Línea 210
          </Text>

          <View style={tw`flex-1 justify-center items-center w-full`}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Ubication')}
              style={[
                tw`w-80 h-16 justify-center items-center mb-5`,
                {
                  backgroundColor: '#18C14D',
                  borderRadius: 30,
                },
              ]}>
              <Text style={tw`text-white text-lg uppercase`}>Pasajero</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('SendUbication')}
              style={[
                tw`w-80 h-16 justify-center items-center mb-5`,
                {
                  borderWidth: 3,
                  borderColor: '#FFC02D',
                  backgroundColor: 'transparent',
                  borderRadius: 30,
                },
              ]}>
              <Text style={tw`text-yellow-400 text-lg uppercase`}>
                Conductor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
