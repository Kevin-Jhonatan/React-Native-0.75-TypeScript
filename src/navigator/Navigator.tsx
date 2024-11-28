import React from 'react';
import {HomeScreen} from '../screens/home/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PassengerMapScreen} from 'screens/user/passenger/PassengerMapScreen';
import {DriverMapScreen} from 'screens/user/driver/DriverMapScreen';
import CustomHeader from 'components/CustomHeader';
import {RegisterScreen} from 'screens/user/driver/register/RegisterScreen';
import {ListBusScreen} from 'screens/user/passenger/ListBusScreen';

const Stack = createNativeStackNavigator();

const renderHeader = (
  navigation: any,
  title: string,
  showNotify?: boolean,
  showToggle?: boolean,
  numberBus?: number,
) => (
  <CustomHeader
    title={title}
    onBack={() => navigation.goBack()}
    showNotify={showNotify}
    showToggle={showToggle}
    numberBus={numberBus}
  />
);

export const Navigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Ubication"
        component={PassengerMapScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'PASAJERO', true),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="ListBus"
        component={ListBusScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'BUSCAR - TRUFI', false, true),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={({navigation}) => ({
          header: () =>
            renderHeader(navigation, 'CONDUCTOR', false, false, 159),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="SendUbication"
        component={DriverMapScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'CONDUCTOR', false, true),
          headerTransparent: true,
        })}
      />
    </Stack.Navigator>
  );
};
