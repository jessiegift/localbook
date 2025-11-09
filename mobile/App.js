
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
// Auth Screens
import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/Registerscreen';

// Client Screens
import ClientHomeScreen from './src/screens/client/ClientHomeScreen';
import BusinessDetailsScreen from './src/screens/client/BusinessDetailScreen';
import BookAppointmentScreen from './src/screens/client/BookAppointment';
import MyBookingsScreen from './src/screens/client/MyBookingsScreen';

// Business Screens
import BusinessHomeScreen from './src/screens/business/BusinessHomeScreen';
import ManageAppointmentsScreen from './src/screens/business/ManageAppointmentScreen';
import ManageServicesScreen from './src/screens/business/ManageServiceScreen';
import BusinessProfileScreen from './src/screens/business/BusinessProfileScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================
// CLIENT PROFILE SCREEN (Simple Placeholder)
// ============================================
const ClientProfileScreen = () => {
  const { user, logout } = useAuth();
  
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">
      <View className="bg-white rounded-full w-24 h-24 items-center justify-center mb-4 shadow-lg">
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
        className="bg-red-500 px-8 py-3 rounded-lg active:bg-red-600"
      >
        <Text className="text-white font-semibold text-base">Logout</Text>
      </TouchableOpacity>
      <Text className="text-gray-400 text-xs mt-8">
        LocalBook v1.0.0
      </Text>
    </View>
  );
};

// ============================================
// CLIENT TAB NAVIGATOR
// ============================================
const ClientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 120,            // Keep small
          paddingBottom: 40,       // Lots of bottom padding (adjust as needed)
          paddingTop: 7,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 8,         // Remove extra margin
        },
        tabBarIconStyle: {
          marginTop: 0,            // Remove extra margin
        },
      }}
    >
      <Tab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">🏠</Text>  // Even smaller
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// BUSINESS TAB NAVIGATOR
// ============================================
const BusinessTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 120,            // Keep small
          paddingBottom: 40,       // Lots of bottom padding (adjust as needed)
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
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ManageAppointments"
        component={ManageAppointmentsScreen}
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">📋</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text className="text-lg">🏪</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
// ============================================
// MAIN NAVIGATION
// ============================================
const Navigation = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 text-base">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        // ============================================
        // AUTH STACK - User NOT logged in
        // ============================================
        <>
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
        </>
      ) : user.role === 'CLIENT' ? (
        // ============================================
        // CLIENT STACK - Client user logged in
        // ============================================
        <>
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
        </>
      ) : user.role === 'BUSINESS_OWNER' ? (
        // ============================================
        // BUSINESS STACK - Business owner logged in
        // ============================================
        <>
          <Stack.Screen
            name="BusinessTabs"
            component={BusinessTabNavigator}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        // ============================================
        // FALLBACK - Unknown role
        // ============================================
        <>
          <Stack.Screen
            name="Error"
            component={() => (
              <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-6xl mb-4">⚠️</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Unknown User Role
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Please contact support
                </Text>
              </View>
            )}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}