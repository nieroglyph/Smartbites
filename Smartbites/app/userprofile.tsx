import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal,TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from "@react-native-async-storage/async-storage";

type IoniconsName = 
  | 'person-outline' 
  | 'card-outline' 
  | 'information-circle-outline'
  | 'log-out-outline'
  | 'create-outline'
  | 'chevron-forward'
  | 'settings-outline';

type MaterialCommunityIcons = 
  | 'food-variant'
  | 'cash'
  | 'allergy';

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

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.push('/home')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
        </TouchableOpacity>
        
        <Image 
          source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="create-outline" size={24} color="#FE7F2D" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="cash" size={22} color="#FE7F2D" />
              <Text style={styles.settingText}>Allowance</Text>
              <Picker
                selectedValue={selectedAllowance}
                style={styles.picker}
                onValueChange={(itemValue: string) => setSelectedAllowance(itemValue)} // Fixed type annotation here
              >
                <Picker.Item label="Weekly" value="Weekly" />
                <Picker.Item label="Monthly" value="Monthly" />
              </Picker>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="food-variant" size={22} color="#FE7F2D" />
              <Text style={styles.settingText}>Dietary Preference</Text>
              <Picker
                selectedValue={selectedDiet}
                style={styles.picker}
                onValueChange={(itemValue: string) => setSelectedDiet(itemValue)} // Fixed type annotation here
              >
                <Picker.Item label="Vegan" value="Vegan" />
                <Picker.Item label="Keto" value="Keto" />
                <Picker.Item label="Vegetarian" value="Vegetarian" />
                <Picker.Item label="Omnivore" value="Omnivore" />
              </Picker>
            </TouchableOpacity>

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
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllergiesModal(false)}
      >
        <View style={styles.modalContainer}>
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
                <Text style={styles.allergyText}>{allergy}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.inputAllergy}
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="Add custom allergy"
              placeholderTextColor="#7F8C8D"
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => {
                if (newAllergy) {
                  setSelectedAllergies([...selectedAllergies, newAllergy]);
                  setNewAllergy('');
                }
                setShowAllergiesModal(false);
              }}
            >
              <Text style={styles.closeModalText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowAllergiesModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FBFCF8",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#FE7F2D",
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
    borderBottomWidth: 1,
    borderBottomColor: "#7F8C8D",
    marginTop: 10,
    padding: 10,
    fontSize: 14,
    color: "#2C3E50",
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FE7F2D",
    borderRadius: 6,
    alignItems: "center",
  },
  closeModalText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UserprofileScreen;
