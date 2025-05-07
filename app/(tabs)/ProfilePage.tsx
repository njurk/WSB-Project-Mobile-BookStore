import React from "react";
import { View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const options = [
  { icon: "person-outline", label: "Change Credentials", onPress: () => {} },
  { icon: "receipt-outline", label: "My Orders", onPress: () => {} },
  { icon: "star-outline", label: "My Reviews", onPress: () => {} },
  { icon: "trash-outline", label: "Delete Account", onPress: () => {} },
  { icon: "help-circle-outline", label: "Help / Contact Us", onPress: () => {} },
  { icon: "log-out-outline", label: "Log Out", onPress: () => {} },
];

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <Text style={[styles.header, { color: colors.text }]}>My Account</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            icon={option.icon}
            label={option.label}
            onPress={option.onPress}
          />
        ))}
      </View>
    </View>
  );
}

function OptionButton({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.optionButtonContainer, animatedStyle]}>
      <Pressable
        style={styles.optionButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons name={icon} size={24} color={colors.primary} style={styles.icon} />
        <Text style={[styles.optionText, { color: colors.primary }]}>{label}</Text>
      </Pressable>
    </Animated.View>
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
  header: {
    fontSize: 30,
    fontWeight: "bold",
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  optionButtonContainer: {
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#F9FAFB",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
