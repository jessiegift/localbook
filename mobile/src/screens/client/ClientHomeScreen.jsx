import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import BusinessCard from '../../common/BusinessCard';
import * as Location from 'expo-location';

const CATEGORIES = [
  'All',
  'Hair Salon',
  'Cafe',
  'Gym',
  'Beauty',
  'Barber',
  'Restaurant',
];

const ClientHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // ✅ CORRECT API URL - Update this to your actual backend
  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(() => {
    getUserLocation();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchQuery, selectedCategory, businesses]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } else {
        setUserLocation({ lat: 52.8408, lng: -6.9261 });
      }
    } catch (error) {
      console.log('Location error:', error);
      setUserLocation({ lat: 52.8408, lng: -6.9261 });
    }
  };

  const fetchBusinesses = async () => {
    try {
      setError(null);
      console.log('🔍 Fetching from:', `${API_BASE_URL}/businesses/approved`);
      
      const response = await fetch(`${API_BASE_URL}/businesses/approved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Businesses received:', data.length);
      
      setBusinesses(data || []);
      setFilteredBusinesses(data || []);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError(error.message);
      setBusinesses([]);
      setFilteredBusinesses([]);
    } finally {
      // ✅ CRITICAL: Always set loading to false
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = [...businesses];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
      );
    }
    
    setFilteredBusinesses(filtered);
  };

  const handleBusinessPress = (business) => {
    navigation.navigate('BusinessDetails', { 
      businessId: business.id,
      business: business 
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 text-base">Loading businesses...</Text>
        <Text className="mt-2 text-gray-400 text-xs">Please wait...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with User Greeting */}
      <View className="bg-white pt-12 pb-2 px-4">
        <Text className="text-lg font-bold text-gray-900">
          Hello, {user?.name || 'Guest'}! 👋
        </Text>
      </View>

      {/* LocalBook Header */}
      <View className="bg-blue-600">
        <View className="px-6 pt-10 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-3xl font-black text-white mb-1">
                LocalBook
              </Text>
              <Text className="text-base text-blue-100 font-medium">
                Carlow Edition
              </Text>
            </View>
            
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <View className="flex-row items-center">
                <Text className="text-base mr-1">📍</Text>
                <Text className="text-sm text-white font-bold">Carlow</Text>
              </View>
            </View>
          </View>
          
          <View className="bg-white/10 backdrop-blur-lg px-4 py-3 rounded-xl border border-white/20">
            <Text className="text-sm text-white text-center font-medium">
              ✨ Your local services, all in one place
            </Text>
          </View>
        </View>
        
        {/* Stats Bar */}
        <View className="bg-white/10 backdrop-blur-lg px-6 py-4 flex-row justify-around border-t border-white/20">
          <View className="items-center">
            <Text className="text-2xl font-bold text-white">{businesses.length}</Text>
            <Text className="text-xs text-blue-100">Businesses</Text>
          </View>
          <View className="w-px h-8 bg-white/30" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-white">{businesses.length * 5}</Text>
            <Text className="text-xs text-blue-100">Services</Text>
          </View>
          <View className="w-px h-8 bg-white/30" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-white">4.8★</Text>
            <Text className="text-xs text-blue-100">Rating</Text>
          </View>
        </View>
        
        <View className="h-3 bg-gray-50" style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }} />
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 pb-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 h-9">
          <Text className="mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-sm"
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400 ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-2 px-3 py-1 rounded-full ${
                selectedCategory === cat ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-4 py-2 bg-white border-b border-gray-100">
        <Text className="text-xs text-gray-600">
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-700 text-sm font-semibold">
            ⚠️ Connection Error
          </Text>
          <Text className="text-red-600 text-xs mt-1">
            {error}
          </Text>
          <TouchableOpacity 
            onPress={fetchBusinesses}
            className="mt-2 bg-red-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center text-sm font-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            userLocation={userLocation}
            onPress={() => handleBusinessPress(item)}
          />
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={() => (
          <View className="items-center py-16">
            <Text className="text-6xl mb-4">
              {error ? '⚠️' : searchQuery || selectedCategory !== 'All' ? '🔍' : '🏪'}
            </Text>
            <Text className="text-gray-900 font-bold text-lg mb-1">
              {error ? 'Connection Failed' : 'No businesses found'}
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8 mb-4">
              {error 
                ? 'Unable to load businesses. Check your connection.' 
                : searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter'
                : 'No businesses available yet'}
            </Text>
            {error && (
              <TouchableOpacity 
                onPress={fetchBusinesses}
                className="bg-blue-500 py-3 px-6 rounded-lg"
              >
                <Text className="text-white font-semibold">
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ClientHomeScreen;
