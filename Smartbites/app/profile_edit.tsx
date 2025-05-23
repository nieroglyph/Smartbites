import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Pressable,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  CameraCapturedPicture,
} from "expo-camera";
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import PhotoPreviewSection from "./photo_preview_section";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserProfile from "./hooks/useUserProfile";
import Toast from "react-native-toast-message";

interface Profile {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profilePicture: string | null;
}

interface Errors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  profilePicture?: string;
}

interface ProfileEditProps {
  navigation?: any; // For navigation purposes
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ navigation }) => {
  const { profile: fetchedProfile, loading, error } = useUserProfile();

  // Replace the initial state and add useEffect for data fetching
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
  });

  // Store temporary password values for the modal
  const [tempPasswords, setTempPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isPasswordEditing, setIsPasswordEditing] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] =
    useState<CameraCapturedPicture | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Sync fetched data with local state
  useEffect(() => {
    if (fetchedProfile) {
      setProfile((prev) => ({
        ...prev,
        name: fetchedProfile.name,
        email: fetchedProfile.email,
      }));
    }
  }, [fetchedProfile]);

  useEffect(() => {
    if (permission && !permission.granted) {
      setShowCamera(false);
    }
  }, [permission]);

  useEffect(() => {
    if (showPasswordModal) {
      // When opening modal, always initialize with empty values
      // This ensures previously entered passwords don't show up
      setTempPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPasswordModal]);

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Handle loading and error states
  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error loading profile: {error}</Text>
      </View>
    );
  }

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle changes in the modal's temporary password fields
  const handleTempPasswordChange = (
    field: keyof typeof tempPasswords,
    value: string
  ) => {
    setTempPasswords((prev) => ({ ...prev, [field]: value }));

    // Clear errors when typing
    if (
      field === "currentPassword" ||
      field === "newPassword" ||
      field === "confirmPassword"
    ) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (isPasswordEditing) {
      if (!profile.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }

      if (profile.newPassword && profile.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      }

      if (profile.newPassword !== profile.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        Alert.alert(
          "Password Mismatch",
          "The new password and confirm password fields do not match."
        );
      }
    }

    if (!profile.name) {
      newErrors.name = "Name is required";
    }

    if (!profile.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    dismissKeyboard();
    if (!validate()) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        "http://192.168.100.10:8000/api/update-profile/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            full_name: profile.name,
            email: profile.email,
          }),
        }
      );

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your changes were saved successfully",
        });
        router.back();
      } else {
        const errorData = await response.json();
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: errorData.detail || "Could not save profile changes",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Failed to connect to the server",
      });
    }
  };

  const pickImage = async (source: "gallery" | "camera") => {
    dismissKeyboard();
    if (source === "gallery") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setProfile((prev) => ({
          ...prev,
          profilePicture: result.assets[0].uri,
        }));
      }
    } else {
      if (Platform.OS === "web") {
        Alert.alert("Not supported", "Camera is not supported on web");
        return;
      }

      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission required",
          "Camera access is needed to take photos"
        );
        return;
      }
      setShowCamera(true);
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
          exif: false,
        });

        if (photo) {
          setPhotoPreview(photo);
          setShowCamera(false);
        }
      } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo");
      }
    }
  };

  const handleAcceptPhoto = () => {
    if (photoPreview?.uri) {
      setProfile((prev) => ({ ...prev, profilePicture: photoPreview.uri }));
      setPhotoPreview(null);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setShowCamera(true);
  };

  const handlePasswordChangeSubmit = async () => {
    dismissKeyboard();
    // Clear previous errors
    setErrors({});
  
    // Validate the temporary password fields
    let hasErrors = false;
    const newErrors: Errors = {};
  
    // Client-side validation
    if (!tempPasswords.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      hasErrors = true;
    }
  
    if (!tempPasswords.newPassword) {
      newErrors.newPassword = "New password is required";
      hasErrors = true;
    } else if (tempPasswords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      hasErrors = true;
    }
  
    if (tempPasswords.newPassword !== tempPasswords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }
  
    if (tempPasswords.newPassword === tempPasswords.currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
      hasErrors = true;
    }
  
    if (hasErrors) {
      setErrors(newErrors);
      return; // Don't close modal for client-side validation errors
    }
  
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        setShowPasswordModal(false); // Close modal on auth error
        return;
      }
  
      const response = await fetch(
        "http://192.168.100.10:8000/api/change-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            old_password: tempPasswords.currentPassword,
            new_password1: tempPasswords.newPassword,
            new_password2: tempPasswords.confirmPassword,
          }),
        }
      );
  
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Password Changed",
          text2: "Please login with your new password",
        });
  
        await fetch("http://192.168.100.10:8000/api/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
  
        await AsyncStorage.removeItem("authToken");
        router.push("/logout_splashscreen");
      } else {
        const errorData = await response.json();
        let errorMessage = "Password change failed";
  
        // Handle specific Django error structures
        if (errorData.old_password) {
          errorMessage = errorData.old_password.join(" ");
          // Only close modal if the error is specifically about the current password
          setShowPasswordModal(false);
        } else if (errorData.new_password1) {
          errorMessage = errorData.new_password1.join(" ");
        } else if (errorData.new_password2) {
          errorMessage = errorData.new_password2.join(" ");
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(" ");
        }
  
        Toast.show({
          type: "error",
          text1: "Password Error",
          text2: errorMessage,
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      Toast.show({
        type: "error",
        text1: "Password Change Failed",
        text2: "Could not complete password change",
        visibilityTime: 4000,
      });
    }
  };

  const handleCancelPasswordChange = () => {
    dismissKeyboard();
    setErrors((prev) => ({
      ...prev,
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    }));

    setShowPasswordModal(false);
  };

  if (photoPreview) {
    return (
      <PhotoPreviewSection
        photo={photoPreview}
        handleRetakePhoto={handleRetakePhoto}
        handleAcceptPhoto={handleAcceptPhoto}
      />
    );
  }

  if (showCamera) {
    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.cameraPermissionContainer}>
          <Text style={styles.permissionText}>
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={[
              styles.permissionButton,
              { marginTop: 10, backgroundColor: "#ccc" },
            ]}
          >
            <Text style={styles.permissionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <View style={styles.cameraButtonRow}>
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={() => setShowCamera(false)}
              >
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraMainButton}
                onPress={handleTakePhoto}
              >
                <View style={styles.cameraMainButtonInner} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={toggleCameraType}
              >
                <MaterialIcons name="flip-camera-ios" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          {/* Header with Return Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => router.push("/profile")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="keyboard-return"
                size={24}
                color="#FE7F2D"
              />
            </TouchableOpacity>
            <Text style={styles.title}></Text>
            <View style={styles.rightHeaderSpace} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View>
                <View style={styles.profilePictureContainer}>
                  <Image
                    source={
                      profile.profilePicture
                        ? { uri: profile.profilePicture }
                        : require("../assets/default-profile.png")
                    }
                    style={styles.profilePicture}
                  />
                  <View style={styles.profilePictureButtons}>
                    <TouchableOpacity
                      style={styles.pictureButton}
                      onPress={() => pickImage("gallery")}
                    >
                      <Text style={styles.buttonText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pictureButton}
                      onPress={() => pickImage("camera")}
                    >
                      <Text style={styles.buttonText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.errorInput]}
                    value={profile.name}
                    onChangeText={(text) => handleChange("name", text)}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.errorInput]}
                    value={profile.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.changePasswordButton}
                    onPress={() => {
                      dismissKeyboard();
                      setShowPasswordModal(true);
                    }}
                  >
                    <Text style={styles.changePasswordButtonText}>
                      Change Password
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Add extra padding at the bottom to ensure scrollable content isn't hidden behind the fixed button */}
                <View style={styles.bottomSpacer} />
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>

          {/* Fixed "Save Changes" button at the bottom */}
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Password Change Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPasswordModal}
          onRequestClose={handleCancelPasswordChange}
        >
          <TouchableWithoutFeedback onPress={handleCancelPasswordChange}>
            <BlurView style={styles.blurView} intensity={20} tint="light">
              <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <Animated.View
                  style={[
                    styles.animatedModalView,
                    {
                      transform: [{ scale: scaleAnim }],
                      opacity: opacityAnim,
                    },
                  ]}
                >
                  <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Change Password</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Current Password</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.currentPassword && styles.errorInput,
                        ]}
                        value={tempPasswords.currentPassword}
                        onChangeText={(text) =>
                          handleTempPasswordChange("currentPassword", text)
                        }
                        secureTextEntry
                        placeholder="Enter current password"
                        placeholderTextColor="#999"
                      />
                      {errors.currentPassword && (
                        <Text style={styles.errorText}>
                          {errors.currentPassword}
                        </Text>
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>New Password</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.newPassword && styles.errorInput,
                        ]}
                        value={tempPasswords.newPassword}
                        onChangeText={(text) =>
                          handleTempPasswordChange("newPassword", text)
                        }
                        secureTextEntry
                        placeholder="Enter new password (min 8 chars)"
                        placeholderTextColor="#999"
                      />
                      {errors.newPassword && (
                        <Text style={styles.errorText}>{errors.newPassword}</Text>
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Confirm New Password</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.confirmPassword && styles.errorInput,
                        ]}
                        value={tempPasswords.confirmPassword}
                        onChangeText={(text) =>
                          handleTempPasswordChange("confirmPassword", text)
                        }
                        secureTextEntry
                        placeholder="Re-enter new password"
                        placeholderTextColor="#999"
                      />
                      {errors.confirmPassword && (
                        <Text style={styles.errorText}>
                          {errors.confirmPassword}
                        </Text>
                      )}
                    </View>

                    <View style={styles.modalButtonContainer}>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonClose]}
                        onPress={handleCancelPasswordChange}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonSubmit]}
                        onPress={handlePasswordChangeSubmit}
                      >
                        <Text style={styles.modalButtonText}>
                          Update Password
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: "#00272B",
  },
  returnButton: {
    marginBottom: 5,
    marginRight: 15,
  },
  title: {
    fontWeight: "bold",
    color: "#FBFCF8",
    flex: 1,
    textAlign: "center",
  },
  rightHeaderSpace: {
    width: 24,
  },
  scrollContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profilePictureButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  pictureButton: {
    backgroundColor: "#FE7F2D",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 25,
    paddingHorizontal: 3,
  },
  label: {
    marginBottom: 5,
    fontWeight: "600",
    color: "#FE7F2D",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#00272B",
    height: 40,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00272B",
    padding: 16,
    paddingBottom: 24,
  },
  submitButton: {
    backgroundColor: "#FE7F2D",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FBFCF8",
    fontWeight: "500",
    fontSize: 14,
  },
  bottomSpacer: {
    height: 60,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  cameraButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  cameraControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraMainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraMainButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  changePasswordButton: {
    marginTop: 8,
    padding: 10,
    alignItems: "flex-start",
  },
  changePasswordButtonText: {
    color: "#FE7F2D",
    fontWeight: "500",
    fontSize: 14,
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  animatedModalView: {
    width: "90%",
    maxWidth: 400,
  },
  modalView: {
    backgroundColor: "#002F38",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#2D2F2F",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 30,
    color: "#E0FF4F",
    textAlign: "center",
    fontFamily: "IstokWeb-Regular",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    elevation: 0,
    minWidth: 100,
    alignItems: "center",
    flex: 1,
  },
  modalButtonClose: {
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#434545",
  },
  modalButtonSubmit: {
    backgroundColor: "#FE7F2D",
    marginLeft: 3,
  },
  modalButtonText: {
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "IstokWeb-Regular",
    color: "#FFFFFF",
  },
});

export default ProfileEdit;
