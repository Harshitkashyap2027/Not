const functions = require('firebase-functions');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();

exports.setupMFA = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const secret = speakeasy.generateSecret({ name: `lvlBase:${context.auth.token.email}` });
  const qrUrl = await qrcode.toDataURL(secret.otpauth_url);
  await admin.firestore().doc(`users/${context.auth.uid}`).update({ mfaSecret: secret.base32, mfaEnabled: false });
  return { secret: secret.base32, qrCode: qrUrl };
});

exports.verifyMFA = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { token } = data;
  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const verified = speakeasy.totp.verify({ secret: userDoc.data().mfaSecret, encoding: 'base32', token, window: 2 });
  if (!verified) throw new functions.https.HttpsError('invalid-argument', 'Invalid TOTP token');
  await admin.firestore().doc(`users/${context.auth.uid}`).update({ mfaEnabled: true });
  return { success: true };
});
