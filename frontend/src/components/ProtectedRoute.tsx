import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Layout } from '../components/layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { token, isAdmin } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
}
