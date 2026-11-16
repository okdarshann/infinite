/* Infinite dashboard logic — progress, goals, life sheet, daily quote.
   FIX (2026-09-29): year/month/week/quarter percentages now count the current
   day as elapsed (day-of-year/365 etc.), matching the elapsed/remaining day
   counters. The "pace" stat is now a true ratio of actual time passed vs the
   calendar-day average, so it reads ~1.00x of average instead of 8.93x. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const QUARTERS = ['Q1 / SPRING','Q2 / SUMMER','Q3 / AUTUMN','Q4 / WINTER'];
  const daysWord = (n) => (n === 1 ? ' Day' : ' Days');

  /* ---------------- time engine ---------------- */
  function yearInfo(now) {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const total = Math.round((end - start) / 864e5);
    const dayOfYear = Math.floor((now - start) / 864e5) + 1;
    const pct = (dayOfYear / total) * 100;              // current day counts as elapsed
    const elapsed = dayOfYear;
    const left = total - elapsed;
    const fracDays = (now - start) / 864e5;             // continuous, for pace only
    const pace = fracDays / (dayOfYear - 0.5);          // vs. midpoint of the current day
    return { pct, elapsed, left, total, dayOfYear, pace };
  }
  function monthInfo(now) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const total = Math.round((end - start) / 864e5);
    const dayOfMonth = now.getDate();                   // current day counts as elapsed
    const pct = (dayOfMonth / total) * 100;
    const elapsed = dayOfMonth;
    const left = total - elapsed;
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { pct, elapsed, left, total, name: MONTHS[now.getMonth()], nextName: MONTHS[next.getMonth()] };
  }
  function weekInfo(now) {
    const day = now.getDay();
    const sinceMon = (day + 6) % 7;
    const dayIndex = sinceMon + 1;                      // Monday = 1 ... Sunday = 7
    const pct = (dayIndex / 7) * 100;
    const elapsed = dayIndex;
    const left = 7 - dayIndex;
    // ISO week number
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 864e5) + 1) / 7);
    return { pct, elapsed, left, num: week };
  }

  function setDonut(circleEl, valEl, pct, color) {
    const r = 40, c = 2 * Math.PI * r;
    circleEl.style.strokeDasharray = String(c);
    circleEl.style.strokeDashoffset = String(c);
    circleEl.style.stroke = color;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circleEl.style.strokeDashoffset = String(c * (1 - Math.min(100, pct) / 100));
      });
    });
    valEl.textContent = pct.toFixed(1).replace(/\.0$/, '') + '%';
  }

  function renderTime() {
    const now = new Date();
    const y = yearInfo(now), m = monthInfo(now), w = weekInfo(now);

    $('hero-year').textContent = now.getFullYear();
    $('hero-pct').textContent = y.pct.toFixed(2) + '%';
    $('hero-elapsed').textContent = y.elapsed;
    $('hero-left').textContent = y.left;
    $('hero-velocity').textContent = y.pace.toFixed(2) + '×';   // FIX: was pct/100*12 (=8.93x)

    $('yt-fill').style.width = y.pct + '%';
    $('yt-badge').textContent = y.pct.toFixed(2) + '%';
    const flag = $('today-flag');
    flag.style.left = Math.min(97, Math.max(3, y.pct)) + '%';
    $('today-lbl').textContent = MONTHS[now.getMonth()].toUpperCase() + ' ' + now.getDate();

    // month ticks
    const ticks = $('yt-ticks');
    ticks.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const t = document.createElement('span');
      t.className = 'tick' + (i === now.getMonth() ? ' now' : '');
      t.textContent = MONTHS[i].toUpperCase();
      ticks.appendChild(t);
    }

    // quarters — count the current day (Q3 on Sep 29 = 91/92, not 98%)
    const qWrap = $('quarters');
    qWrap.innerHTML = '';
    for (let q = 0; q < 4; q++) {
      const qs = new Date(now.getFullYear(), q * 3, 1);
      const qe = new Date(now.getFullYear(), q * 3 + 3, 1);
      const qTotal = Math.round((qe - qs) / 864e5);
      let qPct, qElapsed, state;
      if (now < qs) { qPct = 0; qElapsed = 0; state = ''; }
      else if (now >= qe) { qPct = 100; qElapsed = qTotal; state = 'done'; }
      else { qElapsed = Math.floor((now - qs) / 864e5) + 1; qPct = (qElapsed / qTotal) * 100; state = 'active'; }
      const card = document.createElement('div');
      card.className = 'q-card ' + state;
      card.innerHTML =
        '<div class="qh"><span>' + QUARTERS[q] + '</span><span class="st">' +
        (state === 'done' ? '<i class="fa-solid fa-circle-check"></i>' : state === 'active' ? Math.round(qPct) + '%' : '<i class="fa-solid fa-lock"></i>') +
        '</span></div>' +
        '<div class="qp"><b>' + qElapsed + ' / ' + qTotal + '</b> Days</div>' +
        '<div class="q-track"><div class="q-fill" style="width:' + qPct + '%"></div></div>';
      qWrap.appendChild(card);
    }

    setDonut($('donut-year'), $('dval-year'), y.pct, '#8f8ff0');
    setDonut($('donut-month'), $('dval-month'), m.pct, '#3ddc97');
    setDonut($('donut-week'), $('dval-week'), w.pct, '#f5b04a');

    $('cad-year-name').textContent = 'Year ' + now.getFullYear();
    $('y-elapsed').textContent = y.elapsed;
    $('y-left').textContent = y.left;
    $('y-left').nextSibling.textContent = daysWord(y.left);      // "1 Day" not "1 Days"
    $('y-weeks').textContent = Math.floor(y.dayOfYear / 7) + ' WEEKS DONE';
    $('cad-month-name').textContent = m.name + ' Finale';
    $('m-elapsed').textContent = m.elapsed;
    $('m-left').textContent = m.left;
    $('m-left').nextSibling.textContent = daysWord(m.left);
    $('m-next').textContent = m.nextName.toUpperCase() + ' STARTS NEXT';
    $('cad-week-name').textContent = 'Week ' + w.num + ' / 52';
    $('w-elapsed').textContent = w.elapsed;
    $('w-left').textContent = w.left;
    $('w-left').nextSibling.textContent = daysWord(w.left);
    $('w-dayname').textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
    $('monthly-meta').textContent = m.name.toUpperCase() + ' GOALS';
    $('weekly-meta').textContent = 'WEEK ' + w.num + '';

    $('side-day').textContent = 'DAY ' + y.dayOfYear + ' / ' + y.total;
    $('side-year-fill').style.width = y.pct + '%';
    // Today's date (e.g. WED, 30 SEP 2026) — refreshed by renderTime() so it rolls over at midnight
    const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    $('epoch-lbl').textContent = DOW[now.getDay()] + ', ' + now.getDate() + ' ' + MON[now.getMonth()] + ' ' + now.getFullYear();
    const tzMin = -now.getTimezoneOffset();
    const sign = tzMin >= 0 ? '+' : '-';
    const abs = Math.abs(tzMin);
    $('tz-lbl').textContent = 'UTC' + sign + String(Math.floor(abs / 60)).padStart(2, '0') + ':' + String(abs % 60).padStart(2, '0') + ' · LOCAL';

    $('axiom-day').textContent = '· Day ' + y.dayOfYear;
  }

