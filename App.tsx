import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './services/store';
import { ToastProvider } from './components/Toast';
import LoginPage from './components/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Admin Pages
import { AdminCompaniesPage } from './pages/admin/Companies';
import { AdminClientsPage } from './pages/admin/Clients';
import { AdminProfilePage } from './pages/admin/ProfilePage';
import { CompanyDetailPage } from './pages/admin/CompanyDetail';

// Company Pages
import { CompanyValidatePage } from './pages/company/ValidatePage';
import { CompanyHistoryPage } from './pages/company/HistoryPage';
import { CompanyProfilePage } from './pages/company/ProfilePage';
import { CompanyClientDetailPage } from './pages/company/ClientDetail';
import { CompanyDataPage } from './pages/company/CompanyDataPage';

// Client Pages
import { ClientExplorePage } from './pages/client/ExplorePage';
import { ClientCardPage } from './pages/client/CardPage';
import { ClientProfilePage } from './pages/client/ProfilePage';
import { ClientCompanyDetailPage } from './pages/client/CompanyDetail';

const AppRoutes = () => {
  const { currentUser, isLoading } = useApp();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect root based on user role
  const RootRedirect = () => {
    if (!currentUser) {
      return <LoginPage />;
    }

    if (currentUser.role === 'admin') {
      return <Navigate to="/painel/admin/empresas" replace />;
    } else if (currentUser.role === 'company') {
      return <Navigate to="/painel/parceiro/validar" replace />;
    } else {
      return <Navigate to="/painel" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Routes */}
      <Route
        path="/painel/admin/empresas"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCompaniesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/admin/usuarios"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/admin/perfil"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/admin/empresas/:companySlug"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CompanyDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/painel/parceiro/validar"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyValidatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/parceiro/historico"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/parceiro/empresa"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyDataPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/parceiro/perfil"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/parceiro/clientes/:clientId"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyClientDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/painel"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientExplorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/carteirinha"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientCardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/perfil"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/empresas/:companySlug"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientCompanyDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to appropriate dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;