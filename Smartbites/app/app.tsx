import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import SplashScreen from "./splashscreen";
import Login from "./login";
import SignUp from "./sign_up";
import { createStackNavigator } from "@react-navigation/stack";
import ForgotPassword from "./forgot_password_1";

const Stack = createStackNavigator();

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {isShowSplash ? (
        <SplashScreen />
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ title: "Sign Up" }}
          />
          <Stack.Screen
            name="ForgotPassword1"
            component={ForgotPassword}
            options={{ title: "Forgot Password" }}
          />
        </Stack.Navigator>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
