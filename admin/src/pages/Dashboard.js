import { useEffect, useState } from 'react';
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

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminRequest('/dashboard')
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SICE</p>
          <h1>Visão geral</h1>
          <p className="text-muted mb-0">Acompanhe as solicitações de coleta.</p>
        </div>
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
    </>
  );
}
