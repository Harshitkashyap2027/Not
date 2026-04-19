const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');
if (!admin.apps.length) admin.initializeApp();
const openai = new OpenAI({ apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY });

exports.aiGrade = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  if (!['teacher','school-admin','super-admin'].includes(userDoc.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Teachers only');
  }
  const { question, answer, rubric, maxScore } = data;
  const prompt = `Grade this student answer.
Question: ${question}
Student Answer: ${answer}
Rubric: ${rubric || 'Grade based on correctness, clarity, and completeness'}
Max Score: ${maxScore || 10}
Respond with JSON: { "score": <number>, "feedback": "<detailed feedback>", "strengths": ["..."], "improvements": ["..."] }`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(res.choices[0].message.content);
});
