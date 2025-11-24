import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

function ClientProfileScreen(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  const logout = authContext.logout;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    bookingReminders: true,
    businessUpdates: true,
    specialOffers: false,
    reviewReminders: true,
  });

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(() => {
    if (user) {
      initializeEditFields();
    }
  }, [user]);

  function initializeEditFields() {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phoneNumber || '');
  }

  function toggleNotification(key) {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }

  function handleSaveSettings() {
    setLoading(true);
    
    // Simulate API call to save notification preferences
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

  function handleOpenEditModal() {
    initializeEditFields();
    setShowEditModal(true);
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    Keyboard.dismiss();
  }

  async function handleSaveProfile() {
    Keyboard.dismiss();

    // Validation
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setUpdating(true);

    try {
      const url = `${API_BASE_URL}/users/${user.id}`;
      console.log('Updating profile:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phoneNumber: editPhone.trim(),
        }),
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
        
        // Refresh user data if you have a refresh function in AuthContext
        // await authContext.refreshUser();
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  function handleViewMyBookings() {
    navigation.navigate('MyBookings');
  }

  function handleHelp() {
    Alert.alert(
      'Help & Support',
      'Need help?\n\n📧 Email: support@localbook.ie\n📞 Phone: +353 1 234 5678\n\nWe\'re here to help you!',
      [{ text: 'OK' }]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.\n\nAll your bookings and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please contact support@localbook.ie to proceed with account deletion.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  }

  const userName = user?.name || 'Guest';
  const userEmail = user?.email || 'No email';
  const userPhone = user?.phoneNumber || 'Not provided';
  
  const userInitials = (() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      const firstLetter = nameParts[0]?.charAt(0).toUpperCase() || '?';
      const lastLetter = nameParts[1]?.charAt(0).toUpperCase() || '';
      return firstLetter + lastLetter;
    }
    return '?';
  })();

  const joinDate = new Date();
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        {/* Header */}
        <View style={{
          backgroundColor: '#7c3aed',
          paddingTop: 56,
          paddingBottom: 32,
          paddingHorizontal: 20,
          marginBottom: 16
        }}>
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
              <Text style={{
                color: '#7c3aed',
                fontSize: 32,
                fontWeight: '700'
              }}>
                {userInitials}
              </Text>
            </View>
            <Text style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: '700',
              marginBottom: 4
            }}>
              {userName}
            </Text>
            <Text style={{
              color: '#e9d5ff',
              fontSize: 14,
              marginBottom: 16
            }}>
              {userEmail}
            </Text>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={handleOpenEditModal}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: 15
              }}>
                ✏️ Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          
          {/* Profile Information */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 3
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 16
            }}>
              Profile Information
            </Text>

            {/* Email */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#ede9fe',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>📧</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 12,
                  color: '#6b7280',
                  fontWeight: '600',
                  marginBottom: 2
                }}>
                  EMAIL
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: '#111827',
                  fontWeight: '600'
                }}>
                  {userEmail}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#dbeafe',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>📱</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 12,
                  color: '#6b7280',
                  fontWeight: '600',
                  marginBottom: 2
                }}>
                  PHONE
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: '#111827',
                  fontWeight: '600'
                }}>
                  {userPhone}
                </Text>
              </View>
            </View>

            {/* Member Since */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#d1fae5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 12,
                  color: '#6b7280',
                  fontWeight: '600',
                  marginBottom: 2
                }}>
                  MEMBER SINCE
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: '#111827',
                  fontWeight: '600'
                }}>
                  {formattedJoinDate}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 3
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 16
            }}>
              Quick Actions
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
              onPress={handleViewMyBookings}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f5f3ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    My Bookings
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280'
                  }}>
                    View and manage appointments
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
              onPress={handleHelp}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1
              }}>
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
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    Help & Support
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280'
                  }}>
                    Contact our support team
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 3
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 16
            }}>
              Notifications
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 2
                }}>
                  Booking Confirmations
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280'
                }}>
                  When your booking is confirmed
                </Text>
              </View>
              <Switch
                value={notifications.bookingConfirmations}
                onValueChange={() => toggleNotification('bookingConfirmations')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.bookingConfirmations ? '#7c3aed' : '#f4f4f5'}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 2
                }}>
                  Booking Reminders
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280'
                }}>
                  Upcoming appointment alerts
                </Text>
              </View>
              <Switch
                value={notifications.bookingReminders}
                onValueChange={() => toggleNotification('bookingReminders')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.bookingReminders ? '#7c3aed' : '#f4f4f5'}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 2
                }}>
                  Business Updates
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280'
                }}>
                  News from your favorite businesses
                </Text>
              </View>
              <Switch
                value={notifications.businessUpdates}
                onValueChange={() => toggleNotification('businessUpdates')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.businessUpdates ? '#7c3aed' : '#f4f4f5'}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 2
                }}>
                  Special Offers
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280'
                }}>
                  Deals and promotions
                </Text>
              </View>
              <Switch
                value={notifications.specialOffers}
                onValueChange={() => toggleNotification('specialOffers')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.specialOffers ? '#7c3aed' : '#f4f4f5'}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 2
                }}>
                  Review Reminders
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#6b7280'
                }}>
                  Rate completed appointments
                </Text>
              </View>
              <Switch
                value={notifications.reviewReminders}
                onValueChange={() => toggleNotification('reviewReminders')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.reviewReminders ? '#7c3aed' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Save Settings Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#a78bfa' : '#7c3aed',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: '#7c3aed',
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
              <Text style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '700'
              }}>
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
              marginBottom: 12,
            }}
            onPress={handleLogout}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '700'
            }}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: '#fecaca',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 24,
            }}
            onPress={handleDeleteAccount}
          >
            <Text style={{
              color: '#ef4444',
              fontSize: 14,
              fontWeight: '600'
            }}>
              Delete Account
            </Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{
              color: '#9ca3af',
              fontSize: 12,
              marginBottom: 4
            }}>
              LocalBook
            </Text>
            <Text style={{
              color: '#d1d5db',
              fontSize: 11
            }}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'flex-end'
            }}>
              <View style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 20,
                paddingBottom: 40,
                maxHeight: '85%'
              }}>
                {/* Modal Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingBottom: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6'
                }}>
                  <TouchableOpacity
                    onPress={handleCloseEditModal}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: '#6b7280',
                      fontSize: 16,
                      fontWeight: '600'
                    }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Edit Profile
                  </Text>
                  <View style={{ width: 60 }} />
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24
                  }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Name Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8
                    }}>
                      Full Name *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: '#111827'
                      }}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                      returnKeyType="next"
                    />
                  </View>

                  {/* Email Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8
                    }}>
                      Email Address *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: '#111827'
                      }}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>

                  {/* Phone Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8
                    }}>
                      Phone Number
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: '#111827'
                      }}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      returnKeyType="done"
                    />
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Save Button */}
                <View style={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#f3f4f6'
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: updating ? '#a78bfa' : '#7c3aed',
                      borderRadius: 12,
                      padding: 16,
                      shadowColor: '#7c3aed',
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 }
                    }}
                    onPress={handleSaveProfile}
                    disabled={updating}
                    activeOpacity={0.8}
                  >
                    {updating ? (
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={{
                          color: '#ffffff',
                          fontSize: 16,
                          fontWeight: '700',
                          marginLeft: 8
                        }}>
                          Saving...
                        </Text>
                      </View>
                    ) : (
                      <Text style={{
                        color: '#ffffff',
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '700'
                      }}>
                        Save Changes
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default ClientProfileScreen;