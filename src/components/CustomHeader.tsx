import React, {useState} from 'react';
import tw from 'twrnc';
import {View, Text, Switch, TouchableOpacity, SafeAreaView} from 'react-native';
import Back from '../assets/icons/home/back.svg';
import Notify from '../assets/icons/home/notify.svg';
import NoNotify from '../assets/icons/home/noNotify.svg';
import styles from '../styles/global.style';

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

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    console.log(`Toggle está: ${!isEnabled ? 'on' : 'off'}`);
  };

  const handleNotifyToggle = () => {
    setNotifyEnabled(previousState => !previousState);
    console.log(
      `Toggle de notificacion está: ${!notifyEnabled ? 'on' : 'off'}`,
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
