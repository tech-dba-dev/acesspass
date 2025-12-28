import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../services/store';

type Role = 'admin' | 'company' | 'client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useApp();

  // While loading, don't render anything (App.tsx handles the loading state)
  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirecionar para a rota apropriada baseada no role
    if (currentUser.role === 'admin') {
      return <Navigate to="/painel/admin/empresas" replace />;
    } else if (currentUser.role === 'company') {
      return <Navigate to="/painel/parceiro/validar" replace />;
    } else {
      return <Navigate to="/painel" replace />;
    }
  }

  return <>{children}</>;
};
