import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  // Buscar os agendamentos
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      // Buscar todos, e depois vamos filtrar os que não estão finalizados
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setMensagem('Ops! Não conseguimos realizar essa ação agora. Tente novamente.');
        return;
      }

      const data = await response.json();
      
      const activeStatuses = ['Pendente', 'Aguardando coleta', 'Em transporte', 'Em avaliação', 'Reciclado ou Descartado'];
      const activeData = data.filter(appt => activeStatuses.includes(appt.status));
      const sortedData = activeData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAppointments(sortedData);
    } catch (error) {
      setMensagem('Ops! Não conseguimos realizar essa ação agora. Tente novamente.');
    }
  };

  // Função para excluir
  const handleDelete = async (id) => {
    const confirm = window.confirm('Tem certeza que deseja cancelar esta coleta?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.message || 'Erro ao cancelar coleta');
        return;
      }

      setAppointments(appointments.filter((appt) => appt._id !== id));
    } catch (error) {
      setMensagem('Erro ao cancelar coleta');
    }
  };

  const handleEdit = (id) => {
    navigate(`/agendamentos/editar/${id}`);
  };

  return (
    <div
      style={{
        backgroundImage: "url('/fundodosoftware.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div
        className="card shadow p-4 bg-light"
        style={{ maxWidth: '700px', width: '100%', opacity: 0.95, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <h2 className="text-center text-warning mb-4">Coletas em Andamento</h2>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Você ainda não tem nenhuma coleta por aqui.
          </div>
        ) : (
          <div
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
            }}
          >
            <ul className="list-group">
              {appointments.map((appt) => (
                <li key={appt._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>Material:</strong> {appt.service} {appt.quantity > 1 ? `(${appt.quantity}x)` : ''} <br />
                      {(appt.brand || appt.model) && (
                        <><strong>Detalhes:</strong> {appt.brand} {appt.model} <br /></>
                      )}
                      <strong>Data e Horário:</strong> {appt.date} às {appt.time} <br />
                      <strong>Endereço:</strong> {appt.address} <br />
                      <strong>Status:</strong> <span className="badge bg-primary">{appt.status}</span> <br />
                      {appt.destination && <><strong>Destino:</strong> {appt.destination}<br /></>}
                      {appt.notes && (
                        <>
                          <strong>Observações:</strong> {appt.notes}
                        </>
                      )}
                    </div>
                    <div className="ms-3">
                      {appt.status === 'Pendente' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary me-2 mb-2 w-100"
                            onClick={() => handleEdit(appt._id)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger w-100"
                            onClick={() => handleDelete(appt._id)}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>
      </div>
    </div>
  );
}
