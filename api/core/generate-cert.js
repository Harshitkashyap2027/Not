const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();

exports.generateCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { studentId, courseName, schoolId } = data;
  const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2,8).toUpperCase()}`;
  await admin.firestore().doc(`certificates/${certId}`).set({
    certId, studentId, courseName, schoolId,
    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    issuedBy: context.auth.uid
  });
  return { certId, verifyUrl: `https://lvlbase.app/public/verify-certificate.html?id=${certId}` };
});
