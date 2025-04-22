import React, { useState } from "react";
import { useFonts } from "expo-font";
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NewPasswordScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#FF7F32" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      {/* Title and Subtitle */}
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Please enter your new password and confirm it
      </Text>

      {/* New Password Input */}
      <Text style={styles.label}>New Password:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showNewPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <MaterialCommunityIcons 
            name={showNewPassword ? "eye-off" : "eye"} 
            size={24} 
            color="#B0B0B0" 
          />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password Input */}
      <Text style={styles.label}>Re-enter New Password:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Re-enter New Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <MaterialCommunityIcons 
            name={showConfirmPassword ? "eye-off" : "eye"} 
            size={24} 
            color="#B0B0B0" 
          />
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Update Password</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NewPasswordScreen;