/* ---------------- axiom ---------------- */
const QUOTES = [
    ['The trouble is, you think you have time.', 'Jack Kornfield'],
    ['You could be good today; instead you choose tomorrow.', 'Marcus Aurelius'],
    ['It is not that we have a short time to live, but that we waste a great deal of it.', 'Seneca'],
    ['Do not act as if you had ten thousand years to throw away.', 'Marcus Aurelius'],
    ['Begin at once to live, and count each separate day as a separate life.', 'Seneca'],
    ['How we spend our days is, of course, how we spend our lives.', 'Annie Dillard'],
    ['Lost time is never found again.', 'Benjamin Franklin'],
    ["Don't count the days, make the days count.", 'Muhammad Ali']
  ];
  let quoteIdx = 0;
  function setQuote(i) {
    quoteIdx = ((i % QUOTES.length) + QUOTES.length) % QUOTES.length;
    $('axiom-text').textContent = '"' + QUOTES[quoteIdx][0] + '"';
    $('axiom-by').textContent = '- ' + QUOTES[quoteIdx][1];
  }
  function copyAxiom() {
    const text = $('axiom-text').textContent + ' ' + $('axiom-by').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Quote copied'));
  }

  /* ---------------- toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  /* ---------------- goals ---------------- */
  const GOAL_TYPES = ['daily', 'weekly', 'monthly', 'yearly'];
  let goals = [];

  function loadGoals() {
    try {
      const raw = JSON.parse(localStorage.getItem('goals') || '[]');
      goals = Array.isArray(raw) ? raw.filter(g => g && g.goal_type) : [];
    } catch (e) { goals = []; }
  }
  function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
  }
  function addGoal(type, text) {
    const t = (text || '').trim();
    if (!t) return;
    goals.push({ id: Date.now() + Math.floor(Math.random() * 999), text: t, goal_type: type, done: false, created: new Date().toISOString() });
    saveGoals();
    toast(type.charAt(0).toUpperCase() + type.slice(1) + ' goal added');
  }
  function toggleGoal(id) {
    const g = goals.find(x => x.id === id);
    if (!g) return;
    g.done = !g.done;
    saveGoals();
    if (g.done) toast('Goal complete');
  }
  function deleteGoal(id) {
    goals = goals.filter(x => x.id !== id);
    saveGoals();
  }

  function renderGoalItems(type) {
    const list = goals.filter(g => g.goal_type === type);
    const el = $(type + '-list');
    if (!list.length) {
      el.innerHTML = '<div class="empty-hint">No goals yet. Add one below.</div>';
      return;
    }
    el.innerHTML = '';
    list.forEach(g => {
      const row = document.createElement('div');
      row.className = 'v-item' + (g.done ? ' done' : '');
      const check = document.createElement('button');
      check.className = 'v-check' + (g.done ? ' on' : '');
      check.innerHTML = '<i class="fa-solid fa-check"></i>';
      check.setAttribute('aria-label', g.done ? 'Mark pending' : 'Mark done');
      check.addEventListener('click', () => toggleGoal(g.id));
      const txt = document.createElement('span');
      txt.className = 'txt';
      txt.textContent = g.text;
      txt.title = g.text;
      const del = document.createElement('button');
      del.className = 'v-del';
      del.innerHTML = '×';
      del.setAttribute('aria-label', 'Delete goal');
      del.addEventListener('click', () => deleteGoal(g.id));
      row.appendChild(check); row.appendChild(txt); row.appendChild(del);
      el.appendChild(row);
    });
  }

  function renderGoals() {
    GOAL_TYPES.forEach(renderGoalItems);
    const d = goals.filter(g => g.goal_type === 'daily');
    $('daily-count').textContent = d.filter(g => g.done).length + '/' + d.length + ' DONE';
    const wk = goals.filter(g => g.goal_type === 'weekly');
    const we = goals.filter(g => g.goal_type === 'weekly' && g.done).length;
    $('w-done-count').textContent = we + ' OF ' + wk.length + ' COMPLETED';
    const now = new Date();
    const yEnd = new Date(now.getFullYear(), 11, 31);
    const daysLeft = Math.max(0, Math.ceil((yEnd - now) / 864e5));
    $('yearly-meta').textContent = now.getFullYear() + ' · ' + daysLeft + 'd LEFT';
    refreshGoalBadges();
  }

  /* ---------------- phone: goals as a list + centred popup ---------------- */
  const goalCols = {};          // goal type -> its .vector-col
  let goalPop = null;           // popup elements + which type is open

  function refreshGoalBadges() {
    GOAL_TYPES.forEach(t => {
      const col = goalCols[t];
      const badge = col && col.querySelector('.v-count');
      if (badge) badge.textContent = goals.filter(g => g.goal_type === t).length;
    });
    syncGoalPopHead();
  }

  function syncGoalPopHead() {
    if (!goalPop || !goalPop.openType) return;
    const meta = goalCols[goalPop.openType].querySelector('.v-meta');
    goalPop.meta.textContent = meta ? meta.textContent : '';
  }

  function openGoalPop(type) {
    const col = goalCols[type];
    if (!goalPop || !col) return;
    if (goalPop.openType) closeGoalPop();
    const name = col.querySelector('.v-name');
    const dot = col.querySelector('.v-dot');
    goalPop.title.textContent = name ? name.textContent : '';
    goalPop.dot.style.background = dot ? dot.style.background : '';
    /* Move the real list + input into the popup, so every existing handler keeps working. */
    goalPop.body.appendChild($(type + '-list'));
    goalPop.body.appendChild($(type + '-add').closest('.v-add'));
    goalPop.openType = type;
    syncGoalPopHead();
    goalPop.overlay.hidden = false;
    document.body.classList.add('goal-pop-open');
    goalPop.box.focus({ preventScroll: true });
  }

  function closeGoalPop() {
    if (!goalPop || !goalPop.openType) return;
    const type = goalPop.openType;
    const col = goalCols[type];
    col.appendChild($(type + '-list'));
    col.appendChild($(type + '-add').closest('.v-add'));
    goalPop.openType = null;
    goalPop.overlay.hidden = true;
    document.body.classList.remove('goal-pop-open');
    const head = col.querySelector('.v-head');
    if (head && head.offsetParent !== null) head.focus({ preventScroll: true });
  }

  function initGoalPopup() {
    const mq = window.matchMedia ? window.matchMedia('(max-width: 860px)') : { matches: false };

    GOAL_TYPES.forEach(t => {
      const list = $(t + '-list');
      const col = list && list.closest('.vector-col');
      const head = col && col.querySelector('.v-head');
      if (!head) return;
      goalCols[t] = col;
      const count = document.createElement('span');
      count.className = 'v-count';
      count.setAttribute('aria-hidden', 'true');
      const chev = document.createElement('i');
      chev.className = 'fa-solid fa-chevron-right v-chev';
      chev.setAttribute('aria-hidden', 'true');
      head.appendChild(count);
      head.appendChild(chev);
      head.addEventListener('click', () => { if (mq.matches) openGoalPop(t); });
      head.addEventListener('keydown', (e) => {
        if (mq.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openGoalPop(t); }
      });
    });

    const overlay = document.createElement('div');
    overlay.className = 'goal-pop-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="goal-pop" role="dialog" aria-modal="true" aria-labelledby="goal-pop-title" tabindex="-1">' +
        '<div class="goal-pop-head">' +
          '<span class="v-dot"></span>' +
          '<span class="goal-pop-title" id="goal-pop-title"></span>' +
          '<span class="goal-pop-meta"></span>' +
          '<button type="button" class="goal-pop-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="goal-pop-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    goalPop = {
      overlay,
      box: overlay.querySelector('.goal-pop'),
      dot: overlay.querySelector('.v-dot'),
      title: overlay.querySelector('.goal-pop-title'),
      meta: overlay.querySelector('.goal-pop-meta'),
      body: overlay.querySelector('.goal-pop-body'),
      openType: null
    };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGoalPop(); });
    overlay.querySelector('.goal-pop-close').addEventListener('click', closeGoalPop);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGoalPop(); });

    function applyMode() {
      Object.keys(goalCols).forEach(t => {
        const head = goalCols[t].querySelector('.v-head');
        if (mq.matches) { head.setAttribute('role', 'button'); head.setAttribute('tabindex', '0'); }
        else { head.removeAttribute('role'); head.removeAttribute('tabindex'); }
      });
      if (!mq.matches) closeGoalPop();
    }
    if (mq.addEventListener) mq.addEventListener('change', applyMode);
    else if (mq.addListener) mq.addListener(applyMode);
    applyMode();
    refreshGoalBadges();
  }

  /* ---------------- user chip ---------------- */
  function refreshUser() {
    const name = localStorage.getItem('life_user_name') || (window.lifeIsShortUser && (window.lifeIsShortUser.displayName || window.lifeIsShortUser.email)) || 'Guest';
    const mode = localStorage.getItem('lifeIsShort_mode');
    $('user-name').textContent = name;
    $('user-initial').textContent = (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    $('side-sync').textContent = mode === 'account' ? 'SYNCED · CLOUD' : (mode === 'guest' ? 'SYNCED · LOCAL GUEST' : 'SYNCED · LOCAL');
  }

  /* ---------------- init ---------------- */
  function init() {
    renderTime();
    setInterval(renderTime, 30000);

    setQuote(Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5));
    $('axiom-refresh').addEventListener('click', () => setQuote(quoteIdx + 1));
    $('axiom-copy').addEventListener('click', copyAxiom);

    loadGoals(); renderGoals();
    [['daily'], ['weekly'], ['monthly'], ['yearly']].forEach(([t]) => {
      $(t + '-add').addEventListener('click', () => {
        addGoal(t, $(t + '-input').value);
        $(t + '-input').value = '';
      });
      $(t + '-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); $(t + '-add').click(); }
      });
    });

    initGoalPopup();

    refreshUser();
    document.addEventListener('lifeIsShortAuthState', refreshUser);
    document.addEventListener('lifeIsShortDataReady', () => {
      loadGoals(); renderGoals(); refreshUser();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();