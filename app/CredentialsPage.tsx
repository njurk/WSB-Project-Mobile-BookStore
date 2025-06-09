import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from '@react-navigation/native';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteUser, patchUserCredentials, UserPatchData } from "../api/api-functions";

export default function CredentialsPage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.userId);
          setUsername(user.username || "");
          setEmail(user.email || "");
          setStreet(user.street || "");
          setCity(user.city || "");
          setPostalCode(user.postalCode || "");
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUserData();
  }, []);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User not loaded");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Enter a valid email");
      return;
    }
    if (password && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const updateData: UserPatchData = {
      username: username.trim(),
      email: email.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    };

    setLoading(true);
    try {
      await patchUserCredentials(userId, updateData);

      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        const updatedUser = {
          ...user,
          ...updateData,
        };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }

      Alert.alert("Success", "Credentials updated successfully");
      router.back();
    } catch (error) {
      console.error("Failed to update credentials", error);
      Alert.alert("Error", "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            (async () => {
              if (userId === null) {
                Alert.alert("Error", "User ID not found");
                return;
              }
              try {
                await deleteUser(userId);
                await AsyncStorage.removeItem("user");
                Alert.alert("Account Deleted", "Your account has been deleted");
                router.replace("/AuthPage");
              } catch (error) {
                Alert.alert("Error", "Failed to delete account");
              }
            })();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="arrow-back" size={30} color={colors.text} />
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>Manage account</Text>

      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: colors.notification }]}
        activeOpacity={0.8}
        onPress={handleDeleteAccount}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="trash-outline" size={22} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.deleteButtonText, { color: colors.text }]}>Delete account</Text>
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Username"
          placeholderTextColor={colors.text + "99"}
        />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email"
          placeholderTextColor={colors.text + "99"}
        />

        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Password"
          placeholderTextColor={colors.text + "99"}
        />

        <Text style={[styles.label, { color: colors.text }]}>Street</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={street}
          onChangeText={setStreet}
          placeholder="Street"
          placeholderTextColor={colors.text + "99"}
        />

        <Text style={[styles.label, { color: colors.text }]}>City</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor={colors.text + "99"}
        />

        <Text style={[styles.label, { color: colors.text }]}>Postal code</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
          placeholder="Postal Code"
          placeholderTextColor={colors.text + "99"}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card }, loading && { opacity: 0.7, backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>{loading ? "Saving..." : "Save changes"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 8,
    textAlign: "center",
  },
  deleteButton: {
    width: "40%",
    alignSelf: "flex-end",
    marginHorizontal: 16,
    marginBlock: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 20,
  },
});
