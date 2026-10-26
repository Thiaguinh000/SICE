
# Sistema de Agendamento para salão de beleza - Stack MERN

Este projeto é um **Sistema de Agendamento Online para salão de beleza**, desenvolvido utilizando a stack **MERN (MongoDB, Express, React e Node.js)**. Foi desenvolvido com fins didáticos para servir como **apoio para os alunos desenvolverem seus próprios projetos de conclusão de curso (TCC)**.

## Objetivo do Projeto

O sistema permite que usuários realizem:

- **Agendamentos de serviços**
- **Edição de agendamentos**
- **Cancelamento (exclusão) de agendamentos**
- **Listagem de agendamentos pendentes e concluídos**
- **Autenticação de usuários (Login e Registro)**

## Tecnologias Utilizadas

### Frontend

- React
- React Router DOM
- Bootstrap (para estilização)

### Backend

- Node.js
- Express
- MongoDB (via Mongoose)
- JSON Web Token (JWT) para autenticação
- Bcrypt para hash de senhas
- Dotenv para variáveis de ambiente
- CORS

### Banco de Dados

- MongoDB (MongoDB Atlas ou local)

## Estrutura do Projeto

```
stack-MERN/
├── client/                # Frontend (React)
├── admin/                 # Frontend independente da área administrativa (React)
├── server/                # Backend (Node + Express)
│   ├── controllers/       # Lógica de negócios (funções das rotas)
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API (endpoints)
│   ├── middleware/        # Middlewares (ex.: autenticação JWT)
│   ├── config.js          # Centraliza a leitura das variáveis do .env (Ex.: JWT_SECRET, MONGO_URI)
│   ├── .env               # Variáveis de ambiente (não vai para o GitHub)
│   ├── server.js          # Arquivo principal que sobe o servidor
│   └── mongo.js           # Script de conexão com o MongoDB

```

## Instalação e Configuração 

- ***Clone o repositório***

```bash
git clone https://github.com/jbgoncalvess/stack-mern-agendamento
```
### Backend

1. Acesse a pasta `server`:

```bash
cd server
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na pasta `server` com as seguintes variáveis:

```
MONGO_URI=<sua_string_de_conexao_do_mongodb>
JWT_SECRET=<sua_chave_secreta_para_assinar_e_validar_os_tokens_de_autenticação>
PORT=<a_porta_na_qual_rodará_seu_backend>
```

Se o Node.js retornar `querySrv ECONNREFUSED` para uma URI `mongodb+srv`, confira a resolução DNS do registro SRV. Caso o DNS padrão usado pelo Node esteja recusando consultas, é possível configurar resolvedores acessíveis adicionando `DNS_SERVERS=8.8.8.8,8.8.4.4` ao `server/.env`. Use resolvedores permitidos pela sua rede; o valor é opcional e só afeta a resolução DNS do processo do servidor.

#### **Como configurar o `MONGO_URI`:**

Formato padrão da string:

```bash
"mongodb+srv://<USUÁRIO>:<SENHA>@firstcluster.a7hehmz.mongodb.net/<NOME_DO_BANCO>?retryWrites=true&w=majority&appName=<CLUSTER>"
```

**Substitua:**

- `<USUARIO>` => Seu usuário do MongoDB Atlas
- `<SENHA>` => Sua senha do MongoDB Atlas
- `<CLUSTER>` => Nome do seu cluster (ex.: `FirstCluster`)
- `<NOME_DO_BANCO>` => Nome do seu banco de dados (ex.: `agendamentosDB`)


> **Atenção:**  
> O valor de **`JWT_SECRET`** deve ser uma chave **única e segura**, escolhida por cada aluno/dupla.
> Essa chave é usada para gerar e validar os **tokens de autenticação** e **não deve ser compartilhada publicamente, nem versionada no GitHub**.  
> Recomenda-se usar uma sequência forte de caracteres, como letras, números e símbolos.
> Além disso, não adicione sua string de conexão com o MongoDB contendo usuário e senha no código-fonte.


4. Inicie o servidor:

```bash
npm start
```

O backend rodará em: `http://localhost:${PORT}`

### Frontend

1. Acesse a pasta `client`:

```bash
cd client
```++

2. Instale as dependências:

```bash
npm install
```

3. Inicie o frontend:

```bash
npm start
```

O frontend estará disponível em: `http://localhost:3000`.

### Frontend administrativo

1. Na raiz do projeto, copie `admin/.env.example` para `admin/.env`. Ajuste `REACT_APP_API_URL` para a mesma URL e porta configuradas em `server/.env` (`http://localhost:7777` no exemplo).
2. Para personalizar o botão **Área administrativa** do cliente, copie `client/.env.example` para `client/.env` e ajuste `REACT_APP_ADMIN_URL`, se necessário.
3. Instale as dependências e inicie o app em outro terminal:

