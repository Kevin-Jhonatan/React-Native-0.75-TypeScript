import React from 'react';
import {View, TextInput, TextInputProps, Text} from 'react-native';
import tw from 'twrnc';

interface InputWithIconProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconComponent?: React.ReactNode;
  inputStyle?: string;
  placeholderTextColor?: string;
  containerStyle?: string;
  textColor?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  required?: boolean;
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
  inputType = 'text',
  required = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  maxLength = 255,
  ...restProps
}) => {
  let keyboardType = 'default';
  let secureTextEntry = false;

  if (inputType === 'number') {
    keyboardType = 'numeric';
  } else if (inputType === 'email') {
    keyboardType = 'email-address';
  } else if (inputType === 'password') {
    secureTextEntry = true;
  }

  return (
    <View
      style={tw`flex-row items-center border-b-2 border-black ${containerStyle}`}>
      {required && <Text style={tw`text-red-500 text-lg font-bold`}>*</Text>}
      <TextInput
        style={[tw`flex-1 py-2 text-left ${inputStyle}`, {color: textColor}]}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        {...restProps}
      />

      {iconComponent && <View style={tw``}>{iconComponent}</View>}
    </View>
  );
};

export default InputWithIcon;
