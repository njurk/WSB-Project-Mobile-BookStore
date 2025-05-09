import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { deleteUser } from "../../api/api-functions";

export default function ProfilePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.username || user.email || "User");
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
    { icon: "receipt-outline", label: "My Orders", onPress: () => {} },
    { icon: "star-outline", label: "My Reviews", onPress: () => {} },
    { icon: "trash-outline", label: "Delete Account", onPress: handleDeleteAccount },
    { icon: "help-circle-outline", label: "Help / Contact Us", onPress: () => {} },
    { icon: "log-out-outline", label: "Log Out", onPress: handleLogout },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        {userName && (
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hello, {userName}!
          </Text>
        )}
        <Text style={[styles.header, { color: colors.text }]}>My Account</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            activeOpacity={0.7}
            onPress={option.onPress}
          >
            <Ionicons name={option.icon} size={24} color={colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.primary }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: "#F9FAFB",
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
});
