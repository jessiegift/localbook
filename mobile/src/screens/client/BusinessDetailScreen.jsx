import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BusinessDetailScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const { token } = useAuth(); // still okay to keep if you’ll use later
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${businessId}`
      );

      const data = await response.json();

      if (response.ok) {
        setBusiness(data.business || data);
      } else {
        Alert.alert('Error', 'Failed to load business details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigation.navigate('BookAppointment', { business });
  };

  const renderService = (service) => (
    <View key={service.id} style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDuration}>{service.duration} min</Text>
      </View>
      <Text style={styles.servicePrice}>${service.price}</Text>
    </View>
  );

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.userName}</Text>
        <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Business not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business Image */}
        <Image
          source={{ uri: business.image || 'https://via.placeholder.com/400' }}
          style={styles.headerImage}
        />

        {/* Business Info */}
        <View style={styles.content}>
          {/* Name and Category */}
          <Text style={styles.name}>{business.name}</Text>
          <Text style={styles.category}>{business.category}</Text>

          {/* Rating */}
          {business.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {business.rating}</Text>
              <Text style={styles.reviewCount}>
                ({business.reviewCount || 0} reviews)
              </Text>
            </View>
          )}

          {/* Location */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>📍 Location</Text>
            <Text style={styles.infoText}>
              {business.address || business.location}
            </Text>
          </View>

          {/* Contact */}
          {business.phone && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>📞 Phone</Text>
              <Text style={styles.infoText}>{business.phone}</Text>
            </View>
          )}

          {/* Hours */}
          {business.hours && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>🕒 Hours</Text>
              <Text style={styles.infoText}>{business.hours}</Text>
            </View>
          )}

          {/* Description */}
          {business.description && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.description}>{business.description}</Text>
            </View>
          )}

          {/* Services */}
          {business.services && business.services.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              {business.services.map(renderService)}
            </View>
          )}

          {/* Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {business.reviews.map(renderReview)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#666' },
  headerImage: { width: '100%', height: 250, backgroundColor: '#f0f0f0' },
  content: { padding: 20, paddingBottom: 100 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  category: { fontSize: 16, color: '#007AFF', fontWeight: '600', marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rating: { fontSize: 16, fontWeight: '600', color: '#333', marginRight: 6 },
  reviewCount: { fontSize: 14, color: '#999' },
  infoSection: { marginBottom: 16 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  infoText: { fontSize: 16, color: '#333' },
  description: { fontSize: 15, color: '#333', lineHeight: 22 },
  section: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  serviceDuration: { fontSize: 14, color: '#999' },
  servicePrice: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  reviewItem: { marginBottom: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { fontSize: 15, fontWeight: '600', color: '#333' },
  reviewRating: { fontSize: 14, fontWeight: '600', color: '#333' },
  reviewComment: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: '#999' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  bookButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default BusinessDetailScreen;
