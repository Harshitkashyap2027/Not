// ============================================================
// lvlBase — Firebase Cloud Functions Entry Point
// ============================================================

// ── AI ──
const { aiChat }       = require('./ai/chat');
const { aiGrade }      = require('./ai/grading');
const { codeReview }   = require('./ai/code-review');

// ── Auth ──
const { setupMFA, verifyMFA } = require('./auth/mfa');
const { verifySSO }    = require('./auth/verify-sso');

// ── Core ──
const { generateCertificate } = require('./core/generate-cert');
const { paymentWebhook }      = require('./core/payment');
const { sendEmail }           = require('./core/send-email');

// ── Exports ──
module.exports = {
  // AI
  aiChat,
  aiGrade,
  codeReview,
  // Auth
  setupMFA,
  verifyMFA,
  verifySSO,
  // Core
  generateCertificate,
  paymentWebhook,
  sendEmail
};
