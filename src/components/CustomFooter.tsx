import React, {useEffect, useState} from 'react';
import tw from 'twrnc';
import {View, Text, Switch, SafeAreaView} from 'react-native';
import database from '@react-native-firebase/database';
import Users from '../assets/icons/home/users.svg';
import BusWhite from '../assets/icons/home/busWhite.svg';
import styles from '../styles/global.style';

const CustomFooter = ({
  plate,
  name,
  userCount,
  busCount,
  time,
}: {
  plate: string;
  name: string;
  userCount?: number;
  busCount?: number;
  time?: number;
}) => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetchServiceStatus = async () => {
      if (!plate) {
        return;
      }
      try {
        const snapshot = await database()
          .ref(`/TRUFI/${plate}/servicio`)
          .once('value');
        if (snapshot.exists()) {
          setIsEnabled(snapshot.val());
        }
      } catch (error) {
        console.error('Error al recuperar el estado del servicio:', error);
      }
    };

    fetchServiceStatus();
  }, [plate]);

  const updateServiceStatus = async (status: boolean) => {
    if (!plate) {
      return;
    }
    try {
      await database().ref(`/TRUFI/${plate}/servicio`).set(status);
      console.log(
        `Estado del servicio actualizado a: ${status ? 'on' : 'off'}`,
      );
    } catch (error) {
      console.error('Error al actualizar el estado del servicio:', error);
    }
  };

  const toggleSwitch = () => {
    const newStatus = !isEnabled;
    setIsEnabled(newStatus);
    updateServiceStatus(newStatus);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')} HR`;
      }
      return `${hours} HR`;
    } else if (minutes > 0) {
      return `${minutes} MIN`;
    } else {
      return `${secs} SEG`;
    }
  };

  return (
    <SafeAreaView>
      <View
        style={[
          tw`bg-[#222936] bg-opacity-60 p-4 flex-row items-center justify-between m-2`,
          styles.border,
        ]}>
        <View style={tw`flex-row items-center`}>
          {busCount ? (
            <>
              <BusWhite width={30} height={30} />
              <Text style={tw`text-white ml-2 font-bold`}>{busCount}</Text>
            </>
          ) : (
            <>
              <Users width={30} height={30} fill="white" />
              {userCount !== undefined && (
                <Text style={tw`text-white ml-2 font-bold`}>{userCount}</Text>
              )}
            </>
          )}
        </View>

        <View style={tw`items-center`}>
          <Text style={tw`text-white font-bold uppercase`}>{plate}</Text>
          <Text style={tw`text-white font-bold uppercase`}>{name}</Text>
        </View>

        <View>
          {time ? (
            <Text style={tw`text-white font-bold`}>{formatTime(time)}</Text>
          ) : (
            <Switch
              onValueChange={toggleSwitch}
              value={isEnabled}
              thumbColor={isEnabled ? '#33A852' : '#fff'}
              trackColor={{false: '#fff', true: '#33A852'}}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomFooter;
