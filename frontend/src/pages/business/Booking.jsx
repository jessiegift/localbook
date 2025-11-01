import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Booking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/businesses/${user.businessId}/bookings`);
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
        ["CANCELLED", "REJECTED"].includes(newStatus) &&
        !window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this booking?`)
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
      setMessage(`Booking ${newStatus.toLowerCase()} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating booking status:", error);

    }
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter((booking) => {
    const clientName = booking.clientName?.toLowerCase() || "";
    const serviceName = booking.serviceName?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      clientName.includes(searchLower) || serviceName.includes(searchLower);

    const matchesStatus = filter === "ALL" || booking.status === filter;

    return matchesSearch && matchesStatus;
  });

  // 🌀 Show Spinner while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
          <p className="text-gray-600">Manage all your customer bookings</p>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              />
            </div>

            {/* 🔘 Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none active:shadow-none ${
                      filter === status
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter !== "ALL"
                  ? `No ${filter.toLowerCase()} bookings`
                  : "Bookings will appear here once clients start booking"}
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Time
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
                            {booking.clientEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {booking.service || "General"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {booking.date}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {booking.time}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {booking.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "CONFIRMED")
                                }
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "CANCELLED")
                                }
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "COMPLETED")
                                }
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 focus:outline-none"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "CANCELLED")
                                }
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(booking.status === "COMPLETED" ||
                            booking.status === "CANCELLED") && (
                            <span className="text-sm text-gray-500 italic">
                              No actions
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

export default Booking;
