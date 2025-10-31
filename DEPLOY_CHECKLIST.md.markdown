# ✅ Checklist de Deploy - CRM Sistema

## 📦 Antes de Fazer Deploy

### 1. Configuração Local
- [ ] Todas as dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` configurado
- [ ] Firebase configurado e funcionando
- [ ] Projeto rodando localmente sem erros (`npm run dev`)
- [ ] Build local bem-sucedido (`npm run build`)

### 2. Firebase
- [ ] Projeto criado no Firebase Console
- [ ] Firestore ativado
- [ ] Regras de segurança configuradas
- [ ] Índices compostos criados (se necessário)
- [ ] Service Account Key baixada
- [ ] Credenciais do Client SDK copiadas

### 3. Código
- [ ] Todos os arquivos commitados no Git
- [ ] `.gitignore` configurado corretamente
- [ ] Sem credenciais hardcoded no código
- [ ] README.md atualizado
- [ ] Versão atualizada no package.json

### 4. Vercel
- [ ] Conta criada na Vercel
- [ ] Repositório conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Região selecionada (gru1 para Brasil)

## 🚀 Durante o Deploy

### 1. Conectar Repositório
```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/crm-sistema.git
git push -u origin main
```

### 2. Importar na Vercel
1. Acesse https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

### 3. Configurar Variáveis de Ambiente na Vercel

**Environment Variables:**
```
JWT_SECRET=sua-chave-secreta-aqui
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc...
```

## ✅ Após o Deploy

### 1. Testes
- [ ] Site acessível via URL da Vercel
- [ ] Login funcionando
- [ ] Registro funcionando
- [ ] Dashboard carregando
- [ ] CRUD de clientes funcionando
- [ ] CRUD de leads funcionando
- [ ] CRUD de vendas funcionando
- [ ] Gráficos carregando
- [ ] Busca funcionando

### 2. Configurações Finais
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL/HTTPS ativo
- [ ] Analytics configurado (opcional)
- [ ] Sentry/Error tracking configurado (opcional)

### 3. Monitoramento
- [ ] Verificar logs na Vercel
- [ ] Verificar logs no Firebase Console
- [ ] Testar performance
- [ ] Verificar custos do Firebase

## 🐛 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no package.json
- Execute `npm install` novamente

### Erro: "Firebase Admin initialization failed"
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se de que FIREBASE_PRIVATE_KEY tem as quebras de linha (\n)

### Erro: "JWT Secret not defined"
- Configure a variável JWT_SECRET na Vercel
- Use uma string aleatória de no mínimo 32 caracteres

### Build falhou
- Execute `npm run build` localmente
- Corrija os erros mostrados
- Commit e push novamente

## 📞 Suporte

- Documentação Next.js: https://nextjs.org/docs
- Documentação Firebase: https://firebase.google.com/docs
- Documentação Vercel: https://vercel.com/docs
- GitHub Issues: [link do seu repositório]