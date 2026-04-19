const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: functions.config().smtp?.host || process.env.SMTP_HOST,
  port: 587, secure: false,
  auth: { user: functions.config().smtp?.user || process.env.SMTP_USER, pass: functions.config().smtp?.pass || process.env.SMTP_PASS }
});

exports.sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { to, subject, html, text } = data;
  if (!to || !subject) throw new functions.https.HttpsError('invalid-argument', 'to and subject required');
  await transporter.sendMail({ from: `"lvlBase" <${process.env.SMTP_FROM}>`, to, subject, html, text });
  return { success: true };
});
