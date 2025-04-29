import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserProfile from "./hooks/useUserProfile";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Budget: undefined;
  Profile: undefined;
  Chat: undefined;
};

type ExpenseHistoryItem = {
  amount: string;
  description: string;
  date: string;
};

const BudgetScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const [expenses, setExpenses] = useState<{ amount: string; description: string }[]>([]);
  const [history, setHistory] = useState<ExpenseHistoryItem[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);

  interface SwipeableHistoryItemProps {
    item: ExpenseHistoryItem;
    index: number;
    onDelete: (index: number) => void;
  }

  const SwipeableHistoryItem = React.forwardRef<Swipeable, SwipeableHistoryItemProps>(
    ({ item, index, onDelete }, ref) => {
      const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const translateX = dragX.interpolate({
          inputRange: [-80, 0],
          outputRange: [0, 80],
          extrapolate: 'clamp'
        });
  
        return (
          <View style={styles.deleteContainer}>
            <Animated.View style={[styles.deleteBox, { transform: [{ translateX }] }]}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  const currentRef = swipeableRefs.current[index];
                  if (currentRef) currentRef.close();
                  onDelete(index);
                }}
              >
                <MaterialCommunityIcons 
                  name="trash-can-outline" 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      };
  
      return (
        <Swipeable 
          ref={(r) => {
            if (ref) {
              if (typeof ref === 'function') {
                ref(r);
              } else {
                (ref as React.MutableRefObject<Swipeable | null>).current = r;
              }
            }
            swipeableRefs.current[index] = r;
          }}
          renderRightActions={renderRightActions}
          rightThreshold={40}
          friction={2}
          overshootRight={false}
          onSwipeableWillOpen={() => {
            swipeableRefs.current.forEach((ref, i) => {
              if (i !== index && ref) {
                ref.close();
              }
            });
          }}
        >
          <View style={styles.historyItem}>
            <View style={styles.historyItemTop}>
              <Text style={styles.historyAmount}>₱{item.amount}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <Text style={styles.historyDesc}>{item.description}</Text>
          </View>
        </Swipeable>
      );
    }
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("expenseHistory");
        if (json) setHistory(JSON.parse(json));
      } catch (err) {
        console.error("Failed to load history", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("expenseHistory", JSON.stringify(history));
      } catch (err) {
        console.error("Failed to save history", err);
      }
    })();
  }, [history]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (profileLoading)
    return <ActivityIndicator style={{ flex: 1, justifyContent: "center" }} />;
  if (profileError) return <Text>Error: {profileError}</Text>;

  const budget = profile.budget ?? 0;
  const totalExpenses = history.reduce(
    (sum, e) => sum + parseFloat(e.amount || "0"),
    0
  );
  const available = (budget - totalExpenses).toFixed(2);

  const showAlert = (message: string) => {
    if (Platform.OS === "android")
      ToastAndroid.show(message, ToastAndroid.SHORT);
    else Alert.alert(message);
  };

  const handleNumericInput = (text: string, setter: (val: string) => void) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (text !== digits) showAlert("Numbers only!");
    setter(digits);
  };

  const addExpense = () =>
    setExpenses([...expenses, { amount: "", description: "" }]);
  const removeExpense = (i: number) =>
    setExpenses(expenses.filter((_, idx) => idx !== i));
  const updateExpense = (
    i: number,
    field: "amount" | "description",
    val: string
  ) => {
    const copy = [...expenses];
    copy[i][field] = val;
    setExpenses(copy);
  };

  const saveExpenses = () => {
    const now = new Date().toLocaleString();
    const newEntries = expenses
      .filter((e) => e.amount)
      .map((e) => ({ ...e, date: now }));

    setHistory((prev) => [...prev, ...newEntries]);
    setExpenses([]);
  };

  const resetHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (index: number) => {
    const updatedHistory = [...history];
    updatedHistory.splice(index, 1);
    setHistory(updatedHistory);
    showAlert("Expense deleted");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.container}>
            <Image
              source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
              style={styles.logo}
            />

            <View style={styles.allowanceCard}>
              <Text style={styles.allowanceInfoText}>Available Balance</Text>
              <Text style={styles.allowanceAmountText}>₱{available}</Text>

              <View style={styles.availableAllowanceContainer}>
                <Text style={styles.availableAllowanceLabel}>
                  Your Budget
                </Text>
                <Text style={styles.availableAllowanceValue}>₱{budget.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.addExpenseCard}>
                <View style={styles.sectionHeader}>
                  <FontAwesomeIcon
                    name="minus-circle"
                    size={16}
                    color="#FE7F2D"
                    style={styles.icon}
                  />
                  <Text style={styles.sectionTitle}>Add New Expense</Text>
                </View>

                <ScrollView 
                  style={[
                    styles.expensesScroll,
                    expenses.length > 2 && { maxHeight: 150 },
                  ]}
                  nestedScrollEnabled={true}
                >
                  {expenses.map((exp, i) => (
                    <View key={i} style={styles.expenseItem}>
                      <View style={styles.expenseAmountContainer}>
                        <Text style={styles.expenseLabel}>₱</Text>
                        <TextInput
                          style={styles.expenseAmountInput}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#888"
                          value={exp.amount}
                          onChangeText={(txt) =>
                            handleNumericInput(txt, (v) =>
                              updateExpense(i, "amount", v)
                            )
                          }
                        />
                      </View>
                      <TextInput
                        style={styles.expenseDescInput}
                        placeholder="Description"
                        placeholderTextColor="#888"
                        value={exp.description}
                        onChangeText={(txt) => updateExpense(i, "description", txt)}
                      />
                      <TouchableOpacity 
                        onPress={() => removeExpense(i)} 
                        style={{ marginLeft: 5 }}
                      >
                        <Entypo name="circle-with-cross" size={22} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                    <Text style={styles.buttonText}>Add Expense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      !expenses.length && styles.disabledButton,
                    ]}
                    onPress={saveExpenses}
                    disabled={!expenses.length}
                  >
                    <Text style={styles.buttonText}>Save Expenses</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.historyCard}>
                <View style={styles.sectionHeader}>
                  <FontAwesomeIcon
                    name="history"
                    size={16}
                    color="#FE7F2D"
                    style={styles.icon}
                  />
                  <Text style={styles.sectionTitle}>Expense History</Text>
                  {history.length > 0 && (
                    <Text style={styles.swipeHint}>Swipe left to delete</Text>
                  )}
                </View>

                {history.length === 0 ? (
                  <Text style={styles.emptyHistory}>No expense history yet</Text>
                ) : (
                  <ScrollView 
                    style={styles.historyScroll}
                    nestedScrollEnabled={true}
                  >
                    {history.map((item, index) => (
                      <SwipeableHistoryItem 
                        key={index}
                        item={item}
                        index={index}
                        onDelete={deleteHistoryItem}
                        ref={() => {}}
                      />
                    ))}
                  </ScrollView>
                )}

                {history.length > 0 && (
                  <TouchableOpacity style={styles.resetButton} onPress={resetHistory}>
                    <Text style={styles.resetButtonText}>Reset History</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {!keyboardVisible && (
              <View style={styles.navContainer}>
                <View style={styles.navigation}>
                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/home")}
                  >
                    <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
                    <Text style={[styles.navText, styles.defaultFont]}>Home</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/chat")}
                  >
                    <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" />
                    <Text style={[styles.navText, styles.defaultFont]}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/budget")}
                  >
                    <FontAwesome6Icon
                      name="money-bills"
                      size={24}
                      color="#FE7F2D"
                      style={styles.glowIcon}
                    />
                    <Text style={[styles.navText, styles.defaultFont]}>Budget</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/profile")}
                  >
                    <MaterialCommunityIcons
                      name="account-settings"
                      size={24}
                      color="#FE7F2D"
                    />
                    <Text style={[styles.navText, styles.defaultFont]}>
                      Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 45,
    resizeMode: "contain",
    marginLeft: 20,
    marginBottom: 10,
  },
  allowanceCard: {
    backgroundColor: "#003B46",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  allowanceInfoText: {
    color: "#E0FF4F",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  allowanceAmountText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 6,
  },
  availableAllowanceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableAllowanceLabel: {
    color: "#E0FF4F",
    fontSize: 14,
    fontWeight: "500",
  },
  availableAllowanceValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  addExpenseCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  expensesScroll: {
    width: "100%",
  },
  historyCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    height: 300,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  sectionTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  swipeHint: {
    color: "red",
    fontSize: 12,
    fontStyle: "italic",
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  expenseAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 36,
    width: "30%",
    marginRight: 8,
  },
  expenseLabel: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  expenseAmountInput: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    height: 36,
    padding: 6,
  },
  expenseDescInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 8,
    height: 36,
    fontSize: 14,
    color: "#222",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addButton: {
    backgroundColor: "#FE7F2D",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  historyScroll: {
    width: "100%",
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  historyItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FE7F2D",
  },
  historyDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  historyDesc: {
    fontSize: 14,
    color: "#fff",
  },
  emptyHistory: {
    textAlign: "center",
    padding: 15,
    color: "#888",
    fontStyle: "italic",
    fontSize: 14,
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    zIndex: 10,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: "#2E2E2E",
  },
  defaultFont: { 
    fontFamily: "IstokWeb-Regular" 
  },
  glowIcon: {
    textShadowColor: "#E0FF4F",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  deleteAction: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    width: 100,
  },
  deleteActionText: {
    color: 'white',
    fontWeight: '600',
    padding: 20,
  },
  deleteContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBox: {
    width: 60,
    height: '80%',
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BudgetScreen;