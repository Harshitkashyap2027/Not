// ============================================================
// lvlBase — Firebase Initialization (v9 compat)
// ============================================================

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ── Service Exports ──
const auth     = firebase.auth();
const db       = firebase.firestore();
const rtdb     = firebase.database();
const storage  = firebase.storage();

// Firestore settings
db.settings({ experimentalForceLongPolling: false });

// Firestore persistence (offline support)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('lvlBase: Multiple tabs open, persistence only in one.');
  } else if (err.code === 'unimplemented') {
    console.warn('lvlBase: Persistence not supported in this browser.');
  }
});

// ── FCM (optional — only if token is requested) ──
let messaging = null;
try {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
    messaging.onMessage(payload => {
      console.log('[FCM] Foreground message:', payload);
      if (window.LvlUI) {
        window.LvlUI.toast(
          payload.notification?.title || 'New notification',
          payload.notification?.body || '',
          'info'
        );
      }
    });
  }
} catch (e) { /* FCM not available */ }

// ── Auth state observer ──
auth.onAuthStateChanged(user => {
  window.dispatchEvent(new CustomEvent('lvl:auth', { detail: { user } }));
});

// ── Expose globally ──
window.LvlFire = { auth, db, rtdb, storage, messaging, firebaseConfig };

// Demo mode: set flag if using placeholder config
if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
  window.LvlDemoMode = true;
  console.info('lvlBase: Running in demo mode (placeholder Firebase config detected).');
}
