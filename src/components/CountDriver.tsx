import React, { useEffect, useState } from 'react';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componente para contar los conductores
const CountDriver = () => {
  const [driverCount, setDriverCount] = useState<number | null>(null);

  // Obtener el número de conductores
  const getDriverCount = async () => {
    const plate = await AsyncStorage.getItem('driverPlate');
    if (plate) {
      const trufiRef = database().ref('/CONDUCTOR');
      trufiRef.once('value', snapshot => {
        const data = snapshot.val();
        const count = Object.keys(data || {}).length;
        setDriverCount(count+1); // Establecer el número de conductores
      });
    }
  };

  // Cargar el número de conductores al inicio
  useEffect(() => {
    getDriverCount();
  }, []);

  // Si aún no tenemos el número de conductores, mostramos un valor predeterminado
  return driverCount !== null ? driverCount : 0;
};

export default CountDriver;
