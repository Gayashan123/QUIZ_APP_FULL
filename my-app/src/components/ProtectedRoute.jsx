// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, isAuthenticated, allowedRoles, userRole }) {
  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/loginpage" replace />;
  }

  // If role is not allowed, redirect to home
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
