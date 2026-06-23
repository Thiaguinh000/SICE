import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Recarrega para que o App.js reavalie o token e redirecione
  };

  return (
    <div 
      style={{ 
        backgroundImage: "url('/images/salao.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '400px', width: '100%', opacity: 0.95 }}>
        <h1 className="card-title text-center mb-4 text-primary">Bem-vindo(a)!</h1>
        <nav>
          <ul className="list-unstyled">
            <li className="mb-3">
              <Link
                to="/agendar"
                className="btn btn-primary w-100"
              >
                Agendar um serviço
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/agendamentos/pendentes"
                className="btn btn-warning w-100"
              >
                Ver agendamentos pendentes
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/agendamentos/concluidos"
                className="btn btn-success w-100"
              >
                Ver agendamentos concluídos
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="btn btn-danger w-100 mt-2"
              >
                Sair (Logout)
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
