import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      const [businessRes, servicesRes, bookingsRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/businesses/${id}/services`),
        api.get(`/businesses/${id}/bookings`),
      ]);

      setBusiness(businessRes.data);
      setServices(servicesRes.data || []);
      setBookings(bookingsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching business details:", error);
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;

    const days = prompt("Suspension duration (days):");
    if (!days) return;

    try {
      await api.put(`/businesses/${id}/suspend`, {
        reason,
        days: parseInt(days),
      });
      setMessage("✅ Business suspended successfully");
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error suspending business:", error);
      setMessage("❌ Failed to suspend business");
    }
  };

  const handleActivate = async () => {
    try {
      await api.put(`/businesses/${id}/activate`);
      setMessage("✅ Business activated successfully");
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error activating business:", error);
      setMessage("❌ Failed to activate business");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE this business?\n\nThis action CANNOT be undone!"
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "🚨 FINAL CONFIRMATION\n\nThis will delete:\n- Business profile\n- All services\n- All bookings\n- All customer data\n\nType DELETE in the next prompt to confirm."
    );
    if (!doubleConfirm) return;

    const confirmText = prompt('Type "DELETE" to confirm:');
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled.");
      return;
    }

    try {
      await api.delete(`/businesses/${id}`);
      setMessage("✅ Business deleted successfully");
      setTimeout(() => navigate("/admin/businesses"), 2000);
    } catch (error) {
      console.error("Error deleting business:", error);
      setMessage("❌ Failed to delete business");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-gray-50 min-h-screen p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Business not found</p>
          <button
            onClick={() => navigate("/admin/businesses")}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg"
          >
            Back to Businesses
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const revenue = completedBookings * 25; // Example calculation
  const avgRating = 4.5; // You can calculate from reviews

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/businesses")}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        ← Back to All Businesses
      </button>

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

      {/* Business Header */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{business.name}</h1>
              <StatusBadge status={business.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold text-gray-900">{business.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{business.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-semibold text-gray-900">
                  {new Date(business.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-semibold text-gray-900">
                  {business.ownerName || "N/A"}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{business.description}</p>

            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900">{business.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{business.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-900">{business.address}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 ml-6">
            {business.status === "ACTIVE" && (
              <button
                onClick={handleSuspend}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
              >
                🚫 Suspend
              </button>
            )}
            {business.status === "SUSPENDED" && (
              <button
                onClick={handleActivate}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                ✅ Activate
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Bookings" value={totalBookings} icon="📅" color="blue" />
        <StatCard
          title="Completed"
          value={completedBookings}
          icon="✅"
          color="green"
        />
        <StatCard title="Revenue" value={`$${revenue}`} icon="💰" color="teal" />
        <StatCard title="Rating" value={avgRating.toFixed(1)} icon="⭐" color="yellow" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b">
          <TabButton
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            label={`Services (${services.length})`}
            active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
          />
          <TabButton
            label={`Bookings (${bookings.length})`}
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          />
          <TabButton
            label="Reviews"
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          />
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Business ID" value={business.id} />
                  <InfoRow label="Status" value={business.status} />
                  <InfoRow label="Category" value={business.category} />
                  <InfoRow label="Location" value={business.location} />
                  <InfoRow label="Phone" value={business.phoneNumber} />
                  <InfoRow label="Email" value={business.email || "N/A"} />
                  <InfoRow label="Website" value={business.website || "N/A"} />
                  <InfoRow
                    label="Join Date"
                    value={new Date(business.createdAt).toLocaleDateString()}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-700">{business.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Full Address</h3>
                <p className="text-gray-700">{business.address}</p>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Services Offered</h3>
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No services available
                </p>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ${service.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.duration} mins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Booking History</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-4 py-3 text-sm">
                            {new Date(booking.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.appointmentTime}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.clientName || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.serviceName || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
              <p className="text-gray-500 text-center py-8">
                Reviews feature coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800",
    REJECTED: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-semibold ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    teal: "border-teal-500 bg-teal-50",
    yellow: "border-yellow-500 bg-yellow-50",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colors[color]}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-4 font-medium transition ${
      active
        ? "bg-red-50 text-red-600 border-b-2 border-red-600"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

export default BusinessDetails;