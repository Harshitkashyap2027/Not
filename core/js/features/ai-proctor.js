// ============================================================
// lvlBase — AI Proctor
// ============================================================

const LvlProctor = (() => {
  let _active = false;
  let _violations = [];
  let _onViolation = null;
  let _tabSwitchCount = 0;
  let _fullscreenExits = 0;
  let _sessionId = null;

  // ── Start Proctoring ──
  function start(sessionId, onViolation) {
    _active = true;
    _sessionId = sessionId;
    _onViolation = onViolation;
    _violations = [];
    _tabSwitchCount = 0;
    _fullscreenExits = 0;

    document.addEventListener('visibilitychange', _onVisibilityChange);
    document.addEventListener('fullscreenchange',  _onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', _onFullscreenChange);
    window.addEventListener('blur', _onWindowBlur);
    window.addEventListener('focus', _onWindowFocus);
    document.addEventListener('contextmenu', _blockContextMenu);
    document.addEventListener('keydown', _blockShortcuts);

    console.log('[Proctor] Started for session:', sessionId);
  }

  function stop() {
    _active = false;
    document.removeEventListener('visibilitychange', _onVisibilityChange);
    document.removeEventListener('fullscreenchange',  _onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', _onFullscreenChange);
    window.removeEventListener('blur',  _onWindowBlur);
    window.removeEventListener('focus', _onWindowFocus);
    document.removeEventListener('contextmenu', _blockContextMenu);
    document.removeEventListener('keydown', _blockShortcuts);
    console.log('[Proctor] Stopped. Violations:', _violations.length);
    return getReport();
  }

  function _record(type, detail = '') {
    if (!_active) return;
    const v = { type, detail, ts: Date.now(), sessionId: _sessionId };
    _violations.push(v);
    _onViolation && _onViolation(v);
    // Save to Firestore
    if (window.LvlDB && _sessionId) {
      window.LvlDB.addDoc(`proctoring/${_sessionId}/violations`, v).catch(() => {});
    }
  }

  function _onVisibilityChange() {
    if (document.hidden) {
      _tabSwitchCount++;
      _record('tab_switch', `Tab hidden (count: ${_tabSwitchCount})`);
    }
  }
  function _onWindowBlur()  { _record('window_blur', 'Window lost focus'); }
  function _onWindowFocus() { /* OK — back in focus */ }
  function _onFullscreenChange() {
    const inFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!inFS && _active) {
      _fullscreenExits++;
      _record('fullscreen_exit', `Left fullscreen (count: ${_fullscreenExits})`);
    }
  }
  function _blockContextMenu(e) { if (_active) e.preventDefault(); }
  function _blockShortcuts(e) {
    if (!_active) return;
    // Block Ctrl+C, Ctrl+V, F12, Alt+Tab, etc.
    if (
      (e.ctrlKey && ['c','v','a','u','s','p'].includes(e.key.toLowerCase())) ||
      e.key === 'F12' ||
      (e.altKey && e.key === 'Tab') ||
      (e.metaKey && ['c','v'].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
      _record('shortcut_blocked', `Blocked: ${e.key}`);
    }
  }

  // ── Request Fullscreen ──
  function requestFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) req.call(el).catch(() => {});
  }

  // ── Get Report ──
  function getReport() {
    return {
      sessionId: _sessionId,
      violations: _violations,
      tabSwitches: _tabSwitchCount,
      fullscreenExits: _fullscreenExits,
      totalViolations: _violations.length,
      risk: _violations.length === 0 ? 'low' :
            _violations.length < 3   ? 'medium' : 'high'
    };
  }

  function getViolations() { return [..._violations]; }
  function isActive() { return _active; }

  return { start, stop, requestFullscreen, getReport, getViolations, isActive };
})();

window.LvlProctor = LvlProctor;
