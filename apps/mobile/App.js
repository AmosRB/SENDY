// sendy-app/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinkInputScreen from './screens/LinkInputScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import QuoteResultsScreen from './screens/QuoteResultsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="LinkInput" component={LinkInputScreen} options={{ title: 'SENDY – הזן קישור' }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'פרטי המשלוח' }} />
        <Stack.Screen name="QuoteResults" component={QuoteResultsScreen} options={{ title: 'הצעות מחיר' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
