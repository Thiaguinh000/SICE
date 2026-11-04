import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiRequest } from './services/api';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import EditAppointment from './pages/EditAppointment';
import Account from './pages/Account';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';

function ProtectedClient({ user, checkingSession, children }) {
  if (checkingSession) return <main className="eco-layout"><p role="status">Verificando sessão...</p></main>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Não foi possível remover uma credencial antiga do navegador.', error);
    }
    apiRequest('/api/users/profile')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setCheckingSession(false);
    };
    window.addEventListener('sice:client-session-expired', handleExpiredSession);
    return () => window.removeEventListener('sice:client-session-expired', handleExpiredSession);
  }, []);

  const handleLogout = async (sessionAlreadyCleared = false) => {
    if (!sessionAlreadyCleared) await apiRequest('/api/users/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedClient user={user} checkingSession={checkingSession}><Home /></ProtectedClient>} />
        <Route path="/login" element={checkingSession ? <main role="status">Verificando sessão...</main> : user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/conta" element={<ProtectedClient user={user} checkingSession={checkingSession}><Account onLogout={handleLogout} /></ProtectedClient>} />
        <Route path="/notificacoes" element={<ProtectedClient user={user} checkingSession={checkingSession}><Notifications /></ProtectedClient>} />
        <Route path="/agendar" element={<ProtectedClient user={user} checkingSession={checkingSession}><NewAppointment /></ProtectedClient>} />
        <Route path="/agendamentos/pendentes" element={<ProtectedClient user={user} checkingSession={checkingSession}><PendingAppointments /></ProtectedClient>} />
        <Route path="/agendamentos/concluidos" element={<ProtectedClient user={user} checkingSession={checkingSession}><CompletedAppointments /></ProtectedClient>} />
        <Route path="/agendamentos/editar/:id" element={<ProtectedClient user={user} checkingSession={checkingSession}><EditAppointment /></ProtectedClient>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
