import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Dashboard from "./Dashboard";
import Booking from "./Booking";  // Make sure this import is correct
import BusinessSetup from "./BusinessSetup";
import ManageService from "./ManageService";
import Customers from "./Customers";
import Settings from "./Settings";
import AccountSettings from './AccountSettings';
function BusinessOwnerApp() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-purple-600">LocalBook</h2>
                    <p className="text-sm text-gray-600 mt-1">Business Portal</p>
                </div>

               
                
                <nav className="flex-1 py-6">
                    <Link 
                        to="/business" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                        <span className="text-xl mr-3">📊</span>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    
                    <Link 
                        to="/business/bookings" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                        <span className="text-xl mr-3">📅</span>
                        <span className="font-medium">Bookings</span>
                    </Link>


                    <Link 
                        to="/business/business-setup" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                        <span className="text-xl mr-3">⚙️</span>
                        <span className="font-medium">Business Setup</span>
                    </Link>
                    <Link 
                        to="/business/manage-services" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                        <span className="text-xl mr-3">🛠️</span>
                        <span className="font-medium">Manage Services</span>
                    </Link>

                   
                        
                        <Link
                        to="/business/settings"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                        <span className="text-xl mr-3">⚙️</span>
                        <span className="font-medium">Settings</span>
                    </Link >

                    <Link to="/business/customers"
                          className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                          >
                        <span className="text-xl mr-3">👥</span>
                        <span className="font-medium">Customers</span>
                    </Link>

                    <Link to="/business/account-settings"
                          className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                          >
                        <span className="text-xl mr-3">👥</span>
                        <span className="font-medium">Account Settings</span>
                    </Link>



            

                </nav>
                
                <div className="border-t p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/bookings" element={<Booking />} />
                    <Route path="business-setup" element={<BusinessSetup />} />
                    <Route path="manage-services" element={<ManageService />} />
                     <Route path="/customers" element={<Customers />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="account-settings" element={<AccountSettings />} />
                    
                </Routes>
            </main>
        </div>
    );
}

export default BusinessOwnerApp;