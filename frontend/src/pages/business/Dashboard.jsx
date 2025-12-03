import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayAppointments: 0,
        weekAppointments: 0,
        monthRevenue: 0,
        totalCustomers: 0,
    });

    const [todaySchedule, setTodaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh every 2 minutes (120000ms)
        const interval = setInterval(() => {
            console.log('⏰ Auto-refresh triggered');
            fetchDashboardData(true);
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async (isAutoRefresh = false) => {
        try {
            if (! isAutoRefresh) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔄 FETCHING DASHBOARD DATA');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👤 Logged in user:', user. name);
            console.log('🆔 User ID:', user. id);
            console.log('🏢 Business ID:', user.businessId);
            console.log('🌐 API Endpoint:', `/businesses/${user.businessId}/dashboard`);
            console.log('⏰ Time:', new Date().toLocaleTimeString());

            // Use the backend dashboard endpoint
            const response = await api.get(`/businesses/${user. businessId}/dashboard`);
            const dashboardData = response.data;

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ RESPONSE RECEIVED');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 Dashboard data:', dashboardData);
            console.log('📈 Stats:', dashboardData.stats);
            console.log('📅 Today\'s schedule:', dashboardData.todaySchedule?. length || 0, 'appointments');

            // Set stats from backend
            setStats({
                todayAppointments: dashboardData.stats.todayAppointments || 0,
                weekAppointments: dashboardData.stats. weekAppointments || 0,
                monthRevenue: dashboardData.stats.monthRevenue || 0,
                totalCustomers: dashboardData.stats.totalCustomers || 0,
            });

            // Set today's schedule
            setTodaySchedule(dashboardData.todaySchedule || []);

            setLastUpdated(new Date());
            setLoading(false);
            setRefreshing(false);

            console.log('✅ Dashboard updated successfully');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        } catch (error) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ ERROR FETCHING DASHBOARD DATA');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        console.log('🔄 Manual refresh triggered by user');
        fetchDashboardData(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        if (! dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IE", {
            hour: "2-digit",
            minute: "2-digit",
        });
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome back, {user?. name}!  👋
                            </h1>
                            <p className="text-gray-600">Managing your Carlow business</p>
                            
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 ${
                                refreshing ?  "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            <span className={`text-xl ${refreshing ? "animate-spin" : ""}`}>
                                🔄
                            </span>
                            <span className="font-medium text-gray-700">
                                {refreshing ? "Refreshing..." : "Refresh Data"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Today's Appointments */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Today's Appointments</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.todayAppointments}</p>
                                <p className="text-xs text-gray-500 mt-2">{todaySchedule.length} on schedule</p>
                            </div>
                            <div className="text-5xl opacity-60">📅</div>
                        </div>
                    </div>

                    {/* This Week's Appointments */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">This Week</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.weekAppointments}</p>
                                <p className="text-xs text-gray-500 mt-2">Total bookings</p>
                            </div>
                            <div className="text-5xl opacity-60">📊</div>
                        </div>
                    </div>

                    {/* Month Revenue */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-500 p-6 bg-yellow-50 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Month Revenue</p>
                                <p className="text-4xl font-bold text-gray-900">€{stats.monthRevenue.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-2">From completed bookings</p>
                            </div>
                            <div className="text-5xl opacity-60">💰</div>
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-6 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.totalCustomers}</p>
                                <p className="text-xs text-gray-500 mt-2">clients</p>
                            </div>
                            <div className="text-5xl opacity-60">👥</div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                        <span className="text-2xl">📅</span>
                    </div>
                    
                    {todaySchedule.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No appointments scheduled for today</p>
                            <p className="text-sm text-gray-400 mt-1">Bookings will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todaySchedule.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-l-4 border-blue-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {apt.user?. name?. charAt(0) || apt.user?.username?. charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {apt.user?.name || apt.user?.username || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {apt.service?. serviceName || 'General Service'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{formatTime(apt.appointmentDateTime)}</p>
                                        <p className="text-sm text-gray-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                apt. status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6">
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