/* Life Sheet — moved out of dashboard.js into its own page.
   Same storage keys as before, so existing sheet data is preserved. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  /* ---------------- life sheet ---------------- */
  const SHEET_KEY = 'life_sheet_data_v2';
  const SHEET_ACTIVE_KEY = 'life_sheet_active_index';
  const SHEET_COLORS = ['#1c2b3a','#16332a','#3a2b16','#2b1c3a','#0f3d4a','#3a1616','#223047','#1f2937'];

  function blankSheet(name) {
    return { name: name, data: Array.from({ length: 3 }, () => ['', '', '']), headers: [], rowColors: [], colColors: [], cellColors: [] };
  }
  function defaultSheets() { return [blankSheet('Life Sheet 1')]; }
  const isEmptySheet = (sh) => Array.isArray(sh && sh.data) && sh.data.every(r => Array.isArray(r) && r.every(c => !String(c == null ? '' : c).trim()))
    && !(sh.headers || []).some(h => h && String(h).trim())
    && !(sh.rowColors || []).some(Boolean) && !(sh.colColors || []).some(Boolean)
    && !(sh.cellColors || []).some(r => Array.isArray(r) && r.some(Boolean));
  const isPresetName = (n) => /^Reading List \(\d{4}\)$/.test(n || '') || n === 'Health Habits';
  function normSheets() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SHEET_KEY) || 'null'); } catch (e) {}
    if (!Array.isArray(saved) || !saved.length) return defaultSheets();
    const SAMPLES = ['Deep Work: 4hr Daily Focus Block', 'Study: 4 hours of focused work'];
    if (saved[0] && Array.isArray(saved[0].data) && saved[0].data[0] && SAMPLES.includes(saved[0].data[0][0])) {
      saved[0].data = defaultSheets()[0].data;
      saved[0].rowColors = []; saved[0].colColors = []; saved[0].cellColors = [];
    }
    saved = saved.filter(sh => !(sh && isPresetName(sh.name) && isEmptySheet(sh)));
    saved = saved.map(sh => (sh && sh.name === 'Life Sheet 1' && isEmptySheet(sh) && sh.data.length === 5) ? blankSheet('Life Sheet 1') : sh);
    if (!saved.length) return defaultSheets();
    return saved.map((s, i) => ({
      name: (s && typeof s.name === 'string' && s.name.trim()) ? s.name : 'Sheet ' + (i + 1),
      headers: Array.isArray(s.headers) ? s.headers.map(h => String(h == null ? '' : h)) : [],
      data: (Array.isArray(s.data) && s.data.length ? s.data : [['','','']]).map(r => Array.isArray(r) ? r.map(c => String(c == null ? '' : c)) : ['']),
      rowColors: Array.isArray(s.rowColors) ? s.rowColors : [],
      colColors: Array.isArray(s.colColors) ? s.colColors : [],
      cellColors: Array.isArray(s.cellColors) ? s.cellColors : []
    }));
  }
  function saveSheets(sheets) { localStorage.setItem(SHEET_KEY, JSON.stringify(sheets)); }
  function activeSheetIndex() {
    const n = Number(localStorage.getItem(SHEET_ACTIVE_KEY) || 0);
    const sheets = normSheets();
    return (Number.isInteger(n) && n >= 0 && n < sheets.length) ? n : 0;
  }
  function getCellColor(sheet, r, c) {
    if (sheet.cellColors && sheet.cellColors[r] && sheet.cellColors[r][c]) return sheet.cellColors[r][c];
    if (sheet.rowColors && sheet.rowColors[r]) return sheet.rowColors[r];
    if (sheet.colColors && sheet.colColors[c]) return sheet.colColors[c];
    return '';
  }
  function isLightColor(hex) {
    if (!hex || hex === 'transparent') return false;
    const h = hex.replace('#','');
    if (h.length < 6) return true;
    const v = parseInt(h, 16);
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    return (0.2126*r + 0.7152*g + 0.0722*b) / 255 > 0.6;
  }

  let colorTarget = null;
let selected = null;
const colLabel = (c) => String.fromCharCode(65 + (c % 26));

