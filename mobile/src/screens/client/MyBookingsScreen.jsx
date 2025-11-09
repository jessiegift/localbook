import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const MyBookingsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // API Base URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  // Re-fetch when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings?status=${activeTab}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const bookingsList = data.bookings || data.data || data || [];
        
        // Sort bookings by date and time
        const sortedBookings = bookingsList.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
        });

        setBookings(sortedBookings);
      } else {
        Alert.alert('Error', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Booking cancelled successfully');
        fetchBookings();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  // Check if appointment is happening now
  const isAppointmentNow = (booking) => {
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + (booking.duration || 60) * 60000);
    return currentTime >= appointmentDateTime && currentTime <= appointmentEndTime;
  };

  // Check if appointment is soon (within next 30 minutes)
  const isAppointmentSoon = (booking) => {
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = timeDiff / 60000;
    return minutesDiff > 0 && minutesDiff <= 30;
  };

  // Check if appointment is overdue
  const isOverdue = (booking) => {
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + (booking.duration || 60) * 60000);
    return currentTime > appointmentEndTime && booking.status?.toLowerCase() !== 'completed' && booking.status?.toLowerCase() !== 'cancelled';
  };

  // Format relative time
  const getRelativeTime = (booking) => {
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = Math.floor(timeDiff / 60000);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (isAppointmentNow(booking)) {
      return '🔴 Happening Now';
    } else if (isAppointmentSoon(booking)) {
      return `⏰ Starting in ${minutesDiff} min`;
    } else if (minutesDiff < 0 && Math.abs(minutesDiff) < 60) {
      return '⏱️ Started recently';
    } else if (daysDiff > 0) {
      return `📅 In ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
    } else if (hoursDiff > 0) {
      return `⏰ In ${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'}`;
    } else if (minutesDiff > 0) {
      return `⏰ In ${minutesDiff} minutes`;
    } else {
      return '✓ Past';
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✓',
        };
      case 'pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '⏳',
        };
      case 'cancelled':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '✗',
        };
      case 'completed':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '✓',
        };
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '•',
        };
    }
  };

  const renderBookingCard = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const appointmentNow = isAppointmentNow(item);
    const appointmentSoon = isAppointmentSoon(item);
    const overdueAppointment = isOverdue(item);

    return (
      <View className={`bg-white rounded-2xl p-4 mb-4 shadow-md border ${
        appointmentNow ? 'border-red-500 border-2' : 
        appointmentSoon ? 'border-orange-400 border-2' : 
        overdueAppointment ? 'border-gray-400 border-2' :
        'border-gray-100'
      }`}>
        {/* Status and Time Badge Row */}
        <View className="flex-row justify-between items-start mb-3">
          {/* Status Badge */}
          <View className={`${statusConfig.bgColor} ${statusConfig.borderColor} border px-3 py-1.5 rounded-full`}>
            <Text className={`${statusConfig.textColor} text-xs font-bold uppercase`}>
              {statusConfig.icon} {item.status}
            </Text>
          </View>

          {/* Live Time Indicator */}
          {activeTab === 'upcoming' && (
            <View className={`px-3 py-1.5 rounded-full ${
              appointmentNow ? 'bg-red-100' : 
              appointmentSoon ? 'bg-orange-100' : 
              'bg-blue-50'
            }`}>
              <Text className={`text-xs font-bold ${
                appointmentNow ? 'text-red-700' : 
                appointmentSoon ? 'text-orange-700' : 
                'text-blue-700'
              }`}>
                {getRelativeTime(item)}
              </Text>
            </View>
          )}
        </View>

        {/* Business Name */}
        <Text className="text-xl font-bold text-gray-900 mb-3">
          {item.businessName || 'Business Name'}
        </Text>

        {/* Service Info */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">💼</Text>
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {item.serviceName || 'Service'}
            </Text>
          </View>

          {/* Date & Time */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">📅</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🕐</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {item.time}
            </Text>
            {appointmentNow && (
              <View className="ml-2 bg-red-500 px-2 py-0.5 rounded">
                <Text className="text-white text-xs font-bold">LIVE</Text>
              </View>
            )}
          </View>

          {/* Duration & Price */}
          <View className="flex-row justify-between mt-1">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">⏱️</Text>
              <Text className="text-sm text-gray-600">
                {item.duration || 60} min
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">💰</Text>
              <Text className="text-lg font-bold text-blue-600">
                ${item.price || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Overdue Warning */}
        {overdueAppointment && (
          <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <Text className="text-orange-800 text-sm font-semibold">
              ⚠️ This appointment has passed. Please update the status.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {activeTab === 'upcoming' && item.status?.toLowerCase() !== 'cancelled' && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="bg-white border-2 border-red-500 py-3 rounded-xl active:bg-red-50"
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text className="text-red-600 text-center text-base font-bold">
                Cancel Booking
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'past' && item.status?.toLowerCase() === 'completed' && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-xl active:bg-blue-700"
              onPress={() =>
                navigation.navigate('WriteReview', {
                  bookingId: item.id,
                  businessId: item.businessId,
                })
              }
            >
              <Text className="text-white text-center text-base font-bold">
                ⭐ Write Review
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="items-center justify-center py-20 px-8">
      <Text className="text-6xl mb-4">
        {activeTab === 'upcoming' ? '📅' : '📋'}
      </Text>
      <Text className="text-xl font-bold text-gray-700 mb-2 text-center">
        {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        {activeTab === 'upcoming'
          ? 'Book a service to get started'
          : 'Your completed bookings will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-full"
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="text-white font-bold">Browse Services</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with current time */}
      <View className="bg-white pt-12 pb-3 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          My Bookings
        </Text>
        <Text className="text-sm text-gray-500">
          {currentTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-4 border-b-2 ${
            activeTab === 'upcoming' ? 'border-blue-600' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text className={`text-center text-base font-bold ${
            activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 border-b-2 ${
            activeTab === 'past' ? 'border-blue-600' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('past')}
        >
          <Text className={`text-center text-base font-bold ${
            activeTab === 'past' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};


export default MyBookingsScreen;