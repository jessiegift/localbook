import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';

const MyBookingsScreen = function(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  
  const activeTabState = useState('upcoming');
  const activeTab = activeTabState[0];
  const setActiveTab = activeTabState[1];
  
  const bookingsState = useState([]);
  const bookings = bookingsState[0];
  const setBookings = bookingsState[1];
  
  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];
  
  const refreshingState = useState(false);
  const refreshing = refreshingState[0];
  const setRefreshing = refreshingState[1];
  
  const currentTimeState = useState(new Date());
  const currentTime = currentTimeState[0];
  const setCurrentTime = currentTimeState[1];
  
  const showRescheduleModalState = useState(false);
  const showRescheduleModal = showRescheduleModalState[0];
  const setShowRescheduleModal = showRescheduleModalState[1];
  
  const selectedBookingState = useState(null);
  const selectedBooking = selectedBookingState[0];
  const setSelectedBooking = selectedBookingState[1];
  
  const rescheduleDateState = useState(new Date());
  const rescheduleDate = rescheduleDateState[0];
  const setRescheduleDate = rescheduleDateState[1];
  
  const tempRescheduleDateState = useState(new Date());
  const tempRescheduleDate = tempRescheduleDateState[0];
  const setTempRescheduleDate = tempRescheduleDateState[1];
  
  const rescheduleTimeState = useState(null);
  const rescheduleTime = rescheduleTimeState[0];
  const setRescheduleTime = rescheduleTimeState[1];
  
  const showDatePickerState = useState(false);
  const showDatePicker = showDatePickerState[0];
  const setShowDatePicker = showDatePickerState[1];
  
  const availableSlotsState = useState([]);
  const availableSlots = availableSlotsState[0];
  const setAvailableSlots = availableSlotsState[1];
  
  const reschedulingState = useState(false);
  const rescheduling = reschedulingState[0];
  const setRescheduling = reschedulingState[1];

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    const timer = setInterval(function() {
      const newCurrentTime = new Date();
      setCurrentTime(newCurrentTime);
    }, 60000);
    
    return function() {
      clearInterval(timer);
    };
  }, []);

  useEffect(function() {
    fetchBookings();
  }, [activeTab]);

  useEffect(function() {
    const unsubscribe = navigation.addListener('focus', function() {
      fetchBookings();
    });
    
    return unsubscribe;
  }, [navigation, activeTab]);

  useEffect(function() {
    const isModalShowing = showRescheduleModal === true;
    if (isModalShowing === true) {
      generateTimeSlots();
    }
  }, [rescheduleDate, showRescheduleModal]);

  const generateTimeSlots = function() {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    let hour = startHour;
    while (hour < endHour) {
      const hourString = hour.toString();
      const paddedHourString = hourString.padStart(2, '0');
      const slot1 = paddedHourString + ':00';
      const slot2 = paddedHourString + ':30';
      slots.push(slot1);
      slots.push(slot2);
      hour = hour + 1;
    }
    
    setAvailableSlots(slots);
  };

  const fetchBookings = async function() {
    try {
      let userId = null;
      const hasUser = user !== null && user !== undefined;
      if (hasUser === true) {
        userId = user.id;
      }
      
      console.log('📥 Fetching bookings for user:', userId);
      
      const apiUrl = API_BASE_URL + '/appointments/user/' + userId;
      console.log('🔗 API URL:', apiUrl);

      const hasUserId = userId !== null && userId !== undefined;
      if (hasUserId === false) {
        console.log('❌ No user ID found');
        setLoading(false);
        return;
      }

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };
      
      const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
      };
      
      const response = await fetch(apiUrl, requestOptions);

      const responseStatus = response.status;
      console.log('📡 Response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        const data = await response.json();
        console.log('✅ Bookings received:', data);

        const now = new Date();
        const filteredBookings = [];
        
        let dataIndex = 0;
        while (dataIndex < data.length) {
          const appointment = data[dataIndex];
          const appointmentDateTimeString = appointment.appointmentDateTime;
          const appointmentDate = new Date(appointmentDateTimeString);
          
          const isUpcomingTab = activeTab === 'upcoming';
          if (isUpcomingTab === true) {
            const isFutureAppointment = appointmentDate >= now;
            const appointmentStatus = appointment.status;
            const isConfirmed = appointmentStatus === 'CONFIRMED';
            const shouldInclude = isFutureAppointment === true && isConfirmed === true;
            
            if (shouldInclude === true) {
              filteredBookings.push(appointment);
            }
          } else {
            const isPastAppointment = appointmentDate < now;
            const appointmentStatus = appointment.status;
            const isCancelled = appointmentStatus === 'CANCELLED';
            const isCompleted = appointmentStatus === 'COMPLETED';
            const shouldInclude = isPastAppointment === true || isCancelled === true || isCompleted === true;
            
            if (shouldInclude === true) {
              filteredBookings.push(appointment);
            }
          }
          
          dataIndex = dataIndex + 1;
        }

        const sortedBookings = filteredBookings.sort(function(a, b) {
          const dateAString = a.appointmentDateTime;
          const dateBString = b.appointmentDateTime;
          const dateA = new Date(dateAString);
          const dateB = new Date(dateBString);
          
          const isUpcomingTab = activeTab === 'upcoming';
          if (isUpcomingTab === true) {
            const difference = dateA - dateB;
            return difference;
          } else {
            const difference = dateB - dateA;
            return difference;
          }
        });

        const sortedBookingsLength = sortedBookings.length;
        const logMessage = '📋 ' + activeTab + ' bookings: ' + sortedBookingsLength.toString();
        console.log(logMessage);
        
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

  const onRefresh = function() {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = function(bookingId) {
    const alertButtons = [
      { 
        text: 'No', 
        style: 'cancel' 
      },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: function() {
          cancelBooking(bookingId);
        },
      },
    ];
    
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      alertButtons
    );
  };

  const cancelBooking = async function(bookingId) {
    try {
      console.log('🗑️ Cancelling booking:', bookingId);

      const userId = user.id;
      const apiUrl = API_BASE_URL + '/appointments/' + bookingId.toString() + '/cancel?userId=' + userId.toString();
      
      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };
      
      const requestOptions = {
        method: 'PUT',
        headers: requestHeaders,
      };
      
      const response = await fetch(apiUrl, requestOptions);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
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

  const handleOpenRescheduleModal = function(booking) {
    const bookingId = booking.id;
    console.log('📅 Opening reschedule modal for booking:', bookingId);
    
    setSelectedBooking(booking);
    
    const tomorrow = new Date();
    const currentDays = tomorrow.getDate();
    const tomorrowDays = currentDays + 1;
    tomorrow.setDate(tomorrowDays);
    
    setRescheduleDate(tomorrow);
    setTempRescheduleDate(tomorrow);
    setRescheduleTime(null);
    setShowDatePicker(false);
    setShowRescheduleModal(true);
  };

  const handleCloseRescheduleModal = function() {
    console.log('❌ Closing reschedule modal');
    
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    
    const tomorrow = new Date();
    const currentDays = tomorrow.getDate();
    const tomorrowDays = currentDays + 1;
    tomorrow.setDate(tomorrowDays);
    
    setRescheduleDate(tomorrow);
    setTempRescheduleDate(tomorrow);
    setRescheduleTime(null);
    setShowDatePicker(false);
  };

  const formatDate = function(date) {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formattedDate;
  };

  const formatTime12Hour = function(time24) {
    const parts = time24.split(':');
    const hours = parts[0];
    const minutes = parts[1];
    const hourNumber = parseInt(hours);
    
    let ampm = 'AM';
    const isAfternoon = hourNumber >= 12;
    if (isAfternoon === true) {
      ampm = 'PM';
    }
    
    let hour12 = hourNumber % 12;
    const isMidnight = hour12 === 0;
    if (isMidnight === true) {
      hour12 = 12;
    }
    
    const hour12String = hour12.toString();
    const formattedTime = hour12String + ':' + minutes + ' ' + ampm;
    return formattedTime;
  };

  const handleRescheduleConfirm = async function() {
    const hasRescheduleTime = rescheduleTime !== null && rescheduleTime !== undefined;
    if (hasRescheduleTime === false) {
      Alert.alert('Error', 'Please select a time for the rescheduled appointment');
      return;
    }

    console.log('🔄 Starting reschedule process...');
    
    const bookingId = selectedBooking.id;
    console.log('📋 Booking ID:', bookingId);
    console.log('📅 New Date:', rescheduleDate);
    console.log('⏰ New Time:', rescheduleTime);
    
    const userId = user.id;
    console.log('👤 User ID:', userId);

    setRescheduling(true);

    try {
      const dateISOString = rescheduleDate.toISOString();
      const dateParts = dateISOString.split('T');
      const dateStr = dateParts[0];
      const newDateTime = dateStr + 'T' + rescheduleTime + ':00';

      console.log('📤 New DateTime:', newDateTime);

      const encodedDateTime = encodeURIComponent(newDateTime);
      const bookingIdString = bookingId.toString();
      const userIdString = userId.toString();
      const url = API_BASE_URL + '/appointments/' + bookingIdString + '/reschedule?newDateTime=' + encodedDateTime + '&userId=' + userIdString;
      
      console.log('📤 FULL URL:', url);

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };
      
      const requestOptions = {
        method: 'PUT',
        headers: requestHeaders,
      };
      
      const response = await fetch(url, requestOptions);

      const responseStatus = response.status;
      console.log('📥 Response status:', responseStatus);

      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ Reschedule successful! Data:', data);
        } catch (parseError) {
          console.log('✅ Reschedule successful! (no JSON response)');
        }
        
        handleCloseRescheduleModal();
        
        const formattedDate = formatDate(rescheduleDate);
        const formattedTime = formatTime12Hour(rescheduleTime);
        const successMessage = 'Your appointment has been rescheduled to ' + formattedDate + ' at ' + formattedTime;
        
        const alertButtons = [
          {
            text: 'OK',
            onPress: function() {
              fetchBookings();
            },
          },
        ];
        
        Alert.alert('Success! ✅', successMessage, alertButtons);
      } else {
        console.error('❌ Reschedule failed with status:', responseStatus);
        console.error('❌ Response text:', responseText);
        
        let errorMessage = 'Failed to reschedule appointment';
        try {
          const errorData = JSON.parse(responseText);
          const message = errorData.message;
          const error = errorData.error;
          
          const hasMessage = message !== null && message !== undefined;
          if (hasMessage === true) {
            errorMessage = message;
          } else {
            const hasError = error !== null && error !== undefined;
            if (hasError === true) {
              errorMessage = error;
            }
          }
        } catch (parseError) {
          const hasResponseText = responseText !== null && responseText !== undefined;
          if (hasResponseText === true) {
            errorMessage = responseText;
          }
        }
        
        Alert.alert('Reschedule Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error('❌ Network Error:', error);
      console.error('❌ Error details:', errorMessage);
      
      const alertMessage = 'Network error: ' + errorMessage;
      Alert.alert('Error', alertMessage);
    } finally {
      setRescheduling(false);
    }
  };

  const isAppointmentNow = function(booking) {
    const appointmentDateTimeString = booking.appointmentDateTime;
    const appointmentDateTime = new Date(appointmentDateTimeString);
    const appointmentDateTimeMillis = appointmentDateTime.getTime();
    const sixtyMinutesInMillis = 60 * 60000;
    const appointmentEndTimeMillis = appointmentDateTimeMillis + sixtyMinutesInMillis;
    const appointmentEndTime = new Date(appointmentEndTimeMillis);
    
    const isAfterStart = currentTime >= appointmentDateTime;
    const isBeforeEnd = currentTime <= appointmentEndTime;
    const isBetween = isAfterStart === true && isBeforeEnd === true;
    
    return isBetween;
  };

  const isAppointmentSoon = function(booking) {
    const appointmentDateTimeString = booking.appointmentDateTime;
    const appointmentDateTime = new Date(appointmentDateTimeString);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = timeDiff / 60000;
    
    const isPositive = minutesDiff > 0;
    const isWithin30Min = minutesDiff <= 30;
    const isSoon = isPositive === true && isWithin30Min === true;
    
    return isSoon;
  };

  const getRelativeTime = function(booking) {
    const appointmentDateTimeString = booking.appointmentDateTime;
    const appointmentDateTime = new Date(appointmentDateTimeString);
    const timeDiff = appointmentDateTime - currentTime;
    const minutesDiff = Math.floor(timeDiff / 60000);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    const isNow = isAppointmentNow(booking);
    if (isNow === true) {
      return '🔴 Happening Now';
    }
    
    const isSoon = isAppointmentSoon(booking);
    if (isSoon === true) {
      const minutesString = minutesDiff.toString();
      const message = '⏰ Starting in ' + minutesString + ' min';
      return message;
    }
    
    const hasDays = daysDiff > 0;
    if (hasDays === true) {
      let dayLabel = 'days';
      const isSingleDay = daysDiff === 1;
      if (isSingleDay === true) {
        dayLabel = 'day';
      }
      const daysString = daysDiff.toString();
      const message = '📅 In ' + daysString + ' ' + dayLabel;
      return message;
    }
    
    const hasHours = hoursDiff > 0;
    if (hasHours === true) {
      let hourLabel = 'hours';
      const isSingleHour = hoursDiff === 1;
      if (isSingleHour === true) {
        hourLabel = 'hour';
      }
      const hoursString = hoursDiff.toString();
      const message = '⏰ In ' + hoursString + ' ' + hourLabel;
      return message;
    }
    
    const hasMinutes = minutesDiff > 0;
    if (hasMinutes === true) {
      const minutesString = minutesDiff.toString();
      const message = '⏰ In ' + minutesString + ' minutes';
      return message;
    }
    
    return '✓ Past';
  };

  const getStatusConfig = function(status) {
    let upperStatus = '';
    const hasStatus = status !== null && status !== undefined;
    if (hasStatus === true) {
      upperStatus = status.toUpperCase();
    }

    const isConfirmed = upperStatus === 'CONFIRMED';
    if (isConfirmed === true) {
      const config = {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: '✓',
        label: 'CONFIRMED'
      };
      return config;
    }
    
    const isCancelled = upperStatus === 'CANCELLED';
    if (isCancelled === true) {
      const config = {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: '✗',
        label: 'CANCELLED'
      };
      return config;
    }
    
    const isCompleted = upperStatus === 'COMPLETED';
    if (isCompleted === true) {
      const config = {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        icon: '✓',
        label: 'COMPLETED'
      };
      return config;
    }
    
    const isNoShow = upperStatus === 'NO_SHOW';
    if (isNoShow === true) {
      const config = {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200',
        icon: '⊘',
        label: 'NO SHOW'
      };
      return config;
    }
    
    let displayLabel = 'UNKNOWN';
    if (hasStatus === true) {
      displayLabel = status;
    }
    
    const config = {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      icon: '•',
      label: displayLabel
    };
    return config;
  };

  const renderBookingCard = function(renderProps) {
    const item = renderProps.item;
    const itemStatus = item.status;
    const statusConfig = getStatusConfig(itemStatus);
    
    const appointmentNow = isAppointmentNow(item);
    const appointmentSoon = isAppointmentSoon(item);
    
    const appointmentDateTimeString = item.appointmentDateTime;
    const appointmentDate = new Date(appointmentDateTimeString);

    let borderColorClass = statusConfig.borderColor;
    if (appointmentNow === true) {
      borderColorClass = 'border-red-500';
    } else if (appointmentSoon === true) {
      borderColorClass = 'border-orange-400';
    }

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

    let durationMinutes = 60;
    if (hasService === true) {
      const hasDurationMinutes = item.service.durationMinutes !== null && item.service.durationMinutes !== undefined;
      if (hasDurationMinutes === true) {
        durationMinutes = item.service.durationMinutes;
      }
    }

    let price = 0.00;
    if (hasService === true) {
      const hasPrice = item.service.price !== null && item.service.price !== undefined;
      if (hasPrice === true) {
        price = item.service.price;
      }
    }

    const formattedPrice = price.toFixed(2);

    const isUpcoming = activeTab === 'upcoming';
    const isConfirmed = itemStatus === 'CONFIRMED';
    const showTimeIndicator = isUpcoming === true && isConfirmed === true;

    let timeIndicatorBgColor = 'bg-blue-50';
    let timeIndicatorTextColor = 'text-blue-700';
    
    if (appointmentNow === true) {
      timeIndicatorBgColor = 'bg-red-100';
      timeIndicatorTextColor = 'text-red-700';
    } else if (appointmentSoon === true) {
      timeIndicatorBgColor = 'bg-orange-100';
      timeIndicatorTextColor = 'text-orange-700';
    }

    const showActionButtons = isUpcoming === true && isConfirmed === true;

    const cardClassName = 'bg-white rounded-2xl p-4 mb-4 shadow-md border-2 ' + borderColorClass;
    const statusBadgeClassName = statusConfig.bgColor + ' px-3 py-1.5 rounded-full border ' + statusConfig.borderColor;
    const statusTextClassName = statusConfig.textColor + ' text-xs font-bold uppercase';
    const timeIndicatorClassName = 'px-3 py-1.5 rounded-full ' + timeIndicatorBgColor;
    const timeIndicatorTextClassName = 'text-xs font-bold ' + timeIndicatorTextColor;

    const hasNotes = item.notes !== null && item.notes !== undefined;

    return (
      <View className={cardClassName}>
        <View className="flex-row justify-between items-start mb-3">
          <View className={statusBadgeClassName}>
            <Text className={statusTextClassName}>
              {statusConfig.icon} {statusConfig.label}
            </Text>
          </View>

          {showTimeIndicator === true && (
            <View className={timeIndicatorClassName}>
              <Text className={timeIndicatorTextClassName}>
                {getRelativeTime(item)}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-3">
          {businessName}
        </Text>

        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">💼</Text>
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {serviceName}
            </Text>
          </View>

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

          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🕐</Text>
            <Text className="text-sm text-gray-700 font-medium">
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            {appointmentNow === true && (
              <View className="ml-2 bg-red-500 px-2 py-0.5 rounded">
                <Text className="text-white text-xs font-bold">LIVE</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between mt-1">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">⏱️</Text>
              <Text className="text-sm text-gray-600">
                {durationMinutes} min
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">💰</Text>
              <Text className="text-lg font-bold text-blue-600">
                €{formattedPrice}
              </Text>
            </View>
          </View>
        </View>

        {hasNotes === true && (
          <View className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
            <Text className="text-xs text-blue-900 font-semibold mb-1">
              📝 Notes:
            </Text>
            <Text className="text-sm text-gray-700">
              {item.notes}
            </Text>
          </View>
        )}

        {showActionButtons === true && (
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 bg-blue-500 border-2 border-blue-500 py-3 rounded-xl active:bg-blue-600 mr-2"
              onPress={function() {
                handleOpenRescheduleModal(item);
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center text-base font-bold">
                📅 Reschedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white border-2 border-red-500 py-3 rounded-xl active:bg-red-50"
              onPress={function() {
                const itemId = item.id;
                handleCancelBooking(itemId);
              }}
              activeOpacity={0.7}
            >
              <Text className="text-red-600 text-center text-base font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = function() {
    const isUpcoming = activeTab === 'upcoming';
    
    let emoji = '📋';
    let title = 'No past bookings';
    let description = 'Your completed bookings will appear here';
    
    if (isUpcoming === true) {
      emoji = '📅';
      title = 'No upcoming bookings';
      description = 'Your confirmed appointments will appear here';
    }

    return (
      <View className="items-center justify-center py-20 px-8">
        <Text className="text-6xl mb-4">
          {emoji}
        </Text>
        <Text className="text-xl font-bold text-gray-700 mb-2 text-center">
          {title}
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          {description}
        </Text>
        {isUpcoming === true && (
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700"
            onPress={function() {
              navigation.goBack();
            }}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold">Browse Services</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const minDate = new Date();
  const minDateCurrentDays = minDate.getDate();
  const minDateNewDays = minDateCurrentDays + 1;
  minDate.setDate(minDateNewDays);
  
  const maxDate = new Date();
  const maxDateCurrentDays = maxDate.getDate();
  const maxDateNewDays = maxDateCurrentDays + 60;
  maxDate.setDate(maxDateNewDays);

  const hasRescheduleTime = rescheduleTime !== null && rescheduleTime !== undefined;

  const platformOS = Platform.OS;
  const isIOS = platformOS === 'ios';
  const isAndroid = platformOS === 'android';

  const currentTimeLocaleString = currentTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const upcomingTabBorderClass = activeTab === 'upcoming' ? 'border-blue-600' : 'border-transparent';
  const upcomingTabTextClass = activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-400';
  const pastTabBorderClass = activeTab === 'past' ? 'border-blue-600' : 'border-transparent';
  const pastTabTextClass = activeTab === 'past' ? 'text-blue-600' : 'text-gray-400';

  const upcomingTabClassName = 'flex-1 py-4 border-b-2 ' + upcomingTabBorderClass;
  const upcomingTabTextClassName = 'text-center text-base font-bold ' + upcomingTabTextClass;
  const pastTabClassName = 'flex-1 py-4 border-b-2 ' + pastTabBorderClass;
  const pastTabTextClassName = 'text-center text-base font-bold ' + pastTabTextClass;

  const confirmButtonClassName = rescheduling === true ? 'py-4 rounded-xl bg-blue-400' : 'py-4 rounded-xl bg-blue-600';

  const contentContainerStyle = { padding: 16 };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-3 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          My Bookings
        </Text>
        <Text className="text-sm text-gray-500">
          {currentTimeLocaleString}
        </Text>
      </View>

      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={upcomingTabClassName}
          onPress={function() {
            setActiveTab('upcoming');
          }}
          activeOpacity={0.7}
        >
          <Text className={upcomingTabTextClassName}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={pastTabClassName}
          onPress={function() {
            setActiveTab('past');
          }}
          activeOpacity={0.7}
        >
          <Text className={pastTabTextClassName}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {loading === true ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={function(item) {
            const hasId = item.id !== null && item.id !== undefined;
            if (hasId === true) {
              const itemId = item.id;
              const itemIdString = itemId.toString();
              return itemIdString;
            }
            return '';
          }}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <Modal
        visible={showRescheduleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseRescheduleModal}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <TouchableOpacity 
                onPress={handleCloseRescheduleModal}
                activeOpacity={0.7}
              >
                <Text className="text-red-500 text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">Reschedule Appointment</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false}>
              {selectedBooking && (
                <View className="bg-blue-50 rounded-xl p-4 mb-5 border-2 border-blue-200">
                  <Text className="text-sm font-bold text-blue-900 mb-2">Current Appointment:</Text>
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {(function() {
                      const hasService = selectedBooking.service !== null && selectedBooking.service !== undefined;
                      if (hasService === true) {
                        const hasServiceName = selectedBooking.service.serviceName !== null && selectedBooking.service.serviceName !== undefined;
                        if (hasServiceName === true) {
                          return selectedBooking.service.serviceName;
                        }
                      }
                      return 'Service';
                    })()}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    📅 {(function() {
                      const appointmentDateTimeString = selectedBooking.appointmentDateTime;
                      const appointmentDate = new Date(appointmentDateTimeString);
                      return appointmentDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    })()}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    🕐 {(function() {
                      const appointmentDateTimeString = selectedBooking.appointmentDateTime;
                      const appointmentDate = new Date(appointmentDateTimeString);
                      return appointmentDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    })()}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center mb-4">
                <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">1</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Select New Date
                </Text>
              </View>

              {showDatePicker === false && (
                <TouchableOpacity
                  className="bg-white border-2 border-blue-500 rounded-xl p-4 mb-6 active:bg-blue-50"
                  onPress={function() {
                    console.log('📅 Opening date picker');
                    setShowDatePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-base font-semibold text-gray-900">
                    📅 {formatDate(rescheduleDate)}
                  </Text>
                  <Text className="text-center text-xs text-gray-500 mt-1">
                    Tap to change date
                  </Text>
                </TouchableOpacity>
              )}

              {showDatePicker === true && (
  <View className="bg-white border-2 border-blue-500 rounded-xl mb-6 overflow-hidden">
    <View className="flex-row justify-between items-center px-4 py-3 bg-blue-50 border-b border-blue-200">
      <TouchableOpacity 
        onPress={function() {
          console.log('❌ Cancel date picker');
          setShowDatePicker(false);
        }}
        activeOpacity={0.7}
      >
        <Text className="text-blue-600 font-semibold">Cancel</Text>
      </TouchableOpacity>
      <Text className="font-bold text-gray-900">Pick a Date</Text>
      <TouchableOpacity 
        onPress={function() {
          console.log('✅ Confirm date:', tempRescheduleDate);
          setRescheduleDate(tempRescheduleDate);
          setRescheduleTime(null);
          setShowDatePicker(false);
        }}
        activeOpacity={0.7}
      >
        <Text className="text-blue-600 font-bold">Done</Text>
      </TouchableOpacity>
    </View>
    
    <DateTimePicker
  value={tempRescheduleDate}
  mode="date"
  display="inline"
  onChange={function(event, date) {
    console.log('📅 Date changed to:', date);
    if (date) {
      setTempRescheduleDate(date);
    }
  }}
  minimumDate={minDate}
  maximumDate={maxDate}
  accentColor="#3b82f6"
  themeVariant="light"
  style={{ backgroundColor: 'white', height: 350 }}
/>
  </View>
)}
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">2</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Select New Time
                </Text>
              </View>

              <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <View className="flex-row flex-wrap">
                  {availableSlots.map(function(time, index) {
                    const isSelected = rescheduleTime === time;
                    const indexPlusOne = index + 1;
                    const remainder = indexPlusOne % 3;
                    const isLastInRow = remainder === 0;

                    let buttonBgColor = 'bg-white';
                    let buttonBorderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';

                    if (isSelected === true) {
                      buttonBgColor = 'bg-blue-500';
                      buttonBorderColor = 'border-blue-500';
                      textColor = 'text-white';
                    }

                    let marginRight = '3.5%';
                    if (isLastInRow === true) {
                      marginRight = 0;
                    }

                    const buttonClassName = 'w-[31%] py-3 rounded-lg border-2 mb-3 ' + buttonBgColor + ' ' + buttonBorderColor;
                    const textClassName = 'text-center font-semibold ' + textColor;
                    const styleObject = { marginRight: marginRight };

                    return (
                      <TouchableOpacity
                        key={index}
                        className={buttonClassName}
                        style={styleObject}
                        onPress={function() {
                          setRescheduleTime(time);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text className={textClassName}>
                          {formatTime12Hour(time)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {hasRescheduleTime === true && (
                <View className="bg-green-50 border-2 border-green-200 p-4 rounded-xl mb-6">
                  <Text className="text-green-800 font-bold text-center text-base mb-2">
                    ✅ New Appointment Time
                  </Text>
                  <Text className="text-center text-gray-900 font-semibold">
                    📅 {formatDate(rescheduleDate)}
                  </Text>
                  <Text className="text-center text-gray-900 font-semibold">
                    ⏰ {formatTime12Hour(rescheduleTime)}
                  </Text>
                </View>
              )}

              <View className="h-20" />
            </ScrollView>

            {hasRescheduleTime === true && (
              <View className="bg-white border-t border-gray-200 px-5 py-4">
                <TouchableOpacity
                  className={confirmButtonClassName}
                  onPress={handleRescheduleConfirm}
                  disabled={rescheduling}
                  activeOpacity={0.7}
                >
                  {rescheduling === true ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="text-white text-base font-bold ml-2">
                        Rescheduling...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center text-lg font-bold">
                      ✓ Confirm Reschedule
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyBookingsScreen;