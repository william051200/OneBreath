import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/theme/theme';
import { Onboarding } from '../src/components/Onboarding';
import { useOnboarding } from '../src/storage/useOnboarding';

export default function RootLayout() {
  const onboarding = useOnboarding();
  const showOnboarding = onboarding.loaded && !onboarding.seen;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bgDeep } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {showOnboarding && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <Onboarding onDone={onboarding.markSeen} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
