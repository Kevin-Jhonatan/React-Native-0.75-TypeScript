import React from 'react';
import {HomeScreen} from '../screens/home/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ViewUbication} from 'screens/user/passenger/ViewUbication';
import {SendUbication} from 'screens/user/driver/SendUbication';

const Stack = createNativeStackNavigator();
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
        component={ViewUbication}
        options={{
          title: 'PASAJERO',
          headerStyle: {
            //backgroundColor: '#4CAF50',
          },
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="SendUbication"
        component={SendUbication}
        options={{
          title: 'CONDUCTOR',
          headerStyle: {
            //backgroundColor: '#4CAF50',
          },
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};
