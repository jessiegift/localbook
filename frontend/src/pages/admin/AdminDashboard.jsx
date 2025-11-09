import { useState, useEffect } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0,
    suspendedBusinesses: 0,
    totalClients: 0,
    totalBusinessOwners: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    monthlyRevenue: 0,
    growthRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      const [businessesResponse, usersResponse, appointmentsResponse] = await Promise.all([
        api.get("/businesses"),
        api.get("/users"),
        api.get("/appointments"),
      ]);

      const allBusinesses = businessesResponse.data || [];
      const allUsers = usersResponse.data || [];
      const allAppointments = appointmentsResponse.data || [];

      // Business statistics
      const activeCount = allBusinesses.filter((b) => b.status === "ACTIVE" || b.status === "APPROVED").length;
      const pendingCount = allBusinesses.filter((b) => b.status === "PENDING").length;
      const suspendedCount = allBusinesses.filter((b) => b.status === "SUSPENDED").length;

      // User statistics
      const clientCount = allUsers.filter((u) => u.role === "CLIENT").length;
      const businessOwnerCount = allUsers.filter((u) => u.role === "BUSINESS_OWNER").length;

      // Booking statistics
      const now = new Date();
      const upcomingBookings = allAppointments.filter((a) => {
        const appointmentDate = new Date(a.appointmentDate || a.date);
        return appointmentDate >= now && (a.status === "CONFIRMED" || a.status === "SCHEDULED");
      }).length;

      const completedBookings = allAppointments.filter((a) => a.status === "COMPLETED").length;
      const cancelledBookings = allAppointments.filter((a) => a.status === "CANCELLED").length;

      // Calculate revenue and growth
      const monthlyRevenue = calculateMonthlyRevenue(allAppointments);
      const growthRate = calculateGrowthRate(allAppointments);

      setStats({
        totalBusinesses: allBusinesses.length,
        activeBusinesses: activeCount,
        pendingBusinesses: pendingCount,
        suspendedBusinesses: suspendedCount,
        totalClients: clientCount,
        totalBusinessOwners: businessOwnerCount,
        totalBookings: allAppointments.length,
        upcomingBookings: upcomingBookings,
        completedBookings: completedBookings,
        cancelledBookings: cancelledBookings,
        monthlyRevenue: monthlyRevenue,
        growthRate: growthRate,
      });

      setRecentActivities(allAppointments.slice(0, 5) || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please refresh.");
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (appointments) => {
    if (!appointments || appointments.length === 0) return 0;
    
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    return appointments.reduce((sum, a) => {
      const date = new Date(a.appointmentDate || a.date);
      if (date.getMonth() === month && date.getFullYear() === year && 
          (a.status === "CONFIRMED" || a.status === "COMPLETED")) {
        return sum + (a.price || a.amount || 25);
      }
      return sum;
    }, 0);
  };

  const calculateGrowthRate = (appointments) => {
    if (!appointments || appointments.length === 0) return 0;
    
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const countForMonth = (month, year) =>
      appointments.filter((a) => {
        const d = new Date(a.appointmentDate || a.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;

    const cur = countForMonth(curMonth, curYear);
    let prevMonth = curMonth - 1;
    let prevYear = curYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = curYear - 1;
    }
    const prev = countForMonth(prevMonth, prevYear);

    if (prev === 0) return cur === 0 ? 0 : 100;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-8 py-8">
        {/* Header with Refresh */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            
            <p className="text-gray-600 mt-2 text-lg">
                Managing Carlow's local business platform
              </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
          >
            <span className="text-xl">🔄</span>
            <span className="font-medium text-gray-700">Refresh</span>
          </button>
        </div>

        {/* Stats Grid - Row 1: Business Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Businesses"
            value={stats.totalBusinesses}
            subtitle={`${stats.activeBusinesses} active, ${stats.pendingBusinesses} pending`}
            icon="🏢"
            color="border-blue-500"
            bg="bg-blue-100"
          />
          <DashboardCard
            title="Active Businesses"
            value={stats.activeBusinesses}
            subtitle={`${((stats.activeBusinesses / stats.totalBusinesses || 0) * 100).toFixed(1)}% approved`}
            icon="✅"
            color="border-green-500"
            bg="bg-green-100"
          />
          <DashboardCard
            title="Pending Approval"
            value={stats.pendingBusinesses}
            subtitle={stats.pendingBusinesses > 0 ? "⚠️ Needs attention" : "All reviewed"}
            icon="⏳"
            color="border-yellow-500"
            bg="bg-yellow-100"
            alert={stats.pendingBusinesses > 0}
          />
          <DashboardCard
            title="Total Users"
            value={stats.totalClients + stats.totalBusinessOwners}
            subtitle={`${stats.totalClients} clients, ${stats.totalBusinessOwners} owners`}
            icon="👥"
            color="border-purple-500"
            bg="bg-purple-100"
          />
        </div>

        {/* Stats Grid - Row 2: Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Bookings"
            value={stats.totalBookings}
            subtitle={`${stats.upcomingBookings} upcoming`}
            icon="📅"
            color="border-pink-500"
            bg="bg-pink-100"
          />
          <DashboardCard
            title="Upcoming Bookings"
            value={stats.upcomingBookings}
            subtitle="Confirmed appointments"
            icon="📆"
            color="border-blue-500"
            bg="bg-blue-100"
          />
          <DashboardCard
            title="Monthly Revenue"
            value={`€${stats.monthlyRevenue.toFixed(2)}`}
            subtitle="This month"
            icon="💰"
            color="border-teal-500"
            bg="bg-teal-100"
          />
          <DashboardCard
            title="Growth Rate"
            value={`${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}%`}
            subtitle="vs last month"
            icon={stats.growthRate >= 0 ? "📈" : "📉"}
            color={stats.growthRate >= 0 ? "border-green-500" : "border-red-500"}
            bg={stats.growthRate >= 0 ? "bg-green-100" : "bg-red-100"}
          />
        </div>

        {/* Stats Grid - Row 3: Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Completed Bookings"
            value={stats.completedBookings}
            subtitle={`${((stats.completedBookings / stats.totalBookings || 0) * 100).toFixed(1)}% completion rate`}
            icon="✅"
            color="border-emerald-500"
            bg="bg-emerald-100"
          />
          <DashboardCard
            title="Cancelled Bookings"
            value={stats.cancelledBookings}
            subtitle={`${((stats.cancelledBookings / stats.totalBookings || 0) * 100).toFixed(1)}% cancellation rate`}
            icon="❌"
            color="border-red-500"
            bg="bg-red-100"
          />
          <DashboardCard
            title="Avg Daily Bookings"
            value={Math.round(stats.totalBookings / 30) || 0}
            subtitle="Last 30 days"
            icon="📊"
            color="border-indigo-500"
            bg="bg-indigo-100"
          />
          <DashboardCard
            title="Platform Health"
            value="Excellent"
            subtitle={`${stats.activeBusinesses} businesses active`}
            icon="💚"
            color="border-green-500"
            bg="bg-green-100"
          />
        </div>

        {/* Activity & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
              <span className="text-sm text-gray-500">Last 5 bookings</span>
            </div>
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">No recent bookings</p>
                <p className="text-gray-400 text-sm mt-2">
                  Bookings will appear here once clients start booking
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        New booking - {activity.status}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.clientName || "Client"} booked at{" "}
                        {activity.businessName || "a business"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(activity.appointmentDate || activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800"
                          : activity.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction
                title="Review Pending Businesses"
                subtitle={`${stats.pendingBusinesses} awaiting approval`}
                icon="⏳"
                bg="bg-yellow-50 hover:bg-yellow-100"
                border="border border-yellow-200"
                link="/admin/pending"
                badge={stats.pendingBusinesses}
              />
              <QuickAction
                title="Manage All Businesses"
                subtitle={`${stats.totalBusinesses} total businesses`}
                icon="🏢"
                bg="bg-blue-50 hover:bg-blue-100"
                border="border border-blue-200"
                link="/admin/businesses"
              />
              <QuickAction
                title="User Management"
                subtitle={`${stats.totalClients + stats.totalBusinessOwners} users`}
                icon="👥"
                bg="bg-purple-50 hover:bg-purple-100"
                border="border border-purple-200"
                link="/admin/users"
              />
              <QuickAction
                title="View All Bookings"
                subtitle={`${stats.totalBookings} total, ${stats.upcomingBookings} upcoming`}
                icon="📅"
                bg="bg-pink-50 hover:bg-pink-100"
                border="border border-pink-200"
                link="/admin/bookings"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Dashboard Card Component */
const DashboardCard = ({ title, value, subtitle, icon, color, bg, alert }) => (
  <div
    className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
      alert ? "ring-2 ring-yellow-400 ring-opacity-50 animate-pulse" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div
        className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center flex-shrink-0 ml-4`}
      >
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  </div>
);

/* Quick Action Component */
const QuickAction = ({ title, subtitle, icon, bg, border, link, badge }) => (
  <button
    onClick={() => (window.location.href = link)}
    className={`w-full flex items-center justify-between p-5 rounded-lg transition-all ${bg} ${border} hover:shadow-md`}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-left">
        <p className="font-semibold text-gray-900 text-base">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      <span className="text-gray-400 text-2xl font-light">→</span>
    </div>
  </button>
);

export default AdminDashboard;