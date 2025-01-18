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
          tiempo: busesData[key].tiempo || 0, // Aseguramos que el campo tiempo tenga un valor por defecto
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

  // Función para escuchar cambios en tiempo real
  const listenForBusUpdates = () => {
    const busRef = database()
      .ref('/TRUFI')
      .orderByChild('servicio')
      .equalTo(true);

    busRef.on('child_changed', snapshot => {
      const updatedBus = snapshot.val();
      setBuses(prevBuses =>
        prevBuses.map(bus =>
          bus.id === snapshot.key
            ? {...bus, tiempo: updatedBus.tiempo || bus.tiempo}
            : bus,
        ),
      );
    });
  };

  // Llamar a la función al montar el componente o al refrescar
  useEffect(() => {
    fetchBuses();
    listenForBusUpdates(); // Escuchar los cambios de los buses

    // Cleanup listener al desmontar el componente
    return () => {
      const busRef = database().ref('/TRUFI');
      busRef.off('child_changed');
    };
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
            time={parseInt(bus.tiempo, 10) || 0} // Aseguramos que el valor de tiempo sea un número
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
