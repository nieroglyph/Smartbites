import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

interface Message {
  id: number;
  text: string;
  time: string;
  isUser: boolean;
  image?: string;
}

const ChatScreen = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your SmartBites assistant. How can I help you today?",
      time: "10:30 AM",
      isUser: false
    }
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your media library to attach images');
      }
    })();

    return () => {
      if (showCamera) {
        setShowCamera(false);
      }
    };
  }, []);

  const handleSend = async () => {
    if (message.trim() || photoPreview) {
      // Add user's message (text and/or image) to chat
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true,
        ...(photoPreview && { image: photoPreview }) // Include image if available
      };
  
      setMessages(prev => [...prev, newUserMessage]);
      setMessage('');
      setPhotoPreview(null); // Clear selected photo
  
      // Show a "thinking" message before AI starts responding
      const thinkingMessage: Message = {
        id: messages.length + 2,
        text: 'Thinking...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };
  
      setMessages(prev => [...prev, thinkingMessage]);
  
      try {
        const formData = new FormData();
        formData.append('prompt', message);
        if (photoPreview) {
          formData.append('image', {
            uri: photoPreview,
            type: 'image/jpeg', // Adjust if needed
            name: 'photo.jpg'
          });
        }
  
        // Send message and/or image to Django backend
        const response = await fetch('http://192.168.100.10:8000/api/query-ollama/', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' }, // Use multipart for images
          body: formData
        });
  
        if (!response.ok) throw new Error('Failed to get response from AI');
  
        const data = await response.json();
        const fullResponse = data.response;
  
        let currentText = '';
        let index = 0;
  
        // Replace "thinking" message with an empty message for animation
        setMessages(prev =>
          prev.map(msg => (msg.id === thinkingMessage.id ? { ...msg, text: '' } : msg))
        );
  
        // Typing effect: Add text letter by letter
        const interval = setInterval(() => {
          if (index < fullResponse.length) {
            currentText += fullResponse[index];
            index++;
  
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === thinkingMessage.id ? { ...msg, text: currentText } : msg
              )
            );
          } else {
            clearInterval(interval);
          }
        }, 30);
  
      } catch (error) {
        console.error('Error fetching AI response:', error);
        Alert.alert('Error', 'Failed to communicate with AI.');
      }
    }
  };
  
  const pickImage = async (source: 'gallery' | 'camera') => {
    if (source === 'gallery') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0].uri) {
          setPhotoPreview(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image from gallery');
      }
    } else {
      if (Platform.OS === 'web') {
        Alert.alert('Not supported', 'Camera is not supported on web');
        return;
      }

      try {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Camera access is needed to take photos');
          return;
        }
        setCameraType('back');
        setZoom(0);
        setFlashMode(false); // Ensure flash is off when camera opens
        setShowCamera(true);
      } catch (error) {
        console.error('Camera permission error:', error);
        Alert.alert('Error', 'Failed to access camera');
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'front' ? 'back' : 'front'));
    setFlashMode(false); // Turn off flash when switching cameras
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    
    setIsTakingPhoto(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        skipProcessing: true,
        exif: false,
      });
      
      if (photo?.uri) {
        setPhotoPreview(photo.uri);
        setShowCamera(false);
      } else {
        throw new Error('Photo capture returned no data');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setShowCamera(true);
  };

  const removePhotoPreview = () => {
    setPhotoPreview(null);
  };

  if (!fontsLoaded) {
    return null;
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
          enableTorch={flashMode}
          zoom={zoom}
          onCameraReady={() => console.log('Camera ready')}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
            Alert.alert('Error', 'Failed to load camera');
            setShowCamera(false);
          }}
        >
          <View style={styles.cameraControlsContainer}>
            <View style={styles.cameraTopControls}>
              <TouchableOpacity 
                style={styles.cameraControlButton} 
                onPress={() => setShowCamera(false)}
              >
                <Icon name="close" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cameraControlButton} 
                onPress={toggleFlash}
              >
                <Icon 
                  name={flashMode ? "flash-on" : "flash-off"} 
                  size={28} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraBottomControls}>
              <View style={styles.cameraMainButtonContainer}>
                <TouchableOpacity 
                  style={[styles.cameraMainButton, isTakingPhoto && styles.disabledButton]}
                  onPress={handleTakePhoto}
                  disabled={isTakingPhoto}
                >
                  <View style={styles.cameraMainButtonInner} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.cameraControlButton} 
                onPress={toggleCameraType}
                disabled={isTakingPhoto}
              >
                <Icon name="flip-camera-android" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#FE7F2D" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContent}
          contentContainerStyle={styles.chatContentContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                msg.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                { marginBottom: 20 }
              ]}
            >
              <View style={msg.isUser ? styles.userMessage : styles.aiMessage}>
                {msg.image && (
                  <Image 
                    source={{ uri: msg.image }} 
                    style={styles.messageImage}
                    resizeMode="cover"
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                )}
                {msg.text && (
                  <Text style={[styles.messageText, styles.defaultFont]}>
                    {msg.text}
                  </Text>
                )}
                <Text style={[styles.messageTime, styles.defaultFont]}>{msg.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Photo Preview */}
      {photoPreview && (
        <View style={styles.photoPreviewContainer}>
          <Image 
            source={{ uri: photoPreview }} 
            style={styles.photoPreviewImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.removePhotoButton}
            onPress={removePhotoPreview}
          >
            <Icon name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Container */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <View style={styles.inputSection}>
            <View style={styles.chatboxContainer}>
              <TextInput
                style={[styles.input, styles.defaultFont]}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
              />
              <View style={styles.mediaButtons}>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => pickImage('camera')}
                >
                  <FontAwesomeIcon name="camera" size={20} color="#FE7F2D" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => pickImage('gallery')}
                >
                  <FontAwesomeIcon name="image" size={20} color="#FE7F2D" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSend}
            >
              <Icon name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/home')}
          >
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/chat')}
          >
            <View style={styles.glowContainer}>
              <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" style={styles.glowIcon} />
            </View>
            <Text style={[styles.navText, styles.defaultFont]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/budget')}
          >
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/profile')}
          >
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00272B',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
  },
  settingsButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    marginTop: 10,
    marginBottom: 140,
  },
  chatContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    width: '100%',
  },
  aiMessage: {
    backgroundColor: 'rgba(254, 127, 45, 0.1)',
    padding: 15,
    borderRadius: 20,
    borderTopLeftRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: 'rgba(254, 127, 45, 0.3)',
    padding: 15,
    borderRadius: 20,
    borderTopRightRadius: 8,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#00272B',
    paddingTop: 8,
    height: 80,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 64,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  chatboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 56,
    backgroundColor: '#FBFCF8',
    borderRadius: 28,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 56,
    maxHeight: 56,
    paddingTop: 0,
    paddingBottom: 0,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  mediaButton: {
    paddingHorizontal: 6,
  },
  sendButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FE7F2D',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: '#2E2E2E',
  },
  defaultFont: {
    fontFamily: 'IstokWeb-Regular',
  },
  glowContainer: {
    position: 'relative',
  },
  glowIcon: {
    textShadowColor: '#E0FF4F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cameraControlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  cameraTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  cameraBottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cameraMainButtonContainer: {
    flex: 1,
    paddingLeft: 80,
    alignItems: 'center',
  },
  cameraControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  cameraMainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cameraMainButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#00272B',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: '#FE7F2D',
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  photoPreviewContainer: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;