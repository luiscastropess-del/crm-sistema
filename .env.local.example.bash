# ========================================
# FIREBASE WEB (FRONTEND)
# ========================================
# Obtenha em: Firebase Console > Configurações do Projeto > Seus apps > Web
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ========================================
# FIREBASE ADMIN SDK (BACKEND)
# ========================================
# Obtenha em: Firebase Console > Configurações do Projeto > Contas de serviço > Gerar nova chave privada
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com

# ========================================
# JWT SECRET
# ========================================
# Gere uma chave aleatória segura:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=sua-chave-secreta-muito-segura-de-64-caracteres-aqui

# ========================================
# CONFIGURAÇÕES OPCIONAIS
# ========================================
# URL da aplicação (para produção)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Ambiente (development, production)
NODE_ENV=development