import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORIAS_E_WASTE = [
  { id: 'computadores_monitores', name: 'Computadores e Monitores', desc: 'CPUs, notebooks, monitores CRT/LCD, impressoras, mouses, teclados' },
  { id: 'celulares_tablets', name: 'Celulares e Tablets', desc: 'Smartphones, tablets, carregadores, fones de ouvido' },
  { id: 'eletrodomesticos_grandes', name: 'Grandes Eletrodomésticos', desc: 'Micro-ondas, fornos, geladeiras, máquinas de lavar' },
  { id: 'eletroportateis', name: 'Eletroportáteis em Geral', desc: 'Liquidificadores, batedeiras, ventiladores, secadores' },
  { id: 'pilhas_baterias', name: 'Pilhas e Baterias', desc: 'Pilhas comuns, recarregáveis e baterias pequenas' },
  { id: 'cabos_placas', name: 'Cabos e Placas de Circuito', desc: 'Fios elétricos, cabos de rede, placas-mãe antigas' },
  { id: 'outros', name: 'Outros Equipamentos', desc: 'Lâmpadas LED, aparelhos de som, DVDs, telefones fixos' }
];

export default function NewAppointment() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [mensagem, setMensagem] = useState('');
  
  // Wizard Steps: 1 = Itens, 2 = Local, 3 = Agendamento
  const [step, setStep] = useState(1);

  // Step 1 states (Items)
  const [items, setItems] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('computadores_monitores');
  const [currentQty, setCurrentQty] = useState(1);
  const [currentDesc, setCurrentDesc] = useState('');
  const [estimatedVolume, setEstimatedVolume] = useState('leve');

  // Step 2 states (Address)
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Step 3 states (Date and Notes)
  const [dataColeta, setDataColeta] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [zonaInfo, setZonaInfo] = useState({ name: 'Zona Centro / Geral', day: 5, dayName: 'Sexta-feira' });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';
  const token = localStorage.getItem('token');

  // Fetch user profile on load to set up default address
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const uData = await response.json();
          setPerfil(uData);
          if (uData.endereco) {
            setCep(uData.endereco.cep || '');
            setRua(uData.endereco.rua || '');
            setNumero(uData.endereco.numero || '');
            setComplemento(uData.endereco.complemento || '');
            setBairro(uData.endereco.bairro || '');
            setCidade(uData.endereco.cidade || '');
            setEstado(uData.endereco.estado || '');
            
            // Calculate zone for profile address
            updateZone(uData.endereco.bairro);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar perfil do usuário', err);
      }
    };
    fetchProfile();
  }, [token, API_URL]);

  // Helper to map neighborhood to a weekday zone
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

  const handleCepChange = async (cepVal) => {
    setCep(cepVal);
    const cleanCep = cepVal.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setRua(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
          updateZone(data.bairro);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleToggleAddress = (e) => {
    const checked = e.target.checked;
    setUseProfileAddress(checked);
    if (checked && perfil && perfil.endereco) {
      setCep(perfil.endereco.cep || '');
      setRua(perfil.endereco.rua || '');
      setNumero(perfil.endereco.numero || '');
      setComplemento(perfil.endereco.complemento || '');
      setBairro(perfil.endereco.bairro || '');
      setCidade(perfil.endereco.cidade || '');
      setEstado(perfil.endereco.estado || '');
      updateZone(perfil.endereco.bairro);
    } else if (!checked) {
      setCep(''); setRua(''); setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setEstado('');
    }
  };

  // Add items list helper
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentCategory) return;
    const itemCat = CATEGORIAS_E_WASTE.find(c => c.id === currentCategory);
    const newItem = {
      category: currentCategory,
      categoryName: itemCat.name,
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
    setDataColeta(dateStr);
    setMensagem('');

    if (!dateStr) return;

    const selectedDate = new Date(dateStr);
    const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Validate weekday matches the zone weekday
    if (dayOfWeek !== zonaInfo.day) {
      setMensagem(`Aviso: As coletas na sua região (${zonaInfo.name}) são realizadas apenas nas ${zonaInfo.dayName}s. Por favor, ajuste o dia no calendário.`);
    }
  };

  const handleAgendar = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (items.length === 0) {
      return setMensagem('Por favor, adicione pelo menos um item para descarte.');
    }

    if (!dataColeta) {
      return setMensagem('Por favor, selecione uma data e horário.');
    }

    const selectedDate = new Date(dataColeta);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek !== zonaInfo.day) {
      return setMensagem(`Apenas coletas agendadas para ${zonaInfo.dayName} são permitidas para o seu bairro (${bairro}).`);
    }

    try {
      const response = await fetch(`${API_URL}/api/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dataColeta,
          items: items.map(i => ({ category: i.category, quantity: i.quantity, description: i.description })),
          estimatedVolume,
          collectionAddress: {
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado
          },
          notes: observacoes
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        return setMensagem(resData.message || 'Erro ao agendar coleta');
      }

      navigate('/agendamentos/pendentes');
    } catch (err) {
      console.error(err);
      setMensagem('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <h2 className="text-center eco-title-primary">Agendar Descarte Ecológico</h2>
        
        {/* Step Indicator */}
        <div className="d-flex justify-content-between mb-4">
          <span className={`badge ${step === 1 ? 'bg-success' : 'bg-secondary'} p-2`}>1. Materiais</span>
          <span className={`badge ${step === 2 ? 'bg-success' : 'bg-secondary'} p-2`}>2. Endereço</span>
          <span className={`badge ${step === 3 ? 'bg-success' : 'bg-secondary'} p-2`}>3. Data e Hora</span>
        </div>

        {mensagem && (
          <div className={`alert ${mensagem.includes('Aviso') || mensagem.includes('Atenção') ? 'alert-warning' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        {/* STEP 1: RESÍDUOS A SEREM COLETADOS */}
        {step === 1 && (
          <div>
            <h5 className="eco-title-accent mb-3">Quais equipamentos você quer descartar?</h5>
            
            <form onSubmit={handleAddItem} className="bg-light p-3 rounded mb-3 border">
              <div className="mb-3">
                <label className="form-label">Categoria de Equipamento</label>
                <select 
                  className="form-select"
                  value={currentCategory} 
                  onChange={(e) => setCurrentCategory(e.target.value)}
                >
                  {CATEGORIAS_E_WASTE.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <small className="text-muted mt-1 d-block">
                  {CATEGORIAS_E_WASTE.find(c => c.id === currentCategory)?.desc}
                </small>
              </div>

              <div className="row">
                <div className="col-4 mb-3">
                  <label className="form-label">Quantidade</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1" 
                    value={currentQty} 
                    onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="col-8 mb-3">
                  <label className="form-label">Modelo/Estado (Opcional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Marca LG, monitor de tubo com tela trincada" 
                    value={currentDesc} 
                    onChange={(e) => setCurrentDesc(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-success w-100 btn-sm">
                + Adicionar este Item à Coleta
              </button>
            </form>

            <h5 className="eco-title-accent mt-4">Itens Selecionados ({items.length})</h5>
            {items.length === 0 ? (
              <div className="alert alert-info text-center">Nenhum item adicionado ainda. Escolha no formulário acima.</div>
            ) : (
              <div className="list-group mb-4" style={{maxHeight: '200px', overflowY: 'auto'}}>
                {items.map((item, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.categoryName}</strong> x {item.quantity}
                      {item.description && <div className="small text-muted">{item.description}</div>}
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(index)} 
                      className="btn-eco-danger btn btn-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="form-label">Volume Estimado Total da Coleta</label>
              <select 
                className="form-select"
                value={estimatedVolume}
                onChange={(e) => setEstimatedVolume(e.target.value)}
              >
                <option value="leve">Leve (Sacolas / Caixas pequenas - Transporte fácil)</option>
                <option value="medio">Médio (Cabe no porta-malas de um carro comum)</option>
                <option value="pesado">Pesado / Grande (Exige caminhonete ou logística especial)</option>
              </select>
            </div>

            <button 
              disabled={items.length === 0} 
              onClick={() => setStep(2)} 
              className="btn-eco-primary w-100"
            >
              Continuar para Endereço
            </button>
          </div>
        )}

        {/* STEP 2: ENDEREÇO DE COLETA */}
        {step === 2 && (
          <div>
            <h5 className="eco-title-accent mb-3">Onde faremos o recolhimento?</h5>
            
            {perfil?.endereco && (
              <div className="form-check mb-4 bg-light p-3 border rounded">
                <input 
                  type="checkbox" 
                  className="form-check-input ms-0 me-2" 
                  id="chkUseProfile"
                  checked={useProfileAddress}
                  onChange={handleToggleAddress}
                />
                <label className="form-check-label ps-1" htmlFor="chkUseProfile">
                  Usar o endereço do meu perfil: <br/>
                  <small className="text-muted">
                    {perfil.endereco.rua}, {perfil.endereco.numero} - {perfil.endereco.bairro}, {perfil.endereco.cidade}/{perfil.endereco.estado}
                  </small>
                </label>
              </div>
            )}

            <div className="row">
              <div className="col-4 mb-3">
                <label className="form-label">CEP</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="col-8 mb-3">
                <label className="form-label">Rua/Logradouro</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
            </div>

            <div className="row">
              <div className="col-4 mb-3">
                <label className="form-label">Número</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div className="col-8 mb-3">
                <label className="form-label">Complemento</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, Sala, Bloco..."
                />
              </div>
            </div>

            <div className="row">
              <div className="col-5 mb-3">
                <label className="form-label">Bairro</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div className="col-5 mb-3">
                <label className="form-label">Cidade</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="col-2 mb-3">
                <label className="form-label">UF</label>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled={useProfileAddress}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="SP"
                  maxLength="2"
                />
              </div>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-eco-secondary w-50">Voltar</button>
              <button 
                onClick={() => setStep(3)} 
                className="btn-eco-primary w-50"
                disabled={!cep || !rua || !numero || !bairro}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATA, ZONEAMENTO E CONFIRMAÇÃO */}
        {step === 3 && (
          <div>
            <h5 className="eco-title-accent mb-2">Agendamento de Logística</h5>
            
            <div className="alert alert-success border-success bg-opacity-10 py-3 mb-4">
              <strong>Regra de Logística Ecológica:</strong><br/>
              Para o bairro <strong>{bairro}</strong>, a equipe atende a <strong>{zonaInfo.name}</strong>.<br/>
              📅 Coletas são realizadas apenas nas <strong>{zonaInfo.dayName}s</strong>.
            </div>

            <div className="mb-3">
              <label className="form-label">Escolha um(a) {zonaInfo.dayName}</label>
              <input 
                type="datetime-local" 
                className="form-control"
                value={dataColeta}
                onChange={handleDateChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Observações Logísticas (Opcional)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Ex: Interfone não funciona, avisar no portão, caixa pesada na garagem" 
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <div className="d-flex gap-3">
              <button onClick={() => setStep(2)} className="btn-eco-secondary w-50">Voltar</button>
              <button 
                onClick={handleAgendar} 
                className="btn-eco-primary w-50"
                disabled={!dataColeta}
              >
                Agendar Coleta
              </button>
            </div>
          </div>
        )}

        <Link to="/" className="btn-eco-secondary w-100 mt-4">
          Cancelar e Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
