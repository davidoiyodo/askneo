import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '../components/icons/Icon';
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
import RoutineScreen from '../screens/main/RoutineScreen';
import EditGoalsScreen from '../screens/main/EditGoalsScreen';
import RoutineItemScreen from '../screens/main/RoutineItemScreen';
import GoalStoryScreen from '../screens/main/GoalStoryScreen';
import StreakDetailScreen from '../screens/main/StreakDetailScreen';
import ANCVisitsScreen from '../screens/main/ANCVisitsScreen';
import CycleTrackerScreen from '../screens/main/CycleTrackerScreen';
import CycleHistoryScreen from '../screens/main/CycleHistoryScreen';
import PreconceptionChecklistScreen from '../screens/main/PreconceptionChecklistScreen';

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
  switch (name) {
    case 'Home':      return <Icon name="home_3" size={size} color={color} />;
    case 'AskNeo':    return <Icon name="chat_1" size={size} color={color} />;
    case 'QuickHelp': return <Icon name="alarm_1" size={size} color={color} />;
    case 'NeoStore':  return <Icon name="shopping_bag_1" size={size} color={color} />;
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
      <Stack.Screen
        name="Routine"
        component={RoutineScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="EditGoals"
        component={EditGoalsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RoutineItem"
        component={RoutineItemScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="GoalStory"
        component={GoalStoryScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="StreakDetail"
        component={StreakDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ANCVisits"
        component={ANCVisitsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CycleTracker"
        component={CycleTrackerScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CycleHistory"
        component={CycleHistoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PreconceptionChecklist"
        component={PreconceptionChecklistScreen}
        options={{ animation: 'slide_from_right' }}
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
