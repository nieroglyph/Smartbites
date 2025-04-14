import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Modal, 
  TextInput,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
  Easing,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import * as MailComposer from 'expo-mail-composer';

type FeedbackCategory = 
  | 'Suggestions / Feature Requests'
  | 'Bug Report'
  | 'Support / Help Needed'
  | 'General Feedback'
  | 'Compliment / Positive Feedback'
  | 'Complaint / Negative Experience'
  | 'Account or Billing Issues'
  | 'Other';

type IoniconsName = 
  | 'person-outline' 
  | 'card-outline' 
  | 'information-circle-outline'
  | 'log-out-outline'
  | 'create-outline'
  | 'chevron-forward'
  | 'settings-outline'
  | 'star-outline'
  | 'chatbox-outline';

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

  // Feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('General Feedback');
  const [otherCategoryText, setOtherCategoryText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
 const slideAnim = useRef(new Animated.Value(-50)).current;
  const feedbackCategories: FeedbackCategory[] = [
    'General Feedback',
    'Suggestions / Feature Requests',
    'Bug Report',
    'Support / Help Needed',
    'Compliment / Positive Feedback',
    'Complaint / Negative Experience',
    'Account or Billing Issues',
    'Other',
  ];

  useEffect(() => {
    if (feedbackModalVisible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [feedbackModalVisible]);

  useEffect(() => {
    // Fetch user email from your database/API
    const fetchUserEmail = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        // Replace with your actual API endpoint to get user data
        const response = await fetch("http://192.168.254.111:8000/api/user/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserEmail(userData.email); // Assuming your API returns email in the response
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    fetchUserEmail();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  const profile = {
    profilePicture: null,
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
  ];

  const supportData: SettingItemProps[] = [
    { 
      icon: "chatbox-outline", 
      label: "Feedback",
      onPress: () => setFeedbackModalVisible(true) 
    },
    { 
      icon: "star-outline", 
      label: "Rate Us",
      onPress: () => console.log("Rate Us pressed") 
    },
    { 
      icon: "information-circle-outline", 
      label: "FAQ/Support",
      onPress: () => router.push('/faq')
    },
  ];

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage || (feedbackCategory === 'Other' && !otherCategoryText)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const category = feedbackCategory === 'Other' ? otherCategoryText : feedbackCategory;
      
      // Check if MailComposer is available
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Email services are not available on this device');
        return;
      }

      // Compose the email
      const result = await MailComposer.composeAsync({
        recipients: ['Smartbites@gmail.com'], // Replace with your support email
        subject: `Feedback: ${category}`,
        body: `
          Feedback Category: ${category}
          Message: ${feedbackMessage}
          
          User Details:
          Name: ${profile.name}
          Account Number: ${profile.accountNumber}
          Email: ${userEmail}
        `,
        isHtml: false
      });

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        Alert.alert('Success', 'Thank you for your feedback!');
        setFeedbackCategory('General Feedback');
        setOtherCategoryText('');
        setFeedbackMessage('');
        setFeedbackModalVisible(false);
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;
  
      await fetch("http://192.168.1.9:8000/api/logout/", {
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.push('/home')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
        </TouchableOpacity>
        <View style={styles.rightHeaderSpace} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
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
                <Ionicons name="create-outline" size={20} color="#FE7F2D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            {settingsData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={18} color="#FE7F2D" />
                <Text style={styles.settingText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FE7F2D" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Support Section */}
          <View style={styles.supportContainer}>
            <Text style={styles.sectionHeader}>Support</Text>
            {supportData.map((item, index) => (
              <TouchableOpacity
                key={`support-${index}`}
                style={styles.settingItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={18} color="#FE7F2D" />
                <Text style={styles.settingText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FE7F2D" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFeedbackModalVisible(false)}>
          <BlurView
            style={styles.blurView}
            intensity={20}
            tint="dark"
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View 
                style={[
                  styles.animatedModalView,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideAnim }
                    ],
                    opacity: opacityAnim,
                  }
                ]}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>We Value Your Feedback</Text>
                  
                  <Text style={styles.inputLabel}>Category</Text>
                  <ScrollView style={styles.categoryScrollView}>
                    {feedbackCategories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.categoryItem,
                          feedbackCategory === category && styles.selectedCategory
                        ]}
                        onPress={() => setFeedbackCategory(category)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.categoryText,
                          feedbackCategory === category && styles.selectedCategoryText
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {(feedbackCategory === 'Other') && (
                    <>
                      <Text style={styles.inputLabel}>Please specify</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your category..."
                        placeholderTextColor="#7F8C8D"
                        value={otherCategoryText}
                        onChangeText={setOtherCategoryText}
                        multiline={false}
                      />
                    </>
                  )}

                  <Text style={styles.inputLabel}>Message</Text>
                  <TextInput
                    style={[styles.textInput, styles.messageInput]}
                    placeholder="Enter your feedback message..."
                    placeholderTextColor="#7F8C8D"
                    value={feedbackMessage}
                    onChangeText={setFeedbackMessage}
                    multiline={true}
                    numberOfLines={4}
                  />

                  <View style={styles.modalButtonContainer}>
                    <Pressable
                      style={[styles.modalButton, styles.modalButtonClose]}
                      onPress={() => setFeedbackModalVisible(false)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.modalButton, 
                        styles.modalButtonSubmit,
                        (!feedbackMessage || (feedbackCategory === 'Other' && !otherCategoryText)) && styles.disabledButton
                      ]}
                      onPress={handleSubmitFeedback}
                      disabled={isSubmitting || !feedbackMessage || (feedbackCategory === 'Other' && !otherCategoryText)}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalButtonText}>Submit</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#E74C3C" />
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
    backgroundColor: '#00272B',
  },
  returnButton: {
    marginBottom: 5,
    marginRight: 15,
  },
  rightHeaderSpace: {
    width: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  profileContainer: {
    paddingHorizontal: 3,
    paddingTop: 8,
  },
  profileHeader: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF8",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profilePictureContainer: {
    marginRight: 12,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 14,
    color: "#7F8C8D",
    fontFamily: 'IstokWeb-Regular',
  },
  settingsContainer: {
    marginTop: 16,
    paddingHorizontal: 3,
  },
  settingItem: {
    borderRadius: 5,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF8",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
    height: 50,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#34495E",
    fontFamily: 'IstokWeb-Regular',
  },
  supportContainer: {
    marginTop: 24,
    paddingHorizontal: 3,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FBFCF8',
    marginBottom: 8,
    paddingLeft: 8,
    fontFamily: 'IstokWeb-Regular',
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#FDEDED',
  },
  logoutText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'IstokWeb-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 // modal styles
 blurView: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
},
  animatedModalView: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#002F38",
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
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
    marginBottom: 20,
    color: "#E0FF4F",
    textAlign: 'center',
    fontFamily: 'IstokWeb-Regular',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#FE7F2D",
    fontFamily: 'IstokWeb-Regular',
    fontWeight: '500',
  },
  categoryScrollView: {
    maxHeight: 150,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1D1F1F",
  },
  selectedCategory: {
    backgroundColor: "#003B46",
    borderRadius: 0,
  },
  categoryText: {
    fontSize: 14,
    color: "#1D1F1F",
    fontFamily: 'IstokWeb-Regular',
  },
  selectedCategoryText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: "#2D2F2F",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: "#1D1F1F",
    fontFamily: 'IstokWeb-Regular',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    elevation: 0,
    minWidth: 100,
    alignItems: 'center',
    flex: 1,
  },
  modalButtonClose: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#434545',
  },
  modalButtonSubmit: {
    backgroundColor: '#FE7F2D',
    marginLeft: 3,
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'IstokWeb-Regular',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default ProfileScreen;