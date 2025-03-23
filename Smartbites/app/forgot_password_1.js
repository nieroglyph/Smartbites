import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

const ForgotPasswordScreen = () => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')} style={styles.logo} />
      
      {/* Title */}
      <Text style={styles.title}>Password Reset</Text>
      <Text style={styles.subtitle}>
        Provide the email address associated with your account to recover your password
      </Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#B0B0B0" />
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset password</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <Text style={styles.signUpText}>
        Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#082b29',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    logo: {
      width: 120,
      height: 50,
      resizeMode: 'contain',
      marginBottom: 130,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
    },
    title: {
      fontSize: 22,
      fontFamily: 'IstokWeb-Bold',
      color: '#ffffff',
      marginBottom: 5,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'IstokWeb-Bold',
      color: '#B0B0B0',
      textAlign: 'center',
      marginBottom: 20,
    },
    label: {
      alignSelf: 'flex-start',
      fontSize: 14,
      fontFamily: 'IstokWeb-Bold',
      color: '#ffffff',
      marginBottom: 5,
      width: '100%',
    },
    inputContainer: {
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'IstokWeb-Bold',
      color: '#000000',
    },
    resetButton: {
      width: '100%',
      backgroundColor: '#ff7f32',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 30,
    },
    resetButtonText: {
      fontSize: 16,
      fontFamily: 'IstokWeb-Bold',
      color: '#ffffff',
    },
    signUpText: {
      fontSize: 14,
      fontFamily: 'IstokWeb-Bold',
      color: '#B0B0B0',
      textAlign: 'center',
    },
    signUpLink: {
      color: '#ffd700',
      fontFamily: 'IstokWeb-Bold',
    },
  });
  


export default ForgotPasswordScreen;
