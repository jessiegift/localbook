import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';

import Button from '../../common/Button';
import Input from '../../common/Input';

const ManageServiceScreen = () => {
  const { user, token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.15:8080/api/businesses/${user.businessId}/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '' });
    setModalVisible(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setModalVisible(true);
  };

  const handleSaveService = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return;
    }

    if (parseInt(formData.duration) <= 0) {
      Alert.alert('Error', 'Duration must be greater than 0');
      return;
    }

    try {
      const url = editingService
        ? `http://192.168.1.15:8080/api/services/${editingService.id}`
        : `http://192.168.1.15:8080/api/businesses/${user.businessId}/services`;

      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          businessId: user.businessId,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', `Service ${editingService ? 'updated' : 'added'} successfully!`);
        setModalVisible(false);
        fetchServices();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to save service');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleDeleteService = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `http://192.168.1.15:8080/api/services/${service.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Service deleted');
                fetchServices();
              } else {
                Alert.alert('Error', 'Failed to delete service');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const renderService = ({ item, index }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm mb-3 mx-4">
      {/* Header - Service Name & Number */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.name}
          </Text>
          {item.description && (
            <Text className="text-sm text-gray-600 mb-2">
              {item.description}
            </Text>
          )}
        </View>
        <View className="bg-green-100 px-2 py-1 rounded">
          <Text className="text-green-800 font-bold text-xs">#{index + 1}</Text>
        </View>
      </View>

      {/* Price & Duration */}
      <View className="flex-row items-center mb-3">
        <View className="bg-green-500 px-4 py-2 rounded-lg mr-2">
          <Text className="text-white font-bold text-base">
            ${item.price}
          </Text>
        </View>
        <View className="bg-blue-100 px-4 py-2 rounded-lg">
          <Text className="text-blue-800 font-semibold text-sm">
            ⏱️ {item.duration} min
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <Button
          title="✏️ Edit"
          variant="outline"
          size="small"
          onPress={() => handleEditService(item)}
          className="flex-1"
        />
        <Button
          title="🗑️ Delete"
          variant="danger"
          size="small"
          onPress={() => handleDeleteService(item)}
          className="flex-1"
        />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-20 px-6">
      <Text className="text-6xl mb-4">⚙️</Text>
      <Text className="text-gray-500 text-xl font-bold mb-2">
        No Services Yet
      </Text>
      <Text className="text-gray-400 text-sm text-center mb-6">
        Add your first service to start accepting bookings
      </Text>
      <Button
        title="+ Add Your First Service"
        variant="success"
        onPress={handleAddService}
      />
    </View>
  );

  const renderHeader = () => (
    <View className="bg-white p-4 mb-3">
      <Text className="text-gray-600 text-sm mb-3">
        Manage your services, pricing, and duration. Customers will see these when booking.
      </Text>
      <Button
        title="+ Add New Service"
        variant="success"
        icon="➕"
        onPress={handleAddService}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading services..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListHeaderComponent={services.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchServices();
          }} />
        }
      />

      {/* Add/Edit Service Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                {editingService ? '✏️ Edit Service' : '➕ Add Service'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-4xl text-gray-400">×</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View>
              <Input
                label="Service Name *"
                placeholder="e.g. Haircut, Massage, Facial"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                icon="✂️"
              />

              <Input
                label="Description"
                placeholder="Brief description (optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Price ($) *"
                    placeholder="0.00"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                    icon="💵"
                  />
                </View>

                <View className="flex-1">
                  <Input
                    label="Duration (min) *"
                    placeholder="60"
                    value={formData.duration}
                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                    keyboardType="number-pad"
                    icon="⏱️"
                  />
                </View>
              </View>

              {/* Helper Text */}
              <View className="bg-blue-50 px-4 py-3 rounded-lg mb-4">
                <Text className="text-blue-800 text-xs">
                  💡 Tip: Set accurate duration to avoid double bookings
                </Text>
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setModalVisible(false)}
                  className="flex-1"
                />
                <Button
                  title={editingService ? "Update" : "Add Service"}
                  variant="success"
                  onPress={handleSaveService}
                  className="flex-1"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default ManageServiceScreen;