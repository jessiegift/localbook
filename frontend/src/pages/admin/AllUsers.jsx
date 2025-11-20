import { useState, useEffect } from "react";
import api from "../../services/api";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      console.log("Users fetched:", response.data);
      setUsers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("❌ Failed to load users");
      setLoading(false);
    }
  };

  // ✅ REMOVED: Suspend/Activate/Delete functions since endpoints don't exist
  // These would need to be implemented in your backend first

  const handleViewUser = (userId) => {
    alert(`View user details for ID: ${userId}\n\nThis feature requires backend implementation.`);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalClients = users.filter((u) => u.role === "CLIENT").length;
  const totalBusinessOwners = users.filter((u) => u.role === "BUSINESS_OWNER").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

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
        <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          View all users on the platform
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Clients</p>
          <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Business Owners</p>
          <p className="text-3xl font-bold text-gray-900">{totalBusinessOwners}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-3xl font-bold text-gray-900">{totalAdmins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="BUSINESS_OWNER">Business Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
          <span className="font-semibold">{users.length}</span> users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name/Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{user.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {user.name || user.username || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{user.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">User Management Features</h3>
            <p className="text-blue-800 text-sm mb-2">
              Currently, you can view all users and their details. Additional features require backend implementation:
            </p>
            <ul className="text-blue-800 text-sm list-disc list-inside space-y-1">
              <li>Suspend/Unsuspend users</li>
              <li>Delete users</li>
              <li>Edit user details</li>
              <li>Send notifications to users</li>
            </ul>
            <p className="text-blue-700 text-xs mt-3">
              These endpoints need to be added to your UserController.java
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const styles = {
    CLIENT: "bg-purple-100 text-purple-800",
    BUSINESS_OWNER: "bg-green-100 text-green-800",
    ADMIN: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        styles[role] || "bg-gray-100 text-gray-800"
      }`}
    >
      {role || 'UNKNOWN'}
    </span>
  );
};

export default AllUsers;