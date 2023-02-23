import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NavigationDrawerStructure from "./components/customDrawer.js"
import LoginScreen from './screens/loginScreen.js';
import RegistrationScreen from './screens/registrationScreen.js';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={({ navigation }) => ({
                    headerShown: false,
                })}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegistrationScreen} />
                <Stack.Screen name="Main" component={NavigationDrawerStructure} />
            </Stack.Navigator>
        </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
