import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type ProtectedRouteProps = {
  allowedRoles?: ('admin' | 'user')[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading, user } = state;

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-slow text-primary-600">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has allowed role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has allowed role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;