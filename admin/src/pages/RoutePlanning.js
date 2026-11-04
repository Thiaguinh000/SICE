import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminRequest } from '../services/adminApi';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

function todayDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default function RoutePlanning() {
  const [date, setDate] = useState(todayDate);
  const [collectorId, setCollectorId] = useState('');
  const [collectors, setCollectors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRequest('/collectors')
      .then(setCollectors)
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const collectorFilter = collectorId ? `&assignedCollector=${encodeURIComponent(collectorId)}` : '';
    adminRequest(`/appointments?date=${encodeURIComponent(date)}${collectorFilter}`)
      .then((data) => {
        if (active) {
          setAppointments(data
            .filter((appointment) => appointment.status !== 'Finalizado')
            .sort((a, b) => (a.time || '').localeCompare(b.time || '')));
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, collectorId]);

  const routeGroups = useMemo(() => appointments.reduce((groups, appointment) => {
    const parts = (appointment.address || '').split(',').map((part) => part.trim()).filter(Boolean);
    const area = parts.length >= 4 ? parts[2] : 'Região não especificada';
    if (!groups[area]) groups[area] = [];
    groups[area].push(appointment);
    return groups;
  }, {}), [appointments]);

  const getDirectionsUrl = (group) => {
    const addresses = group.map((appointment) => appointment.address).filter(Boolean);
    if (!addresses.length) return '';
    const parameters = new URLSearchParams({
      api: '1',
      origin: addresses[0],
      destination: addresses[addresses.length - 1],
      travelmode: 'driving',
    });
    if (addresses.length > 2) parameters.set('waypoints', addresses.slice(1, -1).join('|'));
    return `https://www.google.com/maps/dir/?${parameters.toString()}`;
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operação</p>
          <h1>Rotas de coleta</h1>
          <p className="text-muted mb-0">Organize as coletas do dia por horário.</p>
        </div>
        <label className="filter-control">
          <span className="visually-hidden">Data das coletas</span>
          <input className="form-control mb-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <span className="visually-hidden">Filtrar coletas por responsável</span>
          <select className="form-select" value={collectorId} onChange={(event) => setCollectorId(event.target.value)}>
            <option value="">Todos os coletores</option>
            {collectors.map((collector) => <option key={collector._id} value={collector._id}>{collector.nome}</option>)}
          </select>
        </label>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading && <Loading label="Carregando coletas do dia..." />}
      {!loading && !error && appointments.length === 0 && <EmptyState>Nenhuma coleta programada para esta data.</EmptyState>}
      {!loading && appointments.length > 0 && (
        <>
          {Object.entries(routeGroups).map(([area, group]) => {
            const directionsUrl = getDirectionsUrl(group);
            return (
              <section className="mb-4" key={area}>
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <h2 className="h5 mb-0">{area}</h2>
                  {directionsUrl && (
                    <a className="btn btn-sm btn-outline-success" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      Abrir rota da região
                    </a>
                  )}
                </div>
                <div className="table-responsive admin-table-wrap">
                  <table className="table align-middle mb-0">
                    <thead><tr><th>Horário</th><th>Endereço</th><th>Material</th><th>Responsável</th><th /></tr></thead>
                    <tbody>
                      {group.map((appointment) => (
                        <tr key={appointment._id}>
                          <td>{appointment.time || '—'}</td>
                          <td>{appointment.address || 'Endereço removido'}</td>
                          <td>{appointment.service} ({appointment.quantity || 1})</td>
                          <td>{appointment.assignedCollector?.nome || 'Não atribuído'}</td>
                          <td className="text-end">
                            <Link className="btn btn-sm btn-outline-success" to={`/coletas/${appointment._id}`}>Detalhes</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          <p className="small text-muted">A região é identificada pelo terceiro segmento do endereço informado pelo cliente. A ordem segue os horários; o Google Maps recebe os endereços ao abrir a rota e não otimiza a sequência.</p>
        </>
      )}
    </>
  );
}
