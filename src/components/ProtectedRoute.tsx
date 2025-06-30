import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authUser, profile, loading } = useUser();
  
  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Restoring your session" />;
  }
  
  // If not authenticated after loading, redirect to login
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, show protected content
  return <>{children}</>;
};

export default ProtectedRoute;
