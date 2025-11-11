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

const BookAppointment = function(props) {
  const route = props.route;
  const navigation = props.navigation;
  const business = route.params.business;
  const service = route.params.service;
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
    generateTimeSlots();
  }, [selectedDate]);

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

  const handleOpenDatePicker = function() {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  };

  const handleDateChange = function(event, date) {
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
  };

  const handleConfirmDate = function() {
    setSelectedDate(tempDate);
    setSelectedTime(null);
    setShowDatePicker(false);
  };

  const handleCancelDate = function() {
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
    
    const formattedTime = hour12.toString() + ':' + minutes + ' ' + ampm;
    return formattedTime;
  };

  const handleBooking = async function() {
    console.log('🎯 === BOOKING PROCESS STARTED ===');
    
    const hasUser = user !== null && user !== undefined;
    if (hasUser === false) {
      console.log('❌ User is not logged in');
      Alert.alert(
        'Login Required',
        'Please login to book an appointment',
        [
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
        ]
      );
      return;
    }

    const hasToken = token !== null && token !== undefined;
    if (hasToken === false) {
      console.log('❌ Token is undefined');
      const error = new Error();
      const errorStack = error.stack;
      console.log('Error Stack:', errorStack);
      Alert.alert(
        'Session Expired',
        'Please login again to continue',
        [
          {
            text: 'OK',
            onPress: function() {
              navigation.navigate('Login');
            }
          }
        ]
      );
      return;
    }

    const userId = user.id;
    console.log('✅ User ID:', userId);
    
    let tokenExists = 'No';
    if (hasToken === true) {
      tokenExists = 'Yes';
    }
    console.log('✅ Token exists:', tokenExists);
    console.log('📋 User data:', user);

    const hasSelectedDate = selectedDate !== null && selectedDate !== undefined;
    const hasSelectedTime = selectedTime !== null && selectedTime !== undefined;
    
    const hasBothDateAndTime = hasSelectedDate === true && hasSelectedTime === true;
    if (hasBothDateAndTime === false) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    const userName = user.name;
    const userEmail = user.email;
    const hasTokenBool = token !== null && token !== undefined;
    
    const userInfo = {
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      hasToken: hasTokenBool
    };
    console.log('🔍 DEBUG - User info:', userInfo);

    let businessName = business.name;
    const hasBusinessName = business.businessName !== null && business.businessName !== undefined;
    if (hasBusinessName === true) {
      businessName = business.businessName;
    }

    const businessId = business.id;
    const businessInfo = {
      businessId: businessId,
      businessName: businessName
    };
    console.log('🔍 DEBUG - Business info:', businessInfo);

    let serviceName = service.name;
    const hasServiceName = service.serviceName !== null && service.serviceName !== undefined;
    if (hasServiceName === true) {
      serviceName = service.serviceName;
    }

    const serviceId = service.id;
    const servicePrice = service.price;
    const serviceInfo = {
      serviceId: serviceId,
      serviceName: serviceName,
      servicePrice: servicePrice
    };
    console.log('🔍 DEBUG - Service info:', serviceInfo);

    setSubmitting(true);

    try {
      const dateISOString = selectedDate.toISOString();
      const dateParts = dateISOString.split('T');
      const dateStr = dateParts[0];
      const appointmentDateTime = dateStr + 'T' + selectedTime + ':00';

      console.log('🔍 DEBUG - DateTime:', appointmentDateTime);
      console.log('🔍 DEBUG - Selected Date Object:', selectedDate);
      console.log('🔍 DEBUG - Selected Time String:', selectedTime);

      const baseUrl = 'http://192.168.1.15:8080/api/appointments';
      
      const userIdParam = 'userId=' + userId.toString();
      const businessIdParam = 'businessId=' + businessId.toString();
      const serviceIdParam = 'serviceId=' + serviceId.toString();
      const encodedDateTime = encodeURIComponent(appointmentDateTime);
      const dateTimeParam = 'dateTime=' + encodedDateTime;
      
      const params = [];
      params.push(userIdParam);
      params.push(businessIdParam);
      params.push(serviceIdParam);
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
      
      console.log('📤 FULL URL:', url);
      console.log('📤 Individual params:');
      
      let paramIndex = 0;
      while (paramIndex < params.length) {
        const param = params[paramIndex];
        console.log('   -', param);
        paramIndex = paramIndex + 1;
      }

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };
      console.log('📤 Sending request with headers:', requestHeaders);

      const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
      };
      
      const response = await fetch(url, requestOptions);

      const responseStatus = response.status;
      const responseStatusText = response.statusText;
      const isResponseOk = response.ok;
      
      console.log('📥 Response status:', responseStatus);
      console.log('📥 Response statusText:', responseStatusText);
      console.log('📥 Response ok:', isResponseOk);

      const responseText = await response.text();
      const responseTextLength = responseText.length;
      
      console.log('📥 Response text:', responseText);
      console.log('📥 Response text length:', responseTextLength);

      if (isResponseOk === true) {
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ Booking successful! Data:', data);
        } catch (parseError) {
          const parseErrorMessage = parseError.message;
          console.log('✅ Booking successful! (no JSON response)');
          console.log('Parse error:', parseErrorMessage);
        }
        
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
        
        Alert.alert('Success! ✅', successMessage, alertButtons);
      } else {
        console.error('❌ Booking failed with status:', responseStatus);
        console.error('❌ Response text:', responseText);
        
        const responseHeaders = response.headers;
        console.error('❌ Response headers:', responseHeaders);
        
        let errorMessage = 'Failed to book appointment';
        
        const isEmpty = responseTextLength === 0;
        if (isEmpty === true) {
          errorMessage = 'Server error (' + responseStatus.toString() + '): Empty response. Please check server logs.';
          console.error('❌ Empty response body from server');
        } else {
          try {
            const errorData = JSON.parse(responseText);
            console.log('❌ Parsed error data:', errorData);
            
            const message = errorData.message;
            const error = errorData.error;
            const timestamp = errorData.timestamp;
            const path = errorData.path;
            
            console.log('❌ Error message:', message);
            console.log('❌ Error type:', error);
            console.log('❌ Error timestamp:', timestamp);
            console.log('❌ Error path:', path);
            
            const hasMessage = message !== null && message !== undefined;
            const hasError = error !== null && error !== undefined;
            
            if (hasMessage === true) {
              errorMessage = message;
            } else if (hasError === true) {
              errorMessage = error;
            }
          } catch (parseError) {
            const parseErrorMessage = parseError.message;
            console.error('❌ Failed to parse error response:', parseErrorMessage);
            
            const hasResponseText = responseText !== null && responseText !== undefined;
            const responseTextNotEmpty = responseText.length > 0;
            const hasValidResponseText = hasResponseText === true && responseTextNotEmpty === true;
            
            if (hasValidResponseText === true) {
              errorMessage = responseText;
            }
          }
        }
        
        Alert.alert('Booking Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message;
      const errorStack = error.stack;
      
      console.error('❌ Network Error:', error);
      console.error('❌ Error details:', errorMessage);
      console.error('❌ Error stack:', errorStack);
      
      const alertMessage = 'Network error: ' + errorMessage;
      Alert.alert('Error', alertMessage);
    } finally {
      setSubmitting(false);
    }
  };

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
  const hasBusinessName = business.businessName !== null && business.businessName !== undefined;
  if (hasBusinessName === true) {
    businessDisplayName = business.businessName;
  }

  let serviceDuration = service.duration;
  const hasDurationMinutes = service.durationMinutes !== null && service.durationMinutes !== undefined;
  if (hasDurationMinutes === true) {
    serviceDuration = service.durationMinutes;
  }

  const servicePrice = service.price;
  const formattedPrice = servicePrice.toFixed(2);

  const hasSelectedTime = selectedTime !== null && selectedTime !== undefined;

  const platformOS = Platform.OS;
  const isIOS = platformOS === 'ios';

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-blue-500 pt-4 pb-6 px-5">
          <Text className="text-white text-2xl font-bold mb-3">
            Book Appointment
          </Text>
          <View className="bg-white/20 rounded-xl p-4">
            <Text className="text-white text-lg font-bold mb-2">
              {serviceDisplayName}
            </Text>
            <Text className="text-white/90 text-sm mb-3">
              at {businessDisplayName}
            </Text>
            <View className="flex-row items-center">
              <View className="bg-white/30 px-3 py-1 rounded-full mr-2">
                <Text className="text-white font-bold">
                  €{formattedPrice}
                </Text>
              </View>
              <View className="bg-white/30 px-3 py-1 rounded-full">
                <Text className="text-white font-semibold">
                  {serviceDuration} min
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 py-5">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Select Date
            </Text>
          </View>

          <TouchableOpacity
            className="bg-white border-2 border-blue-500 rounded-xl p-4 mb-6 active:bg-blue-50"
            onPress={handleOpenDatePicker}
            activeOpacity={0.7}
          >
            <Text className="text-center text-base font-semibold text-gray-900">
              📅 {formatDate(selectedDate)}
            </Text>
            <Text className="text-center text-xs text-gray-500 mt-1">
              Tap to change date
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-4">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Select Time
            </Text>
          </View>

          {loading === true ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <View className="flex-row flex-wrap">
                {availableSlots.map(function(time, index) {
                  const isSelected = selectedTime === time;
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
                        setSelectedTime(time);
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
          )}

          {hasSelectedTime === true && (
            <View className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl mb-6">
              <Text className="text-blue-800 font-bold text-center text-base">
                ⏰ Selected: {formatTime12Hour(selectedTime)}
              </Text>
            </View>
          )}

          {hasSelectedTime === true && (
            <>
              <View className="flex-row items-center mb-4">
                <View className="bg-gray-400 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">3</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Add Notes (Optional)
                </Text>
              </View>

              <View className="bg-white rounded-xl p-4 shadow-sm mb-6 border-2 border-gray-200">
                <TextInput
                  className="text-base text-gray-900 min-h-[80px]"
                  placeholder="Any special requests or notes..."
                  placeholderTextColor="#9ca3af"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </>
          )}

          {hasSelectedTime === true && (
            <View className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-200">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                📋 Booking Summary
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Service</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {serviceDisplayName}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Date</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Time</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatTime12Hour(selectedTime)}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Duration</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {serviceDuration} min
                  </Text>
                </View>

                <View className="flex-row justify-between py-3 pt-4">
                  <Text className="text-lg font-bold text-gray-900">Total</Text>
                  <Text className="text-2xl font-bold text-blue-600">
                    €{formattedPrice}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {hasSelectedTime === true && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
          <TouchableOpacity
            className={submitting === true ? 'py-4 rounded-xl bg-blue-400' : 'py-4 rounded-xl bg-blue-600'}
            onPress={handleBooking}
            disabled={submitting}
            activeOpacity={0.7}
          >
            {submitting === true ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-base font-bold ml-2">
                  Booking...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                ✓ Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isIOS === true ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelDate}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <TouchableOpacity onPress={handleCancelDate}>
                  <Text className="text-blue-500 text-lg font-semibold">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Select Date</Text>
                <TouchableOpacity onPress={handleConfirmDate}>
                  <Text className="text-blue-500 text-lg font-bold">Done</Text>
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
      ) : (
        showDatePicker === true && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </View>
  );
};

export default BookAppointment;