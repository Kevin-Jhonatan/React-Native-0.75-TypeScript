import React from 'react';
import {StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from '../../../styles/global.style';
import tw from 'twrnc';
import CustomFooter from 'components/CustomFooter';
import {GoogleMap} from 'components/GoogleMap';

export const DriverMapScreen = () => {
  return (
    <SafeAreaView style={[tw`flex-1`, styles.container]}>
      <StatusBar hidden={true} />
      <View style={tw`flex-1 relative`}>
        <GoogleMap
          initialRegion={{
            latitude: -17.34,
            longitude: -66.26,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          markers={[
            {latitude: -17.3385, longitude: -66.2653, title: 'Punto A'},
            {latitude: -17.3496, longitude: -66.257, title: 'Punto B'},
          ]}
          directions={[
            {
              origin: {latitude: -17.3385, longitude: -66.2653},
              destination: {latitude: -17.3496, longitude: -66.257},
            },
          ]}
          busLocation={{
            latitude: -17.338657810829393,
            longitude: -66.26312565268329,
          }}
        />

        <View style={tw`absolute bottom-0 left-0 right-0`}>
          <CustomFooter plate="ABC-1234" name="Kevin Jhonatan" userCount={5} />
        </View>
      </View>
    </SafeAreaView>
  );
};
