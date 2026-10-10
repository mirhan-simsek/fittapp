import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { colors } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.accent },
};

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
);

function Tabs() {
  const { t, ready } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Today" component={HomeScreen} options={{ title: t('tabToday'), tabBarIcon: icon('🏠') }} />
      <Tab.Screen name="Workout" component={WorkoutScreen} options={{ title: t('tabWorkout'), tabBarIcon: icon('🏋️') }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ title: t('tabNutrition'), tabBarIcon: icon('🥗') }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: t('tabProgress'), tabBarIcon: icon('📈') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabSettings'), tabBarIcon: icon('⚙️') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Tabs />
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
