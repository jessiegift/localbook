import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';

import Button from '../../common/Button';

const ManageAppointmentScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'upcoming', 'past'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.15:8080/api/appointments/business/${user.businessId}?filter=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            try {
              const response = await fetch(
                `http://192.168.1.15:8080/api/appointments/${appointmentId}/complete?businessId=${user.businessId}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Appointment completed!');
                fetchAppointments();
              } else {
                Alert.alert('Error', 'Failed to complete appointment');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `http://192.168.1.15:8080/api/appointments/${appointmentId}/cancel?userId=${user.id}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Appointment cancelled');
                fetchAppointments();
              } else {
                Alert.alert('Error', 'Failed to cancel appointment');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAppointment = ({ item }) => {
    const { date, time } = formatDateTime(item.dateTime);
    const isCompleted = item.status?.toUpperCase() === 'COMPLETED';
    const isCancelled = item.status?.toUpperCase() === 'CANCELLED';
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm mb-3 mx-4">
        {/* Status Badge */}
        <View className="flex-row justify-between items-start mb-3">
          <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
            <Text className="text-xs font-bold uppercase">
              {item.status}
            </Text>
          </View>
          <Text className="text-sm font-bold text-green-600">
            ${item.service?.price || 0}
          </Text>
        </View>

        {/* Client Info */}
        <Text className="text-lg font-bold text-gray-900 mb-1">
          {item.clientName || item.client?.name}
        </Text>

        {/* Service */}
        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-600">
            📋 {item.serviceName || item.service?.name}
          </Text>
        </View>

        {/* Date & Time */}
        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-600">
            📅 {date} • ⏰ {time}
          </Text>
        </View>

        {/* Duration */}
        {item.service?.duration && (
          <Text className="text-sm text-gray-600 mb-3">
            ⏱️ {item.service.duration} min
          </Text>
        )}

        {/* Actions - Only for confirmed appointments */}
        {item.status?.toUpperCase() === 'CONFIRMED' && (
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
            <Button
              title="✅ Complete"
              variant="success"
              size="small"
              onPress={() => handleComplete(item.id)}
              className="flex-1"
            />
            <Button
              title="❌ Cancel"
              variant="danger"
              size="small"
              onPress={() => handleCancel(item.id)}
              className="flex-1"
            />
          </View>
        )}

        {/* Show completed/cancelled message */}
        {(isCompleted || isCancelled) && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500 text-center">
              {isCompleted ? '✅ This appointment is completed' : '❌ This appointment was cancelled'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading appointments..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Simplified Tabs - No "Pending" needed */}
      <View className="bg-white flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab('today')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'today' ? 'border-green-500' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === 'today' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'upcoming' ? 'border-green-500' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === 'upcoming' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'past' ? 'border-green-500' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === 'past' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchAppointments();
          }} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

export default ManageAppointmentScreen;