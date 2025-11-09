import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'react-native-calendars'; 

const BusinessDetailScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const { user, token } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
    fetchBusinessServices();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${businessId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Business data:', data);
        setBusiness(data);
      } else {
        Alert.alert('Error', 'Failed to load business details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${businessId}/services`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Services fetched:', data);
        setServices(data);
      } else {
        console.log('No services found');
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleBookService = (service) => {
    // Navigate to dedicated booking screen
    navigation.navigate('BookAppointment', {
      business: business,
      service: service,
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-base text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-6xl mb-4">🏪</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">Business not found</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Business Header */}
      <View className="bg-white px-5 pt-5 pb-5 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          {business.businessName}
        </Text>
        
        <View className="flex-row items-center">
          <View className="bg-purple-100 px-4 py-2 rounded-full">
            <Text className="text-purple-700 text-sm font-semibold">
              {business.category}
            </Text>
          </View>
          
          {business.approved && (
            <View className="bg-green-100 px-4 py-2 rounded-full ml-2">
              <Text className="text-green-700 text-sm font-semibold">
                ✓ Verified
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Business Information */}
      <View className="px-5 py-4">
        <View className="bg-white rounded-xl p-4 mb-3 flex-row items-start">
          <Text className="text-2xl mr-3">📍</Text>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-500 mb-1">
              LOCATION
            </Text>
            <Text className="text-base text-gray-900">
              {business.location}
            </Text>
          </View>
        </View>

        {business.phoneNumber && (
          <View className="bg-white rounded-xl p-4 mb-3 flex-row items-start">
            <Text className="text-2xl mr-3">📞</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-500 mb-1">
                PHONE
              </Text>
              <Text className="text-base text-gray-900">
                {business.phoneNumber}
              </Text>
            </View>
          </View>
        )}

        {business.description && (
          <View className="bg-white rounded-xl p-4 mb-3">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              About
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              {business.description}
            </Text>
          </View>
        )}

        {/* Services Section */}
        <View className="bg-white rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-2">💼</Text>
            <Text className="text-xl font-bold text-gray-900">
              Services Offered
            </Text>
          </View>

          {servicesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="mt-3 text-sm text-gray-600">
                Loading services...
              </Text>
            </View>
          ) : services.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-5xl mb-3">📭</Text>
              <Text className="text-lg font-semibold text-gray-500 mb-1">
                No services available
              </Text>
            </View>
          ) : (
            services.map((service, index) => (
              <View 
                key={service.id}
                className={index < services.length - 1 ? "mb-4" : ""}
              >
                <View className="border-2 border-gray-200 rounded-xl p-4">
                  <Text className="text-lg font-bold text-gray-900 mb-2">
                    {service.serviceName}
                  </Text>

                  <Text className="text-sm text-gray-600 mb-4 leading-5">
                    {service.description || 'No description provided'}
                  </Text>

                  <View className="bg-purple-50 rounded-lg p-4 mb-4">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-xs font-semibold text-gray-600 mb-1">
                          PRICE
                        </Text>
                        <Text className="text-2xl font-bold text-purple-600">
                          €{service.price.toFixed(2)}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-xs font-semibold text-gray-600 mb-1">
                          DURATION
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-xl mr-1">⏱️</Text>
                          <Text className="text-lg font-semibold text-gray-700">
                            {service.durationMinutes} min
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Book Button - Navigates to new page */}
                  <TouchableOpacity
                    className="bg-purple-600 py-3 rounded-lg active:bg-purple-700"
                    onPress={() => handleBookService(service)}
                  >
                    <Text className="text-white text-center text-base font-semibold">
                      📅 Book This Service
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default BusinessDetailScreen;