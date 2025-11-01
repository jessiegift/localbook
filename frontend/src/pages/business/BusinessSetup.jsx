import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BusinessSetup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        croNumber: '',
        address: '',
        description : '',
        contactNumber: '',
        businessemail: '',
        website : '',
        openingHours : '',
        services : ''
    });
    const [documents, setDocuments] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setDocuments(e.target.files);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = new FormData(); // Create FormData object
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
           if (documents) {
                data.append('documents', documents);
            }
            

            await api.post(`/businesses/register?ownerId=${user.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // on success, navigate or reset form as needed
           alert('Business registered successfully! Awaiting admin approval.');
            navigate('/business');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register business');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Business Registration</h2>
            <p className="mb-4 text-gray-600">Please fill out the form below to register your business. An admin will review your submission.</p>
            {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="businessName">Business Name</label>
                    <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="ownerName">Owner Name</label>
                    <input
                        type="text"
                        id="ownerName"
                        name="ownerName"    
                        className="w-full px-3 py-2 border rounded"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required    
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="croNumber">CRO Number</label>
                    <input
                        type="text"
                        id="croNumber"  
                        name="croNumber"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.croNumber}
                        onChange={handleChange}
                        required
                    />
                </div>  
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
                    <textarea

                        id="description"
                        name="description"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.description}    
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>  
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="contactNumber">Contact Number</label>
                    <input
                        type="text" 
                        id="contactNumber"
                        name="contactNumber"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.contactNumber}  
                        onChange={handleChange}
                        required
                    />  
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="businessemail">Business Email</label>
                    <input
                        type="email"
                        id="businessemail"
                        name="businessemail"        
                        className="w-full px-3 py-2 border rounded"
                        value={formData.businessemail}
                        onChange={handleChange} 
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="website">Website</label>
                    <input
                        type="text"
                        id="website"
                        name="website"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>
               

            {/* Opening Hours */}
            <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="openingHours">
                Opening Hours
            </label>
            <select
                id="openingHours"
                name="openingHours"
                className="w-full px-3 py-2 border rounded"
                value={formData.openingHours}
                onChange={handleChange}
            >
                <option value="">Select Opening Hours</option>
                <option value="24 Hours">24 Hours</option>
                <option value="By Appointment Only">By Appointment Only</option>
                <option value="Mon - Fri: 9:00 AM - 5:00 PM">Mon - Fri: 9:00 AM - 5:00 PM</option>
                <option value="Mon - Sat: 9:00 AM - 6:00 PM">Mon - Sat: 9:00 AM - 6:00 PM</option>
                <option value="Mon - Sun: 9:00 AM - 6:00 PM">Mon - Sun: 9:00 AM - 6:00 PM</option>
                <option value="Mon - Fri: 10:00 AM - 4:00 PM">Mon - Fri: 10:00 AM - 4:00 PM</option>
                <option value="Mon - Sat: 10:00 AM - 5:00 PM">Mon - Sat: 10:00 AM - 5:00 PM</option>
                <option value="Weekends Only: 10:00 AM - 4:00 PM">Weekends Only: 10:00 AM - 4:00 PM</option>
                
            </select>
            </div>

                {/* Services Offered */}
                <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="services">
                    Services Offered
                </label>
                <select
                    id="services"
                    name="services"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.services}
                    onChange={handleChange}
                >
                    <option value="">Select Service Category</option>
                    <option value="Retail Shop">Retail Shop</option>
                    <option value="Clothing & Accessories">Clothing & Accessories</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Hair & Barber Services">Hair & Barber Services</option>
                    <option value="Electronics & Phone Repair">Electronics & Phone Repair</option>
                    <option value="Home Maintenance & Repairs">Home Maintenance & Repairs</option>
                    <option value="Cleaning Services">Cleaning Services</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Education & Training">Education & Training</option>
                    <option value="Automotive Services">Automotive Services</option>
                    <option value="Professional Services (Legal, Accounting, etc.)">Professional Services (Legal, Accounting, etc.)</option>
                    <option value="Other">Other</option>
                </select>
                </div>


                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="documents">Upload C.R.O Documents </label>
                    <input
                        type="file" 
                        id="documents"
                        name="documents"
                        className="w-full"
                        onChange={handleFileChange}
                    />  
                </div>
                <button
                    type="submit"   
                    className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition duration-200"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Register Business'}
                </button>
            </form>
        </div>
    );
};

export default BusinessSetup;