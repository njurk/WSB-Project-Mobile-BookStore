import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCartByUserId, deleteCartItem, updateCartItemQuantity, CartItem } from "../../api/api-functions";
import { API_URL } from "../../api/api-connection";
import { useFocusEffect } from '@react-navigation/native';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = React.useState<Array<CartItem>>([]);
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
  
      const loadUserAndCart = async () => {
        try {
          const userJson = await AsyncStorage.getItem("user");
          if (userJson) {
            const user = JSON.parse(userJson);
            setUserId(user.userId);
            const cart = await getCartByUserId(user.userId);
            if (isActive) {
              setCartItems(cart.filter(item => item.book != null));
            }
          }
        } catch (error) {
          console.error("Failed to load user/cart", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };
  
      loadUserAndCart();
  
      return () => {
        isActive = false;
      };
    }, [])
  );  

  const handleRemoveItem = async (itemId: number) => {
    try {
      await deleteCartItem(itemId);
      setCartItems((prev) => prev.filter(item => item.cartId !== itemId));
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };
  
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
  
    const prevCartItems = [...cartItems];
    setCartItems(prev =>
      prev.map(i => i.cartId === itemId ? { ...i, quantity: newQuantity } : i)
    );
  
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity", error);
      setCartItems(prevCartItems);
    }
  };
  
  const handleIncreaseQuantity = (itemId: number) => {
    const item = cartItems.find(i => i.cartId === itemId);
    if (!item) return;
    updateQuantity(itemId, item.quantity + 1);
  };
  
  const handleDecreaseQuantity = (itemId: number) => {
    const item = cartItems.find(i => i.cartId === itemId);
    if (!item) return;
    updateQuantity(itemId, item.quantity - 1);
  };   
  
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.book?.price ?? 0) * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <View key={item.cartId} style={styles.cartItem}>
              <Pressable
                onPress={() => handleRemoveItem(item.cartId)}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="trash-outline" size={24} color="#ffffff" />
              </Pressable>
          
              <Image source={{ uri: `${API_URL}/images/${item.book.imageUrl}` }} style={styles.cartItemImage} />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemTitle}>{item.book?.title ?? "No Title"}</Text>
                <View style={styles.quantityContainer}>
                  <Pressable
                    onPress={() => handleDecreaseQuantity(item.cartId)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="remove-outline" size={20} color="#ffffff" />
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => handleIncreaseQuantity(item.cartId)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="add-outline" size={20} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
        
              <Text style={styles.cartItemPrice}>${(item.book?.price ?? 0).toFixed(2)}</Text>
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
