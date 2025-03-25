import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const LogoutSplashScreen: React.FC = () => {
  const router = useRouter();
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Load the font
  const [fontsLoaded] = useFonts({
    'IstokWeb-Bold': require('../assets/fonts/IstokWeb-Bold.ttf'),
  });

  useEffect(() => {
    // Start progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/logo/smartbites-high-resolution-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.message}>Logging out securely...</Text>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00272B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 150,
    borderRadius: 15,
    marginBottom: 30,
  },
  message: {
    color: '#FBFCF8',
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'IstokWeb-Bold',
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E0FF4F',
  },
});

export default LogoutSplashScreen;