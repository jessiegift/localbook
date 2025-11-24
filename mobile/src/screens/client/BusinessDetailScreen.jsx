import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../Components/RatingStars';

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
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    fetchBusinessDetails();
    fetchBusinessServices();
    fetchRatings();
    fetchRatingSummary();
  }, [businessId]);

  async function fetchBusinessDetails() {
    try {
      setLoading(true);
      
      const businessIdString = businessId.toString();
      const timestamp = new Date().getTime();
      const apiUrl = API_BASE_URL + '/businesses/' + businessIdString + '?t=' + timestamp;
      console.log('📍 Fetching business details from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      const responseStatus = response.status;
      console.log('📡 Response status:', responseStatus);

      const isResponseOk = response.ok;
      if (isResponseOk === true) {
        const data = await response.json();
        console.log('✅ Business data received');
        console.log('🕐 Opening hours:', data.openingHours);
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
      const timestamp = new Date().getTime();
      const apiUrl = API_BASE_URL + '/businesses/' + businessIdString + '/services?t=' + timestamp;
      console.log('🔧 Fetching services from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
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

  async function fetchRatings() {
    try {
      const businessIdString = businessId.toString();
      const apiUrl = API_BASE_URL + '/ratings/business/' + businessIdString;
      console.log('⭐ Fetching ratings from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      
      if (response.ok === true) {
        const data = await response.json();
        console.log('✅ Ratings fetched:', data.length);
        setRatings(data);
      } else {
        console.log('⚠️ No ratings found');
        setRatings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      setRatings([]);
    }
  }

  async function fetchRatingSummary() {
    try {
      const businessIdString = businessId.toString();
      const apiUrl = API_BASE_URL + '/ratings/business/' + businessIdString + '/summary';
      console.log('📊 Fetching rating summary from:', apiUrl);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      
      if (response.ok === true) {
        const data = await response.json();
        console.log('✅ Rating summary:', data);
        setRatingSummary(data);
      } else {
        console.log('⚠️ No rating summary');
        setRatingSummary(null);
      }
    } catch (error) {
      console.error('❌ Error fetching rating summary:', error);
      setRatingSummary(null);
    }
  }

  async function onRefresh() {
    console.log('🔄 Refreshing business data...');
    setRefreshing(true);
    await fetchBusinessDetails();
    await fetchBusinessServices();
    await fetchRatings();
    await fetchRatingSummary();
    setRefreshing(false);
    console.log('✅ Refresh complete!');
  }

  function getBusinessStatus() {
    const hasOpeningHours = business !== null && business !== undefined && business.openingHours !== null && business.openingHours !== undefined;
    
    if (hasOpeningHours === false) {
      return { isOpen: true, message: '', hasHours: false };
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[dayOfWeek];
    const dayHours = business.openingHours[dayKey];

    if (dayHours === null || dayHours === undefined) {
      return { isOpen: true, message: '', hasHours: false };
    }

    if (dayHours.isClosed === true) {
      const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayLabel = dayLabels[dayOfWeek];
      return {
        isOpen: false,
        message: 'Closed on ' + todayLabel + 's',
        hasHours: true
      };
    }

    const openTime = dayHours.openTime;
    const closeTime = dayHours.closeTime;

    if (openTime === null || openTime === undefined || closeTime === null || closeTime === undefined) {
      return { isOpen: true, message: '', hasHours: false };
    }

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const openParts = openTime.split(':');
    const openHour = parseInt(openParts[0]);
    const openMinute = parseInt(openParts[1]);
    const openMinutes = openHour * 60 + openMinute;

    const closeParts = closeTime.split(':');
    const closeHour = parseInt(closeParts[0]);
    const closeMinute = parseInt(closeParts[1]);
    const closeMinutes = closeHour * 60 + closeMinute;

    const isAfterOpen = currentMinutes >= openMinutes;
    const isBeforeClose = currentMinutes < closeMinutes;
    const isCurrentlyOpen = isAfterOpen && isBeforeClose;

    if (isCurrentlyOpen === true) {
      const closeTimeFormatted = formatTime12Hour(closeTime);
      return {
        isOpen: true,
        message: 'Open now • Closes at ' + closeTimeFormatted,
        hasHours: true
      };
    } else {
      const openTimeFormatted = formatTime12Hour(openTime);
      return {
        isOpen: false,
        message: 'Closed now • Opens at ' + openTimeFormatted,
        hasHours: true
      };
    }
  }

  function formatTime12Hour(time24) {
    const parts = time24.split(':');
    const hours = parts[0];
    const minutes = parts[1];
    const hourNumber = parseInt(hours);
    
    let ampm = 'AM';
    const isAfternoon = hourNumber >= 12;
    if (isAfternoon === true) {
      ampm = 'PM';
    }
    
    let hour12 = hourNumber % 12;
    const isMidnight = hour12 === 0;
    if (isMidnight === true) {
      hour12 = 12;
    }
    
    const hour12String = hour12.toString();
    const formattedTime = hour12String + ':' + minutes + ' ' + ampm;
    return formattedTime;
  }

  function renderBusinessHours() {
    const hasOpeningHours = business !== null && business !== undefined && business.openingHours !== null && business.openingHours !== undefined;
    
    if (hasOpeningHours === false) {
      return null;
    }

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
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
          marginBottom: 16,
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#dbeafe',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Text style={{ fontSize: 22 }}>🕐</Text>
          </View>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#111827',
          }}>
            Business Hours
          </Text>
        </View>

        {dayNames.map(function(dayName, index) {
          const dayKey = dayKeys[index];
          const dayData = business.openingHours[dayKey];
          
          const isLastDay = index === dayNames.length - 1;
          let marginBottom = 12;
          if (isLastDay === true) {
            marginBottom = 0;
          }

          if (dayData === null || dayData === undefined) {
            return (
              <View
                key={dayKey}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  marginBottom: marginBottom,
                }}
              >
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#111827',
                }}>
                  {dayName}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6b7280',
                }}>
                  Not set
                </Text>
              </View>
            );
          }

          const isClosed = dayData.isClosed === true;

          return (
            <View
              key={dayKey}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
                marginBottom: marginBottom,
              }}
            >
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#111827',
              }}>
                {dayName}
              </Text>
              
              {isClosed === true && (
                <Text style={{
                  fontSize: 14,
                  color: '#ef4444',
                  fontWeight: '600',
                }}>
                  Closed
                </Text>
              )}
              
              {isClosed === false && (
                <Text style={{
                  fontSize: 14,
                  color: '#10b981',
                  fontWeight: '600',
                }}>
                  {formatTime12Hour(dayData.openTime)} - {formatTime12Hour(dayData.closeTime)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
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

  const ratingsCount = ratings.length;
  const hasRatings = ratingsCount > 0;

  const businessStatus = getBusinessStatus();

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

  function renderReviewCard(rating, index) {
    const ratingId = rating.id;
    
    let userName = 'Anonymous';
    const hasUser = rating.user !== null && rating.user !== undefined;
    if (hasUser === true) {
      const hasUserName = rating.user.name !== null && rating.user.name !== undefined;
      if (hasUserName === true) {
        userName = rating.user.name;
      }
    }
    
    const ratingValue = rating.rating;
    const reviewText = rating.review;
    const hasReviewText = reviewText !== null && reviewText !== undefined && reviewText.length > 0;
    
    const createdAt = new Date(rating.createdAt);
    const dateString = createdAt.toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const maxReviews = Math.min(ratingsCount, 5);
    const isLastReview = index === maxReviews - 1;
    let marginBottom = 12;
    if (isLastReview === true) {
      marginBottom = 0;
    }

    return (
      <View
        key={ratingId}
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          padding: 16,
          marginBottom: marginBottom,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: hasReviewText ? 12 : 0,
        }}>
          <Text style={{
            fontSize: 15,
            fontWeight: '700',
            color: '#111827',
          }}>
            {userName}
          </Text>
          <RatingStars rating={ratingValue} size={16} />
        </View>
        
        {hasReviewText && (
          <Text style={{
            fontSize: 14,
            color: '#4b5563',
            lineHeight: 20,
            marginBottom: 8,
          }}>
            {reviewText}
          </Text>
        )}
        
        <Text style={{
          fontSize: 12,
          color: '#9ca3af',
        }}>
          {dateString}
        </Text>
      </View>
    );
  }

  function renderReviewsList() {
    const reviewCards = [];
    const maxReviews = Math.min(ratingsCount, 5);
    let reviewIndex = 0;
    
    while (reviewIndex < maxReviews) {
      const rating = ratings[reviewIndex];
      const card = renderReviewCard(rating, reviewIndex);
      reviewCards.push(card);
      reviewIndex = reviewIndex + 1;
    }
    
    return reviewCards;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
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

            {ratingSummary !== null && ratingSummary !== undefined && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
              }}>
                <RatingStars 
                  rating={Math.round(ratingSummary.averageRating)} 
                  size={18} 
                />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: '#ffffff',
                  fontWeight: '600',
                }}>
                  {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'review' : 'reviews'})
                </Text>
              </View>
            )}

            {businessStatus.hasHours === true && (
              <View style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {businessStatus.isOpen === true && (
                  <View style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🟢</Text>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                      {businessStatus.message}
                    </Text>
                  </View>
                )}
                {businessStatus.isOpen === false && (
                  <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🔴</Text>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                      {businessStatus.message}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={{
            height: 24,
            backgroundColor: '#f9fafb',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }} />
        </View>

        <View style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}>
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

          {renderBusinessHours()}

          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            marginTop: 12,
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
                backgroundColor: '#fef3c7',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 22 }}>⭐</Text>
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#111827',
              }}>
                Customer Reviews ({ratingsCount})
              </Text>
            </View>

            {hasRatings === false && (
              <View style={{
                paddingVertical: 40,
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
                  <Text style={{ fontSize: 40 }}>⭐</Text>
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 4,
                }}>
                  No Reviews Yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}>
                  Be the first to review this business
                </Text>
              </View>
            )}
            
            {hasRatings === true && (
              <View>
                {renderReviewsList()}
              </View>
            )}
          </View>

          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            marginTop: 12,
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

            {servicesLoading === true && (
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
            )}
            
            {servicesLoading === false && hasServices === false && (
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
            )}
            
            {servicesLoading === false && hasServices === true && (
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