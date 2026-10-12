import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getTokenPayload, isValidToken, tokenKey } from './services/adminApi';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminAccountSetup from './pages/AdminAccountSetup';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import AppointmentDetails from './pages/AppointmentDetails';
import Users from './pages/Users';
import Reports from './pages/Reports';

function ProtectedAdmin({ token, onLogout }) {
  const role = getTokenPayload(token)?.tipo;
  return isValidToken(token) && ['admin', 'coletor'].includes(role)
    ? <AdminLayout token={token} onLogout={onLogout} />
    : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(tokenKey);
    const role = getTokenPayload(storedToken)?.tipo;
    if (isValidToken(storedToken) && ['admin', 'coletor'].includes(role)) return storedToken;
    if (storedToken) localStorage.removeItem(tokenKey);
    return null;
  });

  useEffect(() => {
    const role = getTokenPayload(token)?.tipo;
    if (token && (!isValidToken(token) || !['admin', 'coletor'].includes(role))) {
      localStorage.removeItem(tokenKey);
      setToken(null);
    }
  }, [token]);

  useEffect(() => {
    const handleExpiredSession = () => setToken(null);
    window.addEventListener('sice:admin-session-expired', handleExpiredSession);
    return () => window.removeEventListener('sice:admin-session-expired', handleExpiredSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(tokenKey);
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <AdminLogin onLogin={setToken} />}
        />
        <Route path="/criar-conta-admin" element={<AdminAccountSetup />} />
        <Route path="/" element={<ProtectedAdmin token={token} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="coletas" element={<Appointments />} />
          <Route path="coletas/:id" element={<AppointmentDetails />} />
          <Route
            path="usuarios"
            element={getTokenPayload(token)?.tipo === 'admin' ? <Users /> : <Navigate to="/" replace />}
          />
          <Route path="relatorios" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
