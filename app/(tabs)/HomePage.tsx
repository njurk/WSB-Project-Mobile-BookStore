import * as React from "react";
import { View, Text, ScrollView, Pressable, TextInput, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const featuredBooks = [
  { id: 1, title: "The Great Gatsby", image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg", price: 9.99 },
  { id: 2, title: "To Kill a Mockingbird", image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg", price: 12.49 },
  { id: 3, title: "1984", image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg", price: 8.75 },
  { id: 4, title: "Pride and Prejudice", image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg", price: 7.20 },
];

const genres = ["Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy", "Biography"];

const HomePage: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>BookStore</Text>
        <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
          <Ionicons name="cart-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search books..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Featured Books */}
        <Text style={styles.sectionTitle}>Featured Books</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredBooks.map((book) => (
            <Pressable
              key={book.id}
              style={({ pressed }) => [
                styles.bookCard,
                pressed && { backgroundColor: "#A095D1" },
              ]}
            >
              <Image source={{ uri: book.image }} style={styles.bookImage} />

              {/* Book Info */}
              <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.bookPrice}>${book.price.toFixed(2)}</Text>

              {/* Action Buttons Inside Pressable */}
              <View style={styles.bookActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <Ionicons name="cart-outline" size={22} color="#ffffff" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <Ionicons name="heart-outline" size={22} color="#ffffff" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Genres */}
        <Text style={styles.sectionTitle}>Genres</Text>
        <View style={styles.genresContainer}>
          {genres.map((genre, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.genreButton,
                pressed && { backgroundColor: "#A095D1" },
              ]}
            >
              <Text style={styles.genreText}>{genre}</Text>
            </Pressable>
          ))}
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#786EB9",
  },
  logo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: 50,
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginVertical: 16,
  },
  featuredScroll: {
    marginBottom: 24,
  },
  bookCard: {
    width: 120,
    marginRight: 16,
    alignItems: "center",
    backgroundColor: "#786EB9",
    borderRadius: 8,
    padding: 8,
  },
  bookImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreButton: {
    backgroundColor: "#B5AFE0",
    borderRadius: 2,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginBottom: 2,
  },
  genreText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  bookPrice: {
    fontSize: 14,
    color: "#ffffff",
    marginBlock: 4,
  },
  bookActions: {
    flexDirection: "row",
    justifyContent: "center",
    width: "60%",
    marginTop: "auto",
  },
});

export default HomePage;
