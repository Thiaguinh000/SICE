import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import EditAppointment from './pages/EditAppointment';
import Account from './pages/Account';

const VALID_USER_TYPES = new Set(['usuario', 'cliente', 'admin', 'coletor']);

function isValidToken(token) {
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    if (!decoded.userId || !VALID_USER_TYPES.has(decoded.tipo)) return false;
    if (!decoded.exp) return true;
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
}

export default function App() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return isValidToken(storedToken) ? storedToken : null;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!isValidToken(storedToken)) {
      localStorage.removeItem('token');
      setToken(null);
      return;
    }

    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={(token) => { localStorage.setItem('token', token); setToken(token); }} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/conta" element={token ? <Account onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/agendar" element={token ? <NewAppointment /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/pendentes" element={token ? <PendingAppointments /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/concluidos" element={token ? <CompletedAppointments /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/editar/:id" element={token ? <EditAppointment /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
