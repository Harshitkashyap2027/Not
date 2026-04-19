// ============================================================
// lvlBase — Security Helpers
// ============================================================

const LvlSecurity = (() => {
  // ── Input Sanitization (XSS prevention) ──
  function sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str || '')));
    return div.innerHTML;
  }

  function sanitizeHTML(html) {
    const allowed = ['b','i','em','strong','a','br','p','ul','ol','li','code','pre'];
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('*').forEach(el => {
      if (!allowed.includes(el.tagName.toLowerCase())) {
        el.replaceWith(document.createTextNode(el.textContent));
        return;
      }
      [...el.attributes].forEach(attr => {
        if (!['href','class'].includes(attr.name)) el.removeAttribute(attr.name);
        if (attr.name === 'href' && !/^https?:/.test(attr.value)) el.removeAttribute('href');
      });
    });
    return tmp.innerHTML;
  }

  // ── Email validation ──
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase().trim());
  }

  // ── Password strength ──
  function getPasswordStrength(password) {
    if (!password) return { score: 0, label: 'Empty', level: 'empty' };
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { score:0, label:'Too short',   level:'empty' },
      { score:1, label:'Weak',        level:'weak' },
      { score:2, label:'Fair',        level:'fair' },
      { score:3, label:'Good',        level:'good' },
      { score:4, label:'Strong',      level:'strong' },
      { score:5, label:'Very strong', level:'strong' }
    ];
    return levels[Math.min(score, 5)];
  }

  // ── Rate limiter (in-memory) ──
  const _rateLimits = {};
  function rateLimit(key, maxCalls, windowMs) {
    const now = Date.now();
    if (!_rateLimits[key]) _rateLimits[key] = [];
    _rateLimits[key] = _rateLimits[key].filter(t => now - t < windowMs);
    if (_rateLimits[key].length >= maxCalls) return false;
    _rateLimits[key].push(now);
    return true;
  }

  // ── Session timeout ──
  let _activityTimer = null;
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

  function resetActivityTimer() {
    clearTimeout(_activityTimer);
    _activityTimer = setTimeout(() => {
      if (window.LvlAuth) {
        window.LvlUI?.toast('Session expired', 'Please log in again.', 'warning');
        setTimeout(() => { window.LvlAuth.signOut(); }, 2000);
      }
    }, SESSION_TIMEOUT);
  }

  function initActivityTracking() {
    ['click','keydown','scroll','touchstart'].forEach(event => {
      document.addEventListener(event, resetActivityTimer, { passive: true });
    });
    resetActivityTimer();
  }

  // ── CSRF Token ──
  function getCSRFToken() {
    let token = sessionStorage.getItem('lvl_csrf');
    if (!token) {
      token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2,'0')).join('');
      sessionStorage.setItem('lvl_csrf', token);
    }
    return token;
  }

  // ── Form validation ──
  function validateForm(fields) {
    const errors = {};
    fields.forEach(({ name, value, rules }) => {
      for (const rule of rules) {
        if (rule === 'required' && !String(value||'').trim()) {
          errors[name] = `${name} is required`;
          break;
        }
        if (rule === 'email' && !isValidEmail(value)) {
          errors[name] = 'Invalid email address';
          break;
        }
        if (rule === 'minLength:8' && String(value||'').length < 8) {
          errors[name] = 'Must be at least 8 characters';
          break;
        }
        if (typeof rule === 'function') {
          const err = rule(value);
          if (err) { errors[name] = err; break; }
        }
      }
    });
    return errors;
  }

  function showFormErrors(form, errors) {
    form.querySelectorAll('.input-error').forEach(e => e.remove());
    form.querySelectorAll('.auth-input,.input').forEach(i => i.classList.remove('error'));
    Object.entries(errors).forEach(([name, msg]) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) {
        field.classList.add('error');
        const err = document.createElement('div');
        err.className = 'input-error';
        err.textContent = msg;
        field.parentElement.appendChild(err);
      }
    });
  }

  return {
    sanitize, sanitizeHTML,
    isValidEmail, getPasswordStrength,
    rateLimit, initActivityTracking,
    getCSRFToken, validateForm, showFormErrors
  };
})();

window.LvlSecurity = LvlSecurity;
