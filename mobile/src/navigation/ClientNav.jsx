import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';

// Client Screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import MyBookingsScreen from '../screens/client/MyBookingsScreen';
import ClientProfileScreen from '../screens/client/ClientProfileScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Simple Profile Screen placeholder
const ClientProfileScreen = () => {
  const { user, logout } = useAuth();
  
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center p-6">
      <View className="bg-white rounded-full w-24 h-24 items-center justify-center mb-4">
        <Text className="text-5xl">👤</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        {user?.name}
      </Text>
      <Text className="text-base text-gray-600 mb-8">
        {user?.email}
      </Text>
      <TouchableOpacity 
        onPress={logout}
        className="bg-red-500 px-8 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const ClientNav= () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />

        
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ClientNav;