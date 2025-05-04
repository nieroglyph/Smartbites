// useUserRecipes.ts (corrected version)
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  saved_at: string;
  cost?: number;
}

export default function useUserRecipes() {
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      
      const res = await fetch(
        "http://192.168.1.7:8000/api/get-user-recipes/",
        { headers: { Authorization: `Token ${token}` } }
      );
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: Recipe[] = await res.json();
      setLocalRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Consider keeping previous recipes on error
      // setLocalRecipes(prev => prev.length ? prev : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes: localRecipes,
    loading,
    error,
    refresh: fetchRecipes,
    setRecipes: setLocalRecipes, // For optimistic updates
  };
}