import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';

function BookAppointment(props) {
  const route = props.route;
  const navigation = props.navigation;
  const routeParams = route.params;
  const business = routeParams.business;
  const service = routeParams.service;
  
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;

  const selectedDateState = useState(new Date());
  const selectedDate = selectedDateState[0];
  const setSelectedDate = selectedDateState[1];

  const tempDateState = useState(new Date());
  const tempDate = tempDateState[0];
  const setTempDate = tempDateState[1];

  const selectedTimeState = useState(null);
  const selectedTime = selectedTimeState[0];
  const setSelectedTime = selectedTimeState[1];

  const showDatePickerState = useState(false);
  const showDatePicker = showDatePickerState[0];
  const setShowDatePicker = showDatePickerState[1];

  const availableSlotsState = useState([]);
  const availableSlots = availableSlotsState[0];
  const setAvailableSlots = availableSlotsState[1];

  const bookedSlotsState = useState([]);
  const bookedSlots = bookedSlotsState[0];
  const setBookedSlots = bookedSlotsState[1];

  const notesState = useState('');
  const notes = notesState[0];
  const setNotes = notesState[1];

  const loadingState = useState(false);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  const submittingState = useState(false);
  const submitting = submittingState[0];
  const setSubmitting = submittingState[1];

  useEffect(function() {
    console.log('📅 Booking screen loaded');
    console.log('🏢 Business:', business. businessName);
    console.log('🕐 Opening hours:', business.openingHours);
    console.log('⏱️ Service duration:', service. durationMinutes, 'minutes');
    generateTimeSlots();
    fetchBookedSlots();
  }, [selectedDate]);

  async function fetchBookedSlots() {
  try {
    setLoading(true);
    
    const hasBusinessId = business !== null && business !== undefined && business.id !== null && business.id !== undefined;
    if (hasBusinessId === false) {
      console.error('❌ Business ID is missing:', business);
      setBookedSlots([]);
      setLoading(false);
      return;
    }
    
    const dateISOString = selectedDate.toISOString();
    const dateParts = dateISOString. split('T');
    const dateStr = dateParts[0];
    
    const businessId = business.id;
    const url = 'http://192.168.1.15:8080/api/appointments/business/' + businessId + '/booked-slots?date=' + dateStr;
    
    console.log('🔍 Fetching booked slots');
    console.log('🔗 URL:', url);
    console.log('🏢 Business ID:', businessId);
    console.log('📅 Date:', dateStr);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    if (response.ok) {
      const bookedSlotsData = await response.json();
      console.log('✅ Booked slots received:', bookedSlotsData);
      console.log('✅ Number of booked slots:', bookedSlotsData.length);
      
      const isArray = Array.isArray(bookedSlotsData);
      if (isArray === true) {
        setBookedSlots(bookedSlotsData);
      } else {
        console.error('❌ Response is not an array:', bookedSlotsData);
        setBookedSlots([]);
      }
    } else {
      const errorText = await response. text();
      console.error('❌ Failed to fetch.  Status:', response.status);
      console.error('❌ Error text:', errorText);
      setBookedSlots([]);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    console.error('❌ Error message:', error. message);
    console.error('❌ Error name:', error.name);
    
    const isNetworkError = error.message.includes('Network request failed');
    if (isNetworkError === true) {
      console.error('❌ Cannot reach server at http://192.168.1.15:8080');
      console.error('❌ Make sure:');
      console.error('   1. Backend server is running');
      console.error('   2. You are on the same network');
      console.error('   3. IP address is correct');
    }
    
    setBookedSlots([]);
  } finally {
    setLoading(false);
  }
}
function isTimeSlotInPast(date, timeString) {
  const now = new Date();
  
  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();
  const selectedDay = date. getDate();
  
  const todayYear = now.getFullYear();
  const todayMonth = now. getMonth();
  const todayDay = now.getDate();
  
  const isSameYear = selectedYear === todayYear;
  const isSameMonth = selectedMonth === todayMonth;
  const isSameDay = selectedDay === todayDay;
  const isToday = isSameYear === true && isSameMonth === true && isSameDay === true;
  
  if (isToday === false) {
    return false;
  }
  
  const timeParts = timeString.split(':');
  const timeHour = parseInt(timeParts[0]);
  const timeMinute = parseInt(timeParts[1]);
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const isEarlierHour = timeHour < currentHour;
  if (isEarlierHour === true) {
    return true;
  }
  
  const isSameHour = timeHour === currentHour;
  if (isSameHour === true) {
    const isEarlierOrSameMinute = timeMinute <= currentMinute;
    if (isEarlierOrSameMinute === true) {
      return true;
    }
  }
  
  return false;
}



  function getSlotInterval() {
    let serviceDuration = 30;
    const hasDurationMinutes = service.durationMinutes !== null && service.durationMinutes !== undefined;
    if (hasDurationMinutes === true) {
      serviceDuration = service.durationMinutes;
    }

    if (serviceDuration <= 15) {
      return 15;
    } else if (serviceDuration <= 30) {
      return 30;
    } else if (serviceDuration <= 45) {
      return 45;
    } else if (serviceDuration <= 60) {
      return 60;
    } else if (serviceDuration <= 90) {
      return 90;
    } else if (serviceDuration <= 120) {
      return 120;
    } else {
      return 60;
    }
  }

  function generateTimeSlots() {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const intervalMinutes = getSlotInterval();

    console.log('⏰ Generating slots with interval:', intervalMinutes, 'minutes');

    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    let currentMinutes = startMinutes;
    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      
      const hoursString = hours.toString();
      const minutesString = minutes.toString();
      const paddedHours = hoursString. padStart(2, '0');
      const paddedMinutes = minutesString.padStart(2, '0');
      const timeSlot = paddedHours + ':' + paddedMinutes;
      
      slots.push(timeSlot);
      
      currentMinutes = currentMinutes + intervalMinutes;
    }
    
    console.log('✅ Generated', slots.length, 'time slots');
    setAvailableSlots(slots);
  }

  function doesSlotOverlapWithBooked(startTime) {
    let serviceDuration = 30;
    const hasDurationMinutes = service.durationMinutes !== null && service.durationMinutes !== undefined;
    if (hasDurationMinutes === true) {
      serviceDuration = service.durationMinutes;
    }

    const timeParts = startTime.split(':');
    const startHour = parseInt(timeParts[0]);
    const startMinute = parseInt(timeParts[1]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + serviceDuration;

    let bookedIndex = 0;
    while (bookedIndex < bookedSlots.length) {
      const bookedTime = bookedSlots[bookedIndex];
      const bookedParts = bookedTime.split(':');
      const bookedHour = parseInt(bookedParts[0]);
      const bookedMinute = parseInt(bookedParts[1]);
      const bookedStartMinutes = bookedHour * 60 + bookedMinute;

      const hasOverlap = bookedStartMinutes >= startMinutes && bookedStartMinutes < endMinutes;
      if (hasOverlap === true) {
        return true;
      }

      bookedIndex = bookedIndex + 1;
    }

    return false;
  }

  function isBusinessOpen(dateTime, businessHours) {
  if (businessHours === null) {
    return true;
  }
  if (businessHours === undefined) {
    return true;
  }
  
  if (dateTime === null) {
    return true;
  }
  if (dateTime === undefined) {
    return true;
  }

  // ✅ Parse if it's a string
  let parsedHours = businessHours;
  if (typeof businessHours === 'string') {
    try {
      parsedHours = JSON.parse(businessHours);
    } catch (error) {
      console.error('❌ Failed to parse opening hours:', error.message);
      return true;
    }
  }

  const date = new Date(dateTime);
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  const dayHours = parsedHours[dayName];

  if (dayHours === null) {
    return true;
  }
  if (dayHours === undefined) {
    return true;
  }

  // ✅ IMPORTANT: Check isClosed FIRST before accessing openTime/closeTime
  const isClosedField = dayHours.isClosed;
  if (isClosedField === true) {
    return false;  // ✅ Return early if closed
  }

  const openTime = dayHours.openTime;
  const closeTime = dayHours.closeTime;

  // ✅ Now it's safe to check openTime/closeTime because we know it's not closed
  if (openTime === null) {
    return true;
  }
  if (openTime === undefined) {
    return true;
  }
  if (closeTime === null) {
    return true;
  }
  if (closeTime === undefined) {
    return true;
  }

  const openParts = openTime.split(':');
  const openHour = parseInt(openParts[0]);
  const openMinute = parseInt(openParts[1]);
  const openMinutes = openHour * 60 + openMinute;

  const closeParts = closeTime. split(':');
  const closeHour = parseInt(closeParts[0]);
  const closeMinute = parseInt(closeParts[1]);
  const closeMinutes = closeHour * 60 + closeMinute;

  let serviceDuration = 30;
  const hasDurationMinutes = service.durationMinutes !== null && service.durationMinutes !== undefined;
  if (hasDurationMinutes === true) {
    serviceDuration = service.durationMinutes;
  }

  const serviceEndMinutes = timeInMinutes + serviceDuration;

  const isAfterOpen = timeInMinutes >= openMinutes;
  const isBeforeClose = serviceEndMinutes <= closeMinutes;
  const isWithinHours = isAfterOpen === true && isBeforeClose === true;
  
  return isWithinHours;
}
 function getBusinessStatusForTime(timeSlot) {
  const hasOpeningHours = business.openingHours !== null && business.openingHours !== undefined;
  if (hasOpeningHours === false) {
    return { isOpen: true, message: '' };
  }

  const slotDate = new Date(selectedDate);
  const timeParts = timeSlot.split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  slotDate.setHours(hour);
  slotDate.setMinutes(minute);
  slotDate.setSeconds(0);
  slotDate.setMilliseconds(0);

  const dayOfWeek = slotDate.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];
  const dayKey = dayName.toLowerCase();

  // ✅ Parse if string
  let parsedHours = business.openingHours;
  if (typeof business.openingHours === 'string') {
    try {
      parsedHours = JSON.parse(business.openingHours);
    } catch (error) {
      return { isOpen: true, message: '' };
    }
  }

  const dayHours = parsedHours[dayKey];

  if (dayHours === null) {
    return { isOpen: true, message: '' };
  }
  if (dayHours === undefined) {
    return { isOpen: true, message: '' };
  }

  // ✅ Check isClosed FIRST
  if (dayHours.isClosed === true) {
    return {
      isOpen: false,
      message: 'Closed on ' + dayName + 's'
    };
  }

  const isOpen = isBusinessOpen(slotDate, parsedHours);

  if (isOpen === false) {
    const openTime = dayHours.openTime;
    const closeTime = dayHours.closeTime;
    
    // ✅ Check if times exist
    if (openTime && closeTime) {
      const openTimeFormatted = formatTime12Hour(openTime);
      const closeTimeFormatted = formatTime12Hour(closeTime);
      return {
        isOpen: false,
        message: 'Closed.   Open: ' + openTimeFormatted + ' - ' + closeTimeFormatted
      };
    } else {
      return {
        isOpen: false,
        message: 'Closed'
      };
    }
  }

  return {
    isOpen: true,
    message: 'Open'
  };
}
 function getTodayStatus() {
  const hasOpeningHours = business.openingHours !== null && business. openingHours !== undefined;
  if (hasOpeningHours === false) {
    return { isOpen: true, message: '' };
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayNames[dayOfWeek];

  // ✅ Parse if string
  let parsedHours = business.openingHours;
  if (typeof business.openingHours === 'string') {
    try {
      parsedHours = JSON.parse(business.openingHours);
    } catch (error) {
      return { isOpen: true, message: '' };
    }
  }

  const dayHours = parsedHours[dayKey];

  if (dayHours === null) {
    return { isOpen: true, message: '' };
  }
  if (dayHours === undefined) {
    return { isOpen: true, message: '' };
  }

  // ✅ Check isClosed FIRST
  if (dayHours.isClosed === true) {
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayLabel = dayLabels[dayOfWeek];
    return {
      isOpen: false,
      message: 'Closed on ' + todayLabel + 's'
    };
  }

  const isCurrentlyOpen = isBusinessOpen(now, parsedHours);
  const openTime = dayHours.openTime;
  const closeTime = dayHours.closeTime;

  // ✅ Check if times exist
  if (openTime === null || openTime === undefined || closeTime === null || closeTime === undefined) {
    return { isOpen: true, message: '' };
  }

  if (isCurrentlyOpen === true) {
    const closeTimeFormatted = formatTime12Hour(closeTime);
    return {
      isOpen: true,
      message: 'Open now • Closes at ' + closeTimeFormatted
    };
  } else {
    const openTimeFormatted = formatTime12Hour(openTime);
    return {
      isOpen: false,
      message: 'Closed now • Opens at ' + openTimeFormatted
    };
  }
}

  function handleOpenDatePicker() {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  }

  function handleDateChange(event, date) {
    const platformOS = Platform.OS;
    const isAndroid = platformOS === 'android';
    
    if (isAndroid === true) {
      setShowDatePicker(false);
      
      const eventType = event.type;
      const isSetEvent = eventType === 'set';
      const hasDate = date !== null && date !== undefined;
      
      if (isSetEvent === true && hasDate === true) {
        setSelectedDate(date);
        setSelectedTime(null);
      }
    } else {
      const hasDate = date !== null && date !== undefined;
      if (hasDate === true) {
        setTempDate(date);
      }
    }
  }

  function handleConfirmDate() {
    setSelectedDate(tempDate);
    setSelectedTime(null);
    setShowDatePicker(false);
  }

  function handleCancelDate() {
    setShowDatePicker(false);
  }

  function formatDate(date) {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formattedDate;
  }

  function formatTime12Hour(time24) {
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
  }

  async function handleBooking() {
    console.log('🎯 Booking process started');
    
    const hasUser = user !== null && user !== undefined;
    if (hasUser === false) {
      const alertButtons = [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Login',
          onPress: function() {
            navigation.navigate('Login');
          }
        }
      ];
      
      Alert.alert(
        'Login Required',
        'Please login to book an appointment',
        alertButtons
      );
      return;
    }

    const hasToken = token !== null && token !== undefined;
    if (hasToken === false) {
      const alertButtons = [
        {
          text: 'OK',
          onPress: function() {
            navigation.navigate('Login');
          }
        }
      ];
      
      Alert. alert(
        'Session Expired',
        'Please login again to continue',
        alertButtons
      );
      return;
    }

    const userId = user.id;

    const hasSelectedDate = selectedDate !== null && selectedDate !== undefined;
    const hasSelectedTime = selectedTime !== null && selectedTime !== undefined;
    
    const hasBothDateAndTime = hasSelectedDate === true && hasSelectedTime === true;
    if (hasBothDateAndTime === false) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    const hasOverlap = doesSlotOverlapWithBooked(selectedTime);
    if (hasOverlap === true) {
      Alert.alert(
        'Slot Unavailable',
        'This time slot conflicts with an existing booking. Please select another time.',
        [{ text: 'OK' }]
      );
      return;
    }

    const isPastTime = isTimeSlotInPast(selectedDate, selectedTime);
    if (isPastTime === true) {
      Alert.alert(
        'Invalid Time',
        'This time slot has already passed. Please select a future time.',
        [{ text: 'OK' }]
      );
      return;
    }

    const status = getBusinessStatusForTime(selectedTime);
    if (status. isOpen === false) {
      const alertMessage = 'Sorry, this business is closed at the selected time.  ' + status.message;
      Alert. alert(
        'Business Closed',
        alertMessage,
        [{ text: 'OK' }]
      );
      return;
    }

    let businessName = business.name;
    const hasBusinessName = business.businessName !== null && business.businessName !== undefined;
    if (hasBusinessName === true) {
      businessName = business.businessName;
    }

    const businessId = business.id;

    let serviceName = service.name;
    const hasServiceName = service.serviceName !== null && service.serviceName !== undefined;
    if (hasServiceName === true) {
      serviceName = service.serviceName;
    }

    const serviceId = service.id;

    setSubmitting(true);

    try {
      const dateISOString = selectedDate.toISOString();
      const dateParts = dateISOString. split('T');
      const dateStr = dateParts[0];
      const appointmentDateTime = dateStr + 'T' + selectedTime + ':00';

      const baseUrl = 'http://192.168.1.15:8080/api/appointments';
      
      const userIdParam = 'userId=' + userId. toString();
      const businessIdParam = 'businessId=' + businessId.toString();
      const serviceIdParam = 'serviceId=' + serviceId.toString();
      const encodedDateTime = encodeURIComponent(appointmentDateTime);
      const dateTimeParam = 'dateTime=' + encodedDateTime;
      
      const params = [];
      params.push(userIdParam);
      params.push(businessIdParam);
      params. push(serviceIdParam);
      params.push(dateTimeParam);

      const trimmedNotes = notes.trim();
      const trimmedNotesLength = trimmedNotes.length;
      const hasNotes = trimmedNotesLength > 0;
      
      if (hasNotes === true) {
        const encodedNotes = encodeURIComponent(trimmedNotes);
        const notesParam = 'notes=' + encodedNotes;
        params.push(notesParam);
      }

      const paramsString = params.join('&');
      const url = baseUrl + '?' + paramsString;

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };

      const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
      };
      
      const response = await fetch(url, requestOptions);

      const responseStatus = response.status;
      const isResponseOk = response.ok;

      const responseText = await response.text();

      if (isResponseOk === true) {
        console.log('✅ Booking successful');
        
        const formattedDate = formatDate(selectedDate);
        const formattedTime = formatTime12Hour(selectedTime);
        const successMessage = 'Your appointment is confirmed for ' + formattedDate + ' at ' + formattedTime;
        
        const newDate = new Date();
        setSelectedDate(newDate);
        setSelectedTime(null);
        setNotes('');
        
        const alertButtons = [
          {
            text: 'OK',
            onPress: function() {
              navigation.goBack();
            },
          },
        ];
        
        Alert.alert('Success!  ✅', successMessage, alertButtons);
      } else {
        console.error('❌ Booking failed');
        
        let errorMessage = 'Failed to book appointment';
        
        const isEmpty = responseText.length === 0;
        if (isEmpty === false) {
          try {
            const errorData = JSON.parse(responseText);
            
            const message = errorData.message;
            const error = errorData.error;
            
            const hasMessage = message !== null && message !== undefined;
            const hasError = error !== null && error !== undefined;
            
            if (hasMessage === true) {
              errorMessage = message;
            } else if (hasError === true) {
              errorMessage = error;
            }
          } catch (parseError) {
            // Use default error message
          }
        }
        
        Alert.alert('Booking Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error('❌ Network Error:', errorMessage);
      
      const alertMessage = 'Network error: ' + errorMessage;
      Alert.alert('Error', alertMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const minDate = new Date();
  const maxDate = new Date();
  const maxDateDays = maxDate.getDate();
  const newMaxDateDays = maxDateDays + 60;
  maxDate.setDate(newMaxDateDays);

  let serviceDisplayName = service.name;
  const hasServiceName = service.serviceName !== null && service.serviceName !== undefined;
  if (hasServiceName === true) {
    serviceDisplayName = service.serviceName;
  }

  let businessDisplayName = business.name;
  const hasBusinessName = business.businessName !== null && business. businessName !== undefined;
  if (hasBusinessName === true) {
    businessDisplayName = business. businessName;
  }

  let serviceDuration = service.duration;
  const hasDurationMinutes = service. durationMinutes !== null && service. durationMinutes !== undefined;
  if (hasDurationMinutes === true) {
    serviceDuration = service.durationMinutes;
  }

  const servicePrice = service.price;
  const formattedPrice = servicePrice.toFixed(2);

  const hasSelectedTime = selectedTime !== null && selectedTime !== undefined;

  const platformOS = Platform.OS;
  const isIOS = platformOS === 'ios';

  const todayStatus = getTodayStatus();
  const showStatusBadge = business.openingHours !== null && business. openingHours !== undefined;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: '#7c3aed',
          paddingTop: 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}>
          <Text style={{
            color: '#ffffff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 12,
          }}>
            Book Appointment
          </Text>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            padding: 16,
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 8,
            }}>
              {serviceDisplayName}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              marginBottom: 12,
            }}>
              at {businessDisplayName}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                marginRight: 8,
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontWeight: '700',
                }}>
                  €{formattedPrice}
                </Text>
              </View>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontWeight: '600',
                }}>
                  {serviceDuration} min
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}>
          {showStatusBadge === true && (
            <View>
              {todayStatus.isOpen === true && (
                <View style={{
                  backgroundColor: '#d1fae5',
                  borderWidth: 2,
                  borderColor: '#6ee7b7',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    🟢
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#065f46',
                      marginBottom: 4,
                    }}>
                      Open Now
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#047857',
                    }}>
                      {todayStatus.message}
                    </Text>
                  </View>
                </View>
              )}
              {todayStatus.isOpen === false && (
                <View style={{
                  backgroundColor: '#fee2e2',
                  borderWidth: 2,
                  borderColor: '#fecaca',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    🔴
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#991b1b',
                      marginBottom: 4,
                    }}>
                      Closed Now
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#b91c1c',
                    }}>
                      {todayStatus.message}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              backgroundColor: '#7c3aed',
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{
                color: '#ffffff',
                fontWeight: '700',
              }}>
                1
              </Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#111827',
            }}>
              Select Date
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#7c3aed',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
            onPress={handleOpenDatePicker}
            activeOpacity={0.7}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: '#111827',
            }}>
              📅 {formatDate(selectedDate)}
            </Text>
            <Text style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#6b7280',
              marginTop: 4,
            }}>
              Tap to change date
            </Text>
          </TouchableOpacity>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              backgroundColor: '#7c3aed',
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{
                color: '#ffffff',
                fontWeight: '700',
              }}>
                2
              </Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#111827',
            }}>
              Select Time
            </Text>
          </View>

          {loading === true && (
            <View style={{
              paddingVertical: 32,
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={{
                marginTop: 12,
                color: '#6b7280',
                fontSize: 14,
              }}>
                Loading available slots...
              </Text>
            </View>
          )}

          {loading === false && (
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
              marginBottom: 24,
            }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
                {availableSlots.map(function(time, index) {
                  const status = getBusinessStatusForTime(time);
                  const isOpen = status.isOpen;
                  
                  const hasOverlap = doesSlotOverlapWithBooked(time);
                  const isPastTime = isTimeSlotInPast(selectedDate, time);
                  
                  const isSelected = selectedTime === time;
                  const indexPlusOne = index + 1;
                  const remainder = indexPlusOne % 3;
                  const isLastInRow = remainder === 0;

                  let buttonBgColor = '#ffffff';
                  let buttonBorderColor = '#d1d5db';
                  let textColor = '#374151';
                  let isDisabled = false;
                  let labelText = '';

                  if (isPastTime === true) {
                    buttonBgColor = '#f3f4f6';
                    buttonBorderColor = '#e5e7eb';
                    textColor = '#9ca3af';
                    isDisabled = true;
                    labelText = '🕐 Past';
                  } else if (hasOverlap === true) {
                    buttonBgColor = '#fef3c7';
                    buttonBorderColor = '#fbbf24';
                    textColor = '#92400e';
                    isDisabled = true;
                    labelText = '❌ Booked';
                  } else if (isOpen === false) {
                    buttonBgColor = '#f3f4f6';
                    buttonBorderColor = '#e5e7eb';
                    textColor = '#9ca3af';
                    isDisabled = true;
                    labelText = 'Closed';
                  }
                  
                  if (isSelected === true && isOpen === true && hasOverlap === false && isPastTime === false) {
                    buttonBgColor = '#7c3aed';
                    buttonBorderColor = '#7c3aed';
                    textColor = '#ffffff';
                  }

                  let marginRight = 8;
                  if (isLastInRow === true) {
                    marginRight = 0;
                  }

                  let opacity = 1;
                  if (isDisabled === true) {
                    opacity = 0.6;
                  }

                  const buttonStyle = {
                    width: '31%',
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 2,
                    marginBottom: 12,
                    backgroundColor: buttonBgColor,
                    borderColor: buttonBorderColor,
                    marginRight: marginRight,
                    opacity: opacity,
                  };

                  const textStyle = {
                    textAlign: 'center',
                    fontWeight: '600',
                    color: textColor,
                    fontSize: 14,
                  };

                  function handleTimePress() {
                    if (isDisabled === false) {
                      setSelectedTime(time);
                    }
                  }

                  const hasLabel = labelText.length > 0;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={buttonStyle}
                      onPress={handleTimePress}
                      disabled={isDisabled}
                      activeOpacity={0.7}
                    >
                      <Text style={textStyle}>
                        {formatTime12Hour(time)}
                      </Text>
                      {hasLabel === true && (
                        <Text style={{
                          textAlign: 'center',
                          fontSize: 10,
                          color: textColor,
                          marginTop: 2,
                          fontWeight: '700',
                        }}>
                          {labelText}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {hasSelectedTime === true && (
            <View style={{
              backgroundColor: '#ede9fe',
              borderWidth: 2,
              borderColor: '#c4b5fd',
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}>
              <Text style={{
                color: '#5b21b6',
                fontWeight: '700',
                textAlign: 'center',
                fontSize: 16,
              }}>
                ⏰ Selected: {formatTime12Hour(selectedTime)}
              </Text>
            </View>
          )}

          {hasSelectedTime === true && (
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <View style={{
                  backgroundColor: '#9ca3af',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontWeight: '700',
                  }}>
                    3
                  </Text>
                </View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#111827',
                }}>
                  Add Notes (Optional)
                </Text>
              </View>

              <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: '#e5e7eb',
              }}>
                <TextInput
                  style={{
                    fontSize: 16,
                    color: '#111827',
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Any special requests or notes..."
                  placeholderTextColor="#9ca3af"
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                />
              </View>
            </View>
          )}

          {hasSelectedTime === true && (
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 20,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              borderWidth: 2,
              borderColor: '#c4b5fd',
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
                marginBottom: 16,
              }}>
                📋 Booking Summary
              </Text>

              <View>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                  }}>
                    Service
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#111827',
                  }}>
                    {serviceDisplayName}
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                  }}>
                    Date
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#111827',
                  }}>
                    {selectedDate. toLocaleDateString()}
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                  }}>
                    Time
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#111827',
                  }}>
                    {formatTime12Hour(selectedTime)}
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                  }}>
                    Duration
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#111827',
                  }}>
                    {serviceDuration} min
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  paddingTop: 16,
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#111827',
                  }}>
                    Total
                  </Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: '#7c3aed',
                  }}>
                    €{formattedPrice}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>

      {hasSelectedTime === true && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: submitting === true ? '#a78bfa' : '#7c3aed',
            }}
            onPress={handleBooking}
            disabled={submitting}
            activeOpacity={0.7}
          >
            {submitting === true && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '700',
                  marginLeft: 8,
                }}>
                  Booking... 
                </Text>
              </View>
            )}
            {submitting === false && (
              <Text style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '700',
              }}>
                ✓ Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isIOS === true && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelDate}
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
              }}>
                <TouchableOpacity onPress={handleCancelDate}>
                  <Text style={{
                    color: '#7c3aed',
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#111827',
                }}>
                  Select Date
                </Text>
                <TouchableOpacity onPress={handleConfirmDate}>
                  <Text style={{
                    color: '#7c3aed',
                    fontSize: 18,
                    fontWeight: '700',
                  }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}

      {isIOS === false && showDatePicker === true && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
}

export default BookAppointment;