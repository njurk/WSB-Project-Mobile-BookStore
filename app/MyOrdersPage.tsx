import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getOrdersByUserId, Order } from "./../api/api-functions";

export default function MyOrdersPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndOrders = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.userId);
          const fetchedOrders = await getOrdersByUserId(user.userId);
          setOrders(fetchedOrders);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndOrders();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const getTotalItems = (order: Order) => {
    return (order as any).totalItems ?? 0;
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Pressable
      style={[styles.orderCard, { borderColor: colors.card, backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: "/OrderDetailsPage",
          params: { id: item.orderId.toString() },
        })
      }
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.orderId}</Text>
        <Text style={[styles.orderStatus, { backgroundColor: colors.primary, color: "white" }]}>{item.orderStatusName}</Text>
      </View>
      <Text style={[styles.orderDate, { color: colors.text }]}>
        {new Date(item.orderDate).toLocaleDateString()}
      </Text>
      <Text style={[styles.orderTotal, { color: colors.text }]}>
        Items: {item.totalItemCount}
      </Text>
      <Text style={[styles.orderTotal, { color: colors.text }]}>
        Total price: ${item.totalPrice.toFixed(2)}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="arrow-back" size={30} color={colors.text} />
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>My orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color={colors.text} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    textAlign: "center",
    marginTop: 40,
    marginBottom: 16,
  },
  orderCard: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatus: {
    fontSize: 18,
    fontWeight: "600",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  orderDate: {
    fontSize: 16,
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderItemsCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
});
