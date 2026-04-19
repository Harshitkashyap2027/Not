const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
if (!admin.apps.length) admin.initializeApp();

exports.paymentWebhook = functions.https.onRequest(async (req, res) => {
  const secret = functions.config().razorpay?.secret || process.env.RAZORPAY_KEY_SECRET;
  const sig = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
  if (sig !== expected) { res.status(400).send('Invalid signature'); return; }
  const { event, payload } = req.body;
  if (event === 'payment.captured') {
    const { id: paymentId, order_id, notes } = payload.payment.entity;
    await admin.firestore().collection('payments').add({
      paymentId, orderId: order_id, schoolId: notes?.schoolId,
      amount: payload.payment.entity.amount / 100,
      status: 'paid', paidAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  res.status(200).send('OK');
});
