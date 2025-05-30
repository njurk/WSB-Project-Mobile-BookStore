import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login, register, UserResponse } from "../api/api-functions";

const AuthPage: React.FC = () => {
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIdentifier("");
    setEmail("");
    setUsername("");
    setPassword("");
  }, [isLogin]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/bookstore-logo.png")}
            accessibilityLabel="Logo"
            style={styles.logo}
          />
          <Text style={[styles.logoText, { color: colors.text }]}>BookStore</Text>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: "white" }]}>
          <TouchableOpacity
            onPress={() => setIsLogin(true)}
            style={[styles.toggleButton, isLogin && { backgroundColor: colors.card }]}
          >
            <Text style={[styles.toggleText, isLogin && { color: "white" }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(false)}
            style={[styles.toggleButton, !isLogin && { backgroundColor: colors.card }]}
          >
            <Text style={[styles.toggleText, !isLogin && { color: "white" }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldsContainer}>
          {isLogin ? (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Login</Text>
              <TextInput
                placeholder="Enter email or username"
                placeholderTextColor={colors.border}
                value={identifier}
                onChangeText={setIdentifier}
                style={[styles.input, { backgroundColor: "white", color: colors.background, borderColor: colors.border }]}
                autoCapitalize="none"
                keyboardType="default"
              />
            </View>
          ) : (
            <>
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor={colors.border}
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { backgroundColor: "white", color: colors.background, borderColor: colors.border }]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                <TextInput
                  placeholder="Enter username"
                  placeholderTextColor={colors.border}
                  value={username}
                  onChangeText={setUsername}
                  style={[styles.input, { backgroundColor: "white", color: colors.background, borderColor: colors.border }]}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor={colors.border}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: "white", color: colors.background, borderColor: colors.border }]}
            />
            {isLogin && (
              <TouchableOpacity>
                <Text style={[styles.forgotPasswordText, { color: "white" }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={submit} style={[styles.button, { backgroundColor: colors.card, borderColor: "white" }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {isLogin ? "Log in" : "Create account"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "85%",
    maxWidth: 420,
    padding: 18,
    borderRadius: 8,
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
  logoText: {
    fontSize: 30,
    fontWeight: "700",
    marginBlock: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
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
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fieldsContainer: {
    rowGap: 16,
  },
  fieldContainer: {
    rowGap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  button: {
    width: "100%",
    height: 55,
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 18,
  },
  forgotPasswordText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "right",
  },
};

export default AuthPage;
