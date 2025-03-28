import React, { useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, CameraType, CameraCapturedPicture } from 'expo-camera';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import PhotoPreviewSection from './photo_preview_section';

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

const ProfileEdit: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isPasswordEditing, setIsPasswordEditing] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<CameraCapturedPicture | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      setShowCamera(false);
    }
  }, [permission]);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    if (field === 'newPassword' || field === 'confirmPassword' || field === 'currentPassword') {
      setIsPasswordEditing(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (isPasswordEditing) {
      if (!profile.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (profile.newPassword && profile.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (profile.newPassword !== profile.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        Alert.alert('Password Mismatch', 'The new password and confirm password fields do not match.');
      }
    }

    if (!profile.name) {
      newErrors.name = 'Name is required';
    }

    if (!profile.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const updatedFields: Partial<Profile> = {};
    
    if (profile.name !== 'John Doe') {
      updatedFields.name = profile.name;
    }
    
    if (profile.email !== 'john@example.com') {
      updatedFields.email = profile.email;
    }
    
    if (profile.newPassword) {
      updatedFields.newPassword = profile.newPassword;
      updatedFields.currentPassword = profile.currentPassword;
    }
    
    if (profile.profilePicture) {
      updatedFields.profilePicture = profile.profilePicture;
    }

    console.log('Updating profile with:', updatedFields);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const pickImage = async (source: 'gallery' | 'camera') => {
    if (source === 'gallery') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setProfile(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
      }
    } else {
      if (Platform.OS === 'web') {
        Alert.alert('Not supported', 'Camera is not supported on web');
        return;
      }

      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission required', 'Camera access is needed to take photos');
        return;
      }
      setShowCamera(true);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
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
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const handleAcceptPhoto = () => {
    if (photoPreview?.uri) {
      setProfile(prev => ({ ...prev, profilePicture: photoPreview.uri }));
      setPhotoPreview(null);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setShowCamera(true);
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
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity 
            onPress={requestPermission} 
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowCamera(false)} 
            style={[styles.permissionButton, { marginTop: 10, backgroundColor: '#ccc' }]}
          >
            <Text style={styles.permissionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing={cameraType}
          ref={cameraRef}
        >
          <View style={styles.cameraButtonContainer}>
            <View style={styles.cameraButtonRow}>
              <TouchableOpacity 
                style={styles.cameraControlButton} 
                onPress={() => setShowCamera(false)}
              >
                <AntDesign name='close' size={24} color='white' />
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
                <MaterialIcons name='flip-camera-ios' size={24} color='white' />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Profile</Text>
        
        <View style={styles.profilePictureContainer}>
          <Image
            source={profile.profilePicture ? { uri: profile.profilePicture } : require('../assets/default-profile.png')}
            style={styles.profilePicture}
          />
          <View style={styles.profilePictureButtons}>
            <TouchableOpacity 
              style={styles.pictureButton} 
              onPress={() => pickImage('gallery')}
            >
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pictureButton} 
              onPress={() => pickImage('camera')}
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
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter your name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            value={profile.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            placeholder="Enter your email"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={[styles.input, errors.currentPassword && styles.errorInput]}
            value={profile.currentPassword}
            onChangeText={(text) => handleChange('currentPassword', text)}
            secureTextEntry
            placeholder="Enter current password"
          />
          {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={[styles.input, errors.newPassword && styles.errorInput]}
            value={profile.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
            secureTextEntry
            placeholder="Enter new password (min 8 chars)"
          />
          {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.errorInput]}
            value={profile.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            secureTextEntry
            placeholder="Re-enter new password"
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom for scroll
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profilePictureButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  pictureButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  cameraControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMainButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileEdit;