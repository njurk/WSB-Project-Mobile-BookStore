import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const book = {
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  price: "$15.99",
  image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg",
  rating: 4.5,
  genres: ["Classic", "Fiction", "Literature"],
  description:
    "The Great Gatsby, F. Scott Fitzgerald's iconic novel, takes place in the Jazz Age of the 1920s and explores themes of decadence, idealism, resistance to change, social upheaval, and excess.",
  yearPublished: 1925,
  pages: 180,
  language: "English",
  isbn: "9780743273565",
  publisher: "Scribner",
  reviews: [
    { username: "john_doe", rating: 5, comment: "An amazing read, truly a classic!" },
    { username: "jane_smith", rating: 4, comment: "I enjoyed it, but I found some parts slow." },
    { username: "book_lover92", rating: 4.5, comment: "A masterpiece, one of the best books I've read." },
  ],
};

const BookDetailsPage: React.FC = () => {
    const handleAddToCart = () => {
      // Logic to add book to cart
    };
  
    const handleSave = () => {
      // Logic to save book to user's library
    };
  
    const handleAddReview = () => {
      // Logic to add a review
    };
  
    const handleBack = () => {
      // Logic to navigate back
    };
  
    return (
      <View style={styles.container}>
        {/* Back Button */}
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}>
          <Ionicons name="arrow-back" size={30} color="#ffffff" />
        </Pressable>
  
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Book Cover */}
          <Image source={{ uri: book.image }} style={styles.bookCover} />
  
          {/* Book Title, Author, Price */}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
            <Text style={styles.bookPrice}>{book.price}</Text>
          </View>
  
          {/* Genres */}
          <View style={styles.genresContainer}>
            {book.genres.map((genre, index) => (
              <View key={index} style={styles.genreBubble}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
  
          {/* Description */}
          <Text style={styles.descriptionText}>{book.description}</Text>
  
          {/* Book Information */}
          <View style={styles.bookDetails}>
            <Text style={styles.bookDetailText}>Year Published: {book.yearPublished}</Text>
            <Text style={styles.bookDetailText}>Pages: {book.pages}</Text>
            <Text style={styles.bookDetailText}>Language: {book.language}</Text>
            <Text style={styles.bookDetailText}>ISBN: {book.isbn}</Text>
            <Text style={styles.bookDetailText}>Publisher: {book.publisher}</Text>
          </View>
  
          {/* User Reviews */}
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
            {book.reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <Text style={styles.reviewUsername}>{review.username}</Text>
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
  
        {/* Sticky Buttons */}
        <View style={styles.stickyButtonsContainer}>
          {/* Save Button */}
          <Pressable onPress={handleSave} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.5 }]}>
            <Ionicons name="bookmark-outline" size={40} color="#ffffff" />
          </Pressable>
  
          {/* Add to Cart Button */}
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
      position: 'relative',
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
      fontSize: 22,
      fontWeight: "bold",
      color: "#E5E2F3",
      textAlign: "right",
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
      marginBottom: 16,
    },
    bookDetails: {
      backgroundColor: "#A095D1",
      borderRadius: 2,
      padding: 12,
      marginBottom: 24,
    },
    bookDetailText: {
      fontSize: 14,
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
  });
  
  export default BookDetailsPage;
  