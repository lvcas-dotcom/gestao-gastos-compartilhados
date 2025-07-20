# Backend API - Gestão de Gastos Compartilhados

## Sobre
API Express.js para autenticação e gerenciamento de usuários do sistema de gestão de gastos compartilhados.

## Deploy no Render.com

### 1. Preparação
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Selecione o repositório `gestao-gastos-compartilhados`

### 2. Configuração do Web Service
1. Clique em "New Web Service"
2. Selecione seu repositório
3. Configure:
   - **Name**: `gestao-gastos-backend` (ou nome de sua preferência)
   - **Root Directory**: `backend-express`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### 3. Variáveis de Ambiente
Adicione estas variáveis de ambiente no Render:

```
PORT=10000
JWT_SECRET=seu-jwt-secret-super-secreto-aqui
DATABASE_URL=postgresql://postgres:oskunks@db.oajsszzpeuhxbarwpbdn.supabase.co:5432/postgres
FRONTEND_URL=https://seu-app.vercel.app
```

**IMPORTANTE**: Substitua `FRONTEND_URL` pela URL real do seu app no Vercel.

### 4. Deploy
1. Clique em "Create Web Service"
2. Aguarde o build e deploy (pode demorar alguns minutos)
3. Anote a URL do seu backend (ex: `https://gestao-gastos-backend.onrender.com`)

### 5. Atualizar Frontend
Após o deploy do backend, atualize as URLs da API no seu frontend:

- Nas páginas de login/cadastro, substitua `http://localhost:3001` pela URL do Render
- Exemplo: `https://gestao-gastos-backend.onrender.com`

## Endpoints Disponíveis

- `POST /auth/register` - Cadastro de usuário
- `POST /auth/login` - Login
- `POST /auth/verify` - Verificar token
- `PUT /user/update` - Atualizar usuário
- `DELETE /user/delete` - Deletar usuário
- `POST /groups/create` - Criar grupo

## Estrutura do Projeto

```
backend-express/
├── server.js          # Servidor principal
├── package.json       # Dependências
├── .gitignore         # Arquivos ignorados
└── README.md          # Este arquivo
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar servidor
npm start

# Servidor rodará em http://localhost:3001
```

## Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurada corretamente
- URL deve incluir protocolo (https://) e não ter barra no final

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Teste conexão local primeiro

### App não carrega no mobile
- Certifique-se de que o backend está deployado e acessível
- URLs localhost não funcionam em produção
