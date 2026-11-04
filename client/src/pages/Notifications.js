import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setError('');
      setNotifications(await apiRequest('/api/users/notifications'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/users/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((current) => current.map((item) => (
        item._id === id ? { ...item, readAt: new Date().toISOString() } : item
      )));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="eco-layout" style={{
      backgroundImage: "url('/fundodosoftware.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <section className="eco-card eco-card-large">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 className="eco-title-primary mb-1">Notificações</h1>
            <p className="text-muted mb-0">Atualizações e lembretes das suas coletas.</p>
          </div>
          <Link className="btn-eco-secondary" to="/">Voltar</Link>
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading && <p role="status">Carregando notificações...</p>}
        {!loading && !error && notifications.length === 0 && (
          <div className="alert alert-info" role="status">Você ainda não tem notificações.</div>
        )}
        {!loading && notifications.map((notification) => (
          <article className="eco-item-row" key={notification._id}>
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h2 className="h6 mb-1">{notification.title}</h2>
                <p className="mb-1">{notification.message}</p>
                <small className="text-muted">{new Date(notification.createdAt).toLocaleString('pt-BR')}</small>
              </div>
              {!notification.readAt && (
                <button className="btn btn-sm btn-outline-success" type="button" onClick={() => markAsRead(notification._id)}>
                  Marcar como lida
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
