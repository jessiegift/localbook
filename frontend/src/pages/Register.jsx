import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        userType: "BUSINESS_OWNER"
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        
        try {
            const { confirmPassword, userType, ...userData } = formData;
            
            // Choose endpoint based on user type
            const endpoint = userType === "BUSINESS_OWNER" 
                ? "/users/register/business-owner" 
                : "/users/register/client";
            
            await register(userData, endpoint);
            
            // Success message
            if (userType === "BUSINESS_OWNER") {
                alert("Registration successful! Your business is pending approval. You will be notified when approved.");
            } else {
                alert("Registration successful! You can now log in.");
            }
            
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-gray-100 overflow-hidden">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Type Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            I want to register as:
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="BUSINESS_OWNER"
                                    checked={formData.userType === "BUSINESS_OWNER"}
                                    onChange={handleChange}
                                    className="mr-3 mt-1"
                                />
                                <div>
                                    <span className="font-medium">Business Owner</span>
                                    <p className="text-xs text-gray-600">Offer services and manage bookings</p>
                                </div>
                            </label>
                            
                            <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-blue-50">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="CLIENT"
                                    checked={formData.userType === "CLIENT"}
                                    onChange={handleChange}
                                    className="mr-3 mt-1"
                                />
                                <div>
                                    <span className="font-medium">Client</span>
                                    <p className="text-xs text-gray-600">
                                        📱 Normally mobile-only (demo purposes)
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    {formData.userType === "CLIENT" && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <p className="text-xs text-blue-800">
                                ℹ️ In production, clients register via mobile app. This option is for demonstration only.
                            </p>
                        </div>
                    )}
                    
                    {formData.userType === "BUSINESS_OWNER" && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                            <p className="text-xs text-yellow-800">
                                📌 Business accounts require admin approval.
                            </p>
                        </div>
                    )}
                    
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 0851234567"
                            required
                        />
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Minimum 6 characters"
                            required
                            minLength="6"
                        />
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Re-enter your password"
                            required
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 font-medium"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline font-medium">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;