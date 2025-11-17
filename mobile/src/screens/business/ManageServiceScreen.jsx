import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

function ManageServicesScreen() {
  const authContext = useAuth();
  const user = authContext.user;
  const token = authContext.token;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form fields
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('=== MANAGE SERVICES SCREEN ===');
    console.log('User businessId:', user ? user.businessId : 'N/A');
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      if (!user || !user.businessId) {
        console.error('No businessId found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const url = `http://192.168.1.15:8080/api/services/business/${user.businessId}`;
      console.log('Fetching services from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Services loaded:', data.length);
        if (data.length > 0) {
          console.log('First service:', JSON.stringify(data[0], null, 2));
        }
        setServices(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to load services:', errorText);
        Alert.alert('Error', 'Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchServices();
  }

  function openAddModal() {
    setEditingService(null);
    setServiceName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setModalVisible(true);
  }

  function openEditModal(service) {
    console.log('Editing service:', JSON.stringify(service, null, 2));
    setEditingService(service);
    setServiceName(service.serviceName || '');
    setDescription(service.description || '');
    setPrice(String(service.price || ''));
    setDuration(String(service.durationMinutes || ''));
    setModalVisible(true);
  }

  function closeModal() {
    Keyboard.dismiss(); // Dismiss keyboard when closing modal
    setModalVisible(false);
    setEditingService(null);
    setServiceName('');
    setDescription('');
    setPrice('');
    setDuration('');
  }

  async function handleSaveService() {
    // Dismiss keyboard before validation
    Keyboard.dismiss();

    // Validation
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Please enter service name');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration (minutes)');
      return;
    }

    setSaving(true);

    try {
      const serviceData = {
        serviceName: serviceName.trim(),
        description: description.trim(),
        price: Number(price),
        durationMinutes: Number(duration),
        business: {
          id: user.businessId
        }
      };

      let url;
      let method;

      if (editingService) {
        url = `http://192.168.1.15:8080/api/services/${editingService.id}?businessId=${user.businessId}`;
        method = 'PUT';
      } else {
        url = `http://192.168.1.15:8080/api/services?businessId=${user.businessId}`;
        method = 'POST';
      }

      console.log('=== SAVE SERVICE ===');
      console.log('Method:', method);
      console.log('URL:', url);
      console.log('Data:', JSON.stringify(serviceData, null, 2));

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        Alert.alert(
          'Success', 
          editingService ? 'Service updated!' : 'Service created!',
          [
            {
              text: 'OK',
              onPress: () => {
                closeModal();
                fetchServices();
              }
            }
          ]
        );
      } else {
        const errorText = await response.text();
        console.error('Save failed:', errorText);
        Alert.alert('Error', 'Failed to save service: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteService(service) {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.serviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(service)
        }
      ]
    );
  }

  async function confirmDelete(service) {
    try {
      const url = `http://192.168.1.15:8080/api/services/${service.id}?businessId=${user.businessId}`;
      console.log('Deleting service:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        Alert.alert('Success', 'Service deleted!');
        fetchServices();
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', errorText);
        Alert.alert('Error', 'Failed to delete service: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#22c55e', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
          Manage Services
        </Text>
        <Text style={{ color: '#bbf7d0', fontSize: 14 }}>
          {services.length} service{services.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Add Service Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#22c55e',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
          onPress={openAddModal}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>➕</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Add New Service
          </Text>
        </TouchableOpacity>

        {/* Services List */}
        {services.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
              No Services Yet
            </Text>
            <Text style={{ color: '#6b7280', textAlign: 'center' }}>
              Add your first service to start accepting bookings
            </Text>
          </View>
        ) : (
          services.map((service) => {
            const name = service.serviceName || 'Unnamed Service';
            const desc = service.description || '';
            const servicePrice = service.price || 0;
            const serviceDuration = service.durationMinutes || 0;

            return (
              <View
                key={service.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
                      {name}
                    </Text>
                    {desc ? (
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                        {desc}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 }}>
                      <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 16 }}>
                        €{servicePrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: '#1e40af', fontWeight: '600', fontSize: 14 }}>
                        ⏱️ {serviceDuration} min
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      borderRadius: 8,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                    onPress={() => openEditModal(service)}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                      ✏️ Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      borderRadius: 8,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                    onPress={() => handleDeleteService(service)}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                      🗑️ Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add/Edit Service Modal - WITH KEYBOARD FIX */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
              <TouchableWithoutFeedback>
                <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Text style={{ fontSize: 24, color: '#6b7280' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Service Name */}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Service Name *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                      }}
                      placeholder="e.g., Haircut, Facial, Manicure"
                      value={serviceName}
                      onChangeText={setServiceName}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    {/* Description */}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Description
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        height: 80,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Brief description of the service"
                      value={description}
                      onChangeText={setDescription}
                      multiline={true}
                      numberOfLines={3}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    {/* Price */}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Price (€) *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                      }}
                      placeholder="e.g., 25.00"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    {/* Duration */}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Duration (minutes) *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                      }}
                      placeholder="e.g., 60"
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    {/* Save Button */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: saving ? '#9ca3af' : '#22c55e',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                      onPress={handleSaveService}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                          {editingService ? 'Update Service' : 'Create Service'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                      }}
                      onPress={closeModal}
                    >
                      <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default ManageServicesScreen;