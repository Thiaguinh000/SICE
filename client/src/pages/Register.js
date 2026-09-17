import { useState } from 'react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('http://localhost:7777/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setMensagem(data.message || 'Erro ao criar conta');
      }

      setMensagem('Conta criada com sucesso! Você já pode fazer login.');
      setNome('');
      setEmail('');
      setSenha('');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
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
    >
      <div id="login" className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="container">
          <div id="login-row" className="row justify-content-center align-items-center">
            <div id="login-column" className="col-md-6">
              <div
                id="login-box"
                className="col-md-12 p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px' }}
              >
                <form id="login-form" className="form" onSubmit={handleRegister}>
                  <h2 className="text-center text-success mb-2">SICE</h2>
                  <p className="text-center text-muted mb-4">Crie sua conta e ajude a dar um destino correto ao lixo eletrônico.</p>

                  {mensagem && <p className={`text-center ${mensagem.includes('sucesso') ? 'text-success' : 'text-danger'}`}>{mensagem}</p>}

                  <div className="form-group mb-3">
                    <label htmlFor="nome" className="text-success fw-bold">Nome completo:</label><br />
                    <input
                      type="text"
                      name="nome"
                      id="nome"
                      className="form-control"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="email" className="text-success fw-bold">Email:</label><br />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="senha" className="text-success fw-bold">Senha:</label><br />
                    <input
                      type="password"
                      name="senha"
                      id="senha"
                      className="form-control"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-success btn-md px-4"
                      value="Criar Conta"
                    />
                    <a href="/login" className="btn btn-outline-secondary btn-md">Voltar para login</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
