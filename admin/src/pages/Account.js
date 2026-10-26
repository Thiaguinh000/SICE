import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountRequest } from '../services/adminApi';
import { ErrorMessage, Loading } from '../components/Feedback';

export default function Account({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    accountRequest('/profile')
      .then((user) => {
        setProfile(user);
        setNome(user.nome);
        setEmail(user.email);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (Boolean(senhaAtual) !== Boolean(novaSenha)) {
      setError('Para trocar a senha, informe a senha atual e a nova senha.');
      return;
    }

    setSaving(true);
    try {
      const body = { nome, email };
      if (senhaAtual && novaSenha) {
        body.senhaAtual = senhaAtual;
        body.novaSenha = novaSenha;
      }
      const result = await accountRequest('/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setProfile(result.usuario);
      setNome(result.usuario.nome);
      setEmail(result.usuario.email);
      setSenhaAtual('');
      setNovaSenha('');
      setMessage(result.mensagem);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    setError('');
    if (!window.confirm('Excluir sua conta permanentemente? O histórico de coletas será mantido sem seus dados pessoais.')) return;

    setDeleting(true);
    try {
      const result = await accountRequest('/profile', {
        method: 'DELETE',
        body: JSON.stringify({ senha: senhaExclusao }),
      });
      onLogout();
      navigate('/login', { replace: true, state: { mensagem: result.mensagem } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSwitchAccount = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  if (!profile && !error) return <Loading label="Carregando sua conta..." />;

  return (
    <section className="detail-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h1>Minha conta</h1>
          <p className="text-muted mb-0">Gerencie seus dados e o acesso à sua conta administrativa.</p>
        </div>
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      {message && <div className="alert alert-success" role="status">{message}</div>}

      {profile && (
        <>
          <form onSubmit={handleUpdate}>
            <h2 className="h5">Informações pessoais</h2>
            <label className="form-label" htmlFor="admin-account-name">Nome</label>
            <input id="admin-account-name" className="form-control mb-3" value={nome} onChange={(event) => setNome(event.target.value)} required />
            <label className="form-label" htmlFor="admin-account-email">E-mail</label>
            <input id="admin-account-email" className="form-control mb-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <h2 className="h5">Alterar senha <small className="text-muted fw-normal">(opcional)</small></h2>
            <label className="form-label" htmlFor="admin-current-password">Senha atual</label>
            <input id="admin-current-password" className="form-control mb-3" type="password" autoComplete="current-password" value={senhaAtual} onChange={(event) => setSenhaAtual(event.target.value)} />
            <label className="form-label" htmlFor="admin-new-password">Nova senha</label>
            <input id="admin-new-password" className="form-control mb-4" type="password" autoComplete="new-password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} />
            <button className="btn btn-success" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
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
            <label className="form-label" htmlFor="admin-delete-password">Confirme sua senha</label>
            <input id="admin-delete-password" className="form-control mb-3" type="password" autoComplete="current-password" value={senhaExclusao} onChange={(event) => setSenhaExclusao(event.target.value)} required />
            <button className="btn btn-danger" type="submit" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir minha conta'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
