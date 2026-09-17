import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function parseJwt (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    return null;
  }
}

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [servico, setServico] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [condicao, setCondicao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('');
  const [destination, setDestination] = useState('');
  
  const [mensagem, setMensagem] = useState('');
  const [userRole, setUserRole] = useState('usuario');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMensagem('Sessão expirada. Faça login novamente.');
          return;
        }

        const decoded = parseJwt(token);
        if (decoded && decoded.tipo) {
          setUserRole(decoded.tipo);
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setMensagem(data.mensagem || 'Erro ao buscar coleta');
          return;
        }

        setServico(data.service || '');
        setMarca(data.brand || '');
        setModelo(data.model || '');
        setQuantidade(data.quantity || 1);
        setCondicao(data.condition || '');
        setEndereco(data.address || '');
        setData(data.date ? new Date(data.date).toISOString().slice(0, 10) : '');
        setHora(data.time || '');
        setObservacoes(data.notes || '');
        setStatus(data.status || 'Pendente');
        setDestination(data.destination || '');
      } catch (error) {
        setMensagem('Erro na conexão com o servidor');
      }
    };

    fetchAppointment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const token = localStorage.getItem('token');

      const bodyData = {
        service: servico,
        brand: marca,
        model: modelo,
        quantity: quantidade,
        condition: condicao,
        address: endereco,
        date: data,
        time: hora,
        notes: observacoes,
      };

      if (userRole === 'admin' || userRole === 'coletor') {
        bodyData.status = status;
        bodyData.destination = destination;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.mensagem || 'Ops! Não conseguimos atualizar. Tente novamente.');
        return;
      }

      navigate('/agendamentos/pendentes');
    } catch (error) {
      setMensagem('Ops! Não conseguimos conectar com o servidor.');
    }
  };

  const isAdminOrCollector = userRole === 'admin' || userRole === 'coletor';

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
      <div className="card shadow p-4 bg-light my-5" style={{ maxWidth: '600px', width: '100%', opacity: 0.95, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h2 className="text-center text-primary mb-4">Editar Coleta</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('Erro') || mensagem.includes('Ops') ? 'alert-danger' : 'alert-success'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Material:</label>
            <select className="form-control" value={servico} onChange={(e) => setServico(e.target.value)} required>
              <option value="">Selecione o material</option>
              <option value="Celular">Celular</option>
              <option value="Computador">Computador</option>
              <option value="Notebook">Notebook</option>
              <option value="Tablet">Tablet</option>
              <option value="Monitor">Monitor</option>
              <option value="Televisão">Televisão</option>
              <option value="Impressora">Impressora</option>
              <option value="Teclado/Mouse">Teclado/Mouse</option>
              <option value="Cabos/Carregadores">Cabos/Carregadores</option>
              <option value="Roteador">Roteador</option>
              <option value="Pilha/Bateria">Pilha/Bateria</option>
              <option value="Lâmpada">Lâmpada</option>
              <option value="Placa Eletrônica">Placa Eletrônica</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Marca (opcional):</label>
              <input type="text" className="form-control" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div className="col">
              <label className="form-label">Modelo (opcional):</label>
              <input type="text" className="form-control" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Quantidade:</label>
              <input type="number" className="form-control" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} min="1" required />
            </div>
            <div className="col">
              <label className="form-label">Condição:</label>
              <select className="form-control" value={condicao} onChange={(e) => setCondicao(e.target.value)} required>
                <option value="">Condição</option>
                <option value="Funcionando">Funcionando</option>
                <option value="Com defeito">Com defeito</option>
                <option value="Quebrado">Quebrado</option>
                <option value="Faltando peças">Faltando peças</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Endereço:</label>
            <input type="text" className="form-control" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Data:</label>
              <input type="date" className="form-control" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="col">
              <label className="form-label">Hora:</label>
              <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>

          {isAdminOrCollector && (
            <>
              <hr/>
              <h5 className="text-secondary mt-3">Área Administrativa</h5>
              <div className="mb-3">
                <label className="form-label">Status da Coleta:</label>
                <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pendente">Pendente</option>
                  <option value="Aguardando coleta">Aguardando coleta</option>
                  <option value="Em transporte">Em transporte</option>
                  <option value="Em avaliação">Em avaliação</option>
                  <option value="Reciclado ou Descartado">Reciclado ou Descartado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Destino / Avaliação:</label>
                <input type="text" className="form-control" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: Doação, Reciclagem de Metais..." />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="form-label">Observações:</label>
            <textarea
              className="form-control"
              rows="2"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Salvar Alterações
          </button>
        </form>

        <Link to="/agendamentos/pendentes" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>
      </div>
    </div>
  );
}
