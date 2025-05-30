import { API_URL } from "@/api/api-connection";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Collection } from "../../api/api-functions";
import { deleteCollection, getCollectionByUser, postCartItem } from "../../api/api-functions";

const SavedPage: React.FC = () => {
  const { colors } = useTheme();
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
    } catch (error) {
      console.error("Failed to add book to cart", error);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (userId === null) return;
    try {
      const collectionToDelete = savedBooks.find(c => c.bookId === bookId);
      if (!collectionToDelete) return;

      await deleteCollection(collectionToDelete.collectionId, userId);
      setSavedBooks(prev => prev.filter(c => c.bookId !== bookId));
    } catch (error) {
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { backgroundColor: colors.card }]}>
        <Text style={[styles.logo, { color: colors.text }]}>Saved</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedBooks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={colors.text} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No saved books yet.</Text>
          </View>
        ) : (
          savedBooks.map((collection) => {
            const book = collection.book!;
            return (
              <Pressable
                key={collection.collectionId}
                style={({pressed}) => [
                  styles.bookItem,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() => handleBookPress(book.bookId)}
              >
                <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={[styles.bookImage, { backgroundColor: colors.border }]} />
                
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
                  <Text style={[styles.bookPrice, { color: colors.text }]}>${book.price.toFixed(2)}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => handleAddToCart(book.bookId)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Ionicons name="cart-outline" size={28} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(book.bookId)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Ionicons name="trash-outline" size={28} color={colors.text} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  bookImage: {
    width: 75,
    height: 110,
    borderRadius: 5,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 16,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
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
    textAlign: "center",
  },
});

export default SavedPage;
