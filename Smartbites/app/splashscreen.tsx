import React from "react";
import { View, Image, StyleSheet } from "react-native";

const icon = require("../assets/images/logo/smartbites-high-resolution-logo.png");

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00272B",
  },
  logo: {
    width: 200,
    height: 150,
    borderRadius: 15,
  },
});
