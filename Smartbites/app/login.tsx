import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import * as Font from "expo-font";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const loadFonts = async () => {
  await Font.loadAsync({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
    "IrishGrover-Regular": require("../assets/fonts/IrishGrover-Regular.ttf"),
  });
};

const LoginScreen: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchFonts() {
      await loadFonts();
      setFontsLoaded(true);
    }
    fetchFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
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
      <TouchableOpacity onPress={() => router.push("/forgot_password_1")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/sign_up")}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles remain unchanged...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24,
    color: "#FBFCF8",
    textAlign: "center",
    fontFamily: "IstokWeb-Bold",
  },
  logo: {
    fontSize: 28,
    fontFamily: "IrishGrover-Regular",
    color: "#FE7F2D",
    textAlign: "center",
    marginBottom: 30,
  },
  signInText: {
    fontSize: 22,
    color: "#FBFCF8",
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
    color: "#E0FF4F",
    textAlign: "right",
    marginBottom: 20,
    fontFamily: "IstokWeb-Bold",
  },
  loginButton: {
    backgroundColor: "#FE7F2D",
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
    color: "#FBFCF8",
    fontFamily: "IstokWeb-Bold",
  },
  signupLink: {
    color: "#E0FF4F",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
  },
});

export default LoginScreen;