const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();

exports.verifySSO = functions.https.onCall(async (data, context) => {
  const { idToken, schoolId } = data;
  const decoded = await admin.auth().verifyIdToken(idToken);
  const userSnap = await admin.firestore().doc(`users/${decoded.uid}`).get();
  if (!userSnap.exists) throw new functions.https.HttpsError('not-found', 'User not found');
  const user = userSnap.data();
  if (user.schoolId !== schoolId) throw new functions.https.HttpsError('permission-denied', 'School mismatch');
  return { valid: true, role: user.role, schoolId: user.schoolId };
});
