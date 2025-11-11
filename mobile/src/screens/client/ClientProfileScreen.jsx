import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ClientProfileScreen = function(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  const authLoading = authContext.loading;
  const logout = authContext.logout;
  const API_BASE_URL = authContext.API_BASE_URL;

  const bookingsState = useState([]);
  const bookings = bookingsState[0];
  const setBookings = bookingsState[1];

  const loadingBookingsState = useState(false);
  const loadingBookings = loadingBookingsState[0];
  const setLoadingBookings = loadingBookingsState[1];

  const errorState = useState(null);
  const error = errorState[0];
  const setError = errorState[1];

  useEffect(function() {
    const hasUser = user !== null && user !== undefined;
    if (hasUser === true) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async function() {
    const hasUser = user !== null && user !== undefined;
    if (hasUser === false) {
      return;
    }

    setLoadingBookings(true);
    setError(null);

    try {
      let baseUrl = 'http://192.168.1.15:8080/api';
      const hasAPIBaseURL = API_BASE_URL !== null && API_BASE_URL !== undefined;
      if (hasAPIBaseURL === true) {
        baseUrl = API_BASE_URL;
      }

      const userId = user.id;
      const userIdString = userId.toString();
      const url = baseUrl + '/appointments/user/' + userIdString;

      const headers = {
        'Content-Type': 'application/json',
      };

      const hasToken = token !== null && token !== undefined;
      if (hasToken === true) {
        const authHeader = 'Bearer ' + token;
        headers.Authorization = authHeader;
      }

      const requestOptions = {
        method: 'GET',
        headers: headers,
      };

      const response = await fetch(url, requestOptions);
      const isResponseOk = response.ok;

      if (isResponseOk === false) {
        const errorText = await response.text();
        let errorMessage = 'Failed to load bookings';
        const hasErrorText = errorText !== null && errorText !== undefined && errorText.length > 0;
        if (hasErrorText === true) {
          errorMessage = errorText;
        } else {
          const statusCode = response.status;
          const statusString = statusCode.toString();
          errorMessage = 'Status ' + statusString;
        }
        const error = new Error(errorMessage);
        throw error;
      }

      const data = await response.json();
      const isArray = Array.isArray(data);
      
      let bookingsList = [];
      if (isArray === true) {
        bookingsList = data;
      } else {
        const hasBookingsProperty = data.bookings !== null && data.bookings !== undefined;
        if (hasBookingsProperty === true) {
          bookingsList = data.bookings;
        } else {
          bookingsList = [];
        }
      }

      setBookings(bookingsList);
    } catch (errorObject) {
      console.warn('Load bookings error:', errorObject);
      setError('Could not load bookings. Please check your connection.');
      const emptyArray = [];
      setBookings(emptyArray);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = function() {
    const alertButtons = [
      { 
        text: 'Cancel', 
        style: 'cancel' 
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async function() {
          try {
            await logout();
          } catch (errorObject) {
            console.warn('Logout error', errorObject);
          }
        },
      },
    ];

    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', alertButtons);
  };

  const handleEditProfile = function() {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleViewBooking = function(booking) {
    const bookingId = booking.id;
    let bookingIdString = 'N/A';
    const hasBookingId = bookingId !== null && bookingId !== undefined;
    if (hasBookingId === true) {
      bookingIdString = bookingId.toString();
    }
    
    const alertMessage = 'Booking ID: ' + bookingIdString;
    Alert.alert('Booking Details', alertMessage);
  };

  const renderBooking = function(renderProps) {
    const item = renderProps.item;

    let businessName = 'Business';
    const hasBusiness = item.business !== null && item.business !== undefined;
    if (hasBusiness === true) {
      const hasBusinessName = item.business.businessName !== null && item.business.businessName !== undefined;
      if (hasBusinessName === true) {
        businessName = item.business.businessName;
      }
    }

    let serviceName = 'Service';
    const hasService = item.service !== null && item.service !== undefined;
    if (hasService === true) {
      const hasServiceName = item.service.serviceName !== null && item.service.serviceName !== undefined;
      if (hasServiceName === true) {
        serviceName = item.service.serviceName;
      }
    }

    const appointmentDateTimeString = item.appointmentDateTime;
    const appointmentDate = new Date(appointmentDateTimeString);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const status = item.status;
    let statusBgColor = 'bg-blue-100';
    let statusTextColor = 'text-blue-800';

    const isConfirmed = status === 'CONFIRMED';
    const isCancelled = status === 'CANCELLED';
    const isCompleted = status === 'COMPLETED';

    if (isConfirmed === true) {
      statusBgColor = 'bg-green-100';
      statusTextColor = 'text-green-800';
    } else if (isCancelled === true) {
      statusBgColor = 'bg-red-100';
      statusTextColor = 'text-red-800';
    } else if (isCompleted === true) {
      statusBgColor = 'bg-blue-100';
      statusTextColor = 'text-blue-800';
    }

    const statusBadgeClassName = statusBgColor + ' px-2 py-1 rounded-full';
    const statusTextClassName = statusTextColor + ' text-xs font-bold uppercase';

    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {businessName}
            </Text>
            <Text className="text-sm text-gray-600">
              {serviceName}
            </Text>
          </View>
          <View className={statusBadgeClassName}>
            <Text className={statusTextClassName}>
              {status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <Text className="text-sm text-gray-700 mr-4">
            📅 {formattedDate}
          </Text>
          <Text className="text-sm text-gray-700">
            🕐 {formattedTime}
          </Text>
        </View>

        <TouchableOpacity
          className="mt-3 bg-blue-500 py-2 rounded-lg active:bg-blue-600"
          onPress={function() {
            handleViewBooking(item);
          }}
          activeOpacity={0.7}
        >
          <Text className="text-white text-center font-semibold">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyBookings = function() {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-6xl mb-4">📅</Text>
        <Text className="text-xl font-bold text-gray-700 mb-2">
          No bookings yet
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          Your appointment bookings will appear here
        </Text>
      </View>
    );
  };

  if (authLoading === true) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  const hasUser = user !== null && user !== undefined;
  if (hasUser === false) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Text className="text-6xl mb-4">👤</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Not Signed In
        </Text>
        <Text className="text-base text-gray-600 text-center">
          Please log in to see your profile and bookings
        </Text>
      </View>
    );
  }

  const userName = user.name;
  const userEmail = user.email;
  
  let displayName = 'No name';
  const hasUserName = userName !== null && userName !== undefined;
  if (hasUserName === true) {
    displayName = userName;
  }

  let displayEmail = 'No email';
  const hasUserEmail = userEmail !== null && userEmail !== undefined;
  if (hasUserEmail === true) {
    displayEmail = userEmail;
  }

  const userInitials = (function() {
    const hasName = userName !== null && userName !== undefined && userName.length > 0;
    if (hasName === true) {
      const nameParts = userName.split(' ');
      const firstPart = nameParts[0];
      const firstLetter = firstPart.charAt(0);
      const upperFirstLetter = firstLetter.toUpperCase();
      
      const hasMultipleParts = nameParts.length > 1;
      if (hasMultipleParts === true) {
        const lastPart = nameParts[nameParts.length - 1];
        const lastLetter = lastPart.charAt(0);
        const upperLastLetter = lastLetter.toUpperCase();
        return upperFirstLetter + upperLastLetter;
      }
      
      return upperFirstLetter;
    }
    return '?';
  })();

  const bookingsCount = bookings.length;
  const bookingsCountString = bookingsCount.toString();

  const hasError = error !== null && error !== undefined;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-blue-500 pt-12 pb-8 px-5">
          <View className="flex-row justify-between items-start mb-6">
            <Text className="text-white text-2xl font-bold">
              My Profile
            </Text>
            <TouchableOpacity
              className="bg-white/20 px-4 py-2 rounded-lg active:bg-white/30"
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white/10 rounded-2xl p-6">
            <View className="items-center mb-4">
              <View className="bg-white w-24 h-24 rounded-full items-center justify-center mb-3">
                <Text className="text-blue-500 text-3xl font-bold">
                  {userInitials}
                </Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1">
                {displayName}
              </Text>
              <Text className="text-white/80 text-sm">
                {displayEmail}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-white/20 py-3 rounded-lg active:bg-white/30 mt-2"
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                My Bookings
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {bookingsCountString} total bookings
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg active:bg-blue-600"
              onPress={loadBookings}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {loadingBookings === true ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-4 text-gray-600">Loading bookings...</Text>
            </View>
          ) : hasError === true ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-6 items-center">
              <Text className="text-red-800 text-center mb-3">
                {error}
              </Text>
              <TouchableOpacity
                className="bg-red-500 px-6 py-2 rounded-lg active:bg-red-600"
                onPress={loadBookings}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : bookingsCount === 0 ? (
            renderEmptyBookings()
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={function(item) {
                const itemId = item.id;
                const hasItemId = itemId !== null && itemId !== undefined;
                if (hasItemId === true) {
                  const itemIdString = itemId.toString();
                  return itemIdString;
                }
                return '';
              }}
              renderItem={renderBooking}
              scrollEnabled={false}
            />
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default ClientProfileScreen;