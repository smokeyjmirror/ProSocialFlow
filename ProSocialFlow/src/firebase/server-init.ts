
'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: any;
let firestore: any;

// This function initializes Firebase on the server side.
// It's designed to be idempotent, so it can be called multiple times without re-initializing.
export async function initializeFirebaseServer() {
  if (!getApps().length) {
    try {
      // In a server environment (like Genkit flows), we initialize with the config object.
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Failed to initialize Firebase on the server:", e);
      // Depending on the use case, you might want to throw the error
      // or handle it differently.
      throw new Error("Could not initialize Firebase server-side.");
    }
  } else {
    firebaseApp = getApp();
  }

  // Get auth and firestore instances if they haven't been already.
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}
