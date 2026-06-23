import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro no login');
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.token);
      navigate('/');
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card shadow">
        <h2 className="text-center eco-title-primary">Login EcoColeta</h2>
        <p className="text-center text-muted mb-4">Acesse sua conta para agendar e acompanhar descartes ecológicos.</p>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Email de Usuário</label>
            <input
              type="email"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
            />
          </div>

          <button type="submit" className="btn-eco-primary w-100 mt-2">
            Entrar no Painel
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted">Ainda não tem cadastro? </span>
          <Link to="/register" className="text-decoration-none eco-title-accent font-weight-bold">Registre-se</Link>
        </div>
      </div>
    </div>
  );
}
