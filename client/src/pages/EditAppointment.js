import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const CATEGORIAS_E_WASTE = [
  { id: 'computadores_monitores', name: 'Computadores e Monitores' },
  { id: 'celulares_tablets', name: 'Celulares e Tablets' },
  { id: 'eletrodomesticos_grandes', name: 'Grandes Eletrodomésticos' },
  { id: 'eletroportateis', name: 'Eletroportáteis em Geral' },
  { id: 'pilhas_baterias', name: 'Pilhas e Baterias' },
  { id: 'cabos_placas', name: 'Cabos e Placas de Circuito' },
  { id: 'outros', name: 'Outros Equipamentos' }
];

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [data, setData] = useState('');
  const [estimatedVolume, setEstimatedVolume] = useState('leve');
  const [observacoes, setObservacoes] = useState('');
  const [bairro, setBairro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [zonaInfo, setZonaInfo] = useState({ name: 'Zona Centro / Geral', day: 5, dayName: 'Sexta-feira' });

  // Fields for adding new items
  const [currentCategory, setCurrentCategory] = useState('computadores_monitores');
  const [currentQty, setCurrentQty] = useState(1);
  const [currentDesc, setCurrentDesc] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agendamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setMensagem(data.mensagem || 'Erro ao buscar agendamento');
          return;
        }

        setItems(data.items || []);
        setEstimatedVolume(data.estimatedVolume || 'leve');
        setObservacoes(data.notes || '');
        if (data.collectionAddress) {
          setBairro(data.collectionAddress.bairro || '');
          updateZone(data.collectionAddress.bairro || '');
        }

        // Adjust date timezone for local datetime-local input
        const localDate = new Date(data.date);
        const offset = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
        setData(adjustedDate.toISOString().slice(0, 16));
      } catch (error) {
        setMensagem('Erro na conexão com o servidor');
      }
    };

    fetchAppointment();
  }, [id, API_URL, token]);

  const updateZone = (bairroName) => {
    const b = (bairroName || '').toLowerCase().trim();
    let z = { name: 'Zona Centro / Geral', day: 5, dayName: 'Sexta-feira' };
    if (b.includes('santana') || b.includes('tucuruvi') || b.includes('norte')) {
      z = { name: 'Zona Norte', day: 1, dayName: 'Segunda-feira' };
    } else if (b.includes('morumbi') || b.includes('santo amaro') || b.includes('sul')) {
      z = { name: 'Zona Sul', day: 2, dayName: 'Terça-feira' };
    } else if (b.includes('tatuape') || b.includes('itaim') || b.includes('leste')) {
      z = { name: 'Zona Leste', day: 3, dayName: 'Quarta-feira' };
    } else if (b.includes('lapa') || b.includes('pinheiros') || b.includes('oeste')) {
      z = { name: 'Zona Oeste', day: 4, dayName: 'Quinta-feira' };
    }
    setZonaInfo(z);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const itemCat = CATEGORIAS_E_WASTE.find(c => c.id === currentCategory);
    const newItem = {
      category: currentCategory,
      quantity: Number(currentQty),
      description: currentDesc
    };
    setItems([...items, newItem]);
    setCurrentQty(1);
    setCurrentDesc('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setData(dateStr);
    setMensagem('');

    if (!dateStr) return;

    const selectedDate = new Date(dateStr);
    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek !== zonaInfo.day) {
      setMensagem(`Aviso: As coletas na sua região (${zonaInfo.name}) acontecem apenas nas ${zonaInfo.dayName}s.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (items.length === 0) {
      return setMensagem('Adicione pelo menos um item para coleta.');
    }

    const selectedDate = new Date(data);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek !== zonaInfo.day) {
      return setMensagem(`Apenas coletas agendadas para ${zonaInfo.dayName} são permitidas para o seu bairro (${bairro}).`);
    }

    try {
      const response = await fetch(`${API_URL}/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: data,
          items,
          estimatedVolume,
          notes: observacoes,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.mensagem || 'Erro ao atualizar');
        return;
      }

      navigate('/agendamentos/pendentes');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <h2 className="text-center eco-title-primary">Editar Agendamento de Coleta</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('Aviso') ? 'alert-warning' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Items Section */}
          <h5 className="eco-title-accent mb-3">Equipamentos para Descarte</h5>
          <div className="bg-light p-3 rounded mb-3 border">
            <div className="row g-2">
              <div className="col-md-5">
                <select 
                  className="form-select"
                  value={currentCategory} 
                  onChange={(e) => setCurrentCategory(e.target.value)}
                >
                  {CATEGORIAS_E_WASTE.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  value={currentQty} 
                  placeholder="Qtd"
                  onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="col-md-5">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Modelo / Estado (Opcional)" 
                  value={currentDesc} 
                  onChange={(e) => setCurrentDesc(e.target.value)}
                />
              </div>
            </div>
            <button type="button" onClick={handleAddItem} className="btn btn-outline-success btn-sm w-100 mt-2">
              + Adicionar Item
            </button>
          </div>

          <div className="list-group mb-4" style={{maxHeight: '150px', overflowY: 'auto'}}>
            {items.map((item, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-2">
                <span className="small">
                  <strong>{CATEGORIAS_E_WASTE.find(c => c.id === item.category)?.name || item.category}</strong> (x{item.quantity})
                  {item.description && ` - ${item.description}`}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(index)} 
                  className="btn-eco-danger btn btn-sm py-1"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          {/* Logistics and Date Section */}
          <div className="alert alert-success bg-opacity-10 py-2 mb-3">
            📍 Região: <strong>{bairro}</strong> (Atendimento: <strong>{zonaInfo.dayName}s</strong>)
          </div>

          <div className="mb-3">
            <label className="form-label">Data e Hora da Coleta (deve ser {zonaInfo.dayName})</label>
            <input
              type="datetime-local"
              className="form-control"
              value={data}
              onChange={handleDateChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Volume total estimado</label>
            <select 
              className="form-select"
              value={estimatedVolume}
              onChange={(e) => setEstimatedVolume(e.target.value)}
            >
              <option value="leve">Leve (Sacolas / Caixas pequenas)</option>
              <option value="medio">Médio (Porta-malas de carro comum)</option>
              <option value="pesado">Pesado (Exige caminhonete ou logística especial)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Observações</label>
            <textarea
              className="form-control"
              rows="3"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div className="d-flex gap-3">
            <Link to="/agendamentos/pendentes" className="btn-eco-secondary w-50">
              Cancelar
            </Link>
            <button type="submit" className="btn-eco-primary w-50">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
