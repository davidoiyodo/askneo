import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Sniglet_400Regular,
  Sniglet_800ExtraBold,
} from '@expo-google-fonts/sniglet';
import { View, ActivityIndicator } from 'react-native';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppProvider, useAppContext } from './src/hooks/useAppContext';
import { DailyLogsProvider } from './src/hooks/useDailyLogs';
import { RoutineProvider } from './src/hooks/useRoutine';

import SplashScreen from './src/screens/onboarding/SplashScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import UserTypeScreen from './src/screens/onboarding/UserTypeScreen';
import BasicInfoScreen from './src/screens/onboarding/BasicInfoScreen';
import EmergencyContactsScreen from './src/screens/onboarding/EmergencyContactsScreen';
import PartnerInviteScreen from './src/screens/onboarding/PartnerInviteScreen';
import GoalsScreen from './src/screens/onboarding/GoalsScreen';
import SignInScreen from './src/screens/onboarding/SignInScreen';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, isLoading } = useAppContext();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#35010C' }}>
        <ActivityIndicator color="#E9A8B3" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {user?.onboardingComplete ? (
          <Stack.Screen name="MainApp" component={MainNavigator} />
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="UserType" component={UserTypeScreen} />
            <Stack.Screen name="BasicInfo" component={BasicInfoScreen as any} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen as any} />
            <Stack.Screen name="PartnerInvite" component={PartnerInviteScreen as any} />
            <Stack.Screen name="Goals" component={GoalsScreen as any} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Sniglet_400Regular,
    Sniglet_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#35010C' }}>
        <ActivityIndicator color="#E9A8B3" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <DailyLogsProvider>
          <RoutineProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </RoutineProvider>
        </DailyLogsProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
