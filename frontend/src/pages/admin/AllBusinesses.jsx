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

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get("/businesses");
      setBusinesses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setLoading(false);
    }
  };

  const handleSuspend = async (businessId) => {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;

    const days = prompt("Suspension duration (days):");
    if (!days) return;

    try {
      await api.put(`/businesses/${businessId}/suspend`, {
        reason,
        days: parseInt(days),
      });
      setMessage("✅ Business suspended successfully");
      fetchBusinesses();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error suspending business:", error);
      setMessage("❌ Failed to suspend business");
    }
  };

  const handleActivate = async (businessId) => {
    try {
      await api.put(`/businesses/${businessId}/activate`);
      setMessage("✅ Business activated successfully");
      fetchBusinesses();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error activating business:", error);
      setMessage("❌ Failed to activate business");
    }
  };

  const handleViewDetails = (businessId) => {
    navigate(`/admin/businesses/${businessId}`);
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || business.status === statusFilter;

    const matchesCategory =
      categoryFilter === "ALL" || business.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">All Businesses</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all businesses on the platform
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="ALL">All Categories</option>
              <option value="SALON">Hair Salon</option>
              <option value="SPA">Spa & Wellness</option>
              <option value="FITNESS">Fitness Center</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="CAFE">Cafe</option>
              <option value="BARBER">Barber Shop</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredBusinesses.length}</span> of{" "}
          <span className="font-semibold">{businesses.length}</span> businesses
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-500 text-lg">No businesses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Business Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBusinesses.map((business) => (
                  <tr
                    key={business.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleViewDetails(business.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {business.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {business.ownerName || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {business.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {business.location}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={business.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {business.status === "ACTIVE" && (
                          <button
                            onClick={() => handleSuspend(business.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition"
                          >
                            Suspend
                          </button>
                        )}
                        {business.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleActivate(business.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(business.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition"
                        >
                          View
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
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800",
    REJECTED: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default AllBusinesses;