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

export default function AppointmentDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [destination, setDestination] = useState('Reciclado');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAppointment = useCallback(() => adminRequest(`/appointments/${id}`)
    .then(setAppointment)
    .catch((requestError) => setError(requestError.message))
    .finally(() => setLoading(false)), [id]);

  useEffect(() => { loadAppointment(); }, [loadAppointment]);

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
          ...(status === 'Reciclado ou Descartado' ? { destination } : {}),
        }),
      });
      await loadAppointment();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
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
            <div><span>Data e horário</span><strong>{appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : '—'} {appointment.time || ''}</strong></div>
            <div><span>Endereço</span><strong>{appointment.address || '—'}</strong></div>
            <div><span>Marca / modelo</span><strong>{[appointment.brand, appointment.model].filter(Boolean).join(' / ') || '—'}</strong></div>
            <div><span>Condição</span><strong>{appointment.condition || '—'}</strong></div>
            <div className="detail-wide"><span>Observações</span><strong>{appointment.notes || '—'}</strong></div>
          </div>
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
                <label>
                  Destino do material
                  <select className="form-select mt-1" value={destination} onChange={(event) => setDestination(event.target.value)}>
                    <option>Reciclado</option>
                    <option>Descartado</option>
                  </select>
                </label>
              )}
              <button type="button" className="btn btn-success" onClick={advanceStatus} disabled={saving}>
                {saving ? 'Salvando...' : `Avançar para ${nextStatus[appointment.status || 'Pendente']}`}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
