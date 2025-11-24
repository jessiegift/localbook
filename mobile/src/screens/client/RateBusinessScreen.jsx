import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import RatingStars from '../../Components/RatingStars';

const RateBusinessScreen = ({ route, navigation }) => {
  const { businessId, businessName, appointmentId, userId } = route.params;
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

 
const handleSubmitRating = async () => {
  // Validation
  if (rating === 0) {
    Alert.alert('Rating Required', 'Please select a star rating');
    return;
  }

  if (review.trim().length > 0 && review.trim().length < 10) {
    Alert.alert('Review Too Short', 'Please write at least 10 characters or leave it empty');
    return;
  }

  setLoading(true);

  try {
    console.log('📝 Submitting rating...');
    console.log('User ID:', userId);
    console.log('Business ID:', businessId);
    console.log('Appointment ID:', appointmentId);
    console.log('Rating:', rating);
    console.log('Review:', review);

    // ✅ BUILD URL WITH ALL QUERY PARAMETERS
    const reviewText = review.trim() || '';
    const encodedReview = encodeURIComponent(reviewText);
    
    const url = `${API_BASE_URL}/ratings?userId=${userId}&businessId=${businessId}&appointmentId=${appointmentId}&rating=${rating}${reviewText ? `&review=${encodedReview}` : ''}`;
    
    console.log('📤 Request URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // ❌ NO BODY - all parameters in URL
    });

    console.log('📥 Response Status:', response.status);

    if (response.ok) {
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
        console.log('✅ Rating submitted:', data);
      } catch (e) {
        console.log('✅ Rating submitted successfully (no JSON response)');
      }

      Alert.alert(
        'Thank You!',
        'Your review has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      let errorMessage = 'Failed to submit rating. Please try again.';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    Alert.alert(
      'Error',
      'Network error. Please check your connection and try again.'
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.businessName}>{businessName}</Text>

        {/* Star Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.label}>How was your experience?</Text>
          <RatingStars
            rating={rating}
            onRatingChange={setRating}
            size={50}
            editable={true}
          />
          <Text style={styles.ratingText}>
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </Text>
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.label}>Write a review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{review.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  businessName: {
    fontSize: 18,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  ratingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 12,
  },
  reviewSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    color: '#111827',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateBusinessScreen;