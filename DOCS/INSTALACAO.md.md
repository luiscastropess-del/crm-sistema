# 🚀 Guia de Instalação Rápida

## Passo a Passo Completo

### 1️⃣ Pré-requisitos

Certifique-se de ter instalado:

```bash
# Verificar Node.js
node --version  # Deve ser >= 18.0.0

# Verificar npm
npm --version   # Deve ser >= 9.0.0

# Verificar Git
git --version
```

### 2️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/crm-firebase.git
cd crm-firebase
```

### 3️⃣ Instalar Dependências

```bash
npm install
```

### 4️⃣ Configurar Firebase

#### A. Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `crm-sistema` (ou outro nome)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

#### B. Configurar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de produção"
4. Selecione localização: `southamerica-east1` (São Paulo)
5. Clique em "Ativar"

#### C. Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Clique em "Email/Senha"
4. Ative a opção "Email/Senha"
5. Clique em "Salvar"

#### D. Obter Credenciais Web

1. Vá em **Configurações do Projeto** (ícone de engrenagem ⚙️)
2. Role até "Seus apps"
3. Clique no ícone Web `</>`
4. Apelido do app: `CRM Web`
5. Clique em "Registrar app"
6. **COPIE** as credenciais que aparecem

#### E. Obter Credenciais Admin SDK

1. Vá em **Configurações do Projeto** > **Contas de serviço**
2. Clique em "Gerar nova chave privada"
3. Clique em "Gerar chave"
4. Um arquivo JSON será baixado - **GUARDE BEM ESTE ARQUIVO**

### 5️⃣ Configurar Variáveis de Ambiente

#### A. Copiar arquivo de exemplo

```bash
cp .env.example .env.local
```

#### B. Editar .env.local

Abra o arquivo `.env.local` e preencha:

```env
# Firebase Web (do passo 4D)
NEXT_PUBLIC_FIREBASE_API_KEY=cole-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cole-aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cole-aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cole-aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=cole-aqui
NEXT_PUBLIC_FIREBASE_APP_ID=cole-aqui

# Firebase Admin (do arquivo JSON do passo 4E)
FIREBASE_PROJECT_ID=cole-aqui
FIREBASE_PRIVATE_KEY="cole-aqui-com-aspas"
FIREBASE_CLIENT_EMAIL=cole-aqui

# JWT Secret (gere uma chave)
JWT_SECRET=cole-aqui
```

#### C. Gerar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`

### 6️⃣ Iniciar o Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### 7️⃣ Criar Primeiro Usuário

1. Acesse: http://localhost:3000/register
2. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: suasenha123
3. Clique em "Criar Conta"
4. Você será redirecionado para o dashboard

---

## ✅ Verificar Instalação

Se tudo estiver correto, você verá:

- ✅ Página de login funcionando
- ✅ Consegue criar conta
- ✅ Consegue fazer login
- ✅ Dashboard carrega sem erros
- ✅ Pode criar clientes/leads/vendas

---

## ❌ Problemas Comuns

### Erro: "Firebase config is invalid"

**Solução:** Verifique se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão corretas no `.env.local`

### Erro: "JWT_SECRET is not defined"

**Solução:** Gere uma chave JWT e adicione no `.env.local`

### Erro: "Firebase Admin SDK error"

**Solução:** Verifique se a `FIREBASE_PRIVATE_KEY` está entre aspas duplas e com `\n` preservados

### Erro: "Cannot connect to Firestore"

**Solução:** 
1. Verifique se o Firestore está ativado no Firebase Console
2. Verifique se o `FIREBASE_PROJECT_ID` está correto

### Porta 3000 já está em uso

**Solução:**
```bash
# Usar outra porta
PORT=3001 npm run dev
```

---

## 🆘 Precisa de Ajuda?

- Abra uma issue: https://github.com/seu-usuario/crm-firebase/issues
- Email: seu-email@example.com

---

## 🎉 Próximos Passos

Agora que está tudo funcionando:

1. Explore o dashboard
2. Crie alguns clientes de teste
3. Adicione leads
4. Registre vendas
5. Crie tarefas
6. Veja os relatórios

**Divirta-se! 🚀**