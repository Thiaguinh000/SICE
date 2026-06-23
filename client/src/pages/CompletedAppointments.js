import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIAS_E_WASTE_MAP = {
  computadores_monitores: 'Computadores e Monitores',
  celulares_tablets: 'Celulares e Tablets',
  eletrodomesticos_grandes: 'Grandes Eletrodomésticos',
  eletroportateis: 'Eletroportáteis',
  pilhas_baterias: 'Pilhas e Baterias',
  cabos_placas: 'Cabos e Placas de Circuito',
  outros: 'Outros Equipamentos'
};

export default function CompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agendamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setMensagem('Erro ao buscar histórico de coletas');
          return;
        }

        const data = await response.json();
        
        // Filtra coletas finalizadas ('coletado') ou canceladas
        const finalizadas = data.filter(appt => appt.status === 'coletado' || appt.status === 'cancelado');
        const sortedData = finalizadas.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAppointments(sortedData);
      } catch (error) {
        setMensagem('Erro ao conectar com o servidor');
      }
    };

    fetchAppointments();
  }, [token, API_URL]);

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <h2 className="text-center eco-title-primary">Histórico de Descartes</h2>
        <p className="text-center text-muted mb-4">Veja o registro de todas as suas coletas finalizadas ou canceladas no sistema.</p>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Você ainda não possui nenhum descarte concluído em seu histórico.
          </div>
        ) : (
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="eco-item-row border rounded p-3 mb-3 bg-white">
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <div className="mb-2">
                      {appt.status === 'coletado' ? (
                        <span className="eco-badge">♻️ Coleta Realizada</span>
                      ) : (
                        <span className="eco-badge-danger">❌ Cancelado</span>
                      )}
                      <span className="ms-2 small text-muted">Finalizado em: {new Date(appt.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="mb-2">
                      <strong>📅 Data Realizada:</strong> {new Date(appt.date).toLocaleString()}
                    </div>

                    <div className="mb-2">
                      <strong>📍 Local de Coleta:</strong> <br />
                      <span className="small text-secondary">
                        {appt.collectionAddress ? (
                          `${appt.collectionAddress.rua}, ${appt.collectionAddress.numero} - ${appt.collectionAddress.bairro}, ${appt.collectionAddress.cidade}/${appt.collectionAddress.estado}`
                        ) : (
                          "Endereço não cadastrado"
                        )}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong>📦 Equipamentos Descartados:</strong>
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

                    <div>
                      <strong>⚖️ Volume total:</strong> <span className="badge bg-secondary text-capitalize">{appt.estimatedVolume || 'leve'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Link to="/" className="btn-eco-secondary w-100 mt-4">
          Voltar ao Menu Principal
        </Link>
      </div>
    </div>
  );
}
