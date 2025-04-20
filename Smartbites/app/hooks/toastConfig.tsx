import { ToastConfig } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  successToast: {
    backgroundColor: '#4BB543',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorToast: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    marginLeft: 10
  },
  title: {
    color: 'white', 
    fontWeight: 'bold'
  },
  message: {
    color: 'white'
  }
});

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.successToast}>
      <Icon name="check-circle" size={20} color="white" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.errorToast}>
      <Icon name="error" size={20} color="white" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};
