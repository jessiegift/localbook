import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';

function BusinessRatingsScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
  });

  const API_BASE_URL = 'http://192.168.1.15:8080/api';

  useEffect(function() {
    fetchRatings();
  }, []);

  async function fetchRatings() {
    try {
      const businessId = user.businessId;
      const url = API_BASE_URL + '/ratings/business/' + businessId;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setStats({
          averageRating: data.averageRating || 0,
          totalRatings: data.totalRatings || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchRatings();
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading ratings..." />;
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={{ backgroundColor: '#7c3aed', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
          ⭐ Customer Ratings
        </Text>
        <Text style={{ color: '#e9d5ff', fontSize: 16 }}>
          See what your customers are saying
        </Text>
      </View>

      {/* Stats Card */}
      <View style={{ paddingHorizontal: 20, marginTop: -20, marginBottom: 16 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56, fontWeight: '700', color: '#a855f7', marginRight: 16 }}>
              {stats.averageRating.toFixed(1)}
            </Text>
            <View>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={{ fontSize: 24 }}>
                    {star <= Math.round(stats.averageRating) ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ratings List */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
          All Reviews
        </Text>

        {ratings.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
            <Text style={{ color: '#6b7280', fontWeight: '600', textAlign: 'center' }}>
              No ratings yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Ratings will appear here after customers review your services
            </Text>
          </View>
        ) : (
          ratings.map(function(rating, index) {
            return (
              <View 
                key={rating.id || index}
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: 16, 
                  padding: 16, 
                  shadowColor: '#000', 
                  shadowOpacity: 0.05, 
                  marginBottom: 12 
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                    {rating.user?.name || 'Anonymous'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#a855f7', marginRight: 4 }}>
                      {rating.rating}
                    </Text>
                    <Text style={{ fontSize: 16 }}>⭐</Text>
                  </View>
                </View>

                {rating.review && (
                  <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    {rating.review}
                  </Text>
                )}

                {rating.createdAt && (
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

export default BusinessRatingsScreen;