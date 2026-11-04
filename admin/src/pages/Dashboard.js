import { useEffect, useRef, useState } from 'react';
import { adminRequest } from '../services/adminApi';
import { ErrorMessage, Loading } from '../components/Feedback';

const cards = [
  ['totalSolicitacoes', 'Solicitações'],
  ['pendentes', 'Pendentes'],
  ['aguardandoColeta', 'Aguardando coleta'],
  ['emTransporte', 'Em transporte'],
  ['emAvaliacao', 'Em avaliação'],
  ['finalizadas', 'Finalizadas'],
  ['reciclados', 'Recicladas'],
  ['descartados', 'Descartadas'],
];

export default function Dashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const welcomeCloseButton = useRef(null);
  const isAdmin = user?.tipo === 'admin';

  useEffect(() => {
    adminRequest('/dashboard')
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

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
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SICE</p>
          <h1>Visão geral</h1>
          <p className="text-muted mb-0">Acompanhe as solicitações de coleta.</p>
        </div>
        <button className="btn btn-outline-success" type="button" onClick={() => setShowWelcome(true)}>
          Como usar o painel
        </button>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {!dashboard && !error && <Loading label="Carregando indicadores..." />}
      {dashboard && (
        <div className="stats-grid">
          {cards.map(([key, label]) => (
            <section className="stat-card" key={key}>
              <span>{label}</span>
              <strong>{dashboard[key] ?? 0}</strong>
            </section>
          ))}
        </div>
      )}
      {showWelcome && (
        <div
          className="welcome-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowWelcome(false);
          }}
        >
          <section
            aria-describedby="admin-welcome-description"
            aria-labelledby="admin-welcome-title"
            aria-modal="true"
            className="welcome-dialog"
            role="dialog"
          >
            <button
              aria-label="Fechar explicação"
              className="welcome-close"
              onClick={() => setShowWelcome(false)}
              ref={welcomeCloseButton}
              type="button"
            >
              &times;
            </button>
            <p className="eyebrow">Bem-vindo ao SICE</p>
            <h2 id="admin-welcome-title">Gestão responsável de eletrônicos</h2>
            <p id="admin-welcome-description">
              O SICE organiza solicitações de coleta de eletrônicos e acompanha cada etapa até a destinação adequada.
            </p>
            <h3>{isAdmin ? 'Como administrar o sistema' : 'Como usar o painel de coleta'}</h3>
            {isAdmin ? (
              <ul>
                <li><strong>Visão geral:</strong> consulte os indicadores de solicitações e destinações.</li>
                <li><strong>Coletas e rotas:</strong> acompanhe solicitações, atualize etapas e organize os atendimentos.</li>
                <li><strong>Usuários e relatórios:</strong> gerencie os acessos da equipe e analise os resultados.</li>
              </ul>
            ) : (
              <ul>
                <li><strong>Coletas:</strong> consulte as solicitações e seus endereços e detalhes.</li>
                <li><strong>Rotas:</strong> organize o atendimento e atualize o andamento das coletas.</li>
                <li><strong>Visão geral:</strong> acompanhe os indicadores e o progresso do trabalho.</li>
              </ul>
            )}
            <button className="btn btn-success w-100" onClick={() => setShowWelcome(false)} type="button">
              Entendi, acessar o painel
            </button>
          </section>
        </div>
      )}
    </>
  );
}
