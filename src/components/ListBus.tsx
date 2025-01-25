import React, {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import CardList from 'components/cardList';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

const ListBus = ({navigation, refreshing}: any) => {
  const [busesIDA, setBusesIDA] = useState<any[]>([]);
  const [busesVuelta, setBusesVuelta] = useState<any[]>([]);

  const fetchBuses = async () => {
    try {
      const snapshot = await database()
        .ref('/TRUFI')
        .orderByChild('servicio')
        .equalTo(true)
        .once('value');

      const busesData = snapshot.val();

      if (busesData) {
        const busesList = Object.keys(busesData).map(key => ({
          id: key,
          numeroTrufi: busesData[key].numero_trufi,
          placa: busesData[key].placa,
          ubicacion: busesData[key].ubicacion_actual,
          conductorCI: busesData[key].conductor_ci,
          tiempo: busesData[key].tiempo || 0,
          sentidoRuta: busesData[key].sentido_ruta || '',
        }));

        const idaBuses = busesList.filter(bus => bus.sentidoRuta === 'IDA');
        const vueltaBuses = busesList.filter(
          bus => bus.sentidoRuta === 'VUELTA',
        );

        setBusesIDA(idaBuses);
        setBusesVuelta(vueltaBuses);
      } else {
        /* Alert.alert('Error', 'No se encontraron buses disponibles.'); */
      }
    } catch (error) {
      console.error('Error al obtener los buses:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    }
  };

  const listenForBusUpdates = () => {
    const busRef = database()
      .ref('/TRUFI')
      .orderByChild('servicio')
      .equalTo(true);

    busRef.on('child_changed', snapshot => {
      const updatedBus = snapshot.val();

      if (updatedBus.sentido_ruta === 'IDA') {
        setBusesIDA(prevBuses =>
          prevBuses.map(bus =>
            bus.id === snapshot.key
              ? {...bus, tiempo: updatedBus.tiempo || bus.tiempo}
              : bus,
          ),
        );
      } else if (updatedBus.sentido_ruta === 'VUELTA') {
        setBusesVuelta(prevBuses =>
          prevBuses.map(bus =>
            bus.id === snapshot.key
              ? {...bus, tiempo: updatedBus.tiempo || bus.tiempo}
              : bus,
          ),
        );
      }
    });
  };

  useEffect(() => {
    fetchBuses();
    listenForBusUpdates();

    return () => {
      const busRef = database().ref('/TRUFI');
      busRef.off('child_changed');
    };
  }, [refreshing]);

  const handleBusSelection = async (bus: any) => {
    try {
      const ci = bus.conductorCI.split('/CONDUCTOR/').pop();

      await AsyncStorage.setItem('driverCI', ci || '');
      await AsyncStorage.setItem('driverPlate', bus.id);

      console.log('Valores seteados en AsyncStorage:');
      console.log('driverCI:', ci);
      console.log('driverPlate:', bus.id);

      navigation.navigate('GetDriverLocationMap', {bus});
    } catch (error) {
      console.error('Error al guardar en AsyncStorage:', error);
      Alert.alert('Error', 'Hubo un problema al guardar los datos.');
    }
  };

  return (
    <View style={tw`mt-2`}>
      {busesIDA.length > 0 ? (
        <View>
          <Text style={tw`text-lg font-bold text-white text-center py-2`}>
            IDA (PASO - CBBA)
          </Text>
          {busesIDA.map((bus, index) => (
            <CardList
              key={index}
              lineNumber={bus.numeroTrufi}
              plate={bus.id}
              time={parseInt(bus.tiempo, 10) || 0}
              onPress={() => handleBusSelection(bus)}
            />
          ))}
        </View>
      ) : (
        <Text style={tw`text-center text-white`}>
          No hay buses de ida en servicio
        </Text>
      )}

      {busesVuelta.length > 0 ? (
        <View>
          <Text style={tw`text-lg font-bold text-white text-center py-2`}>
            VUELTA (CBBA - PASO)
          </Text>
          {busesVuelta.map((bus, index) => (
            <CardList
              key={index}
              lineNumber={bus.numeroTrufi}
              plate={bus.id}
              time={parseInt(bus.tiempo, 10) || 0}
              onPress={() => handleBusSelection(bus)}
            />
          ))}
        </View>
      ) : (
        <Text style={tw`text-center text-white`}>
          No hay buses de vuelta en servicio
        </Text>
      )}

      {busesIDA.length === 0 && busesVuelta.length === 0 && (
        <Text style={tw`text-center text-white`}>No hay buses en servicio</Text>
      )}
    </View>
  );
};

export default ListBus;
