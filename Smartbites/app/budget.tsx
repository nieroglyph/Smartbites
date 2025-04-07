import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Budget: undefined;
  Profile: undefined;
  Chat: undefined;
};

const BudgetScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [allowance, setAllowance] = useState('');
  const [expenses, setExpenses] = useState<{ amount: string; description: string }[]>([]);
  const [history, setHistory] = useState<{ amount: string; description: string; date: string }[]>([]);

  const showAlert = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Invalid Input', message);
    }
  };

  const handleNumericInput = (text: string, callback: (value: string) => void) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (text !== numericText) showAlert('Please enter numbers only.');
    callback(numericText);
  };

  const addExpense = () => {
    setExpenses([...expenses, { amount: '', description: '' }]);
  };

  const removeExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const updateExpense = (index: number, field: 'amount' | 'description', value: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    setExpenses(updatedExpenses);
  };

  const saveExpenses = () => {
    const currentDateTime = new Date().toLocaleString();
    const newHistory = expenses
      .filter(exp => exp.amount !== '')
      .map(exp => ({ ...exp, date: currentDateTime }));
    setHistory([...history, ...newHistory]);
    setExpenses([]);
  };

  const calculateAvailable = () => {
    const totalExpenses = history.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
    const available = parseFloat(allowance || '0') - totalExpenses;
    return isNaN(available) ? '0.00' : available.toFixed(2);
  };

  const resetBudget = () => {
    setAllowance('');
    setExpenses([]);
    setHistory([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#00272B' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
            style={styles.logo}
          />

          <View style={styles.titleContainer}>
            <FontAwesome6Icon name="money-bill-1-wave" size={24} color="#FE7F2D" style={styles.icon} />
            <Text style={styles.title}>Allowance</Text>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter allowance"
            value={allowance}
            onChangeText={text => handleNumericInput(text, setAllowance)}
          />

          <View style={styles.titleContainer}>
            <FontAwesomeIcon name="minus-circle" size={24} color="#FE7F2D" style={styles.icon} />
            <Text style={styles.title}>Expense Tracking</Text>
          </View>

          {expenses.map((expense, index) => (
            <View key={index} style={styles.expenseItem}>
              <TextInput
                style={styles.expenseInput}
                keyboardType="numeric"
                placeholder="Amount"
                value={expense.amount}
                onChangeText={text => handleNumericInput(text, val => updateExpense(index, 'amount', val))}
              />
              <TextInput
                style={styles.expenseInput}
                placeholder="Description"
                value={expense.description}
                onChangeText={text => updateExpense(index, 'description', text)}
              />
              <TouchableOpacity style={styles.iconButton} onPress={() => removeExpense(index)}>
                <Entypo name="circle-with-cross" size={24} color="#FE7F2D" />
              </TouchableOpacity>
            </View>
          ))}

          <Button title="Add Expense" onPress={addExpense} color="orange" />
          <Button title="Save Expenses" onPress={saveExpenses} color="green" />

          <View style={{ marginTop: 20 }} />

          <View style={styles.titleContainer}>
            <FontAwesomeIcon name="history" size={24} color="#FE7F2D" style={styles.icon} />
            <Text style={styles.title}>History</Text>
          </View>

          <View style={styles.historyContainer}>
            <FlatList
              data={history}
              renderItem={({ item }) => (
                <Text style={styles.historyItem}>
                  - ₱{item.amount} | {item.description} | {item.date}
                </Text>
              )}
              keyExtractor={(item, index) => index.toString()}
              nestedScrollEnabled={true}
            />
          </View>

          <View style={styles.allowanceContainer}>
            <Text style={styles.allowanceTitle}>Available Allowance</Text>
            <Text style={styles.allowanceText}>₱{calculateAvailable()}</Text>
          </View>

          <Button title="Reset Budget" onPress={resetBudget} color="red" />
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* Navigation Bar with Glow Effect on Active Tab */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/home')}
          >
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/chat')}
          >
            <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/budget')}
          >
            <View style={styles.glowContainer}>
              <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" style={styles.glowIcon} />
            </View>
            <Text style={[styles.navText, styles.defaultFont]}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/profile')}
          >
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.defaultFont]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#00272B', padding: 20 },
  logo: { width: 120, height: 50, resizeMode: 'contain', marginBottom: 20 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { marginRight: 10 },
  title: { color: 'white', fontSize: 18 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 5, height: 50, marginBottom: 10 },
  expenseItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom: 10 },
  expenseInput: { backgroundColor: 'white', padding: 10, borderRadius: 5, width: '40%', height: 50 },
  iconButton: { padding: 5 },
  historyContainer: {
    height: 200,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  allowanceContainer: {
    backgroundColor: '#003B46',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  allowanceTitle: { color: 'white', fontSize: 18, marginBottom: 5 },
  allowanceText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  navContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingVertical: 10 },
  navigation: { flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 5, color: '#2E2E2E' },
  defaultFont: {},
  glowContainer: { shadowColor: '#FE7F2D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  glowIcon: {
    textShadowColor: '#FE7F2D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default BudgetScreen;

