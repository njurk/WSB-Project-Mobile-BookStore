import { CartItem, deleteCartItem, DeliveryType, getDeliveryTypes, postOrder } from "@/api/api-functions";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function CheckoutPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams<{ cartTotal?: string; cartItems?: string }>();
  const cartTotal = params.cartTotal ? Number(params.cartTotal) : 0;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [selectedDeliveryTypeId, setSelectedDeliveryTypeId] = useState<number | null>(null);

  const selectedDeliveryType = deliveryTypes.find(dt => dt.deliveryTypeId === selectedDeliveryTypeId);
  const deliveryFee = selectedDeliveryType ? selectedDeliveryType.fee : 0;

  useEffect(() => {
    AsyncStorage.getItem("user").then((userJson) => {
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.userId);
        setStreet(user.street || "");
        setCity(user.city || "");
        setPostalCode(user.postalCode || "");
      }
    });
  }, []);

  useEffect(() => {
    if (params.cartItems) {
      try {
        const items = JSON.parse(params.cartItems);
        if (Array.isArray(items)) {
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch {
        setCartItems([]);
      }
    }
  }, [params.cartItems]);

  useEffect(() => {
    const fetchDeliveryTypes = async () => {
      try {
        const types = await getDeliveryTypes();
        setDeliveryTypes(types);
        if (types.length > 0) setSelectedDeliveryTypeId(types[0].deliveryTypeId);
      } catch (error) {
        console.error("Failed to fetch delivery types:", error);
      }
    };
    fetchDeliveryTypes();
  }, []);

  const isAddressComplete = street.trim() !== "" && city.trim() !== "" && postalCode.trim() !== "";

  const handleBack = () => {
    router.back();
  };

  const clearCart = async () => {
    if (!userId) return;
    for (const item of cartItems) {
      try {
        await deleteCartItem(item.cartId);
      } catch {}
    }
  };

  const handlePay = async () => {
    if (!isAddressComplete) {
      Alert.alert("Invalid", "Please fill in all fields before placing the order");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }
    if (selectedDeliveryTypeId === null) {
      Alert.alert("Error", "Please select a delivery option");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId,
        street,
        city,
        postalCode,
        deliveryTypeId: selectedDeliveryTypeId,
        orderItems: cartItems.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
      };

      await postOrder(orderData);
      await clearCart();

      Alert.alert("Success", "Order placed successfully, thank you for shopping with us!");
      router.replace("/");
    } catch {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.navbar, { backgroundColor: colors.card }]}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={street}
          onChangeText={setStreet}
          placeholder="Street"
          placeholderTextColor={colors.text + "99"}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor={colors.text + "99"}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Postal Code"
          placeholderTextColor={colors.text + "99"}
          keyboardType="numeric"
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Delivery Options</Text>
        <View style={styles.radioGroup}>
          {deliveryTypes.map((dt) => (
            <Pressable
              key={dt.deliveryTypeId}
              style={styles.radioButtonContainer}
              onPress={() => setSelectedDeliveryTypeId(dt.deliveryTypeId)}
            >
              <View style={[styles.radioCircle, selectedDeliveryTypeId === dt.deliveryTypeId && { borderColor: colors.primary }]}>
                {selectedDeliveryTypeId === dt.deliveryTypeId && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[styles.radioLabel, { color: colors.text }]}>
                {dt.name} (${dt.fee.toFixed(2)})
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Items:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: "bold" }]}>Total:</Text>
            <Text style={[styles.summaryValue, { color: colors.text, fontWeight: "bold" }]}>
              ${(cartTotal + deliveryFee).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="card-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.infoText, { color: colors.text }]}>Payment upfront. Free returns within 14 days.</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.payButton,
          {
            backgroundColor: isAddressComplete ? colors.primary : colors.border,
            opacity: isAddressComplete ? 1 : 0.5,
          },
        ]}
        disabled={!isAddressComplete || loading}
        onPress={handlePay}
        activeOpacity={0.8}
      >
        <Text style={styles.payButtonText}>Pay</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: "column",
    marginBottom: 12,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#777",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
  },
  summaryBox: {
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  payButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
