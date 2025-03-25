import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import SplashScreen from "./splashscreen";
import Login from "./login";
import SignUp from "./sign_up";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ForgotPassword from "./forgot_password_1";
import Home from "./home";
import { useNavigation } from "expo-router";

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function MainApp() {
  return (
    <MainTab.Navigator>
      <MainTab.Screen name="Home" component={Home} />
    </MainTab.Navigator>
  );
}

function AuthScreens() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{ title: "Sign Up" }}
      />
      <AuthStack.Screen
        name="ForgotPassword1"
        component={ForgotPassword}
        options={{ title: "Forgot Password" }}
      />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return (
      <View style={styles.container}>
        <SplashScreen />
        <StatusBar style="auto" />
      </View>
    );
  }

  // With expo-router, you should use their navigation system
  // Remove the NavigationContainer and use their routing instead
  // This is a simplified version - you might need to adjust based on your exact expo-router setup

  return (
    <View style={styles.container}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name="MainApp" component={MainApp} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthScreens} />
        )}
      </RootStack.Navigator>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});