import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";

/**
 * Configuración de Firebase Admin SDK
 */
class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App;

  private constructor() {
    this.app = this.initializeFirebase();
  }

  /**
   * Singleton pattern para Firebase
   */
  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  /**
   * Inicializar Firebase Admin SDK
   */
  private initializeFirebase(): admin.app.App {
    // Verificar si ya existe una instancia
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0] as admin.app.App;
    }

    // Configuración desde service account key o variables de entorno
    let firebaseConfig;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Usando service account key completo
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseConfig = {
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
      };
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      // Usando variables de entorno individuales
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID!,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL!,
        client_id: process.env.FIREBASE_CLIENT_ID!,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
      } as admin.ServiceAccount;

      firebaseConfig = {
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
      };
    } else {
      throw new Error("Firebase configuration not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY or individual environment variables.");
    }

    return initializeApp(firebaseConfig) as admin.app.App;
  }

  /**
   * Obtener instancia de Firestore
   */
  public getFirestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }

  /**
   * Obtener instancia de Storage
   */
  public getStorage(): admin.storage.Storage {
    return this.app.storage();
  }

  /**
   * Obtener instancia de Auth
   */
  public getAuth(): admin.auth.Auth {
    return this.app.auth();
  }

  /**
   * Obtener la app de Firebase
   */
  public getApp(): admin.app.App {
    return this.app;
  }
}

// Exportar instancia singleton
const firebaseConfig = FirebaseConfig.getInstance();

export const db = firebaseConfig.getFirestore();
export const storage = firebaseConfig.getStorage();
export const auth = firebaseConfig.getAuth();
export const app = firebaseConfig.getApp();

export default firebaseConfig; 