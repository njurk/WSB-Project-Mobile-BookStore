import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL } from './api-connection';

export type ResourceId = string | number;

// GET
export async function getResource<T>(resource: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/${resource}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<T>;
}

// GET by ID
export async function getResourceById<T>(resource: string, id: ResourceId): Promise<T> {
  const response = await fetch(`${API_URL}/api/${resource}/${id}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<T>;
}

// POST
export async function createResource<T, U>(resource: string, data: T): Promise<U> {
  const response = await fetch(`${API_URL}/api/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<U>;
}

// PUT by ID
export async function updateResource<T, U>(resource: string, id: ResourceId, data: T): Promise<U> {
  const response = await fetch(`${API_URL}/api/${resource}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<U>;
}

// DELETE by ID
export async function deleteResource<U>(resource: string, id: ResourceId): Promise<U> {
  const response = await fetch(`${API_URL}/api/${resource}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<U>;
}

// user response type
export interface UserResponse {
  UserId: number;
  Email: string;
  Username: string;
}

// user register data type
export interface RegisterData {
  Email: string;
  Password: string;
  Username: string;
}

// register
export async function register(data: RegisterData): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/User`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json() as Promise<UserResponse>;
}

// Login
export interface LoginData {
  Identifier: string;
  Password: string;
}

export async function login(data: LoginData): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/User/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json() as Promise<UserResponse>;
}

export interface Genre {
  genreId: number;
  name: string;
}

export interface BookGenre {
  bookGenreId: number;
  bookId: number;
  genreId: number;
  genre: Genre;
}

export interface Author {
  authorId: number;
  firstName: string;
  lastName: string;
}

export interface Book {
  bookId: number;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  yearPublished: number;
  numberOfPages: number;
  language: string;
  isbn: string;
  bookGenre?: BookGenre[];
  author?: Author;
  review?: Review[];
  averageRating?: number;
}

// Collection
export interface Collection {
  collectionId: number;
  userId: number;
  bookId: number;
  book?: Book;
  user?: {
    userId: number;
    username?: string;
    email?: string;
  };
}

export async function getCollectionByUser(userId: number): Promise<Collection[]> {
  const response = await fetch(`${API_URL}/api/Collection?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch saved collections');
  }
  return response.json() as Promise<Collection[]>;
}

export async function getCollectionByUserAndBook(userId: number, bookId: number): Promise<Collection[]> {
  const response = await fetch(`${API_URL}/api/Collection?userId=${userId}&bookId=${bookId}`);
  if (!response.ok) return [];
  return response.json();
}

export async function postCollection(collection: { userId: number; bookId: number }): Promise<Collection | null> {
  const response = await fetch(`${API_URL}/api/Collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collection),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function deleteCollection(collectionId: number, userId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/Collection/${collectionId}?userId=${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error('Failed to delete collection');
}

// Cart
export interface CartItem {
  cartId: number;
  userId: number;
  bookId: number;
  quantity: number;
  book: {
    title: string;
    price: number;
    imageUrl: string;
  };
}

export interface CartCreate {
  userId: number;
  bookId: number;
  quantity: number;
}

export async function postCartItem(cartItem: CartCreate): Promise<CartItem | null> {
  const response = await fetch(`${API_URL}/api/Cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cartItem),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function getCartByUserId(userId: number): Promise<CartItem[]> {
  const response = await fetch(`${API_URL}/api/Cart?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
}

export async function deleteCartItem(cartId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/Cart/${cartId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete cart item");
}

export async function updateCartItemQuantity(cartId: number, quantity: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/Cart/${cartId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error("Failed to update quantity");
}

// User
export async function deleteUser(userId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/User/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete user account");
}

export interface UserPatchData {
  username?: string;
  email?: string;
  password?: string;
  street?: string;
  city?: string;
  postalCode?: string;
}

export async function patchUserCredentials(
  userId: number,
  data: UserPatchData,
  retries = 3
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/User/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    if (retries > 0) {
      return patchUserCredentials(userId, data, retries - 1);
    } else {
      throw error;
    }
  }
}

// Reviews
export interface Review {
  reviewId: number;
  bookId: number;
  userId: number;
  rating: number;
  comment: string;
  dateCreated: string;
  user?: { userId: number; username: string; email: string };
  book?: { bookId: number; title: string; imageUrl: string };
}

export interface ReviewCreate {
  bookId: number;
  userId: number;
  rating: number;
  comment: string;
}

export async function postReview(review: ReviewCreate): Promise<Review | null> {
  try {
    const response = await fetch(`${API_URL}/api/Review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!response.ok) {
      console.error("postReview failed:", response.status, await response.text());
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("postReview error:", error);
    return null;
  }
}

export async function getReviewsByUser(userId: number): Promise<Review[]> {
  const response = await fetch(`${API_URL}/api/Review/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
}

export async function deleteReview(reviewId: number): Promise<void> {
  const userJson = await AsyncStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.userId;

  if (!userId) {
    Alert.alert("Error", "User not logged in");
    return;
  }

  const response = await fetch(`${API_URL}/api/Review/${reviewId}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete review");
  }
}

export interface ReviewPatch {
  rating?: number;
  comment?: string;
}

export async function patchReview(reviewId: number, data: { rating?: number; comment?: string }) {
  const userJson = await AsyncStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.userId;

  const response = await fetch(`${API_URL}/api/Review/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, userId }),
  });
  if (!response.ok) throw new Error("Failed to update review");
  return await response.json();
}

export interface BookGenreDto {
  BookId: number;
  GenreId: number;
}

export function filterBooksByGenres(
  books: Book[],
  bookGenres: BookGenreDto[],
  selectedGenres: Set<number>,
  searchTerm: string
): Book[] {
  const lowerSearch = searchTerm.trim().toLowerCase();

  if (selectedGenres.size === 0) {
    return books.filter(book =>
      book.title.toLowerCase().includes(lowerSearch)
    );
  }

  return books.filter(book => {
    if (!book.title.toLowerCase().includes(lowerSearch)) return false;

    const genresForBook = new Set(
      bookGenres
        .filter(bg => bg.BookId === book.bookId)
        .map(bg => bg.GenreId)
    );

    console.log(`Book: ${book.title}`);
  console.log('Genres for book:', [...genresForBook]);
  console.log('Selected genres:', [...selectedGenres]);

    for (const genreId of selectedGenres) {
      if (genresForBook.has(genreId)) {
        return true; 
      }
    }

    return false;
  });
}
