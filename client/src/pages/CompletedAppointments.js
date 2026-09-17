import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setMensagem('Ops! Não conseguimos realizar essa ação agora. Tente novamente.');
          return;
        }

        const data = await response.json();
        const inactiveStatuses = ['Reciclado ou Descartado', 'Finalizado'];
        const inactiveData = data.filter(appt => inactiveStatuses.includes(appt.status));
        const sortedData = inactiveData.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAppointments(sortedData);
      } catch (error) {
        setMensagem('Ops! Não conseguimos realizar essa ação agora. Tente novamente.');
      }
    };

    fetchAppointments();
  }, []);

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
        style={{ maxWidth: '600px', width: '100%', opacity: 0.95, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <h2 className="text-center text-success mb-4">Histórico de Coletas</h2>

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
              maxHeight: '400px', 
              overflowY: 'auto', 
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem'
            }}
          >
            <ul className="list-group">
              {appointments.map((appt) => (
                <li key={appt._id} className="list-group-item">
                  <strong>Material:</strong> {appt.service} {appt.quantity > 1 ? `(${appt.quantity}x)` : ''} <br />
                  <strong>Data:</strong> {new Date(appt.date).toLocaleDateString('pt-BR')} às {appt.time} <br />
                  <strong>Status final:</strong> <span className="badge bg-secondary">{appt.status}</span> <br />
                  {appt.destination && (
                    <><strong>Destino:</strong> {appt.destination}<br /></>
                  )}
                  {appt.notes && (
                    <>
                      <strong>Observações:</strong> {appt.notes}
                    </>
                  )}
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
