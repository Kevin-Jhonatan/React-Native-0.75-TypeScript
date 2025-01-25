import {useEffect, useState} from 'react';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CountDriver = () => {
  const [driverCount, setDriverCount] = useState<number | null>(null);

  const getDriverCount = async () => {
    const plate = await AsyncStorage.getItem('driverPlate');
    if (plate) {
      const trufiRef = database().ref('/CONDUCTOR');
      trufiRef.once('value', snapshot => {
        const data = snapshot.val();
        const count = Object.keys(data || {}).length;
        setDriverCount(count + 1);
      });
    }
  };

  useEffect(() => {
    getDriverCount();
  }, []);

  return driverCount !== null ? driverCount : 0;
};

export default CountDriver;
