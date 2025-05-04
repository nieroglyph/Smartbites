import React, { useState, useRef, useEffect } from "react";
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
  Keyboard,
  Alert,
  ToastAndroid,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import useUserProfile from "./hooks/useUserProfile";
import Toast from 'react-native-toast-message';

type IoniconsName =
  | "person-outline"
  | "card-outline"
  | "information-circle-outline"
  | "log-out-outline"
  | "create-outline"
  | "chevron-forward"
  | "settings-outline"
  | "close"
  | "add"
  | "chevron-down";

type MaterialCommunityIcons =
  | "food-variant"
  | "cash"
  | "allergy"
  | "keyboard-return";

const UserprofileScreen = () => {
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "IstokWeb-Regular": require("../assets/fonts/IstokWeb-Regular.ttf"),
  });

  const [selectedAllowance, setSelectedAllowance] = useState("Weekly");
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("Vegan");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showAllowanceOptions, setShowAllowanceOptions] = useState(false);
  const [showDietOptions, setShowDietOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedAllergies, setTempSelectedAllergies] = useState<string[]>([]);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const allowanceRef = useRef<View>(null);
  const dietRef = useRef<View>(null);

  useEffect(() => {
    if (showAllergiesModal) {
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
  }, [showAllergiesModal]);

  useEffect(() => {
    if (profile?.dietary_preference) {
      setSelectedDiet(
        profile.dietary_preference.charAt(0).toUpperCase() +
          profile.dietary_preference.slice(1)
      );
    }
    if (profile?.allergies) {
      const allergies = profile.allergies.split(", ");
      setSelectedAllergies(allergies);
      setTempSelectedAllergies(allergies);
    }
    if (profile?.budget !== undefined && profile?.budget !== null) {
      setAllowanceAmount(profile.budget.toString());
    }
  }, [profile]);


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
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", handleTapOutside);
      }
      // For mobile
      return () => {
        if (typeof document !== "undefined") {
          document.removeEventListener("mousedown", handleTapOutside);
        }
      };
    }
  }, [showAllowanceOptions, showDietOptions]);

  const showAlert = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: message,
    });
  };

  const updateProfile = async (data: {
    dietary_preference?: string;
    allergies?: string;
    budget?: number;
  }): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return false;
      }

      const response = await fetch(
        "http://192.168.1.7:8000/api/update-user-profile/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: message,
      });
      return false;
    }
  };

  const handleNumericInput = (
    text: string,
    callback: (value: string) => void
  ) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (text !== numericText) showAlert("Please enter numbers only.");
    callback(numericText);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile: {error}</Text>
      </View>
    );
  }

  const commonAllergies = [
    "Peanuts",
    "Shellfish",
    "Eggs",
    "Milk",
    "Wheat",
    "Soy",
    "Tree Nuts",
    "Fish",
    "Gluten",
    "Sesame",
  ];

  const filteredAllergies = commonAllergies.filter((allergy) =>
    allergy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allowanceOptions = ["Weekly", "Monthly"];
  const dietOptions = ["Vegan", "Keto", "Vegetarian", "Omnivore"];

  const removeAllergy = async (allergyToRemove: string) => {
    const updatedAllergies = selectedAllergies.filter(
      (a) => a !== allergyToRemove
    );

    setSelectedAllergies(updatedAllergies);

    const success = await updateProfile({
      allergies: updatedAllergies.join(", "),
    });

    if (!success) {
      setSelectedAllergies([...selectedAllergies]);
      showAlert("Failed to remove allergy.");
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy && !tempSelectedAllergies.includes(newAllergy)) {
      setTempSelectedAllergies([...tempSelectedAllergies, newAllergy]);
      setNewAllergy('');
    }
  };

  const handleDietSelect = async (option: string) => {
    const success = await updateProfile({
      dietary_preference: option.toLowerCase(),
    });
    if (success) {
      Toast.show({
        type: "success",
        text1: "Diet Updated",
        text2: `Your dietary preference is now ${option}`,
      });
      setSelectedDiet(option);
    }
  };

  const saveAllowance = async () => {
    if (!allowanceAmount) {
      showAlert("Please enter an amount");
      return;
    }

    const success = await updateProfile({
      budget: parseFloat(allowanceAmount),
    });

    if (success) {
      Toast.show({
        type: "success",
        text1: "Budget Updated",
        text2: "Your spending limit has been saved",
      });
      setShowAllowanceOptions(false);
    }
  };

  const handleSaveAllergies = async () => {
    const success = await updateProfile({
      allergies: tempSelectedAllergies.join(", "),
    });
    if (success) {
      setSelectedAllergies(tempSelectedAllergies);
      Toast.show({
        type: "success",
        text1: "Allergies Saved",
        text2: "Your dietary restrictions have been updated",
      });
      setShowAllergiesModal(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => router.push("/profile")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="keyboard-return"
            size={24}
            color="#FE7F2D"
          />
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
              {/* Allowance Section */}
              <View ref={allowanceRef} style={styles.allowanceSection}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowAllowanceOptions(!showAllowanceOptions);
                    setShowDietOptions(false);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="cash"
                    size={18}
                    color="#FE7F2D"
                  />
                  <Text style={styles.settingText}>
                    Budget:{" "}
                    {allowanceAmount ? `₱${allowanceAmount}.00` : "Not set"}
                  </Text>
                  <Ionicons
                    name={
                      showAllowanceOptions ? "chevron-down" : "chevron-forward"
                    }
                    size={16}
                    color="#FE7F2D"
                  />
                </TouchableOpacity>

                {showAllowanceOptions && (
                  <View style={styles.dropdownContainer}>
                    <View style={styles.optionsContainer}>
                      {allowanceOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionItem,
                            selectedAllowance === option &&
                              styles.selectedOption,
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            setSelectedAllowance(option);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selectedAllowance === option &&
                                styles.selectedOptionText,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Integrated Allowance Input */}
                    <View style={styles.allowanceInputWrapper}>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.amountInputLabel}>Amount</Text>
                        <View style={styles.amountInputField}>
                          <Text style={styles.currencySymbol}>₱</Text>
                          <TextInput
                            style={styles.allowanceInput}
                            keyboardType="numeric"
                            placeholder="0.00"
                            value={allowanceAmount}
                            onChangeText={(text) =>
                              handleNumericInput(text, setAllowanceAmount)
                            }
                            placeholderTextColor="#7F8C8D"
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.saveAllowanceButton}
                        onPress={() => {
                          saveAllowance();
                          setShowAllowanceOptions(false);
                        }}
                      >
                        <Text style={styles.saveAllowanceButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Dietary Preference Selection */}
              <View ref={dietRef} style={styles.dietSection}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDietOptions(!showDietOptions);
                    setShowAllowanceOptions(false);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="food-variant"
                    size={18}
                    color="#FE7F2D"
                  />
                  <Text style={styles.settingText}>Diet: {selectedDiet}</Text>
                  <Ionicons
                    name={showDietOptions ? "chevron-down" : "chevron-forward"}
                    size={16}
                    color="#FE7F2D"
                  />
                </TouchableOpacity>

                {showDietOptions && (
                  <View
                    style={[
                      styles.optionsContainer,
                      styles.dietOptionsContainer,
                    ]}
                  >
                    {dietOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionItem,
                          selectedDiet === option && styles.selectedOption,
                          index === dietOptions.length - 1 &&
                            styles.lastOptionItem,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDietSelect(option);
                          setShowDietOptions(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedDiet === option &&
                              styles.selectedOptionText,
                          ]}
                        >
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
                onPress={() => {
                  setShowAllergiesModal(true);
                  setTempSelectedAllergies([...selectedAllergies]);
                  setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="allergy"
                  size={18}
                  color="#FE7F2D"
                />
                <Text style={styles.settingText}>Allergies</Text>
                <Ionicons name="chevron-forward" size={16} color="#FE7F2D" />
              </TouchableOpacity>

              {selectedAllergies.length > 0 && (
                <View style={styles.selectedAllergiesContainer}>
                  <Text style={styles.selectedAllergiesTitle}>
                    Selected Allergies:
                  </Text>
                  <View style={styles.selectedAllergiesBox}>
                    {selectedAllergies.map((allergy, index) => (
                      <View key={index} style={styles.allergyBox}>
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
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          setShowAllergiesModal(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowAllergiesModal(false)}>
          <BlurView style={styles.blurView} intensity={50} tint="dark">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.animatedModalView,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideAnim },
                    ],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Dietary Restrictions</Text>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Common Food Allergens
                  </Text>
                  
                  {/* Added scroll indicator text */}
                  <Text style={styles.scrollIndicator}>Scroll for more options</Text>

                  <ScrollView 
                    style={styles.allergyList}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="white"
                  >
                  {commonAllergies.map((allergy, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.allergyItem,
                        tempSelectedAllergies.includes(allergy) && styles.selectedAllergy,
                        index === commonAllergies.length - 1 && styles.lastAllergyItem,
                      ]}
                      onPress={() => {
                        if (tempSelectedAllergies.includes(allergy)) {
                          setTempSelectedAllergies(
                            tempSelectedAllergies.filter((item) => item !== allergy)
                          );
                        } else {
                          setTempSelectedAllergies([...tempSelectedAllergies, allergy]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.allergyItemText,
                          tempSelectedAllergies.includes(allergy) && styles.selectedAllergyText,
                        ]}
                      >
                        {allergy}
                      </Text>
                      {tempSelectedAllergies.includes(allergy) && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FE7F2D"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  </ScrollView>

                  <View style={styles.divider} />

                  <Text style={styles.customAllergyTitle}>
                    Add Food Allergen
                  </Text>

                  <View style={styles.addAllergyContainer}>
                  <TextInput
                    style={styles.inputAllergy}
                    value={newAllergy}
                    onChangeText={setNewAllergy}
                    placeholder="Type allergen name"
                    placeholderTextColor="#7F8C8D"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.addButton,
                      !newAllergy && styles.addButtonDisabled,
                      pressed && styles.pressedButton,
                    ]}
                    onPress={handleAddAllergy}
                    disabled={!newAllergy}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </Pressable>
                </View>

                <View style={styles.modalButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalButtonSubmit,
                    pressed && styles.pressedButton,
                  ]}
                  onPress={async () => {
                    await handleSaveAllergies();
                    setShowAllergiesModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Save & Close</Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: "#00272B",
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
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    fontFamily: "IstokWeb-Regular",
  },
  userEmail: {
    fontSize: 14,
    color: "#7F8C8D",
    fontFamily: "IstokWeb-Regular",
  },
  settingsContainer: {
    marginTop: 16,
    paddingHorizontal: 3,
  },
  allowanceSection: {
    marginBottom: 8,
    backgroundColor: "#FBFCF8",
    borderRadius: 5,
    overflow: "hidden",
  },
  dropdownContainer: {
    backgroundColor: "#FBFCF8",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF8",
    padding: 14,
    borderBottomWidth: 1,
    borderRadius: 5,
    borderBottomColor: "#ECF0F1",
    height: 50,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#34495E",
    fontFamily: "IstokWeb-Regular",
  },
  optionsContainer: {
    backgroundColor: "#FBFCF8",
    padding: 8,
  },
  dietOptionsContainer: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  lastOptionItem: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  selectedOption: {
    backgroundColor: "#FE7F2D",
    borderRadius: 4,
  },
  optionText: {
    fontSize: 14,
    color: "#34495E",
    fontFamily: "IstokWeb-Regular",
  },
  selectedOptionText: {
    color: "#fff",
  },
  allowanceInputWrapper: {
    backgroundColor: "#FBFCF8",
    padding: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  amountInputContainer: {
    borderTopWidth: 1,
    borderColor: "#FE7F2D",
    marginBottom: 12,
  },
  amountInputLabel: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 6,
    fontFamily: "IstokWeb-Regular",
    fontWeight: "700",
    paddingTop: 8,
  },
  amountInputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECF0F1",
    borderRadius: 5,
    height: 46,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#34495E",
    paddingHorizontal: 12,
    fontFamily: "IstokWeb-Regular",
  },
  allowanceInput: {
    flex: 1,
    height: "100%",
    color: "#34495E",
    fontSize: 16,
    fontFamily: "IstokWeb-Regular",
  },
  saveAllowanceButton: {
    backgroundColor: "#FE7F2D",
    borderRadius: 5,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  saveAllowanceButtonText: {
    color: "white",
    fontFamily: "IstokWeb-Regular",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedAllergiesContainer: {
    paddingHorizontal: 12,
    marginTop: 8,
    backgroundColor: "transparent",
    paddingBottom: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  dietSection: {
    marginBottom: 8,
    backgroundColor: "#FBFCF8",
    borderRadius: 5,
    overflow: "hidden",
  },
  selectedAllergiesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FE7F2D",
    fontFamily: "IstokWeb-Regular",
  },
  selectedAllergiesBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  allergyBox: {
    backgroundColor: "#FE7F2D",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  allergyText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "IstokWeb-Regular",
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  animatedModalView: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#002F38",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#2D2F2F",
    overflow: "hidden",
  },
  modalHeader: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomColor: "#2D2F2F",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0FF4F",
    fontFamily: "IstokWeb-Regular",
    textAlign: "center",
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#434545",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FE7F2D",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    fontFamily: "IstokWeb-Regular",
  },
  allergyList: {
    maxHeight: 235,
    paddingHorizontal: 20,
  },
  allergyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#2D2F2F',
  },
  lastAllergyItem: {
    marginBottom: 0,
  },
  selectedAllergy: {
    backgroundColor: '#003B46',
    borderColor: '#003B46',
  },
  allergyItemText: {
    fontSize: 16,
    color: '#1D1F1F',
    fontFamily: 'IstokWeb-Regular',
  },
  selectedAllergyText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  customAllergyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FE7F2D",
    marginBottom: 12,
    paddingHorizontal: 20,
    fontFamily: "IstokWeb-Regular",
  },
  addAllergyContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputAllergy: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#2D2F2F",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1D1F1F",
    fontFamily: "IstokWeb-Regular",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#FE7F2D",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  addButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "IstokWeb-Regular",
  },
  modalButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#2D2F2F",
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    elevation: 0,
    minWidth: 100,
    alignItems: 'center',
    flex: 1,
  },
  modalButtonSubmit: {
    backgroundColor: '#FE7F2D',
  },
  modalButtonSave: {
    backgroundColor: "#FE7F2D",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    flex: 1,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "IstokWeb-Regular",
  },
  allowanceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollIndicator: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: "IstokWeb-Regular",
  },
  pressedButton: {
    opacity: 0.7,
  },
});

export default UserprofileScreen;
