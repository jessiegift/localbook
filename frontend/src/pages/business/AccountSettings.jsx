import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AccountSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [businessId, setBusinessId] = useState(null);
    
    // Active tab
    const [activeTab, setActiveTab] = useState('account');
    
    // Toggle states
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    
    // Form states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [emailData, setEmailData] = useState({
        newEmail: '',
        password: ''
    });

    // ✅ Business Profile State
    const [profileData, setProfileData] = useState({
        businessName: '',
        ownerName: '',
        description: '',
        category: '',
        location: '',
        address: '',
        town: '',
        county: '',
        eircode: '',
        phoneNumber: '',
        email: '',
        website: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            console.log('🔍 Fetching business for user:', user.id);
            const response = await api.get(`/businesses/owner/${user.id}`);
            console.log('📦 Business data response:', response.data);
            
            if (response.data && response.data.length > 0) {
                const business = response.data[0];
                setBusinessId(business.id);
                setProfileData({
                    businessName: business.businessName || '',
                    ownerName: business.ownerName || user.name || '',
                    description: business.description || '',
                    category: business.category || '',
                    location: business.location || '',
                    address: business.address || '',
                    town: business.town || '',
                    county: business.county || '',
                    eircode: business.eircode || '',
                    phoneNumber: business.phoneNumber || '',
                    email: business.email || '',
                    website: business.website || ''
                });
            }
        } catch (err) {
            console.error('❌ Error fetching business data:', err);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
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
            await api.put(`/businesses/${businessId}?ownerId=${user.id}`, profileData);
            setMessage('✅ Business profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('❌ Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('❌ Passwords do not match!');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('❌ Password must be at least 6 characters!');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.put(`/users/${user.id}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setMessage('✅ Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowChangePassword(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('❌ Failed to change password. Check your current password.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.put(`/users/${user.id}/email`, {
                newEmail: emailData.newEmail,
                password: emailData.password
            });
            
            setMessage('✅ Email changed successfully! Please log in again.');
            setEmailData({ newEmail: '', password: '' });
            setShowChangeEmail(false);
            
            // Logout after 2 seconds
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('❌ Failed to change email. Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateAccount = async () => {
        const confirmed = window.confirm(
            '⚠️ Are you sure you want to deactivate your account?\n\nYour business will be hidden from clients but your data will be preserved. You can reactivate anytime.'
        );
        
        if (!confirmed) return;

        setLoading(true);
        try {
            await api.put(`/users/${user.id}/deactivate`);
            setMessage('✅ Account deactivated. Logging out...');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('❌ Failed to deactivate account.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed1 = window.confirm(
            '🚨 WARNING: Are you sure you want to DELETE your account?\n\nThis action is PERMANENT and CANNOT be undone!'
        );
        
        if (!confirmed1) return;
        
        const confirmed2 = window.confirm(
            '🚨 FINAL WARNING!\n\nAll your data including:\n- Business information\n- Services\n- Bookings\n- Customer data\n\nwill be PERMANENTLY DELETED!\n\nType your password in the next prompt to confirm.'
        );
        
        if (!confirmed2) return;
        
        const password = prompt('Enter your password to confirm deletion:');
        if (!password) return;

        setLoading(true);
        try {
            await api.delete(`/users/${user.id}`, {
                data: { password }
            });
            
            setMessage('Account deleted. Goodbye!');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('❌ Failed to delete account. Check your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`flex-1 px-6 py-4 font-medium transition ${
                                activeTab === 'account'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            👤 Account Info
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`flex-1 px-6 py-4 font-medium transition ${
                                activeTab === 'business'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            🏢 Business Profile
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Account Info Tab */}
                {activeTab === 'account' && (
                    <>
                        {/* Account Info */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2 font-medium">{user?.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Name:</span>
                                    <span className="ml-2 font-medium">{user?.name || 'Not set'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Role:</span>
                                    <span className="ml-2 font-medium">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Change Password</h2>
                                <button
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    {showChangePassword ? 'Cancel' : 'Change Password'}
                                </button>
                            </div>

                            {showChangePassword && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                                    >
                                        {loading ? 'Changing...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Change Email Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Change Email</h2>
                                <button
                                    onClick={() => setShowChangeEmail(!showChangeEmail)}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    {showChangeEmail ? 'Cancel' : 'Change Email'}
                                </button>
                            </div>

                            {showChangeEmail && (
                                <form onSubmit={handleChangeEmail} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={emailData.newEmail}
                                            onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={emailData.password}
                                            onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                                    >
                                        {loading ? 'Changing...' : 'Update Email'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                            
                            <div className="space-y-4">
                                {/* Deactivate Account */}
                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Deactivate Account</h3>
                                        <p className="text-sm text-gray-600">Temporarily hide your business. You can reactivate anytime.</p>
                                    </div>
                                    <button
                                        onClick={handleDeactivateAccount}
                                        disabled={loading}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-400"
                                    >
                                        Deactivate
                                    </button>
                                </div>

                                {/* Delete Account */}
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Delete Account</h3>
                                        <p className="text-sm text-gray-600">Permanently delete your account and all data. This cannot be undone!</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Business Profile Tab */}
                {activeTab === 'business' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
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
                                        Owner Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={profileData.ownerName}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Town *
                                    </label>
                                    <input
                                        type="text"
                                        name="town"
                                        value={profileData.town}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Carlow"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        County *
                                    </label>
                                    <input
                                        type="text"
                                        name="county"
                                        value={profileData.county}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Carlow"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Eircode
                                    </label>
                                    <input
                                        type="text"
                                        name="eircode"
                                        value={profileData.eircode}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="R93 X2Y4"
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
                                    placeholder="123 Main Street"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location (for search) *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={profileData.location}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Carlow Town, Ireland"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">This helps customers find your business in search</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="business@email.com"
                                        required
                                    />
                                </div>
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

                            <button
                                type="submit"
                                disabled={loading || !businessId}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Business Profile'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;