import React, { useEffect, useState } from "react";
import {View,Text,FlatList,TouchableOpacity,StyleSheet,Alert,ActivityIndicator, Button, Modal, Pressable, TextInput, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getReviewsByUser, deleteReview, patchReview  } from "../api/api-functions";
import type { Review } from "../api/api-functions"; 
import { useTheme } from "@react-navigation/native";
import { API_URL } from "@/api/api-connection";

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
          Alert.alert("Error", "Failed to load reviews.");
          setReviews([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReviews();
    }, [userId]);
  
    const handleDelete = (reviewId: number) => {
      Alert.alert(
        "Delete Review",
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
          Alert.alert("Validation Error", "Please select a rating.");
          return;
        }
      
        if (!editComment.trim()) {
          Alert.alert("Validation Error", "Comment cannot be empty.");
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
      
            Alert.alert("Success", "Review updated successfully.");
      
            setEditModalVisible(false);
            setEditingReview(null);
            setEditRating(0);
            setEditComment("");
          } else {
            Alert.alert(
              "Update Failed",
              "Please try again"
            );
          }
        } catch (error: any) {
          console.error("submitEdit error:", error);
          Alert.alert(
            "Error",
            `Failed to update review. ${error?.message ? "Error: " + error.message : ""}`
          );
        } finally {
          setSubmittingEdit(false);
        }
      };      
  
    const renderEmptyList = () => (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="star-outline" size={60} color={colors.text} />
        <Text style={[styles.emptyText, { color: colors.text }]}>No reviews yet.</Text>
      </View>
    );
  
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </Pressable>

        <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Reviews</Text>
        </View>
  
        {loading ? (
          <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.reviewId.toString()}
              contentContainerStyle={[styles.listContent, reviews.length === 0 && styles.emptyListContainer]}
              ListEmptyComponent={renderEmptyList}
              renderItem={({ item }) => (
                <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
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
                          <Ionicons name="create" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.reviewId)} style={styles.iconButton}>
                          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {!item.book && (
                    <View style={styles.iconStackFallback}>
                      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                        <Ionicons name="create" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.reviewId)} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.reviewContent}>
                    <Text style={[styles.ratingText, { color: colors.text }]}>
                      Rating: {item.rating} / 5
                    </Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>{item.comment}</Text>
                    <Text style={[styles.dateText, { color: colors.text }]}>
                      {new Date(item.dateCreated).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
            />
  
            <Modal
              visible={editModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setEditModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Review</Text>
  
                  <Text style={styles.label}>Rating</Text>
                  <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setEditRating(star)}>
                        <Ionicons
                          name={star <= editRating ? "star" : "star-outline"}
                          size={32}
                          color="#FFD700"
                          style={{ marginHorizontal: 4 }}
                        />
                      </Pressable>
                    ))}
                  </View>
  
                  <Text style={styles.label}>Comment</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    value={editComment}
                    onChangeText={setEditComment}
                    placeholder="Edit your review here..."
                  />
  
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                    <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
                    <Button
                      title={submittingEdit ? "Saving..." : "Save"}
                      onPress={submitEdit}
                      disabled={submittingEdit}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 80 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    backButton: {
      position: "absolute",
      top: 40,
      left: 16,
      zIndex: 10,
      padding: 8,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 8,
    },
    headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
      backgroundColor: "#ccc",
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
    ratingText: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 6,
    },
    commentText: {
      fontSize: 14,
      marginBottom: 8,
    },
    dateText: {
      fontSize: 12,
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
      backgroundColor: "#fff",
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
      borderColor: "#ccc",
      borderRadius: 4,
      padding: 10,
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
  });