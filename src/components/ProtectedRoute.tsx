import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authUser, profile } = useUser();
  if (!authUser || !profile) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
