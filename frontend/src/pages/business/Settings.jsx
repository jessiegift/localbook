import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [businessId, setBusinessId] = useState(null);

    // Business Profile State
    const [profileData, setProfileData] = useState({
        businessName: '',
        description: '',
        category: '',
        location: '',
        address: '',
        phoneNumber: '',
        email: '',
        website: ''
    });

    // Business Hours State
    const [hoursData, setHoursData] = useState({
        monday: { enabled: true, open: '09:00', close: '18:00' },
        tuesday: { enabled: true, open: '09:00', close: '18:00' },
        wednesday: { enabled: true, open: '09:00', close: '18:00' },
        thursday: { enabled: true, open: '09:00', close: '18:00' },
        friday: { enabled: true, open: '09:00', close: '18:00' },
        saturday: { enabled: false, open: '10:00', close: '16:00' },
        sunday: { enabled: false, open: '10:00', close: '16:00' }
    });

    useEffect(() => {
        if (user?.id) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            console.log('Fetching business for user:', user.id);
            const response = await api.get(`/businesses/owner/${user.id}`);
            console.log('Business data response:', response.data);
            
            if (response.data && response.data.length > 0) {
                const business = response.data[0];
                setBusinessId(business.id);
                setProfileData({
                    businessName: business.name || '',
                    description: business.description || '',
                    category: business.category || '',
                    location: business.location || '',
                    address: business.address || '',
                    phoneNumber: business.phoneNumber || business.contactNumber || '',
                    email: business.email || business.businessemail || '',
                    website: business.website || ''
                });
            } else {
                setError('No business found. Please complete business setup first.');
            }
        } catch (err) {
            console.error('Error fetching business data:', err);
            setError('Unable to load business data. Please try again later.');
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleHoursChange = (day, field, value) => {
        setHoursData({
            ...hoursData,
            [day]: { ...hoursData[day], [field]: value }
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        if (!businessId) {
            setError('No business found. Please complete business setup first.');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.put(`/businesses/${businessId}`, profileData);
            setMessage('✅ Business profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('❌ Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHours = async (e) => {
        e.preventDefault();
        
        if (!businessId) {
            setError('No business found. Please complete business setup first.');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.put(`/businesses/${businessId}/hours`, { hours: hoursData });
            setMessage('✅ Business hours updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating hours:', err);
            setError('❌ Failed to update hours. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Business Settings</h1>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 px-6 py-4 font-medium transition ${
                                activeTab === 'profile'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            🏢 Business Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('hours')}
                            className={`flex-1 px-6 py-4 font-medium transition ${
                                activeTab === 'hours'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            🕐 Business Hours
                        </button>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className="m-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="m-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Business Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={profileData.businessName}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={profileData.category}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="Cafe">Cafe</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Salon">Hair Salon</option>
                                            <option value="Spa">Spa & Wellness</option>
                                            <option value="Fitness">Fitness Center</option>
                                            <option value="Barber">Barber Shop</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={profileData.description}
                                        onChange={handleProfileChange}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Describe your business..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location/City *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={profileData.location}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Dublin"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={profileData.phoneNumber}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0851234567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="123 Main Street, Dublin"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="business@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={profileData.website}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="https://yourbusiness.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !businessId}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-400"
                                >
                                    {loading ? 'Saving...' : 'Save Business Profile'}
                                </button>
                            </form>
                        )}

                        {/* Business Hours Tab */}
                        {activeTab === 'hours' && (
                            <form onSubmit={handleSaveHours} className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-semibold">Operating Hours</h2>
                                    <p className="text-sm text-gray-600">Set your operating hours and availability</p>
                                </div>

                                {Object.keys(hoursData).map((day) => (
                                    <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-32">
                                            <span className="font-medium capitalize">{day}</span>
                                        </div>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={hoursData[day].enabled}
                                                onChange={(e) => handleHoursChange(day, 'enabled', e.target.checked)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="ml-2 text-sm">Open</span>
                                        </label>

                                        {hoursData[day].enabled && (
                                            <>
                                                <input
                                                    type="time"
                                                    value={hoursData[day].open}
                                                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">to</span>
                                                <input
                                                    type="time"
                                                    value={hoursData[day].close}
                                                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </>
                                        )}

                                        {!hoursData[day].enabled && (
                                            <span className="text-gray-500 italic">Closed</span>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    disabled={loading || !businessId}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-400"
                                >
                                    {loading ? 'Saving...' : 'Save Business Hours'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
