import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminRequest, tokenKey } from '../services/adminApi';
import { ErrorMessage } from '../components/Feedback';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await adminRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      localStorage.setItem(tokenKey, result.token);
      onLogin(result.token);
      navigate(location.state?.from || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="card login-card shadow" onSubmit={handleSubmit}>
        <div className="card-body p-4 p-md-5">
          <div className="login-brand">
            <img src="/Logo SICE.ico" alt="" />
            <h1 className="h3 mb-2">Área administrativa</h1>
          </div>
          <p className="text-center text-muted mb-4">Entre com sua conta de administrador ou coletor.</p>
          <ErrorMessage>{error}</ErrorMessage>
          <label htmlFor="admin-email" className="form-label">E-mail</label>
          <input
            id="admin-email"
            className="form-control mb-3"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="admin-password" className="form-label">Senha</label>
          <input
            id="admin-password"
            className="form-control mb-4"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
          <button className="btn btn-success w-100" type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
          <Link className="btn btn-outline-success w-100 mt-3" to="/criar-conta-admin">
            Criar conta de administrador
          </Link>
        </div>
      </form>
    </main>
  );
}
