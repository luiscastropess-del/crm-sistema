# 🚀 Guia de Deploy - CRM MongoDB

## 📋 Pré-requisitos

- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Conta no [Vercel](https://vercel.com)
- Git instalado
- Node.js 18+ instalado

---

## 1️⃣ Configurar MongoDB Atlas

### Passo 1: Criar Cluster

1. Acesse https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Crie um novo cluster (FREE tier M0)
4. Escolha a região mais próxima (ex: São Paulo)

### Passo 2: Configurar Acesso

1. **Database Access**:
   - Clique em "Database Access" no menu lateral
   - Clique em "Add New Database User"
   - Crie um usuário e senha (anote!)
   - Permissões: "Read and write to any database"

2. **Network Access**:
   - Clique em "Network Access"
   - Clique em "Add IP Address"
   - Selecione "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirme

### Passo 3: Obter Connection String

1. Volte para "Database"
2. Clique em "Connect" no seu cluster
3. Escolha "Connect your application"
4. Copie a connection string
5. Substitua `<password>` pela sua senha
6. Substitua `<dbname>` por `crm`

Exemplo:
```
mongodb+srv://usuario:senha@cluster.mongodb.net/crm?retryWrites=true&w=majority
```

---

## 2️⃣ Preparar Projeto

### Passo 1: Inicializar Git

```bash
git init
git add .
git commit -m "Initial commit"
```

### Passo 2: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório
3. Não inicialize com README

```bash
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

---

## 3️⃣ Deploy na Vercel

### Passo 1: Importar Projeto

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure o projeto:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Passo 2: Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

| Nome | Valor |
|------|-------|
| `MONGODB_URI` | Sua connection string do MongoDB Atlas |
| `JWT_SECRET` | Uma string aleatória de 32+ caracteres |
| `JWT_REFRESH_SECRET` | Outra string aleatória de 32+ caracteres |
| `NEXT_PUBLIC_API_URL` | Deixe vazio (será preenchido automaticamente) |

**Gerar secrets seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. Acesse a URL fornecida

---

## 4️⃣ Inicializar Banco de Dados

### Opção A: Via Script Local

```bash
# Configurar .env.local com sua connection string
echo "MONGODB_URI=sua_connection_string" > .env.local

# Rodar seed
npm run seed
```

### Opção B: Via API (Produção)

Crie um endpoint temporário em `app/api/seed/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
// Import seed logic here

export async function GET() {
  // Run seed logic
  return NextResponse.json({ success: true })
}
```

Acesse: `https://seu-app.vercel.app/api/seed`

**⚠️ IMPORTANTE: Delete este endpoint após usar!**

---

## 5️⃣ Configurar Domínio Personalizado (Opcional)

1. Na Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções

---

## 6️⃣ Monitoramento

### Logs

- Vercel Dashboard > Seu Projeto > Logs
- Veja erros em tempo real

### Analytics

- Vercel Analytics (gratuito)
- Monitore performance e uso

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to MongoDB"

**Solução:**
1. Verifique se a connection string está correta
2. Confirme que o IP 0.0.0.0/0 está liberado no Network Access
3. Verifique se a senha não tem caracteres especiais (use URL encoding)

### Erro: "JWT Secret not defined"

**Solução:**
1. Vá em Vercel > Settings > Environment Variables
2. Adicione `JWT_SECRET` e `JWT_REFRESH_SECRET`
3. Redeploy o projeto

### Build falha

**Solução:**
1. Verifique os logs de build
2. Teste localmente: `npm run build`
3. Corrija erros de TypeScript

---

## 📊 Limites do Plano Gratuito

### MongoDB Atlas (M0)
- 512 MB de armazenamento
- Conexões compartilhadas
- Backup não incluído

### Vercel (Hobby)
- 100 GB de bandwidth/mês
- Builds ilimitados
- Domínios personalizados

---

## 🔐 Segurança

### Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] Secrets fortes (32+ caracteres)
- [ ] Network Access configurado
- [ ] Usuário do banco com senha forte
- [ ] HTTPS habilitado (automático na Vercel)
- [ ] Endpoint de seed removido

---

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🎉 Pronto!

Seu CRM está no ar! 🚀

**URL de Produção:** https://seu-app.vercel.app

**Credenciais padrão:**
- Email: admin@crm.com
- Senha: admin123

**⚠️ IMPORTANTE: Mude a senha do admin imediatamente!**