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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [businessRes, servicesRes, bookingsRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/businesses/${id}/services`).catch(() => ({ data: [] })),
        api.get(`/businesses/${id}/bookings`).catch(() => ({ data: [] })),
      ]);

      setBusiness(businessRes.data);
      setServices(servicesRes.data || []);
      setBookings(bookingsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching business details:", error);
      setError("Failed to load business details");
      setLoading(false);
    }
  };

  const isInCarlow = (business) => {
    if (!business) return false;
    const town = (business.town || "").toLowerCase();
    const location = (business.location || "").toLowerCase();
    const address = (business.address || "").toLowerCase();
    const eircode = (business.eircode || "").toUpperCase();

    return (
      town === "carlow" ||
      location.includes("carlow") ||
      address.includes("carlow") ||
      eircode.startsWith("R93")
    );
  };

  const handleSuspend = async () => {
    const reason = prompt(
      `Please provide a reason for suspending "${business.name}":`
    );
    if (!reason || reason.trim() === "") {
      alert("Suspension reason is required");
      return;
    }

    const days = prompt("Suspension duration (days):", "30");
    if (!days || isNaN(days) || parseInt(days) <= 0) {
      alert("Please enter a valid number of days");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Suspend "${business.name}" for ${days} days?\n\nReason: ${reason}\n\nThe business will be notified.`
    );
    if (!confirmed) return;

    try {
      await api.put(`/businesses/${id}/suspend`, {
        reason: reason.trim(),
        days: parseInt(days),
      });
      setMessage(`✅ "${business.name}" suspended successfully`);
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error suspending business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to suspend business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleActivate = async () => {
    const confirmed = window.confirm(
      `✅ Activate "${business.name}"?\n\nThe business will be live on the platform immediately.`
    );
    if (!confirmed) return;

    try {
      await api.put(`/businesses/${id}/activate`);
      setMessage(`✅ "${business.name}" activated successfully`);
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error activating business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to activate business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE "${business.name}"?\n\nThis action CANNOT be undone!\n\nThis will delete:\n- Business profile\n- All services\n- All bookings\n- All reviews\n- All associated data`
    );
    if (!confirmed) return;

    const confirmText = prompt(
      'Type "DELETE" (in capital letters) to confirm permanent deletion:',
      ""
    );
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled - text did not match");
      return;
    }

    try {
      await api.delete(`/businesses/${id}`);
      setMessage(`✅ "${business.name}" deleted successfully`);
      setTimeout(() => navigate("/admin/businesses"), 2000);
    } catch (error) {
      console.error("Error deleting business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleApprove = async () => {
    if (!isInCarlow(business)) {
      const confirmOutsideCarlow = window.confirm(
        `⚠️ WARNING: "${business.name}" does not appear to be located in Carlow.\n\n` +
          `Location: ${business.location || "N/A"}\n` +
          `Town: ${business.town || "N/A"}\n` +
          `Eircode: ${business.eircode || "N/A"}\n\n` +
          `LocalBook is specifically for Carlow businesses only.\n\n` +
          `Are you SURE you want to approve this business?`
      );

      if (!confirmOutsideCarlow) {
        setMessage("⚠️ Approval cancelled - Business not in Carlow");
        setTimeout(() => setMessage(""), 4000);
        return;
      }
    }

    const confirmed = window.confirm(
      `✅ Approve "${business.name}"?\n\nThe business will go live immediately.`
    );
    if (!confirmed) return;

    try {
      await api.put(`/businesses/${id}/status`, { status: "ACTIVE" });
      setMessage(`✅ "${business.name}" approved and is now live!`);
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error approving business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to approve business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleReject = async () => {
    const reason = prompt(
      `Please provide a reason for rejecting "${business.name}":\n\n(This will be sent to the business owner)`
    );

    if (!reason || reason.trim() === "") {
      alert("Rejection reason is required");
      return;
    }

    const confirmed = window.confirm(
      `❌ Reject "${business.name}"?\n\nReason: ${reason}\n\nThe business owner will be notified.`
    );
    if (!confirmed) return;

    try {
      await api.put(`/businesses/${id}/status`, {
        status: "REJECTED",
        rejectionReason: reason.trim(),
      });
      setMessage(`❌ "${business.name}" rejected. Owner has been notified.`);
      fetchBusinessDetails();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error rejecting business:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to reject business";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">
            Loading Business Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error || "Business Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error
              ? "Unable to load business details"
              : "The requested business does not exist"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchBusinessDetails}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/admin/businesses")}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border border-gray-300"
            >
              Back to Businesses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const upcomingBookings = bookings.filter((b) => {
    const appointmentDate = new Date(b.appointmentDate || b.date);
    return (
      appointmentDate >= new Date() &&
      (b.status === "CONFIRMED" || b.status === "SCHEDULED")
    );
  }).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED"
  ).length;
  const revenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.price || b.amount || 25), 0);
  const completionRate =
    totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

  const inCarlow = isInCarlow(business);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/businesses")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-lg"
        >
          <span className="text-2xl">←</span>
          <span className="font-medium">Back to All Businesses</span>
        </button>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex items-center gap-3 border ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border-green-200"
                : message.includes("⚠️")
                ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <span className="text-2xl">
              {message.includes("✅")
                ? "✅"
                : message.includes("⚠️")
                ? "⚠️"
                : "❌"}
            </span>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Carlow Warning */}
        {!inCarlow && (
          <div className="mb-6 p-6 bg-red-100 border-2 border-red-300 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚠️</span>
              <div>
                <p className="font-bold text-red-900 text-xl">
                  NOT LOCATED IN CARLOW COUNTY
                </p>
                <p className="text-red-800 mt-1">
                  This business does not appear to be in Carlow. LocalBook is
                  exclusively for Carlow businesses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  {business.name}
                </h1>
                <StatusBadge status={business.status} />
                {inCarlow && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold border-2 border-green-300">
                    ✓ Carlow Business
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <InfoBox
                  label="Category"
                  value={business.category || "Not specified"}
                  icon="🏷️"
                />
                <InfoBox
                  label="Location"
                  value={business.location || "Not provided"}
                  icon="📍"
                  warning={!inCarlow}
                />
                <InfoBox
                  label="Town"
                  value={business.town || "Not provided"}
                  icon="🏘️"
                  warning={!inCarlow}
                />
                <InfoBox
                  label="Eircode"
                  value={business.eircode || "Not provided"}
                  icon="📮"
                  warning={!inCarlow}
                />
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  📝 Business Description
                </p>
                <p className="text-gray-900">
                  {business.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBox
                  label="Owner"
                  value={business.ownerName || "Not provided"}
                  icon="👤"
                />
                <InfoBox
                  label="Phone"
                  value={business.phoneNumber || business.phone || "Not provided"}
                  icon="📞"
                />
                <InfoBox
                  label="Email"
                  value={business.email || "Not provided"}
                  icon="📧"
                />
                <InfoBox
                  label="Website"
                  value={business.website || "Not provided"}
                  icon="🌐"
                />
                <InfoBox
                  label="Registered"
                  value={
                    business.createdAt
                      ? new Date(business.createdAt).toLocaleDateString("en-IE")
                      : "Unknown"
                  }
                  icon="📅"
                />
                <InfoBox label="ID" value={business.id} icon="🔢" />
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  🏠 Full Address
                </p>
                <p className="text-gray-900 font-medium">
                  {business.address || "No address provided"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 lg:w-64">
              {business.status === "PENDING" && (
                <>
                  <button
                    onClick={handleApprove}
                    className={`px-6 py-3 ${
                      inCarlow
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    } text-white rounded-lg transition font-bold flex items-center justify-center gap-2 shadow-lg`}
                  >
                    <span>✅</span>
                    <span>{inCarlow ? "Approve" : "Approve Anyway"}</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>❌</span>
                    <span>Reject</span>
                  </button>
                </>
              )}

              {(business.status === "ACTIVE" ||
                business.status === "APPROVED") && (
                <button
                  onClick={handleSuspend}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>🚫</span>
                  <span>Suspend</span>
                </button>
              )}

              {business.status === "SUSPENDED" && (
                <button
                  onClick={handleActivate}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>✅</span>
                  <span>Activate</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon="📅"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Completed"
            value={completedBookings}
            icon="✅"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Upcoming"
            value={upcomingBookings}
            icon="📆"
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Revenue"
            value={`€${revenue.toFixed(2)}`}
            icon="💰"
            gradient="from-teal-500 to-green-500"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate.toFixed(1)}%`}
            icon="📊"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="flex overflow-x-auto border-b-2 border-gray-200">
            <TabButton
              label="📋 Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              label={`💼 Services (${services.length})`}
              active={activeTab === "services"}
              onClick={() => setActiveTab("services")}
            />
            <TabButton
              label={`📅 Bookings (${bookings.length})`}
              active={activeTab === "bookings"}
              onClick={() => setActiveTab("bookings")}
            />
            <TabButton
              label="📊 Statistics"
              active={activeTab === "statistics"}
              onClick={() => setActiveTab("statistics")}
            />
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DetailRow label="Business ID" value={business.id} />
                    <DetailRow label="Status" value={business.status} />
                    <DetailRow
                      label="Category"
                      value={business.category || "N/A"}
                    />
                    <DetailRow
                      label="Location"
                      value={business.location || "N/A"}
                    />
                    <DetailRow label="Town" value={business.town || "N/A"} />
                    <DetailRow
                      label="Eircode"
                      value={business.eircode || "N/A"}
                    />
                    <DetailRow label="Phone" value={business.phoneNumber || "N/A"} />
                    <DetailRow label="Email" value={business.email || "N/A"} />
                    <DetailRow
                      label="Website"
                      value={business.website || "N/A"}
                    />
                    <DetailRow
                      label="Owner"
                      value={business.ownerName || "N/A"}
                    />
                    <DetailRow
                      label="Registration Date"
                      value={
                        business.createdAt
                          ? new Date(business.createdAt).toLocaleDateString(
                              "en-IE",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Unknown"
                      }
                    />
                    <DetailRow
                      label="Last Updated"
                      value={
                        business.updatedAt
                          ? new Date(business.updatedAt).toLocaleDateString(
                              "en-IE"
                            )
                          : "Unknown"
                      }
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    📝 Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {business.description || "No description provided"}
                  </p>
                </div>

                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    🏠 Full Address
                  </h3>
                  <p className="text-gray-900 font-medium">
                    {business.address || "No address provided"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Services Offered
                  </h3>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-bold">
                    {services.length} Services
                  </span>
                </div>
                {services.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💼</div>
                    <p className="text-gray-600 text-lg font-medium">
                      No services available
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      This business hasn't added any services yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-gray-100 hover:to-blue-100 transition border border-gray-200"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <p className="font-bold text-gray-900 text-lg mb-2">
                            {service.name || "Unnamed Service"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.description || "No description"}
                          </p>
                          {service.category && (
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {service.category}
                            </span>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-2xl text-purple-600">
                            €{service.price || 0}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ⏱️ {service.duration || 30} mins
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Booking History
                  </h3>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold">
                    {bookings.length} Total
                  </span>
                </div>
                {bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-gray-600 text-lg font-medium">
                      No bookings yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Bookings will appear here once clients start booking
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Time
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Client
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Service
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {booking.appointmentDate
                                ? new Date(
                                    booking.appointmentDate
                                  ).toLocaleDateString("en-IE")
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {booking.appointmentTime || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {booking.clientName || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {booking.serviceName || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-purple-600">
                              €{booking.price || booking.amount || 25}
                            </td>
                            <td className="px-6 py-4">
                              <BookingStatusBadge status={booking.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Performance Statistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">
                      Booking Breakdown
                    </h4>
                    <div className="space-y-3">
                      <StatRow
                        label="Total Bookings"
                        value={totalBookings}
                        icon="📅"
                      />
                      <StatRow
                        label="Completed"
                        value={completedBookings}
                        icon="✅"
                      />
                      <StatRow
                        label="Upcoming"
                        value={upcomingBookings}
                        icon="📆"
                      />
                      <StatRow
                        label="Cancelled"
                        value={cancelledBookings}
                        icon="❌"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">
                      Revenue & Performance
                    </h4>
                    <div className="space-y-3">
                      <StatRow
                        label="Total Revenue"
                        value={`€${revenue.toFixed(2)}`}
                        icon="💰"
                      />
                      <StatRow
                        label="Avg Booking Value"
                        value={`€${
                          totalBookings > 0
                            ? (revenue / totalBookings).toFixed(2)
                            : "0.00"
                        }`}
                        icon="💳"
                      />
                      <StatRow
                        label="Completion Rate"
                        value={`${completionRate.toFixed(1)}%`}
                        icon="📊"
                      />
                      <StatRow
                        label="Total Services"
                        value={services.length}
                        icon="💼"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
        styles[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      <span>{icons[status]}</span>
      <span>{status}</span>
    </span>
  );
};

const BookingStatusBadge = ({ status }) => {
  const styles = {
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md`}
      >
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-6 py-4 font-medium transition whitespace-nowrap ${
      active
        ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 border-b-4 border-purple-600"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

const InfoBox = ({ label, value, icon, warning }) => (
  <div
    className={`p-4 rounded-lg border ${
      warning
        ? "bg-red-50 border-red-200"
        : "bg-white border-gray-200"
    }`}
  >
    <p
      className={`text-xs font-medium mb-2 ${
        warning ? "text-red-600" : "text-gray-600"
      }`}
    >
      {icon} {label}
    </p>
    <p className={`font-bold ${warning ? "text-red-900" : "text-gray-900"}`}>
      {value}
    </p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const StatRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700 font-medium">
      {icon} {label}
    </span>
    <span className="font-bold text-gray-900 text-lg">{value}</span>
  </div>
);

export default BusinessDetails;