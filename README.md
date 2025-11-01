# 🚀 CRM Sistema - Sistema Completo de Gestão

Sistema CRM moderno e completo desenvolvido com Next.js 14 e Firebase.

## 📋 Funcionalidades

- ✅ Autenticação JWT
- ✅ Gestão de Clientes
- ✅ Gestão de Leads
- ✅ Controle de Vendas
- ✅ Dashboard com Estatísticas
- ✅ Atividades em Tempo Real
- ✅ Busca Global
- ✅ Relatórios

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Auth:** JWT + Firebase Auth
- **Deploy:** Vercel

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/crm-sistema.git
cd crm-sistema
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Firebase.

### 4. Inicialize o Firestore

```bash
npm run init-firestore
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔥 Configuração do Firebase

### 1. Crie um projeto no Firebase Console

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Siga as instruções

### 2. Ative o Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção
4. Selecione a região mais próxima

### 3. Obtenha as credenciais

#### Firebase Client (Frontend)

1. Vá em Configurações do Projeto > Geral
2. Role até "Seus apps"
3. Clique no ícone da Web (</>)
4. Copie as credenciais

#### Firebase Admin (Backend)

1. Vá em Configurações do Projeto > Contas de serviço
2. Clique em "Gerar nova chave privada"
3. Salve o arquivo JSON
4. Copie os valores para `.env.local`

### 4. Configure as regras de segurança

Copie o conteúdo de `firestore.rules` e cole no Firebase Console:

1. Firestore Database > Regras
2. Cole as regras
3. Clique em "Publicar"

## 🚀 Deploy na Vercel

### 1. Instale a CLI da Vercel

```bash
npm i -g vercel
```

### 2. Faça login

```bash
vercel login
```

### 3. Configure as variáveis de ambiente

```bash
vercel env add JWT_SECRET
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
# ... adicione todas as variáveis
```

### 4. Deploy

```bash
vercel --prod
```

## 📁 Estrutura do Projeto

```
crm-sistema/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── (dashboard)/     # Páginas do dashboard
│   ├── api/             # API Routes
│   └── layout.js        # Layout principal
├── components/
│   ├── layout/          # Componentes de layout
│   ├── ui/              # Componentes UI
│   └── dashboard/       # Componentes do dashboard
├── lib/
│   ├── firebase/        # Configuração Firebase
│   ├── middleware/      # Middlewares
│   └── utils/           # Utilitários
└── public/              # Arquivos estáticos
```

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Validação de dados com Zod
- ✅ Regras de segurança do Firestore
- ✅ Headers de segurança configurados
- ✅ Proteção contra XSS e CSRF

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Versão:** 1.0.0  
**Última atualização:** 2025
