import React, {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import CardList from 'components/cardList';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

const ListBus = ({navigation, refreshing}: any) => {
  const [buses, setBuses] = useState<any[]>([]);

  // Función para obtener los datos de los buses desde Firebase
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
        }));

        setBuses(busesList);
      } else {
        Alert.alert('Error', 'No se encontraron buses disponibles.');
      }
    } catch (error) {
      console.error('Error al obtener los buses:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    }
  };

  // Llamar a la función al montar el componente o al refrescar
  useEffect(() => {
    fetchBuses();
  }, [refreshing]);

  // Función para manejar la selección de un bus
  const handleBusSelection = async (bus: any) => {
    try {
      // Extraer únicamente la parte posterior a "/CONDUCTOR/"
      const ci = bus.conductorCI.split('/CONDUCTOR/').pop();

      // Guardar los datos en AsyncStorage
      await AsyncStorage.setItem('driverCI', ci || '');
      await AsyncStorage.setItem('driverPlate', bus.id);

      // Mostrar los valores en consola
      console.log('Valores seteados en AsyncStorage:');
      console.log('driverCI:', ci);
      console.log('driverPlate:', bus.id);

      // Navegar al siguiente screen
      navigation.navigate('GetDriverLocationMap', {bus});
    } catch (error) {
      console.error('Error al guardar en AsyncStorage:', error);
      Alert.alert('Error', 'Hubo un problema al guardar los datos.');
    }
  };

  return (
    <View style={tw`mt-4`}>
      {buses.length > 0 ? (
        buses.map((bus, index) => (
          <CardList
            key={index}
            lineNumber={bus.numeroTrufi}
            plate={bus.id}
            time={10000}
            onPress={() => handleBusSelection(bus)}
          />
        ))
      ) : (
        <Text style={tw`text-center`}>
          No hay buses disponibles en servicio
        </Text>
      )}
    </View>
  );
};

export default ListBus;
