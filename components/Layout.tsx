import React from 'react';
import { useApp } from '../services/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './Toast';
import { Avatar } from './Avatar';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ScanLine, 
  History, 
  LogOut, 
  UserCircle,
  QrCode,
  Compass
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return <>{children}</>;

  const handleLogout = async () => {
    await logout();
    showToast('Você saiu da sua conta', 'info');
    navigate('/');
  };

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'companies', label: 'Empresas', icon: Building2, path: '/painel/admin/empresas' },
          { id: 'users', label: 'Usuários', icon: Users, path: '/painel/admin/usuarios' },
          { id: 'admin-profile', label: 'Perfil', icon: UserCircle, path: '/painel/admin/perfil' },
        ];
      case 'company':
        return [
          { id: 'validate', label: 'Validar', icon: ScanLine, path: '/painel/parceiro/validar' },
          { id: 'history', label: 'Histórico', icon: History, path: '/painel/parceiro/historico' },
          { id: 'company-data', label: 'Empresa', icon: Building2, path: '/painel/parceiro/empresa' },
          { id: 'company-profile', label: 'Perfil', icon: UserCircle, path: '/painel/parceiro/perfil' },
        ];
      case 'client':
        return [
          { id: 'explore', label: 'Explorar', icon: Compass, path: '/painel' },
          { id: 'my-card', label: 'Meu Cartão', icon: QrCode, path: '/painel/carteirinha' },
          { id: 'client-profile', label: 'Perfil', icon: UserCircle, path: '/painel/perfil' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary-600 tracking-tight">AccessPass</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{currentUser.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentPath === item.path 
                  ? 'bg-primary-50 text-primary-600 font-medium shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPath === item.path ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" className="ring-2 ring-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0 h-screen no-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-primary-600">AccessPass</h1>
          </div>
          <div className="flex items-center gap-2">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500">
               <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-30">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-3 px-2 w-full transition-colors ${
                currentPath === item.path ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${currentPath === item.path ? 'fill-current opacity-20' : ''}`} strokeWidth={currentPath === item.path ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;