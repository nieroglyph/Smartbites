import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import SplashScreen from "./splashscreen";
import Login from "./login";
import SignUp from "./sign_up";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import ForgotPassword from "./forgot_password_1";
import Home from "./home";
import Profile from "./profile";
import ProfileEdit from "./profile_edit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function MainApp() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'alert-circle-outline'; // default icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FE7F2D',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#00272B',
          borderTopWidth: 0,
        },
        headerShown: false
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={Home} 
        options={{ title: 'Home' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={Profile} 
        options={{ title: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

function AuthScreens() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#00272B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
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
              name="MainApp" 
              component={MainApp} 
              options={{ headerShown: false }}
            />
            <RootStack.Screen 
              name="ProfileEdit" 
              component={ProfileEdit} 
              options={{ 
                headerShown: true, 
                title: 'Edit Profile',
                headerStyle: {
                  backgroundColor: '#00272B',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
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
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00272B',
  },
});