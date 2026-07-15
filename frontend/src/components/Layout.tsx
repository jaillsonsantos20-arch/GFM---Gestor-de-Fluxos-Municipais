import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/processos', label: 'Processos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/processos/novo', label: 'Novo Processo', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { to: '/secretarias', label: 'Secretarias', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { to: '/setores', label: 'Setores', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { to: '/fornecedores', label: 'Fornecedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { to: '/modelos-fluxo', label: 'Modelos de Fluxo', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { to: '/usuarios/novo', label: 'Novo Usuário', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
];

const roleLabels: Record<string, string> = {
  GESTOR: 'Gestor',
  OPERADOR_SETOR: 'Operador de Setor',
  SECRETARIA: 'Secretaria',
  FORNECEDOR: 'Fornecedor',
};

function podeVer(item: string, role?: string): boolean {
  if (role === 'GESTOR') return true;
  if (role === 'FORNECEDOR') return ['/', '/processos'].includes(item);
  if (role === 'SECRETARIA') return !['/secretarias', '/fornecedores', '/modelos-fluxo', '/usuarios/novo'].includes(item);
  if (role === 'OPERADOR_SETOR') return !['/secretarias', '/setores', '/fornecedores', '/modelos-fluxo', '/usuarios/novo'].includes(item);
  return false;
}

const userRoles: Record<string, string> = {
  GESTOR: 'Gestor',
  OPERADOR_SETOR: 'Operador',
  SECRETARIA: 'Secretaria',
  FORNECEDOR: 'Fornecedor',
};

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = useMemo(
    () => navItems.filter((item) => podeVer(item.to, usuario?.role)),
    [usuario?.role],
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex md:flex-col w-64 bg-sidebar-bg text-white fixed md:static inset-y-0 z-50`}>
        <div className="px-5 h-16 flex items-center border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GFM" className="h-12 brightness-0 invert" />
            <div>
              <h1 className="text-sm font-semibold text-white">GFM</h1>
              <p className="text-[10px] text-sidebar-text">Gestão de Fluxos</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-bank-600 text-white shadow-sm shadow-bank-600/20'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-light'
                }`
              }
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-bank-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{usuario?.nome}</p>
              <p className="text-[11px] text-sidebar-text">{userRoles[usuario?.role || ''] || usuario?.role}</p>
            </div>
          </div>
          {usuario?.secretaria && (
            <p className="text-[11px] text-sidebar-text mt-2 ml-0.5">{usuario.secretaria.sigla}{usuario.setor ? ` - ${usuario.setor.nome}` : ''}</p>
          )}
          {usuario?.fornecedor && (
            <p className="text-[11px] text-sidebar-text mt-2 ml-0.5">{usuario.fornecedor.razaoSocial}</p>
          )}
          <button onClick={handleLogout} className="mt-2.5 text-xs text-red-400 hover:text-red-300 transition-colors w-full text-left">
            Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-gray-500">Sistema operacional</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-bank-100 text-bank-700 flex items-center justify-center text-xs font-semibold">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">{usuario?.nome}</p>
                <p className="text-xs text-gray-400">{roleLabels[usuario?.role || ''] || usuario?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
