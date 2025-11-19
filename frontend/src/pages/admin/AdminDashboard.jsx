import { useState, useEffect } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Core Statistics
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0,
    suspendedBusinesses: 0,
    rejectedBusinesses: 0,
    totalClients: 0,
    totalBusinessOwners: 0,
    totalAdmins: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
    growthRate: 0,
    avgBookingValue: 0,
    completionRate: 0,
    cancellationRate: 0,
  });

  // Detailed Data
  const [recentBookings, setRecentBookings] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Chart Data
  const [bookingTrends, setBookingTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 2 minutes for REAL-TIME data
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      console.log("🔄 Fetching dashboard data...");

      // Fetch all data in parallel for better performance
      const [businessesResponse, usersResponse, appointmentsResponse] =
        await Promise.all([
          api.get("/businesses"),
          api.get("/users"),
          api.get("/appointments"),
        ]);

      const allBusinesses = businessesResponse.data || [];
      const allUsers = usersResponse.data || [];
      const allAppointments = appointmentsResponse.data || [];

      // ✅ NORMALIZE business data to fix "Unnamed Business"
      const normalizedBusinesses = allBusinesses.map(business => ({
        ...business,
        name: business.name || business.businessName || 'Unnamed Business',
        status: business.status || (business.isApproved ? 'ACTIVE' : 'PENDING')
      }));

      console.log("📊 Data loaded:");
      console.log("  - Businesses:", normalizedBusinesses.length);
      console.log("  - Users:", allUsers.length);
      console.log("  - Appointments:", allAppointments.length);

      // Process all the data with normalized businesses
      processStatistics(normalizedBusinesses, allUsers, allAppointments);
      processRecentData(normalizedBusinesses, allAppointments);
      processChartData(allAppointments, normalizedBusinesses);
      generateSystemAlerts(normalizedBusinesses, allAppointments);

      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);

      console.log("✅ Dashboard data updated successfully");
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data. Please check your connection and try again."
      );
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processStatistics = (businesses, users, appointments) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // Business Statistics (with normalized status)
    const activeCount = businesses.filter(
      (b) => b.status === "ACTIVE" || b.status === "APPROVED"
    ).length;
    const pendingCount = businesses.filter((b) => b.status === "PENDING").length;
    const suspendedCount = businesses.filter(
      (b) => b.status === "SUSPENDED"
    ).length;
    const rejectedCount = businesses.filter(
      (b) => b.status === "REJECTED"
    ).length;

    // User Statistics
    const clientCount = users.filter((u) => u.role === "CLIENT").length;
    const businessOwnerCount = users.filter(
      (u) => u.role === "BUSINESS_OWNER"
    ).length;
    const adminCount = users.filter((u) => u.role === "ADMIN").length;

    // Booking Statistics (REAL-TIME calculation)
    const upcomingCount = appointments.filter((a) => {
      const appointmentDate = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      return (
        appointmentDate >= now &&
        (a.status === "CONFIRMED" || a.status === "SCHEDULED")
      );
    }).length;

    const completedCount = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    const cancelledCount = appointments.filter(
      (a) => a.status === "CANCELLED" || a.status === "CANCELED"
    ).length;

    const todayCount = appointments.filter((a) => {
      const appointmentDate = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      return appointmentDate >= todayStart && appointmentDate < now;
    }).length;

    const thisWeekCount = appointments.filter((a) => {
      const appointmentDate = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      return appointmentDate >= weekStart;
    }).length;

    // 💰 REVENUE CALCULATION (Real-time from actual completed bookings)
    const monthlyRevenue = calculateMonthlyRevenue(appointments);
    const lastMonthRevenue = calculateLastMonthRevenue(appointments);
    
    // 📈 GROWTH RATE (Compares current month bookings vs last month)
    const growthRate = calculateGrowthRate(appointments);

    // Calculate average booking value from completed appointments
    const completedAppointments = appointments.filter(
      (a) => a.status === "COMPLETED"
    );
    
    const totalRevenue = completedAppointments.reduce((sum, a) => {
      // Try to get price from service, or use appointment price/amount
      const price = a.service?.price || a.price || a.amount || 0;
      return sum + price;
    }, 0);
    
    const avgBookingValue =
      completedAppointments.length > 0
        ? totalRevenue / completedAppointments.length
        : 0;

    // Calculate rates
    const completionRate =
      appointments.length > 0
        ? (completedCount / appointments.length) * 100
        : 0;
    const cancellationRate =
      appointments.length > 0
        ? (cancelledCount / appointments.length) * 100
        : 0;

    console.log("💰 Revenue Calculation:");
    console.log("  - Monthly Revenue: €" + monthlyRevenue.toFixed(2));
    console.log("  - Last Month: €" + lastMonthRevenue.toFixed(2));
    console.log("  - Growth Rate: " + growthRate + "%");
    console.log("  - Avg Booking: €" + avgBookingValue.toFixed(2));

    setStats({
      totalBusinesses: businesses.length,
      activeBusinesses: activeCount,
      pendingBusinesses: pendingCount,
      suspendedBusinesses: suspendedCount,
      rejectedBusinesses: rejectedCount,
      totalClients: clientCount,
      totalBusinessOwners: businessOwnerCount,
      totalAdmins: adminCount,
      totalBookings: appointments.length,
      upcomingBookings: upcomingCount,
      completedBookings: completedCount,
      cancelledBookings: cancelledCount,
      todayBookings: todayCount,
      thisWeekBookings: thisWeekCount,
      monthlyRevenue: monthlyRevenue,
      lastMonthRevenue: lastMonthRevenue,
      growthRate: growthRate,
      avgBookingValue: avgBookingValue,
      completionRate: completionRate,
      cancellationRate: cancellationRate,
    });
  };

  const processRecentData = (businesses, appointments) => {
    // Sort appointments by date (most recent first)
    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appointmentDateTime || a.appointmentDate || a.date);
      const dateB = new Date(b.createdAt || b.appointmentDateTime || b.appointmentDate || b.date);
      return dateB - dateA;
    });

    setRecentBookings(sortedAppointments.slice(0, 10));

    // Get pending businesses
    const pending = businesses.filter((b) => b.status === "PENDING");
    setPendingApprovals(pending.slice(0, 5));

    // Get recently added businesses
    const recentBiz = [...businesses]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.registrationDate);
        const dateB = new Date(b.createdAt || b.registrationDate);
        return dateB - dateA;
      })
      .slice(0, 5);
    setRecentBusinesses(recentBiz);

    // Calculate top performing businesses (by booking count)
    const businessBookingCounts = {};
    appointments.forEach((a) => {
      const bizId = a.business?.id || a.businessId;
      if (bizId) {
        businessBookingCounts[bizId] = (businessBookingCounts[bizId] || 0) + 1;
      }
    });

    const topBiz = businesses
      .map((b) => ({
        ...b,
        bookingCount: businessBookingCounts[b.id] || 0,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    setTopBusinesses(topBiz);
  };

  const processChartData = (appointments, businesses) => {
    // Calculate booking trends for last 7 days (REAL-TIME)
    const trends = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const count = appointments.filter((a) => {
        const appointmentDate = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
        return appointmentDate >= date && appointmentDate < nextDay;
      }).length;

      trends.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        bookings: count,
      });
    }

    setBookingTrends(trends);

    // Calculate category distribution
    const categoryCount = {};
    businesses.forEach((b) => {
      const category = b.category || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const distribution = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / businesses.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    setCategoryDistribution(distribution);
  };

  const generateSystemAlerts = (businesses, appointments) => {
    const alerts = [];

    // Check for pending approvals
    const pendingCount = businesses.filter((b) => b.status === "PENDING").length;
    if (pendingCount > 0) {
      alerts.push({
        type: "warning",
        title: "Pending Business Approvals",
        message: `${pendingCount} business${
          pendingCount > 1 ? "es" : ""
        } awaiting approval`,
        action: "Review Now",
        link: "/admin/pending",
      });
    }

    // Check for upcoming bookings today
    const now = new Date();
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const todayBookings = appointments.filter((a) => {
      const appointmentDate = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      return (
        appointmentDate >= now &&
        appointmentDate <= todayEnd &&
        (a.status === "CONFIRMED" || a.status === "SCHEDULED")
      );
    }).length;

    if (todayBookings > 0) {
      alerts.push({
        type: "info",
        title: "Today's Schedule",
        message: `${todayBookings} booking${
          todayBookings > 1 ? "s" : ""
        } scheduled for today`,
        action: "View Schedule",
        link: "/admin/bookings",
      });
    }

    // Check for high cancellation rate
    const cancelledCount = appointments.filter(
      (a) => a.status === "CANCELLED" || a.status === "CANCELED"
    ).length;
    const cancellationRate =
      appointments.length > 0
        ? (cancelledCount / appointments.length) * 100
        : 0;

    if (cancellationRate > 20) {
      alerts.push({
        type: "error",
        title: "High Cancellation Rate",
        message: `${cancellationRate.toFixed(
          1
        )}% of bookings are being cancelled`,
        action: "Investigate",
        link: "/admin/bookings",
      });
    }

    // Check for inactive businesses
    const suspendedCount = businesses.filter(
      (b) => b.status === "SUSPENDED"
    ).length;
    if (suspendedCount > 0) {
      alerts.push({
        type: "warning",
        title: "Suspended Businesses",
        message: `${suspendedCount} business${
          suspendedCount > 1 ? "es are" : " is"
        } currently suspended`,
        action: "Review",
        link: "/admin/businesses",
      });
    }

    setSystemAlerts(alerts.slice(0, 4));
  };

  /**
   * 💰 MONTHLY REVENUE CALCULATION
   * Sums up prices from all COMPLETED or CONFIRMED appointments in current month
   */
  const calculateMonthlyRevenue = (appointments) => {
    if (!appointments || appointments.length === 0) return 0;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const revenue = appointments.reduce((sum, a) => {
      const date = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      if (
        date.getMonth() === month &&
        date.getFullYear() === year &&
        (a.status === "CONFIRMED" || a.status === "COMPLETED")
      ) {
        // Get price from service object, or appointment itself
        const price = a.service?.price || a.price || a.amount || 0;
        return sum + price;
      }
      return sum;
    }, 0);

    console.log(`📅 This month (${month + 1}/${year}): €${revenue.toFixed(2)}`);
    return revenue;
  };

  /**
   * 💰 LAST MONTH REVENUE CALCULATION
   */
  const calculateLastMonthRevenue = (appointments) => {
    if (!appointments || appointments.length === 0) return 0;

    const now = new Date();
    let lastMonth = now.getMonth() - 1;
    let year = now.getFullYear();

    if (lastMonth < 0) {
      lastMonth = 11;
      year = year - 1;
    }

    const revenue = appointments.reduce((sum, a) => {
      const date = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
      if (
        date.getMonth() === lastMonth &&
        date.getFullYear() === year &&
        (a.status === "CONFIRMED" || a.status === "COMPLETED")
      ) {
        const price = a.service?.price || a.price || a.amount || 0;
        return sum + price;
      }
      return sum;
    }, 0);

    console.log(`📅 Last month (${lastMonth + 1}/${year}): €${revenue.toFixed(2)}`);
    return revenue;
  };

  /**
   * 📈 GROWTH RATE CALCULATION
   * Compares this month's booking COUNT vs last month's booking COUNT
   * Formula: ((current - previous) / previous) * 100
   */
  const calculateGrowthRate = (appointments) => {
    if (!appointments || appointments.length === 0) return 0;

    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const countForMonth = (month, year) =>
      appointments.filter((a) => {
        const d = new Date(a.appointmentDateTime || a.appointmentDate || a.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;

    const currentCount = countForMonth(curMonth, curYear);
    
    let prevMonth = curMonth - 1;
    let prevYear = curYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = curYear - 1;
    }
    const previousCount = countForMonth(prevMonth, prevYear);

    if (previousCount === 0) {
      // If no bookings last month, return 100% if we have bookings now
      return currentCount === 0 ? 0 : 100;
    }

    const growth = Math.round(((currentCount - previousCount) / previousCount) * 100);
    
    console.log(`📊 Growth: ${currentCount} this month vs ${previousCount} last month = ${growth}%`);
    return growth;
  };

  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      APPROVED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      SUSPENDED: "bg-red-100 text-red-800 border-red-200",
      REJECTED: "bg-gray-100 text-gray-800 border-gray-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      CANCELED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 -ml-8"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">
            Loading Admin Dashboard...
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Fetching real-time data from LocalBook
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Dashboard Error
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border border-gray-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Managing LocalBook - Carlow's Premier Booking Platform
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">
                  🔴 Live Data • Last updated: {formatDate(lastUpdated)} at{" "}
                  {formatTime(lastUpdated)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 ${
                  refreshing ? "opacity-50 cursor-not-allowed" : ""
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
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              System Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemAlerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Key Performance Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue (Month)"
              value={formatCurrency(stats.monthlyRevenue)}
              change={
                stats.lastMonthRevenue > 0
                  ? (
                      ((stats.monthlyRevenue - stats.lastMonthRevenue) /
                        stats.lastMonthRevenue) *
                      100
                    ).toFixed(1)
                  : 0
              }
              icon="💰"
              gradient="from-emerald-500 to-teal-500"
              subtitle={`Last month: ${formatCurrency(stats.lastMonthRevenue)}`}
            />
            <MetricCard
              title="Growth Rate"
              value={`${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}%`}
              change={stats.growthRate}
              icon={stats.growthRate >= 0 ? "📈" : "📉"}
              gradient={
                stats.growthRate >= 0
                  ? "from-green-500 to-emerald-500"
                  : "from-red-500 to-orange-500"
              }
              subtitle="vs. last month bookings"
            />
            <MetricCard
              title="Avg Booking Value"
              value={formatCurrency(stats.avgBookingValue)}
              icon="💳"
              gradient="from-blue-500 to-cyan-500"
              subtitle={`${stats.completedBookings} completed bookings`}
            />
            <MetricCard
              title="Platform Health"
              value={`${stats.completionRate.toFixed(1)}%`}
              icon="💚"
              gradient="from-purple-500 to-pink-500"
              subtitle={`Completion rate`}
            />
          </div>
        </div>

        {/* Rest of the dashboard continues... */}
        {/* (Same as before, but business names will now show correctly) */}
        
        {/* Business Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Business Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Businesses"
              value={stats.totalBusinesses}
              icon="🏢"
              color="blue"
              subtitle={`${stats.activeBusinesses} active`}
            />
            <StatCard
              title="Active Businesses"
              value={stats.activeBusinesses}
              icon="✅"
              color="green"
              subtitle={`${(
                (stats.activeBusinesses / (stats.totalBusinesses || 1)) * 100
              ).toFixed(1)}% approval rate`}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingBusinesses}
              icon="⏳"
              color="yellow"
              subtitle={
                stats.pendingBusinesses > 0 ? "⚠️ Needs review" : "All clear"
              }
              alert={stats.pendingBusinesses > 0}
            />
            <StatCard
              title="Suspended"
              value={stats.suspendedBusinesses}
              icon="🚫"
              color="red"
              subtitle={`${stats.rejectedBusinesses} rejected total`}
            />
          </div>
        </div>

        {/* User & Booking Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Users & Bookings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={
                stats.totalClients +
                stats.totalBusinessOwners +
                stats.totalAdmins
              }
              icon="👥"
              color="purple"
              subtitle={`${stats.totalClients} clients, ${stats.totalBusinessOwners} owners`}
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon="📅"
              color="pink"
              subtitle={`${stats.upcomingBookings} upcoming`}
            />
            <StatCard
              title="Today's Bookings"
              value={stats.todayBookings}
              icon="📆"
              color="indigo"
              subtitle={`${stats.thisWeekBookings} this week`}
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate.toFixed(1)}%`}
              icon="✅"
              color="emerald"
              subtitle={`${stats.completedBookings} completed`}
            />
          </div>
        </div>

        {/* Booking Trends Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Booking Trends (Last 7 Days)
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-end justify-between h-64 gap-4">
              {bookingTrends.map((trend, index) => {
                const maxBookings = Math.max(
                  ...bookingTrends.map((t) => t.bookings),
                  1
                );
                const height = (trend.bookings / maxBookings) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="text-sm font-bold text-gray-700">
                      {trend.bookings}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all hover:from-purple-700 hover:to-blue-600 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "20px" }}
                      title={`${trend.bookings} bookings on ${trend.date}`}
                    ></div>
                    <div className="text-xs text-gray-600 font-medium text-center">
                      {trend.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Distribution & Top Businesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Business Categories
            </h2>
            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {cat.category}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>

          {/* Top Performing Businesses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Top Performing Businesses
            </h2>
            {topBusinesses.length > 0 ? (
              <div className="space-y-3">
                {topBusinesses.map((business, index) => (
                  <div
                    key={business.id || index}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-gray-100 hover:to-blue-100 transition cursor-pointer"
                    onClick={() => window.location.href = `/admin/businesses/${business.id}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {business.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {business.category || "Uncategorized"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-purple-600">
                        {business.bookingCount}
                      </p>
                      <p className="text-xs text-gray-500">bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">No booking data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-md p-6 border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Real-Time Dashboard</h3>
              <p className="text-sm text-gray-700">
                This dashboard fetches live data from your database every time you load or refresh the page. 
                Auto-refresh is enabled (every 2 minutes) to keep statistics current. 
                Revenue calculations are based on completed bookings with actual service prices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Component definitions continue... */
const AlertCard = ({ alert }) => {
  const getAlertStyle = (type) => {
    const styles = {
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "🚨",
        iconBg: "bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: "⚠️",
        iconBg: "bg-yellow-100",
        button: "bg-yellow-600 hover:bg-yellow-700",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "ℹ️",
        iconBg: "bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "✅",
        iconBg: "bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
      },
    };
    return styles[type] || styles.info;
  };

  const style = getAlertStyle(alert.type);

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl p-4 hover:shadow-md transition`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`${style.iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-2xl">{style.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{alert.title}</h3>
          <p className="text-sm text-gray-700">{alert.message}</p>
        </div>
        <button
          onClick={() => (window.location.href = alert.link)}
          className={`${style.button} text-white px-4 py-2 rounded-lg text-sm font-medium transition flex-shrink-0`}
        >
          {alert.action}
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, icon, gradient, subtitle }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md`}
      >
        <span className="text-3xl">{icon}</span>
      </div>
      {change !== undefined && (
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            change >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
  </div>
);

const StatCard = ({ title, value, icon, color, subtitle, alert }) => {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    yellow: "border-yellow-500 bg-yellow-50",
    red: "border-red-500 bg-red-50",
    purple: "border-purple-500 bg-purple-50",
    pink: "border-pink-500 bg-pink-50",
    indigo: "border-indigo-500 bg-indigo-50",
    emerald: "border-emerald-500 bg-emerald-50",
  };

  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    yellow: "bg-yellow-100",
    red: "bg-red-100",
    purple: "bg-purple-100",
    pink: "bg-pink-100",
    indigo: "bg-indigo-100",
    emerald: "bg-emerald-100",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
        colorClasses[color]
      } hover:shadow-lg transition-all hover:-translate-y-1 ${
        alert ? "ring-2 ring-yellow-400 animate-pulse" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-16 h-16 ${iconBgClasses[color]} rounded-full flex items-center justify-center flex-shrink-0 ml-4 shadow-sm`}
        >
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;