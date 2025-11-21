import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [businessId, setBusinessId] = useState(null);

    // Business Hours State - Default values
    const defaultHours = {
        monday: { enabled: true, open: '09:00', close: '18:00' },
        tuesday: { enabled: true, open: '09:00', close: '18:00' },
        wednesday: { enabled: true, open: '09:00', close: '18:00' },
        thursday: { enabled: true, open: '09:00', close: '18:00' },
        friday: { enabled: true, open: '09:00', close: '18:00' },
        saturday: { enabled: false, open: '10:00', close: '16:00' },
        sunday: { enabled: false, open: '10:00', close: '16:00' }
    };

    const [hoursData, setHoursData] = useState(defaultHours);

    useEffect(() => {
        if (user?.id) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            console.log('🔍 Fetching business for user:', user.id);
            const response = await api.get(`/businesses/owner/${user.id}`);
            console.log('📦 Full API response:', response.data);
            
            if (response.data && response.data.length > 0) {
                const business = response.data[0];
                console.log('✅ Business found:', business);
                console.log('🕐 Raw openingHours:', business.openingHours);
                console.log('🕐 Raw operatingHours:', business.operatingHours);
                
                setBusinessId(business.id);

                // ✅ Check BOTH possible field names
                const hoursField = business.openingHours || business.operatingHours;
                console.log('🕐 Selected hours field:', hoursField);
                console.log('🕐 Hours field type:', typeof hoursField);
                
                if (hoursField) {
                    try {
                        let parsedHours;
                        
                        // If it's already an object, use it directly
                        if (typeof hoursField === 'object') {
                            console.log('✅ Hours already parsed as object');
                            parsedHours = hoursField;
                        } 
                        // If it's a string, parse it
                        else if (typeof hoursField === 'string') {
                            console.log('📝 Parsing hours from string...');
                            parsedHours = JSON.parse(hoursField);
                            console.log('✅ Parsed hours:', parsedHours);
                        }
                        
                        if (parsedHours) {
                            setHoursData(parsedHours);
                            console.log('✅ Hours data set successfully!');
                        }
                    } catch (e) {
                        console.error('❌ Could not parse operating hours:', e);
                        console.log('⚠️ Using default hours');
                        setHoursData(defaultHours);
                    }
                } else {
                    console.log('⚠️ No hours found in database, using defaults');
                    setHoursData(defaultHours);
                }
            } else {
                setError('No business found. Please complete business registration first.');
            }
        } catch (err) {
            console.error('❌ Error fetching business data:', err);
            setError('Unable to load business data. Please try again later.');
        }
    };

    const handleHoursChange = (day, field, value) => {
        setHoursData({
            ...hoursData,
            [day]: { ...hoursData[day], [field]: value }
        });
    };

    const handleSaveHours = async (e) => {
        e.preventDefault();
        
        if (!businessId) {
            setError('No business found. Please complete business registration first.');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('💾 Saving hours for business ID:', businessId);
            console.log('🕐 Hours data to save:', hoursData);
            
            // Convert hours to JSON string
            const hoursString = JSON.stringify(hoursData);
            console.log('📝 Hours as JSON string:', hoursString);
            
            // ✅ Send ONLY the hours field
            const payload = {
                openingHours: hoursString
            };

            console.log('📦 Sending payload:', payload);
            
            const response = await api.put(
                `/businesses/${businessId}?ownerId=${user.id}`,
                payload
            );
            
            console.log('✅ Save response:', response.data);
            
            setMessage('✅ Business hours updated successfully!');
            
            // ✅ Reload data after 1 second to confirm save
            setTimeout(async () => {
                setMessage('');
                await fetchBusinessData();
            }, 1500);
            
        } catch (err) {
            console.error('❌ Error updating hours:', err);
            console.error('❌ Error response:', err.response?.data);
            setError('❌ Failed to update hours: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Business Hours</h1>
                    <p className="text-gray-600">Set your operating hours and availability</p>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Business Hours Form */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <span className="mr-2">🕐</span>
                            Operating Hours
                        </h2>
                    </div>

                    <form onSubmit={handleSaveHours} className="p-6 space-y-4">
                        {Object.keys(hoursData).map((day) => (
                            <div 
                                key={day} 
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                {/* Day Name */}
                                <div className="w-32">
                                    <span className="font-semibold capitalize text-gray-800">
                                        {day}
                                    </span>
                                </div>

                                {/* Open/Closed Toggle */}
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hoursData[day].enabled}
                                        onChange={(e) => handleHoursChange(day, 'enabled', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Open
                                    </span>
                                </label>

                                {/* Time Inputs (only if enabled) */}
                                {hoursData[day].enabled ? (
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="time"
                                            value={hoursData[day].open}
                                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <span className="text-gray-600 font-medium">to</span>
                                        <input
                                            type="time"
                                            value={hoursData[day].close}
                                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <span className="text-gray-500 italic">Closed all day</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !businessId}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Business Hours'
                                )}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex">
                                <span className="text-blue-500 text-xl mr-3">ℹ️</span>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">About Business Hours</h3>
                                    <p className="text-sm text-blue-800">
                                        These hours will be displayed to customers on your business profile. 
                                        Make sure to keep them updated so customers know when you're available for bookings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;