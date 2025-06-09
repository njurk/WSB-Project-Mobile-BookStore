import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function ContactPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const address = "332 Book St, New York, 67001";
  const phone = "+1 (555) 123-4567";
  const email = "contact@bookstore.com";

  const [message, setMessage] = useState("");

  const openPhone = () => Linking.openURL(`tel:${phone}`);
  const openEmail = () => Linking.openURL(`mailto:${email}`);
  const openMapApp = () => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url);
  };
  const handleBack = () => router.back();
  const sendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Please enter a message");
      return;
    }
    Alert.alert("Success", "Message sent");
    setMessage("");
  };
  const region = {
    latitude: 37.77928,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name="arrow-back" size={30} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Contact</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.infoBox, { borderColor: colors.primary }]}>
          <TouchableOpacity onPress={openPhone} style={styles.contactRow}>
            <Ionicons name="call-outline" size={20} color={colors.text} style={styles.icon} />
            <Text style={[styles.linkText, { color: colors.primary }]}>{phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openEmail} style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.icon} />
            <Text style={[styles.linkText, { color: colors.primary }]}>{email}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.mapContainer, { borderColor: colors.primary }]}>
          <View style={styles.labelRow}>
            <Ionicons name="location-outline" size={20} color={colors.text} style={styles.icon} />
            <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
          <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region}>
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="BookStore" />
          </MapView>
        </View>

        <View style={[styles.infoBox, { borderColor: colors.primary }]}>
          <Text style={[styles.label, { color: colors.text }]}>Send us a message</Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.primary }]}
            multiline
            numberOfLines={4}
            placeholder="Type here..."
            placeholderTextColor={colors.text + "99"}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.card }]} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  backButton: { padding: 8, width: 40 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", flex: 1 },
  rightPlaceholder: { width: 40 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    paddingBottom: 10,
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: { fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  linkText: { fontSize: 18, textDecorationLine: "underline" },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 12 },
  mapContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
    padding: 16,
    backgroundColor: "transparent",
  },
  addressText: { fontSize: 16, marginBottom: 12 },
  map: { width: "100%", height: 250, borderRadius: 8 },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 12,
    fontSize: 16,
    minHeight: 100,
  },
  sendButton: {
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
