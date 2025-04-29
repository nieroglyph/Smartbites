import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from "react-native";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";

type Params = { uid: string; token: string };

export default function NewPasswordScreen() {
  const router = useRouter();
  const { uid, token } = useLocalSearchParams<Params>();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
      "IstokWeb-Bold": require("../../../assets/fonts/IstokWeb-Bold.ttf"),
    });
  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#FF7F32"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  const handleSetPassword = async () => {
    if (!newPass || newPass !== confirmPass) {
      return Alert.alert("Error", "Passwords must match");
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://192.168.100.10:8000/auth/users/reset_password_confirm/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token, new_password: newPass }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.new_password?.[0] || "Failed to set password");
      }
      Toast.show({
        type: "success",
        text1: "Password changed!",
        text2: "You can now log in.",
      });
      router.push("/login");
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Please enter and confirm your new password
      </Text>

      <Text style={styles.label}>New Password:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showNewPassword}
          value={newPass}
          onChangeText={setNewPass}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(v => !v)}>
          <MaterialCommunityIcons
            name={showNewPassword ? "eye-off" : "eye"}
            size={24}
            color="#B0B0B0"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Re-enter New Password:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showConfirmPassword}
          value={confirmPass}
          onChangeText={setConfirmPass}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
          <MaterialCommunityIcons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="#B0B0B0"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleSetPassword}
        disabled={loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
    color: "#000",
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
});