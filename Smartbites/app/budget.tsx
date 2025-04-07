import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const BudgetScreen = () => {
  const router = useRouter();

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
          style={styles.logo}
        />

        <Text style={[styles.title, styles.defaultFont]}>Allowance Period</Text>
        <Picker selectedValue={period} onValueChange={(itemValue) => setPeriod(itemValue)} style={styles.picker}>
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>

        <Text style={[styles.title, styles.defaultFont]}>Allowance ({period})</Text>
        <TextInput
          style={[styles.input, styles.defaultFont]}
          keyboardType="numeric"
          placeholder="Enter allowance"
          value={allowance}
          onChangeText={setAllowance}
        />

        <Text style={[styles.title, styles.defaultFont]}>Expense Tracking</Text>
        {expenses.map((expense, index) => (
          <View key={index} style={styles.expenseItem}>
            <TextInput
              style={[styles.expenseInput, styles.defaultFont]}
              keyboardType="numeric"
              placeholder="Amount"
              value={expense.amount}
              onChangeText={text => updateExpense(index, 'amount', text)}
            />
            <TextInput
              style={[styles.expenseInput, styles.defaultFont]}
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

        <View style={styles.historyContainer}>
          <Text style={[styles.title, styles.defaultFont]}>History</Text>
          <FlatList
            data={history}
            renderItem={({ item }) => (
              <Text style={[styles.historyItem, styles.defaultFont]}>- ${item.amount} | {item.description}</Text>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>

        <View style={styles.allowanceContainer}>
          <Text style={[styles.allowanceTitle, styles.defaultFont]}>Available Allowance</Text>
          <Text style={[styles.allowanceText, styles.defaultFont]}>₱{calculateAvailable()}</Text>
        </View>

        <Button title="Reset Budget" onPress={resetBudget} color="red" />
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
  container: { 
    flex: 1, 
    backgroundColor: '#00272B', 
    padding: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  logo: { 
    width: 120, 
    height: 50, 
    resizeMode: 'contain', 
    marginBottom: 20 
  },
  title: { 
    color: 'white', 
    fontSize: 18, 
    marginBottom: 10 
  },
  input: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 5, 
    height: 50, 
    marginBottom: 10 
  },
  expenseItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 50, 
    marginBottom: 10 
  },
  expenseInput: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 5, 
    width: '40%', 
    height: 50 
  },
  iconButton: { 
    padding: 5 
  },
  historyContainer: { 
    backgroundColor: '#003B46', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10 
  },
  historyItem: { 
    color: 'white', 
    padding: 5 
  },
  allowanceContainer: {
    backgroundColor: '#003B46',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  allowanceTitle: { 
    color: 'white', 
    fontSize: 18, 
    marginBottom: 5 
  },
  allowanceText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  picker: { 
    backgroundColor: 'white', 
    borderRadius: 5, 
    marginBottom: 10, 
    height: 50 
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: '#2E2E2E',
  },
  defaultFont: {
    fontFamily: 'IstokWeb-Regular',
  },
  glowContainer: {
    position: 'relative',
  },
  glowIcon: {
    textShadowColor: '#E0FF4F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    shadowColor: '#E0FF4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default BudgetScreen;