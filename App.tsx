import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Import screens
import LoginScreen from './screens/LoginScreen';
import AddCarScreen from './screens/AddCarScreen';
import RentCarScreen from './screens/RentCarScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Hide default headers for custom styling
          cardStyle: { backgroundColor: '#f8f9fa' },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            title: 'Car Rental Service',
          }}
        />
        <Stack.Screen 
          name="AddCar" 
          component={AddCarScreen}
          options={{
            title: 'Add New Car',
          }}
        />
        <Stack.Screen 
          name="RentCar" 
          component={RentCarScreen}
          options={{
            title: 'Rent a Car',
          }}
        />
        <Stack.Screen 
          name="Confirmation" 
          component={ConfirmationScreen}
          options={{
            title: 'Booking Confirmed',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
