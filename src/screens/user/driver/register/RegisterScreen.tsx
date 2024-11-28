import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import tw from 'twrnc';
import Logo from '../../../../assets/icons/home/logo.svg';
import styles from '../../../../styles/global.style';
import {RegisterForm} from 'components/RegisterForm';

export const RegisterScreen = ({navigation}: any) => {
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
            <RegisterForm navigation={navigation} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
