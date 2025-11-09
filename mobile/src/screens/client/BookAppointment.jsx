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

const BookAppointment = ({ route, navigation }) => {
  const { business, service } = route.params;
  const { user, token } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date()); // Temporary date for modal
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate]);

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(hour.toString().padStart(2, '0') + ':00');
      slots.push(hour.toString().padStart(2, '0') + ':30');
    }
    
    setAvailableSlots(slots);
  };

  const handleOpenDatePicker = () => {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        setSelectedTime(null);
      }
    } else {
      // iOS - update temp date as user scrolls
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirmDate = () => {
    setSelectedDate(tempDate);
    setSelectedTime(null);
    setShowDatePicker(false);
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleBooking = async () => {
    if (!selectedTime) {
      Alert.alert('Missing Information', 'Please select a time slot');
      return;
    }

    // Check if we have necessary data
    if (!user || !user.id) {
      Alert.alert('Error', 'User information not found. Please restart the app.');
      console.error('❌ User is undefined:', user);
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication token missing. Please log in again.');
      console.error('❌ Token is undefined');
      return;
    }

    console.log('🔍 DEBUG - User info:', {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      hasToken: !!token
    });

    console.log('🔍 DEBUG - Business info:', {
      businessId: business.id,
      businessName: business.businessName || business.name
    });

    console.log('🔍 DEBUG - Service info:', {
      serviceId: service.id,
      serviceName: service.serviceName || service.name,
      servicePrice: service.price
    });

    setSubmitting(true);

    try {
      // Format date and time
      const dateStr = selectedDate.toISOString().split('T')[0];
      const appointmentDateTime = `${dateStr}T${selectedTime}:00`;

      console.log('🔍 DEBUG - DateTime:', appointmentDateTime);

      // Build the full URL with query parameters
      const baseUrl = 'http://192.168.1.15:8080/api/appointments';
      const params = [
        `clientId=${user.id}`,
        `businessId=${business.id}`,
        `serviceId=${service.id}`,
        `dateTime=${encodeURIComponent(appointmentDateTime)}`,
      ];

      // Add notes only if not empty
      if (notes.trim()) {
        params.push(`notes=${encodeURIComponent(notes.trim())}`);
      }

      const url = `${baseUrl}?${params.join('&')}`;
      
      console.log('📤 FULL URL:', url);
      console.log('📤 Individual params:');
      params.forEach(param => console.log('   -', param));

      // Send POST request with NO BODY
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ Booking successful! Data:', data);
        } catch (e) {
          console.log('✅ Booking successful! (no JSON response)');
        }
        
        Alert.alert(
          'Success! ✅',
          `Your appointment is confirmed for ${formatDate(selectedDate)} at ${formatTime12Hour(selectedTime)}`,
          [
            {
              text: 'View Bookings',
              onPress: () => navigation.navigate('MyBookings'),
            },
            {
              text: 'Done',
              onPress: () => navigation.navigate('ClientHome'),
            },
          ]
        );
      } else {
        console.error('❌ Booking failed with status:', response.status);
        console.error('❌ Response text:', responseText);
        
        let errorMessage = 'Failed to book appointment';
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.message || data.error || errorMessage;
        } catch (e) {
          // Use response text as error
          errorMessage = responseText || errorMessage;
        }
        
        Alert.alert('Booking Failed', errorMessage);
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      console.error('❌ Error details:', error.message);
      Alert.alert('Error', `Network error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Service Summary */}
        <View className="bg-blue-500 pt-4 pb-6 px-5">
          <Text className="text-white text-2xl font-bold mb-3">
            Book Appointment
          </Text>
          <View className="bg-white/20 rounded-xl p-4">
            <Text className="text-white text-lg font-bold mb-2">
              {service.serviceName || service.name}
            </Text>
            <Text className="text-white/90 text-sm mb-3">
              at {business.businessName || business.name}
            </Text>
            <View className="flex-row items-center">
              <View className="bg-white/30 px-3 py-1 rounded-full mr-2">
                <Text className="text-white font-bold">
                  €{service.price.toFixed(2)}
                </Text>
              </View>
              <View className="bg-white/30 px-3 py-1 rounded-full">
                <Text className="text-white font-semibold">
                  {service.durationMinutes || service.duration} min
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Step 1: Select Date */}
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
          >
            <Text className="text-center text-base font-semibold text-gray-900">
              📅 {formatDate(selectedDate)}
            </Text>
            <Text className="text-center text-xs text-gray-500 mt-1">
              Tap to change date
            </Text>
          </TouchableOpacity>

          {/* Step 2: Select Time */}
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Select Time
            </Text>
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <View className="flex-row flex-wrap">
                {availableSlots.map((time, index) => {
                  const isSelected = selectedTime === time;
                  const isLastInRow = (index + 1) % 3 === 0;

                  return (
                    <TouchableOpacity
                      key={index}
                      className={`w-[31%] py-3 rounded-lg border-2 mb-3 ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                      style={{ marginRight: isLastInRow ? 0 : '3.5%' }}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {formatTime12Hour(time)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {selectedTime && (
            <View className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl mb-6">
              <Text className="text-blue-800 font-bold text-center text-base">
                ⏰ Selected: {formatTime12Hour(selectedTime)}
              </Text>
            </View>
          )}

          {/* Step 3: Add Notes (Optional) */}
          {selectedTime && (
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

          {/* Booking Summary */}
          {selectedTime && (
            <View className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-200">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                📋 Booking Summary
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Service</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {service.serviceName || service.name}
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
                    {service.durationMinutes || service.duration} min
                  </Text>
                </View>

                <View className="flex-row justify-between py-3 pt-4">
                  <Text className="text-lg font-bold text-gray-900">Total</Text>
                  <Text className="text-2xl font-bold text-blue-600">
                    €{service.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Extra space for fixed button */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedTime && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
          <TouchableOpacity
            className={`py-4 rounded-xl ${
              submitting ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
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

      {/* Date Picker Modal - Calendar View for Both iOS & Android */}
      {Platform.OS === 'ios' ? (
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
        showDatePicker && (
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