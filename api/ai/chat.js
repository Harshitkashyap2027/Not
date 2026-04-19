const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) admin.initializeApp();

const openai = new OpenAI({ apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY });

exports.aiChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { messages, subject, studentContext } = data;
  if (!messages || !Array.isArray(messages)) throw new functions.https.HttpsError('invalid-argument', 'messages required');

  const systemPrompt = `You are Sage, an expert AI tutor for the lvlBase learning platform. 
You help students (K-12) learn ${subject || 'all subjects'} in an engaging, encouraging way.
${studentContext ? `Student context: ${studentContext}` : ''}
Rules: Be encouraging, use examples, break down complex topics, celebrate progress.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
    max_tokens: 800,
    temperature: 0.7
  });
  return { reply: response.choices[0].message.content, tokens: response.usage.total_tokens };
});
