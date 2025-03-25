import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';

const HomeScreen = () => {
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
        {/* Recent Logged Foods */}
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
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/home')}
          >
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Home</Text>
          </TouchableOpacity>

          {/* Capture */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/capture')}
          >
            <Icon name="camera-alt" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Capture</Text>
          </TouchableOpacity>

          {/* Budget */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/budget')}
          >
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Budget</Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/profile')}
          >
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00272B',
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginLeft: 20,
    marginBottom: 10,
  },
  foodContainer: {
    flex: 1,
    marginBottom: 75,
    marginHorizontal: 10,
    borderWidth: 1,
    backgroundColor: '#D9D9D9',
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    position: 'relative',
  },
  recentFoodsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    paddingTop: 40,
  },
  foodItem: {
    height: 100,
    backgroundColor: '#FBFCF8',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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

export default HomeScreen;
