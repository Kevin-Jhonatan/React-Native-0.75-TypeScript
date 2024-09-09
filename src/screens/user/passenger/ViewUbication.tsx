import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';

export const ViewUbication = ({navigation}: any) => {
  return (
    <SafeAreaView
      style={tw`flex-1 justify-start items-center bg-blue-500 pt-20`}>
      <View>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Text style={tw`text-white text-lg`}>View Ubication Screen</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Home');
          }}>
          <Text style={tw`text-white text-lg`}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
