/* Birth-date picker for the Life Calendar page.
   Opens inside the page (a centred card) instead of the browser's own pop-up.
   Needs: <input type="hidden" id="birthdate"> (holds YYYY-MM-DD) and
   <button id="birthdate-btn"><span></span></button>. */
(function () {
  const input = document.getElementById('birthdate');
  const btn = document.getElementById('birthdate-btn');
  if (!input || !btn || window.__datePickerReady) return;
  window.__datePickerReady = true;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const pad = n => String(n).padStart(2, '0');
  const parse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };
  const now = new Date();
  const MIN_Y = 1900, MAX_Y = now.getFullYear();
  let view = 'days', vy = MAX_Y, vm = 0, ys = MIN_Y;

  function syncLabel() {
    const p = parse(input.value);
    const span = btn.querySelector('span');
    if (span) span.textContent = p ? p.d + ' ' + MONTHS[p.m].slice(0, 3) + ' ' + p.y : 'Select date';
  }
  window.syncBirthdateBtn = syncLabel;
  syncLabel();

  const overlay = document.createElement('div');
  overlay.className = 'dp-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="dp" role="dialog" aria-modal="true" aria-label="Choose birth date" tabindex="-1">' +
      '<div class="dp-head">' +
        '<button type="button" class="dp-nav" data-nav="-1" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<button type="button" class="dp-title" aria-live="polite"></button>' +
        '<button type="button" class="dp-nav" data-nav="1" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>' +
      '</div>' +
      '<div class="dp-body"></div>' +
      '<div class="dp-foot"><button type="button" class="dp-cancel">Cancel</button></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const box = overlay.querySelector('.dp');
  const titleEl = overlay.querySelector('.dp-title');
  const body = overlay.querySelector('.dp-body');
  const prevBtn = overlay.querySelector('[data-nav="-1"]');
  const nextBtn = overlay.querySelector('[data-nav="1"]');
  const caret = ' <i class="fa-solid fa-caret-down"></i>';

  function render() {
    const sel = parse(input.value);
    let html = '';
    if (view === 'days') {
      titleEl.innerHTML = MONTHS[vm] + ' ' + vy + caret;
      prevBtn.disabled = vy === MIN_Y && vm === 0;
      nextBtn.disabled = vy === MAX_Y && vm === now.getMonth();
      const first = new Date(vy, vm, 1).getDay();
      const count = new Date(vy, vm + 1, 0).getDate();
      html = '<div class="dp-grid days">' + 'SMTWTFS'.split('').map(d => '<span class="dp-dow">' + d + '</span>').join('');
      for (let i = 0; i < first; i++) html += '<span></span>';
      for (let d = 1; d <= count; d++) {
        const future = new Date(vy, vm, d) > now;
        const isSel = sel && sel.y === vy && sel.m === vm && sel.d === d;
        html += '<button type="button" class="dp-cell' + (isSel ? ' sel' : '') + '" data-day="' + d + '"' + (future ? ' disabled' : '') + '>' + d + '</button>';
      }
      html += '</div>';
    } else if (view === 'months') {
      titleEl.innerHTML = vy + caret;
      prevBtn.disabled = vy <= MIN_Y;
      nextBtn.disabled = vy >= MAX_Y;
      html = '<div class="dp-grid pick">';
      MONTHS.forEach((name, i) => {
        const future = vy === MAX_Y && i > now.getMonth();
        const isSel = sel && sel.y === vy && sel.m === i;
        html += '<button type="button" class="dp-cell' + (isSel ? ' sel' : '') + '" data-month="' + i + '"' + (future ? ' disabled' : '') + '>' + name.slice(0, 3) + '</button>';
      });
      html += '</div>';
    } else {
      titleEl.textContent = ys + ' – ' + (ys + 11);
      prevBtn.disabled = ys <= MIN_Y;
      nextBtn.disabled = ys + 12 > MAX_Y;
      html = '<div class="dp-grid pick">';
      for (let y = ys; y < ys + 12; y++) {
        const isSel = sel && sel.y === y;
        html += '<button type="button" class="dp-cell' + (isSel ? ' sel' : '') + '" data-year="' + y + '"' + (y > MAX_Y ? ' disabled' : '') + '>' + y + '</button>';
      }
      html += '</div>';
    }
    body.innerHTML = html;
  }

  function open() {
    const p = parse(input.value);
    vy = p ? p.y : MAX_Y - 20;
    vm = p ? p.m : 0;
    if (vy === MAX_Y && vm > now.getMonth()) vm = now.getMonth();
    view = 'days';
    render();
    overlay.hidden = false;
    document.body.classList.add('dp-open');
    box.focus({ preventScroll: true });
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('dp-open');
    btn.focus({ preventScroll: true });
  }

  const yearPage = () => MIN_Y + Math.floor((vy - MIN_Y) / 12) * 12;

  btn.addEventListener('click', open);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.dp-cancel').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });

  titleEl.addEventListener('click', () => {
    if (view === 'years') view = 'days';
    else { ys = yearPage(); view = 'years'; }
    render();
  });

  overlay.querySelectorAll('.dp-nav').forEach(b => b.addEventListener('click', () => {
    const dir = Number(b.dataset.nav);
    if (view === 'days') {
      vm += dir;
      if (vm < 0) { vm = 11; vy--; }
      if (vm > 11) { vm = 0; vy++; }
    } else if (view === 'months') {
      vy += dir;
    } else {
      ys += dir * 12;
    }
    render();
  }));

  body.addEventListener('click', (e) => {
    const cell = e.target.closest('.dp-cell');
    if (!cell || cell.disabled) return;
    if (cell.dataset.day) {
      input.value = vy + '-' + pad(vm + 1) + '-' + pad(Number(cell.dataset.day));
      syncLabel();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    } else if (cell.dataset.month) {
      vm = Number(cell.dataset.month);
      view = 'days';
      render();
    } else if (cell.dataset.year) {
      vy = Number(cell.dataset.year);
      view = 'months';
      render();
    }
  });
})();
