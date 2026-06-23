import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          tipo: 'cliente',
          telefone,
          endereco: {
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setMensagem(data.mensagem || 'Erro ao registrar');
      }

      setMensagem('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <h2 className="text-center eco-title-primary">Criar Conta EcoColeta</h2>
        <p className="text-center text-muted mb-4">Cadastre-se para começar a descartar seu lixo eletrônico de forma correta.</p>

        {mensagem && (
          <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Nome Completo</label>
              <input
                type="text"
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Seu nome"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-control"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                placeholder="(00) 99999-9999"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <hr className="my-4" />
          <h5 className="eco-title-accent mb-3">Endereço Residencial</h5>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">CEP</label>
              <input
                type="text"
                className="form-control"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                required
                placeholder="00000-000"
              />
            </div>

            <div className="col-md-8 mb-3">
              <label className="form-label">Logradouro (Rua/Avenida)</label>
              <input
                type="text"
                className="form-control"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                required
                placeholder="Nome da rua"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Número</label>
              <input
                type="text"
                className="form-control"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                placeholder="Nº"
              />
            </div>

            <div className="col-md-8 mb-3">
              <label className="form-label">Complemento (Opcional)</label>
              <input
                type="text"
                className="form-control"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto, Bloco, Casa..."
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-5 mb-3">
              <label className="form-label">Bairro</label>
              <input
                type="text"
                className="form-control"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
                placeholder="Bairro"
              />
            </div>

            <div className="col-md-5 mb-3">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-control"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
                placeholder="Cidade"
              />
            </div>

            <div className="col-md-2 mb-4">
              <label className="form-label">UF</label>
              <input
                type="text"
                className="form-control"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
                maxLength="2"
                placeholder="SP"
              />
            </div>
          </div>

          <button type="submit" className="btn-eco-primary w-100 mt-2">
            Registrar e Entrar
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted">Já tem uma conta? </span>
          <Link to="/login" className="text-decoration-none eco-title-accent font-weight-bold">Faça Login</Link>
        </div>
      </div>
    </div>
  );
}
