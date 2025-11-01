import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
function AdminApp() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800">LocalBook</h2>
                    <p className="text-sm text-gray-600 mt-2">Admin Panel</p>
                </div>
                
                <nav className="mt-6">
                    <Link 
                        to="/admin" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                        📊 Dashboard
                    </Link>
                    
                    <Link 
                        to="/admin/businesses" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                        🏢 Manage Businesses
                    </Link>
                    
                    <Link 
                        to="/admin/users" 
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                        👥 Manage Users
                    </Link>
                </nav>
                
                <div className="absolute bottom-0 w-64 p-6 border-t">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/businesses" element={<ManageBusinesses />} />
                    <Route path="/users" element={<ManageUsers />} />
                </Routes>
            </main>
        </div>
    );
}

// Placeholder components
const AdminDashboard = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">150</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Total Businesses</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">45</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Pending Approvals</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">8</p>
            </div>
        </div>
    </div>
);

const ManageBusinesses = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Manage Businesses</h1>
        <div className="bg-white rounded-lg shadow p-6">
            <p>Business management coming soon...</p>
        </div>
    </div>
);

const ManageUsers = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        <div className="bg-white rounded-lg shadow p-6">
            <p>User management coming soon...</p>
        </div>
    </div>
);

export default AdminApp;