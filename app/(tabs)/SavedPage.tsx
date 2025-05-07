import * as React from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const savedBooks = [
  { id: 1, title: "Brave New World", price: "$12.99", image: "https://placehold.co/100x150" },
  { id: 2, title: "The Catcher in the Rye", price: "$9.99", image: "https://placehold.co/100x150" },
];

const SavedPage: React.FC = () => {
  const handleBookPress = (bookId: number) => {
    // Here you would navigate to book details, left empty intentionally
  };

  const handleAddToCart = (bookId: number) => {
    // Here you would handle adding the book to the cart
  };

  const handleDelete = (bookId: number) => {
    // Here you would handle deleting the book from saved
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Your saved books</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedBooks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#ffffff" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No saved books yet.</Text>
          </View>
        ) : (
          savedBooks.map((book) => (
            <Pressable
              key={book.id}
              style={({ pressed }) => [
                styles.bookItem,
                pressed && { backgroundColor: "#A095D1" },
              ]}
              onPress={() => handleBookPress(book.id)}
            >
              <Image source={{ uri: book.image }} style={styles.bookImage} />

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookPrice}>{book.price}</Text>
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  onPress={() => handleAddToCart(book.id)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <Ionicons name="cart-outline" size={24} color="#ffffff" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(book.id)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <Ionicons name="trash-outline" size={24} color="#ffffff" />
                </Pressable>
              </View>
            </Pressable>
          ))
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
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#786EB9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#A095D1",
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 14,
    color: "#E5E2F3",
  },
  actionButtons: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
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
});

export default SavedPage;
