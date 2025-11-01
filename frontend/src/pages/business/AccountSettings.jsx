import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AccountSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
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
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

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
            </div>
        </div>
    );
};

export default AccountSettings;