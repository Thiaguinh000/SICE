import { useEffect, useState } from 'react';
import { adminRequest } from '../services/adminApi';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRequest('/users')
      .then(setUsers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Acesso</p><h1>Usuários</h1><p className="text-muted mb-0">Dados de conta sem informações de senha.</p></div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading && <Loading label="Carregando usuários..." />}
      {!loading && !error && users.length === 0 && <EmptyState>Nenhum usuário encontrado.</EmptyState>}
      {!loading && users.length > 0 && (
        <div className="table-responsive admin-table-wrap">
          <table className="table align-middle mb-0">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Coletas</th><th>Cadastro</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.nome}</td><td>{user.email}</td><td>{user.tipo}</td>
                  <td>{user.totalColetas || 0}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
