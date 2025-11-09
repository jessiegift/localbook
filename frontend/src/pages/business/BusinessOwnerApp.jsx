import React, { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Dashboard from "./Dashboard";
import Booking from "./Booking";
import BusinessSetup from "./BusinessSetup";
import ManageService from "./ManageService";
import Customers from "./Customers";
import Settings from "./Settings";
import AccountSettings from './AccountSettings';

function BusinessOwnerApp() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: "/business", label: "Dashboard", icon: "📊" },
        { path: "/business/bookings", label: "Bookings", icon: "📅" },
        { path: "/business/business-setup", label: "Business Setup", icon: "🏢" },
        { path: "/business/manage-services", label: "Services", icon: "🛠️" },
        { path: "/business/customers", label: "Customers", icon: "👥" },
        { path: "/business/settings", label: "Settings", icon: "⚙️" },
        { path: "/business/account-settings", label: "Account", icon: "👤" }
    ];

    const isActivePath = (path) => {
        if (path === "/business") {
            return location.pathname === "/business" || location.pathname === "/business/";
        }
        return location.pathname === path;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
            >
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-white shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col
            `}>
                {/* Logo Section */}
                <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700">
                    <h2 className="text-3xl font-bold text-white">LocalBook</h2>
                    <p className="text-sm text-purple-100 mt-1">Business Portal</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center px-6 py-3 mb-1 transition-all duration-200
                                ${isActivePath(item.path)
                                    ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600 font-semibold'
                                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                }
                            `}
                        >
                            <span className="text-2xl mr-4">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Profile Section */}
                <div className="border-t bg-gray-50 p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium shadow-md hover:shadow-lg"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto lg:ml-0">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/bookings" element={<Booking />} />
                    <Route path="/business-setup" element={<BusinessSetup />} />
                    <Route path="/manage-services" element={<ManageService />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/account-settings" element={<AccountSettings />} />
                </Routes>
            </main>
        </div>
    );
}

export default BusinessOwnerApp;
