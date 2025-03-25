import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define types for navigation
type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Budget: undefined;
  Profile: undefined;
};

const RecentFoodsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Section (Logo on Left, Dots Icon on Right) */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#FE7F2D" />
        </TouchableOpacity>
      </View>

      {/* Chatbox Section */}
      <View style={styles.inputSection}>
        <View style={styles.chatboxContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type Here!"
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon name="camera" size={24} color="#FE7F2D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon name="image" size={24} color="#FE7F2D" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sendContainer}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Help Text Section (Moved Down Near Chatbox) */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>What can I help with?</Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Capture')}>
            <Icon name="camera-alt" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Budget')}>
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Profile</Text>
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
    flexDirection: 'row', // Align items in a row
    alignItems: 'center',
    justifyContent: 'space-between', // Logo on left, icon on right
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
  },
  helpContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 130, // Placed just above the chatbox
    width: '100%',
  },
  helpText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 70,
    width: '100%',
    paddingHorizontal: 10,
  },
  chatboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 50,
    backgroundColor: '#D9D9D9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  iconButton: {
    paddingHorizontal: 8,
  },
  sendContainer: {
    width: 55,
    height: 50,
    backgroundColor: '#FE7F2D',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
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
  customFont: {
    fontFamily: 'IstokWeb-Regular',
  },
});

export default RecentFoodsScreen;
