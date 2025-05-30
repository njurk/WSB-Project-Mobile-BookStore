import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deleteUser } from "../../api/api-functions";

export default function ProfilePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.username || null);
          setUserEmail(user.email || null);
          setUserId(user.userId);
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/AuthPage");
    } catch (e) {
      Alert.alert("Error", "Failed to log out.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (userId === null) {
              Alert.alert("Error", "User ID not found.");
              return;
            }
            try {
              await deleteUser(userId);
              await AsyncStorage.removeItem("user");
              Alert.alert("Account Deleted", "Your account has been deleted.");
              router.replace("/AuthPage");
            } catch (error) {
              console.error("Failed to delete account:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const options: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: "person-outline", label: "Change Credentials", onPress: () => router.push("/CredentialsPage") },
    { icon: "receipt-outline", label: "My Orders", onPress: () => {}},
    { icon: "star-outline", label: "My Reviews", onPress: () => router.push(`/MyReviewsPage?userId=${userId}`)  },
    { icon: "help-circle-outline", label: "Help / Contact Us", onPress: () => {} },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        {userName && (
          <>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Hello, {userName}!
              </Text>
              {userEmail && (
                <Text style={[styles.emailText, { color: colors.text }]}>
                  {userEmail}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={36} color={colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={option.onPress}
          >
            <Ionicons name={option.icon} size={24} color={colors.text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: "#5e241e" }]}
        activeOpacity={0.8}
        onPress={handleDeleteAccount}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 34,
    fontWeight: "700",
  },
  emailText: {
    fontSize: 18,
    marginTop: 4,
  },
  logoutButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 12,
    elevation: 2,
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
  deleteButton: {
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
