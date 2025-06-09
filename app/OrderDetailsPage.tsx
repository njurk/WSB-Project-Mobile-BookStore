import { API_URL } from "@/api/api-connection";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getOrderById, OrderDetails, OrderItemDetails } from "../api/api-functions";

export default function OrderDetailsPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const data = await getOrderById(Number(id));
          setOrder(data);
        }
      } catch (error) {
        console.error("Failed to load order details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, textAlign: "center", marginTop: 20 }}>
          Order not found
        </Text>
      </View>
    );
  }

  const renderOrderItem = ({ item }: { item: OrderItemDetails }) => (
  <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
    <Image
      source={{ uri: `${API_URL}/images/${item.imageUrl}` }}
      style={styles.itemImage}
    />
    <View style={styles.itemInfo}>
      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
        {item.bookTitle}
      </Text>
      <View style={styles.quantityPriceRow}>
        <Text style={[styles.quantityText, { color: colors.text }]}>Quantity: {item.quantity}</Text>
        <Text style={[styles.priceText, { color: colors.text }]}>${item.priceAtPurchase.toFixed(2)}</Text>
      </View>
    </View>
  </View>
);


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button">
        <Ionicons name="arrow-back" size={28} color={colors.text} />
      </Pressable>

      <Text style={[styles.header, { color: colors.text }]}>Order number: #{order.orderId}</Text>
      <Text style={[styles.date, { color: colors.text }]}>
        Date: {new Date(order.orderDate).toLocaleDateString()}
      </Text>

      <View style={[styles.sectionContainer, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery address</Text>
        <Text style={[styles.addressText, { color: colors.text }]}>{order.street}</Text>
        <Text style={[styles.addressText, { color: colors.text }]}>
            {order.city}, {order.postalCode}
        </Text>
      </View>

      <View style={[styles.sectionContainer, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery details</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
            {`${order.deliveryTypeName} delivery`}
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
            Fee: ${order.deliveryFee.toFixed(2)}
        </Text>
    </View>

      <FlatList
        data={order.orderItems}
        keyExtractor={(item) => item.orderItemId.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={[styles.totalContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total price:</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              ${order.totalPrice !== undefined && order.totalPrice !== null ? order.totalPrice.toFixed(2) : "0.00"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 20 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 12,
    paddingLeft: 4,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  addressText: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 120,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  multiplySymbol: {
    fontWeight: "normal",
    fontSize: 16,
  },

  quantityText: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "600",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
});
