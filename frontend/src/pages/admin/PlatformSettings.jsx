import { useState, useEffect } from "react";
import api from "../../services/api";

const PlatformSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "LocalBook",
    platformEmail: "admin@localbook.com",
    supportEmail: "support@localbook.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    advanceBookingDays: 90,
    cancellationHours: 24,
    noShowFee: 10,
    maxDailyBookings: 3,
    requirePhoneVerification: false,
  });

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    autoApproveBusinesses: false,
    commissionRate: 10,
    minimumBusinessRating: 3.0,
    featuredBusinessPrice: 99,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    bookingConfirmation: { email: true, sms: false, push: true },
    bookingReminder: { email: true, sms: true, push: true },
    bookingCancellation: { email: true, sms: false, push: true },
    newReview: { email: true, sms: false, push: false },
    weeklyReport: { email: true, sms: false, push: false },
  });

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await api.put("/settings/general", generalSettings);
      setMessage("✅ General settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
    }
    setLoading(false);
  };

  const handleSaveBooking = async () => {
    setLoading(true);
    try {
      await api.put("/settings/booking", bookingSettings);
      setMessage("✅ Booking settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
    }
    setLoading(false);
  };

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      await api.put("/settings/business", businessSettings);
      setMessage("✅ Business settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
    }
    setLoading(false);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await api.put("/settings/notifications", notificationSettings);
      setMessage("✅ Notification settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure platform-wide settings and preferences
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="flex border-b">
          <TabButton
            label="⚙️ General"
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          />
          <TabButton
            label="📅 Booking Rules"
            active={activeTab === "booking"}
            onClick={() => setActiveTab("booking")}
          />
          <TabButton
            label="🏢 Business Rules"
            active={activeTab === "business"}
            onClick={() => setActiveTab("business")}
          />
          <TabButton
            label="🔔 Notifications"
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          />
        </div>

        <div className="p-8">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">General Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      platformName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.platformEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        platformEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        supportEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Platform Features</h3>

                <ToggleSetting
                  label="Maintenance Mode"
                  description="Disable platform for all users (except admins)"
                  checked={generalSettings.maintenanceMode}
                  onChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      maintenanceMode: checked,
                    })
                  }
                />

                <ToggleSetting
                  label="Allow New Registrations"
                  description="Enable new users to register"
                  checked={generalSettings.allowRegistration}
                  onChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      allowRegistration: checked,
                    })
                  }
                />

                <ToggleSetting
                  label="Require Email Verification"
                  description="Users must verify email before using platform"
                  checked={generalSettings.requireEmailVerification}
                  onChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      requireEmailVerification: checked,
                    })
                  }
                />
              </div>

              <button
                onClick={handleSaveGeneral}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save General Settings"}
              </button>
            </div>
          )}

          {/* Booking Settings Tab */}
          {activeTab === "booking" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Booking Rules</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Booking Limit (days)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.advanceBookingDays}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        advanceBookingDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How far ahead clients can book
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Window (hours)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        cancellationHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum notice for free cancellation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No-Show Fee ($)
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.noShowFee}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        noShowFee: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fee charged for no-shows
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bookings Per Day
                  </label>
                  <input
                    type="number"
                    value={bookingSettings.maxDailyBookings}
                    onChange={(e) =>
                      setBookingSettings({
                        ...bookingSettings,
                        maxDailyBookings: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Per client per day
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <ToggleSetting
                  label="Require Phone Verification"
                  description="Clients must verify phone number before booking"
                  checked={bookingSettings.requirePhoneVerification}
                  onChange={(checked) =>
                    setBookingSettings({
                      ...bookingSettings,
                      requirePhoneVerification: checked,
                    })
                  }
                />
              </div>

              <button
                onClick={handleSaveBooking}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Booking Settings"}
              </button>
            </div>
          )}

          {/* Business Settings Tab */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Business Rules</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={businessSettings.commissionRate}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        commissionRate: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Platform fee per booking
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Business Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={businessSettings.minimumBusinessRating}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        minimumBusinessRating: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum rating to stay active
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Business Price ($/month)
                  </label>
                  <input
                    type="number"
                    value={businessSettings.featuredBusinessPrice}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        featuredBusinessPrice: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cost to feature a business
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <ToggleSetting
                  label="Auto-Approve Businesses"
                  description="Automatically approve new business registrations (not recommended)"
                  checked={businessSettings.autoApproveBusinesses}
                  onChange={(checked) =>
                    setBusinessSettings({
                      ...businessSettings,
                      autoApproveBusinesses: checked,
                    })
                  }
                />
              </div>

              <button
                onClick={handleSaveBusiness}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Business Settings"}
              </button>
            </div>
          )}

          {/* Notification Settings Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
              <p className="text-gray-600">
                Configure how users receive notifications
              </p>

              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value.email}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [key]: { ...value, email: e.target.checked },
                          })
                        }
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <span>📧 Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value.sms}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [key]: { ...value, sms: e.target.checked },
                          })
                        }
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <span>📱 SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value.push}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [key]: { ...value, push: e.target.checked },
                          })
                        }
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <span>🔔 Push</span>
                    </label>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Notification Settings"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Components
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

const ToggleSetting = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
    </label>
  </div>
);

export default PlatformSettings;