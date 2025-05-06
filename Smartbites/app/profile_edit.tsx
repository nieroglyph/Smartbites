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
import * as ImagePicker from 'expo-image-picker';
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserProfile from "./hooks/useUserProfile";
import Toast from "react-native-toast-message";
import { StyleProp, ViewStyle } from 'react-native';

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
  navigation?: any;
}

type TouchableStyleProps = {
  pressed: boolean;
};

const ProfileEdit: React.FC<ProfileEditProps> = ({ navigation }) => {
  const { profile: fetchedProfile, loading, error } = useUserProfile();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
  });
  const [tempPasswords, setTempPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isPasswordEditing, setIsPasswordEditing] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState<boolean>(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fetchedProfile) {
      setProfile((prev) => ({
        ...prev,
        name: fetchedProfile.name,
        email: fetchedProfile.email,
        profilePicture: fetchedProfile.profilePicture || null,
      }));
    }
  }, [fetchedProfile]);

  useEffect(() => {
    if (showPasswordModal || showImagePickerModal) {
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
  }, [showPasswordModal, showImagePickerModal]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile: {error}</Text>
      </View>
    );
  }

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTempPasswordChange = (
    field: keyof typeof tempPasswords,
    value: string
  ) => {
    setTempPasswords((prev) => ({ ...prev, [field]: value }));
    if (field === "currentPassword" || field === "newPassword" || field === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageSelect = (imageSource: string) => {
    setProfile(prev => ({ ...prev, profilePicture: imageSource }));
    setShowImagePickerModal(false);
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

      const formData = new FormData();
      formData.append('full_name', profile.name);
      formData.append('email', profile.email);
      
      if (profile.profilePicture && profile.profilePicture.startsWith('file:')) {
        formData.append('profile_picture', {
          uri: profile.profilePicture,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      } else if (typeof profile.profilePicture === 'number') {
        // Handle local require() images
        const localUri = Image.resolveAssetSource(profile.profilePicture).uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profile_picture', {
          uri: localUri,
          type,
          name: filename || 'profile.jpg',
        } as any);
      }

      const response = await fetch("https://7e24-180-190-253-87.ngrok-free.app/api/update-profile/",
        {
          method: "PATCH",
          headers: {
            "Authorization": `Token ${token}`,
          },
          body: formData,
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

  const handlePasswordChangeSubmit = async () => {
    dismissKeyboard();
    setErrors({});
  
    let hasErrors = false;
    const newErrors: Errors = {};
  
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
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        setShowPasswordModal(false);
        return;
      }
  
      const response = await fetch("https://7e24-180-190-253-87.ngrok-free.app/api/change-password/",

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
        await fetch("https://7e24-180-190-253-87.ngrok-free.app/api/logout/", {
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
  
        if (errorData.old_password) {
          errorMessage = errorData.old_password.join(" ");
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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!pickerResult.canceled && pickerResult.assets) {
      handleImageSelect(pickerResult.assets[0].uri);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
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
                <TouchableOpacity 
                  onPress={() => setShowImagePickerModal(true)}
                  activeOpacity={0.7}
                  style={styles.profilePictureWrapper}
                >
                  <Image
                    source={
                      profile.profilePicture
                        ? typeof profile.profilePicture === 'string' 
                          ? { uri: profile.profilePicture }
                          : profile.profilePicture
                        : require("../assets/profiles/default-profile.png")
                    }
                    style={styles.profilePicture}
                  />
                  <View style={styles.editIconContainer}>
                    <MaterialIcons name="edit" size={20} color="#FBFCF8" />
                  </View>
                </TouchableOpacity>
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

                <View style={styles.bottomSpacer} />
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>

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
                        style={({ pressed }) => [
                          styles.modalButton,
                          styles.modalButtonClose,
                          pressed && styles.pressedButton,
                        ]}
                        onPress={handleCancelPasswordChange}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.modalButton,
                          styles.modalButtonSubmit,
                          pressed && styles.pressedButton,
                        ]}
                        onPress={handlePasswordChangeSubmit}
                      >
                        <Text style={styles.modalButtonText}>Update Password</Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Profile Picture Picker Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showImagePickerModal}
          onRequestClose={() => setShowImagePickerModal(false)}
        >
          <BlurView style={styles.blurView} intensity={20} tint="light">
            <TouchableWithoutFeedback onPress={() => setShowImagePickerModal(false)}>
              <Animated.View style={[styles.animatedModalView, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                <View style={styles.imagePickerModal}>
                  <Text style={styles.modalTitle}>Choose Profile Picture</Text>
                  
                  <ScrollView contentContainerStyle={styles.imageOptionsContainer}>
                    <TouchableOpacity 
                      style={styles.imageOption}
                      onPress={() => handleImageSelect(require("../assets/profiles/default-profile.png"))}
                    >
                      <Image 
                        source={require("../assets/profiles/default-profile.png")} 
                        style={styles.imageOptionThumbnail}
                      />
                      <Text style={styles.imageOptionText}>Default</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.imageOption}
                      onPress={() => handleImageSelect(require("../assets/profiles/Smartbite_black.png"))}
                    >
                      <Image 
                        source={require("../assets/profiles/Smartbite_black.png")} 
                        style={styles.imageOptionThumbnail}
                      />
                      <Text style={styles.imageOptionText}>Profile 1</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.imageOption}
                      onPress={() => handleImageSelect(require("../assets/profiles/Smartbites_blue.png"))}
                    >
                      <Image 
                        source={require("../assets/profiles/Smartbites_blue.png")} 
                        style={styles.imageOptionThumbnail}
                      />
                      <Text style={styles.imageOptionText}>Profile 2</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.imageOption}
                      onPress={() => handleImageSelect(require("../assets/profiles/Smartbites_red.png"))}
                    >
                      <Image 
                        source={require("../assets/profiles/Smartbites_red.png")} 
                        style={styles.imageOptionThumbnail}
                      />
                      <Text style={styles.imageOptionText}>Profile 3</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.imageOption}
                      onPress={pickImage}
                    >
                      <View style={[styles.imageOptionThumbnail, styles.galleryOption]}>
                        <MaterialIcons name="photo-library" size={30} color="#FE7F2D" />
                      </View>
                      <Text style={styles.imageOptionText}>From Gallery</Text>
                    </TouchableOpacity>
                  </ScrollView>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowImagePickerModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </BlurView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00272B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00272B',
    padding: 20,
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
  profilePictureWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'visible',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FE7F2D',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00272B',
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
  imagePickerModal: {
    backgroundColor: '#002F38',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageOption: {
    alignItems: 'center',
    margin: 10,
    width: 100,
  },
  imageOptionThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#434545',
  },
  galleryOption: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  imageOptionText: {
    color: '#FBFCF8',
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FE7F2D',
    fontWeight: '500',
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
  pressedButton: {
    opacity: 0.5,
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