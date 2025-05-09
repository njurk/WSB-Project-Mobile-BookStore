import * as React from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, register, UserResponse } from "../api/api-functions";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
    if (isLogin) {
      if (!identifier.trim() || !password.trim()) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      try {
        const data: UserResponse = await login({
          Identifier: identifier.trim(),
          Password: password.trim(),
        });
        await AsyncStorage.setItem("user", JSON.stringify(data));
        setIdentifier("");
        setPassword("");
        router.replace("/(tabs)/HomePage");
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "Login failed");
      }
    } else {
      if (!email.trim() || !username.trim() || !password.trim()) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      try {
        const data: UserResponse = await register({
          Email: email.trim(),
          Username: username.trim(),
          Password: password.trim(),
        });
        await AsyncStorage.setItem("user", JSON.stringify(data));
        setEmail("");
        setUsername("");
        setPassword("");
        router.replace("/(tabs)/HomePage");
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "Registration failed");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/bookstore-logo.png")}
            accessibilityLabel="Logo"
            style={styles.logo}
          />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setIsLogin(true)}
            style={[styles.toggleButton, isLogin && styles.activeToggle]}
          >
            <Text style={styles.toggleText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(false)}
            style={[styles.toggleButton, !isLogin && styles.activeToggle]}
          >
            <Text style={styles.toggleText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldsContainer}>
          {isLogin ? (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email or Username</Text>
              <TextInput
                placeholder="Enter your email or username"
                value={identifier}
                onChangeText={setIdentifier}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="default"
              />
            </View>
          ) : (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            {isLogin && (
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>
            {isLogin ? "Login" : "Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#786EB9",
  },
  formContainer: {
    width: "85%",
    maxWidth: 420,
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    marginHorizontal: 16,
    elevation: 4,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    height: 90,
    width: 90,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    backgroundColor: "#F8F5FF",
    borderRadius: 8,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#fff",
    elevation: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fieldsContainer: {
    rowGap: 16,
  },
  fieldContainer: {
    rowGap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    width: "100%",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
  },
  button: {
    width: "100%",
    height: 48,
    marginTop: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#786EB9",
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  forgotPasswordText: {
    marginTop: 8,
    fontSize: 12,
    color: "#786EB9",
    textAlign: "right",
  },
});

export default AuthPage;
