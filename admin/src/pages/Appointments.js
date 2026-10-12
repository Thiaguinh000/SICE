import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminRequest } from '../services/adminApi';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

const statuses = [
  'Pendente',
  'Aguardando coleta',
  'Em transporte',
  'Em avaliação',
  'Reciclado ou Descartado',
  'Finalizado',
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    adminRequest(`/appointments${query}`)
      .then((data) => { if (active) setAppointments(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operação</p>
          <h1>Coletas</h1>
          <p className="text-muted mb-0">Consulte e atualize as solicitações.</p>
        </div>
        <label className="filter-control">
          <span className="visually-hidden">Filtrar por status</span>
          <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos os status</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading && <Loading label="Carregando coletas..." />}
      {!loading && !error && appointments.length === 0 && <EmptyState>Nenhuma coleta encontrada.</EmptyState>}
      {!loading && appointments.length > 0 && (
        <div className="table-responsive admin-table-wrap">
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>Material</th><th>Cliente</th><th>Data</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    <strong>{appointment.service}</strong>
                    <div className="small text-muted">{appointment.quantity || 1} unidade(s)</div>
                  </td>
                  <td>{appointment.client?.nome || appointment.client?.email || '—'}</td>
                  <td>{formatDate(appointment.date)}{appointment.time ? ` às ${appointment.time}` : ''}</td>
                  <td><span className="status-pill">{appointment.status || 'Pendente'}</span></td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-success" to={`/coletas/${appointment._id}`}>
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
