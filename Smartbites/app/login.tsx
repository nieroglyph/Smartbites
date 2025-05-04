import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Font from "expo-font";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const loadFonts = async () => {
  await Font.loadAsync({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
    "IrishGrover-Regular": require("../assets/fonts/IrishGrover-Regular.ttf"),
  });
};

const LoginScreen: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFonts() {
      await loadFonts();
      setFontsLoaded(true);
    }
    fetchFonts();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.7:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("authToken", data.token);
        router.push("/home");
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Welcome Container at the top */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.logo}>SmartBites</Text>
      </View>

      {/* Centered Form Container */}
      <View style={styles.centerContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.signInText}>Sign in</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#FFA500" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#FFA500" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push("./reset-password/index.tsx")}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginText}>{loading ? "Logging in..." : "Log in"}</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/sign_up")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: -120,
  },
  formContainer: {
    width: "100%",
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
  },
  signInText: {
    fontSize: 16,
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
    fontSize: 14,
    fontFamily: "IstokWeb-Bold",
  },
  forgotPassword: {
    color: "#E0FF4F",
    textAlign: "right",
    marginBottom: 20,
    fontFamily: "IstokWeb-Bold",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#FE7F2D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
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
    fontSize: 14,
  },
  signupLink: {
    color: "#E0FF4F",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
    fontSize: 14,
  },
});

export default LoginScreen;