import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="splashscreen" />
      <Stack.Screen name="loading_screen" />
      <Stack.Screen name="forgot_password" options={{ headerShown: false }} />
    </Stack>
  );
}
