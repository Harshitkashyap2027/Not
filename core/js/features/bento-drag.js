// ============================================================
// lvlBase — Bento Drag & Drop
// ============================================================

const LvlBento = (() => {
  function init(gridEl) {
    if (!gridEl) return;
    const cards = gridEl.querySelectorAll('[draggable="true"]');
    let dragSrc = null;

    cards.forEach(card => {
      card.addEventListener('dragstart', e => {
        dragSrc = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        gridEl.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
      });
      card.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (card !== dragSrc) card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (dragSrc && dragSrc !== card) {
          const allCards = [...gridEl.querySelectorAll('[draggable="true"]')];
          const srcIdx  = allCards.indexOf(dragSrc);
          const destIdx = allCards.indexOf(card);
          if (srcIdx < destIdx) gridEl.insertBefore(dragSrc, card.nextSibling);
          else                   gridEl.insertBefore(dragSrc, card);
          _saveLayout(gridEl);
        }
      });
    });

    // Touch support
    _initTouch(gridEl);
  }

  function _saveLayout(gridEl) {
    const ids = [...gridEl.querySelectorAll('[data-id]')].map(c => c.dataset.id);
    const key = 'lvl_bento_' + (gridEl.id || 'default');
    localStorage.setItem(key, JSON.stringify(ids));
  }

  function _loadLayout(gridEl) {
    const key  = 'lvl_bento_' + (gridEl.id || 'default');
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (!saved) return;
    saved.forEach(id => {
      const card = gridEl.querySelector(`[data-id="${id}"]`);
      if (card) gridEl.appendChild(card);
    });
  }

  function _initTouch(gridEl) {
    let touchSrc = null, clone = null, startX, startY;

    gridEl.addEventListener('touchstart', e => {
      const card = e.target.closest('[draggable="true"]');
      if (!card) return;
      touchSrc = card;
      const r = card.getBoundingClientRect();
      startX = e.touches[0].clientX - r.left;
      startY = e.touches[0].clientY - r.top;
    }, { passive: true });

    gridEl.addEventListener('touchmove', e => {
      if (!touchSrc) return;
      e.preventDefault();
      const t = e.touches[0];
      // Find card under touch
      touchSrc.style.opacity = '0';
      const el = document.elementFromPoint(t.clientX, t.clientY);
      touchSrc.style.opacity = '';
      const target = el?.closest('[draggable="true"]');
      if (target && target !== touchSrc) {
        const rect = target.getBoundingClientRect();
        const mid  = rect.top + rect.height / 2;
        if (t.clientY < mid) gridEl.insertBefore(touchSrc, target);
        else gridEl.insertBefore(touchSrc, target.nextSibling);
      }
    }, { passive: false });

    gridEl.addEventListener('touchend', () => {
      if (touchSrc) { _saveLayout(gridEl); touchSrc = null; }
    });
  }

  return { init, loadLayout: _loadLayout };
})();

window.LvlBento = LvlBento;
