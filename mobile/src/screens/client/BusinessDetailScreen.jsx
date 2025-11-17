import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const screenDimensions = Dimensions.get('window');
const SCREEN_WIDTH = screenDimensions.width;

function BusinessDetailScreen(props) {
  const route = props.route;
  const navigation = props.navigation;
  const routeParams = route.params;
  const businessId = routeParams.businessId;
  
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    fetchBusinessDetails();
    fetchBusinessServices();
  }, [businessId]);

  async function fetchBusinessDetails() {
    try {
      setLoading(true);
      
      const businessIdString = businessId.toString();
      const apiUrl = API_BASE_URL + '/businesses/' + businessIdString;
      console.log('📍 Fetching business details from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      const responseStatus = response.status;
      console.log('📡 Response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        const data = await response.json();
        console.log('✅ Business data:', data);
        setBusiness(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load business:', errorText);
        Alert.alert('Error', 'Failed to load business details');
        navigation.goBack();
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error('❌ Error fetching business details:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function fetchBusinessServices() {
    try {
      setServicesLoading(true);
      
      const businessIdString = businessId.toString();
      const apiUrl = API_BASE_URL + '/businesses/' + businessIdString + '/services';
      console.log('🔧 Fetching services from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      const responseStatus = response.status;
      console.log('📡 Services response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        const data = await response.json();
        const dataLength = data.length;
        console.log('✅ Services fetched:', dataLength);
        setServices(data);
      } else {
        console.log('⚠️ No services found');
        const emptyArray = [];
        setServices(emptyArray);
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error('❌ Error fetching services:', error);
      const emptyArray = [];
      setServices(emptyArray);
    } finally {
      setServicesLoading(false);
    }
  }

  function handleBookService(service) {
    console.log('📅 Navigating to booking for service:', service.serviceName);
    
    const navigationParams = {
      business: business,
      service: service,
    };
    
    navigation.navigate('BookAppointment', navigationParams);
  }

  function handleGoBack() {
    navigation.goBack();
  }

  if (loading === true) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
      }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{
          marginTop: 16,
          fontSize: 15,
          color: '#6b7280',
          fontWeight: '600',
        }}>
          Loading business...
        </Text>
      </View>
    );
  }

  const hasBusiness = business !== null && business !== undefined;
  if (hasBusiness === false) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 32,
      }}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 50 }}>🏪</Text>
        </View>
        <Text style={{
          fontSize: 22,
          fontWeight: '700',
          color: '#111827',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Business Not Found
        </Text>
        <Text style={{
          fontSize: 15,
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          This business is no longer available
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#7c3aed',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 12,
          }}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '700',
          }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  let businessName = 'Business';
  const hasBusinessName = business.businessName !== null && business.businessName !== undefined;
  if (hasBusinessName === true) {
    businessName = business.businessName;
  }

  let category = 'General';
  const hasCategory = business.category !== null && business.category !== undefined;
  if (hasCategory === true) {
    category = business.category;
  }

  let location = 'Location not specified';
  const hasLocation = business.location !== null && business.location !== undefined;
  if (hasLocation === true) {
    location = business.location;
  }

  const phoneNumber = business.phoneNumber;
  const hasPhoneNumber = phoneNumber !== null && phoneNumber !== undefined;

  const description = business.description;
  const hasDescription = description !== null && description !== undefined;

  const isApproved = business.approved === true;

  const servicesCount = services.length;
  const hasServices = servicesCount > 0;

  function renderServiceCard(service, index) {
    const serviceId = service.id;
    const serviceName = service.serviceName;
    
    let serviceDescription = 'No description provided';
    const hasServiceDescription = service.description !== null && service.description !== undefined;
    if (hasServiceDescription === true) {
      serviceDescription = service.description;
    }

    const price = service.price;
    const priceFormatted = price.toFixed(2);

    const durationMinutes = service.durationMinutes;
    const durationString = durationMinutes.toString();

    const isLastService = index === servicesCount - 1;
    let marginBottom = 16;
    if (isLastService === true) {
      marginBottom = 0;
    }

    function handlePress() {
      handleBookService(service);
    }

    return (
      <View
        key={serviceId}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 20,
          marginBottom: marginBottom,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
          borderWidth: 2,
          borderColor: '#f3f4f6',
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{
              fontSize: 19,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 8,
              lineHeight: 24,
            }}>
              {serviceName}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 20,
            }}>
              {serviceDescription}
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: '#f5f3ff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e9d5ff',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View>
              <Text style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#6b7280',
                marginBottom: 6,
                letterSpacing: 1,
              }}>
                PRICE
              </Text>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                color: '#7c3aed',
              }}>
                €{priceFormatted}
              </Text>
            </View>

            <View style={{
              width: 1,
              height: 50,
              backgroundColor: '#e9d5ff',
            }} />

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#6b7280',
                marginBottom: 6,
                letterSpacing: 1,
              }}>
                DURATION
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 20, marginRight: 6 }}>⏱️</Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#111827',
                }}>
                  {durationString} min
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#7c3aed',
            paddingVertical: 16,
            borderRadius: 12,
            shadowColor: '#7c3aed',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>📅</Text>
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '700',
            }}>
              Book This Service
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  function renderServicesList() {
    const serviceCards = [];
    let serviceIndex = 0;
    
    while (serviceIndex < servicesCount) {
      const service = services[serviceIndex];
      const card = renderServiceCard(service, serviceIndex);
      serviceCards.push(card);
      serviceIndex = serviceIndex + 1;
    }
    
    return serviceCards;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Hero Header */}
        <View style={{
          backgroundColor: '#7c3aed',
          paddingTop: 60,
          paddingBottom: 0,
        }}>
          <View style={{
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={{
                alignSelf: 'flex-start',
                marginBottom: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 15,
                fontWeight: '600',
              }}>
                ← Back
              </Text>
            </TouchableOpacity>

            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: 16,
              lineHeight: 34,
            }}>
              {businessName}
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: '700',
                }}>
                  {category}
                </Text>
              </View>

              {isApproved === true && (
                <View style={{
                  backgroundColor: '#10b981',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                    ✓ Verified
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{
            height: 24,
            backgroundColor: '#f9fafb',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }} />
        </View>

        {/* Business Information Cards */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}>
          {/* Location Card */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 18,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#fef3c7',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 22 }}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#6b7280',
                marginBottom: 6,
                letterSpacing: 1,
              }}>
                LOCATION
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#111827',
                fontWeight: '600',
                lineHeight: 22,
              }}>
                {location}
              </Text>
            </View>
          </View>

          {/* Phone Card */}
          {hasPhoneNumber === true && (
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 18,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'flex-start',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#dbeafe',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 22 }}>📞</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#6b7280',
                  marginBottom: 6,
                  letterSpacing: 1,
                }}>
                  PHONE
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: '#111827',
                  fontWeight: '600',
                  lineHeight: 22,
                }}>
                  {phoneNumber}
                </Text>
              </View>
            </View>
          )}

          {/* Description Card */}
          {hasDescription === true && (
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#f3e8ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>ℹ️</Text>
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#111827',
                }}>
                  About
                </Text>
              </View>
              <Text style={{
                fontSize: 15,
                color: '#374151',
                lineHeight: 24,
              }}>
                {description}
              </Text>
            </View>
          )}

          {/* Services Section */}
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#f5f3ff',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 22 }}>💼</Text>
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
              }}>
                Services
              </Text>
            </View>

            {servicesLoading === true ? (
              <View style={{
                paddingVertical: 40,
                alignItems: 'center',
              }}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#6b7280',
                  fontWeight: '600',
                }}>
                  Loading services...
                </Text>
              </View>
            ) : hasServices === false ? (
              <View style={{
                paddingVertical: 60,
                alignItems: 'center',
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#f9fafb',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Text style={{ fontSize: 40 }}>📭</Text>
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 4,
                }}>
                  No Services Available
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}>
                  This business hasn't added any services yet
                </Text>
              </View>
            ) : (
              <View>
                {renderServicesList()}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export default BusinessDetailScreen;