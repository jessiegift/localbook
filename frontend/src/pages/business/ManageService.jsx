import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ManageService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [businessId, setBusinessId] = useState(null);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.id) {
        fetchBusinessId();
      } else {
        setInitialLoading(false);
      }
    } else {
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (businessId) {
      if (businessId !== null) {
        fetchServices();
      }
    }
  }, [businessId]);

  const fetchBusinessId = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get('/businesses/owner/' + user.id);
      
      console.log('Business response:', response.data);
      
      if (response.data) {
        if (response.data.length > 0) {
          setBusinessId(response.data[0].id);
          setError('');
        } else {
          setError('');
          setBusinessId(null);
        }
      } else {
        setError('');
        setBusinessId(null);
      }
    } catch (err) {
      console.error('Error fetching business:', err);
      
      if (err.response) {
        if (err.response.status === 404) {
          setBusinessId(null);
          setError('');
        } else {
          setError('Unable to load business information.');
        }
      } else {
        setError('Unable to load business information.');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/businesses/' + businessId + '/services');
      
      if (response.data) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    }
  };

  const handleAddService = async (event) => {
    event.preventDefault();
    
    if (businessId === null || !businessId) {
      setError('⚠️ Please complete business setup first.');
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!serviceData.name || !serviceData.price || !serviceData.duration) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const dataToSend = {
        serviceName: serviceData.name,
        durationMinutes: parseInt(serviceData.duration, 10),
        price: parseFloat(serviceData.price),
        description: serviceData.description || ''
      };

      console.log('Sending service data:', dataToSend);
      console.log('Business ID:', businessId);

      if (editingService && editingService !== null) {
        const updateUrl = '/services/' + editingService.id + '?businessId=' + businessId;
        console.log('Update URL:', updateUrl);
        
        const response = await api.put(updateUrl, dataToSend);
        console.log('Update response:', response);
        
        setMessage('✅ Service updated successfully!');
        setEditingService(null);
      } else {
        const createUrl = '/services?businessId=' + businessId;
        console.log('Create URL:', createUrl);
        
        const response = await api.post(createUrl, dataToSend);
        console.log('Create response:', response);
        
        setMessage('✅ Service added successfully!');
      }

      setServiceData({
        name: '',
        description: '',
        price: '',
        duration: ''
      });
      
      fetchServices();

      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Service save error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to save service';
      
      if (err.response) {
        console.log('Full error response data:', err.response.data);
        
        if (err.response.data) {
          // If the response data is a string, use it directly
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } 
          // If it has a message property
          else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
          // If it's an object, stringify it
          else if (typeof err.response.data === 'object') {
            errorMessage = JSON.stringify(err.response.data);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError('❌ ' + errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    
    setServiceData({
      name: service.serviceName,
      description: service.description,
      price: service.price.toString(),
      duration: service.durationMinutes.toString()
    });
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleChange = (event) => {
    const fieldId = event.target.id;
    const fieldValue = event.target.value;
    
    setServiceData({
      ...serviceData,
      [fieldId]: fieldValue
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    
    setServiceData({
      name: '',
      description: '',
      price: '',
      duration: ''
    });
  };

  const handleDeleteService = async (serviceId) => {
    const confirmed = window.confirm('Are you sure you want to delete this service?');
    
    if (confirmed === false) {
      return;
    }

    try {
      await api.delete('/services/' + serviceId + '?businessId=' + businessId);
      
      setMessage('✅ Service deleted successfully!');
      
      fetchServices();
      
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setError('❌ Failed to delete service.');
    }
  };

  if (initialLoading === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (businessId === null) {
    if (initialLoading === false) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Business Setup Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to set up your business profile before adding services.
            </p>
            <button
              onClick={() => {
                navigate('/business/setup');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
            >
              Set Up Business Profile
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingService ? '✏️ Edit Service' : '➕ Add New Service'}
        </h2>

        {message && message.length > 0 ? (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 mb-4 rounded flex items-center">
            <span className="mr-2">✅</span>
            {message}
          </div>
        ) : null}
        
        {error && error.length > 0 ? (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleAddService}>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
              Service Name *
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={serviceData.name}
              onChange={handleChange}
              placeholder="e.g., Haircut, Phone Repair"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={serviceData.description}
              onChange={handleChange}
              placeholder="Brief description of the service (optional)"
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="price">
                Price (€) *
              </label>
              <input
                type="number"
                id="price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={serviceData.price}
                onChange={handleChange}
                placeholder="e.g., 50.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="duration">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={serviceData.duration}
                onChange={handleChange}
                placeholder="e.g., 60"
                min="10"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            
            <button
              type="submit"
              disabled={loading === true || businessId === null}
              className={
                loading === true || businessId === null
                  ? 'flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold transition duration-200 opacity-50 cursor-not-allowed'
                  : 'flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold transition duration-200 hover:bg-purple-700 active:bg-purple-800'
              }
            >
              {loading === true ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </span>
              ) : (
                editingService ? '💾 Update Service' : '➕ Add Service'
              )}
            </button>
            
            {editingService ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Services</h2>
        
        {services.length === 0 ? (
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-gray-500 text-lg font-semibold">No services yet</p>
            <p className="text-gray-400 text-sm mt-2">Add your first service using the form above</p>
          </div>
          
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {services.map((service) => {
              return (
                <div
                  key={service.id}
                  className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-purple-300 transition"
                >
                  
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {service.serviceName}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <span className="text-purple-600 font-bold text-2xl">
                        €{service.price}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <span className="text-gray-700 font-semibold text-lg">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    
                    <button
                      onClick={() => {
                        handleEditService(service);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDeleteService(service.id);
                      }}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                </div>
              );
            })}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageService;