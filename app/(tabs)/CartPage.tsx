import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../api/api-connection";
import { CartItem, deleteCartItem, getCartByUserId, updateCartItemQuantity } from "../../api/api-functions";

const CartPage: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
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

    const totalPrice = React.useMemo(() => {
      return cartItems.reduce(
        (total, item) => total + (item.book?.price ?? 0) * item.quantity,
        0
      );
    }, [cartItems]);

  const handleCheckout = () => {
    router.push({
      pathname: "/CheckoutPage",
      params: {
        cartTotal: totalPrice.toString(),
        cartItems: JSON.stringify(cartItems),
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { backgroundColor: colors.card }]}>
        <Text style={[styles.logo, { color: colors.text }]}>Cart</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={[styles.scrollView]}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.text} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Your cart is empty</Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.cartId} style={[styles.cartItem]}>
              <Pressable
                onPress={() => handleRemoveItem(item.cartId)}
                style={({ pressed }) => [
                  styles.removeButton,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
              <Ionicons name="trash-outline" size={28} color={colors.text} />
              </Pressable>

              <Image source={{ uri: `${API_URL}/images/${item.book.imageUrl}` }} style={styles.cartItemImage} />
              <View style={styles.cartItemInfo}>
                <Text style={[styles.cartItemTitle, { color: colors.text }]}>{item.book?.title ?? "No Title"}</Text>
                <View style={styles.quantityContainer}>
                  <Pressable
                    onPress={() => handleDecreaseQuantity(item.cartId)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Ionicons name="remove-outline" size={20} color={colors.text} />
                  </Pressable>
                  <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => handleIncreaseQuantity(item.cartId)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Ionicons name="add-outline" size={20} color={colors.text} />
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.cartItemPrice, { color: colors.text }]}>${(item.book?.price ?? 0).toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={[styles.totalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total: ${calculateTotal().toFixed(2)}</Text>
          <TouchableOpacity onPress={handleCheckout} style={[styles.checkoutButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkoutText, { color: colors.text }]}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 26,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
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
    textAlign: "center",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 12,
  },
  totalContainer: {
    padding: 12,
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  checkoutButton: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  checkoutText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default CartPage;
