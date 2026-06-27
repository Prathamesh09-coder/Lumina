const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (err) {
    console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable:', err.message);
  }
} else {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../serviceAccountKey.json');
  try {
    serviceAccount = require(path.resolve(serviceAccountPath));
  } catch (err) {
    console.warn('[Firebase Admin] serviceAccountKey.json not found. Attempting default credentials or environment defaults.');
  }
}

try {
  if (!admin.apps.length) {
    const initializationOptions = {
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'luminaa-1ffe1.firebasestorage.app'
    };

    if (serviceAccount) {
      initializationOptions.credential = admin.credential.cert(serviceAccount);
    } else {
      try {
        initializationOptions.credential = admin.credential.applicationDefault();
      } catch (err) {
        console.warn('[Firebase Admin] Warning: Firebase credentials could not be loaded. Database operations will fail unless configured.', err.message);
      }
    }

    admin.initializeApp(initializationOptions);
    console.log('[Firebase Admin] Initialized successfully.');
  }
} catch (initError) {
  console.error('[Firebase Admin] Critical error during Firebase Admin SDK initialization:', initError.message);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage
};
