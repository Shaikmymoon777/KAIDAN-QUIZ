<<<<<<< HEAD
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/usercontext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login' 
}) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
=======
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Set loading to false once auth state is determined
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
