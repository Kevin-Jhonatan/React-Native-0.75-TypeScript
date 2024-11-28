import React, {useState} from 'react';
import tw from 'twrnc';
import {View, Text, Switch, SafeAreaView} from 'react-native';
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

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    console.log(`Toggle de servicio está: ${!isEnabled ? 'on' : 'off'}`);
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
