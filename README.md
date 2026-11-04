
# SICE — Sistema Integrado de Coleta de Eletrônicos

O SICE conecta pessoas que desejam descartar eletrônicos a uma equipe que agenda, acompanha e registra a destinação das coletas. O projeto usa MongoDB, Express, React e Node.js, com interfaces separadas para clientes e administração.

## Objetivo do Projeto

O sistema permite cadastro e autenticação, solicitação e acompanhamento de coletas, atualização administrativa de etapas, atribuição de coletores, planejamento diário de rotas, notificações no sistema e relatórios operacionais e ambientais baseados em peso medido.

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
git clone https://github.com/Thiaguinh000/SICE.git
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

3. Copie `server/.env.example` para `server/.env` e configure:

```
MONGO_URI=<sua_string_de_conexao_do_mongodb>
JWT_SECRET=<sua_chave_secreta_para_assinar_e_validar_os_tokens_de_autenticação>
PORT=7777
JWT_EXPIRES_IN=1h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
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
```

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

- Contas de cliente e de equipe com login, edição de perfil, troca de senha, logout e exclusão da conta.
- Solicitações de coleta com validação de data e horário, acompanhamento e cancelamento enquanto pendentes.
- Fluxo administrativo de status com histórico, registro do destino e peso medido.
- Atribuição de coletas a coletores e planejamento de rotas por data, horário e região aproximada.
- Notificações internas para alterações de status e lembretes de coletas próximas.
- Relatórios por material, status, mês e destino, usando somente pesos efetivamente registrados.
- Página de privacidade com dados tratados e informações institucionais a confirmar.

## Segurança

- As senhas dos usuários são armazenadas de forma segura usando **bcrypt** (hashing).
- As rotas da API são protegidas usando **JWT** (JSON Web Token).
- O backend valida identidade, perfil e permissões; clientes acessam somente as próprias coletas e ações da equipe são autorizadas por função.

## Como Usar no TCC?

- Este é um projeto acadêmico que pode ser evoluído com integrações e regras operacionais validadas pela instituição responsável.

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

Durante a avaliação, a equipe informa o destino (`Reciclado` ou `Descartado`) e o peso medido em quilogramas. O backend valida as transições, grava o histórico de status e atualiza o mesmo registro que o cliente consulta. Depois de confirmada, a solicitação não pode mais ser editada ou cancelada pelo cliente. Não há limite de capacidade de horário configurado.

### Segurança e validação

- Sessões JWT são entregues em cookies separados para cliente e equipe, `HttpOnly` e `SameSite=Lax`; o token não é exposto ao JavaScript nem persistido no `localStorage`.
- Os endpoints autenticados consultam o usuário no banco em cada requisição, permitindo que contas removidas percam acesso imediatamente.
- Login possui limite de tentativas por endereço IP em memória (cinco tentativas por janela de 15 minutos). Em implantação com múltiplas instâncias, substitua o armazenamento em memória por um backend compartilhado.
- `ALLOWED_ORIGINS` é uma lista separada por vírgulas de origens exatas autorizadas a enviar credenciais. Atualize-a para os domínios dos dois frontends na implantação.
- O cadastro exige senha de 8 a 128 caracteres; os campos de coleta também são validados no servidor. Datas passadas são rejeitadas.
- A sessão expira em uma hora por padrão. `JWT_EXPIRES_IN` pode ser ajustada no servidor.

### Notificações e impacto ambiental

As notificações são internas ao sistema: atualizações de status são sincronizadas a partir do histórico e um lembrete é criado quando o cliente consulta a página de notificações no dia da coleta ou no dia anterior. Não há envio de e-mail ou notificação push.

Os relatórios somam somente pesos registrados pela equipe durante a avaliação. Esses dados não são convertidos em estimativas de CO₂, economia ou compensação ambiental. Antes de comunicar impacto ambiental, documente uma metodologia e fontes verificáveis.

### Privacidade

A página `/privacidade` descreve os dados tratados e informa que o endereço é enviado ao Google Maps ao visualizar o mapa administrativo. A exclusão da conta remove o perfil e desvincula as coletas, removendo endereço e observações pessoais. O texto identifica dados institucionais e prazos de retenção ainda pendentes; confirme-os com a instituição responsável antes de disponibilizar o sistema ao público.

### API administrativa

- `POST /api/admin/login` — login de `admin` e `coletor`;
- `POST /api/admin/logout` e `GET/PATCH/DELETE /api/admin/account/profile` — sessão e perfil da equipe;
- `GET /api/admin/dashboard` — contadores;
- `GET /api/admin/appointments` e `GET /api/admin/appointments/:id` — coletas;
- `PATCH /api/admin/appointments/:id/status` — transição de status, destino e peso medido;
- `GET /api/admin/collectors` e `PATCH /api/admin/appointments/:id/assignment` — equipe e atribuição (atribuição somente para `admin`);
- `GET /api/users/profile`, `PATCH /api/users/profile`, `DELETE /api/users/profile` e `POST /api/users/logout` — perfil e sessão do cliente;
- `GET /api/admin/appointments?date=AAAA-MM-DD&assignedCollector=<id>` — filtros usados no planejamento diário de rotas;
- `GET /api/users/notifications` e `PATCH /api/users/notifications/:id/read` — notificações do cliente;
- `GET /api/admin/users` — usuários e contagem de coletas (somente `admin`);
- `GET /api/admin/reports` — agregações por material, status e mês.

As rotas protegidas exigem sessão e autorização no backend; login e logout são públicos. Valide as regras com `npm test` na pasta `server` e compile os frontends com `npm run build` nas pastas `client` e `admin`.
