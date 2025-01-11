import React from 'react';
import {HomeScreen} from '../screens/home/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PassengerMapScreen} from 'screens/user/passenger/PassengerMapScreen';
import {DriverMapScreen} from 'screens/user/driver/driverLocation/DriverMapScreen';
import CustomHeader from 'components/CustomHeader';
import {RegisterScreen} from 'screens/user/driver/registerDriver/RegisterDriverScreen';
import {ListBusScreen} from 'screens/user/passenger/ListBusScreen';
import {DriverValidationScreen} from 'screens/user/driver/validationDriver/DriverValidationScreen';

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
      {/* Driver */}
      <Stack.Screen
        name="ValidationDriver"
        component={DriverValidationScreen}
        options={({navigation}) => ({
          header: () =>
            renderHeader(navigation, 'CONDUCTOR', false, false, false),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="RegisterDriver"
        component={RegisterScreen}
        options={({navigation}) => ({
          header: () =>
            renderHeader(navigation, 'CONDUCTOR', false, false, 159),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="RegisterBus"
        component={RegisterScreen}
        options={({navigation}) => ({
          header: () =>
            renderHeader(navigation, 'CONDUCTOR', false, false, 159),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="SendDriverLocationMap"
        component={DriverMapScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'CONDUCTOR', false, true),
          headerTransparent: true,
        })}
      />
      {/* Passenger */}
      <Stack.Screen
        name="ListBus"
        component={ListBusScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'BUSCAR - TRUFI', false, true),
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="GetDriverLocationMap"
        component={PassengerMapScreen}
        options={({navigation}) => ({
          header: () => renderHeader(navigation, 'PASAJERO', true),
          headerTransparent: true,
        })}
      />
    </Stack.Navigator>
  );
};
