import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, LinearGradient } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import Button from '../../common/Button';

function BusinessHomeScreen(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;

  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  const refreshingState = useState(false);
  const refreshing = refreshingState[0];
  const setRefreshing = refreshingState[1];

  const statsState = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    monthRevenue: 0,
    totalCustomers: 0,
  });
  const stats = statsState[0];
  const setStats = statsState[1];

  const scheduleState = useState([]);
  const todaySchedule = scheduleState[0];
  const setTodaySchedule = scheduleState[1];

  // ✅ Ratings state
  const ratingsState = useState({
    averageRating: 0,
    totalRatings: 0,
    recentRatings: [],
  });
  const ratings = ratingsState[0];
  const setRatings = ratingsState[1];

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      if (!user || !user.businessId) {
        console.error('Cannot fetch dashboard - missing user or businessId');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const businessId = Number(user.businessId);
      
      if (isNaN(businessId) || businessId <= 0) {
        console.error('Invalid businessId:', user.businessId);
        Alert.alert('Error', 'Invalid business ID: ' + user.businessId);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const url = API_BASE_URL + '/businesses/' + businessId + '/dashboard';
      console.log('=== FETCHING DASHBOARD ===');
      console.log('Full URL:', url);
      console.log('Business ID (type):', typeof businessId, businessId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== DASHBOARD DATA RECEIVED ===');
        
        if (data.stats) {
          console.log('Stats:', data.stats);
          setStats({
            todayAppointments: data.stats.todayAppointments || 0,
            weekAppointments: data.stats.weekAppointments || 0,
            monthRevenue: data.stats.monthRevenue || 0,
            totalCustomers: data.stats.totalCustomers || 0,
          });
        }
        
        const schedule = data.todaySchedule || [];
        console.log('Today schedule count:', schedule.length);
        setTodaySchedule(schedule);

        // ✅ Fetch ratings
        await fetchBusinessRatings(businessId);
      } else {
        console.error('=== ERROR RESPONSE ===');
        const errorText = await response.text();
        console.error('Status:', response.status);
        console.error('Error body:', errorText);
        
        Alert.alert(
          'Error Loading Dashboard', 
          'Status: ' + response.status + '\n' +
          'Please check backend logs for details.'
        );
      }
    } catch (error) {
      console.error('=== NETWORK ERROR ===');
      console.error('Error message:', error.message);
      
      Alert.alert(
        'Network Error', 
        'Could not connect to server.\n\n' +
        'Error: ' + error.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ✅ Fetch ratings function
  async function fetchBusinessRatings(businessId) {
    try {
      console.log('📥 Fetching ratings for business:', businessId);
      
      const url = API_BASE_URL + '/ratings/business/' + businessId;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const ratingsArray = data.ratings !== null && data.ratings !== undefined ? data.ratings : [];
        const avgRating = data.averageRating !== null && data.averageRating !== undefined ? data.averageRating : 0;
        const totalCount = data.totalRatings !== null && data.totalRatings !== undefined ? data.totalRatings : 0;
        
        // Get last 3 ratings
        const recentRatings = ratingsArray.slice(0, 3);
        
        console.log('✅ Ratings received:', ratingsArray.length);
        console.log('⭐ Average rating:', avgRating);
        
        setRatings({
          averageRating: avgRating,
          totalRatings: totalCount,
          recentRatings: recentRatings,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      // Don't alert, just log
    }
  }

  function onRefresh() {
    console.log('Refreshing dashboard...');
    setRefreshing(true);
    fetchDashboardData();
  }

  async function handleComplete(appointmentId) {
    try {
      // Debug logging
      console.log('🔍 User object:', user);
      console.log('🔍 user.id:', user?.id);
      console.log('🔍 user.businessId:', user?.businessId);
      
      // Check if user exists and has either id or businessId
      if (!user) {
        console.error('❌ User is missing');
        Alert.alert('Error', 'User information not available');
        return;
      }

      // Try to use user.id first, fallback to user.businessId if needed
      const userIdToSend = user.id || user.businessId;
      
      if (!userIdToSend) {
        console.error('❌ Neither user.id nor user.businessId exists');
        Alert.alert('Error', 'User ID not available');
        return;
      }

      const url = API_BASE_URL + '/appointments/' + appointmentId + '/complete?userId=' + userIdToSend;
      console.log('✅ Completing appointment:', appointmentId);
      console.log('✅ Sending userId:', userIdToSend);
      console.log('✅ Full URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Appointment completed! ✅');
        fetchDashboardData();
      } else {
        const errorText = await response.text();
        console.error('❌ Complete appointment failed:', errorText);
        Alert.alert('Error', 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('❌ Error completing appointment:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    }
  }

  function formatTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  function formatRevenue(amount) {
    if (amount === 0) {
      return '0.00';
    }
    return amount.toFixed(2);
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading dashboard..." />;
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ backgroundColor: '#7c3aed', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
          Good Morning! 👋
        </Text>
        <Text style={{ color: '#e9d5ff', fontSize: 16 }}>
          {user && user.businessName ? user.businessName : user && user.name ? user.name : ''}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ paddingHorizontal: 20, marginTop: 0, marginBottom: 16 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>
                {stats.todayAppointments}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Today</Text>
            </View>

            <View style={{ alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>
                {stats.weekAppointments}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>This Week</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#7c3aed' }}>
                ${formatRevenue(stats.monthRevenue)}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Revenue</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ✅ Ratings Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <TouchableOpacity 
          onPress={function() { navigation.navigate('BusinessRatings'); }}
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 16, 
            padding: 16, 
            shadowColor: '#000', 
            shadowOpacity: 0.1,
            borderLeftWidth: 4,
            borderLeftColor: '#a855f7',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              ⭐ Customer Ratings
            </Text>
            <TouchableOpacity 
              onPress={function() { navigation.navigate('BusinessRatings'); }}
              style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}
            >
              <Text style={{ color: '#a855f7', fontSize: 12, fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Display */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 42, fontWeight: '700', color: '#a855f7', marginRight: 12 }}>
              {ratings.averageRating.toFixed(1)}
            </Text>
            <View>
              <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={{ fontSize: 16 }}>
                    {star <= Math.round(ratings.averageRating) ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {ratings.totalRatings} {ratings.totalRatings === 1 ? 'rating' : 'ratings'}
              </Text>
            </View>
          </View>

          {/* Recent Ratings Preview */}
          {ratings.recentRatings.length > 0 && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 }}>
              {ratings.recentRatings.map((rating, index) => (
                <View key={index} style={{ marginBottom: index < ratings.recentRatings.length - 1 ? 8 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
                      {rating.user?.name || 'Anonymous'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#a855f7', fontWeight: '600' }}>
                      {rating.rating}/5
                    </Text>
                  </View>
                  {rating.review && (
                    <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontStyle: 'italic' }} numberOfLines={1}>
                      "{rating.review}"
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
          Quick Actions
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, flex: 1, marginRight: 8, alignItems: 'center' }}
            onPress={function() { navigation.navigate('ManageAppointments'); }}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📋</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
              Appointments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, flex: 1, marginLeft: 8, alignItems: 'center' }}
            onPress={function() { navigation.navigate('ManageServices'); }}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>⚙️</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
              Services
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
            Today's Schedule 📅
          </Text>
          <TouchableOpacity onPress={function() { navigation.navigate('ManageAppointments'); }}>
            <Text style={{ color: '#7c3aed', fontWeight: '600', fontSize: 14 }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {todaySchedule.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
            <Text style={{ color: '#6b7280', fontWeight: '600', textAlign: 'center' }}>
              No appointments today
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Enjoy your free time!
            </Text>
          </View>
        ) : (
          todaySchedule.map(function(appointment) {
            return (
              <View 
                key={appointment.id}
                style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, marginRight: 12 }}>
                      <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 16 }}>
                        {formatTime(appointment.appointmentDateTime)}
                      </Text>
                    </View>
                    {appointment.status === 'COMPLETED' && (
                      <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: '#1e40af', fontSize: 12, fontWeight: '700' }}>✓ DONE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 16 }}>
                    ${appointment.service && appointment.service.price ? appointment.service.price : 0}
                  </Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
                  {appointment.user && appointment.user.name ? appointment.user.name : 'Unknown'}
                </Text>

                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                  {appointment.service && appointment.service.name ? appointment.service.name : 'Service'} • {appointment.service && appointment.service.duration ? appointment.service.duration : 0} min
                </Text>

                {appointment.notes && (
                  <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      💬 {appointment.notes}
                    </Text>
                  </View>
                )}

                {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="✓ Complete"
                        variant="success"
                        size="small"
                        onPress={function() { handleComplete(appointment.id); }}
                      />
                    </View>
                    <TouchableOpacity 
                      style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
                      onPress={function() { }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>📞 Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          onPress={function() { navigation.navigate('BusinessProfile'); }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              My Business Profile
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              Update contact info, and more
            </Text>
          </View>
          <Text style={{ fontSize: 24 }}>🏪</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default BusinessHomeScreen;