import { useState, useEffect } from "react";
import api from "../../services/api";

const Pending = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    try {
      const response = await api.get("/businesses");
      const pending = response.data.filter((b) => b.status === "PENDING");
      setBusinesses(pending);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (businessId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this business? It will go live immediately."
    );
    if (!confirmed) return;

    try {
      await api.put(`/businesses/${businessId}/status`, { status: "ACTIVE" });
      setMessage("✅ Business approved successfully!");
      fetchPendingBusinesses();
      setSelectedBusiness(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error approving business:", error);
      setMessage("❌ Failed to approve business");
    }
  };

  const handleReject = async (businessId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await api.put(`/businesses/${businessId}/status`, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      setMessage("❌ Business rejected");
      fetchPendingBusinesses();
      setSelectedBusiness(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error rejecting business:", error);
      setMessage("❌ Failed to reject business");
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Pending Businesses</h1>
        <p className="text-gray-600 mt-2">
          Review and approve new business registrations
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

      {/* Pending Count */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⏳</span>
          <div>
            <p className="font-semibold text-yellow-800">
              {businesses.length} business
              {businesses.length !== 1 ? "es" : ""} awaiting approval
            </p>
            <p className="text-sm text-yellow-700">
              Please review and approve/reject each application
            </p>
          </div>
        </div>
      </div>

      {/* Businesses List */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-500 text-lg font-semibold">All caught up!</p>
          <p className="text-gray-400 text-sm mt-2">
            No pending businesses to review
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                {/* Business Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {business.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold text-gray-900">
                        {business.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {business.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="font-semibold text-gray-900">
                        {business.ownerName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-semibold text-gray-900">
                        {business.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700">{business.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="text-gray-700">{business.address}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 ml-6">
                  <button
                    onClick={() => handleApprove(business.id)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-2"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(business.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center gap-2"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() =>
                      setSelectedBusiness(
                        selectedBusiness?.id === business.id ? null : business
                      )
                    }
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    {selectedBusiness?.id === business.id ? "Hide" : "View"} Details
                  </button>
                </div>
              </div>
                    <div className="business-details">
  <h3>{business.name}</h3>
  
              {/* Carlow verification */}
              <div className="location-check">
                <p><strong>Address:</strong> {business.address}</p>
                <p><strong>Eircode:</strong> {business.eircode}</p>
                <p><strong>Town:</strong> {business.town}</p>
                
                {business.town !== "Carlow" && (
                  <div className="warning">
                    ⚠️ Warning: Business not located in Carlow
                  </div>
                )}
              </div>
              
              <button onClick={() => approveBusinesses(business.id)}>
                ✅ Approve (Verified Carlow Business)
              </button>
              
              <button onClick={() => rejectBusiness(business.id)}>
                ❌ Reject (Not in Carlow / Doesn't meet criteria)
              </button>
            </div>

              {/* Expanded Details */}
              {selectedBusiness?.id === business.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-lg mb-4">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{business.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <p className="text-gray-900">
                        {business.website || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-gray-900">
                        {new Date(business.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pending;
