import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const welcomeCloseButton = useRef(null);

  useEffect(() => {
    if (!showWelcome) return undefined;

    welcomeCloseButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowWelcome(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome]);

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
        <button className="btn btn-outline-success mb-3" onClick={() => setShowWelcome(true)} type="button">
          Como funciona?
        </button>
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
            <li className="mt-3">
              <Link to="/conta" className="btn btn-outline-success w-100 py-2">
                Minha conta
              </Link>
            </li>
            <li className="mt-3">
              <Link to="/notificacoes" className="btn btn-outline-secondary w-100 py-2">
                Notificações
              </Link>
            </li>
          </ul>
        </nav>
        <p className="small text-center mb-0"><Link to="/privacidade">Privacidade</Link></p>
      </div>
      {showWelcome && (
        <div
          className="client-welcome-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowWelcome(false);
          }}
        >
          <section
            aria-describedby="client-welcome-description"
            aria-labelledby="client-welcome-title"
            aria-modal="true"
            className="client-welcome-dialog"
            role="dialog"
          >
            <button
              aria-label="Fechar explicação"
              className="client-welcome-close"
              onClick={() => setShowWelcome(false)}
              ref={welcomeCloseButton}
              type="button"
            >
              &times;
            </button>
            <p className="eco-badge mb-3">Bem-vindo ao SICE</p>
            <h2 className="eco-title-primary mb-2" id="client-welcome-title">Dê um destino correto aos seus eletrônicos</h2>
            <p id="client-welcome-description">
              O Sistema Integrado de Coleta de Eletrônicos conecta você a um serviço de coleta e ajuda a encaminhar
              aparelhos sem uso para uma destinação responsável.
            </p>
            <h3 className="eco-title-accent fs-6 mt-4">Como usar</h3>
            <ol className="ps-3">
              <li className="mb-2">Escolha <strong>Solicitar Coleta</strong> para informar o eletrônico e o endereço.</li>
              <li className="mb-2">Acesse <strong>Minhas Coletas</strong> para acompanhar solicitações em andamento.</li>
              <li>Consulte o <strong>Histórico de Coletas</strong> para ver os atendimentos concluídos.</li>
            </ol>
            <button className="btn-eco-primary w-100 mt-2" onClick={() => setShowWelcome(false)} type="button">
              Entendi, começar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
