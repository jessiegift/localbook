import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayAppointments: 0,
        weekBookings: 0,
        monthRevenue: 0,
        totalClients: 0,
        pendingBookings: 0,
        completionRate: 0
    });

    const [recentAppointments, setRecentAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch appointments
            const appointmentsRes = await api.get(`/businesses/${user.businessId}/bookings`);
            const appointments = appointmentsRes.data || [];

            // Calculate today's date
            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = appointments.filter(apt => apt.date === today);

            // Calculate this week's bookings
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const weekBookings = appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= startOfWeek;
            });

            // Calculate month's revenue (assuming price field exists)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            const monthRevenue = appointments
                .filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= startOfMonth && apt.status === 'COMPLETED';
                })
                .reduce((sum, apt) => sum + (apt.price || 0), 0);

            // Get unique clients
            const uniqueClients = new Set(appointments.map(apt => apt.clientId));

            // Pending bookings
            const pendingCount = appointments.filter(apt => apt.status === 'PENDING').length;

            // Completion rate
            const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length;
            const completionRate = appointments.length > 0 
                ? ((completedCount / appointments.length) * 100).toFixed(1)
                : 0;

            setStats({
                todayAppointments: todayAppointments.length,
                weekBookings: weekBookings.length,
                monthRevenue: monthRevenue,
                totalClients: uniqueClients.size,
                pendingBookings: pendingCount,
                completionRate: completionRate
            });

            // Recent appointments (last 5)
            const recent = appointments
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
            setRecentAppointments(recent);

            // Upcoming appointments
            const upcoming = appointments
                .filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= new Date() && apt.status !== 'CANCELLED';
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);
            setUpcomingAppointments(upcoming);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">Managing your Carlow business</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Appointments */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Today's Appointments</p>
                                <p className="text-4xl font-bold mt-2">{stats.todayAppointments}</p>
                            </div>
                            <div className="text-5xl opacity-80">📅</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-400">
                            <p className="text-sm text-blue-100">
                                {stats.pendingBookings} pending confirmation
                            </p>
                        </div>
                    </div>

                    {/* This Week's Bookings */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-green-100 text-sm font-medium">This Week Bookings</p>
                                <p className="text-4xl font-bold mt-2">{stats.weekBookings}</p>
                            </div>
                            <div className="text-5xl opacity-80">📊</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-green-400">
                            <p className="text-sm text-green-100">
                                {stats.completionRate}% completion rate
                            </p>
                        </div>
                    </div>

                    {/* Total Clients */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Total Clients</p>
                                <p className="text-4xl font-bold mt-2">{stats.totalClients}</p>
                            </div>
                            <div className="text-5xl opacity-80">👥</div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-purple-400">
                            <p className="text-sm text-purple-100">Active customer base</p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                            <span className="text-2xl">🔜</span>
                        </div>
                        
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No upcoming appointments</p>
                                <p className="text-sm text-gray-400 mt-1">New bookings will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {apt.clientName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{apt.clientName}</p>
                                                <p className="text-sm text-gray-600">{apt.service || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">{apt.date}</p>
                                            <p className="text-sm text-gray-600">{apt.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <span className="text-2xl">📋</span>
                        </div>
                        
                        {recentAppointments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-sm text-gray-400 mt-1">Activity will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 border-l-4 rounded-lg"
                                         style={{
                                             borderColor: apt.status === 'COMPLETED' ? '#10b981' :
                                                         apt.status === 'CANCELLED' ? '#ef4444' :
                                                         apt.status === 'CONFIRMED' ? '#3b82f6' : '#f59e0b',
                                             backgroundColor: apt.status === 'COMPLETED' ? '#f0fdf4' :
                                                            apt.status === 'CANCELLED' ? '#fef2f2' :
                                                            apt.status === 'CONFIRMED' ? '#eff6ff' : '#fffbeb'
                                         }}>
                                        <div>
                                            <p className="font-semibold text-gray-900">{apt.clientName}</p>
                                            <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => window.location.href = '/business/bookings'}
                            className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                        >
                            <span className="text-4xl mb-2">📅</span>
                            <span className="text-sm font-medium text-purple-700">View Bookings</span>
                        </button>
                        <button
                            onClick={() => window.location.href = '/business/manage-services'}
                            className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                            <span className="text-4xl mb-2">🛠️</span>
                            <span className="text-sm font-medium text-blue-700">Manage Services</span>
                        </button>
                        <button
                            onClick={() => window.location.href = '/business/customers'}
                            className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition"
                        >
                            <span className="text-4xl mb-2">👥</span>
                            <span className="text-sm font-medium text-green-700">View Customers</span>
                        </button>
                        <button
                            onClick={() => window.location.href = '/business/settings'}
                            className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                        >
                            <span className="text-4xl mb-2">⚙️</span>
                            <span className="text-sm font-medium text-orange-700">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
