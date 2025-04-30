import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from './hooks/toastConfig';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        {/* splash, loading, auth, etc. */}
        <Stack.Screen name="app"                       options={{ headerShown: false }} />
        <Stack.Screen name="splashscreen"              options={{ headerShown: false }} />
        <Stack.Screen name="loading_screen"            options={{ headerShown: false }} />
        <Stack.Screen name="login"                     options={{ headerShown: false }} />
        <Stack.Screen name="sign_up"                   options={{ headerShown: false }} />
        <Stack.Screen name="logout_splashscreen"       options={{ headerShown: false, gestureEnabled: false }} />
        {/* Password Reset flow */}
        <Stack.Screen 
          name="reset-password/index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="reset-password/[uid]/[token]" 
          options={{ headerShown: false }} 
        />
        {/* Main App Screens */}
        <Stack.Screen name="home"      options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="budget"    options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="chat"      options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile"   options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile_edit"      options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="userprofile" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="faq"      options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>

      <Toast 
        config={toastConfig}
        topOffset={40}
        visibilityTime={3000}
        position="top"
      />
    </GestureHandlerRootView>
  );
}