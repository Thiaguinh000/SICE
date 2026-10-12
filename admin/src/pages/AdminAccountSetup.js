import { Link } from 'react-router-dom';

export default function AdminAccountSetup() {
  return (
    <main className="login-page">
      <section className="card login-card shadow">
        <div className="card-body p-4 p-md-5">
          <div className="login-brand">
            <img src="/Logo SICE.ico" alt="" />
            <p className="text-success fw-bold mb-1">SICE</p>
          </div>
          <h1 className="h3 mb-2">Criar conta de administrador</h1>
          <p className="text-muted">
            Por segurança, a conta inicial é criada localmente no servidor, não por um formulário público.
          </p>
          <ol className="ps-3 mb-4">
            <li className="mb-2">
              No arquivo <code>server/.env</code>, configure <code>ADMIN_NAME</code>, <code>ADMIN_EMAIL</code> e
              {' '}<code>ADMIN_PASSWORD</code>. Use uma senha exclusiva com pelo menos 8 caracteres.
            </li>
            <li className="mb-2">
              Com o MongoDB configurado e acessível, abra um terminal na pasta <code>server</code>.
            </li>
            <li className="mb-2">
              Execute <code>npm run create-admin</code>.
            </li>
            <li>
              Depois da criação, remova <code>ADMIN_PASSWORD</code> do arquivo <code>server/.env</code>.
            </li>
          </ol>
          <Link className="btn btn-success w-100" to="/login">
            Voltar para o login administrativo
          </Link>
        </div>
      </section>
    </main>
  );
}
