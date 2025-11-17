import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/Registerscreen';

import ClientHomeScreen from './src/screens/client/ClientHomeScreen';
import BusinessDetailsScreen from './src/screens/client/BusinessDetailScreen';
import BookAppointmentScreen from './src/screens/client/BookAppointment';
import MyBookingsScreen from './src/screens/client/MyBookingsScreen';

import BusinessHomeScreen from './src/screens/business/BusinessHomeScreen';
import ManageAppointmentsScreen from './src/screens/business/ManageAppointmentScreen';
import ManageServicesScreen from './src/screens/business/ManageServiceScreen';
import BusinessProfileScreen from './src/screens/business/BusinessProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ClientProfileScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const logout = authContext.logout;
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      <View style={{ backgroundColor: '#ffffff', borderRadius: 9999, width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1 }}>
        <Text style={{ fontSize: 48 }}>👤</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
        {user ? user.name : ''}
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>
        {user ? user.email : ''}
      </Text>
      <TouchableOpacity 
        onPress={logout}
        style={{ backgroundColor: '#ef4444', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 32 }}>
        LocalBook v1.0.0
      </Text>
    </View>
  );
}

function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 120,
          paddingBottom: 40,
          paddingTop: 7,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>🏠</Text>;
          },
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>📅</Text>;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>👤</Text>;
          },
        }}
      />
    </Tab.Navigator>
  );
}

function BusinessTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 120,
          paddingBottom: 40,
          paddingTop: 7,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="BusinessHome"
        component={BusinessHomeScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>📊</Text>;
          },
        }}
      />
      <Tab.Screen
        name="ManageAppointments"
        component={ManageAppointmentsScreen}
        options={{
          title: 'Appointments',
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>📋</Text>;
          },
        }}
      />
      <Tab.Screen
        name="ManageServices"
        component={ManageServicesScreen}
        options={{
          title: 'Services',
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>⚙️</Text>;
          },
        }}
      />
      <Tab.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: function(props) {
            return <Text style={{ fontSize: 18 }}>🏪</Text>;
          },
        }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const authContext = useAuth();
  const user = authContext.user;
  const loading = authContext.loading;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#6b7280', marginTop: 16, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <React.Fragment>
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: 'Create Account',
              headerBackTitle: 'Back',
            }}
          />
        </React.Fragment>
      ) : user.role === 'CLIENT' ? (
        <React.Fragment>
          <Stack.Screen
            name="MainTabs"
            component={ClientTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="BusinessDetails"
            component={BusinessDetailsScreen}
            options={{
              title: 'Business Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="BookAppointment"
            component={BookAppointmentScreen}
            options={{
              title: 'Book Appointment',
              headerBackTitle: 'Back',
            }}
          />
        </React.Fragment>
      ) : user.role === 'BUSINESS_OWNER' ? (
        <React.Fragment>
          <Stack.Screen
            name="BusinessTabs"
            component={BusinessTabNavigator}
            options={{
              headerShown: false,
            }}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Stack.Screen
            name="Error"
            component={function() {
              return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 24 }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
                    Unknown User Role
                  </Text>
                  <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
                    Please contact support
                  </Text>
                </View>
              );
            }}
            options={{
              headerShown: false,
            }}
          />
        </React.Fragment>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}