import React from "react";
import { useState } from "react";
import { Alert } from "react-native";
import { useFonts } from "expo-font";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = useFonts({
    "IstokWeb-Bold": require("../../assets/fonts/IstokWeb-Bold.ttf"),
  });

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "http://192.168.1.7:8000/auth/users/reset_password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Check your inbox",
          text2: "Password reset link sent.",
        });
      } else {
        const err = await res.json();
        throw new Error(err.email?.[0] || "Request failed");
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <ActivityIndicator size="large" color="#FF7F32" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="keyboard-return"
          size={24}
          color="#FE7F2D"
        />
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      {/* Title and Subtitle */}
      <Text style={styles.title}>Password Reset</Text>
      <Text style={styles.subtitle}>
        Provide the email address associated with your account to recover your
        password
      </Text>

      {/* Email Input */}
      <Text style={styles.label}>Email Address:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetRequest}>
        <Text style={styles.resetButtonText}>Reset password</Text>
      </TouchableOpacity>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginBottom: 130,
  },
  title: {
    fontSize: 16,
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
    paddingHorizontal: 20,
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
    height: 50,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
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
    marginTop: 20,
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
    color: "#FBFCF8",
  },
  signupLink: {
    color: "#E0FF4F",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForgotPasswordScreen;