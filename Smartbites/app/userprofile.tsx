import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal,
  TextInput,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
  Easing,
  Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import useUserProfile from './hooks/useUserProfile';

type IoniconsName = 
  | 'person-outline' 
  | 'card-outline' 
  | 'information-circle-outline'
  | 'log-out-outline'
  | 'create-outline'
  | 'chevron-forward'
  | 'settings-outline'
  | 'close'
  | 'add'
  | 'chevron-down';

type MaterialCommunityIcons = 
  | 'food-variant'
  | 'cash'
  | 'allergy'
  | 'keyboard-return';

const UserprofileScreen = () => {
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  const [selectedAllowance, setSelectedAllowance] = useState('Weekly');
  const [selectedDiet, setSelectedDiet] = useState('Vegan');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showAllowanceOptions, setShowAllowanceOptions] = useState(false);
  const [showDietOptions, setShowDietOptions] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const allowanceRef = useRef<View>(null);
  const dietRef = useRef<View>(null);

  useEffect(() => {
    if (showAllergiesModal) {
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
  }, [showAllergiesModal]);

  // Handle taps outside dropdowns
  useEffect(() => {
    const handleTapOutside = () => {
      if (showAllowanceOptions) {
        setShowAllowanceOptions(false);
      }
      if (showDietOptions) {
        setShowDietOptions(false);
      }
      Keyboard.dismiss();
    };

    if (showAllowanceOptions || showDietOptions) {
      // For web/desktop
      if (typeof document !== 'undefined') {
        document.addEventListener('mousedown', handleTapOutside);
      }
      // For mobile
      return () => {
        if (typeof document !== 'undefined') {
          document.removeEventListener('mousedown', handleTapOutside);
        }
      };
    }
  }, [showAllowanceOptions, showDietOptions]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
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

  const commonAllergies = [
    'Peanuts', 'Shellfish', 'Eggs', 'Milk', 'Wheat', 'Soy', 'Tree Nuts', 'Fish', 'Gluten', 'Sesame'
  ];

  const allowanceOptions = ['Weekly', 'Monthly'];
  const dietOptions = ['Vegan', 'Keto', 'Vegetarian', 'Omnivore'];

  const removeAllergy = (allergyToRemove: string) => {
    setSelectedAllergies(selectedAllergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleAddAllergy = () => {
    if (newAllergy && !selectedAllergies.includes(newAllergy)) {
      setSelectedAllergies([...selectedAllergies, newAllergy]);
      setNewAllergy('');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback 
        onPress={() => {
          setShowAllowanceOptions(false);
          setShowDietOptions(false);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.contentContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar} />
                <View style={styles.profileInfo}>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userEmail}>{profile.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingsContainer}>
              {/* Allowance Selection */}
              <View ref={allowanceRef}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowAllowanceOptions(!showAllowanceOptions);
                    setShowDietOptions(false);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="cash" size={18} color="#FE7F2D" />
                  <Text style={styles.settingText}>Allowance: {selectedAllowance}</Text>
                  <Ionicons name={showAllowanceOptions ? "chevron-down" : "chevron-forward"} size={16} color="#FE7F2D" />
                </TouchableOpacity>

                {showAllowanceOptions && (
                  <View style={styles.optionsContainer}>
                    {allowanceOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionItem,
                          selectedAllowance === option && styles.selectedOption
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedAllowance(option);
                          setShowAllowanceOptions(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionText,
                          selectedAllowance === option && styles.selectedOptionText
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Dietary Preference Selection */}
              <View ref={dietRef}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDietOptions(!showDietOptions);
                    setShowAllowanceOptions(false);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="food-variant" size={18} color="#FE7F2D" />
                  <Text style={styles.settingText}>Diet: {selectedDiet}</Text>
                  <Ionicons name={showDietOptions ? "chevron-down" : "chevron-forward"} size={16} color="#FE7F2D" />
                </TouchableOpacity>

                {showDietOptions && (
                  <View style={styles.optionsContainer}>
                    {dietOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionItem,
                          selectedDiet === option && styles.selectedOption
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedDiet(option);
                          setShowDietOptions(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionText,
                          selectedDiet === option && styles.selectedOptionText
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Allergies */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowAllergiesModal(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="allergy" size={18} color="#FE7F2D" />
                <Text style={styles.settingText}>Allergies</Text>
                <Ionicons name="chevron-forward" size={16} color="#FE7F2D" />
              </TouchableOpacity>

              {selectedAllergies.length > 0 && (
                <View style={styles.selectedAllergiesContainer}>
                  <Text style={styles.selectedAllergiesTitle}>Selected Allergies:</Text>
                  <View style={styles.selectedAllergiesBox}>
                    {selectedAllergies.map((allergy, index) => (
                      <View
                        key={index}
                        style={styles.allergyBox}
                      >
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => removeAllergy(allergy)}
                        >
                          <Ionicons name="close" size={12} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.allergyText}>{allergy}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.footerContainer} />
      
      <Modal
        visible={showAllergiesModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAllergiesModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAllergiesModal(false)}>
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
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  }
                ]}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Allergies</Text>
                  
                  {commonAllergies.map((allergy, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[ 
                        styles.allergyItem,
                        selectedAllergies.includes(allergy) && styles.selectedAllergy,
                      ]}
                      onPress={() => {
                        if (selectedAllergies.includes(allergy)) {
                          setSelectedAllergies(selectedAllergies.filter(item => item !== allergy));
                        } else {
                          setSelectedAllergies([...selectedAllergies, allergy]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.allergyText, selectedAllergies.includes(allergy) && styles.selectedAllergyText]}>{allergy}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  <View style={styles.addAllergyContainer}>
                    <TextInput
                      style={styles.inputAllergy}
                      value={newAllergy}
                      onChangeText={setNewAllergy}
                      placeholder="Add custom allergy"
                      placeholderTextColor="#7F8C8D"
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddAllergy}
                    >
                      <Ionicons name="add" size={20} color="#FE7F2D" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalButtonContainer}>
                    <Pressable
                      style={[styles.modalButton, styles.modalButtonClose]}
                      onPress={() => setShowAllergiesModal(false)}
                    >
                      <Text style={styles.modalButtonText}>Close</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
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
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ECF0F1",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    fontFamily: 'IstokWeb-Regular',
  },
  userEmail: {
    fontSize: 13,
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
    fontSize: 13,
    marginLeft: 12,
    color: "#34495E",
    fontFamily: 'IstokWeb-Regular',
  },
  optionsContainer: {
    backgroundColor: '#FBFCF8',
    borderRadius: 5,
    marginBottom: 8,
    padding: 8,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selectedOption: {
    backgroundColor: '#FE7F2D',
    borderRadius: 4,
  },
  optionText: {
    fontSize: 13,
    color: '#34495E',
    fontFamily: 'IstokWeb-Regular',
  },
  selectedOptionText: {
    color: '#fff',
  },
  selectedAllergiesContainer: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  selectedAllergiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FE7F2D',
    fontFamily: 'IstokWeb-Regular',
  },
  selectedAllergiesBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  allergyBox: {
    backgroundColor: '#FE7F2D',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergyText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'IstokWeb-Regular',
  },
  selectedAllergyText: {
    color: '#000',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedModalView: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#00272B",
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FE7F2D",
    textAlign: 'center',
    fontFamily: 'IstokWeb-Regular',
  },
  allergyItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  selectedAllergy: {
    backgroundColor: "#FE7F2D",
    borderRadius: 4,
  },
  inputAllergy: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#7F8C8D",
    marginTop: 8,
    padding: 8,
    fontSize: 13,
    color: "#fff",
    fontFamily: 'IstokWeb-Regular',
  },
  addAllergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 6,
    padding: 12,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonClose: {
    backgroundColor: '#FE7F2D',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
    fontFamily: 'IstokWeb-Regular',
  },
});

export default UserprofileScreen;