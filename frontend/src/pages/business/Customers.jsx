import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Customers = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [businessId, setBusinessId] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchBusinessId();
        }
    }, [user]);

    useEffect(() => {
        if (businessId) {
            fetchCustomers();
        }
    }, [businessId]);

    const fetchBusinessId = async () => {
        try {
            const response = await api.get(`/businesses/owner/${user.id}`);
            if (response.data && response.data.length > 0) {
                setBusinessId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching business:', error);
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            // Get all bookings for this business
            const response = await api.get(`/businesses/${businessId}/bookings`);
            
            // Extract unique customers with all their booking details
            const uniqueCustomers = {};
            response.data.forEach(appointment => {
                if (!uniqueCustomers[appointment.clientId]) {
                    uniqueCustomers[appointment.clientId] = {
                        id: appointment.clientId,
                        name: appointment.clientName,
                        email: appointment.clientEmail,
                        phone: appointment.clientPhone,
                        totalBookings: 0,
                        completedBookings: 0,
                        cancelledBookings: 0,
                        pendingBookings: 0,
                        lastVisit: appointment.date,
                        firstVisit: appointment.date,
                        bookings: []
                    };
                }
                
                // Update statistics
                uniqueCustomers[appointment.clientId].totalBookings++;
                uniqueCustomers[appointment.clientId].bookings.push(appointment);
                
                if (appointment.status === 'COMPLETED') {
                    uniqueCustomers[appointment.clientId].completedBookings++;
                }
                if (appointment.status === 'CANCELLED') {
                    uniqueCustomers[appointment.clientId].cancelledBookings++;
                }
                if (appointment.status === 'CONFIRMED') {
                    uniqueCustomers[appointment.clientId].pendingBookings++;
                }
                
                // Update last and first visit dates
                if (new Date(appointment.date) > new Date(uniqueCustomers[appointment.clientId].lastVisit)) {
                    uniqueCustomers[appointment.clientId].lastVisit = appointment.date;
                }
                if (new Date(appointment.date) < new Date(uniqueCustomers[appointment.clientId].firstVisit)) {
                    uniqueCustomers[appointment.clientId].firstVisit = appointment.date;
                }
            });

            setCustomers(Object.values(uniqueCustomers));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
            setLoading(false);
        }
    };

    // Filter by search term
    const searchFiltered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    // Filter by booking count
    const filteredCustomers = searchFiltered.filter(customer => {
        switch (bookingFilter) {
            case 'frequent':
                return customer.totalBookings >= 5;
            case 'regular':
                return customer.totalBookings >= 3 && customer.totalBookings < 5;
            case 'new':
                return customer.totalBookings <= 2;
            default:
                return true;
        }
    });

    const handleEmailCustomer = (email) => {
        if (email) {
            window.location.href = `mailto:${email}`;
        } else {
            alert('No email address available for this customer');
        }
    };

    const handleCallCustomer = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert('No phone number available for this customer');
        }
    };

    const openCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
    };

    const closeCustomerDetails = () => {
        setSelectedCustomer(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Customers</h1>
                        <p className="text-gray-600 mt-1">Manage your customer relationships</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-lg shadow-md">
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-3xl font-bold text-purple-600">{customers.length}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-green-100 text-sm font-medium">Frequent Customers</p>
                        <p className="text-4xl font-bold mt-2">
                            {customers.filter(c => c.totalBookings >= 5).length}
                        </p>
                        <p className="text-green-100 text-sm mt-2">5+ bookings</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-blue-100 text-sm font-medium">Regular Customers</p>
                        <p className="text-4xl font-bold mt-2">
                            {customers.filter(c => c.totalBookings >= 3 && c.totalBookings < 5).length}
                        </p>
                        <p className="text-blue-100 text-sm mt-2">3-4 bookings</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-orange-100 text-sm font-medium">New Customers</p>
                        <p className="text-4xl font-bold mt-2">
                            {customers.filter(c => c.totalBookings <= 2).length}
                        </p>
                        <p className="text-orange-100 text-sm mt-2">1-2 bookings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Booking Filter */}
                        <div className="md:w-64">
                            <select
                                value={bookingFilter}
                                onChange={(e) => setBookingFilter(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="all">All Customers</option>
                                <option value="frequent">Frequent (5+ bookings)</option>
                                <option value="regular">Regular (3-4 bookings)</option>
                                <option value="new">New (1-2 bookings)</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || bookingFilter !== 'all') && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {searchTerm && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                            {bookingFilter !== 'all' && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {bookingFilter.charAt(0).toUpperCase() + bookingFilter.slice(1)} customers
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setBookingFilter('all');
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {searchTerm || bookingFilter !== 'all'
                                    ? 'No customers found matching your filters'
                                    : 'No customers yet'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Customers will appear here after their first booking
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                            Bookings
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Last Visit
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition">
                                            {/* Customer Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Customer since {new Date(customer.firstVisit).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">
                                                        📧 {customer.email || 'No email'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        📱 {customer.phone || 'No phone'}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Booking Stats */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                                                        {customer.totalBookings} Total
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                                                            ✓ {customer.completedBookings}
                                                        </span>
                                                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                                                            ⏳ {customer.pendingBookings}
                                                        </span>
                                                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                                                            ✕ {customer.cancelledBookings}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Last Visit */}
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(customer.lastVisit).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEmailCustomer(customer.email)}
                                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                                                        title="Email customer"
                                                    >
                                                        📧 Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleCallCustomer(customer.phone)}
                                                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                                                        title="Call customer"
                                                    >
                                                        📞 Call
                                                    </button>
                                                    <button
                                                        onClick={() => openCustomerDetails(customer)}
                                                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                                                        title="View details"
                                                    >
                                                        👁️ View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                {filteredCustomers.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Showing {filteredCustomers.length} of {customers.length} customers
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-2xl shadow-lg">
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                        <p className="text-purple-100">Customer Details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeCustomerDetails}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Contact Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium">📧 Email:</span>
                                        <span className="text-gray-600">{selectedCustomer.email || 'Not provided'}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium">📱 Phone:</span>
                                        <span className="text-gray-600">{selectedCustomer.phone || 'Not provided'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Booking Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Bookings</p>
                                        <p className="text-3xl font-bold text-purple-600">{selectedCustomer.totalBookings}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <p className="text-3xl font-bold text-green-600">{selectedCustomer.completedBookings}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-3xl font-bold text-yellow-600">{selectedCustomer.pendingBookings}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Cancelled</p>
                                        <p className="text-3xl font-bold text-red-600">{selectedCustomer.cancelledBookings}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Visit History */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Visit History</h3>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="flex justify-between">
                                        <span className="font-medium">First Visit:</span>
                                        <span className="text-gray-600">
                                            {new Date(selectedCustomer.firstVisit).toLocaleDateString()}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium">Last Visit:</span>
                                        <span className="text-gray-600">
                                            {new Date(selectedCustomer.lastVisit).toLocaleDateString()}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Recent Bookings */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {selectedCustomer.bookings.slice(-5).reverse().map((booking, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{booking.service || 'General'}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleEmailCustomer(selectedCustomer.email)}
                                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                                >
                                    📧 Send Email
                                </button>
                                <button
                                    onClick={() => handleCallCustomer(selectedCustomer.phone)}
                                    className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
                                >
                                    📞 Call Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
