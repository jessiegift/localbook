import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const RatingStars = ({ rating, size = 20, editable = false, onRatingChange }) => {
  // Ensure rating is between 0 and 5
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  const handleStarPress = (starValue) => {
    if (editable && onRatingChange) {
      onRatingChange(starValue);
    }
  };
  
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isSelected = i <= normalizedRating;
    const starEmoji = isSelected ? '⭐' : '☆';
    
    if (editable) {
      // Editable - wrap in TouchableOpacity
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          activeOpacity={0.7}
          style={{ marginRight: 4 }}
        >
          <Text style={{ fontSize: size }}>
            {starEmoji}
          </Text>
        </TouchableOpacity>
      );
    } else {
      // Display only
      stars.push(
        <Text 
          key={i} 
          style={{ 
            fontSize: size,
            color: isSelected ? '#fbbf24' : '#d1d5db',
            marginRight: 2,
          }}
        >
          {starEmoji}
        </Text>
      );
    }
  }
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {stars}
    </View>
  );
};

export default RatingStars;