import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getResourceById, getCollectionByUserAndBook, postCollection, deleteCollection, postCartItem } from "../api/api-functions";
import type { Book, Genre, Review, Collection } from "../api/api-functions";
import { API_URL } from "../api/api-connection";

const BookDetailsPage: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = React.useState<Book | null>(null);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [collectionId, setCollectionId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadUserId = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.userId);
        }
      } catch {}
    };
    loadUserId();
  }, []);

  React.useEffect(() => {
    if (!id || userId === null) return;
  
    const fetchBookAndSaved = async () => {
      try {
        setLoading(true);
        const data = await getResourceById<Book>("Book", id);
        setBook(data);
        setGenres(data.bookGenre?.map(bg => bg.genre) ?? []);
        setReviews(data.review ?? []);
        const collections = await getCollectionByUserAndBook(userId, data.bookId);
        if (collections.length > 0) {
          setSaved(true);
          setCollectionId(collections[0].collectionId);
        } else {
          setSaved(false);
          setCollectionId(null);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };
  
    fetchBookAndSaved();
  }, [id, userId]);
  
  const handleSave = async () => {
    if (!book || userId === null) return;
  
    if (!saved) {
      const savedCollection = await postCollection({ userId, bookId: book.bookId });
      if (savedCollection) {
        setSaved(true);
        setCollectionId(savedCollection.collectionId);
      }
    } else {
      const collections = await getCollectionByUserAndBook(userId, book.bookId);
      if (!collections.length) return;
  
      await deleteCollection(collections[0].collectionId, userId);
      setSaved(false);
      setCollectionId(null);
    }
  };

  const handleAddToCart = async () => {
    if (!book || userId === null) return;
    try {
      const addedItem = await postCartItem({
        userId,
        bookId: book.bookId,
        quantity: 1,
      });
      if (addedItem) {
        Alert.alert("Added to Cart", "Book added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };  
  
  const handleAddReview = () => {};
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
        <Ionicons name="arrow-back" size={30} color="#ffffff" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={styles.bookCover} />

        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>
            {book.author ? `${book.author.firstName ?? ""} ${book.author.lastName ?? ""}`.trim() : ""}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={styles.bookPrice}>${book.price.toFixed(2)}</Text>
            {book.averageRating && book.averageRating > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                <Ionicons name="star" size={25} color="#FFD700" />
                <Text style={{ color: "#E5E2F3", fontSize: 18, fontWeight: "bold", marginLeft: 4 }}>
                  {book.averageRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.genresContainer}>
          {genres.map((genre) => (
            <View key={genre.genreId} style={styles.genreBubble}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.descriptionText}>{book.description}</Text>

        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>Details</Text>
          <Text style={styles.bookDetailText}>Year Published: {book.yearPublished}</Text>
          <Text style={styles.bookDetailText}>Pages: {book.numberOfPages}</Text>
          <Text style={styles.bookDetailText}>Language: {book.language}</Text>
          <Text style={styles.bookDetailText}>ISBN: {book.isbn}</Text>
        </View>

        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>User Reviews</Text>
            <Pressable onPress={handleAddReview} style={({ pressed }) => [styles.addReviewButton, pressed && { opacity: 0.5 }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="add-circle-outline" size={24} color="#786EB9" />
                <Text style={{ marginLeft: 8, color: "#786EB9", fontWeight: "bold" }}>Add Review</Text>
              </View>
            </Pressable>
          </View>
          {reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <Text style={styles.reviewUsername}>{review.user?.username ?? "Anonymous"}</Text>
              <View style={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? "star" : "star-outline"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.stickyButtonsContainer}>
        <Pressable onPress={handleSave} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={40} color="#ffffff" />
        </Pressable>
        <Pressable onPress={handleAddToCart} style={({ pressed }) => [styles.addToCartButton, pressed && { opacity: 0.5 }]}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#786EB9",
    paddingTop: 78,
    paddingHorizontal: 16,
    position: "relative",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  backButton: {
    position: "absolute",
    top: 25,
    left: 16,
    zIndex: 1,
    marginTop: 16,
  },
  bookCover: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 16,
  },
  bookInfo: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 18,
    color: "#E5E2F3",
    marginBottom: 8,
  },
  bookPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E5E2F3",
    textAlign: "left",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  genreBubble: {
    backgroundColor: "#A095D1",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 4,
  },
  genreText: {
    color: "#ffffff",
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 20,
  },
  bookDetails: {
    backgroundColor: "#A095D1",
    borderRadius: 2,
    padding: 12,
    marginBottom: 24,
  },
  bookDetailText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E5E2F3",
    marginBottom: 8,
  },
  reviewsContainer: {
    backgroundColor: "#A095D1",
    borderRadius: 2,
    padding: 12,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  addReviewButton: {
    backgroundColor: "#E5E2F3",
    borderRadius: 50,
    padding: 12,
  },
  reviewCard: {
    backgroundColor: "#786EB9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewUsername: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#E5E2F3",
  },
  stickyButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#A095D1",
    borderTopWidth: 1,
    borderTopColor: "#ffffff",
  },
  iconButton: {
    marginBlock: "auto",
  },
  addToCartButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 13,
    paddingHorizontal: 104,
    borderRadius: 2,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#786EB9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookDetailsPage;
