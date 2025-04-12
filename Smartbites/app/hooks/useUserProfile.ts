import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  profilePicture: string | null;
  name: string;
  email: string;
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

        const response = await fetch("http://192.168.100.10:8000/api/current-user/", {
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
          profilePicture: null, // Add actual profile picture logic if needed
          name: userData.full_name || "No name set",
          email: userData.email
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [refreshCount]);

  return { profile, loading, error, refresh };
};

export default useUserProfile;