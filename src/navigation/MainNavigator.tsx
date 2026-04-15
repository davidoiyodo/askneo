import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, MessageCircle, AlertCircle, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../theme';
import HomeScreen from '../screens/main/HomeScreen';
import AskNeoScreen from '../screens/chat/AskNeoScreen';
import QuickHelpScreen from '../screens/main/QuickHelpScreen';
import NeoStoreScreen from '../screens/main/NeoStoreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ArticleScreen from '../screens/main/ArticleScreen';
import AllRecommendationsScreen from '../screens/main/AllRecommendationsScreen';
import ConsultationsScreen from '../screens/consultations/ConsultationsScreen';
import RecordConsultationScreen from '../screens/consultations/RecordConsultationScreen';
import ConsultationDetailScreen from '../screens/consultations/ConsultationDetailScreen';
import VisitPrepScreen from '../screens/main/VisitPrepScreen';
import FacilityMapScreen from '../screens/main/FacilityMapScreen';
import SymptomLogScreen from '../screens/main/SymptomLogScreen';
import BabyDevelopmentScreen from '../screens/main/BabyDevelopmentScreen';
import CartScreen from '../screens/main/CartScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type TabName = 'Home' | 'AskNeo' | 'QuickHelp' | 'NeoStore';

const TAB_LABELS: Record<TabName, string> = {
  Home:      'Home',
  AskNeo:    'AskNeo',
  QuickHelp: 'Quick Help',
  NeoStore:  'NeoStore',
};

function TabIcon({ name, color, size }: { name: TabName; color: string; size: number }) {
  const props = { size, color, strokeWidth: 2 };
  switch (name) {
    case 'Home':      return <Home {...props} />;
    case 'AskNeo':    return <MessageCircle {...props} />;
    case 'QuickHelp': return <AlertCircle {...props} />;
    case 'NeoStore':  return <ShoppingBag {...props} />;
  }
}

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: route.name === 'Home'
          ? {
              backgroundColor: theme.bg.surface,
              borderTopColor: theme.border.subtle,
              height: 80,
              paddingBottom: Spacing[3],
              paddingTop: Spacing[2],
            }
          : { display: 'none' },
        tabBarLabel: ({ focused }) => (
          <Text style={[
            styles.tabLabel,
            { color: focused ? theme.text.brand : theme.text.tertiary },
          ]}>
            {TAB_LABELS[route.name as TabName]}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <View style={[
            styles.tabIcon,
            focused && [styles.tabIconActive, { backgroundColor: theme.accent.rose.bg }],
          ]}>
            <TabIcon
              name={route.name as TabName}
              color={focused ? theme.text.brand : theme.text.tertiary}
              size={22}
            />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="AskNeo"    component={AskNeoScreen} />
      <Tab.Screen name="QuickHelp" component={QuickHelpScreen} />
      <Tab.Screen name="NeoStore"  component={NeoStoreScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"    component={TabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="AllRecommendations"
        component={AllRecommendationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Consultations"
        component={ConsultationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RecordConsultation"
        component={RecordConsultationScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ConsultationDetail"
        component={ConsultationDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VisitPrep"
        component={VisitPrepScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FacilityMap"
        component={FacilityMapScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="SymptomLog"
        component={SymptomLogScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BabyDevelopment"
        component={BabyDevelopmentScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  tabIcon: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  tabIconActive: {
    paddingHorizontal: Spacing[3],
  },
});
