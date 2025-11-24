import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Switch,
  ActivityIndicator,
  Modal
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
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ Data for Business Owners
  const faqData = [
    {
      id: 1,
      question: 'What is the minimum business rating required?',
      answer: 'Businesses must maintain a minimum 3-star rating. Businesses below this rating will be reviewed by our team to ensure quality service standards.',
      icon: '⭐'
    },
    {
      id: 2,
      question: 'How many services can I offer?',
      answer: 'You can offer up to 20 services per business. This limit ensures focused, quality service offerings for your customers.',
      icon: '🛠️'
    },
    {
      id: 3,
      question: 'Do I need to be located in Carlow?',
      answer: 'Yes! LocalBook Carlow is exclusively for businesses physically located in County Carlow. We verify location using eircode (R93 prefix), town name, and address.',
      icon: '📍'
    },
    {
      id: 4,
      question: 'How does booking approval work?',
      answer: 'You can choose to auto-approve bookings or manually review each one. Manual approval gives you control over your schedule and client selection.',
      icon: '✅'
    },
    {
      id: 5,
      question: 'What are the booking advance limits?',
      answer: 'Clients can book up to 90 days in advance with a minimum 2-hour notice. This gives you adequate time to prepare for appointments.',
      icon: '📅'
    },
    {
      id: 6,
      question: 'Can clients cancel bookings?',
      answer: 'Clients can cancel for free up to 24 hours before appointment time. You control the cancellation policy in your business settings.',
      icon: '❌'
    },
    {
      id: 7,
      question: 'How do I update my business information?',
      answer: 'Full business details (name, address, description, photos) are managed through the website at localbook.ie. The mobile app is for notifications and quick settings.',
      icon: '✏️'
    },
    {
      id: 8,
      question: 'How do I contact support?',
      answer: 'Email us at support@localbook.ie or call +353 1 234 5678. Business support is available Monday-Friday, 9am-5pm.',
      icon: '💬'
    }
  ];

  function toggleNotification(key) {
    const newNotifications = { ...notifications };
    newNotifications[key] = !newNotifications[key];
    setNotifications(newNotifications);
  }

  function togglePreference(key) {
    const newPreferences = { ...preferences };
    newPreferences[key] = !newPreferences[key];
    setPreferences(newPreferences);
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

  function handleManageBusiness() {
    Alert.alert(
      'Edit Business Info',
      'To update your business details (name, address, description), please visit our website at localbook.ie',
      [{ text: 'OK' }]
    );
  }

  function handleViewWebsite() {
    Alert.alert(
      'Visit Website',
      'Open localbook.ie in your browser to manage full business settings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
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

  function handleOpenFaqModal() {
    setShowFaqModal(true);
    setExpandedFaq(null);
  }

  function handleCloseFaqModal() {
    setShowFaqModal(false);
    setExpandedFaq(null);
  }

  function toggleFaq(faqId) {
    if (expandedFaq === faqId) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(faqId);
    }
  }

  let userName = 'My Business';
  if (user && user.name) {
    userName = user.name;
  }

  let userEmail = '';
  if (user && user.email) {
    userEmail = user.email;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
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
              <Text style={{ fontSize: 40 }}>🏪</Text>
            </View>
            <Text style={{ 
              color: '#ffffff', 
              fontSize: 22, 
              fontWeight: '700', 
              marginBottom: 4 
            }}>
              {userName}
            </Text>
            <Text style={{ color: '#e9d5ff', fontSize: 14 }}>
              {userEmail}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          
          {/* Business Management */}
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
                  backgroundColor: '#f5f3ff', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>✏️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: 2 
                  }}>
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
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
              onPress={handleOpenFaqModal}
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
                  <Text style={{ fontSize: 20 }}>❓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: 2 
                  }}>
                    FAQ & Business Rules
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    Platform policies for businesses
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
                  backgroundColor: '#f5f3ff', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>🌐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: 2 
                  }}>
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
                  New Bookings
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Get notified of new appointments
                </Text>
              </View>
              <Switch
                value={notifications.newBookings}
                onValueChange={() => toggleNotification('newBookings')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.newBookings ? '#7c3aed' : '#f4f4f5'}
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
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
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
                  Cancellations
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Alert when bookings are cancelled
                </Text>
              </View>
              <Switch
                value={notifications.cancellations}
                onValueChange={() => toggleNotification('cancellations')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.cancellations ? '#7c3aed' : '#f4f4f5'}
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
                  Reviews
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  New customer reviews
                </Text>
              </View>
              <Switch
                value={notifications.reviews}
                onValueChange={() => toggleNotification('reviews')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.reviews ? '#7c3aed' : '#f4f4f5'}
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
                  Promotions
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Tips and marketing updates
                </Text>
              </View>
              <Switch
                value={notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={notifications.promotions ? '#7c3aed' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Booking Preferences */}
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
              Booking Preferences
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
                  Auto-Accept Bookings
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Automatically confirm appointments
                </Text>
              </View>
              <Switch
                value={preferences.autoAcceptBookings}
                onValueChange={() => togglePreference('autoAcceptBookings')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={preferences.autoAcceptBookings ? '#7c3aed' : '#f4f4f5'}
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
                  Show Business Hours
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Display opening times to clients
                </Text>
              </View>
              <Switch
                value={preferences.showBusinessHours}
                onValueChange={() => togglePreference('showBusinessHours')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={preferences.showBusinessHours ? '#7c3aed' : '#f4f4f5'}
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
                  Allow Cancellations
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Let clients cancel bookings
                </Text>
              </View>
              <Switch
                value={preferences.allowCancellations}
                onValueChange={() => togglePreference('allowCancellations')}
                trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                thumbColor={preferences.allowCancellations ? '#7c3aed' : '#f4f4f5'}
              />
            </View>
          </View>

          {/* Help & Support */}
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
                FAQ & Business Rules
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
                borderLeftColor: '#7c3aed',
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
                    color: '#5b21b6',
                    marginBottom: 4
                  }}>
                    Platform Requirements
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#6d28d9',
                    lineHeight: 18
                  }}>
                    These rules ensure quality service and fair access for all LocalBook Carlow businesses.
                  </Text>
                </View>
              </View>

              {/* FAQ Items */}
              {faqData.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                const borderColor = isExpanded ? '#7c3aed' : '#e5e7eb';
                const bgColor = isExpanded ? '#faf5ff' : '#ffffff';
                const iconBgColor = isExpanded ? '#ede9fe' : '#f9fafb';
                const textColor = isExpanded ? '#7c3aed' : '#111827';
                const arrowColor = isExpanded ? '#7c3aed' : '#9ca3af';
                const arrowRotation = isExpanded ? '180deg' : '0deg';

                return (
                  <View
                    key={faq.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderWidth: 1.5,
                      borderColor: borderColor,
                      borderRadius: 12,
                      marginBottom: 10,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOpacity: isExpanded ? 0.1 : 0,
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
                        backgroundColor: bgColor
                      }}
                    >
                      <View style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: iconBgColor,
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
                        color: textColor,
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
                          color: arrowColor,
                          transform: [{ rotate: arrowRotation }]
                        }}>
                          ▼
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
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
                );
              })}

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
                    Need more help?
                  </Text>
                </View>
                <Text style={{
                  fontSize: 13,
                  color: '#15803d',
                  marginBottom: 12,
                  lineHeight: 19
                }}>
                  Our business support team is here to help Monday-Friday, 9am-5pm.
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

export default BusinessProfileScreen;