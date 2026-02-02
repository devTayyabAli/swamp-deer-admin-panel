import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user } = useAuth();
    const location = useLocation();

    // if (isLoading) {
    //     // You might want a nicer loading spinner here
    //     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    // }

    if (!user) {
        // Redirect to admin login if trying to access admin routes
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Role based protection
        // If user is logged in but tries to access restricted area, redirect to their dashboard or unauthorized page
        // For now, redirecting to dashboard if they are a regular user trying to access admin
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
