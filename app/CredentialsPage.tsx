import React, { useEffect, useState } from "react";
import {Text,TextInput,StyleSheet,TouchableOpacity,Alert,ScrollView,KeyboardAvoidingView,Platform,Pressable} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { patchUserCredentials, UserPartialUpdateData } from "../api/api-functions";

export default function CredentialsPage() {
  const router = useRouter();

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
      Alert.alert("Error", "User not loaded.");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username cannot be empty.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email.");
      return;
    }
    if (password && password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters.");
      return;
    }

    const updateData: UserPartialUpdateData = {
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

        Alert.alert("Success", "Credentials updated successfully.");
        router.back();
    } catch (error) {
        console.error("Failed to update credentials", error);
        Alert.alert("Error", "Failed to update credentials. Please try again.");
    } finally {
        setLoading(false);
    }
    };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      {/* Back button */}
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="arrow-back" size={30} color="#000" />
      </Pressable>

      <Text style={styles.title}>Change Credentials</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Street</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
  },
  content: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 70,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#786EB9",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
