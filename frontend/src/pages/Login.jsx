import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = await login(email, password);
            
            console.log("=== LOGIN DEBUG INFO ===");
            console.log("Full response:", JSON.stringify(data, null, 2));
            console.log("User object:", data.user);
            console.log("Role from data.user?.role:", data.user?.role);
            console.log("Role from data.role:", data.role);
            console.log("Token:", data.token);
            console.log("========================");
            
            // Check user role and navigate accordingly
            const userRole = data.user?.role || data.role;
            
            if (!userRole) {
                console.error("❌ No role found in response");
                setError('Unable to determine user role. Please contact support.');
                setLoading(false);
                return;
            }
            
            console.log("✅ Determined role:", userRole);
            
            // Handle different roles
            if (userRole === 'ADMIN') {
                console.log("📍 Navigating to admin dashboard");
                navigate('/admin/dashboard');
            } else if (userRole === 'BUSINESS_OWNER') {
                console.log("📍 Navigating to business dashboard");
                navigate('/business/dashboard');
            } else if (userRole === 'CLIENT') {
                console.error("❌ CLIENT role detected");
                setError('Client accounts must use the mobile app. This portal is for business owners only.');
                console.log("CLIENT role detected - access denied");
            } else {
                console.error("❌ Unknown role:", userRole);
                setError(`Unauthorized role: ${userRole}. Only ADMIN and BUSINESS_OWNER roles can access this portal.`);
                console.log("Unknown role detected:", userRole);
            }
        } catch (err) {
            console.error("❌ Login error:", err);
            console.error("Error response:", err.response);
            console.error("Error status:", err.response?.status);
            console.error("Error data:", err.response?.data);
            
            // Handle specific error messages
            if (err.response?.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (err.response?.status === 403) {
                setError('Your account has been suspended. Please contact support.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🏢</div>
                    <h2 className="text-3xl font-bold text-gray-900">Login to LocalBook</h2>
                    <p className="text-gray-600 mt-2">Welcome back! Please login to continue</p>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                        <span className="text-xl flex-shrink-0">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                )}
                
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"    
                            id="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input  
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                tabIndex="-1"
                            >
                                {showPassword ? (
                                    <span className="text-xl">🙈</span>
                                ) : (
                                    <span className="text-xl">👁️</span>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline">
                            Forgot password?
                        </a>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md hover:shadow-lg mt-6"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
                
                {/* Info Box */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 text-center">
                            <span className="font-semibold">ℹ️ Business Portal</span>
                            <br />
                            This portal is for business owners and administrators only.
                            <br />
                            Clients should use the LocalBook mobile app.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;