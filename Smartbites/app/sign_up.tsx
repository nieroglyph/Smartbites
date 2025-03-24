import React from "react";
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SignupScreen = () => {
  const navigation = useNavigation();
  
  const [fontsLoaded] = useFonts({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
  });

  return (
    <View style={styles.container}>
      {!fontsLoaded ? (
        <ActivityIndicator size="large" color="#FE7F2D" style={styles.loader} />
      ) : (
        <>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Kindly fill the form below to get started</Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
            <TextInput placeholder="Full Name" style={styles.input} placeholderTextColor="#777" />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#777" style={styles.icon} />
            <TextInput placeholder="Email Address" style={styles.input} keyboardType="email-address" placeholderTextColor="#777" />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#777" />
          </View>
          <Text style={styles.passwordHint}>Minimum 8 characters</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput placeholder="Re-enter Password" style={styles.input} secureTextEntry placeholderTextColor="#777" />
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginTop: 30,
    fontFamily: "IstokWeb-Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 100,
    fontFamily: "IstokWeb-Bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "IstokWeb-Bold",
    color: "#000",
  },
  passwordHint: {
    paddingTop: 30,
    fontSize: 12,
    color: "#fff",
    marginLeft: 10,
    fontFamily: "IstokWeb-Bold",
  },
  loginButton: {
    backgroundColor: "#FE7F2D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 18,
    color: "#FBFCF8",
    fontFamily: "IstokWeb-Bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignupScreen;