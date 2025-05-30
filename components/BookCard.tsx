import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { API_URL } from "./../api/api-connection";
import type { Book } from "./../api/api-functions";

interface BookCardProps {
  book: Book;
  onPress: () => void;
  saved: boolean;
  onToggleSave: (bookId: number, currentlySaved: boolean) => Promise<void>;
  onAddToCart: (bookId: number) => Promise<void>;
  style?: any;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress, saved, onToggleSave, onAddToCart, style }) => {
  const { colors } = useTheme();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  const handleToggleSave = async () => {
    if (loadingSave) return;
    setLoadingSave(true);
    await onToggleSave(book.bookId, saved);
    setLoadingSave(false);
  };

  const handleAddToCart = async () => {
    if (loadingCart) return;
    setLoadingCart(true);
    await onAddToCart(book.bookId);
    setLoadingCart(false);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bookCard,
        style,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={styles.bookImage} />
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
        {book.title}
      </Text>

      <View style={styles.actionsRow}>
        <Text style={[styles.bookPrice, { color: colors.text }]}>
          ${book.price != null ? book.price.toFixed(2) : "0.00"}
        </Text>

        <View style={styles.bookActions}>
          <Pressable
            onPress={handleAddToCart}
            disabled={loadingCart}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="cart-outline" size={27} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={handleToggleSave}
            disabled={loadingSave}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name={saved ? "heart" : "heart-outline"} size={27} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bookCard: {
    width: 120,
    marginRight: 12,
    alignItems: "center",
    borderRadius: 5,
    padding: 10,
    flexDirection: "column",
    height: 300,
  },
  bookImage: {
    width: 120,
    height: 185,
    borderRadius: 6,
    marginBottom: 6,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  bookPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginTop: "auto",
  },
  bookActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "auto",
    marginTop: "auto",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
    marginHorizontal: 2,
    paddingHorizontal: 2,
  },
});

export default BookCard;
