import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import Button from '../../common/Button';
import Input from '../../common/Input';

const BusinessProfileScreen = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
  });

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      // TODO: Replace with your actual API
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${user.businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBusiness({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          location: data.location || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          hours: data.hours || '',
        });
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      Alert.alert('Error', 'Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!business.name || !business.category || !business.location) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${user.businessId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(business),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Business information updated!');
      } else {
        Alert.alert('Error', 'Failed to update business information');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header Card */}
        <View className="bg-green-500 pt-14 pb-8 px-5 mb-4">
          <View className="items-center">
            <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">🏪</Text>
            </View>
            <Text className="text-white text-xl font-bold">
              {business.name || 'My Business'}
            </Text>
            <Text className="text-green-100 text-sm">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="px-5 pb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Business Information
            </Text>

            <Input
              label="Business Name *"
              placeholder="Enter business name"
              value={business.name}
              onChangeText={(text) => setBusiness({ ...business, name: text })}
            />

            <Input
              label="Category *"
              placeholder="e.g. Salon, Spa, Fitness"
              value={business.category}
              onChangeText={(text) => setBusiness({ ...business, category: text })}
            />

            <Input
              label="Description"
              placeholder="Brief description of your business"
              value={business.description}
              onChangeText={(text) => setBusiness({ ...business, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Location & Contact
            </Text>

            <Input
              label="Location *"
              placeholder="e.g. Downtown, New York"
              value={business.location}
              onChangeText={(text) => setBusiness({ ...business, location: text })}
            />

            <Input
              label="Full Address"
              placeholder="Street address"
              value={business.address}
              onChangeText={(text) => setBusiness({ ...business, address: text })}
            />

            <Input
              label="Phone"
              placeholder="(555) 123-4567"
              value={business.phone}
              onChangeText={(text) => setBusiness({ ...business, phone: text })}
              keyboardType="phone-pad"
            />

            <Input
              label="Email"
              placeholder="business@example.com"
              value={business.email}
              onChangeText={(text) => setBusiness({ ...business, email: text })}
              keyboardType="email-address"
            />

            <Input
              label="Website"
              placeholder="https://www.example.com"
              value={business.website}
              onChangeText={(text) => setBusiness({ ...business, website: text })}
              keyboardType="url"
            />
          </View>

         

          {/* Save Button */}
          <Button
            title="Save Changes"
            variant="success"
            onPress={handleSave}
            loading={saving}
            className="mb-3"
          />

          {/* Logout Button */}
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
          />

          {/* App Info */}
          <View className="mt-6 items-center">
            <Text className="text-gray-400 text-xs">
              LocalBook Business v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BusinessProfileScreen;