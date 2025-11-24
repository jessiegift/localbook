import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Switch,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

function BusinessProfileScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const logout = authContext.logout;

  const [notifications, setNotifications] = useState({
    newBookings: true,
    bookingReminders: true,
    cancellations: true,
    reviews: true,
    promotions: false,
  });

  const [preferences, setPreferences] = useState({
    autoAcceptBookings: false,
    showBusinessHours: true,
    allowCancellations: true,
  });

  const [loading, setLoading] = useState(false);

  function toggleNotification(key) {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function togglePreference(key) {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function handleSaveSettings() {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Settings saved successfully!');
    }, 1000);
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

  function handleManageBusiness() {
    Alert.alert(
      'Edit Business Info',
      'To update your business details (name, address, description), please visit our website at localbook.ie',
      [
        { text: 'OK' }
      ]
    );
  }

  function handleViewWebsite() {
    Alert.alert(
      'Visit Website',
      'Open localbook.ie in your browser to manage full business settings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // In a real app, use Linking.openURL('https://localbook.ie')
          console.log('Opening website...');
        }}
      ]
    );
  }

  function handleHelp() {
    Alert.alert(
      'Help & Support',
      'Need help?\n\n📧 Email: support@localbook.ie\n📞 Phone: +353 1 234 5678\n\nOr visit our Help Center on localbook.ie',
      [{ text: 'OK' }]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
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
              {user?.name || 'My Business'}
            </Text>
            <Text style={{ color: '#bbf7d0', fontSize: 14 }}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          
          {/* Business Management */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
              Business Management
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
              onPress={handleManageBusiness}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#f0fdf4', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>✏️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                    Edit Business Info
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    Update on website
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
              }}
              onPress={handleViewWebsite}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#f0fdf4', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>🌐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                    Visit Website
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    localbook.ie
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
              Notifications
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  New Bookings
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Get notified of new appointments
                </Text>
              </View>
              <Switch
                value={notifications.newBookings}
                onValueChange={() => toggleNotification('newBookings')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.newBookings ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Booking Reminders
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Upcoming appointment alerts
                </Text>
              </View>
              <Switch
                value={notifications.bookingReminders}
                onValueChange={() => toggleNotification('bookingReminders')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.bookingReminders ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Cancellations
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Alert when bookings are cancelled
                </Text>
              </View>
              <Switch
                value={notifications.cancellations}
                onValueChange={() => toggleNotification('cancellations')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.cancellations ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Reviews
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  New customer reviews
                </Text>
              </View>
              <Switch
                value={notifications.reviews}
                onValueChange={() => toggleNotification('reviews')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.reviews ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Promotions
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Tips and marketing updates
                </Text>
              </View>
              <Switch
                value={notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications.promotions ? '#22c55e' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Booking Preferences */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
              Booking Preferences
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Auto-Accept Bookings
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Automatically confirm appointments
                </Text>
              </View>
              <Switch
                value={preferences.autoAcceptBookings}
                onValueChange={() => togglePreference('autoAcceptBookings')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={preferences.autoAcceptBookings ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Show Business Hours
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Display opening times to clients
                </Text>
              </View>
              <Switch
                value={preferences.showBusinessHours}
                onValueChange={() => togglePreference('showBusinessHours')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={preferences.showBusinessHours ? '#22c55e' : '#f4f4f5'}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                  Allow Cancellations
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Let clients cancel bookings
                </Text>
              </View>
              <Switch
                value={preferences.allowCancellations}
                onValueChange={() => togglePreference('allowCancellations')}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={preferences.allowCancellations ? '#22c55e' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Help & Support */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
              Help & Support
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
              }}
              onPress={handleHelp}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#fef3c7', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>💬</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
                    Get Help
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    Contact support team
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#9ca3af' : '#22c55e',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: '#22c55e',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
            onPress={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                Save Settings
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
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>
              LocalBook Business
            </Text>
            <Text style={{ color: '#d1d5db', fontSize: 11 }}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default BusinessProfileScreen;