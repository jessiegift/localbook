import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';


const BusinessHomeScreen = ({ navigation }) => {
 const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    monthRevenue: 0,
    totalCustomers: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.15:8080/api/business/${user.businessId}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTodaySchedule(data.todaySchedule || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleComplete = async (appointmentId) => {
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
        fetchDashboardData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete appointment');
    }
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-green-500 pt-14 pb-6 px-5">
        <Text className="text-white text-2xl font-bold mb-1">
          Good Morning! 👋
        </Text>
        <Text className="text-green-100 text-base">
          {user?.businessName || user?.name}
        </Text>
      </View>

      {/* Quick Stats Cards */}
      <View className="px-5 -mt-0 mb-4">
        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row justify-around">
            {/* Today */}
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900">
                {stats.todayAppointments}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">Today</Text>
            </View>

            {/* This Week */}
            <View className="items-center border-l border-r border-gray-200 px-6">
              <Text className="text-3xl font-bold text-gray-900">
                {stats.weekAppointments}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">This Week</Text>
            </View>

            {/* Revenue */}
            <View className="items-center">
              <Text className="text-3xl font-bold text-green-600">
                ${stats.monthRevenue}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">Revenue</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-5 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Quick Actions
        </Text>
        
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="bg-white rounded-xl p-4 shadow-sm flex-1 mr-2 items-center"
            onPress={() => navigation.navigate('ManageAppointments')}
          >
            <Text className="text-3xl mb-2">📋</Text>
            <Text className="text-sm font-semibold text-gray-700 text-center">
              Appointments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2 items-center"
            onPress={() => navigation.navigate('ManageServices')}
          >
            <Text className="text-3xl mb-2">⚙️</Text>
            <Text className="text-sm font-semibold text-gray-700 text-center">
              Services
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TODAY'S SCHEDULE - Most Important Section */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">
            Today's Schedule 📅
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ManageAppointments')}>
            <Text className="text-green-600 font-semibold text-sm">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {todaySchedule.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-5xl mb-3">🎉</Text>
            <Text className="text-gray-500 font-semibold text-center">
              No appointments today
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Enjoy your free time!
            </Text>
          </View>
        ) : (
          todaySchedule.map((appointment, index) => (
            <View 
              key={appointment.id}
              className="bg-white rounded-xl p-4 shadow-sm mb-3"
            >
              {/* Time & Status */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                    <Text className="text-green-800 font-bold text-base">
                      {formatTime(appointment.dateTime)}
                    </Text>
                  </View>
                  {appointment.status === 'COMPLETED' && (
                    <View className="bg-blue-100 px-2 py-1 rounded">
                      <Text className="text-blue-800 text-xs font-bold">✓ DONE</Text>
                    </View>
                  )}
                </View>
                <Text className="text-green-600 font-bold text-base">
                  ${appointment.service?.price || 0}
                </Text>
              </View>

              {/* Customer Name */}
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {appointment.clientName || appointment.client?.name}
              </Text>

              {/* Service */}
              <Text className="text-sm text-gray-600 mb-3">
                {appointment.serviceName || appointment.service?.name} • {appointment.service?.duration} min
              </Text>

              {/* Notes */}
              {appointment.notes && (
                <View className="bg-yellow-50 px-3 py-2 rounded-lg mb-3">
                  <Text className="text-xs text-gray-600">
                    💬 {appointment.notes}
                  </Text>
                </View>
              )}

              {/* Quick Actions */}
              {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                <View className="flex-row gap-2">
                  <Button
                    title="✓ Complete"
                    variant="success"
                    size="small"
                    onPress={() => handleComplete(appointment.id)}
                    className="flex-1"
                  />
                  <TouchableOpacity 
                    className="flex-1 bg-gray-100 rounded-lg items-center justify-center py-2"
                    onPress={() => {/* Call customer */}}
                  >
                    <Text className="text-sm font-semibold text-gray-700">📞 Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Business Info Card */}
      <View className="px-5 mb-8">
        <TouchableOpacity 
          className="bg-white rounded-xl p-4 shadow-sm flex-row justify-between items-center"
          onPress={() => navigation.navigate('BusinessProfile')}
        >
          <View>
            <Text className="text-base font-bold text-gray-900 mb-1">
              My Business Profile
            </Text>
            <Text className="text-sm text-gray-600">
              Update contact info, and more
            </Text>
          </View>
          <Text className="text-2xl">🏪</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BusinessHomeScreen;