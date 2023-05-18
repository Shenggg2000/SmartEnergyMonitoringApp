import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Voice } from '../screens';
import { ROUTES } from '../routes'
 
const Stack = createStackNavigator();

function VoiceNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName={ROUTES.VOICE}
      screenOptions={{
      }}  
    >
      <Stack.Screen name={ROUTES.VOICE} component={Voice} options={{headerShown: false}}/>
    </Stack.Navigator>
  );
}

export default VoiceNavigator;