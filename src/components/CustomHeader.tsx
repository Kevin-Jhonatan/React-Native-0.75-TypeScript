import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import {View, Text, Switch, TouchableOpacity, SafeAreaView} from 'react-native';
import Back from '../assets/icons/home/back.svg';
import Notify from '../assets/icons/home/notify.svg';
import NoNotify from '../assets/icons/home/noNotify.svg';
import styles from '../styles/global.style';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomHeader = ({
  title,
  onBack,
  showNotify,
  showToggle,
  numberBus,
}: {
  title: string;
  onBack: () => void;
  showNotify?: boolean;
  showToggle?: boolean;
  numberBus?: number;
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const getPlateFromAsyncStorage = async () => {
    const plate = await AsyncStorage.getItem('driverPlate');
    return plate;
  };

  useEffect(() => {
    const loadRouteChangeState = async () => {
      const plate = await getPlateFromAsyncStorage();
      if (plate) {
        const trufiRef = database().ref(`/TRUFI/${plate}/cambio_ruta`);
        trufiRef.once('value', snapshot => {
          const changeRoute = snapshot.val();
          setIsEnabled(changeRoute || false);
        });
      }
    };

    loadRouteChangeState();
  }, []);

  const updateRouteChangeInDatabase = async (newState: boolean) => {
    const plate = await getPlateFromAsyncStorage();
    if (plate) {
      const trufiRef = database().ref(`/TRUFI/${plate}`);
      await trufiRef.update({
        cambio_ruta: newState,
      });
      console.log(`Cambio de ruta actualizado a: ${newState}`);
    }
  };

  const toggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    console.log(`Toggle está: ${newState ? 'on' : 'off'}`);

    await updateRouteChangeInDatabase(newState);
  };

  const handleNotifyToggle = () => {
    setNotifyEnabled(previousState => !previousState);
    console.log(
      `Toggle de notificación está: ${!notifyEnabled ? 'on' : 'off'}`,
    );
  };

  return (
    <SafeAreaView>
      <View
        style={[
          tw`bg-[#222936] bg-opacity-60 p-4 flex-row items-center justify-between m-2`,
          styles.border,
        ]}>
        <TouchableOpacity onPress={onBack}>
          <Back width={30} height={30} fill="white" />
        </TouchableOpacity>

        <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-white font-bold uppercase`}>{title}</Text>
        </View>

        <View style={tw`flex-row items-center`}>
          {numberBus ? (
            <Text style={tw`text-white font-bold text-lg`}>Nº {numberBus}</Text>
          ) : showNotify ? (
            <TouchableOpacity onPress={handleNotifyToggle}>
              {notifyEnabled ? (
                <Notify width={30} height={30} fill="#FFCC00" />
              ) : (
                <NoNotify width={30} height={30} fill="white" />
              )}
            </TouchableOpacity>
          ) : (
            showToggle && (
              <Switch
                onValueChange={toggleSwitch}
                value={isEnabled}
                thumbColor={isEnabled ? '#FFCC00' : '#fff'}
                trackColor={{false: '#fff', true: '#FFCC00'}}
              />
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;
