import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ManageAppointmentScreen = function(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  
  const activeTabState = useState('today');
  const activeTab = activeTabState[0];
  const setActiveTab = activeTabState[1];
  
  const appointmentsState = useState([]);
  const appointments = appointmentsState[0];
  const setAppointments = appointmentsState[1];
  
  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];
  
  const refreshingState = useState(false);
  const refreshing = refreshingState[0];
  const setRefreshing = refreshingState[1];

  const businessIdState = useState(null);
  const businessId = businessIdState[0];
  const setBusinessId = businessIdState[1];

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    fetchBusinessId();
  }, []);

  useEffect(function() {
    const hasBusinessId = businessId !== null && businessId !== undefined;
    if (hasBusinessId === true) {
      fetchAppointments();
    }
  }, [activeTab, businessId]);

  const fetchBusinessId = async function() {
    try {
      const hasUser = user !== null && user !== undefined;
      if (hasUser === false) {
        console.log('❌ No user found');
        setLoading(false);
        return;
      }

      const userId = user.id;
      const userIdString = userId.toString();
      const url = API_BASE_URL + '/businesses/owner/' + userIdString;
      
      console.log('🔍 Fetching business for user:', url);

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };

      const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
      };

      const response = await fetch(url, requestOptions);
      const isResponseOk = response.ok;

      if (isResponseOk === true) {
        const data = await response.json();
        console.log('✅ Business data:', data);
        
        let foundBusinessId = null;
        const isArray = Array.isArray(data);
        
        if (isArray === true) {
          const dataLength = data.length;
          const hasBusinesses = dataLength > 0;
          if (hasBusinesses === true) {
            const firstBusiness = data[0];
            foundBusinessId = firstBusiness.id;
          }
        } else {
          const hasId = data.id !== null && data.id !== undefined;
          if (hasId === true) {
            foundBusinessId = data.id;
          }
        }

        const foundBusiness = foundBusinessId !== null && foundBusinessId !== undefined;
        if (foundBusiness === true) {
          console.log('🏢 Business ID found:', foundBusinessId);
          setBusinessId(foundBusinessId);
        } else {
          console.log('❌ No business found for this user');
          Alert.alert('No Business', 'You need to create a business first.');
          setLoading(false);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch business:', errorText);
        Alert.alert('Error', 'You are not a business owner.');
        setLoading(false);
      }
    } catch (errorObject) {
      console.error('❌ Error fetching business:', errorObject);
      Alert.alert('Error', 'Failed to load business information');
      setLoading(false);
    }
  };

  const fetchAppointments = async function() {
    try {
      console.log('📥 Fetching appointments for business...');
      
      const hasBusinessId = businessId !== null && businessId !== undefined;
      if (hasBusinessId === false) {
        console.log('❌ No business ID');
        setLoading(false);
        return;
      }

      const businessIdString = businessId.toString();
      const url = API_BASE_URL + '/appointments/business/' + businessIdString;
      
      console.log('🔗 Fetching from:', url);
      console.log('📋 Filter:', activeTab);

      const authHeader = 'Bearer ' + token;
      const requestHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      };

      const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
      };

      const response = await fetch(url, requestOptions);
      const responseStatus = response.status;
      
      console.log('📡 Response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        const data = await response.json();
        const dataLength = data.length;
        console.log('✅ Appointments received:', dataLength);

        const now = new Date();
        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth();
        const nowDate = now.getDate();
        
        const todayStart = new Date(nowYear, nowMonth, nowDate, 0, 0, 0);
        const todayEnd = new Date(nowYear, nowMonth, nowDate, 23, 59, 59);

        const filteredAppointments = [];
        
        let appointmentIndex = 0;
        while (appointmentIndex < dataLength) {
          const appointment = data[appointmentIndex];
          const appointmentDateTimeString = appointment.appointmentDateTime;
          const appointmentDate = new Date(appointmentDateTimeString);
          
          const isToday = activeTab === 'today';
          const isUpcoming = activeTab === 'upcoming';
          const isPast = activeTab === 'past';
          
          let shouldInclude = false;
          
          if (isToday === true) {
            const isAfterTodayStart = appointmentDate >= todayStart;
            const isBeforeTodayEnd = appointmentDate <= todayEnd;
            const isTodayAppointment = isAfterTodayStart === true && isBeforeTodayEnd === true;
            
            const appointmentStatus = appointment.status;
            const isConfirmed = appointmentStatus === 'CONFIRMED';
            
            const bothConditions = isTodayAppointment === true && isConfirmed === true;
            shouldInclude = bothConditions;
          } else if (isUpcoming === true) {
            const isFutureAppointment = appointmentDate > todayEnd;
            const appointmentStatus = appointment.status;
            const isConfirmed = appointmentStatus === 'CONFIRMED';
            
            const bothConditions = isFutureAppointment === true && isConfirmed === true;
            shouldInclude = bothConditions;
          } else if (isPast === true) {
            const isPastAppointment = appointmentDate < todayStart;
            const appointmentStatus = appointment.status;
            const isCancelled = appointmentStatus === 'CANCELLED';
            const isCompleted = appointmentStatus === 'COMPLETED';
            
            const eitherCondition = isCancelled === true || isCompleted === true;
            const finalCondition = isPastAppointment === true || eitherCondition === true;
            shouldInclude = finalCondition;
          }
          
          if (shouldInclude === true) {
            filteredAppointments.push(appointment);
          }
          
          appointmentIndex = appointmentIndex + 1;
        }

        const sortedAppointments = filteredAppointments.sort(function(a, b) {
          const dateAString = a.appointmentDateTime;
          const dateBString = b.appointmentDateTime;
          const dateA = new Date(dateAString);
          const dateB = new Date(dateBString);
          
          const isPastTab = activeTab === 'past';
          if (isPastTab === true) {
            const dateATime = dateA.getTime();
            const dateBTime = dateB.getTime();
            const difference = dateBTime - dateATime;
            return difference;
          } else {
            const dateATime = dateA.getTime();
            const dateBTime = dateB.getTime();
            const difference = dateATime - dateBTime;
            return difference;
          }
        });

        const sortedLength = sortedAppointments.length;
        console.log('✅ Filtered appointments:', sortedLength);
        
        setAppointments(sortedAppointments);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch:', errorText);
        Alert.alert('Error', 'Failed to load appointments');
      }
    } catch (errorObject) {
      const errorMessage = errorObject.message;
      console.error('❌ Error fetching appointments:', errorObject);
      Alert.alert('Error', 'Network error: ' + errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleComplete = function(appointmentId) {
    const alertButtons = [
      { 
        text: 'No', 
        style: 'cancel' 
      },
      {
        text: 'Yes, Complete',
        onPress: async function() {
          try {
            const appointmentIdString = appointmentId.toString();
            const businessIdString = businessId.toString();
            const url = API_BASE_URL + '/appointments/' + appointmentIdString + '/complete?businessId=' + businessIdString;
            
            console.log('✅ Completing appointment:', url);

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
            const isResponseOk = response.ok;

            if (isResponseOk === true) {
              Alert.alert('Success', 'Appointment completed!');
              fetchAppointments();
            } else {
              const errorText = await response.text();
              console.error('❌ Failed to complete:', errorText);
              Alert.alert('Error', 'Failed to complete appointment');
            }
          } catch (errorObject) {
            console.error('❌ Error:', errorObject);
            Alert.alert('Error', 'Network error');
          }
        },
      },
    ];

    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      alertButtons
    );
  };

  const handleCancel = function(appointmentId) {
    const alertButtons = [
      { 
        text: 'No', 
        style: 'cancel' 
      },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async function() {
          try {
            const userId = user.id;
            const appointmentIdString = appointmentId.toString();
            const userIdString = userId.toString();
            const url = API_BASE_URL + '/appointments/' + appointmentIdString + '/cancel?userId=' + userIdString;
            
            console.log('❌ Cancelling appointment:', url);

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
            const isResponseOk = response.ok;

            if (isResponseOk === true) {
              Alert.alert('Success', 'Appointment cancelled');
              fetchAppointments();
            } else {
              const errorText = await response.text();
              console.error('❌ Failed to cancel:', errorText);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          } catch (errorObject) {
            console.error('❌ Error:', errorObject);
            Alert.alert('Error', 'Network error');
          }
        },
      },
    ];

    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      alertButtons
    );
  };

  const formatDateTime = function(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const dateOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    const result = {
      date: formattedDate,
      time: formattedTime
    };
    
    return result;
  };

  const getStatusColor = function(status) {
    let color = 'bg-gray-100 text-gray-800';
    
    const hasStatus = status !== null && status !== undefined;
    if (hasStatus === false) {
      return color;
    }
    
    const upperStatus = status.toUpperCase();
    
    const isConfirmed = upperStatus === 'CONFIRMED';
    const isCancelled = upperStatus === 'CANCELLED';
    const isCompleted = upperStatus === 'COMPLETED';
    
    if (isConfirmed === true) {
      color = 'bg-green-100 text-green-800';
    } else if (isCancelled === true) {
      color = 'bg-red-100 text-red-800';
    } else if (isCompleted === true) {
      color = 'bg-blue-100 text-blue-800';
    }
    
    return color;
  };

  const renderAppointment = function(renderProps) {
    const item = renderProps.item;
    
    const appointmentDateTime = item.appointmentDateTime;
    const dateTimeFormatted = formatDateTime(appointmentDateTime);
    const dateFormatted = dateTimeFormatted.date;
    const timeFormatted = dateTimeFormatted.time;
    
    const appointmentStatus = item.status;
    let statusUpper = '';
    const hasStatus = appointmentStatus !== null && appointmentStatus !== undefined;
    if (hasStatus === true) {
      statusUpper = appointmentStatus.toUpperCase();
    }
    
    const isCompleted = statusUpper === 'COMPLETED';
    const isCancelled = statusUpper === 'CANCELLED';
    const isConfirmed = statusUpper === 'CONFIRMED';
    
    let clientName = 'Client';
    const hasUser = item.user !== null && item.user !== undefined;
    if (hasUser === true) {
      const userName = item.user.name;
      const hasUserName = userName !== null && userName !== undefined;
      if (hasUserName === true) {
        clientName = userName;
      }
    }
    
    let serviceName = 'Service';
    const hasService = item.service !== null && item.service !== undefined;
    if (hasService === true) {
      const serviceNameValue = item.service.serviceName;
      const hasServiceName = serviceNameValue !== null && serviceNameValue !== undefined;
      if (hasServiceName === true) {
        serviceName = serviceNameValue;
      }
    }
    
    let servicePrice = 0;
    if (hasService === true) {
      const priceValue = item.service.price;
      const hasPrice = priceValue !== null && priceValue !== undefined;
      if (hasPrice === true) {
        servicePrice = priceValue;
      }
    }
    const formattedPrice = servicePrice.toFixed(2);
    
    let serviceDuration = null;
    if (hasService === true) {
      const durationValue = item.service.durationMinutes;
      const hasDuration = durationValue !== null && durationValue !== undefined;
      if (hasDuration === true) {
        serviceDuration = durationValue;
      }
    }
    
    const statusColorClass = getStatusColor(appointmentStatus);
    
    const hasDuration = serviceDuration !== null;
    const hasNotes = item.notes !== null && item.notes !== undefined;
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mb-3 mx-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className={'px-3 py-1 rounded-full ' + statusColorClass}>
            <Text className="text-xs font-bold uppercase">
              {appointmentStatus}
            </Text>
          </View>
          <Text className="text-sm font-bold text-green-600">
            €{formattedPrice}
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-1">
          {clientName}
        </Text>

        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-600">
            📋 {serviceName}
          </Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-600">
            📅 {dateFormatted} • ⏰ {timeFormatted}
          </Text>
        </View>

        {hasDuration === true && (
          <Text className="text-sm text-gray-600 mb-3">
            ⏱️ {serviceDuration} min
          </Text>
        )}

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

        {isConfirmed === true && (
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-lg mr-2 active:bg-green-600"
              onPress={function() {
                const appointmentId = item.id;
                handleComplete(appointmentId);
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">
                ✅ Complete
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg active:bg-red-600"
              onPress={function() {
                const appointmentId = item.id;
                handleCancel(appointmentId);
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">
                ❌ Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {(isCompleted === true || isCancelled === true) && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500 text-center">
              {isCompleted === true ? '✅ This appointment is completed' : '❌ This appointment was cancelled'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = function() {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-6xl mb-4">📅</Text>
        <Text className="text-gray-500 text-lg font-semibold mb-2">
          No {activeTab} appointments
        </Text>
        <Text className="text-gray-400 text-sm">
          Appointments will appear here
        </Text>
      </View>
    );
  };

  if (loading === true) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-4 text-gray-600">Loading appointments...</Text>
      </View>
    );
  }

  const isTodayTab = activeTab === 'today';
  const isUpcomingTab = activeTab === 'upcoming';
  const isPastTab = activeTab === 'past';

  let todayBorderClass = 'border-transparent';
  if (isTodayTab === true) {
    todayBorderClass = 'border-green-500';
  }
  
  let todayTextClass = 'text-gray-500';
  if (isTodayTab === true) {
    todayTextClass = 'text-green-600';
  }
  
  let upcomingBorderClass = 'border-transparent';
  if (isUpcomingTab === true) {
    upcomingBorderClass = 'border-green-500';
  }
  
  let upcomingTextClass = 'text-gray-500';
  if (isUpcomingTab === true) {
    upcomingTextClass = 'text-green-600';
  }
  
  let pastBorderClass = 'border-transparent';
  if (isPastTab === true) {
    pastBorderClass = 'border-green-500';
  }
  
  let pastTextClass = 'text-gray-500';
  if (isPastTab === true) {
    pastTextClass = 'text-green-600';
  }

  const todayTabClassName = 'flex-1 py-4 items-center border-b-2 ' + todayBorderClass;
  const todayTextClassName = 'font-semibold ' + todayTextClass;
  
  const upcomingTabClassName = 'flex-1 py-4 items-center border-b-2 ' + upcomingBorderClass;
  const upcomingTextClassName = 'font-semibold ' + upcomingTextClass;
  
  const pastTabClassName = 'flex-1 py-4 items-center border-b-2 ' + pastBorderClass;
  const pastTextClassName = 'font-semibold ' + pastTextClass;

  const listContentStyle = { paddingVertical: 16 };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={function() {
            setActiveTab('today');
          }}
          className={todayTabClassName}
        >
          <Text className={todayTextClassName}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={function() {
            setActiveTab('upcoming');
          }}
          className={upcomingTabClassName}
        >
          <Text className={upcomingTextClassName}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={function() {
            setActiveTab('past');
          }}
          className={pastTabClassName}
        >
          <Text className={pastTextClassName}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={function(item) {
          const itemId = item.id;
          const itemIdString = itemId.toString();
          return itemIdString;
        }}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={function() {
              setRefreshing(true);
              fetchAppointments();
            }}
            colors={['#22c55e']}
            tintColor="#22c55e"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

export default ManageAppointmentScreen;