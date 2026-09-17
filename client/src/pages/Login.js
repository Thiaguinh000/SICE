import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
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
    <div 
      style={{ 
        backgroundImage: "url('/fundodosoftware.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div id="login" className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="container">
          <div id="login-row" className="row justify-content-center align-items-center">
            <div id="login-column" className="col-md-6">
              <div id="login-box" className="col-md-12 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px' }}>
                <form id="login-form" className="form" onSubmit={handleSubmit}>
                  <h2 className="text-center text-success mb-2">SICE</h2>
                  <p className="text-center text-muted mb-4">Acesse sua conta para solicitar ou gerenciar coletas</p>

                  {mensagem && <p className="text-danger text-center">{mensagem}</p>}

                  <div className="form-group mb-3">
                    <label htmlFor="username" className="text-success fw-bold">E-mail:</label><br />
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="password" className="text-success fw-bold">Senha:</label><br />
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-success btn-md px-4"
                      value="Entrar"
                    />
                    <a href="/register" className="btn btn-outline-success btn-md">
                      Criar uma conta
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
