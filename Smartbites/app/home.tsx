import React from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUserRecipes, { Recipe } from './hooks/useUserRecipes';
import { useState } from 'react';

const HomeScreen = () => {
  const router = useRouter();
  const { recipes, loading, error, refresh } = useUserRecipes();
  const [fontsLoaded] = useFonts({
    'IstokWeb-Regular': require('../assets/fonts/IstokWeb-Regular.ttf'),
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo/smartbites-high-resolution-logo-transparent.png')}
        style={styles.logo}
      />

      {/* Saved Recipes */}
      <View style={styles.foodContainer}>
        <View style={styles.recentFoodsTitle}>
          <Icon name="restaurant-menu" size={24} color="#FE7F2D" />
          <Text style={[styles.recentFoodsText, styles.customFont]}>
            Your Saved Recipes
          </Text>
          <TouchableOpacity onPress={refresh} style={{ marginLeft: 8 }}>
            <Icon name="refresh" size={20} color="#FE7F2D" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FE7F2D" style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : recipes.length === 0 ? (
          <Text style={styles.emptyText}>No recipes saved yet.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {recipes.map((r: Recipe) => {
              const isExpanded = expandedId === r.id;
              // Safely parse cost (could be string or number or undefined)
              const costNum = typeof r.cost === 'number'
                ? r.cost
                : parseFloat(r.cost as any) || 0;

              return (
                <TouchableOpacity
                key={r.id}
                activeOpacity={0.8}
                onPress={() => {
                  // toggle expanded/collapse
                  setExpandedId(isExpanded ? null : r.id);
                }}
                style={[
                  styles.foodItem,
                  isExpanded && styles.foodItemExpanded,   // optional highlight
                ]}
              >
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
                    {r.ingredients.split('\n')[0]}…
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

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <View style={styles.glowContainer}>
              <FontAwesomeIcon name="home" size={24} color="#FE7F2D" style={styles.glowIcon} />
            </View>
            <Text style={[styles.navText, styles.customFont]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/chat')}>
            <FontAwesome6Icon name="brain" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/budget')}>
            <FontAwesome6Icon name="money-bills" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="account-settings" size={24} color="#FE7F2D" />
            <Text style={[styles.navText, styles.customFont]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00272B', paddingTop: 20 },
  logo: { width: 120, height: 50, resizeMode: 'contain', marginLeft: 20, marginBottom: 10 },
  foodContainer: {
    flex: 1,
    marginBottom: 75,
    marginHorizontal: 10,
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    padding: 10,
  },
  recentFoodsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentFoodsText: { fontSize: 16, color: '#2E2E2E' },
  scrollContent: { paddingTop: 10 },
  foodItem: {
    backgroundColor: '#FBFCF8',
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  foodItemExpanded: {
    backgroundColor: '#FFF8E1',       // subtle highlight
  },
  recipeTitle: { fontSize: 18, marginBottom: 4, color: '#2E2E2E' },
  recipeMeta: { fontSize: 12, color: '#555', marginBottom: 8 },
  recipeSnippet: { fontSize: 14, color: '#333', marginTop: 8 },
  expandedDetails: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 12,
  },
  errorText: { color: 'red', marginTop: 20 },
  emptyText: { color: '#fff', marginTop: 20 },
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
  navigation: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 5, color: '#2E2E2E' },
  customFont: { fontFamily: 'IstokWeb-Regular' },
  glowContainer: { position: 'relative' },
  glowIcon: {
    textShadowColor: '#E0FF4F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    elevation: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2E2E2E',
  },
  detailsText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  }
});

export default HomeScreen;