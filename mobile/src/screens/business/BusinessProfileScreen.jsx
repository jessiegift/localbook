import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

function BusinessProfileScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  const logout = authContext.logout;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [business, setBusiness] = useState({
    businessName: '',
    description: '',
    category: '',
    location: '',
    town: '',
    county: '',
    address: '',
    eircode: '',
    phoneNumber: '',
    email: '',
    ownerName: '',
  });

  useEffect(() => {
    console.log('=== BUSINESS PROFILE SCREEN ===');
    console.log('User businessId:', user ? user.businessId : 'N/A');
    fetchBusinessInfo();
  }, []);

  async function fetchBusinessInfo() {
    try {
      if (!user || !user.businessId) {
        console.error('No businessId found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const url = `http://192.168.1.15:8080/api/businesses/${user.businessId}`;
      console.log('Fetching business from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Business data:', JSON.stringify(data, null, 2));
        
        setBusiness({
          businessName: data.businessName || '',
          description: data.description || '',
          category: data.category || '',
          location: data.location || '',
          town: data.town || '',
          county: data.county || '',
          address: data.address || '',
          eircode: data.eircode || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          ownerName: data.ownerName || user.name || '',
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to load business:', errorText);
        Alert.alert('Error', 'Failed to load business information');
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchBusinessInfo();
  }

  async function handleSave() {
    Keyboard.dismiss();

    if (!business.businessName || !business.category || !business.location) {
      Alert.alert('Error', 'Please fill in required fields (Business Name, Category, Location)');
      return;
    }

    if (!business.phoneNumber) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setSaving(true);

    try {
      const url = `http://192.168.1.15:8080/api/businesses/${user.businessId}`;
      console.log('Updating business:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(business),
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        Alert.alert('Success', 'Business information updated!');
        fetchBusinessInfo();
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        Alert.alert('Error', 'Failed to update business information');
      }
    } catch (error) {
      console.error('Error updating business:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
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
  }

  function updateField(field, value) {
    setBusiness({ ...business, [field]: value });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Header Card */}
            <View style={{ backgroundColor: '#22c55e', paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20, marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ 
                  backgroundColor: '#ffffff', 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}>
                  <Text style={{ fontSize: 40 }}>🏪</Text>
                </View>
                <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
                  {business.businessName || 'My Business'}
                </Text>
                <Text style={{ color: '#bbf7d0', fontSize: 14 }}>
                  {user?.email}
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
              
              {/* Business Information */}
              <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
                  Business Information
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Business Name *
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="Enter business name"
                  value={business.businessName}
                  onChangeText={(text) => updateField('businessName', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Category *
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., Salon, Spa, Fitness"
                  value={business.category}
                  onChangeText={(text) => updateField('category', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Owner Name
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="Owner's name"
                  value={business.ownerName}
                  onChangeText={(text) => updateField('ownerName', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Description
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    height: 100,
                    textAlignVertical: 'top'
                  }}
                  placeholder="Brief description of your business"
                  value={business.description}
                  onChangeText={(text) => updateField('description', text)}
                  multiline={true}
                  numberOfLines={4}
                  returnKeyType="done"
                />
              </View>

              {/* Location & Contact */}
              <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
                  Location & Contact
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Location *
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., Carlow Town"
                  value={business.location}
                  onChangeText={(text) => updateField('location', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Town
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., Carlow"
                  value={business.town}
                  onChangeText={(text) => updateField('town', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  County
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., County Carlow"
                  value={business.county}
                  onChangeText={(text) => updateField('county', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Full Address
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="Street address"
                  value={business.address}
                  onChangeText={(text) => updateField('address', text)}
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Eircode
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., R93 X2F7"
                  value={business.eircode}
                  onChangeText={(text) => updateField('eircode', text)}
                  autoCapitalize="characters"
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Phone Number *
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}
                  placeholder="e.g., 0851234567"
                  value={business.phoneNumber}
                  onChangeText={(text) => updateField('phoneNumber', text)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: '#e5e7eb', 
                    padding: 12, 
                    fontSize: 16
                  }}
                  placeholder="business@example.com"
                  value={business.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: saving ? '#9ca3af' : '#22c55e',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#ef4444',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 24,
                }}
                onPress={handleLogout}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                  Logout
                </Text>
              </TouchableOpacity>

              {/* App Info */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                  LocalBook Business v1.0.0
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default BusinessProfileScreen;