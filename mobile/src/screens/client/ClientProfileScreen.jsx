import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

/**
 * Beginner-friendly ClientProfile screen for LocalBook.
 *
 * What this file does (simple, step-by-step):
 * - Reads the current user from AuthContext (useAuth).
 * - Shows basic user info: name and email.
 * - Loads the user's bookings from the backend when the screen mounts.
 * - Shows a loading spinner while bookings load.
 * - Shows a simple list of bookings (business name + date).
 * - Has a Logout button that calls logout() from AuthContext.
 *
 * How to use:
 * - Save this file to: mobile/src/screens/client/ClientProfile.jsx
 * - Make sure AuthProvider wraps your app (in App.js).
 * - Add a route to your navigator that points to "ClientProfile" and uses this component.
 *
 * Notes for beginners:
 * - This code keeps things explicit and small. It avoids advanced hooks and helpers.
 * - Adjust API paths to match your backend. If your backend is not running, the bookings fetch will show an error message.
 */

export default function ClientProfileScreen() {
  const { user, token, loading: authLoading, logout, API_BASE_URL } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState(null);

  // Load bookings when component mounts
  useEffect(() => {
    if (user) {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Simple fetch function. Beginners: keep it explicit so you can read each step.
  const loadBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    setError(null);

    try {
      // Build the URL. Many backends expect a path like /api/bookings?userId=...
      // If your AuthContext exports API_BASE_URL, use it. Otherwise replace with your URL.
      const base = API_BASE_URL || 'http://192.168.1.15:8080/api';
      const url = `${base}/bookings?userId=${user.id}`;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { method: 'GET', headers });
      if (!res.ok) {
        // simple error path
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      // Parse JSON response (assumes array or { bookings: [] })
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.bookings || [];
      setBookings(list);
    } catch (e) {
      console.warn('Load bookings error:', e);
      setError('Could not load bookings. Check your backend or network.');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm logout', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.warn('Logout error', e);
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }) => {
    // Display simple booking info. Adjust fields to match your API.
    const business = item.businessName || item.business || 'Business';
    const datetime = item.datetime || item.date || item.createdAt || 'No date';
    return (
      <View style={styles.bookingCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingBusiness}>{business}</Text>
          <Text style={styles.bookingDate}>{String(datetime)}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => {
            // Beginner: navigate to details if you have a route named "BusinessDetails"
            // Replace this with navigation.navigate('BusinessDetails', { businessId: item.businessId })
            Alert.alert('Booking', `Open details for booking id: ${item.id || 'N/A'}`);
          }}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show spinner while AuthContext is still restoring user
  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
      </View>
    );
  }

  // If no user, ask them to log in
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>You are not signed in</Text>
        <Text style={styles.emptyText}>Please log in to see your profile and bookings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name || 'No name'}</Text>
          <Text style={styles.email}>{user.email || 'No email'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings area */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Bookings</Text>
        <TouchableOpacity onPress={loadBookings}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loadingBookings ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadBookings}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Make a booking from the business list.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => String(b.id)}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#222' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },

  logoutBtn: { backgroundColor: '#e74c3c', padding: 10, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  refreshText: { color: '#007AFF', fontWeight: '600' },

  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#f7f7fb',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  bookingBusiness: { fontSize: 16, fontWeight: '700' },
  bookingDate: { fontSize: 13, color: '#555', marginTop: 4 },

  viewBtn: { backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  viewBtnText: { color: '#fff', fontWeight: '600' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyText: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },

  errorText: { color: '#dc3545', textAlign: 'center' },
  retryBtn: { marginTop: 8, backgroundColor: '#007AFF', padding: 8, borderRadius: 6 },
  retryText: { color: '#fff' },
});