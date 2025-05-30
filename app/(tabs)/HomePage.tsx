import CarouselBookCard from "@/components/CarouselBookCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { Book, Genre } from "../../api/api-functions";
import {
  deleteCollection,
  getCollectionByUser,
  getResource,
  postCartItem,
  postCollection,
} from "../../api/api-functions";

const windowWidth = Dimensions.get("window").width;
const carouselItemWidth = windowWidth * 0.6;
const carouselItemMargin = 12;

const AUTO_SCROLL_INTERVAL = 4000;

const HomePage: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [savedBookIds, setSavedBookIds] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList<Book>>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.userId);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    const fetchFeaturedBooks = async () => {
      try {
        const books = await getResource<Book[]>("Book");
        setFeaturedBooks(books.slice(0, 10));
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

    loadUserId();
    fetchFeaturedBooks();
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserCollections = async () => {
      try {
        const collections = await getCollectionByUser(userId);
        const bookIds = new Set(collections.map((c) => c.bookId));
        setSavedBookIds(bookIds);
      } catch (error) {
        console.error("Failed to load user collections", error);
      }
    };

    fetchUserCollections();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      getCollectionByUser(userId).then((collections) => {
        setSavedBookIds(new Set(collections.map((c) => c.bookId)));
      }).catch(console.error);
    }, [userId])
  );

  useEffect(() => {
    if (featuredBooks.length === 0) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= featuredBooks.length) {
        nextIndex = 0;
      }
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true,
        viewPosition: 0.5,
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex, featuredBooks.length]);

  const handleToggleSave = useCallback(async (bookId: number, currentlySaved: boolean) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to save books.");
      return;
    }
    try {
      if (currentlySaved) {
        const collections = await getCollectionByUser(userId);
        const collection = collections.find((c) => c.bookId === bookId);
        if (collection) {
          await deleteCollection(collection.collectionId, userId);
          setSavedBookIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
          });
        }
      } else {
        const savedCollection = await postCollection({ userId, bookId });
        if (savedCollection) setSavedBookIds((prev) => new Set(prev).add(bookId));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update collection.");
    }
  }, [userId]);

  const handleAddToCart = useCallback(async (bookId: number) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to add to cart.");
      return;
    }
    try {
      const addedItem = await postCartItem({
        userId,
        bookId,
        quantity: 1,
      });
      if (addedItem) {
        Alert.alert("Added to Cart", "Book added to cart");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart.");
    }
  }, [userId]);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = useCallback(({ item }: { item: Book }) => (
    <CarouselBookCard
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
      style={{
        width: carouselItemWidth,
        marginHorizontal: carouselItemMargin,
      }}
    />
  ), [savedBookIds, handleToggleSave, handleAddToCart, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { backgroundColor: colors.card }]}>
        <Text style={[styles.logo, { color: colors.text }]}>BookStore</Text>
      </View>
      <View style={[styles.discountBanner, { backgroundColor: 'rgba(187, 134, 252, 0.1)' }]}>
        <Text style={[styles.discountText, { color: colors.primary }]}>
          Father's Day Special! Enjoy up to 30% off on all books with code SPECIAL30
        </Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FlatList
          ref={flatListRef}
          data={featuredBooks}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          snapToInterval={carouselItemWidth + carouselItemMargin * 2}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.bookId.toString()}
          contentContainerStyle={{ paddingHorizontal: carouselItemMargin }}
          renderItem={renderItem}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />

        <View style={styles.paginationContainer}>
          {featuredBooks.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
              ]}
            />
          ))}
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 30,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    alignSelf: "center",
    marginTop: 30,
  },
  discountBanner: {
    width: "100%",
    paddingVertical: 18,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  discountText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});

export default HomePage;
