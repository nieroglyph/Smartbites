import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        {/* Auth Screens */}
        <Stack.Screen name="app" options={{ headerShown: false }} />
        <Stack.Screen name="splashscreen" options={{ headerShown: false }} />
        <Stack.Screen name="loading_screen" options={{ headerShown: false }} />
        <Stack.Screen name="forgot_password_1" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="sign_up" options={{ headerShown: false }} />
        <Stack.Screen name="profile_edit" options={{ headerShown: false }} />

        {/* Main App Screens */}
        <Stack.Screen name="home" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="userprofile" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}