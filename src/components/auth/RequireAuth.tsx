import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';

interface RequireAuthProps {
  children: React.ReactElement;
}

/** Wrap any route that should only be reachable once signed in. */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default RequireAuth;
