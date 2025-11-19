import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function BusinessSetup() {
    const authContext = useAuth();
    const user = authContext.user;
    const navigate = useNavigate();
    
    let initialOwnerName = '';
    const hasUser = user !== null && user !== undefined;
    if (hasUser === true) {
        const hasUserName = user.name !== null && user.name !== undefined;
        if (hasUserName === true) {
            initialOwnerName = user.name;
        }
    }

    let initialEmail = '';
    if (hasUser === true) {
        const hasUserEmail = user.email !== null && user.email !== undefined;
        if (hasUserEmail === true) {
            initialEmail = user.email;
        }
    }
    
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: initialOwnerName,
        category: '',
        address: '',
        phoneNumber: '',
        email: initialEmail,
        description: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        
        const updatedFormData = {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            category: formData.category,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            description: formData.description
        };
        
        updatedFormData[name] = value;
        
        setFormData(updatedFormData);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        
        console.log('📤 Submitting business registration...');
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const hasUser = user !== null && user !== undefined;
            if (hasUser === false) {
                setError('User not found. Please login again.');
                setLoading(false);
                return;
            }

            const userId = user.id;
            const hasUserId = userId !== null && userId !== undefined;
            if (hasUserId === false) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const userIdString = userId.toString();
            
            // Create business data object
            const businessData = {
                businessName: formData.businessName,
                ownerName: formData.ownerName,
                category: formData.category,
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                description: formData.description,
                town: 'Carlow',
                county: 'Carlow',
                location: 'Carlow',
                eircode: 'R93 0000'
            };

            console.log('📦 Business data:', JSON.stringify(businessData, null, 2));

            const url = '/businesses/register?ownerId=' + userIdString;
            console.log('🔗 Request URL:', url);

            // Send registration request
            const response = await api.post(url, businessData);

            console.log('✅ Registration successful:', response.data);

            setSuccess('✅ Business registered successfully!');
            
            // Navigate after 2 seconds
            setTimeout(function() {
                console.log('📍 Navigating to business dashboard');
                navigate('/business/dashboard');
            }, 2000);

        } catch (errorObject) {
            console.error('❌ Registration error:', errorObject);
            
            const hasResponse = errorObject.response !== null && errorObject.response !== undefined;
            if (hasResponse === true) {
                const response = errorObject.response;
                const status = response.status;
                const data = response.data;
                
                console.error('Error status:', status);
                console.error('Error data:', data);
                
                let errorMessage = 'Failed to register business. Please try again.';
                
                const hasData = data !== null && data !== undefined;
                if (hasData === true) {
                    const hasMessage = data.message !== null && data.message !== undefined;
                    if (hasMessage === true) {
                        errorMessage = data.message;
                    } else {
                        const hasError = data.error !== null && data.error !== undefined;
                        if (hasError === true) {
                            errorMessage = data.error;
                        } else {
                            const isString = typeof data === 'string';
                            if (isString === true) {
                                errorMessage = data;
                            }
                        }
                    }
                }
                
                if (status === 415) {
                    errorMessage = 'Invalid data format. Please contact support.';
                } else if (status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (status === 400) {
                    errorMessage = 'Invalid data: ' + errorMessage;
                } else if (status === 409) {
                    errorMessage = 'Business already exists.';
                }
                
                setError(errorMessage);
            } else {
                const hasRequest = errorObject.request !== null && errorObject.request !== undefined;
                if (hasRequest === true) {
                    console.error('No response received');
                    setError('Network error. Please check your connection.');
                } else {
                    const hasMessage = errorObject.message !== null && errorObject.message !== undefined;
                    if (hasMessage === true) {
                        console.error('Error:', errorObject.message);
                        setError('Error: ' + errorObject.message);
                    } else {
                        setError('An unexpected error occurred.');
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        console.log('❌ Registration cancelled');
        navigate('/business/dashboard');
    }

    const hasSuccess = success.length > 0;
    const hasError = error.length > 0;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #ede9fe, #f5f3ff)',
            paddingTop: 48,
            paddingBottom: 48,
            paddingLeft: 16,
            paddingRight: 16
        }}>
            <div style={{
                maxWidth: 672,
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 32
                }}>
                    <div style={{
                        fontSize: 60,
                        marginBottom: 16
                    }}>🏢</div>
                    <h1 style={{
                        fontSize: 36,
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: 8
                    }}>
                        Register Your Business
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        fontSize: 18
                    }}>
                        Join LocalBook and start accepting bookings
                    </p>
                </div>

                {/* Form Card */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: 32
                }}>
                    {/* Success Message */}
                    {hasSuccess === true && (
                        <div style={{
                            marginBottom: 24,
                            backgroundColor: '#f0fdf4',
                            borderLeft: '4px solid #22c55e',
                            color: '#166534',
                            paddingLeft: 24,
                            paddingRight: 24,
                            paddingTop: 16,
                            paddingBottom: 16,
                            borderRadius: 8
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: 24,
                                    marginRight: 12
                                }}>✅</span>
                                <p style={{
                                    fontWeight: '600'
                                }}>{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {hasError === true && (
                        <div style={{
                            marginBottom: 24,
                            backgroundColor: '#fef2f2',
                            borderLeft: '4px solid #ef4444',
                            color: '#991b1b',
                            paddingLeft: 24,
                            paddingRight: 24,
                            paddingTop: 16,
                            paddingBottom: 16,
                            borderRadius: 8
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: 24,
                                    marginRight: 12
                                }}>⚠️</span>
                                <div>
                                    <p style={{
                                        fontWeight: '600'
                                    }}>Registration Failed</p>
                                    <p style={{
                                        fontSize: 14
                                    }}>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Business Name */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                placeholder="e.g., Beauty Salon Carlow"
                                required
                            />
                        </div>

                        {/* Owner Name */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Business Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Salon">💇 Hair Salon</option>
                                <option value="Spa">🧖 Spa & Wellness</option>
                                <option value="Barbershop">✂️ Barbershop</option>
                                <option value="Clinic">🏥 Medical Clinic</option>
                                <option value="Restaurant">🍽️ Restaurant</option>
                                <option value="Cafe">☕ Cafe</option>
                                <option value="Gym">💪 Gym & Fitness</option>
                                <option value="Other">📦 Other</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Business Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                placeholder="e.g., 123 Tullow Street, Carlow"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                placeholder="e.g., 0851234567"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Business Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16
                                }}
                                placeholder="business@example.com"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                style={{
                                    width: '100%',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    border: '2px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    resize: 'vertical'
                                }}
                                placeholder="Tell customers about your business..."
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: 16,
                            paddingTop: 16
                        }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    flex: 1,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    borderRadius: 8,
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 16
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    backgroundColor: loading === true ? '#9ca3af' : '#7c3aed',
                                    color: '#ffffff',
                                    borderRadius: 8,
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: loading === true ? 'not-allowed' : 'pointer',
                                    opacity: loading === true ? 0.5 : 1,
                                    fontSize: 16
                                }}
                            >
                                {loading === true ? 'Registering...' : 'Register Business'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Note */}
                <div style={{
                    marginTop: 24,
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: 14,
                        color: '#6b7280'
                    }}>
                        * All fields are required for business registration
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BusinessSetup;