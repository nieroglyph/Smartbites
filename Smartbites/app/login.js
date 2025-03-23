import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import * as Font from "expo-font";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const loadFonts = async () => {
  await Font.loadAsync({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
    "IrishGrover-Regular": require("../assets/fonts/IrishGrover-Regular.ttf"),
  });
};

const LoginScreen = ({ navigation }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFonts() {
      await loadFonts();
      setFontsLoaded(true);
    }
    fetchFonts();
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading Fonts...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Text style={styles.logo}>SmartBites</Text>

      <Text style={styles.signInText}>Sign in</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#FFA500" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#ccc" />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#FFA500" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#ccc" secureTextEntry />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword1")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1C1E",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "IstokWeb-Bold",
  },
  logo: {
    fontSize: 28,
    fontFamily: "IrishGrover-Regular",
    color: "#FFA500",
    textAlign: "center",
    marginBottom: 30,
  },
  signInText: {
    fontSize: 22,
    color: "white",
    marginBottom: 10,
    fontFamily: "IstokWeb-Bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: "IstokWeb-Bold",
  },
  forgotPassword: {
    color: "#FFD700",
    textAlign: "right",
    marginBottom: 20,
    fontFamily: "IstokWeb-Bold",
  },
  loginButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "white",
    fontFamily: "IstokWeb-Bold",
  },
  signupLink: {
    color: "#FFA500",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
  },
});

export default LoginScreen;