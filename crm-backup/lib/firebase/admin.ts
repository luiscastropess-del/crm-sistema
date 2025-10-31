import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

// Inicializar Firebase Admin apenas uma vez
if (!getApps().length) {
  // Opção 1: Usar Service Account JSON (mais seguro)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } 
  // Opção 2: Usar credenciais individuais
  else if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } 
  // Opção 3: Desenvolvimento local (sem admin)
  else {
    console.warn('⚠️ Firebase Admin não configurado. Usando apenas Firebase Client.');
    // Não inicializar admin em desenvolvimento
  }
} else {
  app = getApps()[0];
}

// Exportar serviços
export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;

// Helper para verificar se admin está disponível
export const isAdminAvailable = !!app;