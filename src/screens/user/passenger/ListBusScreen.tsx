import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import tw from 'twrnc';
import styles from '../../../styles/global.style';
import ListBus from 'components/ListBus';

export const ListBusScreen = ({navigation}: any) => {
  return (
    <SafeAreaView
      style={[tw`flex-1 justify-start items-center`, styles.container]}>
      <ScrollView>
        <View style={[tw`mt-15 p-6`]}>
          <Text
            style={[
              tw`text-lg font-bold text-center mb-4 uppercase text-white`,
            ]}>
            Busca el trufi de tu preferencia y recuerda que el tiempo es de
            llegada a tu ubicación
          </Text>
          <ListBus navigation={navigation} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