```bash
cd admin
npm install
npm start
```

O painel ficará disponível em `http://localhost:3001`. Deixe a API (`server`) e o frontend do cliente (`client`) em execução nos outros terminais. Ambos os frontends chamam a mesma API; somente o servidor usa `MONGO_URI` para acessar o banco de dados.

## Funcionalidades

- **Autenticação:**
  - Login e cadastro com segurança usando JWT e bcrypt.

- **Agendamento:**
  - Criar, listar, editar e excluir agendamentos.

- **Filtros:**
  - Filtragem de agendamentos por status (pendente, concluído).

- **Proteção de rotas:**
  - Apenas usuários autenticados acessam funcionalidades.

## Segurança

- As senhas dos usuários são armazenadas de forma segura usando **bcrypt** (hashing).
- As rotas da API são protegidas usando **JWT** (JSON Web Token).
- Apenas usuários autenticados podem criar, editar, excluir ou visualizar seus próprios agendamentos.

## Como Usar no TCC?

- Este projeto é uma **base funcional**, onde você pode:
  - Alterar o tema (ex.: barbearia, consultório, academia, petshop).
  - Adicionar novos campos (ex.: telefone, endereço, nome do cliente).
  - Implementar novas funcionalidades (ex.: envio de email, painel admin, confirmação de agendamento).
  - Melhorar o layout, responsividade e experiência do usuário.

## Licença

Este projeto é de uso **livre para fins acadêmicos e educacionais**.

## Desenvolvido por

**Prof. Jardel Gonçalves**  
Instituto Federal Catarinense (IFC).

## Suporte

Em caso de dúvidas, procure o professor em sala ou pelos canais oficiais do curso (Somente orientandos).

## Área administrativa SICE

A área administrativa é um frontend React independente na pasta `admin`, separado do frontend do cliente (`client`). Os dois frontends usam a mesma API Express da pasta `server`, que consulta as mesmas coleções MongoDB e os mesmos agendamentos. O painel contém indicadores, gerenciamento de coletas, usuários sem dados de senha e relatórios. Contas `admin` e `coletor` podem consultar e avançar solicitações; somente `admin` pode listar usuários.

### Criar o primeiro administrador

1. Configure `MONGO_URI`, `JWT_SECRET` e `PORT` no arquivo `server/.env` (consulte `server/.env.example`).
2. Acrescente `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` ao `server/.env`. Use uma senha exclusiva com pelo menos 8 caracteres; não a coloque no código nem no Git.
3. Com o MongoDB acessível, execute na pasta `server`:

   ```bash
   npm run create-admin
   ```

   O script cria uma conta na coleção existente `users`, guarda a senha em hash bcrypt e não altera contas com o mesmo e-mail. Após a criação, remova `ADMIN_PASSWORD` do `.env`.
4. Configure `admin/.env` copiando `admin/.env.example`. Ajuste `REACT_APP_API_URL` para a URL da API e `REACT_APP_ADMIN_URL` no `client/.env` para `http://localhost:3001`.
5. Instale as dependências uma vez nas pastas `admin` e `client` (`npm install`). Inicie a API com `npm start` na pasta `server` e cada frontend com `npm start` nas pastas `client` e `admin`. O painel administrativo estará em `http://localhost:3001`; o botão **Área administrativa** na página de login do cliente também abre esse endereço.

Não há criação pública de contas administrativas; o primeiro acesso é provisionado localmente com o script.

### Fluxo de coletas

As solicitações permanecem nos documentos existentes de `appointments`:

`Pendente → Aguardando coleta → Em transporte → Em avaliação → Reciclado ou Descartado → Finalizado`

Durante a avaliação, selecione `Reciclado` ou `Descartado`. O backend valida cada transição e salva o status no mesmo registro que o cliente consulta. Depois de confirmada, a solicitação não pode mais ser editada ou cancelada pelo cliente.

### API administrativa

- `POST /api/admin/login` — login de `admin` e `coletor`;
- `GET /api/admin/dashboard` — contadores;
- `GET /api/admin/appointments` e `GET /api/admin/appointments/:id` — coletas;
- `PATCH /api/admin/appointments/:id/status` — transição de status e destino;
- `GET /api/admin/users` — usuários e contagem de coletas (somente `admin`);
- `GET /api/admin/reports` — agregações por material, status e mês.

Todas as rotas, exceto o login, exigem JWT e autorização no backend. Valide as regras com `npm test` na pasta `server` e compile os frontends com `npm run build` nas pastas `client` e `admin`.
