import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import SplashScreen from "./splashscreen";
import Login from "./login";

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
      {isShowSplash ? <SplashScreen /> : <Login />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
