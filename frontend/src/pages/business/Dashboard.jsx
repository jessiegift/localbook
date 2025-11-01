import React, { useEffect, useState } from "react";
import businessService from "../../services/businessService";

const Dashboard = () => {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        thisweekBookings: 0,
        thismonthRevenue: 0,
        totalClients: 0
    });

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const businessId = 2; // Mary Johnson's business
            const appointmentsData = await businessService.getBusinessAppointments(businessId);
            setAppointments(appointmentsData || []);

            // Calculate stats...
            setStats({
                todayAppointments: 0,
                thisweekBookings: 0,
                thismonthRevenue: 0,
                totalClients: 0
            });
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setAppointments([]);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-50 overflow-auto">
            {/* Content Container - Centered */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-purple-600 mb-2">
                        Welcome, Mary Johnson
                    </h1>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Business Dashboard
                    </h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                            <span className="text-3xl">📅</span>
                        </div>
                        <p className="text-4xl font-bold text-blue-600">
                            {stats.todayAppointments}
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-600">This Week's Bookings</p>
                            <span className="text-3xl">📊</span>
                        </div>
                        <p className="text-4xl font-bold text-green-600">
                            {stats.thisweekBookings}
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-600">This Month's Revenue</p>
                            <span className="text-3xl">💰</span>
                        </div>
                        <p className="text-4xl font-bold text-purple-600">
                            €{stats.thismonthRevenue.toFixed(2)}
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-600">Total Clients</p>
                            <span className="text-3xl">👥</span>
                        </div>
                        <p className="text-4xl font-bold text-orange-600">
                            {stats.totalClients}
                        </p>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
                    
                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No appointments yet</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Your appointments will appear here once clients start booking
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{appointment.clientName}</td>
                                            <td className="px-4 py-3">{appointment.date}</td>
                                            <td className="px-4 py-3">{appointment.time}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {appointment.status}
                                                </span>
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

export default Dashboard;