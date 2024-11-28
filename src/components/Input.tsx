import React from 'react';
import {View, TextInput} from 'react-native';
import tw from 'twrnc';

interface InputWithIconProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconComponent?: React.ReactNode;
  inputStyle?: string;
  placeholderTextColor?: string;
  containerStyle?: string;
  textColor?: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
  value,
  onChangeText,
  placeholder = 'Placeholder',
  iconComponent,
  inputStyle = '',
  placeholderTextColor = 'gray',
  containerStyle = '',
  textColor = 'black',
}) => {
  return (
    <View
      style={tw`flex-row items-center border-b-2 border-black ${containerStyle}`}>
      <TextInput
        style={[tw`flex-1 py-2 text-left ${inputStyle}`, {color: textColor}]}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
      />
      {iconComponent && <View style={tw`ml-2`}>{iconComponent}</View>}
    </View>
  );
};

export default InputWithIcon;
