import React from "react";
import { useState } from "react";
import { useFonts } from "expo-font";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const SignupScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [fontsLoaded] = useFonts({
    "IstokWeb-Bold": require("../assets/fonts/IstokWeb-Bold.ttf"),
  });

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Email address is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async () => {
    if (validateFields()) {
      try {
        const response = await fetch("http://192.168.254.111:8000/api/register/", {  // Replace with your backend IP
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,  // Include full name
            email,
            password,
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          Alert.alert("Success", "Account created successfully!");
          router.push("/login");
        } else {
          Alert.alert("Error", data.error || "Registration failed");
        }
      } catch (error) {
        Alert.alert("Error", "Something went wrong. Try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {!fontsLoaded ? (
        <ActivityIndicator size="large" color="#FE7F2D" style={styles.loader} />
      ) : (
        <>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Kindly fill the form below to get started</Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#777" style={styles.icon} />
            <TextInput 
              placeholder="Full Name" 
              style={styles.input} 
              placeholderTextColor="#777"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#777" style={styles.icon} />
            <TextInput 
              placeholder="Email Address" 
              style={styles.input} 
              keyboardType="email-address" 
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.passwordHint}>Minimum 8 characters</Text>
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput 
              placeholder="Password" 
              style={styles.input} 
              secureTextEntry 
              placeholderTextColor="#777"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#777" style={styles.icon} />
            <TextInput 
              placeholder="Re-enter Password" 
              style={styles.input} 
              secureTextEntry 
              placeholderTextColor="#777"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
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
    fontSize: 12,
    color: "#fff",
    marginTop: 50,
    marginLeft: 10,
    fontFamily: "IstokWeb-Bold",
    marginBottom: 5, // Added some spacing below the hint
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 5,
    fontFamily: "IstokWeb-Bold",
  },
});

export default SignupScreen;