import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  Button,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { API_URL } from "../api/api-connection";
import type { Book, Genre, Review } from "../api/api-functions";
import {
  addToCart,
  deleteCollection,
  deleteReview,
  getCollectionByUserAndBook,
  getResourceById,
  patchReview,
  postCollection,
  postReview
} from "../api/api-functions";

const BookDetailsPage: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [book, setBook] = React.useState<Book | null>(null);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [collectionId, setCollectionId] = React.useState<number | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [editingReviewId, setEditingReviewId] = React.useState<number | null>(null);

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

  const handleAddToCart = async (bookId: number) => {
    if (userId === null) return;
    await addToCart(userId, bookId);
  };

  const handleAddReview = () => {
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (!book || userId === null) return;
    if (reviewRating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    setSubmittingReview(true);

    try {
      if (editingReviewId !== null) {
        const updated = await patchReview(editingReviewId, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        if (updated) {
          setReviews(prev =>
            prev.map(r => (r.reviewId === editingReviewId ? { ...r, ...updated } : r))
          );
          Alert.alert("Success", "Review updated");
        }
      } else {
        const newReview = await postReview({
          bookId: book.bookId,
          userId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        if (newReview) {
          setReviews(prev => [newReview, ...prev]);
          Alert.alert("Success", "Review added");
        }
      }
      setReviewModalVisible(false);
      setReviewRating(0);
      setReviewComment("");
      setEditingReviewId(null);
    } catch (error) {
      Alert.alert("Error", "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Book not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
        <Ionicons name="arrow-back" size={30} color={colors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={[styles.bookCover, { borderColor: colors.border }]} />

        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.bookAuthor, { color: colors.text }]}>
            {book.author ? `${book.author.firstName ?? ""} ${book.author.lastName ?? ""}`.trim() : ""}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[styles.bookPrice, { color: colors.text }]}>${book.price.toFixed(2)}</Text>
            {book.averageRating && book.averageRating > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                <Ionicons name="star" size={25} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{book.averageRating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.genresContainer}>
          {genres.map((genre) => (
            <View key={genre.genreId} style={[styles.genreBubble, { backgroundColor: colors.card }]}>
              <Text style={[styles.genreText, { color: colors.text }]}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.descriptionText, { color: colors.text }]}>{book.description}</Text>

        <View style={[styles.bookDetails, { borderColor: colors.primary, borderWidth: 1 }]}>
          <Text style={[styles.bookTitle, { color: colors.text }]}>Details</Text>
          <Text style={[styles.bookDetailText, { color: colors.text }]}>Year: {book.yearPublished}</Text>
          <Text style={[styles.bookDetailText, { color: colors.text }]}>Pages: {book.numberOfPages}</Text>
          <Text style={[styles.bookDetailText, { color: colors.text }]}>Language: {book.language}</Text>
          <Text style={[styles.bookDetailText, { color: colors.text }]}>ISBN: {book.isbn}</Text>
        </View>

        <View style={[styles.reviewsContainer]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.reviewsTitle, { color: colors.text }]}>Reviews</Text>
            <Pressable
              onPress={handleAddReview}
              style={({ pressed }) => [
                styles.addReviewButton,
                { backgroundColor: colors.card },
                pressed && { opacity: 0.5 }
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                <Text style={[styles.addReviewText, { color: colors.text }]}>Add</Text>
              </View>
            </Pressable>
          </View>
          {reviews.map((review, index) => {
            const isUserReview = userId !== null && review.user?.userId === userId;
            const formattedDate = new Date(review.dateCreated ?? "").toLocaleDateString();

            return (
               <View
                  key={index}
                  style={[styles.reviewCard, { borderColor: colors.primary, borderWidth: 1 }]}
                >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewUsername, { color: colors.text }]}>{review.user?.username ?? "Anonymous"}</Text>

                  {isUserReview && (
                    <View style={styles.reviewActions}>
                      <Pressable
                        onPress={() => {
                          setReviewRating(review.rating);
                          setReviewComment(review.comment);
                          setEditingReviewId(review.reviewId);
                          setReviewModalVisible(true);
                        }}
                        style={{ marginRight: 10 }}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.text} />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          Alert.alert("Confirm Delete", "Are you sure you want to delete this review?", [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  await deleteReview(review.reviewId);
                                  setReviews(prev => prev.filter(r => r.reviewId !== review.reviewId));
                                } catch (error) {
                                  console.error("Error deleting review:", error);
                                  Alert.alert("Error", "Failed to delete review.");
                                }
                              }
                            },
                          ]);
                        }}
                      >
                        <Ionicons name="trash" size={20} color={colors.text} />
                      </Pressable>
                    </View>
                  )}
                </View>

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

                <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>
                <Text style={[styles.reviewDate, { color: colors.text }]}>{formattedDate}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.stickyButtonsContainer, { backgroundColor: colors.card }]}>
        <Pressable onPress={handleSave} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={40} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => handleAddToCart(book.bookId)} style={({ pressed }) => [styles.addToCartButton, pressed && { opacity: 0.5 }, { backgroundColor: "white" }]}>
          <Text style={[styles.addToCartText, { color: colors.card }]} >Add to cart</Text>
        </Pressable>
      </View>

      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add review</Text>

            <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                    style={{ marginHorizontal: 4 }}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Comment</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Write your review here..."
              placeholderTextColor={colors.border}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
              <Button title="Cancel" onPress={() => setReviewModalVisible(false)} />
              <Button title={submittingReview ? "Submitting..." : "Submit"} onPress={submitReview} disabled={submittingReview} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  bookInfo: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 20,
    marginBottom: 8,
  },
  bookPrice: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "left",
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 4,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  genreBubble: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 4,
  },
  genreText: {
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  bookDetails: {
    borderRadius: 2,
    padding: 12,
    marginBottom: 24,
  },
  bookDetailText: {
    fontSize: 18,
    marginBottom: 8,
  },
  reviewsContainer: {
    borderRadius: 2,
    padding: 12,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewsTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  addReviewButton: {
    borderRadius: 50,
    padding: 12,
    borderWidth: 1,
  },
  addReviewText: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  reviewCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewUsername: {
    fontSize: 16,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 16,
    marginBottom: 4,
  },
  reviewDate: {
    marginTop: 4,
    fontSize: 12,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 6,
  },
  stickyButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 26,
  },
  iconButton: {
    marginBlock: "auto",
    marginLeft: 12,
  },
  addToCartButton: {
    paddingVertical: 13,
    paddingHorizontal: 104,
    borderRadius: 2,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    textAlignVertical: "top",
  },
});

export default BookDetailsPage;