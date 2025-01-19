import React from 'react';
import tw from 'twrnc';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../styles/global.style';

const CardList = ({
  lineNumber,
  plate,
  time,
  onPress,
}: {
  lineNumber: number;
  plate: string;
  time: number;
  onPress: () => void;
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')} HR`;
    } else if (minutes > 0) {
      return `${minutes} MIN`;
    } else {
      return `${secs} SEG`;
    }
  };

  return (
    <View style={tw`mb-2`}>
      <TouchableOpacity
        onPress={onPress}
        style={[tw`bg-white p-8`, styles.border]}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-black font-bold text-lg`}>N° {lineNumber}</Text>

          <Text style={tw`text-black font-bold text-lg uppercase`}>
            {plate}
          </Text>

          <Text style={tw`text-black font-bold text-lg`}>
            {formatTime(time)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={tw`mt-2 items-center`}>
        <View style={tw`border-t border-gray-300 w-[95%]`} />
      </View>
    </View>
  );
};

export default CardList;
