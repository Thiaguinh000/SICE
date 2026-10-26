import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function NewAppointment() {
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

  const navigate = useNavigate();

  const handleAgendar = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: servico,
          brand: marca,
          model: modelo,
          quantity: quantidade,
          condition: condicao,
          address: endereco,
          date: data,
          time: hora,
          notes: observacoes,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return setMensagem(resData.mensagem || resData.message || 'Ops! Não conseguimos realizar essa ação agora. Tente novamente.');
      }

      setMensagem('Coleta solicitada! Vamos cuidar do restante.');

      setServico('');
      setMarca('');
      setModelo('');
      setQuantidade(1);
      setCondicao('');
      setEndereco('');
      setData('');
      setHora('');
      setObservacoes('');

      setTimeout(() => navigate('/agendamentos/pendentes'), 2000);

    } catch (err) {
      console.error(err);
      setMensagem('Ops! Não conseguimos realizar essa ação agora. Tente novamente depois.');
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
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '600px', width: '100%', opacity: 0.95, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h2 className="text-center text-success mb-4">Solicitar Coleta</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('solicitada') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleAgendar}>
          <h5 className="text-secondary mt-3">Qual eletrônico você quer descartar?</h5>
          <div className="mb-3">
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

          <h5 className="text-secondary mt-3">Conte um pouco mais sobre ele.</h5>
          <div className="row mb-3">
            <div className="col">
              <input type="text" className="form-control" placeholder="Marca (opcional)" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div className="col">
              <input type="text" className="form-control" placeholder="Modelo (opcional)" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <input type="number" className="form-control" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} min="1" required />
            </div>
            <div className="col">
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
            <textarea className="form-control" rows="2" placeholder="Observações adicionais..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          <h5 className="text-secondary mt-3">Em qual endereço devemos buscar?</h5>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Rua, Número, Bairro, Cidade, CEP" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          </div>

          <h5 className="text-secondary mt-3">Quando podemos passar aí?</h5>
          <div className="row mb-4">
            <div className="col">
              <input type="date" className="form-control" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="col">
              <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 mb-2">
            Solicitar coleta
          </button>
        </form>

        <Link to="/" className="btn btn-secondary w-100">
          Voltar
        </Link>
      </div>
    </div>
  );
}
