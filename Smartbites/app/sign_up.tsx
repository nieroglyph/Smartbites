import React from "react";
import { useState } from "react";
import { useFonts } from "expo-font";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const SignupScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      try {
<<<<<<< HEAD
        const response = await fetch("http://192.168.254.111:8000/api/register/", {
=======
        const response = await fetch("http://192.168.100.10:8000/api/register/", {  // Replace with your backend IP
>>>>>>> 34cb7c5cbe3363c2d7dacd7434c833b121b8a3cc
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          Alert.alert(
            "Success", 
            "Account created successfully!",
            [{ text: "Continue", onPress: () => router.push("/login") }]
          );
        } else {
          Alert.alert("Registration Failed", data.error || "Please check your information and try again.");
        }
      } catch (error) {
        Alert.alert("Connection Error", "Unable to connect to the server. Please check your internet connection and try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.mainContainer, styles.loaderContainer]}>
        <ActivityIndicator size="large" color="#FE7F2D" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        enabled
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
          </TouchableOpacity>
          <View style={styles.rightHeaderSpace} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Kindly fill the form below to get started</Text>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, errors.fullName ? styles.inputError : null]}>
              <FontAwesome name="user" size={16} color="#FE7F2D" style={styles.icon} />
              <TextInput 
                placeholder="Full Name" 
                style={styles.input} 
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

            <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
              <MaterialIcons name="email" size={16} color="#FE7F2D" style={styles.icon} />
              <TextInput 
                placeholder="Email Address" 
                style={styles.input} 
                keyboardType="email-address" 
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <View style={styles.passwordHintContainer}>
              <MaterialIcons name="info-outline" size={14} color="#FE7F2D" style={styles.infoIcon} />
              <Text style={styles.passwordHintText}>Minimum 8 characters</Text>
            </View>
            
            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
              <FontAwesome name="lock" size={16} color="#FE7F2D" style={styles.icon} />
              <TextInput 
                placeholder="Password" 
                style={styles.input} 
                secureTextEntry 
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
              <FontAwesome name="lock" size={16} color="#FE7F2D" style={styles.icon} />
              <TextInput 
                placeholder="Re-enter Password" 
                style={styles.input} 
                secureTextEntry 
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FBFCF8" />
            ) : (
              <Text style={styles.loginText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Already Have Account */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push("/login")}
            >
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#00272B",
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#00272B',
  },
  returnButton: {
    marginBottom: 5,
    marginRight: 15,
  },
  rightHeaderSpace: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
    marginTop: 30,
    fontFamily: 'IstokWeb-Regular',
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "IstokWeb-Bold",
  },
  formContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "IstokWeb-Bold",
    color: "#000",
    fontSize: 14,
  },
  passwordHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 10,
    marginBottom: 2,
  },
  infoIcon: {
    marginRight: 5,
  },
  passwordHintText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "IstokWeb-Bold",
  },
  loginButton: {
    backgroundColor: "#FE7F2D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginText: {
    fontSize: 14,
    color: "#FBFCF8",
    fontFamily: "IstokWeb-Bold",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    marginTop: -6,
    marginLeft: 10,
    marginBottom: 5,
    fontFamily: "IstokWeb-Bold",
  },
  signInContainer: {
    marginTop: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  signInText: {
    color: "#FBFCF8",
    fontFamily: "IstokWeb-Bold",
    fontSize: 14,
  },
  signInLink: {
    color: "#E0FF4F",
    fontWeight: "bold",
    fontFamily: "IstokWeb-Bold",
    fontSize: 14,
  },
});

export default SignupScreen;