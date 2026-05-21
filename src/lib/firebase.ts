import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isRealFirebase = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

let app: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isRealFirebase) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("🔥 Firebase Auth initialized successfully with official project credentials.");
  } catch (error) {
    console.error("⚠️ Firebase initialization failed during start:", error);
  }
} else {
  console.log("🚀 Firebase is operating in offline/local simulation fallback.");
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Order Sync Helper
export async function saveOrderToFirestore(orderId: string, orderData: any) {
  if (!isRealFirebase || !db) {
    console.log("📝 Offline Simulator Sync: Order logged successfully:", orderId);
    return;
  }
  const path = `orders/${orderId}`;
  try {
    const simplifiedData = {
      id: orderData.id || orderId,
      firstName: orderData.firstName || '',
      phone: orderData.phone || '',
      address: orderData.address || '',
      totalAmount: Number(orderData.totalAmount) || 0
    };
    await setDoc(doc(db, 'orders', orderId), simplifiedData);
    console.log("🔥 Synergized with Live Cloud Firebase database successfully:", orderId);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export { auth, db, isRealFirebase };
