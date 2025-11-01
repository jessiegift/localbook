import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ManageService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setServiceData({ ...serviceData, [id]: value });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Basic validation
      if (!serviceData.name || !serviceData.price || !serviceData.duration) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      await api.post('/services', {
        businessId: user?.businessId,
        name: serviceData.name,
        description: serviceData.description,
        price: parseFloat(serviceData.price),
        duration: parseInt(serviceData.duration, 10),
      });

      setMessage('✅ Service added successfully!');
      setServiceData({ name: '', description: '', price: '', duration: '' });

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Manage Services
      </h2>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleAddService}>
        {/* Service Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Service Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={serviceData.name}
            onChange={handleChange}
            placeholder="e.g., Haircut, Phone Repair"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={serviceData.description}
            onChange={handleChange}
            placeholder="Brief description of the service"
            rows="3"
            required
          ></textarea>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="price">
            Price (€)
          </label>
          <input
            type="number"
            id="price"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={serviceData.price}
            onChange={handleChange}
            placeholder="e.g., 50.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="duration">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={serviceData.duration}
            onChange={handleChange}
            placeholder="e.g., 60"
            min="10"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 text-white py-2 rounded transition duration-200 ${
            loading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-purple-700'
          }`}
        >
          {loading ? 'Adding Service...' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default ManageService;
