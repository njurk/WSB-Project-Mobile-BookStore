import * as React from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getCollectionByUser, deleteCollection, postCartItem } from "../../api/api-functions";
import type { Collection } from "../../api/api-functions";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@/api/api-connection";

const SavedPage: React.FC = () => {
  const [savedBooks, setSavedBooks] = React.useState<Collection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<number | null>(null);
  const router = useRouter();

  const loadUserAndSavedBooks = React.useCallback(async () => {
    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.userId);
        const collections = await getCollectionByUser(user.userId);
        setSavedBooks(collections.filter(c => c.book != null));
      }
    } catch (error) {
      console.error("Failed to load saved books", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUserAndSavedBooks();
  }, [loadUserAndSavedBooks]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserAndSavedBooks();
    }, [loadUserAndSavedBooks])
  );

  const handleBookPress = (bookId: number) => {
    router.push({
      pathname: "/BookDetailsPage",
      params: { id: bookId.toString() },
    });
  };

  const handleAddToCart = async (bookId: number) => {
    if (userId === null) return;
    try {
      const addedItem = await postCartItem({ userId, bookId, quantity: 1 });
      if (addedItem) {
        Alert.alert("Success", "Book added to cart.");
      } else {
        Alert.alert("Error", "Failed to add book to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add book to cart.");
    }
  };

  const handleDelete = async (bookId: number) => {
    if (userId === null) return;
    try {
      const collectionToDelete = savedBooks.find(c => c.bookId === bookId);
      if (!collectionToDelete) return;

      await deleteCollection(collectionToDelete.collectionId, userId);
      setSavedBooks(prev => prev.filter(c => c.bookId !== bookId));
      Alert.alert("Deleted", "Book removed from collection");
    } catch (error) {
      console.error("Failed to delete book", error);
      Alert.alert("Error", "Failed to remove book from collection.");
    }
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
        <Text style={styles.logo}>Your saved books</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedBooks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#ffffff" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No saved books yet.</Text>
          </View>
        ) : (
          savedBooks.map((collection) => {
            const book = collection.book!;
            return (
              <Pressable
                key={collection.collectionId}
                style={({ pressed }) => [
                  styles.bookItem,
                  pressed && { backgroundColor: "#A095D1" },
                ]}
                onPress={() => handleBookPress(book.bookId)}
              >
                <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={styles.bookImage} />
                
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                  <Text style={styles.bookPrice}>${book.price.toFixed(2)}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => handleAddToCart(book.bookId)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="cart-outline" size={24} color="#ffffff" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(book.bookId)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Ionicons name="trash-outline" size={24} color="#ffffff" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
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
