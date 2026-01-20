import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
