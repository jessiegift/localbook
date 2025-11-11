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
  'Beauty',
  'Barber',
  'Restaurant',
];

const ClientHomeScreen = function(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  
  const businessesState = useState([]);
  const businesses = businessesState[0];
  const setBusinesses = businessesState[1];
  
  const filteredBusinessesState = useState([]);
  const filteredBusinesses = filteredBusinessesState[0];
  const setFilteredBusinesses = filteredBusinessesState[1];
  
  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];
  
  const refreshingState = useState(false);
  const refreshing = refreshingState[0];
  const setRefreshing = refreshingState[1];
  
  const searchQueryState = useState('');
  const searchQuery = searchQueryState[0];
  const setSearchQuery = searchQueryState[1];
  
  const selectedCategoryState = useState('All');
  const selectedCategory = selectedCategoryState[0];
  const setSelectedCategory = selectedCategoryState[1];
  
  const userLocationState = useState(null);
  const userLocation = userLocationState[0];
  const setUserLocation = userLocationState[1];
  
  const errorState = useState(null);
  const error = errorState[0];
  const setError = errorState[1];

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    getUserLocation();
    fetchBusinesses();
  }, []);

  useEffect(function() {
    filterBusinesses();
  }, [searchQuery, selectedCategory, businesses]);

  const getUserLocation = async function() {
    try {
      const permissionResult = await Location.requestForegroundPermissionsAsync();
      const permissionStatus = permissionResult.status;
      const isGranted = permissionStatus === 'granted';
      
      if (isGranted === true) {
        const locationOptions = {};
        const location = await Location.getCurrentPositionAsync(locationOptions);
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        
        const locationObject = {
          lat: latitude,
          lng: longitude,
        };
        
        setUserLocation(locationObject);
      } else {
        const defaultLocation = {
          lat: 52.8408,
          lng: -6.9261,
        };
        setUserLocation(defaultLocation);
      }
    } catch (errorObject) {
      console.log('Location error:', errorObject);
      
      const defaultLocation = {
        lat: 52.8408,
        lng: -6.9261,
      };
      setUserLocation(defaultLocation);
    }
  };

  const fetchBusinesses = async function() {
    try {
      setError(null);
      
      const url = API_BASE_URL + '/businesses/approved';
      console.log('🔍 Fetching from:', url);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(url, requestOptions);
      const responseStatus = response.status;
      
      console.log('📡 Response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === false) {
        const statusText = response.statusText;
        const errorMessage = 'HTTP ' + responseStatus.toString() + ': ' + statusText;
        const error = new Error(errorMessage);
        throw error;
      }

      const data = await response.json();
      const dataLength = data.length;
      console.log('✅ Businesses received:', dataLength);
      
      let businessesArray = data;
      const hasData = data !== null && data !== undefined;
      if (hasData === false) {
        businessesArray = [];
      }
      
      setBusinesses(businessesArray);
      setFilteredBusinesses(businessesArray);
    } catch (errorObject) {
      const errorMessage = errorObject.message;
      console.error('❌ Fetch error:', errorObject);
      setError(errorMessage);
      
      const emptyArray = [];
      setBusinesses(emptyArray);
      setFilteredBusinesses(emptyArray);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBusinesses = function() {
    const businessesCopy = [];
    let businessIndex = 0;
    while (businessIndex < businesses.length) {
      const business = businesses[businessIndex];
      businessesCopy.push(business);
      businessIndex = businessIndex + 1;
    }
    
    let filtered = businessesCopy;
    
    const isNotAllCategory = selectedCategory !== 'All';
    if (isNotAllCategory === true) {
      const newFiltered = [];
      let filterIndex = 0;
      
      while (filterIndex < filtered.length) {
        const business = filtered[filterIndex];
        const businessCategory = business.category;
        
        let categoryLower = '';
        const hasCategory = businessCategory !== null && businessCategory !== undefined;
        if (hasCategory === true) {
          categoryLower = businessCategory.toLowerCase();
        }
        
        const selectedCategoryLower = selectedCategory.toLowerCase();
        const isCategoryMatch = categoryLower === selectedCategoryLower;
        
        if (isCategoryMatch === true) {
          newFiltered.push(business);
        }
        
        filterIndex = filterIndex + 1;
      }
      
      filtered = newFiltered;
    }
    
    const trimmedQuery = searchQuery.trim();
    const hasSearchQuery = trimmedQuery.length > 0;
    
    if (hasSearchQuery === true) {
      const queryLower = searchQuery.toLowerCase();
      const newFiltered = [];
      let searchIndex = 0;
      
      while (searchIndex < filtered.length) {
        const business = filtered[searchIndex];
        
        const businessName = business.name;
        let nameLower = '';
        const hasName = businessName !== null && businessName !== undefined;
        if (hasName === true) {
          nameLower = businessName.toLowerCase();
        }
        const nameIncludes = nameLower.includes(queryLower);
        
        const businessCategory = business.category;
        let categoryLower = '';
        const hasCategory = businessCategory !== null && businessCategory !== undefined;
        if (hasCategory === true) {
          categoryLower = businessCategory.toLowerCase();
        }
        const categoryIncludes = categoryLower.includes(queryLower);
        
        const businessLocation = business.location;
        let locationLower = '';
        const hasLocation = businessLocation !== null && businessLocation !== undefined;
        if (hasLocation === true) {
          locationLower = businessLocation.toLowerCase();
        }
        const locationIncludes = locationLower.includes(queryLower);
        
        const businessAddress = business.address;
        let addressLower = '';
        const hasAddress = businessAddress !== null && businessAddress !== undefined;
        if (hasAddress === true) {
          addressLower = businessAddress.toLowerCase();
        }
        const addressIncludes = addressLower.includes(queryLower);
        
        const isMatch = nameIncludes === true || categoryIncludes === true || locationIncludes === true || addressIncludes === true;
        
        if (isMatch === true) {
          newFiltered.push(business);
        }
        
        searchIndex = searchIndex + 1;
      }
      
      filtered = newFiltered;
    }
    
    setFilteredBusinesses(filtered);
  };

  const handleBusinessPress = function(business) {
    const businessId = business.id;
    const navigationParams = { 
      businessId: businessId,
      business: business 
    };
    navigation.navigate('BusinessDetails', navigationParams);
  };

  const onRefresh = function() {
    setRefreshing(true);
    fetchBusinesses();
  };

  if (loading === true) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 text-base">Loading businesses...</Text>
        <Text className="mt-2 text-gray-400 text-xs">Please wait...</Text>
      </View>
    );
  }

  let userName = 'Guest';
  const hasUser = user !== null && user !== undefined;
  if (hasUser === true) {
    const hasUserName = user.name !== null && user.name !== undefined;
    if (hasUserName === true) {
      userName = user.name;
    }
  }

  const businessesLength = businesses.length;
  const businessesLengthString = businessesLength.toString();
  const servicesCount = businessesLength * 5;
  const servicesCountString = servicesCount.toString();

  const filteredBusinessesLength = filteredBusinesses.length;
  const filteredBusinessesLengthString = filteredBusinessesLength.toString();
  
  let businessesLabel = 'businesses';
  const isSingleBusiness = filteredBusinessesLength === 1;
  if (isSingleBusiness === true) {
    businessesLabel = 'business';
  }

  const hasSearchQuery = searchQuery.length > 0;

  const scrollContentStyle = { paddingVertical: 6 };
  const listContentStyle = { padding: 12 };

  const hasError = error !== null && error !== undefined;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-2 px-4">
        <Text className="text-lg font-bold text-gray-900">
          Hello, {userName}! 👋
        </Text>
      </View>

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
        
        <View className="bg-white/10 backdrop-blur-lg px-6 py-4 flex-row justify-around border-t border-white/20">
          <View className="items-center">
            <Text className="text-2xl font-bold text-white">{businessesLengthString}</Text>
            <Text className="text-xs text-blue-100">Businesses</Text>
          </View>
          <View className="w-px h-8 bg-white/30" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-white">{servicesCountString}</Text>
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
          {hasSearchQuery === true && (
            <TouchableOpacity 
              onPress={function() {
                setSearchQuery('');
              }}
            >
              <Text className="text-gray-400 ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="bg-white border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={scrollContentStyle}
        >
          {CATEGORIES.map(function(cat) {
            const isSelected = selectedCategory === cat;
            
            let buttonClassName = 'mr-2 px-3 py-1 rounded-full ';
            if (isSelected === true) {
              buttonClassName = buttonClassName + 'bg-blue-500';
            } else {
              buttonClassName = buttonClassName + 'bg-gray-100';
            }
            
            let textClassName = 'text-xs font-semibold ';
            if (isSelected === true) {
              textClassName = textClassName + 'text-white';
            } else {
              textClassName = textClassName + 'text-gray-700';
            }
            
            return (
              <TouchableOpacity
                key={cat}
                onPress={function() {
                  setSelectedCategory(cat);
                }}
                className={buttonClassName}
              >
                <Text className={textClassName}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="px-4 py-2 bg-white border-b border-gray-100">
        <Text className="text-xs text-gray-600">
          {filteredBusinessesLengthString} {businessesLabel} found
        </Text>
      </View>

      {hasError === true && (
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

      <FlatList
        data={filteredBusinesses}
        renderItem={function(renderProps) {
          const item = renderProps.item;
          return (
            <BusinessCard
              business={item}
              userLocation={userLocation}
              onPress={function() {
                handleBusinessPress(item);
              }}
            />
          );
        }}
        keyExtractor={function(item) {
          const itemId = item.id;
          const hasItemId = itemId !== null && itemId !== undefined;
          if (hasItemId === true) {
            const itemIdString = itemId.toString();
            return itemIdString;
          }
          const randomString = Math.random().toString();
          return randomString;
        }}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={function() {
          let emoji = '🏪';
          let title = 'No businesses found';
          let description = 'No businesses available yet';
          
          if (hasError === true) {
            emoji = '⚠️';
            title = 'Connection Failed';
            description = 'Unable to load businesses. Check your connection.';
          } else {
            const hasSearchOrFilter = hasSearchQuery === true || selectedCategory !== 'All';
            if (hasSearchOrFilter === true) {
              emoji = '🔍';
              description = 'Try adjusting your search or filter';
            }
          }
          
          return (
            <View className="items-center py-16">
              <Text className="text-6xl mb-4">
                {emoji}
              </Text>
              <Text className="text-gray-900 font-bold text-lg mb-1">
                {title}
              </Text>
              <Text className="text-gray-500 text-sm text-center px-8 mb-4">
                {description}
              </Text>
              {hasError === true && (
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
          );
        }}
      />
    </View>
  );
};

export default ClientHomeScreen;