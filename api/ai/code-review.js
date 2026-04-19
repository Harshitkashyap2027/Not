const functions = require('firebase-functions');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY });

exports.codeReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { code, language } = data;
  const prompt = `Review this ${language} code from a student and provide constructive feedback.
Code:
\`\`\`${language}
${code}
\`\`\`
Respond with JSON: { "issues": [{"type":"error|warning|suggestion","line":null,"message":"..."}], "score": 0-10, "summary": "...", "improvedCode": "..." }`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(res.choices[0].message.content);
});
