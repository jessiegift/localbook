import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

function ClientProfileScreen(props) {
  const navigation = props.navigation;
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  const authLoading = authContext.loading;
  const logout = authContext.logout;

  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(function() {
    const hasUser = user !== null && user !== undefined;
    if (hasUser === true) {
      initializeEditFields();
    }
  }, [user]);

  function initializeEditFields() {
    const hasUser = user !== null && user !== undefined;
    if (hasUser === false) {
      return;
    }

    const userName = user.name;
    const hasUserName = userName !== null && userName !== undefined;
    if (hasUserName === true) {
      setEditName(userName);
    }

    const userEmail = user.email;
    const hasUserEmail = userEmail !== null && userEmail !== undefined;
    if (hasUserEmail === true) {
      setEditEmail(userEmail);
    }

    const userPhone = user.phoneNumber;
    const hasUserPhone = userPhone !== null && userPhone !== undefined;
    if (hasUserPhone === true) {
      setEditPhone(userPhone);
    } else {
      setEditPhone('');
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(function() {
      setRefreshing(false);
    }, 1000);
  }

  function handleLogout() {
    const alertButtons = [
      { 
        text: 'Cancel', 
        style: 'cancel' 
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async function() {
          try {
            await logout();
          } catch (errorObject) {
            console.warn('Logout error', errorObject);
          }
        },
      },
    ];

    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', alertButtons);
  }

  function handleOpenEditProfile() {
    initializeEditFields();
    setShowEditModal(true);
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
  }

  function handleViewMyBookings() {
    navigation.navigate('MyBookings');
  }

  async function handleSaveProfile() {
    console.log('💾 Saving profile...');
    setUpdating(true);

    setTimeout(function() {
      setUpdating(false);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1500);
  }

  if (authLoading === true) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{
          marginTop: 16,
          color: '#6b7280',
          fontSize: 15
        }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const hasUser = user !== null && user !== undefined;
  if (hasUser === false) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 32
      }}>
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 60 }}>👤</Text>
        </View>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#111827',
          marginBottom: 8
        }}>
          Not Signed In
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Please log in to see your profile
        </Text>
      </View>
    );
  }

  const userName = user.name;
  const userEmail = user.email;
  const userPhone = user.phoneNumber;
  const userRole = user.role;
  
  let displayName = 'No name';
  const hasUserName = userName !== null && userName !== undefined;
  if (hasUserName === true) {
    displayName = userName;
  }

  let displayEmail = 'No email';
  const hasUserEmail = userEmail !== null && userEmail !== undefined;
  if (hasUserEmail === true) {
    displayEmail = userEmail;
  }

  let displayPhone = 'No phone number';
  const hasUserPhone = userPhone !== null && userPhone !== undefined && userPhone.length > 0;
  if (hasUserPhone === true) {
    displayPhone = userPhone;
  }

  let displayRole = 'User';
  const hasUserRole = userRole !== null && userRole !== undefined;
  if (hasUserRole === true) {
    const isClient = userRole === 'CLIENT';
    if (isClient === true) {
      displayRole = 'Client';
    } else {
      displayRole = userRole;
    }
  }

  const userInitials = (function() {
    const hasName = userName !== null && userName !== undefined && userName.length > 0;
    if (hasName === true) {
      const nameParts = userName.split(' ');
      const firstPart = nameParts[0];
      const firstLetter = firstPart.charAt(0);
      const upperFirstLetter = firstLetter.toUpperCase();
      
      const hasMultipleParts = nameParts.length > 1;
      if (hasMultipleParts === true) {
        const lastIndex = nameParts.length - 1;
        const lastPart = nameParts[lastIndex];
        const lastLetter = lastPart.charAt(0);
        const upperLastLetter = lastLetter.toUpperCase();
        return upperFirstLetter + upperLastLetter;
      }
      
      return upperFirstLetter;
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
        {/* Purple Header */}
        <View style={{
          backgroundColor: '#7c3aed',
          paddingTop: 48,
          paddingBottom: 32,
          paddingHorizontal: 20
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 24,
              fontWeight: '700'
            }}>
              My Profile
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8
              }}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#ffffff',
                fontWeight: '600'
              }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: 16
            }}>
              <View style={{
                backgroundColor: '#ffffff',
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}>
                <Text style={{
                  color: '#7c3aed',
                  fontSize: 36,
                  fontWeight: '700'
                }}>
                  {userInitials}
                </Text>
              </View>
              <Text style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 4
              }}>
                {displayName}
              </Text>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
                marginBottom: 8
              }}>
                {displayEmail}
              </Text>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  {displayRole}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 8
              }}
              onPress={handleOpenEditProfile}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✏️ Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 24
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 16
          }}>
            Account Information
          </Text>

          {/* Email Card */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
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
                  {displayEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Phone Card */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
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
                  {displayPhone}
                </Text>
              </View>
            </View>
          </View>

          {/* Member Since Card */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
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
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 16
          }}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#7c3aed',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#7c3aed',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
            onPress={handleViewMyBookings}
            activeOpacity={0.8}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>📅</Text>
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#ffffff'
                  }}>
                    My Bookings
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: 2
                  }}>
                    View and manage appointments
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, color: '#ffffff' }}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: '#e5e7eb',
            }}
            onPress={function() {
              Alert.alert('Settings', 'Settings feature coming soon!');
            }}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>⚙️</Text>
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Settings
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280',
                    marginTop: 2
                  }}>
                    Preferences and notifications
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, color: '#9ca3af' }}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: '#e5e7eb',
            }}
            onPress={function() {
              Alert.alert('Help & Support', 'Contact support at support@localbook.com');
            }}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>❓</Text>
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Help & Support
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280',
                    marginTop: 2
                  }}>
                    Get help or contact us
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, color: '#9ca3af' }}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={{
          paddingBottom: 40,
          alignItems: 'center'
        }}>
          <Text style={{
            color: '#9ca3af',
            fontSize: 13
          }}>
            LocalBook v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
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
            maxHeight: '80%'
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
            >
              {/* Name Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Full Name
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
                  Email Address
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
                  backgroundColor: updating === true ? '#a78bfa' : '#7c3aed',
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
                {updating === true ? (
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
      </Modal>
    </View>
  );
}

export default ClientProfileScreen;