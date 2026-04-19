// ============================================================
// lvlBase — UI Components
// Toast, Modal, Sidebar, Loading, etc.
// ============================================================

const LvlUI = (() => {

  // ── Toast System ──
  const TOAST_TYPES = {
    success: { icon: '✅', color: 'var(--success)', bg: 'rgba(0,184,148,0.15)' },
    error:   { icon: '❌', color: 'var(--danger)',  bg: 'rgba(214,48,49,0.15)' },
    warning: { icon: '⚠️', color: 'var(--warning)', bg: 'rgba(253,203,110,0.15)' },
    info:    { icon: 'ℹ️', color: 'var(--info)',    bg: 'rgba(116,185,255,0.15)' },
    xp:      { icon: '⚡', color: 'var(--warning)', bg: 'rgba(253,203,110,0.12)' }
  };
  const TOAST_PRIORITY = { error:4, warning:3, xp:3, success:2, info:1 };
  let toastQueue = [];
  let toastContainer = null;
  let soundEnabled = localStorage.getItem('lvl_sound') !== 'false';

  function _ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'lvl-toast-container';
      toastContainer.style.cssText = `
        position:fixed; top:20px; right:20px; z-index:9999;
        display:flex; flex-direction:column; gap:10px;
        pointer-events:none; max-width:360px;
      `;
      document.body.appendChild(toastContainer);
    }
  }

  function toast(title, message = '', type = 'info', duration = 4000) {
    _ensureToastContainer();
    const cfg = TOAST_TYPES[type] || TOAST_TYPES.info;
    const priority = TOAST_PRIORITY[type] || 1;

    const el = document.createElement('div');
    el.style.cssText = `
      display:flex; align-items:flex-start; gap:12px;
      padding:14px 18px; border-radius:14px;
      background:${cfg.bg}; backdrop-filter:blur(20px);
      border:1px solid ${cfg.color}33;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      pointer-events:all; cursor:pointer;
      animation:slideInRight .3s cubic-bezier(.34,1.56,.64,1) forwards;
      transition:all .25s; min-width:260px; max-width:360px;
      font-family:var(--font-sans); color:#fff;
    `;
    el.innerHTML = `
      <span style="font-size:1.2rem;line-height:1.4;flex-shrink:0;">${cfg.icon}</span>
      <div style="flex:1; min-width:0;">
        <div style="font-weight:700;font-size:.88rem;color:${cfg.color};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
        ${message ? `<div style="font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.4;">${message}</div>` : ''}
      </div>
      <button onclick="this.parentElement.remove()" style="
        background:none;border:none;color:rgba(255,255,255,.4);
        cursor:pointer;font-size:1rem;padding:0;line-height:1;flex-shrink:0;
      ">✕</button>
    `;

    // Insert by priority
    let inserted = false;
    const children = [...toastContainer.children];
    for (const child of children) {
      if ((parseInt(child.dataset.priority) || 0) < priority) {
        toastContainer.insertBefore(el, child);
        inserted = true;
        break;
      }
    }
    if (!inserted) toastContainer.appendChild(el);
    el.dataset.priority = priority;

    // Dismiss on click
    el.addEventListener('click', () => _dismissToast(el));

    // Auto dismiss
    const timer = setTimeout(() => _dismissToast(el), duration);
    el._timer = timer;

    // Sound
    if (soundEnabled) _playSound(type);

    return el;
  }

  function _dismissToast(el) {
    clearTimeout(el._timer);
    el.style.animation = 'fadeOut .25s ease forwards';
    el.style.opacity = '0';
    el.style.transform = 'translateX(30px)';
    setTimeout(() => el.remove(), 280);
  }

  function _playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const freqs = { success: 880, error: 220, warning: 440, info: 660, xp: 1046 };
      osc.frequency.value = freqs[type] || 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  }

  // ── Modal System ──
  let modalStack = [];

  function modal({ title, content, actions = [], size = 'md', closable = true, onClose }) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);
      z-index:9000;display:flex;align-items:center;justify-content:center;
      padding:20px;animation:fadeIn .2s ease forwards;
    `;
    const sizes = { sm:'400px', md:'520px', lg:'720px', xl:'900px', full:'95vw' };
    const card = document.createElement('div');
    card.style.cssText = `
      background:rgba(18,18,42,.95);backdrop-filter:blur(30px);
      border:1px solid rgba(255,255,255,.12);border-radius:24px;
      padding:28px;width:100%;max-width:${sizes[size]||sizes.md};
      max-height:90vh;overflow-y:auto;
      animation:scaleIn .3s cubic-bezier(.34,1.56,.64,1) forwards;
      font-family:var(--font-sans);color:#fff;
      box-shadow:0 32px 80px rgba(0,0,0,.6);
    `;

    const actionsHTML = actions.map(a => `
      <button data-action="${a.key||''}" style="
        padding:10px 20px;border:none;border-radius:10px;
        background:${a.type==='primary'?'linear-gradient(135deg,#6C5CE7,#5A4BD1)':a.type==='danger'?'linear-gradient(135deg,#D63031,#b72929)':'rgba(255,255,255,.08)'};
        color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;
        transition:all .2s;font-family:var(--font-sans);
      ">${a.label}</button>
    `).join('');

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h3 style="font-size:1.15rem;font-weight:800;margin:0;">${title}</h3>
        ${closable?'<button class="modal-close" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 10px;color:#fff;cursor:pointer;font-size:.85rem;">✕</button>':''}
      </div>
      <div class="modal-body">${content}</div>
      ${actions.length ? `<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">${actionsHTML}</div>` : ''}
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    modalStack.push(overlay);

    // Close handlers
    if (closable) {
      card.querySelector('.modal-close')?.addEventListener('click', () => closeModal(overlay));
      overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay); });
    }
    // Action handlers
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = actions.find(a => a.key === btn.dataset.action);
        if (action?.onClick) action.onClick(overlay);
        if (action?.close !== false) closeModal(overlay);
      });
    });

    // Keyboard
    const keyHandler = e => { if (e.key === 'Escape' && closable) closeModal(overlay); };
    document.addEventListener('keydown', keyHandler);
    overlay._keyHandler = keyHandler;

    return overlay;
  }

  function closeModal(overlay) {
    if (!overlay) overlay = modalStack[modalStack.length - 1];
    if (!overlay) return;
    overlay.style.animation = 'fadeOut .2s ease forwards';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      modalStack = modalStack.filter(m => m !== overlay);
    }, 220);
    document.removeEventListener('keydown', overlay._keyHandler);
  }

  function confirm(title, message, onConfirm, destructive = false) {
    return modal({
      title, content: `<p style="color:rgba(255,255,255,.7);font-size:.9rem;">${message}</p>`,
      actions: [
        { key:'cancel', label:'Cancel', type:'secondary' },
        { key:'confirm', label:'Confirm', type: destructive ? 'danger' : 'primary', onClick: onConfirm }
      ]
    });
  }

  function prompt(title, placeholder, onSubmit) {
    const inputId = 'lvl-prompt-' + Date.now();
    return modal({
      title,
      content: `<input id="${inputId}" placeholder="${placeholder}" style="
        width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        border-radius:10px;color:#fff;font-size:.9rem;padding:10px 14px;
        outline:none;font-family:var(--font-sans);
      ">`,
      actions: [
        { key:'cancel', label:'Cancel', type:'secondary' },
        { key:'submit', label:'Submit', type:'primary', onClick: overlay => {
          const val = document.getElementById(inputId)?.value;
          if (onSubmit) onSubmit(val);
        }}
      ]
    });
  }

  // ── Loading Overlay ──
  function showLoader(msg = 'Loading...') {
    let loader = document.getElementById('lvl-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'lvl-loader';
      loader.innerHTML = `
        <div style="text-align:center;color:#fff;font-family:var(--font-sans);">
          <div style="
            width:48px;height:48px;border:3px solid rgba(255,255,255,.1);
            border-top-color:#6C5CE7;border-radius:50%;
            animation:spin .8s linear infinite;margin:0 auto 16px;
          "></div>
          <div id="lvl-loader-msg" style="font-size:.9rem;color:rgba(255,255,255,.7);">${msg}</div>
        </div>
      `;
      loader.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);
        z-index:9998;display:flex;align-items:center;justify-content:center;
        animation:fadeIn .2s ease forwards;
      `;
      document.body.appendChild(loader);
    } else {
      document.getElementById('lvl-loader-msg').textContent = msg;
    }
  }
  function hideLoader() {
    const loader = document.getElementById('lvl-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 200);
    }
  }

  // ── Sidebar Toggle ──
  function initSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle  = document.getElementById('sidebar-toggle');
    if (!sidebar) return;

    toggle?.addEventListener('click', () => toggleSidebar());
    overlay?.addEventListener('click', () => closeSidebar());

    // Mark active nav item
    const path = window.location.pathname;
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('href') === path) item.classList.add('active');
    });
  }
  function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show');
    document.body.style.overflow = sidebar?.classList.contains('open') ? 'hidden' : '';
  }
  function closeSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ── XP Popup ──
  function showXPGain(amount, x, y) {
    const el = document.createElement('div');
    el.className = 'xp-popup';
    el.textContent = `+${amount} XP`;
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top  = (y || 200) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  // ── Level Up Celebration ──
  function celebrateLevelUp(rank) {
    const el = document.createElement('div');
    el.className = 'level-up-banner';
    el.innerHTML = `
      <div style="font-size:4rem;margin-bottom:8px;">🎉</div>
      <div class="level-up-text">RANK UP!</div>
      <div style="font-size:2rem;font-weight:800;color:#fff;margin-top:8px;">${rank} Rank Achieved</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; setTimeout(() => el.remove(), 500); }, 2500);
  }

  // ── Toggle Sound ──
  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('lvl_sound', soundEnabled);
    toast(soundEnabled ? 'Sound On 🔊' : 'Sound Off 🔇', '', 'info', 2000);
    return soundEnabled;
  }

  // ── Dropdown ──
  function initDropdowns() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-dropdown]');
      if (trigger) {
        const menu = document.getElementById(trigger.dataset.dropdown);
        menu?.classList.toggle('open');
        e.stopPropagation();
        return;
      }
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    });
  }

  // ── Tabs ──
  function initTabs(container) {
    if (!container) return;
    const tabs    = container.querySelectorAll('[data-tab]');
    const panels  = container.querySelectorAll('[data-panel]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
      });
    });
  }

  // ── Initialize all UI ──
  function init() {
    initSidebar();
    initDropdowns();
    document.querySelectorAll('.tabs').forEach(initTabs);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  return {
    toast, modal, closeModal, confirm, prompt,
    showLoader, hideLoader,
    initSidebar, toggleSidebar, closeSidebar,
    showXPGain, celebrateLevelUp, toggleSound,
    initTabs
  };
})();

window.LvlUI = LvlUI;
