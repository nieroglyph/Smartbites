import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import LogoutSplashScreen from './logout_splashscreen';
import AsyncStorage from "@react-native-async-storage/async-storage";

type IoniconsName = 
  | 'person-outline' 
  | 'card-outline' 
  | 'information-circle-outline'
  | 'log-out-outline'
  | 'create-outline'
  | 'chevron-forward'
  | 'settings-outline';

interface SettingItemProps {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
}

const ProfileScreen = () => {
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  const profile = {
    profilePicture: null, // Set to null to use default image
    name: "Mark Denzel Permison",
    accountNumber: "0123456789"
  };

  const settingsData: SettingItemProps[] = [
    { 
      icon: "person-outline", 
      label: "User Profile",
      onPress: () => router.push('/userprofile') 
    },
    { icon: "card-outline", label: "My cards" },
    { icon: "settings-outline", label: "Application settings" },
    { icon: "information-circle-outline", label: "FAQ/Support" },
  ];

  const handleSettingPress = (label: string, onPress?: () => void) => {
    console.log(`Navigating to ${label}`);
    if (onPress) {
      onPress();
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;
  
      await fetch("http://192.168.254.111:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
  
      await AsyncStorage.removeItem("authToken");
      router.push("/logout_splashscreen");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header with return button and logo */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.push('/home')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
        </TouchableOpacity>
        
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Container */}
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.profilePictureContainer}>
                <Image
                  source={profile.profilePicture ? { uri: profile.profilePicture } : require('../assets/default-profile.png')}
                  style={styles.profilePicture}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.accountNumber}>Account number: {profile.accountNumber}</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => router.push('/profile_edit')}
              >
                <Ionicons name="create-outline" size={24} color="#FE7F2D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Container */}
          <View style={styles.settingsContainer}>
            {settingsData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={() => handleSettingPress(item.label, item.onPress)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={22} color="#FE7F2D" />
                <Text style={styles.settingText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#FE7F2D" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Footer Container */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#00272B",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  returnButton: {
    marginRight: 15,
  },
  logo: {
    width: 120,
    height: 40,
  },
  contentContainer: {
    flex: 1,
  },
  footerContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF8",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePictureContainer: {
    marginRight: 15,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    fontFamily: 'IstokWeb-Regular',
  },
  accountNumber: {
    fontSize: 13,
    color: "#7F8C8D",
    fontFamily: 'IstokWeb-Regular',
  },
  settingsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  settingItem: {
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF8",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 15,
    color: "#34495E",
    fontFamily: 'IstokWeb-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FDEDED',
  },
  logoutText: {
    color: "#E74C3C",
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'IstokWeb-Regular',
  },
});

export default ProfileScreen;