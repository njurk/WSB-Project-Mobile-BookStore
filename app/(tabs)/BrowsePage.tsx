import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Book, BookGenreDto, Genre, deleteCollection, filterBooksByGenres, getCollectionByUser, getResource, postCartItem, postCollection } from "../../api/api-functions";
import BookCard from "../../components/BookCard";

const windowWidth = Dimensions.get("window").width;
const cardMargin = 12;
const numColumns = 2;
const cardWidth = (windowWidth - cardMargin * (numColumns + 1)) / numColumns;

const GenreButton = ({
  genre,
  selected,
  onPress,
}: {
  genre: Genre;
  selected: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.genreButton,
        { 
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.text,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text style={[styles.genreText, { color: selected ? "#000" : colors.text }]}>
        {genre.name}
      </Text>
    </Pressable>
  );
};

const BrowsePage: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const [userId, setUserId] = React.useState<number | null>(null);
  const [savedBookIds, setSavedBookIds] = React.useState<Set<number>>(new Set());
  const [books, setBooks] = React.useState<Book[]>([]);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [bookGenres, setBookGenres] = React.useState<BookGenreDto[]>([]);
  const [selectedGenres, setSelectedGenres] = React.useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    AsyncStorage.getItem("user").then(userJson => {
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.userId);
      }
    }).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    getCollectionByUser(userId).then(collections => {
      setSavedBookIds(new Set(collections.map(c => c.bookId)));
    }).catch(console.error);
  }, [userId]);

  React.useEffect(() => {
    getResource<Book[]>("Book").then(setBooks).catch(() => Alert.alert("Error", "Failed to load books."));
    getResource<Genre[]>("Genre").then(setGenres).catch(() => Alert.alert("Error", "Failed to load genres."));
    getResource<BookGenreDto[]>("BookGenre")
      .then(setBookGenres)
      .catch(() => Alert.alert("Error", "Failed to load book genres."));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;
      getCollectionByUser(userId).then(collections => {
        setSavedBookIds(new Set(collections.map(c => c.bookId)));
      }).catch(console.error);
    }, [userId])
  );

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => {
      const newSet = new Set(prev);
      if (newSet.has(genreId)) newSet.delete(genreId);
      else newSet.add(genreId);
      console.log("Selected genres:", [...newSet]);
      return newSet;
    });
  };

  const selectedGenresArray = React.useMemo(() => {
    return Array.from(selectedGenres).sort((a, b) => a - b);
  }, [selectedGenres]);

  const filteredBooks = React.useMemo(() => {
    console.log("Filtering books with selectedGenres:", selectedGenresArray);
    return filterBooksByGenres(books, bookGenres, selectedGenres, searchTerm);
  }, [books, bookGenres, searchTerm, selectedGenresArray.join(",")]);


  const handleToggleSave = async (bookId: number, currentlySaved: boolean) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to save books.");
      return;
    }
    try {
      if (currentlySaved) {
        const collections = await getCollectionByUser(userId);
        const collection = collections.find(c => c.bookId === bookId);
        if (collection) {
          await deleteCollection(collection.collectionId, userId);
          setSavedBookIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
          });
        }
      } else {
        const savedCollection = await postCollection({ userId, bookId });
        if (savedCollection) setSavedBookIds(prev => new Set(prev).add(bookId));
      }
    } catch {
      Alert.alert("Error", "Failed to update collection.");
    }
  };

  const handleAddToCart = async (bookId: number) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to add to cart.");
      return;
    }
    try {
      const addedItem = await postCartItem({ userId, bookId, quantity: 1 });
      if (addedItem) Alert.alert("Added to Cart", "Book added to cart");
    } catch {
      Alert.alert("Error", "Failed to add to cart.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { backgroundColor: colors.card }]}>
        <Text style={[styles.logo, { color: colors.text }]}>Browse</Text>
      </View>

      <View style={[styles.searchBar]}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          placeholder="Search books..."
          placeholderTextColor={colors.text + "99"}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.genresHorizontalContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genresScrollContent}
        >
          {genres.map(genre => (
            <GenreButton
              key={genre.genreId}
              genre={genre}
              selected={selectedGenres.has(genre.genreId)}
              onPress={() => toggleGenre(genre.genreId)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: cardMargin }}>
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.bookId.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              saved={savedBookIds.has(item.bookId)}
              onToggleSave={handleToggleSave}
              onAddToCart={handleAddToCart}
              onPress={() =>
                router.push({
                  pathname: "/BookDetailsPage",
                  params: { id: item.bookId.toString() },
                })
              }
              style={{ width: cardWidth, marginBottom: 24 }}
            />
          )}
          ListEmptyComponent={<Text style={[styles.noResultsText, { color: colors.text }]}>No books found.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: 16,
  },
  logo: { fontSize: 28, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 2,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  genresHorizontalContainer: { marginTop: 16, height: 50 },
  genresScrollContent: { paddingHorizontal: 16, alignItems: "center" },
  genreButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  genreText: { fontSize: 16, fontWeight: "600" },
  noResultsText: { fontSize: 16, textAlign: "center", marginTop: 32 },
});

export default BrowsePage;
