import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Customers = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Get all bookings for this business
            const response = await api.get(`/appointments/business/${user.businessId}`);
            
            // Extract unique customers
            const uniqueCustomers = {};
            response.data.forEach(appointment => {
                if (!uniqueCustomers[appointment.clientId]) {
                    uniqueCustomers[appointment.clientId] = {
                        id: appointment.clientId,
                        name: appointment.clientName,
                        email: appointment.clientEmail,
                        phone: appointment.clientPhone,
                        totalBookings: 0,
                        lastVisit: appointment.date
                    };
                }
                uniqueCustomers[appointment.clientId].totalBookings++;
            });

            setCustomers(Object.values(uniqueCustomers));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl">Loading customers...</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
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

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
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
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Phone
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                            Total Bookings
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Last Visit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {customer.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {customer.phone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                    {customer.totalBookings}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(customer.lastVisit).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Customers;