function setSelected(r, c) {
  selected = { r, c };
  document.querySelectorAll('#life-sheet td.sel').forEach(el => el.classList.remove('sel'));
  const cell = document.querySelector('.lcell[data-r="' + r + '"][data-c="' + c + '"]');
  if (cell && cell.parentElement) cell.parentElement.classList.add('sel');
  const nb = $('sheet-namebox'); if (nb) nb.textContent = colLabel(c) + (r + 1);
  const fb = $('fmt-color'); if (fb) fb.disabled = false;
}
function clearSelected() {
  selected = null;
  const nb = $('sheet-namebox'); if (nb) nb.textContent = 'Tap a cell';
  const fb = $('fmt-color'); if (fb) fb.disabled = true;
}

  function renderSheetTabs() {
    const sheets = normSheets();
    const ai = activeSheetIndex();
    const wrap = $('sheet-tabs');
    wrap.innerHTML = '';
    sheets.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sheet-tab' + (i === ai ? ' active' : '');
      b.textContent = s.name;
      b.addEventListener('click', () => {
        if (i === ai) {
          const next = window.prompt('Rename sheet', s.name);
          if (next && next.trim()) {
            s.name = next.trim();
            saveSheets(sheets);
          }
        }
        localStorage.setItem(SHEET_ACTIVE_KEY, String(i));
        renderSheetTabs(); renderSheet();
      });
      wrap.appendChild(b);
    });
  }

  function renderSheet() {
    const sheets = normSheets();
    const ai = activeSheetIndex();
    const sheet = sheets[ai] || sheets[0];
    const table = $('life-sheet');
    table.innerHTML = '';
    const cols = Math.max(1, ...sheet.data.map(r => r.length));

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    const corner = document.createElement('th'); corner.textContent = '#'; hr.appendChild(corner);
    for (let c = 0; c < cols; c++) {
      const th = document.createElement('th');
      const colColor = sheet.colColors[c] || '';
      if (colColor) { th.style.background = colColor; th.style.color = isLightColor(colColor) ? '#1a2233' : '#e9eff7'; }
      th.innerHTML = '';
      const inner = document.createElement('div'); inner.className = 'th-inner';
      const span = document.createElement('span'); span.className = 'lhead';
      span.contentEditable = 'true'; span.spellcheck = false;
      span.dataset.c = c; span.dataset.ph = String.fromCharCode(65 + (c % 26));
      span.textContent = (sheet.headers && sheet.headers[c]) || '';
      const tools = document.createElement('span'); tools.className = 'cell-tools';
      const menu = document.createElement('button');
      menu.type = 'button'; menu.className = 'cell-menu'; menu.title = 'Column options'; menu.setAttribute('aria-label', 'Column options');
      menu.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      menu.addEventListener('click', (e) => { e.stopPropagation(); openColorPop({ type: 'col', c, anchor: menu }); });
      tools.appendChild(menu);
      inner.appendChild(span); inner.appendChild(tools);
      th.appendChild(inner);
      hr.appendChild(th);
    }
    thead.appendChild(hr); table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sheet.data.forEach((row, r) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      const rowColor = sheet.rowColors[r] || '';
      if (rowColor) { th.style.background = rowColor; th.style.color = isLightColor(rowColor) ? '#1a2233' : '#e9eff7'; }
      const rh = document.createElement('button'); rh.type = 'button'; rh.className = 'row-head row-num-btn';
      rh.title = 'Row options'; rh.setAttribute('aria-label', 'Row ' + (r + 1) + ' options');
      rh.textContent = String(r + 1);
      rh.addEventListener('click', (e) => { e.stopPropagation(); openColorPop({ type: 'row', r, anchor: rh }); });
      th.appendChild(rh);
      tr.appendChild(th);
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        const color = getCellColor(sheet, r, c);
        if (color) { td.style.background = color; td.style.color = isLightColor(color) ? '#1a2233' : '#e9eff7'; }
        const cell = document.createElement('div');
        cell.className = 'lcell';
        cell.contentEditable = 'true';
        cell.spellcheck = false;
        cell.dataset.r = r; cell.dataset.c = c;
        cell.textContent = row[c] || '';
        if (color) cell.style.color = isLightColor(color) ? '#1a2233' : '#e9eff7';
        if (selected && selected.r === r && selected.c === c) td.classList.add('sel');
        td.appendChild(cell);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    $('sheet-stats').textContent = 'ROWS: ' + sheet.data.length;
    if (selected && (selected.r >= sheet.data.length || selected.c >= cols)) clearSelected();
    else if (selected) setSelected(selected.r, selected.c);
  }

  function updateCell(r, c, value) {
    const sheets = normSheets();
    const ai = activeSheetIndex();
    const sheet = sheets[ai];
    if (!sheet) return;
    while (sheet.data.length <= r) sheet.data.push([]);
    while (sheet.data[r].length <= c) sheet.data[r].push('');
    sheet.data[r][c] = value;
    saveSheets(sheets);
  }

  function addRow() {
    const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
    const cols = Math.max(1, ...s.data.map(r => r.length));
    s.data.push(Array(cols).fill(''));
    saveSheets(sheets); renderSheet();
  }
  function delRow(r) {
    const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
    if (s.data.length <= 1) return;
    if (!window.confirm('Delete row ' + (r + 1) + '?')) return;
    s.data.splice(r, 1);
    if (Array.isArray(s.rowColors)) s.rowColors.splice(r, 1);
    if (Array.isArray(s.cellColors)) s.cellColors.splice(r, 1);
    saveSheets(sheets); renderSheet();
  }
  function addCol() {
    const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
    s.data.forEach(r => r.push(''));
    saveSheets(sheets); renderSheet();
  }
  function delCol(c) {
    const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
    if (s.data[0].length <= 1) return;
    if (!window.confirm('Delete column ' + ((s.headers && s.headers[c]) || String.fromCharCode(65 + c)) + '?')) return;
    s.data.forEach(r => r.splice(c, 1));
    if (Array.isArray(s.colColors)) s.colColors.splice(c, 1);
    if (Array.isArray(s.headers)) s.headers.splice(c, 1);
    if (Array.isArray(s.cellColors)) s.cellColors.forEach(rc => rc.splice(c, 1));
    saveSheets(sheets); renderSheet();
  }
  function addSheet() {
    const sheets = normSheets();
    sheets.push(blankSheet('Sheet ' + (sheets.length + 1)));
    saveSheets(sheets);
    localStorage.setItem(SHEET_ACTIVE_KEY, String(sheets.length - 1));
    renderSheetTabs(); renderSheet();
  }
  function deleteSheet() {
    const sheets = normSheets(); const ai = activeSheetIndex();
    if (!window.confirm('Delete "' + sheets[ai].name + '"?')) return;
    if (sheets.length <= 1) { saveSheets(defaultSheets()); localStorage.setItem(SHEET_ACTIVE_KEY, '0'); }
    else { sheets.splice(ai, 1); saveSheets(sheets); localStorage.setItem(SHEET_ACTIVE_KEY, String(Math.max(0, ai - 1))); }
    renderSheetTabs(); renderSheet();
  }

  function openColorPop(target) {
    colorTarget = target;
    const pop = $('sheet-color-pop');
    const grid = $('color-grid');
    grid.innerHTML = '';
    SHEET_COLORS.forEach(color => {
      const b = document.createElement('button');
      b.type = 'button'; b.style.background = color;
      b.addEventListener('click', () => applyColor(color));
      grid.appendChild(b);
    });
    const title = $('color-title'), del = $('color-delete');
    if (target.type === 'cell') { title.textContent = 'CELL ' + colLabel(target.c) + (target.r + 1) + ' COLOR'; del.hidden = true; }
    else if (target.type === 'row') { title.textContent = 'ROW ' + (target.r + 1); del.hidden = false; $('color-delete-label').textContent = 'Delete row'; }
    else { title.textContent = 'COLUMN ' + colLabel(target.c); del.hidden = false; $('color-delete-label').textContent = 'Delete column'; }
    pop.classList.add('open');
    const rect = target.anchor.getBoundingClientRect();
    const top = Math.min(rect.bottom + 8, window.innerHeight - 230);
    const left = Math.min(rect.left, window.innerWidth - 230);
    pop.style.top = Math.max(60, top) + 'px';
    pop.style.left = Math.max(8, left) + 'px';
  }
  function closeColorPop() { $('sheet-color-pop').classList.remove('open'); colorTarget = null; }
  function applyColor(color) {
    if (!colorTarget) return;
    const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
    const t = colorTarget;
    if (t.type === 'cell') {
      if (!Array.isArray(s.cellColors)) s.cellColors = [];
      while (s.cellColors.length <= t.r) s.cellColors.push([]);
      while ((s.cellColors[t.r] || []).length <= t.c) s.cellColors[t.r].push('');
      s.cellColors[t.r][t.c] = color;
    } else if (t.type === 'row') {
      if (!Array.isArray(s.rowColors)) s.rowColors = [];
      s.rowColors[t.r] = color;
    } else if (t.type === 'col') {
      if (!Array.isArray(s.colColors)) s.colColors = [];
      s.colColors[t.c] = color;
    }
    saveSheets(sheets);
    closeColorPop(); renderSheet();
  }

  /* ---------------- user chip ---------------- */
  function refreshUser() {
    const name = localStorage.getItem('life_user_name') || (window.lifeIsShortUser && (window.lifeIsShortUser.displayName || window.lifeIsShortUser.email)) || 'Guest';
    const mode = localStorage.getItem('lifeIsShort_mode');
    const nameEl = $('user-name'), initEl = $('user-initial'), syncEl = $('side-sync');
    if (nameEl) nameEl.textContent = name;
    if (initEl) initEl.textContent = (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    if (syncEl) syncEl.textContent = mode === 'account' ? 'SYNCED · CLOUD' : (mode === 'guest' ? 'SYNCED · LOCAL GUEST' : 'SYNCED · LOCAL');
  }

  /* ---------------- init ---------------- */
  function init() {
    renderSheetTabs(); renderSheet();
    $('add-sheet-btn').addEventListener('click', addSheet);
    $('add-sheet-row').addEventListener('click', addRow);
    $('add-sheet-col').addEventListener('click', addCol);
    $('delete-sheet-btn').addEventListener('click', deleteSheet);
    $('color-delete').addEventListener('click', () => {
      if (!colorTarget) return;
      const t = colorTarget; closeColorPop();
      if (t.type === 'row') delRow(t.r); else if (t.type === 'col') delCol(t.c);
    });
    $('fmt-color').addEventListener('click', (e) => {
      e.stopPropagation();
      if (selected) openColorPop({ type: 'cell', r: selected.r, c: selected.c, anchor: $('fmt-color') });
    });
    document.addEventListener('focusin', (e) => {
      const t = e.target;
      if (t.classList && t.classList.contains('lcell')) setSelected(Number(t.dataset.r), Number(t.dataset.c));
    });
    $('color-none').addEventListener('click', () => {
      if (!colorTarget) return;
      const sheets = normSheets(); const ai = activeSheetIndex(); const s = sheets[ai];
      const t = colorTarget;
      if (t.type === 'cell' && s.cellColors[t.r]) s.cellColors[t.r][t.c] = '';
      else if (t.type === 'row') s.rowColors[t.r] = '';
      else if (t.type === 'col') s.colColors[t.c] = '';
      saveSheets(sheets); closeColorPop(); renderSheet();
    });
    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t.classList && t.classList.contains('lcell')) {
        updateCell(Number(t.dataset.r), Number(t.dataset.c), t.textContent || '');
      } else if (t.classList && t.classList.contains('lhead')) {
        const sheets = normSheets(); const sh = sheets[activeSheetIndex()]; if (!sh) return;
        const c = Number(t.dataset.c);
        while (sh.headers.length <= c) sh.headers.push('');
        sh.headers[c] = (t.textContent || '').replace(/\n/g, ' ');
        saveSheets(sheets);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('lhead')) { e.preventDefault(); e.target.blur(); }
    });
    document.addEventListener('click', (e) => {
      const pop = $('sheet-color-pop');
      if (pop.classList.contains('open') && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.cell-menu, .row-num-btn, #fmt-color'))) {
        closeColorPop();
      }
    });

    refreshUser();
    document.addEventListener('lifeIsShortAuthState', refreshUser);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
