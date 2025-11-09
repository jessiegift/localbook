import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BusinessSetup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        croNumber: '',
        address: '',
        description: '',
        contactNumber: '',
        businessemail: '',
        website: '',
        openingHours: '',
        services: ''
    });
    
    const [documents, setDocuments] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [businessExists, setBusinessExists] = useState(false);
    const [businessId, setBusinessId] = useState(null);
    const [businessStatus, setBusinessStatus] = useState(null);

    // Check if business already exists
    useEffect(() => {
        const checkBusinessStatus = async () => {
            if (!user?.id) {
                setCheckingStatus(false);
                return;
            }

            try {
                const response = await api.get(`/businesses/owner/${user.id}`);
                
                if (response.data && response.data.length > 0) {
                    const business = response.data[0];
                    setBusinessExists(true);
                    setBusinessId(business.id);
                    setBusinessStatus(business.status);
                    
                    setFormData({
                        businessName: business.name || business.businessName || '',
                        ownerName: business.ownerName || '',
                        croNumber: business.croNumber || '',
                        address: business.address || '',
                        description: business.description || '',
                        contactNumber: business.contactNumber || '',
                        businessemail: business.email || business.businessemail || '',
                        website: business.website || '',
                        openingHours: business.openingHours || '',
                        services: business.services || business.category || ''
                    });
                }
            } catch (error) {
                console.error('Error checking business status:', error);
                if (error.response?.status !== 404) {
                    setError('Unable to check business status. Please try again.');
                }
            } finally {
                setCheckingStatus(false);
            }
        };

        checkBusinessStatus();
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const validateStep = (step) => {
        switch(step) {
            case 1:
                return formData.businessName && formData.ownerName && formData.services;
            case 2:
                return formData.address && formData.contactNumber && formData.businessemail;
            case 3:
                return formData.croNumber && (businessExists || documents);
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            setError('');
        } else {
            setError('Please fill in all required fields before continuing.');
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    data.append(key, formData[key]);
                }
            });

            if (documents) {
                data.append('documents', documents);
            }

            if (businessExists && businessId) {
                await api.put(`/businesses/${businessId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('✅ Business information updated successfully!');
            } else {
                await api.post(`/businesses/register?ownerId=${user.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('✅ Business registered successfully! Awaiting admin approval.');
            }

            navigate('/business');
        } catch (err) {
            console.error('Error submitting business:', err);
            setError(err.response?.data?.message || 'Failed to submit business information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-lg font-medium">Checking business status...</p>
                </div>
            </div>
        );
    }

    // Progress Steps
    const steps = [
        { number: 1, title: 'Business Info', icon: '🏢' },
        { number: 2, title: 'Contact Details', icon: '📞' },
        { number: 3, title: 'Documents', icon: '📄' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {businessExists ? '✏️ Edit Your Business' : '🚀 Register Your Business'}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {businessExists 
                            ? 'Update your business information and settings'
                            : 'Join our platform and grow your business'}
                    </p>
                </div>

                {/* Status Badge */}
                {businessExists && businessStatus && (
                    <div className="flex justify-center mb-6">
                        <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-lg ${
                            businessStatus === 'APPROVED' ? 'bg-green-500 text-white' :
                            businessStatus === 'PENDING' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                        }`}>
                            {businessStatus === 'APPROVED' ? '✅ Approved & Active' :
                             businessStatus === 'PENDING' ? '⏳ Pending Admin Approval' :
                             '❌ ' + businessStatus}
                        </div>
                    </div>
                )}

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center max-w-2xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex-1 relative">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                                        currentStep >= step.number
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                                            : 'bg-white text-gray-400 border-2 border-gray-300'
                                    }`}>
                                        {currentStep > step.number ? '✓' : step.icon}
                                    </div>
                                    <p className={`mt-2 text-sm font-medium ${
                                        currentStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </p>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className={`absolute top-8 left-1/2 w-full h-1 -z-10 transition-all duration-300 ${
                                        currentStep > step.number
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg flex items-start">
                            <span className="text-2xl mr-3">⚠️</span>
                            <div>
                                <p className="font-semibold">Oops! There's an issue</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Business Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Business Information</h2>
                                    <p className="text-gray-600">Tell us about your business</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Business Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="e.g., Glamour Beauty Salon"
                                            required
                                        />
                                    </div>

                                    {/* Owner Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Owner Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="ownerName"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Category *
                                        </label>
                                        <select
                                            name="services"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.services}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Salon">💇 Salon & Beauty</option>
                                            <option value="Spa">🧖 Spa & Wellness</option>
                                            <option value="Barbershop">✂️ Barbershop</option>
                                            <option value="Clinic">🏥 Medical & Clinic</option>
                                            <option value="Automotive">🚗 Automotive Services</option>
                                            
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe your business, services offered, and what makes you unique..."
                                            required
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            {formData.description.length}/500 characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Contact Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📞 Contact Information</h2>
                                    <p className="text-gray-600">How can customers reach you?</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            📍 Business Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="123 Main Street, Waterford, Ireland"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            📱 Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            placeholder="085 123 4567"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ✉️ Business Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="businessemail"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.businessemail}
                                            onChange={handleChange}
                                            placeholder="contact@yourbusiness.ie"
                                            required
                                        />
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            🌐 Website (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://www.yourbusiness.ie"
                                        />
                                    </div>

                                    {/* Opening Hours */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            🕐 Opening Hours
                                        </label>
                                        <select
                                            name="openingHours"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.openingHours}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Hours</option>
                                            <option value="24 Hours">24 Hours</option>
                                            <option value="By Appointment Only">By Appointment Only</option>
                                            <option value="Mon-Fri: 9AM-5PM">Mon-Fri: 9AM-5PM</option>
                                            <option value="Mon-Sat: 9AM-6PM">Mon-Sat: 9AM-6PM</option>
                                            <option value="Mon-Sun: 9AM-6PM">Mon-Sun: 9AM-6PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📄 Business Documents</h2>
                                    <p className="text-gray-600">Upload your CRO registration documents</p>
                                </div>

                                <div className="space-y-6">
                                    {/* CRO Number */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            🏛️ CRO Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="croNumber"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            value={formData.croNumber}
                                            onChange={handleChange}
                                            placeholder="e.g., 123456"
                                            required
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Enter your Companies Registration Office number
                                        </p>
                                    </div>

                                    {/* Document Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            📎 CRO Certificate {!businessExists && '*'}
                                        </label>
                                        
                                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-purple-500 transition-all">
                                            <div className="space-y-2 text-center">
                                                {previewUrl ? (
                                                    <div className="mb-4">
                                                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 inline-block">
                                                            <p className="text-green-800 font-semibold flex items-center">
                                                                <span className="text-2xl mr-2">✓</span>
                                                                File uploaded: {documents?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 text-6xl mb-2">📁</div>
                                                )}
                                                
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                                                        <span className="text-lg">
                                                            {previewUrl ? 'Change file' : 'Upload a file'}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            name="documents"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            required={!businessExists}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PDF, JPG, PNG up to 5MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? () => navigate('/business') : prevStep}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                            >
                                ← {currentStep === 1 ? 'Cancel' : 'Previous'}
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                                        loading
                                            ? 'opacity-70 cursor-not-allowed'
                                            : 'hover:from-green-700 hover:to-blue-700 hover:shadow-xl'
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {businessExists ? 'Updating...' : 'Submitting...'}
                                        </span>
                                    ) : (
                                        <span>
                                            {businessExists ? '💾 Update Business' : '🚀 Register Business'}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Add CSS for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};


export default BusinessSetup;
