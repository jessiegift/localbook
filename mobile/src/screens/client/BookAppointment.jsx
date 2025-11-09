import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';


const BookAppointment = ({ route, navigation }) => {
  const { business } = route.params;
  const { token } = useAuth();

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${business.id}/available-slots?date=${dateStr}&serviceId=${selectedService.id}`,
        {
          
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.slots || data);
      } else {
        Alert.alert('Error', 'Failed to load available time slots');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleBooking = async () => {
    // Validation
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://192.168.1.15:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        
        },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your appointment has been booked!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('MyBookings');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderServiceItem = (service) => (
    <TouchableOpacity
      key={service.id}
      style={[
        styles.serviceItem,
        selectedService?.id === service.id && styles.serviceItemSelected,
      ]}
      onPress={() => {
        setSelectedService(service);
        setSelectedTime(null); // Reset time when service changes
      }}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDuration}>{service.duration} min</Text>
      </View>
      <Text style={styles.servicePrice}>${service.price}</Text>
      {selectedService?.id === service.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTimeSlot = (slot) => (
    <TouchableOpacity
      key={slot}
      style={[
        styles.timeSlot,
        selectedTime === slot && styles.timeSlotSelected,
      ]}
      onPress={() => setSelectedTime(slot)}
    >
      <Text
        style={[
          styles.timeSlotText,
          selectedTime === slot && styles.timeSlotTextSelected,
        ]}
      >
        {slot}
      </Text>
    </TouchableOpacity>
  );

  // Get minimum date (today)
  const minDate = new Date();
  
  // Get maximum date (60 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Business Info */}
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessLocation}>{business.location}</Text>
          </View>

          {/* Step 1: Select Service */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Service</Text>
            {business.services && business.services.length > 0 ? (
              business.services.map(renderServiceItem)
            ) : (
              <Text style={styles.emptyText}>No services available</Text>
            )}
          </View>

          {/* Step 2: Select Date */}
          {selectedService && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Select Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
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
          )}

          {/* Step 3: Select Time */}
          {selectedService && selectedDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Select Time</Text>
              
              {loading ? (
                <ActivityIndicator color="#007AFF" style={{ marginTop: 20 }} />
              ) : availableSlots.length > 0 ? (
                <View style={styles.timeSlotsContainer}>
                  {availableSlots.map(renderTimeSlot)}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  No available time slots for this date
                </Text>
              )}
            </View>
          )}

          {/* Booking Summary */}
          {selectedService && selectedTime && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service:</Text>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>
                  {selectedService.duration} min
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total:</Text>
                <Text style={styles.summaryTotalValue}>
                  ${selectedService.price}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Confirm Button (Fixed at bottom) */}
      {selectedService && selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, submitting && styles.buttonDisabled]}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 100,
  },
  businessInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  businessLocation: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 12,
    position: 'relative',
  },
  serviceItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#999',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#99c9ff',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BookAppointment;