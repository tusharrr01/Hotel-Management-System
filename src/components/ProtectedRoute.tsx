import React from "react";
import { Navigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<"user" | "hotel_owner" | "admin">;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and role-based access control
 * 
 * Usage:
 * <ProtectedRoute roles={["admin"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute roles={["hotel_owner", "admin"]}>
 *   <ManageHotels />
 * </ProtectedRoute>
 * 
 * For unauthorized admin routes, user is redirected to home page
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  fallback,
}) => {
  const { isLoggedIn, userRole } = useAppContext();

  // Still loading
  if (isLoggedIn === undefined) {
    return fallback || <LoadingSpinner message="Loading..." />;
  }

  // Not authenticated - redirect to admin login if trying to access admin routes
  if (!isLoggedIn) {
    if (roles?.includes("admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/sign-in" replace />;
  }

  // Authenticated but no specific roles required
  if (!roles || roles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has one of the required roles
  if (userRole && roles.includes(userRole)) {
    return <>{children}</>;
  }

  // User doesn't have permission - redirect to home for unauthorized access
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
