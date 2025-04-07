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
  Easing
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';

type IoniconsName = 
  | 'person-outline' 
  | 'card-outline' 
  | 'information-circle-outline'
  | 'log-out-outline'
  | 'create-outline'
  | 'chevron-forward'
  | 'settings-outline'
  | 'close';

type MaterialCommunityIcons = 
  | 'food-variant'
  | 'cash'
  | 'allergy'
  | 'keyboard-return';

interface SettingItemProps {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
}

const UserprofileScreen = () => {
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  const [selectedAllowance, setSelectedAllowance] = useState('Weekly');
  const [selectedDiet, setSelectedDiet] = useState('Vegan');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  const commonAllergies = [
    'Peanuts', 'Shellfish', 'Eggs', 'Milk', 'Wheat', 'Soy', 'Tree Nuts', 'Fish', 'Gluten', 'Sesame'
  ];

  const handleSettingPress = (label: string) => {
    console.log(`Navigating to ${label}`);
  };

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

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Mark Denzel Permison</Text>
                <Text style={styles.accountNumber}>Account number: 0123456789</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <MaterialCommunityIcons name="cash" size={22} color="#FE7F2D" />
              <Text style={styles.settingText}>Allowance</Text>
              <Picker
                selectedValue={selectedAllowance}
                style={styles.picker}
                onValueChange={(itemValue: string) => setSelectedAllowance(itemValue)}
              >
                <Picker.Item label="Weekly" value="Weekly" />
                <Picker.Item label="Monthly" value="Monthly" />
              </Picker>
            </View>

            <View style={styles.settingItem}>
              <MaterialCommunityIcons name="food-variant" size={22} color="#FE7F2D" />
              <Text style={styles.settingText}>Dietary Preference</Text>
              <Picker
                selectedValue={selectedDiet}
                style={styles.picker}
                onValueChange={(itemValue: string) => setSelectedDiet(itemValue)}
              >
                <Picker.Item label="Vegan" value="Vegan" />
                <Picker.Item label="Keto" value="Keto" />
                <Picker.Item label="Vegetarian" value="Vegetarian" />
                <Picker.Item label="Omnivore" value="Omnivore" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowAllergiesModal(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="allergy" size={22} color="#FE7F2D" />
              <Text style={styles.settingText}>Allergies</Text>
              <Ionicons name="chevron-forward" size={18} color="#FE7F2D" />
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
                        <Ionicons name="close" size={16} color="#fff" />
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
                      <Ionicons name="add" size={24} color="#FE7F2D" />
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
  },
  returnButton: {
    marginRight: 15,
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ECF0F1",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 13,
    color: "#7F8C8D",
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
  },
  picker: {
    height: 40,
    width: 100,
  },
  selectedAllergiesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  selectedAllergiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FE7F2D',
  },
  selectedAllergiesBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  allergyBox: {
    backgroundColor: '#FE7F2D',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
    width: '18%', 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',  
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 2,
  },
  allergyText: {
    fontSize: 14,
    color: '#fff',
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
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#FE7F2D",
    textAlign: 'center',
  },
  allergyItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    marginTop: 10,
    padding: 10,
    fontSize: 14,
    color: "#fff",
  },
  addAllergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addButton: {
    marginLeft: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonClose: {
    backgroundColor: '#FE7F2D',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserprofileScreen;