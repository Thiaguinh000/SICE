import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { accountRequest, adminRequest } from './services/adminApi';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminAccountSetup from './pages/AdminAccountSetup';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import AppointmentDetails from './pages/AppointmentDetails';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Account from './pages/Account';
import RoutePlanning from './pages/RoutePlanning';
import { Loading } from './components/Feedback';

function ProtectedAdmin({ user, checkingSession, onLogout }) {
  if (checkingSession) return <main className="container py-5"><Loading label="Verificando sessão..." /></main>;
  return user && ['admin', 'coletor'].includes(user.tipo)
    ? <AdminLayout user={user} onLogout={onLogout} />
    : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem('adminToken');
    } catch (error) {
      console.warn('Não foi possível remover uma credencial antiga do navegador.', error);
    }
    accountRequest('/profile')
      .then((profile) => {
        if (['admin', 'coletor'].includes(profile.tipo)) setUser(profile);
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setCheckingSession(false);
    };
    window.addEventListener('sice:admin-session-expired', handleExpiredSession);
    return () => window.removeEventListener('sice:admin-session-expired', handleExpiredSession);
  }, []);

  const handleLogout = async (sessionAlreadyCleared = false) => {
    if (!sessionAlreadyCleared) await adminRequest('/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={checkingSession ? <main className="container py-5"><Loading label="Verificando sessão..." /></main> : user ? <Navigate to="/" replace /> : <AdminLogin onLogin={setUser} />}
        />
        <Route path="/criar-conta-admin" element={<AdminAccountSetup />} />
        <Route path="/" element={<ProtectedAdmin user={user} checkingSession={checkingSession} onLogout={handleLogout} />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="coletas" element={<Appointments />} />
          <Route path="rotas" element={<RoutePlanning />} />
          <Route path="coletas/:id" element={<AppointmentDetails isAdmin={user?.tipo === 'admin'} />} />
          <Route path="conta" element={<Account onLogout={handleLogout} />} />
          <Route
            path="usuarios"
            element={user?.tipo === 'admin' ? <Users /> : <Navigate to="/" replace />}
          />
          <Route path="relatorios" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
