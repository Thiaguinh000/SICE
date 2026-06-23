import { useEffect, useState } from 'react';

const CATEGORIAS_E_WASTE_MAP = {
  computadores_monitores: 'Informática/Monitores',
  celulares_tablets: 'Celulares/Tablets',
  eletrodomesticos_grandes: 'Grandes Eletrodomésticos',
  eletroportateis: 'Eletroportáteis',
  pilhas_baterias: 'Pilhas/Baterias',
  cabos_placas: 'Cabos/Placas de Circuito',
  outros: 'Outros Equipamentos'
};

export default function DashboardStaff({ onLogout }) {
  const [coletas, setColetas] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchColetas();
  }, [statusFiltro]);

  const fetchColetas = async () => {
    try {
      const url = statusFiltro 
        ? `${API_URL}/api/agendamentos?status=${statusFiltro}`
        : `${API_URL}/api/agendamentos`;
        
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        setMensagem('Erro ao buscar coletas');
        return;
      }

      const data = await response.json();
      // Sort: closest dates first
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setColetas(sorted);
    } catch (err) {
      setMensagem('Erro de conexão com o servidor');
    }
  };

  const handleUpdateStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        setColetas(coletas.map(c => c._id === id ? { ...c, status: novoStatus } : c));
      } else {
        const resData = await response.json();
        setMensagem(resData.mensagem || 'Erro ao atualizar status');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const getBairroZona = (bairro) => {
    const b = (bairro || '').toLowerCase().trim();
    if (b.includes('santana') || b.includes('tucuruvi') || b.includes('norte')) return 'Norte';
    if (b.includes('morumbi') || b.includes('santo amaro') || b.includes('sul')) return 'Sul';
    if (b.includes('tatuape') || b.includes('itaim') || b.includes('leste')) return 'Leste';
    if (b.includes('lapa') || b.includes('pinheiros') || b.includes('oeste')) return 'Oeste';
    return 'Centro / Geral';
  };

  const renderActions = (appt) => {
    switch (appt.status) {
      case 'pendente':
        return (
          <div className="d-flex gap-2 w-100 mt-2">
            <button 
              onClick={() => handleUpdateStatus(appt._id, 'confirmado')} 
              className="btn btn-sm btn-success w-50 py-2"
            >
              Confirmar Coleta
            </button>
            <button 
              onClick={() => handleUpdateStatus(appt._id, 'cancelado')} 
              className="btn btn-sm btn-outline-danger w-50 py-2"
            >
              Recusar
            </button>
          </div>
        );
      case 'confirmado':
        return (
          <button 
            onClick={() => handleUpdateStatus(appt._id, 'em_rota')} 
            className="btn btn-sm btn-info w-100 py-2 mt-2"
          >
            🚚 Iniciar Rota de Recolhimento
          </button>
        );
      case 'em_rota':
        return (
          <button 
            onClick={() => handleUpdateStatus(appt._id, 'coletado')} 
            className="btn btn-sm btn-eco-primary w-100 py-2 mt-2"
          >
            ✅ Marcar como Coletado/Triado
          </button>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pendente': return <span className="eco-badge-warning">Pendente</span>;
      case 'confirmado': return <span className="eco-badge">Confirmado</span>;
      case 'em_rota': return <span className="eco-badge-info">Em Rota</span>;
      case 'coletado': return <span className="badge bg-success">Coletado</span>;
      case 'cancelado': return <span className="eco-badge-danger">Cancelado</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div>
            <h2 className="eco-title-primary mb-0">Painel Geral de Coletas</h2>
            <p className="text-muted mb-0 small">Operações de Roteirização e Triagem de Lixo Eletrônico.</p>
          </div>
          <button onClick={onLogout} className="btn btn-outline-danger btn-sm px-3 mt-2 mt-sm-0">
            Sair (Logout)
          </button>
        </div>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 bg-light p-3 rounded border d-flex align-items-center justify-content-between flex-wrap gap-2">
          <strong>Filtro de Status:</strong>
          <div className="d-flex gap-2">
            <button onClick={() => setStatusFiltro('')} className={`btn btn-sm ${!statusFiltro ? 'btn-dark' : 'btn-outline-dark'}`}>Todas</button>
            <button onClick={() => setStatusFiltro('pendente')} className={`btn btn-sm ${statusFiltro === 'pendente' ? 'btn-warning' : 'btn-outline-warning'}`}>Pendentes</button>
            <button onClick={() => setStatusFiltro('confirmado')} className={`btn btn-sm ${statusFiltro === 'confirmado' ? 'btn-success' : 'btn-outline-success'}`}>Confirmados</button>
            <button onClick={() => setStatusFiltro('em_rota')} className={`btn btn-sm ${statusFiltro === 'em_rota' ? 'btn-info' : 'btn-outline-info'}`}>Em Rota</button>
            <button onClick={() => setStatusFiltro('coletado')} className={`btn btn-sm ${statusFiltro === 'coletado' ? 'btn-secondary' : 'btn-outline-secondary'}`}>Coletados</button>
          </div>
        </div>

        {coletas.length === 0 ? (
          <div className="alert alert-info text-center py-4">Nenhuma solicitação encontrada para o filtro selecionado.</div>
        ) : (
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {coletas.map(c => (
              <div key={c._id} className="eco-item-row border rounded p-3 mb-3 bg-white">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {renderStatusBadge(c.status)}
                      <span className="badge bg-dark">Zona {getBairroZona(c.collectionAddress?.bairro)}</span>
                      <span className="small text-muted">Solicitado por: <strong>{c.client?.nome || 'Doador'}</strong></span>
                    </div>

                    <div className="small mb-1">
                      <strong>📅 Agendado para:</strong> {new Date(c.date).toLocaleString()}
                    </div>
                    
                    <div className="small mb-1">
                      <strong>📞 Contato:</strong> {c.client?.telefone || 'Sem telefone'} | {c.client?.email}
                    </div>

                    <div className="small mb-2">
                      <strong>📍 Local:</strong> <br />
                      <span className="text-secondary">
                        {c.collectionAddress 
                          ? `${c.collectionAddress.rua}, ${c.collectionAddress.numero} - ${c.collectionAddress.bairro}, ${c.collectionAddress.cidade}/${c.collectionAddress.estado}`
                          : 'Endereço Indisponível'
                        }
                      </span>
                    </div>

                    <div className="small mb-2">
                      <strong>📦 Resíduos:</strong>
                      <ul className="my-1 ps-3 text-secondary">
                        {c.items && c.items.length > 0 ? (
                          c.items.map((it, idx) => (
                            <li key={idx}>
                              {CATEGORIAS_E_WASTE_MAP[it.category] || it.category} (x{it.quantity})
                              {it.description && ` - "${it.description}"`}
                            </li>
                          ))
                        ) : (
                          <li>{c.service || 'Sem descrição detalhada'}</li>
                        )}
                      </ul>
                    </div>

                    <div className="small mb-1">
                      <strong>⚖️ Carga estimada:</strong> <span className="badge bg-secondary text-capitalize">{c.estimatedVolume || 'leve'}</span>
                    </div>

                    {c.notes && (
                      <div className="small p-2 bg-light rounded text-muted mt-2">
                        <strong>Obs Logísticas:</strong> "{c.notes}"
                      </div>
                    )}
                  </div>
                  
                  <div className="ms-md-auto col-12 col-md-4 d-flex flex-column align-items-stretch justify-content-center">
                    {renderActions(c)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
