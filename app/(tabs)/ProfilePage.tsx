import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfilePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

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
      console.error("Failed to load user", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/AuthPage");
    } catch (e) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  const options: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: "person-outline", label: "Manage account", onPress: () => router.push("/CredentialsPage") },
    { icon: "receipt-outline", label: "My orders", onPress: () => router.push("/MyOrdersPage") },
    { icon: "star-outline", label: "My reviews", onPress: () => router.push(`/MyReviewsPage?userId=${userId}`) },
    { icon: "help-circle-outline", label: "Contact", onPress: () => router.push("/ContactPage") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        {userName && (
          <>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>Hello, {userName}!</Text>
              {userEmail && <Text style={[styles.emailText, { color: colors.text }]}>{userEmail}</Text>}
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={36} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 15 }}>log out</Text>
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
    marginBottom: 25,
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
