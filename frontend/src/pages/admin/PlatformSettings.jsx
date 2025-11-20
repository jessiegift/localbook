import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const PlatformSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  // General Settings - Carlow Focused
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "LocalBook",
    platformTagline: "Carlow's Premier Local Business Booking Platform",
    platformEmail: "admin@localbook.ie",
    supportEmail: "support@localbook.ie",
    supportPhone: "+353 59 xxx xxxx",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    carlowOnly: true, // Enforce Carlow-only businesses
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    advanceBookingDays: 90,
    minAdvanceHours: 2, // Minimum hours before appointment
    cancellationHours: 24,
    allowSameDayBooking: true,
    maxDailyBookings: 5, // Per client
    reminderHours: 24, // Hours before appointment to send reminder
  });

  // Business Settings - Carlow Specific
  const [businessSettings, setBusinessSettings] = useState({
    autoApproveBusinesses: false, // Always manually review
    requireCarlowVerification: true,
    allowedEircodes: ["R93"], // Carlow eircodes start with R93
    minimumBusinessRating: 3.0,
    maxServices: 20, // Max services per business
    requireBusinessRegistration: true, // Require Irish business registration number
  });

  // Location Settings - Carlow Focus
  const [locationSettings, setLocationSettings] = useState({
    county: "Carlow",
    allowedTowns: [
      "Carlow Town",
      "Tullow",
      "Muine Bheag (Bagenalstown)",
      "Borris",
      "Rathvilly",
      "Hacketstown",
      "Leighlinbridge",
      "Old Leighlin",
    ],
    requireEircode: true,
    verifyLocation: true, // Verify business is actually in Carlow
  });

  // ✅ FIXED: These save functions now just show messages since endpoints don't exist
  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      // ✅ Store settings in localStorage for now (until backend is ready)
      localStorage.setItem('platformSettings_general', JSON.stringify(generalSettings));
      
      setMessage("✅ General settings saved locally (backend implementation needed)");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleSaveBooking = async () => {
    setLoading(true);
    try {
      localStorage.setItem('platformSettings_booking', JSON.stringify(bookingSettings));
      setMessage("✅ Booking settings saved locally (backend implementation needed)");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      localStorage.setItem('platformSettings_business', JSON.stringify(businessSettings));
      setMessage("✅ Business settings saved locally (backend implementation needed)");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleSaveLocation = async () => {
    setLoading(false);
    try {
      localStorage.setItem('platformSettings_location', JSON.stringify(locationSettings));
      setMessage("✅ Location settings saved locally (backend implementation needed)");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save settings");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedGeneral = localStorage.getItem('platformSettings_general');
    const savedBooking = localStorage.getItem('platformSettings_booking');
    const savedBusiness = localStorage.getItem('platformSettings_business');
    const savedLocation = localStorage.getItem('platformSettings_location');

    if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
    if (savedBooking) setBookingSettings(JSON.parse(savedBooking));
    if (savedBusiness) setBusinessSettings(JSON.parse(savedBusiness));
    if (savedLocation) setLocationSettings(JSON.parse(savedLocation));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <span className="text-2xl">←</span>
            </button>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Platform Settings
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure LocalBook settings for Carlow businesses
          </p>
        </div>

        {/* Warning Box */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Settings Stored Locally</h3>
              <p className="text-yellow-800 text-sm">
                These settings are currently stored in your browser's localStorage. 
                To persist settings across all devices and users, you need to implement 
                settings endpoints in your backend (e.g., /api/settings/general, /api/settings/booking, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex items-center gap-3 ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span className="text-2xl">
              {message.includes("✅") ? "✅" : "❌"}
            </span>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="flex overflow-x-auto border-b-2 border-gray-200">
            <TabButton
              label="⚙️ General"
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <TabButton
              label="📅 Bookings"
              active={activeTab === "booking"}
              onClick={() => setActiveTab("booking")}
            />
            <TabButton
              label="🏢 Businesses"
              active={activeTab === "business"}
              onClick={() => setActiveTab("business")}
            />
            <TabButton
              label="📍 Carlow Area"
              active={activeTab === "location"}
              onClick={() => setActiveTab("location")}
            />
          </div>

          <div className="p-8">
            {/* General Settings Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  General Platform Settings
                </h2>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Tagline
                  </label>
                  <input
                    type="text"
                    value={generalSettings.platformTagline}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        platformTagline: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          supportPhone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900">
                    Platform Controls
                  </h3>

                  <ToggleSetting
                    label="Maintenance Mode"
                    description="Temporarily disable platform for maintenance (only admins can access)"
                    checked={generalSettings.maintenanceMode}
                    onChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        maintenanceMode: checked,
                      })
                    }
                    danger={generalSettings.maintenanceMode}
                  />

                  <ToggleSetting
                    label="Allow New User Registrations"
                    description="Enable new clients and business owners to register"
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
                    description="Users must verify their email before using the platform"
                    checked={generalSettings.requireEmailVerification}
                    onChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        requireEmailVerification: checked,
                      })
                    }
                  />

                  <ToggleSetting
                    label="Carlow Only Mode"
                    description="⚠️ CRITICAL: Only allow businesses located in County Carlow"
                    checked={generalSettings.carlowOnly}
                    onChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        carlowOnly: checked,
                      })
                    }
                    important
                  />
                </div>

                <button
                  onClick={handleSaveGeneral}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "💾 Save General Settings"}
                </button>
              </div>
            )}

            {/* Booking Settings Tab */}
            {activeTab === "booking" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Booking Rules & Policies
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking Limit (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={bookingSettings.advanceBookingDays}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          advanceBookingDays: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      How far in advance clients can book appointments
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={bookingSettings.minAdvanceHours}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          minAdvanceHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Minimum hours before appointment can be booked
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Cancellation Window (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={bookingSettings.cancellationHours}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          cancellationHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Hours before appointment for free cancellation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Bookings Per Client (daily)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bookingSettings.maxDailyBookings}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          maxDailyBookings: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum bookings one client can make per day
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Reminder (hours before)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={bookingSettings.reminderHours}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          reminderHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      When to send reminder notifications
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-gray-200">
                  <ToggleSetting
                    label="Allow Same-Day Bookings"
                    description="Let clients book appointments for the same day"
                    checked={bookingSettings.allowSameDayBooking}
                    onChange={(checked) =>
                      setBookingSettings({
                        ...bookingSettings,
                        allowSameDayBooking: checked,
                      })
                    }
                  />
                </div>

                <button
                  onClick={handleSaveBooking}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "💾 Save Booking Settings"}
                </button>
              </div>
            )}

            {/* Business Settings Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Business Registration Rules
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Business Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={businessSettings.minimumBusinessRating}
                      onChange={(e) =>
                        setBusinessSettings({
                          ...businessSettings,
                          minimumBusinessRating: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Businesses below this rating will be reviewed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Services Per Business
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={businessSettings.maxServices}
                      onChange={(e) =>
                        setBusinessSettings({
                          ...businessSettings,
                          maxServices: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum services a business can offer
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900">
                    Verification Requirements
                  </h3>

                  <ToggleSetting
                    label="Auto-Approve New Businesses"
                    description="⚠️ NOT RECOMMENDED: Automatically approve without admin review"
                    checked={businessSettings.autoApproveBusinesses}
                    onChange={(checked) =>
                      setBusinessSettings({
                        ...businessSettings,
                        autoApproveBusinesses: checked,
                      })
                    }
                    danger={businessSettings.autoApproveBusinesses}
                  />

                  <ToggleSetting
                    label="Require Carlow Location Verification"
                    description="✅ RECOMMENDED: Verify business is actually located in Carlow"
                    checked={businessSettings.requireCarlowVerification}
                    onChange={(checked) =>
                      setBusinessSettings({
                        ...businessSettings,
                        requireCarlowVerification: checked,
                      })
                    }
                    important
                  />

                  <ToggleSetting
                    label="Require Irish Business Registration"
                    description="Require valid Irish business registration number"
                    checked={businessSettings.requireBusinessRegistration}
                    onChange={(checked) =>
                      setBusinessSettings({
                        ...businessSettings,
                        requireBusinessRegistration: checked,
                      })
                    }
                  />
                </div>

                <button
                  onClick={handleSaveBusiness}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "💾 Save Business Settings"}
                </button>
              </div>
            )}

            {/* Location Settings Tab - Carlow Specific */}
            {activeTab === "location" && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">📍</span>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg mb-2">
                        LocalBook is Exclusively for County Carlow
                      </h3>
                      <p className="text-green-800">
                        These settings ensure only legitimate Carlow businesses
                        can register on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Carlow Location Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating County (Fixed)
                  </label>
                  <input
                    type="text"
                    value={locationSettings.county}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    LocalBook operates exclusively in County Carlow
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Allowed Towns in Carlow
                  </label>
                  <div className="space-y-2">
                    {locationSettings.allowedTowns.map((town, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <span className="text-green-600">✓</span>
                        <span className="font-medium text-gray-900">{town}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Businesses must be located in one of these Carlow towns
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Eircode Prefixes
                  </label>
                  <div className="flex gap-2">
                    {locationSettings.allowedEircodes.map((code, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-bold text-lg"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    All Carlow eircodes start with R93
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                  <ToggleSetting
                    label="Require Valid Eircode"
                    description="Businesses must provide a valid Carlow eircode (R93)"
                    checked={locationSettings.requireEircode}
                    onChange={(checked) =>
                      setLocationSettings({
                        ...locationSettings,
                        requireEircode: checked,
                      })
                    }
                    important
                  />

                  <ToggleSetting
                    label="Verify Business Location"
                    description="✅ CRITICAL: Manually verify each business is actually in Carlow"
                    checked={locationSettings.verifyLocation}
                    onChange={(checked) =>
                      setLocationSettings({
                        ...locationSettings,
                        verifyLocation: checked,
                      })
                    }
                    important
                  />
                </div>

                <button
                  onClick={handleSaveLocation}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "💾 Save Location Settings"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Tab Button Component */
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

/* Toggle Setting Component */
const ToggleSetting = ({ label, description, checked, onChange, danger, important }) => (
  <div
    className={`flex items-start justify-between p-5 rounded-xl border-2 ${
      danger
        ? "bg-red-50 border-red-300"
        : important
        ? "bg-green-50 border-green-300"
        : "bg-gray-50 border-gray-200"
    }`}
  >
    <div className="flex-1 pr-4">
      <p
        className={`font-bold text-base mb-1 ${
          danger ? "text-red-900" : important ? "text-green-900" : "text-gray-900"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm ${
          danger ? "text-red-700" : important ? "text-green-700" : "text-gray-600"
        }`}
      >
        {description}
      </p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`w-14 h-7 ${
          danger
            ? "bg-red-300 peer-checked:bg-red-600"
            : important
            ? "bg-green-300 peer-checked:bg-green-600"
            : "bg-gray-300 peer-checked:bg-purple-600"
        } peer-focus:outline-none peer-focus:ring-4 ${
          danger
            ? "peer-focus:ring-red-200"
            : important
            ? "peer-focus:ring-green-200"
            : "peer-focus:ring-purple-200"
        } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all`}
      ></div>
    </label>
  </div>
);

export default PlatformSettings;