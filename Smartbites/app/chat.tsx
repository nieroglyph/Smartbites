import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const ChatScreen = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
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
          style={styles.chatContent}
          contentContainerStyle={styles.chatContentContainer}
        >
          <View style={styles.aiMessageContainer}>
            <View style={styles.aiMessage}>
              <Text style={[styles.messageText, styles.defaultFont]}>
                Hello! I'm your SmartBites assistant. How can I help you today?
              </Text>
              <Text style={[styles.messageTime, styles.defaultFont]}>10:30 AM</Text>
            </View>
          </View>
        </ScrollView>
      </View>

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
              />
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton}>
                  <FontAwesomeIcon name="camera" size={20} color="#FE7F2D" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton}>
                  <FontAwesomeIcon name="image" size={20} color="#FE7F2D" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.sendButton}>
              <Icon name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          {/* Home */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/home')}
          >
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Home</Text>
          </TouchableOpacity>

          {/* Chat with glow effect */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/chat')}
          >
            <View style={styles.glowContainer}>
              <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" style={styles.glowIcon} />
            </View>
            <Text style={[styles.navText, styles.defaultFont]}>Chat</Text>
          </TouchableOpacity>

          {/* Budget */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/budget')}
          >
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Budget</Text>
          </TouchableOpacity>

          {/* Profile */}
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
    marginBottom: 140, // Space for input and nav
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
    marginBottom: 20,
    width: '100%',
  },
  aiMessage: {
    backgroundColor: 'rgba(254, 127, 45, 0.1)',
    padding: 15,
    borderRadius: 20,
    borderTopLeftRadius: 8,
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
  inputWrapper: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#00272B',
    paddingTop: 8,
    height: 80, // Fixed height for wrapper
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 64, // Fixed height for container
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // Fixed height for section
  },
  chatboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 56, // Fixed height for chatbox
    backgroundColor: '#FBFCF8',
    borderRadius: 28,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 56, // Fixed height for input
    maxHeight: 56, // Prevent expansion
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
    shadowColor: '#E0FF4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default ChatScreen;