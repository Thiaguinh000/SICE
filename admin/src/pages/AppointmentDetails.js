import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminRequest } from '../services/adminApi';
import { ErrorMessage, Loading } from '../components/Feedback';

const nextStatus = {
  Pendente: 'Aguardando coleta',
  'Aguardando coleta': 'Em transporte',
  'Em transporte': 'Em avaliação',
  'Em avaliação': 'Reciclado ou Descartado',
  'Reciclado ou Descartado': 'Finalizado',
};

export default function AppointmentDetails({ isAdmin }) {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [destination, setDestination] = useState('Reciclado');
  const [weightKg, setWeightKg] = useState('');
  const [collectors, setCollectors] = useState([]);
  const [collectorId, setCollectorId] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAppointment = useCallback(() => adminRequest(`/appointments/${id}`)
    .then(setAppointment)
    .catch((requestError) => setError(requestError.message))
    .finally(() => setLoading(false)), [id]);

  useEffect(() => {
    loadAppointment();
    if (isAdmin) {
      adminRequest('/collectors').then(setCollectors).catch((requestError) => setError(requestError.message));
    }
  }, [isAdmin, loadAppointment]);

  useEffect(() => {
    setCollectorId(appointment?.assignedCollector?._id || '');
  }, [appointment]);

  const advanceStatus = async () => {
    const status = nextStatus[appointment.status || 'Pendente'];
    if (!status) return;
    setSaving(true);
    setError('');
    try {
      await adminRequest(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          ...(status === 'Reciclado ou Descartado' ? { destination, weightKg: Number(weightKg) } : {}),
        }),
      });
      if (status === 'Reciclado ou Descartado') setWeightKg('');
      await loadAppointment();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    setSavingAssignment(true);
    setError('');
    try {
      await adminRequest(`/appointments/${id}/assignment`, {
        method: 'PATCH',
        body: JSON.stringify({ collectorId: collectorId || null }),
      });
      await loadAppointment();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingAssignment(false);
    }
  };

  if (loading) return <Loading label="Carregando detalhes..." />;

  const mapQuery = appointment?.address ? encodeURIComponent(appointment.address) : '';
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${mapQuery}&output=embed`
    : '';
  const mapLinkUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
    : '';

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operação</p>
          <h1>Detalhes da coleta</h1>
        </div>
        <Link to="/coletas" className="btn btn-outline-secondary">Voltar às coletas</Link>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {appointment && (
        <section className="detail-card">
          <div className="detail-grid">
            <div><span>Material</span><strong>{appointment.service}</strong></div>
            <div><span>Quantidade</span><strong>{appointment.quantity || 1}</strong></div>
            <div><span>Status</span><strong>{appointment.status || 'Pendente'}</strong></div>
            <div><span>Destino</span><strong>{appointment.destination || '—'}</strong></div>
            <div><span>Cliente</span><strong>{appointment.client?.nome || '—'}</strong></div>
            <div><span>E-mail</span><strong>{appointment.client?.email || '—'}</strong></div>
            <div><span>Responsável pela coleta</span><strong>{appointment.assignedCollector?.nome || 'Não atribuído'}</strong></div>
            <div><span>Data e horário</span><strong>{appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : '—'} {appointment.time || ''}</strong></div>
            <div><span>Endereço</span><strong>{appointment.address || '—'}</strong></div>
            <div><span>Marca / modelo</span><strong>{[appointment.brand, appointment.model].filter(Boolean).join(' / ') || '—'}</strong></div>
            <div><span>Condição</span><strong>{appointment.condition || '—'}</strong></div>
            <div><span>Peso medido</span><strong>{appointment.weightKg ? `${appointment.weightKg} kg` : '—'}</strong></div>
            <div className="detail-wide"><span>Observações</span><strong>{appointment.notes || '—'}</strong></div>
          </div>
          {isAdmin && <form className="status-action" onSubmit={saveAssignment}>
            <label className="flex-grow-1">
              Coletor responsável
              <select className="form-select mt-1" value={collectorId} onChange={(event) => setCollectorId(event.target.value)}>
                <option value="">Sem responsável</option>
                {collectors.map((collector) => (
                  <option key={collector._id} value={collector._id}>{collector.nome} ({collector.email})</option>
                ))}
              </select>
            </label>
            <button className="btn btn-outline-success" type="submit" disabled={savingAssignment}>
              {savingAssignment ? 'Salvando...' : 'Atribuir coleta'}
            </button>
          </form>}
          <section className="location-section" aria-labelledby="status-history-title">
            <h2 id="status-history-title">Histórico da coleta</h2>
            {appointment.statusHistory?.length ? (
              <ol className="mb-0">
                {appointment.statusHistory.map((event) => (
                  <li key={event._id} className="mb-2">
                    <strong>{event.status}</strong> — {new Date(event.changedAt).toLocaleString('pt-BR')}
                    {event.destination && ` · ${event.destination}`}
                    {event.weightKg && ` · ${event.weightKg} kg`}
                  </li>
                ))}
              </ol>
            ) : <p className="text-muted mb-0">Histórico ainda não disponível para esta coleta.</p>}
          </section>
          {appointment.address && (
            <section className="location-section" aria-labelledby="collection-location-title">
              <div className="location-heading">
                <div>
                  <h2 id="collection-location-title">Localização da coleta</h2>
                  <p>{appointment.address}</p>
                  <small>O endereço será enviado ao Google Maps para exibir o mapa.</small>
                </div>
                <a
                  className="btn btn-outline-success"
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no Google Maps
                </a>
              </div>
              <iframe
                className="location-map"
                src={mapEmbedUrl}
                title="Mapa da localização da coleta"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </section>
          )}
          {nextStatus[appointment.status || 'Pendente'] && (
            <div className="status-action">
              {appointment.status === 'Em avaliação' && (
                <>
                  <label>
                    Destino do material
                    <select className="form-select mt-1" value={destination} onChange={(event) => setDestination(event.target.value)}>
                      <option>Reciclado</option>
                      <option>Descartado</option>
                    </select>
                  </label>
                  <label>
                    Peso medido (kg)
                    <input className="form-control mt-1" type="number" min="0.01" max="100000" step="0.01" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} required />
                  </label>
                </>
              )}
              <button
                type="button"
                className="btn btn-success"
                onClick={advanceStatus}
                disabled={saving || (appointment.status === 'Em avaliação'
                  && (!Number.isFinite(Number(weightKg)) || Number(weightKg) <= 0 || Number(weightKg) > 100000))}
              >
                {saving ? 'Salvando...' : `Avançar para ${nextStatus[appointment.status || 'Pendente']}`}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
