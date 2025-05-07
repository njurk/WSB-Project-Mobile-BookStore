import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const cartItems = [
  { id: 1, title: "Brave New World", price: "$12.99", quantity: 1, image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg" },
  { id: 2, title: "The Catcher in the Rye", price: "$9.99", quantity: 2, image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg" },
];

const CartPage: React.FC = () => {
  const handleRemoveItem = (itemId: number) => {
    // Logic to remove the item from the cart
  };

  const handleIncreaseQuantity = (itemId: number) => {
    // Logic to increase item quantity
  };

  const handleDecreaseQuantity = (itemId: number) => {
    // Logic to decrease item quantity
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price.slice(1)) * item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Your Cart</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#ffffff" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {/* Delete Button with opacity effect */}
              <Pressable
                onPress={() => handleRemoveItem(item.id)}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="trash-outline" size={24} color="#ffffff" />
              </Pressable>

              <Image source={{ uri: item.image }} style={styles.cartItemImage} />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemTitle}>{item.title}</Text>
                <View style={styles.quantityContainer}>
                  <Pressable
                    onPress={() => handleDecreaseQuantity(item.id)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="remove-outline" size={20} color="#ffffff" />
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => handleIncreaseQuantity(item.id)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="add-outline" size={20} color="#ffffff" />
                  </Pressable>
                </View>
              </View>

              {/* Price moved to where delete icon was */}
              <Text style={styles.cartItemPrice}>{item.price}</Text>
            </View>
          ))
        )}

        {cartItems.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${calculateTotal().toFixed(2)}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.checkoutButton,
                pressed && { opacity: 0.5 },
              ]}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#786EB9",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#786EB9",
  },
  logo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#786EB9",
    borderRadius: 2,
    padding: 12,
    marginBottom: 16,
  },
  removeButton: {
    marginRight: 12,
  },
  cartItemImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#A095D1",
    padding: 6,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    color: "#ffffff",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#E5E2F3",
    marginLeft: 12,
  },
  totalContainer: {
    width: "100%",
    backgroundColor: "#A095D1",
    borderRadius: 2,
    padding: 12,
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  checkoutButton: {
    width: "100%",
    backgroundColor: "#E5E2F3",
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  checkoutText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#786EB9",
  },
});

export default CartPage;
