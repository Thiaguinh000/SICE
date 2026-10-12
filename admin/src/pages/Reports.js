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

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminRequest('/reports')
      .then(setReports)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Acompanhamento</p><h1>Relatórios</h1><p className="text-muted mb-0">Resumo das solicitações registradas.</p></div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {!reports && !error && <Loading label="Gerando relatórios..." />}
      {reports && (
        <div className="reports-grid">
          <ReportTable
            title="Por material"
            headers={['Material', 'Solicitações', 'Itens']}
            rows={(reports.porMaterial || []).map((item) => [item._id || 'Não informado', item.solicitacoes, item.itens])}
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
        </div>
      )}
    </>
  );
}
