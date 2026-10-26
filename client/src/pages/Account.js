import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Account({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const navigate = useNavigate();
  const pageBackground = {
    backgroundImage: "url('/fundodosoftware.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem || 'Não foi possível carregar sua conta.');
        setProfile(data);
        setNome(data.nome);
        setEmail(data.email);
      } catch (error) {
        setErro(error.message || 'Erro na conexão com o servidor.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, []);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMensagem('');
    setErro('');
    if (Boolean(senhaAtual) !== Boolean(novaSenha)) {
      setErro('Para trocar a senha, informe a senha atual e a nova senha.');
      return;
    }

    setSalvando(true);
    try {
      const body = { nome, email };
      if (senhaAtual && novaSenha) {
        body.senhaAtual = senhaAtual;
        body.novaSenha = novaSenha;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem || 'Não foi possível salvar suas alterações.');
      setProfile(data.usuario);
      setNome(data.usuario.nome);
      setEmail(data.usuario.email);
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem(data.mensagem);
    } catch (error) {
      setErro(error.message || 'Erro na conexão com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    setMensagem('');
    setErro('');
    if (!window.confirm('Excluir sua conta permanentemente? O histórico de coletas será mantido sem seus dados pessoais.')) return;

    setExcluindo(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ senha: senhaExclusao }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem || 'Não foi possível excluir sua conta.');
      onLogout();
      navigate('/login', { replace: true, state: { mensagem: data.mensagem } });
    } catch (error) {
      setErro(error.message || 'Erro na conexão com o servidor.');
    } finally {
      setExcluindo(false);
    }
  };

  const handleSwitchAccount = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  if (carregando) {
    return <main className="eco-layout" style={pageBackground}><div className="eco-card"><p role="status">Carregando sua conta...</p></div></main>;
  }

  return (
    <main className="eco-layout" style={pageBackground}>
      <section className="eco-card eco-card-large">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="eco-title-primary mb-1">Minha conta</h1>
            <p className="text-muted mb-0">Gerencie seus dados e o acesso à sua conta.</p>
          </div>
          <Link className="btn-eco-secondary" to="/">Voltar</Link>
        </div>

        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        {mensagem && <div className="alert alert-success" role="status">{mensagem}</div>}

        {profile && (
          <>
            <form onSubmit={handleUpdate}>
              <h2 className="h5 eco-title-accent">Informações pessoais</h2>
              <label className="form-label" htmlFor="account-name">Nome</label>
              <input id="account-name" className="form-control mb-3" value={nome} onChange={(event) => setNome(event.target.value)} required />
              <label className="form-label" htmlFor="account-email">E-mail</label>
              <input id="account-email" className="form-control mb-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

              <h2 className="h5 eco-title-accent">Alterar senha <small className="text-muted fw-normal">(opcional)</small></h2>
              <label className="form-label" htmlFor="current-password">Senha atual</label>
              <input id="current-password" className="form-control mb-3" type="password" autoComplete="current-password" value={senhaAtual} onChange={(event) => setSenhaAtual(event.target.value)} />
              <label className="form-label" htmlFor="new-password">Nova senha</label>
              <input id="new-password" className="form-control mb-4" type="password" autoComplete="new-password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} />
              <button className="btn-eco-primary" type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>

            <hr className="my-4" />
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button className="btn btn-outline-success" type="button" onClick={handleSwitchAccount}>Trocar de conta</button>
              <button className="btn btn-outline-secondary" type="button" onClick={handleSwitchAccount}>Sair da conta</button>
            </div>

            <form className="border border-danger rounded p-3" onSubmit={handleDelete}>
              <h2 className="h5 text-danger">Excluir conta</h2>
              <p className="text-muted">Seu perfil será removido. O histórico de coletas será mantido sem associação à conta, endereço ou observações pessoais.</p>
              <label className="form-label" htmlFor="delete-password">Confirme sua senha</label>
              <input id="delete-password" className="form-control mb-3" type="password" autoComplete="current-password" value={senhaExclusao} onChange={(event) => setSenhaExclusao(event.target.value)} required />
              <button className="btn btn-danger" type="submit" disabled={excluindo}>
                {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
