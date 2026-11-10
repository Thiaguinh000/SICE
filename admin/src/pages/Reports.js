import { useEffect, useState } from 'react';
import { adminRequest } from '../services/adminApi';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

function ReportTable({ title, headers, rows, emptyMessage }) {
  return (
    <section className="report-card">
      <h2>{title}</h2>
      {rows.length === 0
        ? <EmptyState>{emptyMessage}</EmptyState>
        : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell ?? 0}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
    </section>
  );
}

function CollectionReportRow({ appointment, collectors, onSaved }) {
  const [adminNotes, setAdminNotes] = useState(appointment.adminNotes || '');
  const [assignmentType, setAssignmentType] = useState(appointment.assignedCollectorName ? 'custom' : 'collector');
  const [collectorId, setCollectorId] = useState(appointment.assignedCollector?._id || '');
  const [collectorName, setCollectorName] = useState(appointment.assignedCollectorName || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finalizeReport = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await adminRequest(`/appointments/${appointment._id}/finalize-report`, {
        method: 'PATCH',
        body: JSON.stringify({
          adminNotes,
          ...(assignmentType === 'custom' ? { collectorName } : { collectorId }),
        }),
      });
      onSaved(result.appointment);
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>{appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : '—'}</td>
      <td>
        <strong>{appointment.service || '—'}</strong>
        <div className="small text-muted">{appointment.status || 'Pendente'}</div>
      </td>
      <td>
        <dl className="small mb-0">
          <div><dt className="d-inline">Cliente: </dt><dd className="d-inline">{appointment.client?.nome || appointment.client?.email || '—'}</dd></div>
          <div><dt className="d-inline">Horário: </dt><dd className="d-inline">{appointment.time || '—'}</dd></div>
          <div><dt className="d-inline">Endereço: </dt><dd className="d-inline">{appointment.address || '—'}</dd></div>
          <div><dt className="d-inline">Quantidade: </dt><dd className="d-inline">{appointment.quantity || 1}</dd></div>
          <div><dt className="d-inline">Marca / modelo: </dt><dd className="d-inline">{[appointment.brand, appointment.model].filter(Boolean).join(' / ') || '—'}</dd></div>
          <div><dt className="d-inline">Condição: </dt><dd className="d-inline">{appointment.condition || '—'}</dd></div>
          <div><dt className="d-inline">Destino / peso: </dt><dd className="d-inline">{appointment.destination || '—'}{appointment.weightKg ? ` / ${appointment.weightKg} kg` : ''}</dd></div>
          <div><dt className="d-inline">Observação do cliente: </dt><dd className="d-inline">{appointment.notes || '—'}</dd></div>
        </dl>
      </td>
      <td>
        {appointment.reportFinalizedAt ? (
          appointment.assignedCollector?.nome || appointment.assignedCollectorName || '—'
        ) : editing ? (
          <>
            <label className="visually-hidden" htmlFor={`assignment-type-${appointment._id}`}>Tipo de responsável</label>
            <select
              id={`assignment-type-${appointment._id}`}
              className="form-select form-select-sm mb-2"
              value={assignmentType}
              onChange={(event) => setAssignmentType(event.target.value)}
            >
              <option value="collector">Coletor cadastrado</option>
              <option value="custom">Responsável personalizado</option>
            </select>
            {assignmentType === 'collector' ? (
              <>
                <label className="visually-hidden" htmlFor={`collector-${appointment._id}`}>Coletor responsável</label>
                <select
                  id={`collector-${appointment._id}`}
                  className="form-select form-select-sm"
                  value={collectorId}
                  onChange={(event) => setCollectorId(event.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um coletor</option>
                  {collectors.map((collector) => (
                    <option key={collector._id} value={collector._id}>{collector.nome}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label className="visually-hidden" htmlFor={`collector-name-${appointment._id}`}>Nome do responsável</label>
                <input
                  id={`collector-name-${appointment._id}`}
                  className="form-control form-control-sm"
                  type="text"
                  maxLength="120"
                  value={collectorName}
                  onChange={(event) => setCollectorName(event.target.value)}
                  placeholder="Nome do responsável"
                  required
                />
              </>
            )}
          </>
        ) : '—'}
      </td>
      <td>
        {appointment.reportFinalizedAt ? appointment.adminNotes || '—' : editing ? (
          <>
            <label className="visually-hidden" htmlFor={`admin-notes-${appointment._id}`}>Observação administrativa</label>
            <textarea
              id={`admin-notes-${appointment._id}`}
              className="form-control form-control-sm"
              rows="2"
              maxLength="2000"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Observação (opcional)"
            />
          </>
        ) : '—'}
      </td>
      <td>
        {appointment.reportFinalizedAt ? (
          <span className="badge text-bg-success">Relatório finalizado</span>
        ) : editing ? (
          <>
            <button
              className="btn btn-sm btn-success"
              type="button"
              disabled={saving || (assignmentType === 'collector' ? !collectorId : !collectorName.trim())}
              onClick={finalizeReport}
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
            <button className="btn btn-sm btn-outline-secondary mt-1" type="button" disabled={saving} onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="btn btn-sm btn-success" type="button" onClick={() => setEditing(true)}>
            Finalizar relatório
          </button>
        )}
        {error && <div className="small text-danger mt-1" role="alert">{error}</div>}
      </td>
    </tr>
  );
}

export default function Reports({ isAdmin }) {
  const [reports, setReports] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [appointmentSort, setAppointmentSort] = useState('date-desc');
  const [error, setError] = useState('');

  useEffect(() => {
    adminRequest('/reports')
      .then(setReports)
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([adminRequest('/appointments'), adminRequest('/collectors')])
        .then(([appointmentData, collectorData]) => {
          setAppointments(appointmentData);
          setCollectors(collectorData);
        })
        .catch((requestError) => setError(requestError.message));
    }
  }, [isAdmin]);

  const updateReportedAppointment = (updatedAppointment) => {
    setAppointments((current) => current.map((appointment) => (
      appointment._id === updatedAppointment._id
        ? { ...appointment, ...updatedAppointment }
        : appointment
    )));
  };

  const appointmentStatuses = [...new Set((appointments || []).map((appointment) => appointment.status || 'Pendente'))].sort();
  const materials = [...new Set((appointments || []).map((appointment) => appointment.service).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const organizedAppointments = (appointments || [])
    .filter((appointment) => !appointmentStatusFilter || (appointment.status || 'Pendente') === appointmentStatusFilter)
    .filter((appointment) => !materialFilter || appointment.service === materialFilter)
    .filter((appointment) => !reportStatusFilter
      || (reportStatusFilter === 'finalized' ? Boolean(appointment.reportFinalizedAt) : !appointment.reportFinalizedAt))
    .sort((a, b) => {
      if (appointmentSort === 'material') return (a.service || '').localeCompare(b.service || '', 'pt-BR');
      if (appointmentSort === 'status') return (a.status || 'Pendente').localeCompare(b.status || 'Pendente', 'pt-BR');
      const dateDifference = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      return appointmentSort === 'date-asc' ? dateDifference : -dateDifference;
    });

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Acompanhamento</p><h1>Relatórios</h1><p className="text-muted mb-0">Resumo das solicitações registradas.</p></div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {isAdmin && (
        <section className="report-card mb-4">
          <h2>Finalização dos relatórios por coleta</h2>
          {appointments === null
            ? <Loading label="Carregando coletas..." />
            : appointments.length === 0
              ? <EmptyState>Nenhuma coleta registrada.</EmptyState>
              : (
                <div className="table-responsive">
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6 col-xl-3">
                      <label className="form-label" htmlFor="report-appointment-status">Filtrar por status da coleta</label>
                      <select id="report-appointment-status" className="form-select form-select-sm" value={appointmentStatusFilter} onChange={(event) => setAppointmentStatusFilter(event.target.value)}>
                        <option value="">Todos os status</option>
                        {appointmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <label className="form-label" htmlFor="report-material">Filtrar por material</label>
                      <select id="report-material" className="form-select form-select-sm" value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)}>
                        <option value="">Todos os materiais</option>
                        {materials.map((material) => <option key={material} value={material}>{material}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <label className="form-label" htmlFor="report-finalization-status">Estado do relatório</label>
                      <select id="report-finalization-status" className="form-select form-select-sm" value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)}>
                        <option value="">Todos</option>
                        <option value="pending">Pendente</option>
                        <option value="finalized">Finalizado</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <label className="form-label" htmlFor="report-appointment-sort">Ordenar por</label>
                      <select id="report-appointment-sort" className="form-select form-select-sm" value={appointmentSort} onChange={(event) => setAppointmentSort(event.target.value)}>
                        <option value="date-desc">Data (mais recente)</option>
                        <option value="date-asc">Data (mais antiga)</option>
                        <option value="material">Material (A–Z)</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                    <div className="col-12 small text-muted align-self-end">
                      Exibindo {organizedAppointments.length} de {appointments.length} coletas
                    </div>
                  </div>
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr><th>Data / status</th><th>Material</th><th>Detalhes da coleta</th><th>Responsável</th><th>Observação administrativa</th><th>Relatório</th></tr>
                    </thead>
                    <tbody>
                      {organizedAppointments.map((appointment) => (
                        <CollectionReportRow
                          key={appointment._id}
                          appointment={appointment}
                          collectors={collectors}
                          onSaved={updateReportedAppointment}
                        />
                      ))}
                      {organizedAppointments.length === 0 && (
                        <tr><td colSpan="6"><EmptyState>Nenhuma coleta corresponde aos filtros.</EmptyState></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
        </section>
      )}
      {!reports && !error && <Loading label="Gerando relatórios..." />}
      {reports && (
        <div className="reports-grid">
          <ReportTable
            title="Por material"
            headers={['Material', 'Solicitações', 'Itens', 'Peso medido (kg)']}
            rows={(reports.porMaterial || []).map((item) => [
              item._id || 'Não informado',
              item.solicitacoes,
              item.itens,
              Number(item.pesoKg || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
            ])}
            emptyMessage="Sem dados de material."
          />
          <ReportTable
            title="Por status"
            headers={['Status', 'Solicitações']}
            rows={(reports.porStatus || []).map((item) => [item._id || 'Pendente', item.total])}
            emptyMessage="Sem dados de status."
          />
          <ReportTable
            title="Por mês"
            headers={['Mês', 'Solicitações']}
            rows={(reports.porMes || []).map((item) => [item._id || 'Não informado', item.total])}
            emptyMessage="Sem dados mensais."
          />
          <ReportTable
            title="Peso registrado por destino (kg)"
            headers={['Destino', 'Coletas', 'Peso medido (kg)']}
            rows={(reports.porDestino || []).map((item) => [item._id, item.coletas, Number(item.pesoKg || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })])}
            emptyMessage="Nenhum peso foi registrado."
          />
        </div>
      )}
      <p className="small text-muted mt-3">Os totais ambientais usam somente pesos medidos e informados pela equipe. Não são estimativas de emissão ou compensação de CO₂.</p>
    </>
  );
}
