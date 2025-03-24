import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
      {/* Logo */}
      <Image
        source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
        style={styles.logo}
      />

      {/* Food Container */}
      <View style={styles.foodContainer}>
        {/* Recent Logged Foods - Fixed Position */}
        <View style={styles.recentFoodsContainer}>
          <View style={styles.recentFoodsTitle}>
            <Icon name="data-saver-on" size={24} color="#FE7F2D" style={styles.recentIcon} />
            <Text style={[styles.recentFoodsText, styles.customFont]}>Recent Logged Foods</Text>
          </View>
        </View>

        {/* Scrollable Food Items */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {[...Array(20)].map((_, index) => (
            <View key={index} style={styles.foodItem} />
          ))}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          {/* Home */}
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Home</Text>
          </TouchableOpacity>

          {/* Capture */}
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Capture')}>
            <Icon name="camera-alt" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Capture</Text>
          </TouchableOpacity>

          {/* Budget */}
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Budget')}>
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Budget</Text>
          </TouchableOpacity>

          {/* Profile */}
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
    paddingTop: 20, // Add padding to ensure the logo doesn't stick to the top edge
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginLeft: 20, // Add left margin to position the logo in the top-left corner
    marginBottom: 10,
  },
  foodContainer: {
    flex: 1,
    marginBottom: 75,
    marginHorizontal: 10, // Add horizontal margin for the border
    borderWidth: 1, // Add border width
    backgroundColor: '#D9D9D9',
    borderColor: '#e0e0e0', // Border color
    borderRadius: 5, // Rounded corners
    padding: 10, // Add padding inside the container
    position: 'relative', // Ensure the container is relative for absolute positioning
  },
  recentFoodsContainer: {
    position: 'absolute', // Position absolutely within the foodContainer
    top: 10, // Adjust top position as needed
    left: 10, // Adjust left position as needed
    zIndex: 1, // Ensure it stays above the scrollable content
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    padding: 5,
    borderRadius: 5,
  },
  recentFoodsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    marginRight: 5,
  },
  recentFoodsText: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  scrollContent: {
    paddingTop: 40, // Add padding to ensure the content doesn't overlap with the fixed section
  },
  foodItem: {
    height: 100,
    backgroundColor: '#FBFCF8',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    elevation: 5, // For Android shadow
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
