import React from "react";
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <ActivityIndicator size="large" color="#FF7F32" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Password Reset</Text>
      <Text style={styles.subtitle}>
        Provide the email address associated with your account to recover your
        password
      </Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#B0B0B0"
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset password</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginBottom: 130,
  },
  title: {
    fontSize: 22,
    fontFamily: "IstokWeb-Bold",
    color: "#FBFCF8",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "IstokWeb-Bold",
    color: "#B0B0B0",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontFamily: "IstokWeb-Bold",
    color: "#FBFCF8",
    marginBottom: 5,
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#FBFCF8",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "IstokWeb-Bold",
    color: "#000000",
  },
  resetButton: {
    width: "100%",
    backgroundColor: "#ff7f32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "IstokWeb-Bold",
    color: "#FBFCF8",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    fontFamily: "IstokWeb-Bold",
    color: "#B0B0B0",
  },
  signupLink: {
    color: "#FE7F2D",
    fontFamily: "IstokWeb-Bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForgotPasswordScreen;