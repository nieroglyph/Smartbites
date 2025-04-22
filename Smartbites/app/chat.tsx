import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  id: number;
  text: string;
  time: string;
  isUser: boolean;
  image?: string;
}

const ThinkingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseInDuration = 250;
    const pulseOutDuration = 250;
    const delayBetween = 150;

    const animation = Animated.loop(
      Animated.stagger(delayBetween, [
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: pulseInDuration,
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0.3,
            duration: pulseOutDuration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, {
            toValue: 1,
            duration: pulseInDuration,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0.3,
            duration: pulseOutDuration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, {
            toValue: 1,
            duration: pulseInDuration,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0.3,
            duration: pulseOutDuration,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.thinkingContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.9, 1.1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.9, 1.1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.9, 1.1],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const ChatScreen = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your SmartBites assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUser: false,
    },
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [inputHeight, setInputHeight] = useState(16);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const responseInterval = useRef<NodeJS.Timeout | null>(null);

  const [cameraPermission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const CHAT_STORAGE_KEY = "user_chat_history";

  const [fontsLoaded] = useFonts({
    "IstokWeb-Regular": require("../assets/fonts/IstokWeb-Regular.ttf"),
  });

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedChat = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (savedChat) {
          const parsedMessages = JSON.parse(savedChat);
          setMessages(parsedMessages);
        } else {
          // Set initial message only if no history exists
          setMessages([
            {
              id: 1,
              text: "Hello! I'm your SmartBites assistant. How can I help you today?",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isUser: false,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    };

    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const clearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: async () => {
            if (responseInterval.current) {
              clearInterval(responseInterval.current);
              responseInterval.current = null;
            }
            setIsAIResponding(false);
            const newMessages = [{
              id: 1,
              text: "Hello! I'm your SmartBites assistant. How can I help you today?",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isUser: false
            }];
            setMessages(newMessages);
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
          }
        }
      ]
    );
  };

  useEffect(() => {
    return () => {
      if (responseInterval.current) {
        clearInterval(responseInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your media library to attach images"
        );
      }

      if (!cameraPermission) {
        const { granted } = await requestPermission();
        if (!granted) {
          console.log("Camera permission not granted");
        }
      }
    })();
  }, []);

  const FormattedText = ({ text }: { text: string }) => {
    const elements: JSX.Element[] = [];
    let keyIndex = 0;

    text.split("\n\n").forEach((paragraph, pIndex) => {
      paragraph.split("\n").forEach((line, lIndex) => {
        const lineElements: JSX.Element[] = [];
        let remaining = line.trim();
        let hasBullet = false;

        if (remaining.startsWith("* ")) {
          hasBullet = true;
          remaining = remaining.substring(2).trim();
        }

        while (remaining.includes("**")) {
          const parts = remaining.split("**");
          const before = parts[0];
          const boldContent = parts[1] || "";
          remaining = parts.slice(2).join("**");

          if (before) {
            lineElements.push(
              <Text
                key={`text-${keyIndex++}`}
                style={[styles.messageText, styles.defaultFont]}
              >
                {before}
              </Text>
            );
          }

          if (boldContent) {
            lineElements.push(
              <Text
                key={`bold-${keyIndex++}`}
                style={[
                  styles.messageText,
                  styles.defaultFont,
                  { fontWeight: "700" },
                ]}
              >
                {boldContent}
              </Text>
            );
          }
        }

        if (remaining) {
          lineElements.push(
            <Text
              key={`remaining-${keyIndex++}`}
              style={[styles.messageText, styles.defaultFont]}
            >
              {remaining}
            </Text>
          );
        }

        elements.push(
          <View key={`line-${pIndex}-${lIndex}`} style={styles.lineContainer}>
            {hasBullet && (
              <Text
                style={[
                  styles.messageText,
                  styles.defaultFont,
                  { color: "#FE7F2D", marginRight: 8 },
                ]}
              >
                •
              </Text>
            )}
            <Text style={styles.lineText}>{lineElements}</Text>
          </View>
        );
      });

      if (pIndex < text.split("\n\n").length - 1) {
        elements.push(<View key={`space-${pIndex}`} style={{ height: 12 }} />);
      }
    });

    return <View style={styles.textContainer}>{elements}</View>;
  };

  const handleSend = async () => {
    if ((message.trim() || photoPreview) && !isAIResponding) {
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: true,
        ...(photoPreview && { image: photoPreview }),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setMessage("");
      setPhotoPreview(null);
      setInputHeight(16);

      const thinkingMessage: Message = {
        id: messages.length + 2,
        text: "###THINKING_ANIMATION###",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: false,
      };

      setMessages((prev) => [...prev, thinkingMessage]);
      setIsAIResponding(true);

      try {
        const formData = new FormData();
        formData.append("prompt", message);
        if (photoPreview) {
          const filename = photoPreview.split("/").pop() || "photo.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append("image", {
            uri: photoPreview,
            type,
            name: filename,
          } as any);
        }

        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "Not authenticated");
          return false;
        }
        const response = await fetch(
          "http://192.168.1.9:8000/api/query-ollama/",
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Token ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Failed to get response from AI");

        const data = await response.json();
        const fullResponse = data.response;

        let currentText = "";
        let index = 0;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessage.id ? { ...msg, text: "" } : msg
          )
        );

        responseInterval.current = setInterval(() => {
          if (index < fullResponse.length) {
            currentText += fullResponse[index];
            index++;

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === thinkingMessage.id
                  ? { ...msg, text: currentText }
                  : msg
              )
            );
          } else {
            if (responseInterval.current) {
              clearInterval(responseInterval.current);
              responseInterval.current = null;
            }
            setIsAIResponding(false);
          }
        }, 30);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        Alert.alert("Error", "Failed to communicate with AI.");
        setIsAIResponding(false);
        if (responseInterval.current) {
          clearInterval(responseInterval.current);
          responseInterval.current = null;
        }
      }
    }
  };

  const saveRecipe = async (recipeData: {
    title: string;
    ingredients: string;
    instructions: string;
    cost?: number | null;
  }): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");
  
      const response = await fetch("http://192.168.1.9:8000/api/save-recipe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(recipeData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to save recipe");
      }
      
      return true;
      
    } catch (error: unknown) {
      throw error;
    }
  };

  function parseRecipes(responseText: string): Array<{
    title: string;
    ingredients: string;
    instructions: string;
    cost: number | null;
  }> {
    const recipes: Array<{
      title: string;
      ingredients: string;
      instructions: string;
      cost: number | null;
    }> = [];

    const recipeDelimiters = [
      /\*\*Recipe \d+\*\*/g,
      /\n##\s/g,
      /\n\n\n/g,
      /\n\*\*\d+\.\*\*\s/g,
    ];

    let recipeSections: string[] = [];
    let delimiterUsed = null;

    for (const delimiter of recipeDelimiters) {
      const sections = responseText.split(delimiter).filter((s) => s.trim());
      if (sections.length > 1) {
        recipeSections = sections;
        delimiterUsed = delimiter;
        break;
      }
    }

    if (recipeSections.length <= 1) {
      const titleMatches = [
        ...responseText.matchAll(/\*\*Title:\*\*\s*(.+?)\n/g),
      ];
      if (titleMatches.length > 1) {
        recipeSections = [];
        let lastIndex = 0;
        titleMatches.forEach((match, index) => {
          if (index > 0) {
            recipeSections.push(responseText.substring(lastIndex, match.index));
          }
          lastIndex = match.index || 0;
        });
        recipeSections.push(responseText.substring(lastIndex));
      }
    }

    if (recipeSections.length <= 1) {
      recipeSections = [responseText];
    }

    for (const section of recipeSections) {
      let title = "Untitled Recipe";
      let ingredients = "";
      let instructions = "";
      let cost: number | null = null;

      const titleMatch =
        section.match(/\*\*Title:\*\*\s*(.+)/i) ||
        section.match(/\*\*(.+?)\*\*/i) ||
        section.match(/^#\s*(.+)/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }

      const ingredientsMatch = section.match(
        /\*\*Ingredients:\*\*\s*([\s\S]+?)(?:\*\*Instructions:\*\*|\*\*Total|\n\n|$)/i
      );
      if (ingredientsMatch) {
        ingredients = ingredientsMatch[1].trim();
      } else if (section.includes("Ingredients:")) {
        const ingredientsIndex = section.indexOf("Ingredients:");
        const endIndex =
          section.indexOf("Instructions:", ingredientsIndex) || section.length;
        ingredients = section
          .substring(ingredientsIndex + "Ingredients:".length, endIndex)
          .trim();
      }

      const instructionsMatch = section.match(
        /\*\*Instructions:\*\*\s*([\s\S]+?)(?:\*\*Total|\n\n|$)/i
      );
      if (instructionsMatch) {
        instructions = instructionsMatch[1].trim();
      } else if (section.includes("Instructions:")) {
        const instructionsIndex = section.indexOf("Instructions:");
        instructions = section
          .substring(instructionsIndex + "Instructions:".length)
          .trim();
      }

      const costMatch = section.match(
        /\*\*Total Estimated Price:\*\*\s*₱([\d,\.]+)/i
      );
      if (costMatch) {
        cost = parseFloat(costMatch[1].replace(/,/g, ""));
      }

      if (
        (ingredients || instructions) &&
        !section.includes("Here are") &&
        !section.includes("I found")
      ) {
        recipes.push({
          title: title || "Untitled Recipe",
          ingredients: ingredients || "No ingredients listed",
          instructions: instructions || "No instructions provided",
          cost,
        });
      }
    }

    return recipes;
  }

  // Inside handleSaveRecipe function
  const handleSaveRecipe = async (recipeMsg: Message) => {
    const recipes = parseRecipes(recipeMsg.text);
    
    if (recipes.length === 0) {
      Alert.alert("Error", "No valid recipe found to save");
      return;
    }
  
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const errorMessages: string[] = [];
  
    try {
      // For single recipe
      if (recipes.length === 1) {
        const { title, ingredients, instructions, cost } = recipes[0];
        try {
          const result = await saveRecipe({ title, ingredients, instructions, cost });
          if (result) successCount++;
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("already exists")) {
            duplicateCount++;
          } else {
            errorCount++;
            errorMessages.push(error instanceof Error ? error.message : "Unknown error");
          }
        }
      } 
      // For multiple recipes
      else {
        const savePromises = recipes.map(async (recipe) => {
          const { title, ingredients, instructions, cost } = recipe;
          try {
            await saveRecipe({ title, ingredients, instructions, cost });
            successCount++;
          } catch (error: unknown) {
            if (error instanceof Error && error.message.includes("already exists")) {
              duplicateCount++;
            } else {
              errorCount++;
              errorMessages.push(error instanceof Error ? error.message : "Unknown error");
            }
          }
        });
  
        await Promise.all(savePromises);
      }
  
      // Show consolidated alert
      const messageParts = [];
      if (successCount > 0) messageParts.push(`Saved ${successCount} new recipes`);
      if (duplicateCount > 0) messageParts.push(`${duplicateCount} duplicates skipped`);
      if (errorCount > 0) messageParts.push(`${errorCount} errors occurred`);
  
      if (messageParts.length > 0) {
        let alertMessage = messageParts.join("\n");
        
        if (errorMessages.length > 0) {
          alertMessage += `\n\nErrors:\n${errorMessages.slice(0, 3).join("\n")}`;
          if (errorMessages.length > 3) alertMessage += `\n...and ${errorMessages.length - 3} more`;
        }
  
        Alert.alert("Save Complete", alertMessage);
      }
  
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to save recipes: ${errorMessage}`);
    }
  };

  const pickImage = async (source: "gallery" | "camera") => {
    if (isAIResponding) return;

    if (source === "gallery") {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0].uri) {
          setPhotoPreview(result.assets[0].uri);
        }
      } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to pick image from gallery");
      }
    } else {
      if (Platform.OS === "web") {
        Alert.alert("Not supported", "Camera is not supported on web");
        return;
      }

      try {
        if (!cameraPermission) {
          console.log("Camera permission not initialized");
          return;
        }

        if (!cameraPermission.granted) {
          const { granted } = await requestPermission();
          if (!granted) {
            Alert.alert(
              "Permission required",
              "Camera access is needed to take photos"
            );
            return;
          }
        }

        setCameraType("back");
        setZoom(0);
        setFlashMode(false);
        setShowCamera(true);
      } catch (error) {
        console.error("Camera permission error:", error);
        Alert.alert("Error", "Failed to access camera");
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "front" ? "back" : "front"));
    setFlashMode(false);
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    setIsTakingPhoto(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        skipProcessing: true,
        exif: false,
      });

      if (photo?.uri) {
        setPhotoPreview(photo.uri);
        setShowCamera(false);
      } else {
        throw new Error("Photo capture returned no data");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setShowCamera(true);
  };

  const removePhotoPreview = () => {
    setPhotoPreview(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  if (showCamera) {
    if (!cameraPermission) {
      return <View />;
    }

    if (!cameraPermission.granted) {
      return (
        <View style={styles.cameraPermissionContainer}>
          <Text style={styles.permissionText}>
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            onPress={async () => {
              const { granted } = await requestPermission();
              if (granted) {
                setShowCamera(true);
              }
            }}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCamera(false)}
            style={[
              styles.permissionButton,
              { marginTop: 10, backgroundColor: "#ccc" },
            ]}
          >
            <Text style={styles.permissionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={cameraType}
          ref={cameraRef}
          enableTorch={flashMode}
          zoom={zoom}
          onCameraReady={() => console.log("Camera ready")}
          onMountError={(error) => {
            console.error("Camera mount error:", error);
            Alert.alert("Error", "Failed to load camera");
            setShowCamera(false);
          }}
        >
          <View style={styles.cameraControlsContainer}>
            <View style={styles.cameraTopControls}>
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={() => setShowCamera(false)}
              >
                <Icon name="close" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={toggleFlash}
              >
                <Icon
                  name={flashMode ? "flash-on" : "flash-off"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraBottomControls}>
              <View style={styles.cameraMainButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cameraMainButton,
                    isTakingPhoto && styles.disabledButton,
                  ]}
                  onPress={handleTakePhoto}
                  disabled={isTakingPhoto}
                >
                  <View style={styles.cameraMainButtonInner} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={toggleCameraType}
                disabled={isTakingPhoto}
              >
                <Icon name="flip-camera-android" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
            style={styles.logo}
          />
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Icon name="delete" size={24} color="#FE7F2D" />
          </TouchableOpacity>
        </View>
  
        {/* Chat area - takes all available space */}
        <View style={styles.chatArea}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContent}
            contentContainerStyle={styles.chatContentContainer}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  msg.isUser
                    ? styles.userMessageContainer
                    : styles.aiMessageContainer,
                  { marginBottom: 16 },
                ]}
              >
                <View
                  style={msg.isUser ? styles.userMessage : styles.aiMessage}
                >
                  {msg.image && (
                    <Image
                      source={{ uri: msg.image }}
                      style={styles.messageImage}
                      resizeMode="cover"
                      onError={(e) =>
                        console.log("Image load error:", e.nativeEvent.error)
                      }
                    />
                  )}
                  {msg.text === "###THINKING_ANIMATION###" ? (
                    <View style={styles.thinkingMessageContainer}>
                      <ThinkingDots />
                    </View>
                  ) : msg.text ? (
                    <Text style={[styles.messageText, styles.defaultFont]}>
                      <FormattedText text={msg.text} />
                    </Text>
                  ) : null}
  
                  {!(
                    !msg.isUser &&
                    !isAIResponding &&
                    msg.text &&
                    msg.text.toLowerCase().includes("ingredients") &&
                    msg.text.toLowerCase().includes("instructions")
                  ) && (
                    <Text style={[styles.messageTime, styles.defaultFont]}>
                      {msg.time}
                    </Text>
                  )}
  
                  {!msg.isUser &&
                    !isAIResponding &&
                    msg.text &&
                    msg.text.toLowerCase().includes("ingredients") &&
                    msg.text.toLowerCase().includes("instructions") && (
                      <View style={styles.recipeActionBar}>
                        <View style={styles.recipeActionBarLeft}>
                          <TouchableOpacity
                            style={styles.saveRecipeInlineButton}
                            onPress={() => handleSaveRecipe(msg)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons
                              name="bookmark-outline"
                              size={16}
                              color="#fff"
                            />
                            <Text style={styles.saveRecipeInlineButtonText}>
                              Save Recipe
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.recipeTimeStamp}>{msg.time}</Text>
                      </View>
                    )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
  
        {/* Photo preview (positioned absolutely above input) */}
        {photoPreview && (
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: photoPreview }}
              style={styles.photoPreviewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={removePhotoPreview}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
  
        {/* Input container - fixed height */}
        <View style={[
          styles.inputContainer, 
          { marginBottom: keyboardVisible ? 0 : 70 }
        ]}>
          <View style={styles.inputSection}>
            <View style={styles.chatboxContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.defaultFont,
                  { height: Math.max(16, inputHeight) },
                  isAIResponding && styles.disabledInput,
                ]}
                placeholder={
                  isAIResponding
                    ? "BiteAI is responding..."
                    : "Type your message..."
                }
                placeholderTextColor="#999"
                multiline
                value={message}
                onChangeText={setMessage}
                onContentSizeChange={(event) => {
                  const height = event.nativeEvent.contentSize.height;
                  const newHeight = Math.max(16, Math.ceil(height));
                  setInputHeight(newHeight);
                }}
                onSubmitEditing={handleSend}
                editable={!isAIResponding}
              />
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={[
                    styles.mediaButton,
                    isAIResponding && styles.disabledButton,
                  ]}
                  onPress={() => pickImage("camera")}
                  disabled={isAIResponding}
                >
                  <FontAwesomeIcon
                    name="camera"
                    size={16}
                    color={isAIResponding ? "#ccc" : "#FE7F2D"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.mediaButton,
                    isAIResponding && styles.disabledButton,
                  ]}
                  onPress={() => pickImage("gallery")}
                  disabled={isAIResponding}
                >
                  <FontAwesomeIcon
                    name="image"
                    size={16}
                    color={isAIResponding ? "#ccc" : "#FE7F2D"}
                  />
                </TouchableOpacity>
              </View>
            </View>
  
            <TouchableOpacity
              style={[
                styles.sendButton,
                isAIResponding && styles.disabledButton,
              ]}
              onPress={handleSend}
              disabled={isAIResponding}
            >
              <Icon
                name="send"
                size={16}
                color={isAIResponding ? "#ccc" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Navigation - only when keyboard is hidden */}
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
                <View style={styles.glowContainer}>
                  <FontAwesome6Icon
                    name="brain"
                    size={24}
                    color="#FE7F2D"
                    style={styles.glowIcon}
                  />
                </View>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00272B",
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },
  clearButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    marginTop: 10,
    marginBottom: 5,
  },
  chatContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContentContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  aiMessageContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  userMessageContainer: {
    alignItems: "flex-end",
    width: "100%",
  },
  aiMessage: {
    backgroundColor: "rgba(254, 127, 45, 0.1)",
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "rgba(254, 127, 45, 0.3)",
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: "80%",
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  messageTime: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  thinkingMessageContainer: {
    height: 13,
    justifyContent: "center",
  },
  inputWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingBottom: 8,
    height: "auto",
    minHeight: 60,
    justifyContent: "center",
    zIndex: 5,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: "auto",
    minHeight: 48,
    backgroundColor: "transparent",
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    height: "auto",
  },
  chatboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 40,
    height: "auto",
    backgroundColor: "#FBFCF8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    minHeight: 16,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
  },
  disabledInput: {
    backgroundColor: "transparent",
  },
  mediaButtons: {
    flexDirection: "row",
    marginLeft: 8,
    alignSelf: "center",
  },
  mediaButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FE7F2D",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
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
    fontFamily: "IstokWeb-Regular",
  },
  glowContainer: {
    position: "relative",
  },
  glowIcon: {
    textShadowColor: "#E0FF4F",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  cameraControlsContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  cameraTopControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  cameraBottomControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  cameraMainButtonContainer: {
    flex: 1,
    paddingLeft: 80,
    alignItems: "center",
  },
  cameraControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  cameraMainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cameraMainButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#00272B",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  permissionButton: {
    backgroundColor: "#FE7F2D",
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  photoPreviewContainer: {
    position: "absolute",
    bottom: 120,
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPreviewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
  },
  lineContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  lineText: {
    flexShrink: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  thinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 13,
    paddingHorizontal: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FE7F2D",
    marginHorizontal: 2,
  },
  saveRecipeInlineButton: {
    backgroundColor: "#FE7F2D",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveRecipeInlineButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "IstokWeb-Regular",
    fontWeight: "600",
    marginLeft: 4,
  },
  recipeActionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  recipeActionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTimeStamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "IstokWeb-Regular",
  },
});

export default ChatScreen;
