import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AllBusinesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/businesses");
      const businessData = response.data || [];
      
      // ✅ Normalize the data to ensure both 'name' and 'status' fields exist
      const normalizedData = businessData.map(business => ({
        ...business,
        name: business.name || business.businessName,
        status: business.status || (business.isApproved ? 'ACTIVE' : 'PENDING')
      }));
      
      setBusinesses(normalizedData);

      // Extract unique categories from businesses
      const uniqueCategories = [
        ...new Set(normalizedData.map((b) => b.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);

      console.log("📊 Loaded businesses:", normalizedData.length);
      console.log("Sample business:", normalizedData[0]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setError("Failed to load businesses. Please try again.");
      setLoading(false);
    }
  };

  const handleSuspend = async (businessId, businessName) => {
    if (!window.confirm(`Are you sure you want to suspend "${businessName}"?`)) {
      return;
    }

    const reason = prompt("Reason for suspension:");
    if (!reason || reason.trim() === "") {
      alert("Suspension reason is required");
      return;
    }

    const days = prompt("Suspension duration (days):", "30");
    if (!days || isNaN(days) || parseInt(days) <= 0) {
      alert("Please enter a valid number of days");
      return;
    }

    try {
      await api.put(`/businesses/${businessId}/suspend`, {
        reason: reason.trim(),
        days: parseInt(days),
      });
      setMessage(`✅ Business "${businessName}" suspended successfully`);
      fetchBusinesses();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error suspending business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to suspend business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleActivate = async (businessId, businessName) => {
    if (
      !window.confirm(`Are you sure you want to activate "${businessName}"?`)
    ) {
      return;
    }

    try {
      await api.put(`/businesses/${businessId}/approve`);
      setMessage(`✅ Business "${businessName}" activated successfully`);
      fetchBusinesses();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error activating business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to activate business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleViewDetails = (businessId) => {
    if (businessId) {
      console.log("Navigating to business:", businessId);
      navigate(`/admin/businesses/${businessId}`);
    } else {
      alert("Business ID is missing");
    }
  };

  const handleDelete = async (businessId, businessName) => {
    if (
      !window.confirm(
        `⚠️ Are you absolutely sure you want to DELETE "${businessName}"? This action cannot be undone!`
      )
    ) {
      return;
    }

    const confirmation = prompt(
      'Type "DELETE" to confirm permanent deletion:',
      ""
    );
    if (confirmation !== "DELETE") {
      alert("Deletion cancelled");
      return;
    }

    try {
      // You'll need to add userId param if required by your backend
      await api.delete(`/businesses/${businessId}?userId=1`);
      setMessage(`✅ Business "${businessName}" deleted successfully`);
      fetchBusinesses();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error deleting business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || business.status === statusFilter;

    const matchesCategory =
      categoryFilter === "ALL" || business.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatsForStatus = (status) => {
    return businesses.filter((b) => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">
            Loading Businesses...
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchBusinesses}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border border-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <span className="text-2xl">←</span>
            </button>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              All Businesses
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage and monitor all businesses on LocalBook platform
          </p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatusOverviewCard
            title="Total"
            count={businesses.length}
            icon="🏢"
            color="blue"
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
          <StatusOverviewCard
            title="Active"
            count={getStatsForStatus("ACTIVE") + getStatsForStatus("APPROVED")}
            icon="✅"
            color="green"
            active={statusFilter === "ACTIVE"}
            onClick={() => setStatusFilter("ACTIVE")}
          />
          <StatusOverviewCard
            title="Pending"
            count={getStatsForStatus("PENDING")}
            icon="⏳"
            color="yellow"
            active={statusFilter === "PENDING"}
            onClick={() => setStatusFilter("PENDING")}
          />
          <StatusOverviewCard
            title="Suspended"
            count={getStatsForStatus("SUSPENDED")}
            icon="🚫"
            color="red"
            active={statusFilter === "SUSPENDED"}
            onClick={() => setStatusFilter("SUSPENDED")}
          />
          <StatusOverviewCard
            title="Rejected"
            count={getStatsForStatus("REJECTED")}
            icon="❌"
            color="gray"
            active={statusFilter === "REJECTED"}
            onClick={() => setStatusFilter("REJECTED")}
          />
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex items-center gap-3 ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span className="text-2xl">
              {message.includes("✅") ? "✅" : "❌"}
            </span>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            🔍 Search & Filter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Name, location, owner, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-purple-600">
                {filteredBusinesses.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {businesses.length}
              </span>{" "}
              businesses
            </div>
            {(searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Businesses Grid/Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "🔍"
                  : "🏢"}
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                {searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "No businesses match your filters"
                  : "No businesses registered yet"}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "Try adjusting your search criteria"
                  : "Businesses will appear here once they register"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Business Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBusinesses.map((business) => (
                    <tr
                      key={business.id}
                      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {business.name || "Unnamed Business"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {business.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                          {business.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 font-medium">
                          {business.location || business.address || business.town || "Not provided"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {business.ownerName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {business.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={business.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 text-sm font-medium">
                          {business.createdAt
                            ? new Date(business.createdAt).toLocaleDateString(
                                "en-IE",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(business.id);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-blue-200 text-sm font-medium transition border border-purple-200"
                            title="View Details"
                          >
                            👁️ View
                          </button>

                          {(business.status === "ACTIVE" ||
                            business.status === "APPROVED") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuspend(business.id, business.name);
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition border border-red-200"
                              title="Suspend Business"
                            >
                              🚫 Suspend
                            </button>
                          )}

                          {business.status === "SUSPENDED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivate(business.id, business.name);
                              }}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition border border-green-200"
                              title="Activate Business"
                            >
                              ✅ Activate
                            </button>
                          )}

                          {(business.status === "REJECTED" ||
                            business.status === "SUSPENDED") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(business.id, business.name);
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition border border-gray-200"
                              title="Delete Business"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
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

/* Status Overview Card Component */
const StatusOverviewCard = ({ title, count, icon, color, active, onClick }) => {
  const colorClasses = {
    blue: active
      ? "bg-blue-100 border-blue-500 text-blue-900"
      : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50",
    green: active
      ? "bg-green-100 border-green-500 text-green-900"
      : "bg-white border-gray-200 text-gray-700 hover:bg-green-50",
    yellow: active
      ? "bg-yellow-100 border-yellow-500 text-yellow-900"
      : "bg-white border-gray-200 text-gray-700 hover:bg-yellow-50",
    red: active
      ? "bg-red-100 border-red-500 text-red-900"
      : "bg-white border-gray-200 text-gray-700 hover:bg-red-50",
    gray: active
      ? "bg-gray-100 border-gray-500 text-gray-900"
      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} p-4 rounded-xl shadow-md border-2 transition-all hover:shadow-lg text-center ${
        active ? "scale-105" : ""
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold mb-1">{count}</p>
      <p className="text-sm font-medium">{title}</p>
    </button>
  );
};

/* Status Badge Component */
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE:
      "bg-green-100 text-green-800 border-green-300 ring-green-200 ring-2",
    APPROVED:
      "bg-green-100 text-green-800 border-green-300 ring-green-200 ring-2",
    PENDING:
      "bg-yellow-100 text-yellow-800 border-yellow-300 ring-yellow-200 ring-2",
    SUSPENDED: "bg-red-100 text-red-800 border-red-300 ring-red-200 ring-2",
    REJECTED: "bg-gray-100 text-gray-800 border-gray-300 ring-gray-200 ring-2",
  };

  const icons = {
    ACTIVE: "✅",
    APPROVED: "✅",
    PENDING: "⏳",
    SUSPENDED: "🚫",
    REJECTED: "❌",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border ${
        styles[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      <span>{icons[status]}</span>
      <span>{status}</span>
    </span>
  );
};

export default AllBusinesses;