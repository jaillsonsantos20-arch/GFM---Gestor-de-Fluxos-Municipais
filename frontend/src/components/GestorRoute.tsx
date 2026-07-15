import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function GestorRoute({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();

  if (usuario?.role !== 'GESTOR') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
