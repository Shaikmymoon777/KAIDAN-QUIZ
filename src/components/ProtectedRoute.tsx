import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/usercontext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login',
  children 
}) => {
  const { user } = useUser();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add any additional auth checks here if needed
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If there are children, render them, otherwise render the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
