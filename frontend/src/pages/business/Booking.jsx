import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Booking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("TODAY"); // Changed from "ALL" to "TODAY"
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [filter]); // Re-fetch when filter changes

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${user.businessId}/bookings?filter=${filter.toLowerCase()}`);
      setBookings(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Confirm destructive actions
      if (
        newStatus === "CANCELLED" &&
        !window.confirm(`Are you sure you want to cancel this booking?`)
      ) {
        return;
      }

      if (
        newStatus === "COMPLETED" &&
        !window.confirm(`Mark this booking as completed?`)
      ) {
        return;
      }

      await api.put(`/appointments/${bookingId}/status`, { status: newStatus });

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      // Show temporary success message
      const statusMessage = newStatus === "COMPLETED" ? "completed" : "cancelled";
      setMessage(`Booking ${statusMessage} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError("Failed to update booking status");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    const clientName = booking.clientName?.toLowerCase() || "";
    const serviceName = booking.serviceName?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return clientName.includes(searchLower) || serviceName.includes(searchLower);
  });

  // 🌀 Show Spinner while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bookings & Appointments
          </h1>
          <p className="text-gray-600">
            All bookings are auto-confirmed • Manage your schedule
          </p>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
            <span className="mr-2">✓</span>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
            <span className="mr-2">⚠</span>
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* 🔍 Search */}
            <div>
              <input
                type="text"
                placeholder="Search by client name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* 🔘 Status Filter - UPDATED for auto-confirm */}
            <div className="flex gap-2 flex-wrap">
              {["TODAY", "UPCOMING", "PAST"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-2 rounded-lg font-medium transition focus:outline-none ${
                    filter === status
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Today's Bookings</p>
            <p className="text-2xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === "CONFIRMED" && isToday(b.date)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === "CONFIRMED").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ${bookings.reduce((sum, b) => sum + (b.price || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg font-semibold mb-2">
                No bookings {filter.toLowerCase()}
              </p>
              <p className="text-gray-400 text-sm">
                {filter === "TODAY"
                  ? "No appointments scheduled for today"
                  : filter === "UPCOMING"
                  ? "No upcoming appointments"
                  : "No past appointments"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.clientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.clientEmail || booking.clientPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{booking.serviceName}</p>
                        <p className="text-sm text-gray-500">
                          {booking.duration} min
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{booking.date}</p>
                        <p className="text-sm text-gray-500">{booking.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">
                          ${booking.price}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* CONFIRMED bookings - can complete or cancel */}
                          {booking.status === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "COMPLETED")
                                }
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                              >
                                ✓ Complete
                              </button>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "CANCELLED")
                                }
                                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                              >
                                ✕ Cancel
                              </button>
                            </>
                          )}

                          {/* COMPLETED or CANCELLED - no actions */}
                          {(booking.status === "COMPLETED" ||
                            booking.status === "CANCELLED") && (
                            <span className="text-sm text-gray-400 italic">
                              {booking.status === "COMPLETED" ? "✓ Done" : "✕ Cancelled"}
                            </span>
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

// Helper function to check if date is today
const isToday = (dateString) => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default Booking;
