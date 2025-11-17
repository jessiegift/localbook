import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';

import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import MyBookingsScreen from '../screens/client/MyBookingsScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

function ClientProfileScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const logout = authContext.logout;
  
  let userName = 'Guest';
  const hasUser = user !== null && user !== undefined;
  if (hasUser === true) {
    const hasUserName = user.name !== null && user.name !== undefined;
    if (hasUserName === true) {
      userName = user.name;
    }
  }

  let userEmail = 'No email';
  if (hasUser === true) {
    const hasUserEmail = user.email !== null && user.email !== undefined;
    if (hasUserEmail === true) {
      userEmail = user.email;
    }
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#f9fafb', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 24 
    }}>
      <View style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: 40, 
        width: 96, 
        height: 96, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12
      }}>
        <Text style={{ fontSize: 48 }}>👤</Text>
      </View>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: '700', 
        color: '#111827', 
        marginBottom: 8 
      }}>
        {userName}
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: '#6b7280', 
        marginBottom: 32 
      }}>
        {userEmail}
      </Text>
      <TouchableOpacity 
        onPress={logout}
        style={{ 
          backgroundColor: '#ef4444', 
          paddingHorizontal: 32, 
          paddingVertical: 12, 
          borderRadius: 12 
        }}
      >
        <Text style={{ 
          color: '#ffffff', 
          fontWeight: '600',
          fontSize: 16
        }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ClientNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
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
          backgroundColor: '#7c3aed',
        },
        headerTintColor: '#ffffff',
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
          tabBarIcon: function(props) {
            const color = props.color;
            return (
              <Text style={{ fontSize: 24 }}>🏠</Text>
            );
          },
        }}
      />

      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          headerShown: false,
          tabBarIcon: function(props) {
            const color = props.color;
            return (
              <Text style={{ fontSize: 24 }}>📅</Text>
            );
          },
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: function(props) {
            const color = props.color;
            return (
              <Text style={{ fontSize: 24 }}>👤</Text>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default ClientNav;