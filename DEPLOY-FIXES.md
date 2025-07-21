# 🚨 Correções para Deploy na Vercel

## Problemas Identificados e Solucionados:

### 1. **Estrutura de APIs Incorreta**
- **Problema**: APIs estavam em `backend/pages/api/` 
- **Solução**: Mover para `app/api/` seguindo o padrão App Router do Next.js 15

### 2. **localStorage no Server-Side**
- **Problema**: Código tentando acessar `localStorage` no servidor
- **Solução**: Adicionar verificações `typeof window !== 'undefined'`

### 3. **Scripts Inline no Layout**
- **Problema**: Scripts manipulando DOM podem causar hydration mismatch
- **Solução**: Remover scripts desnecessários do layout

### 4. **Configuração do vercel.json**
- **Problema**: Configuração inadequada para o projeto atual
- **Solução**: Atualizar para usar pnpm e configurações corretas

## ✅ Checklist para Deploy:

### 1. Configurar Variáveis de Ambiente na Vercel:
```bash
DATABASE_URL=sua_url_do_banco
SUPABASE_URL=sua_url_supabase  
SUPABASE_ANON_KEY=sua_chave_supabase
JWT_SECRET=sua_chave_secreta_jwt
NEXT_PUBLIC_API_URL=https://seu-app.vercel.app
```

### 2. Estrutura de APIs a Criar:
```
app/
  api/
    auth/
      login/
        route.ts
      register/
        route.ts
      verify/
        route.ts
    groups/
      route.ts
    user/
      groups/
        route.ts
    invites/
      route.ts
      [id]/
        route.ts
```

### 3. Dependências Necessárias:
Adicionar ao package.json:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "jsonwebtoken": "^9.x.x",
    "bcryptjs": "^2.x.x",
    "pg": "^8.x.x"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.x.x",
    "@types/bcryptjs": "^2.x.x",
    "@types/pg": "^8.x.x"
  }
}
```

## 🔧 Próximos Passos:

1. **Instalar dependências**:
   ```bash
   pnpm install @supabase/supabase-js jsonwebtoken bcryptjs pg
   pnpm install -D @types/jsonwebtoken @types/bcryptjs @types/pg
   ```

2. **Mover todas as APIs** de `backend/pages/api/` para `app/api/`

3. **Configurar banco de dados** (Supabase ou PostgreSQL)

4. **Testar localmente** antes do deploy

5. **Configurar variáveis de ambiente** na Vercel

## 🚀 Deploy na Vercel:

1. Fazer push das correções
2. Configurar variáveis de ambiente no dashboard da Vercel
3. Fazer novo deploy

## 📝 Observações Importantes:

- O Next.js 15 usa App Router por padrão
- Sempre verificar `typeof window !== 'undefined'` antes de usar localStorage
- APIs devem usar `NextRequest` e `NextResponse` no App Router
- Configurar CORS se necessário para APIs públicas
