import React, {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import CardList from 'components/cardList'; // Asegúrate de que este componente esté disponible

import database from '@react-native-firebase/database';
import tw from 'twrnc';

// Componente ListBus que muestra los buses en servicio
const ListBus = ({navigation}: any) => {
  const [buses, setBuses] = useState<any[]>([]);

  // Función para obtener los datos de los buses desde Firebase
  const fetchBuses = async () => {
    try {
      const snapshot = await database()
        .ref('/TRUFI')
        .orderByChild('servicio')
        .equalTo(true) // Filtrar solo los buses que están en servicio
        .once('value');

      const busesData = snapshot.val();
      // Imprimir los datos completos para ver su estructura
      console.log('Datos obtenidos de Firebase:', busesData);

      if (busesData) {
        const busesList = Object.keys(busesData).map(key => {
          const bus = busesData[key];

          // La clave "key" es el identificador del bus
          console.log('Bus encontrado:', bus);

          return {
            id: key, // Usamos la clave del nodo como el identificador del bus
            numeroTrufi: bus.numero_trufi,
            placa: bus.placa, // Si quieres mostrar otro campo
            ubicacion: bus.ubicacion_actual,
            conductorCI: bus.conductor_ci,
          };
        });

        setBuses(busesList);
      } else {
        Alert.alert('Error', 'No se encontraron buses disponibles.');
      }
    } catch (error) {
      console.error('Error al obtener los buses:', error);
      Alert.alert('Error', 'Hubo un problema al obtener los datos.');
    }
  };

  // Llamar a la función al montar el componente
  useEffect(() => {
    fetchBuses();
  }, []);

  return (
    <View style={tw`mt-4`}>
      {/* Mapeamos el listado de buses a CardList */}
      {buses.length > 0 ? (
        buses.map((bus, index) => (
          <CardList
            key={index}
            lineNumber={bus.numeroTrufi}
            plate={bus.id} // Ahora mostramos el identificador de cada bus (clave)
            time={10000} // Tiempo fijo por ahora
            onPress={() => navigation.navigate('GetDriverLocationMap', {bus})}
          />
        ))
      ) : (
        <Text>No hay buses disponibles en servicio</Text>
      )}
    </View>
  );
};

export default ListBus;
