import { useState, useEffect } from "react";
import api from "../../services/api";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("MONTH");
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    newBusinesses: 0,
    newClients: 0,
    popularCategories: [],
    topBusinesses: [],
    recentBookings: [],
    geographicData: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    try {
      const [businesses, bookings, users] = await Promise.all([
        api.get("/businesses"),
        api.get("/appointments"),
        api.get("/users"),
      ]);

      // Calculate stats
      const totalBookings = bookings.data?.length || 0;
      const totalRevenue = totalBookings * 25;

      // Get timeframe data
      const now = new Date();
      const startDate = new Date();
      if (timeframe === "WEEK") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "MONTH") {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === "YEAR") {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const newBusinesses =
        businesses.data?.filter((b) => new Date(b.createdAt) >= startDate).length || 0;

      const newClients =
        users.data?.filter(
          (u) => u.role === "CLIENT" && new Date(u.createdAt) >= startDate
        ).length || 0;

      // Popular categories (mock data for demo)
      const popularCategories = [
        { name: "Hair Salons", bookings: 450, percentage: 45 },
        { name: "Spa & Wellness", bookings: 250, percentage: 25 },
        { name: "Fitness Centers", bookings: 150, percentage: 15 },
        { name: "Barber Shops", bookings: 100, percentage: 10 },
        { name: "Restaurants", bookings: 50, percentage: 5 },
      ];

      // Geographic data (mock)
      const geographicData = [
        { city: "Dublin", bookings: 850, businesses: 45 },
        { city: "Cork", bookings: 320, businesses: 18 },
        { city: "Galway", bookings: 245, businesses: 12 },
        { city: "Limerick", bookings: 180, businesses: 8 },
        { city: "Waterford", bookings: 95, businesses: 4 },
      ];

      setReportData({
        totalRevenue,
        totalBookings,
        newBusinesses,
        newClients,
        popularCategories,
        topBusinesses: businesses.data?.slice(0, 5) || [],
        recentBookings: bookings.data?.slice(0, 10) || [],
        geographicData,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Create CSV content
    let csvContent = "Report Type,Value\n";
    csvContent += `Total Revenue,$${reportData.totalRevenue}\n`;
    csvContent += `Total Bookings,${reportData.totalBookings}\n`;
    csvContent += `New Businesses,${reportData.newBusinesses}\n`;
    csvContent += `New Clients,${reportData.newClients}\n\n`;

    csvContent += "Popular Categories\n";
    csvContent += "Category,Bookings,Percentage\n";
    reportData.popularCategories.forEach((cat) => {
      csvContent += `${cat.name},${cat.bookings},${cat.percentage}%\n`;
    });

    csvContent += "\nGeographic Distribution\n";
    csvContent += "City,Bookings,Businesses\n";
    reportData.geographicData.forEach((geo) => {
      csvContent += `${geo.city},${geo.bookings},${geo.businesses}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Platform_Report_${timeframe}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive platform performance and insights
          </p>
        </div>

        <div className="flex gap-4">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
            <option value="YEAR">Last Year</option>
            <option value="ALL">All Time</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
          >
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`$${reportData.totalRevenue.toLocaleString()}`}
          subtitle="Platform earnings"
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Total Bookings"
          value={reportData.totalBookings}
          subtitle="All appointments"
          icon="📅"
          color="blue"
        />
        <MetricCard
          title="New Businesses"
          subtitle={`Last ${timeframe.toLowerCase()}`}
          value={reportData.newBusinesses}
          icon="🏢"
          color="purple"
        />
        <MetricCard
          title="New Clients"
          subtitle={`Last ${timeframe.toLowerCase()}`}
          value={reportData.newClients}
          icon="👥"
          color="pink"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Popular Categories */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="space-y-4">
            {reportData.popularCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-900">{category.name}</span>
                  <span className="text-gray-600">
                    {category.bookings} bookings ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Geographic Distribution</h2>
          <div className="space-y-3">
            {reportData.geographicData.map((geo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{geo.city}</p>
                    <p className="text-sm text-gray-600">
                      {geo.businesses} businesses
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{geo.bookings}</p>
                  <p className="text-xs text-gray-600">bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Performing Businesses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Top Businesses</h2>
          <div className="space-y-3">
            {reportData.topBusinesses.slice(0, 5).map((business, index) => (
              <div
                key={business.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{business.name}</p>
                  <p className="text-sm text-gray-600">{business.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {business.bookingCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
          <div className="space-y-2">
            {reportData.recentBookings.slice(0, 8).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {booking.clientName || "Client"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {booking.serviceName || "Service"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(booking.appointmentDate).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, subtitle, value, icon, color }) => {
  const colors = {
    green: "border-green-500",
    blue: "border-blue-500",
    purple: "border-purple-500",
    pink: "border-pink-500",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colors[color]} hover:shadow-lg transition`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
};

export default Reports;