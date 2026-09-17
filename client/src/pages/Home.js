import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div 
      style={{ 
        backgroundImage: "url('/fundodosoftware.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '400px', width: '100%', opacity: 0.95, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h1 className="card-title text-center mb-2 text-success">SICE</h1>
        <p className="text-center text-muted mb-4">Sistema Integrado de Coleta de Eletrônicos</p>
        <p className="text-center mb-4">Tem um eletrônico parado em casa? A gente ajuda você a dar um destino correto para ele.</p>
        <nav>
          <ul className="list-unstyled">
            <li className="mb-3">
              <Link
                to="/agendar"
                className="btn btn-success w-100 py-2"
              >
                Solicitar Coleta
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/agendamentos/pendentes"
                className="btn btn-warning w-100 py-2"
              >
                Minhas Coletas
              </Link>
            </li>
            <li>
              <Link
                to="/agendamentos/concluidos"
                className="btn btn-secondary w-100 py-2"
              >
                Histórico de Coletas
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
