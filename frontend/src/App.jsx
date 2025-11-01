import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessOwnerApp from './pages/business/BusinessOwnerApp';
import AdminApp from './pages/admin/AdminApp';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
                path="/business/*"
                element={
                    <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                        <BusinessOwnerApp />
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminApp />
                    </ProtectedRoute>
                }
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;