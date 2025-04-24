import { ToastConfig } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type MyToastTypes = {
  success: {
    text1: string;
    text2?: string;
  };
  error: {
    text1: string;
    text2?: string;
  };
};

const styles = StyleSheet.create({
  baseToast: {
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  successToast: {
    borderBottomWidth: 3,
    borderBottomColor: '#4BB543',
  },
  errorToast: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF4444',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#111',
    fontWeight: '600',
    fontSize: 15,
  },
  message: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  }
});

export const toastConfig: ToastConfig<MyToastTypes> = {
  success: ({ text1, text2 }: MyToastTypes['success']) => (
    <View style={[styles.baseToast, styles.successToast]}>
      <Icon name="check-circle" size={20} color="#4BB543" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message} numberOfLines={4}>{text2}</Text>}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: MyToastTypes['error']) => (
    <View style={[styles.baseToast, styles.errorToast]}>
      <Icon name="error-outline" size={20} color="#FF4444" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message} numberOfLines={4}>{text2}</Text>}
      </View>
    </View>
  ),
};