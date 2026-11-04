import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout({ user, onLogout }) {
  const isAdmin = user?.tipo === 'admin';
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await onLogout();
    } catch (error) {
      setLogoutError(error.message || 'Não foi possível encerrar a sessão.');
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="container-fluid admin-header-content">
          <NavLink to="/" className="admin-brand">
            <img src="/Logo SICE.ico" alt="" />
            <span className="admin-brand-name">SICE</span>
            <span className="admin-brand-section">Administração</span>
          </NavLink>
          <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
        {logoutError && <div className="alert alert-danger m-0 rounded-0" role="alert">{logoutError}</div>}
      </header>
      <div className="container-fluid admin-body">
        <nav className="admin-nav" aria-label="Navegação administrativa">
          <NavLink to="/" end>Visão geral</NavLink>
          <NavLink to="/coletas">Coletas</NavLink>
          <NavLink to="/rotas">Rotas</NavLink>
          {isAdmin && <NavLink to="/usuarios">Usuários</NavLink>}
          <NavLink to="/relatorios">Relatórios</NavLink>
          <NavLink to="/conta">Minha conta</NavLink>
        </nav>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
