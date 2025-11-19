import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Pending() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  async function fetchPendingBusinesses() {
    try {
      const response = await api.get("/businesses/unapproved");
      const data = response.data.map(b => ({
        ...b,
        businessName: b.businessName || b.name || 'Unnamed Business'
      }));
      setBusinesses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  }

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleApprove(id, name) {
    if (!window.confirm(`Approve "${name}"?`)) return;

    try {
      await api.put(`/businesses/${id}/approve`);
      showMessage(`✅ ${name} approved!`);
      fetchPendingBusinesses();
    } catch (error) {
      showMessage("❌ Failed to approve");
    }
  }

  async function handleReject(id, name) {
    const reason = window.prompt(`Why reject "${name}"?`);
    if (!reason || reason.length < 10) {
      alert("Please provide a detailed reason (min 10 characters)");
      return;
    }

    if (!window.confirm(`Reject "${name}"?\n\nReason: ${reason}`)) return;

    try {
      await api.put(`/businesses/${id}/reject`, { reason });
      showMessage(`❌ ${name} rejected`);
      fetchPendingBusinesses();
    } catch (error) {
      showMessage("❌ Failed to reject");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate("/admin/dashboard")} className="text-2xl mb-2">←</button>
          <h1 className="text-3xl font-bold">Pending Businesses ({businesses.length})</h1>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {message}
          </div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-gray-700">All caught up!</p>
            <p className="text-gray-500 mt-2">No pending businesses</p>
          </div>
        )}

        {/* Business Cards */}
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                {/* Business Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">{business.businessName}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-semibold">{business.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Owner:</span>
                      <span className="ml-2 font-semibold">{business.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-semibold">{business.town}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-semibold">{business.phoneNumber}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-600">{business.description}</p>
                  <p className="mt-2 text-sm text-gray-500">{business.address}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleApprove(business.id, business.businessName)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(business.id, business.businessName)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pending;