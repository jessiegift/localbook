import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const MyBookingsScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const fetchBookings = async () => {
    try {
      console.log('📥 Fetching bookings for user:', user?.id);
      console.log('🔗 API URL:', `${API_BASE_URL}/appointments/client/${user?.id}`);

      if (!user?.id) {
        console.log('❌ No user ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments/client/${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bookings received:', data);

        const now = new Date();
        const filteredBookings = data.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDateTime);
          
          if (activeTab === 'upcoming') {
            // Upcoming: future appointments that are CONFIRMED
            return appointmentDate >= now && appointment.status === 'CONFIRMED';
          } else {
            // Past: past appointments or COMPLETED/CANCELLED
            return appointmentDate < now || 
                   appointment.status === 'CANCELLED' || 
                   appointment.status === 'COMPLETED';
          }
        });

        const sortedBookings = filteredBookings.sort((a, b) => {
          const dateA = new Date(a.appointmentDateTime);
          const dateB = new Date(b.appointmentDateTime);
          return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
        });

        console.log(`📋 ${activeTab} bookings:`, sortedBookings.length);
        setBookings(sortedBookings);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch bookings:', errorText);
        Alert.alert('Error', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
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
        { text: 'No', style: 'cancel' },
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
      console.log('🗑️ Cancelling booking:', bookingId);

      const response = await fetch(
        `${API_BASE_URL}/appointments/${bookingId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('✅ Booking cancelled');
        Alert.alert('Success', 'Booking cancelled successfully');
        fetchBookings();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to cancel:', errorText);
        Alert.alert('Error', 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const isAppointmentNow = (booking) => {
    const appointmentDateTime = new Date(booking.appointmentDateTime);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 60 * 60000);
    return currentTime >= appointmentDateTime && currentTime <= appointmentEndTime;
  };

  const isAppointmentSoon = (booking) => {
    const appointmentDateTime = new Date(booking.appointmentDateTime);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = timeDiff / 60000;
    return minutesDiff > 0 && minutesDiff <= 30;
  };

  const getRelativeTime = (booking) => {
    const appointmentDateTime = new Date(booking.appointmentDateTime);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = Math.floor(timeDiff / 60000);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (isAppointmentNow(booking)) {
      return '🔴 Happening Now';
    } else if (isAppointmentSoon(booking)) {
      return `⏰ Starting in ${minutesDiff} min`;
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
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✓',
          label: 'CONFIRMED'
        };
      case 'CANCELLED':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '✗',
          label: 'CANCELLED'
        };
      case 'COMPLETED':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '✓',
          label: 'COMPLETED'
        };
      case 'NO_SHOW':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '⊘',
          label: 'NO SHOW'
        };
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '•',
          label: status || 'UNKNOWN'
        };
    }
  };

  const renderBookingCard = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const appointmentNow = isAppointmentNow(item);
    const appointmentSoon = isAppointmentSoon(item);
    const appointmentDate = new Date(item.appointmentDateTime);

    return (
      <View className={`bg-white rounded-2xl p-4 mb-4 shadow-md border-2 ${
        appointmentNow ? 'border-red-500' : 
        appointmentSoon ? 'border-orange-400' : 
        statusConfig.borderColor
      }`}>
        {/* Status Badge and Time Indicator */}
        <View className="flex-row justify-between items-start mb-3">
          <View className={`${statusConfig.bgColor} px-3 py-1.5 rounded-full border ${statusConfig.borderColor}`}>
            <Text className={`${statusConfig.textColor} text-xs font-bold uppercase`}>
              {statusConfig.icon} {statusConfig.label}
            </Text>
          </View>

          {activeTab === 'upcoming' && item.status === 'CONFIRMED' && (
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
          {item.business?.businessName || 'Business'}
        </Text>

        {/* Service Info Card */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">💼</Text>
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {item.service?.serviceName || 'Service'}
            </Text>
          </View>

          {/* Date */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">📅</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Time */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🕐</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
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
                {item.service?.durationMinutes || 60} min
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">💰</Text>
              <Text className="text-lg font-bold text-blue-600">
                €{item.service?.price?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <View className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
            <Text className="text-xs text-blue-900 font-semibold mb-1">
              📝 Notes:
            </Text>
            <Text className="text-sm text-gray-700">
              {item.notes}
            </Text>
          </View>
        )}

        {/* Cancel Button - Only for upcoming confirmed appointments */}
        {activeTab === 'upcoming' && item.status === 'CONFIRMED' && (
          <TouchableOpacity
            className="bg-white border-2 border-red-500 py-3 rounded-xl mt-2 active:bg-red-50"
            onPress={() => handleCancelBooking(item.id)}
          >
            <Text className="text-red-600 text-center text-base font-bold">
              Cancel Booking
            </Text>
          </TouchableOpacity>
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
          ? 'Your confirmed appointments will appear here'
          : 'Your completed bookings will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700"
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="text-white font-bold">Browse Services</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-3 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          My Bookings
        </Text>
        <Text className="text-sm text-gray-500">
          {currentTime.toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
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
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ padding: 16 }}
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