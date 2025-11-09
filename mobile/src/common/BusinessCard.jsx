import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const BusinessCard = ({ business, userLocation, onPress }) => {
  // Calculate distance if user location is available
  const distance = userLocation && business.lat && business.lng
    ? calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng)
    : null;

  return (
    <TouchableOpacity 
      onPress={() => onPress(business)}
      className="bg-white rounded-lg mb-3 overflow-hidden active:opacity-70"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {/* Image - Only show if business has image */}
      {business.imageUrl ? (
        <Image
          source={{ uri: business.imageUrl }}
          className="w-full h-36 bg-gray-200"
          resizeMode="cover"
        />
      ) : (
        /* Fallback gradient background if no image */
        <View className="w-full h-36 bg-gradient-to-br from-purple-400 to-blue-500 items-center justify-center">
          <Text className="text-6xl">{getCategoryIcon(business.category)}</Text>
        </View>
      )}

      {/* Category Badge - Top right corner */}
      <View className="absolute top-2 right-2 bg-blue-500/90 px-2 py-0.5 rounded">
        <Text className="text-white text-xs font-bold uppercase">
          {business.category}
        </Text>
      </View>

      {/* Info - Compact layout */}
      <View className="p-2.5">
        {/* Business Name */}
       <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={1}>
  {business.businessName || business.name}
</Text>


        {/* Location & Distance */}
        <View className="flex-row items-center mb-1.5">
          <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
            📍 {business.address || business.location}, Carlow
          </Text>
          {distance && (
            <Text className="text-xs font-semibold text-blue-600 ml-2">
              🚶 {distance} km
            </Text>
          )}
        </View>

        {/* Bottom Row - Rating & Status */}
        <View className="flex-row justify-between items-center">
          {/* Rating */}
          <View className="flex-row items-center">
            <Text className="text-xs mr-0.5">⭐</Text>
            <Text className="text-xs font-bold text-gray-900 mr-1">
              {business.rating || '4.5'}
            </Text>
            <Text className="text-xs text-gray-500">
              ({business.reviewCount || 0})
            </Text>
          </View>

          {/* Business Status Indicator */}
          {business.status === 'ACTIVE' && (
            <View className="bg-green-100 px-2 py-0.5 rounded">
              <Text className="text-xs text-green-700 font-semibold">Open</Text>
            </View>
          )}
        </View>

        {/* Phone number if available */}
        {business.phoneNumber && (
          <Text className="text-xs text-gray-500 mt-1">
            📞 {business.phoneNumber}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance.toFixed(1);
};

// Get emoji icon for category
const getCategoryIcon = (category) => {
  const icons = {
    'Hair': '💇',
    'Hair Salon': '💇',
    'Salon': '💇',

    'Beauty': '💅',
    'Beauty Salon': '💅',
    'Spa': '💆',
    'Barber': '✂️',
    
  };
  
  return icons[category] || '🏪';
};


export default BusinessCard;