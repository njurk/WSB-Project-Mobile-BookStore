import * as React from "react";
import { View, Text, ScrollView, Pressable, TextInput, Image, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getResource } from "../../api/api-functions";
import type { Book, Genre } from "../../api/api-functions";
import { API_URL } from "../../api/api-connection";
import { useRouter } from "expo-router";

const BookCard = ({ book, onPress }: { book: Book; onPress: () => void }) => {
  return (
    <Pressable style={styles.bookCard} android_ripple={{ color: "#A095D1" }} onPress={onPress}>
      <Image source={{ uri: `${API_URL}/images/${book.imageUrl}` }} style={styles.bookImage} />
      <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.bookPrice}>
        ${book.price != null ? book.price.toFixed(2) : "0.00"}
      </Text>
      <View style={styles.bookActions}>
        <Pressable style={styles.iconButton} android_ripple={{ color: "#ccc" }}>
          <Ionicons name="cart-outline" size={22} color="#ffffff" />
        </Pressable>
        <Pressable style={styles.iconButton} android_ripple={{ color: "#ccc" }}>
          <Ionicons name="heart-outline" size={22} color="#ffffff" />
        </Pressable>
      </View>
    </Pressable>
  );
};

const GenreButton = ({ genre }: { genre: Genre }) => {
  return (
    <Pressable style={styles.genreButton} android_ripple={{ color: "#A095D1" }}>
      <Text style={styles.genreText}>{genre.name}</Text>
    </Pressable>
  );
};

const HomePage: React.FC = () => {
  const router = useRouter();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const books = await getResource<Book[]>("Book");
        setFeaturedBooks(books);
      } catch (error) {
        Alert.alert("Error", "Failed to load featured books.");
        console.error(error);
      }
    };

    const fetchGenres = async () => {
      try {
        const genresList = await getResource<Genre[]>("Genre");
        setGenres(genresList);
      } catch (error) {
        Alert.alert("Error", "Failed to load genres.");
        console.error(error);
      }
    };

    fetchFeaturedBooks();
    fetchGenres();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.logo}>BookStore</Text>
        <Pressable style={styles.iconButton} android_ripple={{ color: "#ccc" }}>
          <Ionicons name="cart-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search books..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Featured Books</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredBooks.map((book) => (
            <BookCard
              key={book.bookId}
              book={book}
              onPress={() =>
                router.push({
                  pathname: "/BookDetailsPage",
                  params: { id: book.bookId.toString() },
                })
              }
            />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Genres</Text>
        <View style={styles.genresContainer}>
          {genres.map((genre) => (
            <GenreButton key={genre.genreId} genre={genre} />
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
  genreButton: {
    backgroundColor: "#B5AFE0",
    borderRadius: 2,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginBottom: 2,
    marginRight: 8,
  },
  genreText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default HomePage;
