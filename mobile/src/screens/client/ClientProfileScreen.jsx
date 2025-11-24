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
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  // FAQ Data
  const faqData = [
    {
      id: 1,
      question: 'How far in advance can I book?',
      answer: 'You can book appointments up to 90 days in advance. This gives you plenty of time to plan ahead for your appointments.',
      icon: '📅'
    },
    {
      id: 2,
      question: 'What is the minimum booking notice?',
      answer: 'You must book at least 2 hours before your desired appointment time. This ensures businesses have adequate time to prepare.',
      icon: '⏰'
    },
    {
      id: 3,
      question: 'Can I cancel my booking?',
      answer: 'Yes! You can cancel for free up to 24 hours before your appointment. Cancellations within 24 hours may be subject to business policies.',
      icon: '❌'
    },
    {
      id: 4,
      question: 'How many bookings can I make per day?',
      answer: 'You can make up to 5 bookings per day. This helps ensure fair access to services for all customers.',
      icon: '📊'
    },
    {
      id: 5,
      question: 'When will I receive booking reminders?',
      answer: 'You\'ll receive a reminder notification 24 hours before your appointment to help you remember.',
      icon: '🔔'
    },
    {
      id: 6,
      question: 'Are same-day bookings allowed?',
      answer: 'Yes, if the business has enabled same-day bookings and slots are available at least 2 hours from now.',
      icon: '⚡'
    },
    {
      id: 7,
      question: 'What if a business is in Carlow only?',
      answer: 'LocalBook Carlow focuses on local businesses. All businesses must be physically located in County Carlow and verified with an R93 eircode.',
      icon: '📍'
    },
    {
      id: 8,
      question: 'How do I contact support?',
      answer: 'You can reach us at support@localbook.ie or call +353 1 234 5678. We\'re here to help Monday-Friday, 9am-5pm.',
      icon: '💬'
    }
  ];

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

  function handleOpenFaqModal() {
    setShowFaqModal(true);
    setExpandedFaq(null);
  }

  function handleCloseFaqModal() {
    setShowFaqModal(false);
    setExpandedFaq(null);
  }

  function toggleFaq(faqId) {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  }

  async function handleSaveProfile() {
    Keyboard.dismiss();

    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

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

            {/* FAQ & Booking Rules */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
              onPress={handleOpenFaqModal}
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
                  <Text style={{ fontSize: 20 }}>❓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 2
                  }}>
                    FAQ & Booking Rules
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280'
                  }}>
                    Common questions & platform policies
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
                  backgroundColor: '#dcfce7',
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
              LocalBook Carlow
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

      {/* FAQ Modal */}
      <Modal
        visible={showFaqModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseFaqModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <View style={{
            flex: 1,
            marginTop: 80,
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
              backgroundColor: '#ffffff'
            }}>
              <View style={{ width: 40 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#111827'
              }}>
                FAQ & Booking Rules
              </Text>
              <TouchableOpacity
                onPress={handleCloseFaqModal}
                activeOpacity={0.7}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 24, color: '#6b7280', fontWeight: '300' }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 40
              }}
              showsVerticalScrollIndicator={true}
            >
              {/* Info Banner */}
              <View style={{
                backgroundColor: '#eff6ff',
                borderLeftWidth: 4,
                borderLeftColor: '#3b82f6',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'flex-start'
              }}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>📋</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: 4
                  }}>
                    Platform Policies
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#1e3a8a',
                    lineHeight: 18
                  }}>
                    These rules ensure fair access and quality service for all LocalBook Carlow users.
                  </Text>
                </View>
              </View>

              {/* FAQ Items */}
              {faqData.map((faq) => (
                <View
                  key={faq.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderWidth: 1.5,
                    borderColor: expandedFaq === faq.id ? '#7c3aed' : '#e5e7eb',
                    borderRadius: 12,
                    marginBottom: 10,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOpacity: expandedFaq === faq.id ? 0.1 : 0,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 }
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      backgroundColor: expandedFaq === faq.id ? '#faf5ff' : '#ffffff'
                    }}
                  >
                    <View style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: expandedFaq === faq.id ? '#ede9fe' : '#f9fafb',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ fontSize: 16 }}>{faq.icon}</Text>
                    </View>
                    <Text style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: '600',
                      color: expandedFaq === faq.id ? '#7c3aed' : '#111827',
                      lineHeight: 20
                    }}>
                      {faq.question}
                    </Text>
                    <View style={{
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{
                        fontSize: 16,
                        color: expandedFaq === faq.id ? '#7c3aed' : '#9ca3af',
                        transform: [{ rotate: expandedFaq === faq.id ? '180deg' : '0deg' }]
                      }}>
                        ▼
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {expandedFaq === faq.id && (
                    <View style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      backgroundColor: '#faf5ff',
                      borderTopWidth: 1,
                      borderTopColor: '#e9d5ff'
                    }}>
                      <Text style={{
                        fontSize: 13,
                        color: '#4b5563',
                        lineHeight: 20
                      }}>
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Support Box */}
              <View style={{
                backgroundColor: '#f0fdf4',
                borderRadius: 12,
                padding: 14,
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#bbf7d0'
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>💬</Text>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#166534'
                  }}>
                    Still have questions?
                  </Text>
                </View>
                <Text style={{
                  fontSize: 13,
                  color: '#15803d',
                  marginBottom: 12,
                  lineHeight: 19
                }}>
                  Our support team is here to help you Monday-Friday, 9am-5pm.
                </Text>
                <View style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6
                  }}>
                    <Text style={{ fontSize: 14, marginRight: 8 }}>📧</Text>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#166534'
                    }}>
                      support@localbook.ie
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Text style={{ fontSize: 14, marginRight: 8 }}>📞</Text>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#166534'
                    }}>
                      +353 1 234 5678
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ClientProfileScreen;