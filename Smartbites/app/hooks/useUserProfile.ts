import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  profilePicture: string | null;
  name: string;
  email: string;
  dietary_preference?: string; // optional, if not always set
  allergies?: string;          // stored as comma-separated string
  budget?: number;             // number type for budget amount
}

const useUserProfile = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    profilePicture: null,
    name: "Loading...",
    email: "Loading..."
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const response = await fetch("http://192.168.254.193:8000/api/current-user/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        setProfile({
          profilePicture: userData.profile_picture || null,   // Adjust if your API returns a URL or similar
          name: userData.full_name || "No name set",
          email: userData.email,
          dietary_preference: userData.dietary_preference,      // e.g. "vegan"
          allergies: userData.allergies,                        // e.g. "peanuts, shellfish"
          budget: userData.budget,                              // e.g. 100.00
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [refreshCount]);

  return { profile, loading, error, refresh };
};

export default useUserProfile;