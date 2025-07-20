# 💰 Gestão de Gastos Compartilhados

Um sistema completo para gerenciar gastos compartilhados entre grupos, desenvolvido com Next.js 15 e design system moderno.

## 🚀 Funcionalidades

- ✅ **Autenticação completa** (Login/Cadastro)
- 👥 **Criação e gestão de grupos**
- 💳 **Controle de gastos compartilhados**
- 📊 **Dashboard com visualizações**
- 📱 **Design responsivo e mobile-first**
- 🎨 **Interface moderna com Tailwind CSS**
- 🔒 **Sistema de convites para grupos**

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** com App Router
- **React 19** com TypeScript
- **Tailwind CSS** para estilização
- **Radix UI** para componentes acessíveis
- **Lucide React** para ícones
- **Zod** para validação

### Backend
- **Next.js API Routes**
- **PostgreSQL** com Prisma ORM
- **JWT** para autenticação
- **bcrypt** para hash de senhas

## 📁 Estrutura do Projeto

```
├── app/                    # Frontend (Next.js App Router)
│   ├── cadastro/          # Página de cadastro
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── gastos/            # Gerenciamento de gastos
│   ├── convites/          # Sistema de convites
│   └── ...
├── backend/               # Backend separado
│   ├── api/              # API Routes
│   ├── lib/              # Utilitários do backend
│   ├── prisma/           # Schema e migrações
│   └── ...
├── components/           # Componentes React
│   ├── ui/              # Componentes base (Radix UI)
│   └── navigation.tsx   # Componentes de navegação
└── lib/                 # Utilitários do frontend
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- pnpm (recomendado)

### 1. Clone o repositório
```bash
git clone https://github.com/lvcas-dotcom/gestao-gastos-compartilhados.git
cd gestao-gastos-compartilhados
```

### 2. Configure o Frontend
```bash
# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Executar o frontend
pnpm dev
```

### 3. Configure o Backend
```bash
cd backend

# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar banco de dados
pnpm db:migrate

# Executar o backend
pnpm dev
```

### 4. Acessar a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎨 Design System

O projeto utiliza um design system consistente com:
- **Cores**: Gradiente purple/violet/blue
- **Tipografia**: Font stack otimizada
- **Espaçamento**: Sistema baseado em Tailwind
- **Componentes**: Radix UI para acessibilidade
- **Responsividade**: Mobile-first approach

## 📱 Responsividade

Breakpoints otimizados:
- **xs**: 475px+ (smartphones pequenos)
- **sm**: 640px+ (smartphones grandes)
- **md**: 768px+ (tablets)
- **lg**: 1024px+ (laptops)
- **xl**: 1280px+ (desktops)

## 🔐 Autenticação

- Sistema JWT com tokens de 7 dias
- Hash de senhas com bcrypt (salt 12)
- Middleware de proteção de rotas
- Validação com Zod

## 🚢 Deploy

### Frontend (Vercel)
1. Conecte seu repositório na Vercel
2. Configure a variável `NEXT_PUBLIC_API_URL`
3. Deploy automático

### Backend (Vercel/Railway)
1. Configure as variáveis de ambiente
2. Execute as migrações do banco
3. Deploy da pasta `backend/`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -am 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Lucas](https://github.com/lvcas-dotcom)
