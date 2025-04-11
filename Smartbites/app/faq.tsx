import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

type IoniconsName = 
  | 'chevron-forward'
  | 'mail-outline';

const FAQScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });

  const faqs = [
    {
      question: "What is SmartBites AI Chatbot?",
      answer: "SmartBites AI Chatbot is an intelligent assistant that helps you identify food items through image recognition and provides nutritional information, recipes, and dietary recommendations."
    },
    {
      question: "How does the image recognition work?",
      answer: "Simply take a photo of your food, and our advanced AI will analyze the image to identify the food items. It can recognize thousands of different foods with high accuracy."
    },
    {
      question: "Can it recognize multiple foods in one image?",
      answer: "Yes! Our AI can identify multiple food items in a single image and provide separate nutritional information for each item."
    },
    {
      question: "Does it work with packaged foods?",
      answer: "Absolutely. The AI can recognize barcodes and packaged food labels to provide accurate nutritional information."
    },
    {
      question: "How accurate is the nutritional information?",
      answer: "Our database contains verified nutritional information from reliable sources. For packaged foods, we use official product data when available."
    },
    {
      question: "Can it accommodate dietary restrictions?",
      answer: "Yes, you can set your dietary preferences and restrictions in your profile, and the chatbot will provide personalized recommendations."
    },
    {
      question: "Is SmartBites AI Chatbot free to use?",
      answer: "Yes, the basic features of SmartBites AI Chatbot are free. Premium features such as meal planning, localized price checking, and advanced analytics may require a subscription."
    },
    {
      question: "Can I track my daily calorie intake with this chatbot?",
      answer: "Definitely! The chatbot can log your meals and calculate daily calorie intake based on the foods you identify or input manually."
    },
    {
      question: "Is SmartBites available offline?",
      answer: "Some features like previously scanned items and saved recipes are available offline, but image recognition and database updates require an internet connection."
    },
    {
      question: "What kind of dietary plans does it support?",
      answer: "SmartBites supports various dietary plans including vegan, vegetarian, keto, low-carb, diabetic-friendly, and more. You can choose or customize one that fits your lifestyle."
    },
    {
      question: "Can I use this chatbot to manage food allergies?",
      answer: "Yes. You can input allergens to avoid, and the chatbot will alert you if a scanned or suggested item contains any of them."
    },
    {
      question: "Does it support multiple languages?",
      answer: "Currently, SmartBites supports English, with plans to expand to more languages based on user demand."
    }
  ];
  const handleContactUs = () => {
    Linking.openURL('mailto:support@smartbites.com?subject=SmartBites%20Inquiry');
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
      {/* Header with Title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard-return" size={24} color="#FE7F2D" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.titleText}>Frequently Asked Questions</Text>
          <Text style={styles.subtitleText}>SmartBites AI Chatbot with Image Recognition</Text>
        </View>
        <View style={styles.rightHeaderSpace} />
      </View>

      {/* Content - Scrollable FAQ Items */}
      <ScrollView style={styles.faqScrollContainer} contentContainerStyle={styles.faqScrollContent}>
        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.questionText}>{faq.question}</Text>
              <Text style={styles.answerText}>{faq.answer}</Text>
              {index < faqs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactUs}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={18} color="#FBFCF8" />
          <Text style={styles.contactText}>Contact Us</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#00272B",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 43,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#00272B',
  },
  returnButton: {
    marginBottom: 5,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  rightHeaderSpace: {
    width: 24,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FE7F2D',
    marginBottom: 4,
    fontFamily: 'IstokWeb-Regular',
  },
  subtitleText: {
    fontSize: 10,
    color: '#FBFCF8',
    fontFamily: 'IstokWeb-Regular',
  },
  faqScrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  faqScrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContainer: {
    backgroundColor: "#FBFCF8",
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  faqItem: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: "#00272B",
    marginBottom: 8,
    fontFamily: 'IstokWeb-Regular',
  },
  answerText: {
    fontSize: 13,
    color: "#34495E",
    fontFamily: 'IstokWeb-Regular',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginVertical: 16,
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#FE7F2D',
  },
  contactText: {
    color: "#FBFCF8",
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'IstokWeb-Regular',
  },
});

export default FAQScreen;