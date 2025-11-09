import { useState, useEffect } from "react";
import api from "../../services/api";

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await api.get("/disputes");
      setDisputes(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      // Mock data for demo
      setDisputes([
        {
          id: 1,
          filedBy: "John Doe (Client)",
          against: "Glam Hair Salon",
          complaint: "Salon was closed when I arrived for my appointment",
          status: "PENDING",
          filedDate: "2024-11-01",
          priority: "HIGH",
        },
        {
          id: 2,
          filedBy: "Glam Hair Salon (Business)",
          against: "Jane Smith (Client)",
          complaint: "Client didn't show up for appointment",
          status: "PENDING",
          filedDate: "2024-11-02",
          priority: "MEDIUM",
        },
      ]);
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, resolution) => {
    const adminNotes = prompt("Enter resolution notes:");
    if (!adminNotes) return;

    try {
      await api.put(`/disputes/${disputeId}/resolve`, {
        resolution,
        adminNotes,
      });
      setMessage("✅ Dispute resolved successfully");
      fetchDisputes();
      setSelectedDispute(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error resolving dispute:", error);
      setMessage("❌ Failed to resolve dispute");
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    if (filter === "ALL") return true;
    return d.status === filter;
  });

  const pendingCount = disputes.filter((d) => d.status === "PENDING").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED").length;

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
        <h1 className="text-4xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-2">
          Handle conflicts between clients and businesses
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
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">Pending Disputes</p>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Resolved</p>
          <p className="text-3xl font-bold text-gray-900">{resolvedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Disputes</p>
          <p className="text-3xl font-bold text-gray-900">{disputes.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-3">
          {["ALL", "PENDING", "RESOLVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <p className="text-gray-500 text-lg">No disputes found</p>
          </div>
        ) : (
          filteredDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Dispute #{dispute.id}
                    </h3>
                    <PriorityBadge priority={dispute.priority} />
                    <StatusBadge status={dispute.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Filed By</p>
                      <p className="font-semibold text-gray-900">{dispute.filedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Against</p>
                      <p className="font-semibold text-gray-900">{dispute.against}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Complaint</p>
                    <p className="text-gray-900">{dispute.complaint}</p>
                  </div>

                  <p className="text-sm text-gray-500">
                    Filed on {new Date(dispute.filedDate).toLocaleDateString()}
                  </p>

                  {selectedDispute?.id === dispute.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Additional Details</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Business Response: We had an emergency closure and tried to contact
                        the client but couldn't reach them.
                      </p>
                      <p className="text-sm text-gray-700">
                        Evidence: Photos, booking records, call logs
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {dispute.status === "PENDING" && (
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleResolve(dispute.id, "FAVOR_CLIENT")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-sm"
                    >
                      Favor Client
                    </button>
                    <button
                      onClick={() => handleResolve(dispute.id, "FAVOR_BUSINESS")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                    >
                      Favor Business
                    </button>
                    <button
                      onClick={() => handleResolve(dispute.id, "NO_FAULT")}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold text-sm"
                    >
                      No Fault
                    </button>
                    <button
                      onClick={() =>
                        setSelectedDispute(
                          selectedDispute?.id === dispute.id ? null : dispute
                        )
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                    >
                      {selectedDispute?.id === dispute.id ? "Hide" : "View"} Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[priority] || styles.MEDIUM
      }`}
    >
      {priority} PRIORITY
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-orange-100 text-orange-800",
    RESOLVED: "bg-green-100 text-green-800",
    REJECTED: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
};

export default Disputes;