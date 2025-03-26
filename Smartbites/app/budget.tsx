import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define types for navigation
type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Budget: undefined;
  Profile: undefined;
};

const BudgetScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  const [allowance, setAllowance] = useState('');
  const [expenses, setExpenses] = useState<{ amount: string; description: string }[]>([]);
  const [history, setHistory] = useState<{ amount: string; description: string }[]>([]);
  const [period, setPeriod] = useState('Weekly');

  if (!fontsLoaded) {
    return null;
  }

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
    setHistory([...history, ...expenses.filter(exp => exp.amount !== '')]);
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
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Allowance Period</Text>
      <Picker selectedValue={period} onValueChange={(itemValue) => setPeriod(itemValue)} style={styles.picker}>
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
      </Picker>

      <Text style={styles.title}>Allowance ({period})</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter allowance"
        value={allowance}
        onChangeText={setAllowance}
      />

      <Text style={styles.title}>Expense Tracking</Text>
      {expenses.map((expense, index) => (
        <View key={index} style={styles.expenseItem}>
          <TextInput
            style={styles.expenseInput}
            keyboardType="numeric"
            placeholder="Amount"
            value={expense.amount}
            onChangeText={text => updateExpense(index, 'amount', text)}
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

      {/* History Container */}
      <View style={styles.historyContainer}>
        <Text style={styles.title}>History</Text>
        <FlatList
          data={history}
          renderItem={({ item }) => (
            <Text style={styles.historyItem}>- ${item.amount} | {item.description}</Text>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>

      {/* Available Allowance Container */}
      <View style={styles.allowanceContainer}>
        <Text style={styles.allowanceTitle}>Available Allowance</Text>
        <Text style={styles.allowanceText}>${calculateAvailable()}</Text>
      </View>

      {/* Reset Button (Moved outside allowance container) */}
      <Button title="Reset Budget" onPress={resetBudget} color="red" />

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <FontAwesomeIcon name="home" size={24} color="#FE7F2D" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Capture')}>
            <Icon name="camera-alt" size={24} color="#FE7F2D" />
            <Text style={styles.navText}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Budget')}>
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={styles.navText}>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00272B', padding: 20 },
  logo: { width: 120, height: 50, resizeMode: 'contain', marginBottom: 20 },
  title: { color: 'white', fontSize: 18, marginBottom: 10 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 5, height: 50, marginBottom: 10 },
  expenseItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom: 10 },
  expenseInput: { backgroundColor: 'white', padding: 10, borderRadius: 5, width: '40%', height: 50 },
  iconButton: { padding: 5 },
  historyContainer: { backgroundColor: '#003B46', padding: 10, borderRadius: 5, marginTop: 10 },
  historyItem: { color: 'white', padding: 5 },
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
  picker: { backgroundColor: 'white', borderRadius: 5, marginBottom: 10, height: 50 },
});

export default BudgetScreen;
