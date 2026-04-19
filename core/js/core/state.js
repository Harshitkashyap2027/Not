// ============================================================
// lvlBase — State Management
// ============================================================

const LvlState = (() => {
  const _state = {
    user:     null,
    school:   null,
    theme:    localStorage.getItem('lvl_theme') || 'dark',
    sidebar:  true,
    notifications: []
  };
  const _listeners = {};

  function get(key) { return key ? _state[key] : { ..._state }; }

  function set(key, value) {
    const old = _state[key];
    _state[key] = value;
    if (_listeners[key]) {
      _listeners[key].forEach(fn => fn(value, old));
    }
    if (_listeners['*']) {
      _listeners['*'].forEach(fn => fn({ key, value, old }));
    }
  }

  function on(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
    return () => off(key, fn);
  }

  function off(key, fn) {
    _listeners[key] = (_listeners[key] || []).filter(f => f !== fn);
  }

  function setTheme(theme) {
    set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lvl_theme', theme);
    document.body.className = document.body.className.replace(/theme-\S+/g,'').trim();
    if (theme !== 'dark') document.body.classList.add('theme-' + theme);
  }

  // Apply saved theme on load
  setTheme(_state.theme);

  return { get, set, on, off, setTheme };
})();

window.LvlState = LvlState;
