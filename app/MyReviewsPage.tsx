import { API_URL } from "@/api/api-connection";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import type { Review } from "../api/api-functions";
import { deleteReview, getReviewsByUser, patchReview } from "../api/api-functions";

export default function MyReviewsPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviewsByUser(parseInt(userId));
        setReviews(data);
      } catch {
        Alert.alert("Error", "Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const handleDelete = (reviewId: number) => {
    Alert.alert(
      "Delete review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
              Alert.alert("Deleted", "Review deleted");
            } catch {
              Alert.alert("Error", "Failed to delete review");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditModalVisible(true);
  };

  const submitEdit = async () => {
    if (!editingReview) return;

    if (editRating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    if (!editComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    setSubmittingEdit(true);

    try {
      const updated = await patchReview(editingReview.reviewId, {
        rating: editRating,
        comment: editComment.trim(),
      });

      if (updated && updated.reviewId) {
        setReviews((prev) =>
          prev.map((r) => (r.reviewId === updated.reviewId ? updated : r))
        );

        Alert.alert("Success", "Review updated successfully");

        setEditModalVisible(false);
        setEditingReview(null);
        setEditRating(0);
        setEditComment("");
      } else {
        Alert.alert("Update Failed", "Please try again");
      }
    } catch (error: any) {
      console.error("submitEdit error:", error);
      Alert.alert(
        "Error",
        `Failed to update review ${error?.message ? "Error: " + error.message : ""}`
      );
    } finally {
      setSubmittingEdit(false);
    }
  };

  const renderEmptyList = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <Ionicons name="star-outline" size={60} color={colors.text} />
      <Text style={[styles.emptyText, { color: colors.text }]}>No reviews yet</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="arrow-back" size={30} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.reviewId.toString()}
          contentContainerStyle={[styles.listContent, reviews.length === 0 && styles.emptyListContainer]}
          ListEmptyComponent={renderEmptyList}
          renderItem={({ item }) => (
            <View style={[styles.reviewCard, { borderColor: colors.card }]}>
              {item.book && (
                <View style={styles.bookInfoContainer}>
                  <Image
                    source={{ uri: `${API_URL}/images/${item.book.imageUrl}` }}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.bookTitle, { color: colors.text }]}>
                    {item.book.title}
                  </Text>
                  <View style={styles.iconStack}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                      <Ionicons name="create-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.reviewId)} style={styles.iconButton}>
                      <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {!item.book && (
                <View style={styles.iconStackFallback}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                    <Ionicons name="create-outline" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.reviewId)} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={24} color= "white" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.reviewContent}>
                <View style={styles.starRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.rating ? "star" : "star-outline"}
                      size={20}
                      color="#FFD700"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text style={[styles.commentText, { color: colors.text }]}>{item.comment}</Text>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {new Date(item.dateCreated).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />

      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: "white" }]}>
              {editingReview?.book?.title ?? "Review"}
            </Text>

            <Text style={[styles.label, { color: "white" }]}>Rating</Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setEditRating(star)} hitSlop={8}>
                  <Ionicons
                    name={star <= editRating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                    style={{ marginHorizontal: 4}}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: "white" }]}>Comment</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={[styles.textArea, { borderColor: "white", color: "white" }]}
              value={editComment}
              onChangeText={setEditComment}
              placeholder="New comment..."
              placeholderTextColor="rgba(255,255,255,0.6)"
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary, opacity: submittingEdit ? 0.7 : 1 }]}
                onPress={submitEdit}
                disabled={submittingEdit}
                activeOpacity={0.8}
              >
                {submittingEdit ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: {
    padding: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerContainer: {
    marginTop: 80,
    marginBottom: 12,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewCard: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  bookInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bookImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
  },
  iconStack: {
    marginLeft: "auto",
    justifyContent: "space-between",
    height: 75,
  },
  iconStackFallback: {
    flexDirection: "column",
    position: "absolute",
    right: 16,
    top: 16,
    justifyContent: "space-between",
    height: 60,
  },
  iconButton: {
    padding: 6,
  },
  reviewContent: {
    marginTop: 8,
  },
  starRating: {
    flexDirection: "row",
    marginBottom: 6,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    fontStyle: "italic",
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    textAlignVertical: "top",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
