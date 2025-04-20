import React from "react";
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
} from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useUserRecipes, { Recipe } from "./hooks/useUserRecipes";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRef } from "react";

const HomeScreen = () => {
  const router = useRouter();
  const { recipes, loading, error, refresh } = useUserRecipes();
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
  const [deletedRecipes, setDeletedRecipes] = useState<Recipe[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  let deletionTimeout = useRef<NodeJS.Timeout | null>(null);

  if (!fontsLoaded) return null;

  const handleLongPress = (recipeId: number) => {
    setSelectedRecipes((prev) => [...prev, recipeId]);
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

      Alert.alert("Updated!", "Recipe updated successfully.");
      refresh();
      setEditingRecipe(null);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network request failed");
    }
  };

  const deleteRecipe = async (id: number) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Not authenticated");
      return;
    }

    try {
      const res = await fetch(
        `http://192.168.100.10:8000/api/delete-recipe/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (res.status === 204) {
        Alert.alert("Deleted!", "Recipe removed successfully.");
        refresh();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network request failed");
    }
  };

  // Add bulk delete function
  const deleteSelectedRecipes = async () => {
    if (selectedRecipes.length === 0) return;
  
    const toDelete = recipes.filter((r) => selectedRecipes.includes(r.id));
    setDeletedRecipes(toDelete);
    setShowUndo(true);
  
    deletionTimeout.current = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("Not authenticated");
  
        const response = await fetch("http://192.168.100.10:8000/api/delete-multiple-recipes/", {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipe_ids: selectedRecipes }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await refresh(); // Refresh data after successful deletion

      } catch (error) {
        console.error("Delete failed:", error);
      }
      setShowUndo(false);
    }, 7000);
  
    setSelectedRecipes([]);
  };

  // Undo handler
  const handleUndo = () => {
    if (deletionTimeout.current) {
      clearTimeout(deletionTimeout.current);
    }
    setShowUndo(false);
    setDeletedRecipes([]);
    refresh(); // Force refresh to get latest data
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/images/logo/smartbites-high-resolution-logo-transparent.png")}
        style={styles.logo}
      />

      {/* Saved Recipes */}
      <View style={styles.foodContainer}>
        <View style={styles.recentFoodsTitle}>
          <Icon name="restaurant-menu" size={24} color="#FE7F2D" />
          <Text style={[styles.recentFoodsText, styles.customFont]}>
            Your Saved Recipes
          </Text>
          {selectedRecipes.length > 0 && (
            <TouchableOpacity onPress={() => setSelectedRecipes([])}>
              <Icon name="close" size={24} color="#FE7F2D" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FE7F2D"
            style={{ marginTop: 20 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : recipes.length === 0 ? (
          <Text style={styles.emptyText}>No recipes saved yet.</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#FE7F2D"]} // Match your theme color
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
                <TouchableOpacity
                  key={r.id}
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
                  style={[
                    styles.foodItem,
                    isExpanded && styles.foodItemExpanded,
                    selectedRecipes.includes(r.id) && styles.selectedItem,
                  ]}
                >
                  {selectedRecipes.includes(r.id) && (
                    <View style={styles.selectionIndicator}>
                      <Icon name="check" size={20} color="white" />
                    </View>
                  )}
                  {/* edit icon */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (r) {
                        setEditedTitle(r.title);
                        setEditedIngredients(r.ingredients);
                        setEditedInstructions(r.instructions);
                        setEditedCost(r.cost?.toString() || "");
                        setEditingRecipe(r);
                      }
                    }}
                  >
                    <Icon name="edit" size={20} color="#3498DB" />
                  </TouchableOpacity>
                  {/* delete icon */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert("Delete Recipe?", "Are you sure?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteRecipe(r.id),
                        },
                      ]);
                    }}
                  >
                    <Icon name="delete" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                  {/* Always visible header */}
                  <Text style={[styles.recipeTitle, styles.customFont]}>
                    {r.title}
                  </Text>
                  <Text style={styles.recipeMeta}>
                    Saved {new Date(r.saved_at).toLocaleDateString()}
                    {r.cost != null && <> • ₱{costNum.toFixed(2)}</>}
                  </Text>
                  {/* If collapsed, show snippet */}
                  {!isExpanded && (
                    <Text style={styles.recipeSnippet}>
                      {r.ingredients.split("\n")[0]}…
                    </Text>
                  )}
                  {/* If expanded, show full details */}
                  {isExpanded && (
                    <View style={styles.expandedDetails}>
                      <Text style={styles.sectionHeader}>Ingredients:</Text>
                      <Text style={styles.detailsText}>{r.ingredients}</Text>
                      <Text style={styles.sectionHeader}>Instructions:</Text>
                      <Text style={styles.detailsText}>{r.instructions}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={!!editingRecipe}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingRecipe(null)}
      >
        <TouchableWithoutFeedback onPress={() => setEditingRecipe(null)}>
          <BlurView intensity={50} style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Recipe</Text>

                <TextInput
                  style={styles.input}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Recipe Title"
                />

                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  value={editedIngredients}
                  onChangeText={setEditedIngredients}
                  placeholder="Ingredients (one per line)"
                />

                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  value={editedInstructions}
                  onChangeText={setEditedInstructions}
                  placeholder="Instructions"
                />

                <TextInput
                  style={styles.input}
                  value={editedCost}
                  onChangeText={setEditedCost}
                  placeholder="Cost (optional)"
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditingRecipe(null)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={updateRecipe}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Floating Delete Button */}
      {selectedRecipes.length > 0 && (
        <TouchableOpacity
          style={styles.floatingDeleteButton}
          onPress={deleteSelectedRecipes}
        >
          <Text style={styles.deleteButtonText}>
            Delete ({selectedRecipes.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Undo Toast */}
      {showUndo && (
        <View style={styles.undoToast}>
          <Text style={styles.undoText}>
            {deletedRecipes.length} recipes deleted
          </Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoButton}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
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
    minHeight: "100%", // Ensures ScrollView is always scrollable
  },
  foodItem: {
    backgroundColor: "#FBFCF8",
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  foodItemExpanded: {
    backgroundColor: "#FFF8E1",
  },
  recipeTitle: { fontSize: 18, marginBottom: 4, color: "#2E2E2E" },
  recipeMeta: { fontSize: 12, color: "#555", marginBottom: 8 },
  recipeSnippet: { fontSize: 14, color: "#333", marginTop: 8 },
  expandedDetails: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 12,
  },
  errorText: { color: "red", marginTop: 20 },
  emptyText: { color: "#fff", marginTop: 20 },
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
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FE7F2D",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: "#FE7F2D",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    right: 40,
    top: 10,
    zIndex: 1,
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
  floatingDeleteButton: {
    position: "absolute",
    bottom: 100,
    zIndex: 100,
    alignSelf: "center",
    backgroundColor: "#E74C3C",
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
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  undoToast: {
    position: "absolute",
    bottom: 20,
    zIndex: 100, 
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});

export default HomeScreen;
