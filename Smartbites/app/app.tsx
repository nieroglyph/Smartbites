import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import SplashScreen from "./splashscreen";
import Login from "./login";
import SignUp from "./sign_up";
import { createStackNavigator } from "@react-navigation/stack";
import ForgotPassword from "./forgot_password_1";
import Home from "./home";
import Profile from "./profile";
import ProfileEdit from "./profile_edit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { toastConfig } from "./hooks/toastConfig";

const AuthStack = createStackNavigator();
const RootStack = createStackNavigator();

function AuthScreens() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#00272B",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
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
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    const timer = setTimeout(() => {
      setIsShowSplash(false);
      checkAuthStatus();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return (
      <View style={styles.container}>
        <SplashScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RootStack.Navigator>
        {isLoggedIn ? (
          <RootStack.Group>
            <RootStack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="Profile"
              component={Profile}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="ProfileEdit"
              component={ProfileEdit}
              options={{
                headerShown: true,
                title: "Edit Profile",
                headerStyle: {
                  backgroundColor: "#00272B",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
          </RootStack.Group>
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthScreens}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
      <Toast
        config={toastConfig}
        topOffset={40}
        visibilityTime={3000}
        position="top"
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
  },
});

declare module "react-native-toast-message" {
  interface ToastConfig {
    success: (props: { text1: string; text2?: string }) => React.ReactNode;
    error: (props: { text1: string; text2?: string }) => React.ReactNode;
    [key: string]: (props: any) => React.ReactNode;
  }
}