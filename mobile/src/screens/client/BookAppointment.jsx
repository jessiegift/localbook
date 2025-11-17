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

  function generateTimeSlots() {
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
    console.log('🎯 === BOOKING PROCESS STARTED ===');
    
    const hasUser = user !== null && user !== undefined;
    if (hasUser === false) {
      console.log('❌ User is not logged in');
      
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
      console.log('❌ Token is undefined');
      const error = new Error();
      const errorStack = error.stack;
      console.log('Error Stack:', errorStack);
      
      const alertButtons = [
        {
          text: 'OK',
          onPress: function() {
            navigation.navigate('Login');
          }
        }
      ];
      
      Alert.alert(
        'Session Expired',
        'Please login again to continue',
        alertButtons
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
          const statusString = responseStatus.toString();
          errorMessage = 'Server error (' + statusString + '): Empty response. Please check server logs.';
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

          {loading === true ? (
            <View style={{
              paddingVertical: 32,
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color="#7c3aed" />
            </View>
          ) : (
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
                  const isSelected = selectedTime === time;
                  const indexPlusOne = index + 1;
                  const remainder = indexPlusOne % 3;
                  const isLastInRow = remainder === 0;

                  let buttonBgColor = '#ffffff';
                  let buttonBorderColor = '#d1d5db';
                  let textColor = '#374151';

                  if (isSelected === true) {
                    buttonBgColor = '#7c3aed';
                    buttonBorderColor = '#7c3aed';
                    textColor = '#ffffff';
                  }

                  let marginRight = 8;
                  if (isLastInRow === true) {
                    marginRight = 0;
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
                  };

                  const textStyle = {
                    textAlign: 'center',
                    fontWeight: '600',
                    color: textColor,
                  };

                  return (
                    <TouchableOpacity
                      key={index}
                      style={buttonStyle}
                      onPress={function() {
                        setSelectedTime(time);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={textStyle}>
                        {formatTime12Hour(time)}
                      </Text>
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
                    {selectedDate.toLocaleDateString()}
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
            {submitting === true ? (
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
            ) : (
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

      {isIOS === true ? (
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
}

export default BookAppointment;