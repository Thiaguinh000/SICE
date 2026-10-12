import { NavLink, Outlet } from 'react-router-dom';
import { getTokenPayload } from '../services/adminApi';

export default function AdminLayout({ token, onLogout }) {
  const isAdmin = getTokenPayload(token)?.tipo === 'admin';

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="container-fluid admin-header-content">
          <NavLink to="/" className="admin-brand">
            <img src="/Logo SICE.ico" alt="" />
            <span className="admin-brand-name">SICE</span>
            <span className="admin-brand-section">Administração</span>
          </NavLink>
          <button type="button" className="btn btn-outline-light btn-sm" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>
      <div className="container-fluid admin-body">
        <nav className="admin-nav" aria-label="Navegação administrativa">
          <NavLink to="/" end>Visão geral</NavLink>
          <NavLink to="/coletas">Coletas</NavLink>
          {isAdmin && <NavLink to="/usuarios">Usuários</NavLink>}
          <NavLink to="/relatorios">Relatórios</NavLink>
        </nav>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
