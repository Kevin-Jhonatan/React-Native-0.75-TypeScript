import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import styles from '../../../styles/global.style';
import ListBus from 'components/ListBus';
import Down from 'assets/icons/home/down.svg';

export const ListBusScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState(false);

  // Función para manejar el refresco
  const onRefresh = async () => {
    setRefreshing(true);
    // Simular la carga con un retraso (puedes reemplazarlo por una acción real)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView
      style={[tw`flex-1 justify-start items-center`, styles.container]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={60}
          />
        }>
        <View style={[tw`mt-15 p-6`]}>
          <Text
            style={[tw`text-lg font-bold text-center uppercase text-white`]}>
            Deslice abajo para actualizar los trufis disponibles.
          </Text>
          <Down width={30} height={30} style={tw`m-auto`} fill={'white'} />

          <ListBus navigation={navigation} refreshing={refreshing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
