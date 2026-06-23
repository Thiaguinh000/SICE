import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIAS_E_WASTE_MAP = {
  computadores_monitores: 'Computadores e Monitores',
  celulares_tablets: 'Celulares e Tablets',
  eletrodomesticos_grandes: 'Grandes Eletrodomésticos',
  eletroportateis: 'Eletroportáteis',
  pilhas_baterias: 'Pilhas e Baterias',
  cabos_placas: 'Cabos e Placas de Circuito',
  outros: 'Outros Equipamentos'
};

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';
  const token = localStorage.getItem('token');

  // Buscar os agendamentos pendentes ou confirmados/em rota (tudo exceto coletado/cancelado)
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setMensagem('Erro ao buscar coletas ativas');
        return;
      }

      const data = await response.json();
      
      // Filtra coletas que NÃO foram concluídas ('coletado') nem canceladas
      const ativas = data.filter(appt => appt.status !== 'coletado' && appt.status !== 'cancelado');
      const sortedData = ativas.sort((a, b) => new Date(a.date) - new Date(b.date));

      setAppointments(sortedData);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Tem certeza que deseja cancelar esta solicitação de coleta?');
    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.mensagem || 'Erro ao cancelar coleta');
        return;
      }

      setAppointments(appointments.filter((appt) => appt._id !== id));
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (id) => {
    navigate(`/agendamentos/editar/${id}`);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pendente': return <span className="eco-badge-warning">Aguardando Confirmação</span>;
      case 'confirmado': return <span className="eco-badge">Agendado / Confirmado</span>;
      case 'em_rota': return <span className="eco-badge-info">Caminhão em Rota</span>;
      default: return <span className="eco-badge-info">{status}</span>;
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <h2 className="text-center eco-title-primary">Coletas de Descarte Ativas</h2>
        <p className="text-center text-muted mb-4">Acompanhe o andamento das suas coletas agendadas ou cancele se necessário.</p>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Você não possui nenhuma solicitação de coleta ativa no momento.
          </div>
        ) : (
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="eco-item-row border rounded p-3 mb-3 bg-white">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <div className="mb-2">
                      {renderStatusBadge(appt.status)}
                      <span className="ms-2 small text-muted">Solicitado em: {new Date(appt.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="mb-2">
                      <strong>📅 Data Agendada:</strong> {new Date(appt.date).toLocaleString()}
                    </div>

                    <div className="mb-2">
                      <strong>📍 Endereço de Coleta:</strong> <br />
                      <span className="small text-secondary">
                        {appt.collectionAddress ? (
                          `${appt.collectionAddress.rua}, ${appt.collectionAddress.numero} ${appt.collectionAddress.complemento || ''} - ${appt.collectionAddress.bairro}, ${appt.collectionAddress.cidade}/${appt.collectionAddress.estado}`
                        ) : (
                          "Endereço não cadastrado"
                        )}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong>📦 Equipamentos para Coleta:</strong>
                      <ul className="my-1 ps-3 small text-secondary">
                        {appt.items && appt.items.length > 0 ? (
                          appt.items.map((i, idx) => (
                            <li key={idx}>
                              {CATEGORIAS_E_WASTE_MAP[i.category] || i.category} (x{i.quantity})
                              {i.description && ` - ${i.description}`}
                            </li>
                          ))
                        ) : (
                          <li>{appt.service || "Nenhum item discriminado"}</li>
                        )}
                      </ul>
                    </div>

                    <div className="mb-1">
                      <strong>⚖️ Volume total estimado:</strong> <span className="badge bg-secondary text-capitalize">{appt.estimatedVolume || 'leve'}</span>
                    </div>

                    {appt.notes && (
                      <div className="small mt-2 p-2 bg-light rounded text-muted">
                        <strong>Obs:</strong> {appt.notes}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-2 ms-auto mt-2 mt-md-0">
                    {appt.status === 'pendente' && (
                      <button
                        className="btn-eco-secondary btn btn-sm py-2"
                        onClick={() => handleEdit(appt._id)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="btn-eco-danger btn btn-sm py-2"
                      onClick={() => handleDelete(appt._id)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex gap-3 mt-4">
          <Link to="/agendar" className="btn-eco-primary w-50">Solicitar Nova Coleta</Link>
          <Link to="/" className="btn-eco-secondary w-50">Voltar ao Menu</Link>
        </div>
      </div>
    </div>
  );
}
