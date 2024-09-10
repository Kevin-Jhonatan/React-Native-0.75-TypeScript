import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';

export const SendUbication = ({navigation}: any) => {
  return (
    <SafeAreaView
      style={[
        tw`flex-1 justify-start items-center bg-blue-500 pt-10`,
        {backgroundColor: '#21252B'},
      ]}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />
          <Text style={tw`text-white text-lg uppercase font-bold`}>
            Mapa Para el Conductor@
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Home');
            }}>
            <Text style={tw`text-white text-lg mt-10`}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
