import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  RefreshControl,
  Animated,
  Easing,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserRecipes, { Recipe } from "./hooks/useUserRecipes";
import { toastConfig } from "./hooks/toastConfig";

const HomeScreen = () => {
  const router = useRouter();
  const { recipes, loading, error, refresh, setRecipes } = useUserRecipes();
  const [fontsLoaded] = useFonts({
    "IstokWeb-Regular": require("../assets/fonts/IstokWeb-Regular.ttf"),
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedIngredients, setEditedIngredients] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedCost, setEditedCost] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<number[]>([]);
  const [deletedRecipes, setDeletedRecipes] = useState<Recipe[]>([]);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const deletionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [undoQueue, setUndoQueue] = useState<
    Array<{
      id: string;
      ids: number[];
      recipes: Recipe[];
      timeout: NodeJS.Timeout;
    }>
  >([]);

  // Keyboard visibility effect
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animation effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (recipes.length === 0 && !loading) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideUpAnim.setValue(20);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideUpAnim.setValue(20);
    }
  }, [recipes, loading]);

  useEffect(() => {
    if (editingRecipe) {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalSlideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [editingRecipe]);

  const handleLongPress = (recipeId: number) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const toggleMenu = (recipeId: number) => {
    setMenuVisibleId(menuVisibleId === recipeId ? null : recipeId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateRecipe = async () => {
    if (!editingRecipe) return;

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Not authenticated");
      return;
    }

    try {
      const res = await fetch(
        `http://192.168.100.10:8000/api/update-recipe/${editingRecipe.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editedTitle,
            ingredients: editedIngredients,
            instructions: editedInstructions,
            cost: parseFloat(editedCost) || undefined,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      Toast.show({
        type: "success",
        text1: "Updated!",
        text2: "Recipe updated successfully",
      });
      refresh();
      setEditingRecipe(null);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.message || "Network request failed",
      });
    }
  };

  const handleDelete = (ids: number[]) => {
    const deletionId = Date.now().toString();
    const deletedItems = recipes.filter((r) => ids.includes(r.id));
    setDeletedRecipeIds(ids);
    setDeletedRecipes(deletedItems);
    setShowUndo(true);
    setRecipes((prev) => prev.filter((r) => !ids.includes(r.id)));
    setMenuVisibleId(null);

    deletionTimeout.current = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("Not authenticated");

        if (ids.length === 1) {
          await fetch(
            `http://192.168.100.10:8000/api/delete-recipe/${ids[0]}/`,
            {
              method: "DELETE",
              headers: { Authorization: `Token ${token}` },
            }
          );
        } else {
          await fetch(
            "http://192.168.100.10:8000/api/delete-multiple-recipes/",
            {
              method: "POST",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ recipe_ids: ids }),
            }
          );
        }
        setUndoQueue((prev) => prev.filter((item) => item.id !== deletionId));

        await refresh();
        Toast.show({
          type: "success",
          text1: ids.length === 1 ? "Recipe deleted" : "Recipes deleted",
          text2: `Successfully deleted ${ids.length} items`,
        });
      } catch (error) {
        console.error("Delete failed:", error);
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2: "Could not delete recipes",
        });
      }
      setShowUndo(false);
      setDeletedRecipeIds([]);
    }, 3000);

    setUndoQueue(prev => [
      // New messages appear on top
      {
        id: deletionId,
        ids,
        recipes: deletedItems,
        timeout: deletionTimeout.current!
      },
      ...prev
    ]);
  
    setRecipes(prev => prev.filter(r => !ids.includes(r.id)));
  };

  useEffect(() => {
    return () => {
      if (deletionTimeout.current) {
        clearTimeout(deletionTimeout.current);
      }
    };
  }, []);

  const deleteRecipe = (id: number) => {
    handleDelete([id]);
  };

  const deleteSelectedRecipes = () => {
    if (selectedRecipes.length === 0) return;
    handleDelete(selectedRecipes);
    setSelectedRecipes([]);
  };

  const handleUndo = (deletionId: string) => {
    setUndoQueue((prev) => {
      const item = prev.find((i) => i.id === deletionId);
      if (item) {
        clearTimeout(item.timeout);
        setRecipes((prevRecipes) => [...prevRecipes, ...item.recipes]);
      }
      return prev.filter((i) => i.id !== deletionId);
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      <View
        style={[
          styles.foodContainer,
          { paddingTop: recipes.length > 0 ? 10 : 0 },
        ]}
      >
        {recipes.length > 0 && (
          <View style={styles.recentFoodsTitle}>
            <Icon name="restaurant-menu" size={24} color="#FE7F2D" />
            <Text style={[styles.recentFoodsText, styles.customFont]}>
              Your Saved Recipes
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FE7F2D"
            style={{ marginTop: 20 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : recipes.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#FFF", "#F9F9F9"]}
              style={styles.emptyCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.emptyIconContainer}>
                <Icon
                  name="menu-book"
                  size={60}
                  color="#FE7F2D"
                  style={styles.emptyIcon}
                />
              </View>
              <Text style={styles.emptyTitle}>Your Cookbook is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Save your favorite recipes to build your personal cookbook
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/chat")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FE7F2D", "#FF9F4D"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.buttonContent}>
                    <Icon
                      name="search"
                      size={16}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.emptyButtonText}>Discover Recipes</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.emptyTipContainer}>
              <View style={styles.tipContent}>
                <Icon
                  name="lightbulb"
                  size={14}
                  color="#FE7F2D"
                  style={styles.tipIcon}
                />
                <Text style={styles.emptyTipText}>
                  Tip: Our BiteAI can suggest recipes based on your preferences
                </Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#FE7F2D"]}
                tintColor="#FE7F2D"
              />
            }
          >
            {recipes.map((r: Recipe) => {
              const isExpanded = expandedId === r.id;
              const costNum =
                typeof r.cost === "number"
                  ? r.cost
                  : parseFloat(r.cost as any) || 0;

              return (
                <View
                  key={r.id}
                  style={[
                    styles.foodItemContainer,
                    isExpanded && styles.foodItemExpanded,
                    selectedRecipes.includes(r.id) && styles.selectedItem,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (selectedRecipes.length > 0) {
                        setSelectedRecipes((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((id) => id !== r.id)
                            : [...prev, r.id]
                        );
                      } else {
                        setExpandedId(isExpanded ? null : r.id);
                      }
                    }}
                    onLongPress={() => handleLongPress(r.id)}
                    style={styles.foodItemTouchable}
                  >
                    {selectedRecipes.includes(r.id) && (
                      <View style={styles.selectionIndicator}>
                        <Icon name="check" size={20} color="white" />
                      </View>
                    )}

                    <View style={styles.recipeContent}>
                      <Text
                        style={[styles.recipeTitle, styles.customFont]}
                        numberOfLines={isExpanded ? 0 : 1}
                        ellipsizeMode="tail"
                      >
                        {r.title}
                      </Text>
                      <Text style={styles.recipeMeta}>
                        Saved {new Date(r.saved_at).toLocaleDateString()}
                        {r.cost != null && <> • ₱{costNum.toFixed(2)}</>}
                      </Text>
                      {!isExpanded && (
                        <Text
                          style={styles.recipeSnippet}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {r.ingredients.split("\n")[0]}…
                        </Text>
                      )}
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedDetails}>
                        <Text style={styles.sectionHeader}>Ingredients:</Text>
                        <Text style={styles.detailsText}>{r.ingredients}</Text>
                        <Text style={styles.sectionHeader}>Instructions:</Text>
                        <Text style={styles.detailsText}>{r.instructions}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleMenu(r.id);
                    }}
                  >
                    <Icon name="more-vert" size={24} color="#555" />
                  </TouchableOpacity>

                  {menuVisibleId === r.id && (
                    <View style={styles.menuDropdown}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditedTitle(r.title);
                          setEditedIngredients(r.ingredients);
                          setEditedInstructions(r.instructions);
                          setEditedCost(r.cost?.toString() || "");
                          setEditingRecipe(r);
                          setMenuVisibleId(null);
                        }}
                      >
                        <Icon
                          name="edit"
                          size={18}
                          color="#3498DB"
                          style={styles.menuIcon}
                        />
                        <Text style={styles.menuText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteRecipe(r.id);
                        }}
                      >
                        <Icon
                          name="delete"
                          size={18}
                          color="#E74C3C"
                          style={styles.menuIcon}
                        />
                        <Text style={styles.menuText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={!!editingRecipe}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditingRecipe(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={() => setEditingRecipe(null)}>
            <BlurView style={styles.blurView} intensity={20} tint="dark">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={[
                    styles.animatedModalView,
                    {
                      transform: [
                        { scale: modalScaleAnim },
                        { translateY: modalSlideAnim },
                      ],
                      opacity: modalOpacityAnim,
                    },
                  ]}
                >
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Recipe</Text>

                    <Text style={styles.inputLabel}>Recipe Title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedTitle}
                      onChangeText={setEditedTitle}
                      placeholder="Enter recipe title..."
                      placeholderTextColor="#7F8C8D"
                    />

                    <Text style={styles.inputLabel}>Ingredients</Text>
                    <TextInput
                      style={[styles.textInput, styles.messageInput]}
                      multiline
                      value={editedIngredients}
                      onChangeText={setEditedIngredients}
                      placeholder="Enter ingredients (one per line)..."
                      placeholderTextColor="#7F8C8D"
                    />

                    <Text style={styles.inputLabel}>Instructions</Text>
                    <TextInput
                      style={[styles.textInput, styles.messageInput]}
                      multiline
                      value={editedInstructions}
                      onChangeText={setEditedInstructions}
                      placeholder="Enter instructions..."
                      placeholderTextColor="#7F8C8D"
                    />

                    <Text style={styles.inputLabel}>Cost (optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedCost}
                      onChangeText={setEditedCost}
                      placeholder="Enter estimated cost..."
                      placeholderTextColor="#7F8C8D"
                      keyboardType="numeric"
                    />

                    <View style={styles.modalButtonContainer}>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonClose]}
                        onPress={() => setEditingRecipe(null)}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonSubmit]}
                        onPress={updateRecipe}
                      >
                        <Text style={styles.modalButtonText}>Save Changes</Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </BlurView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {showUndo && (
        <View style={styles.undoToastContainer}>
          {undoQueue.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.undoToast,
                {
                  bottom: 20 + index * 70, // Stack toasts vertically
                  zIndex: 1000 - index, // Ensure newer toasts stay on top
                },
              ]}
            >
              <Text style={styles.undoText}>
                {item.ids.length} recipe{item.ids.length > 1 ? "s" : ""} deleted
              </Text>
              <TouchableOpacity onPress={() => handleUndo(item.id)}>
                <Text style={styles.undoButton}>UNDO</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {selectedRecipes.length > 0 && (
        <View style={styles.floatingActionContainer}>
          <View style={styles.floatingActions}>
            <TouchableOpacity
              style={[styles.floatingActionButton, styles.floatingDelete]}
              onPress={deleteSelectedRecipes}
            >
              <Text style={styles.floatingButtonText}>
                Delete ({selectedRecipes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingActionButton, styles.floatingClose]}
              onPress={() => setSelectedRecipes([])}
            >
              <Icon name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!keyboardVisible && (
        <View style={styles.navContainer}>
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/home")}
            >
              <View style={styles.glowContainer}>
                <FontAwesomeIcon
                  name="home"
                  size={24}
                  color="#FE7F2D"
                  style={styles.glowIcon}
                />
              </View>
              <Text style={[styles.navText, styles.customFont]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/chat")}
            >
              <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" />
              <Text style={[styles.navText, styles.customFont]}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/budget")}
            >
              <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
              <Text style={[styles.navText, styles.customFont]}>Budget</Text>
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
              <Text style={[styles.navText, styles.customFont]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Toast config={toastConfig} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#00272B", paddingTop: 20 },
  logo: {
    width: 120,
    height: 50,
    resizeMode: "contain",
    marginLeft: 20,
    marginBottom: 10,
  },
  foodContainer: {
    flex: 1,
    marginBottom: 75,
    marginHorizontal: 10,
    backgroundColor: "#D9D9D9",
    borderRadius: 5,
    padding: 10,
  },
  recentFoodsTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  recentFoodsText: { fontSize: 16, color: "#2E2E2E" },
  scrollContent: {
    paddingTop: 10,
    minHeight: "100%",
  },
  foodItemContainer: {
    backgroundColor: "#FBFCF8",
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "visible",
    position: "relative",
  },
  foodItemTouchable: {
    padding: 12,
    paddingRight: 48,
  },
  foodItemExpanded: {
    backgroundColor: "#FFF8E1",
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: "#2E2E2E",
  },
  recipeMeta: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  recipeSnippet: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
  expandedDetails: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 12,
  },
  errorText: { color: "red", marginTop: 20, textAlign: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(254, 127, 45, 0.1)",
  },
  emptyIconContainer: {
    backgroundColor: "rgba(254, 127, 45, 0.1)",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "IstokWeb-Regular",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "IstokWeb-Regular",
    lineHeight: 24,
  },
  emptyButton: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "IstokWeb-Regular",
    fontWeight: "600",
  },
  emptyTipContainer: {
    marginTop: 25,
    padding: 12,
    backgroundColor: "rgba(254, 127, 45, 0.08)",
    borderRadius: 8,
  },
  emptyTipText: {
    fontSize: 12,
    color: "#FE7F2D",
    fontFamily: "IstokWeb-Regular",
    fontStyle: "italic",
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
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 5, color: "#2E2E2E" },
  customFont: { fontFamily: "IstokWeb-Regular" },
  glowContainer: { position: "relative" },
  glowIcon: {
    textShadowColor: "#E0FF4F",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    elevation: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2E2E2E",
  },
  detailsText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  selectedItem: {
    backgroundColor: "#FFECB3",
    borderColor: "#FE7F2D",
    borderWidth: 1,
  },
  selectionIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FE7F2D",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  undoToastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 60,
    zIndex: 9999,
  },
  undoToast: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  undoText: {
    color: "white",
    fontSize: 14,
  },
  undoButton: {
    color: "#FE7F2D",
    fontWeight: "bold",
    paddingHorizontal: 12,
  },
  floatingActionContainer: {
    position: "absolute",
    bottom: 100,
    right: 90,
    zIndex: 100,
    alignItems: "flex-end",
    gap: 10,
  },
  floatingActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  floatingActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingDelete: {
    backgroundColor: "#E74C3C",
  },
  floatingClose: {
    backgroundColor: "#FE7F2D",
    padding: 12,
    borderRadius: 25,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tipIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  menuButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 8,
    backgroundColor: "transparent",
  },
  menuDropdown: {
    position: "absolute",
    top: 36,
    right: 8,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 11,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
    color: "#333",
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  animatedModalView: {
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#002F38",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#2D2F2F",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#E0FF4F",
    textAlign: "center",
    fontFamily: "IstokWeb-Regular",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#FE7F2D",
    fontFamily: "IstokWeb-Regular",
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#2D2F2F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
    color: "#1D1F1F",
    fontFamily: "IstokWeb-Regular",
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    elevation: 0,
    minWidth: 100,
    alignItems: "center",
    flex: 1,
  },
  modalButtonClose: {
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#434545",
  },
  modalButtonSubmit: {
    backgroundColor: "#FE7F2D",
    marginLeft: 3,
  },
  modalButtonText: {
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "IstokWeb-Regular",
    color: "#FFFFFF",
  },
  modalKeyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default HomeScreen;
