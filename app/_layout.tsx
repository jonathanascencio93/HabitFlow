import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { HabitProvider } from '@/src/context/HabitContext';
import { HealthProvider } from '@/src/context/HealthContext';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is trying to access a login screen
    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect away from sign-in page.
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="edit" options={{ presentation: 'modal', title: 'Edit Activity' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <HabitProvider>
            <HealthProvider>
              <InitialLayout />
              <StatusBar style="auto" />
            </HealthProvider>
          </HabitProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
