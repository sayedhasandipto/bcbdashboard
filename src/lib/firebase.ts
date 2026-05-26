// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if required configuration is available
export const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
);

// Use mock configuration during build time if environment variables are missing
const activeConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey || 'mock-api-key',
      databaseURL: firebaseConfig.databaseURL || 'https://mock-project-id.firebaseio.com',
      projectId: firebaseConfig.projectId || 'mock-project-id',
    };

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0];
export const db = getDatabase(app);
export default app;

