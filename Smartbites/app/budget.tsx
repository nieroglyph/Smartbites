import React, { useState, useEffect } from "react";
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

type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Budget: undefined;
  Profile: undefined;
  Chat: undefined;
};

const BudgetScreen = () => {
  const router = useRouter();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const [expenses, setExpenses] = useState<
    { amount: string; description: string }[]
  >([]);
  const [history, setHistory] = useState<
    { amount: string; description: string; date: string }[]
  >([]);

  // load saved history once
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

  // whenever history changes, save it
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("expenseHistory", JSON.stringify(history));
      } catch (err) {
        console.error("Failed to save history", err);
      }
    })();
  }, [history]);

  if (profileLoading)
    return <ActivityIndicator style={{ flex: 1, justifyContent: "center" }} />;
  if (profileError) return <Text>Error: {profileError}</Text>;

  // Pull budget from the server
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
    setHistory([]); // triggers persisting an empty array
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Budget Card */}
        <View style={styles.allowanceCard}>
          <Text style={styles.allowanceInfoText}>Your Budget</Text>
          <Text style={styles.allowanceAmountText}>₱{budget.toFixed(2)}</Text>

          <View style={styles.availableAllowanceContainer}>
            <Text style={styles.availableAllowanceLabel}>
              Available Balance
            </Text>
            <Text style={styles.availableAllowanceValue}>₱{available}</Text>
          </View>
        </View>

        {/* Add Expense */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FontAwesomeIcon
              name="minus-circle"
              size={20}
              color="#FE7F2D"
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Add New Expense</Text>
          </View>

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
              <TouchableOpacity onPress={() => removeExpense(i)}>
                <Entypo name="circle-with-cross" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}

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

        {/* Expense History */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FontAwesomeIcon
              name="history"
              size={20}
              color="#FE7F2D"
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Expense History</Text>
          </View>

          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>No expense history yet</Text>
          ) : (
            history.map((itm, idx) => (
              <View key={idx} style={styles.historyItem}>
                <View style={styles.historyItemTop}>
                  <Text style={styles.historyAmount}>₱{itm.amount}</Text>
                  <Text style={styles.historyDate}>{itm.date}</Text>
                </View>
                <Text style={styles.historyDesc}>{itm.description}</Text>
              </View>
            ))
          )}

          {history.length > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={resetHistory}>
              <Text style={styles.resetButtonText}>Reset History</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 70 }} />
      </ScrollView>

      {/* Navigation Bar - kept exactly the same */}
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
            <Text style={[styles.navText, styles.defaultFont]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginLeft: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  allowanceCard: {
    backgroundColor: "#003B46",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  allowanceInfoText: {
    color: "#E0FF4F",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  allowanceAmountText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
  },
  availableAllowanceContainer: {
    marginTop: 10,
    paddingTop: 10,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  expenseAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 48,
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
    fontSize: 15,
    color: "#222",
    height: 48,
    padding: 8,
  },
  expenseDescInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 8,
    height: 48,
    fontSize: 15,
    color: "#222",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addButton: {
    backgroundColor: "#FE7F2D",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  historyWrapper: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    maxHeight: 300,
    minHeight: 100,
  },
  historyScroll: {
    paddingHorizontal: 8,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  historyItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE7F2D",
  },
  historyDate: {
    fontSize: 14,
    color: "#666",
  },
  historyDesc: {
    fontSize: 14,
    color: "#444",
  },
  emptyHistory: {
    textAlign: "center",
    padding: 20,
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
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 14,
    marginTop: 5,
    color: "#2E2E2E",
  },
  defaultFont: {},
  glowIcon: {
    textShadowColor: "#E0FF4F",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default BudgetScreen;
