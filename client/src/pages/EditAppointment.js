import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiRequest, getMinimumTime, getTodayDate } from '../services/api';

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
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await apiRequest(`/api/agendamentos/${id}`);

        setServico(data.service || '');
        setMarca(data.brand || '');
        setModelo(data.model || '');
        setQuantidade(data.quantity || 1);
        setCondicao(data.condition || '');
        setEndereco(data.address || '');
        setData(data.date ? new Date(data.date).toISOString().slice(0, 10) : '');
        setHora(data.time || '');
        setObservacoes(data.notes || '');
      } catch (error) {
        setMensagem(error.message || 'Erro na conexão com o servidor');
      }
    };

    fetchAppointment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
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

      await apiRequest(`/api/agendamentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bodyData),
      });

      navigate('/agendamentos/pendentes');
    } catch (error) {
      setMensagem(error.message || 'Ops! Não conseguimos conectar com o servidor.');
    }
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
              <input type="date" className="form-control" min={getTodayDate()} value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="col">
              <label className="form-label">Hora:</label>
              <input type="time" className="form-control" min={getMinimumTime(data)} value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>

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
