/* Shared mobile navigation and small-screen layout fixes.
   Dashboard-only Inspire Feed is available as a separate mobile view. */
(function () {
  'use strict';

  function installMobileLayoutOverrides() {
    if (document.getElementById('mobile-layout-overrides')) return;

    var style = document.createElement('style');
    style.id = 'mobile-layout-overrides';
    style.textContent = `
      /* The Inspire Feed is a dedicated destination on phones, not another
         section appended to the long Overview dashboard. */
      .mobile-inspire-nav-item,
      .mobile-goals-nav-item,
      .mobile-sheet-nav-item {
        display: none;
      }

      @media (max-width: 860px) {
        .page-layout {
          display: block;
          width: 100%;
          min-width: 0;
        }

        .page-layout > .inspire-rail {
          display: none;
        }

        .mobile-inspire-nav-item,
        .mobile-goals-nav-item,
        .mobile-sheet-nav-item {
          display: flex;
        }

        /* Life Goals: hidden from the Overview on phones, shown alone from the menu */
        .goals-section {
          display: none;
        }

        body.mobile-goals-view .main-wrap .page > :not(.goals-section) {
          display: none !important;
        }

        body.mobile-goals-view .goals-section {
          display: block;
        }

        body.mobile-goals-view .main-wrap .page {
          padding-top: 16px;
        }

        body.mobile-inspire-view .page-layout > .page {
          display: none !important;
        }

        body.mobile-sheet-view .main-wrap > .page > * {
          display: none !important;
        }

        body.mobile-sheet-view .main-wrap > .page > .mobile-sheet-target {
          display: block !important;
        }

        body.mobile-sheet-view .main-wrap > .page {
          padding: 12px var(--mobile-gutter, 16px) calc(24px + env(safe-area-inset-bottom));
        }

        body.mobile-sheet-view .main-wrap > .page .sheet-panel {
          width: 100%;
          margin: 0;
          max-width: none;
          border-radius: 14px;
          overflow: hidden;
        }

        body.mobile-sheet-view .main-wrap > .page .sheet-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        body.mobile-sheet-view .main-wrap > .page .sheet-top {
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 12px;
        }

        body.mobile-sheet-view .main-wrap > .page .sheet-tools {
          width: 100%;
          margin-left: 0;
          display: flex;
          flex-wrap: wrap;
        }

        body.mobile-sheet-view .main-wrap > .page .sheet-tools .tool-btn {
          flex: 1 1 calc(50% - 6px);
          min-height: 34px;
          padding: 7px 10px;
        }

        body.mobile-inspire-view .page-layout > .inspire-rail {
          display: flex !important;
          position: relative;
          inset: auto;
          width: 100%;
          height: calc(100vh - var(--topbar-h, 58px));
          height: calc(100dvh - var(--topbar-h, 58px));
          min-height: 360px;
          max-height: none;
          margin: 0;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }

        body.mobile-inspire-view .inspire-rail .ins-head {
          padding: 16px var(--mobile-gutter, 16px) 14px;
        }

        body.mobile-inspire-view .inspire-rail .ins-body {
          flex: 1 1 auto;
          min-height: 0;
          padding: 14px var(--mobile-gutter, 16px);
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        body.mobile-inspire-view .inspire-rail .ins-foot {
          padding: 10px var(--mobile-gutter, 16px);
          padding-bottom: calc(10px + env(safe-area-inset-bottom));
        }

        /* Yearly progress card: improve spacing and alignment on phones. */
        .hero-card {
          min-width: 0;
          padding: 14px;
          overflow: hidden;
        }

        .hero-top {
          display: grid;
          grid-template-columns: max-content minmax(0, 1fr);
          align-items: baseline;
          column-gap: 10px;
          row-gap: 7px;
          margin-bottom: 10px;
        }

        .hero-year {
          grid-column: 1;
          grid-row: 1;
          font-size: clamp(24px, 8vw, 30px);
          line-height: 1.1;
        }

        .hero-pct {
          grid-column: 2;
          grid-row: 1;
          justify-self: start;
          min-width: 0;
          font-size: clamp(22px, 7vw, 28px);
          line-height: 1.1;
          overflow-wrap: anywhere;
        }

        .hero-meta {
          grid-column: 1 / -1;
          grid-row: 2;
          min-width: 0;
          font-size: 10.5px;
          line-height: 1.5;
          white-space: normal;
        }

        .velocity {
          grid-column: 1 / -1;
          grid-row: 3;
          justify-self: start;
          max-width: 100%;
          margin: 0;
          font-size: 8.5px;
          line-height: 1.45;
          letter-spacing: .045em;
          overflow-wrap: anywhere;
        }

        /* Prevent the year timeline from overflowing the card. */
        .year-track {
          min-width: 0;
          padding-right: 0;
          padding-left: 0;
        }

        .yt-end {
          right: 0;
          font-size: 8px;
          letter-spacing: .04em;
          white-space: nowrap;
        }

        .yt-fill .start-lbl {
          left: 8px;
          font-size: 8px;
          letter-spacing: .04em;
        }

        .yt-badge {
          padding: 4px 6px;
          font-size: 9px;
        }

        .today-flag {
          font-size: 8px;
          letter-spacing: .025em;
          white-space: nowrap;
        }

        .yt-ticks {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 0;
          width: 100%;
          overflow: hidden;
          font-size: 8px;
        }

        .yt-ticks .tick {
          min-width: 0;
          font-size: 8px;
          letter-spacing: -.025em;
          white-space: nowrap;
        }

        /* Keep quarterly summaries evenly aligned in a 2 x 2 grid. */
        .quarters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .q-card {
          min-width: 0;
          padding: 9px 8px;
        }

        .q-card .qh {
          align-items: flex-start;
          gap: 4px;
          font-size: 8px;
          letter-spacing: .055em;
          line-height: 1.35;
        }

        .q-card .qh .st {
          flex: none;
          font-size: 10px;
        }

        .q-card .qp {
          font-size: 10.5px;
          white-space: nowrap;
        }

        .q-card .qp b {
          font-size: 13px;
        }
      }

      @media (max-width: 380px) {
        .hero-card {
          padding: 12px;
        }

        .hero-top {
          column-gap: 8px;
        }

        .hero-year {
          font-size: 24px;
        }

        .hero-pct {
          font-size: 23px;
        }

        .yt-ticks .tick {
          font-size: 7px;
          letter-spacing: -.04em;
        }

        /* Keep seasonal cards in a compact 2-by-2 layout. */
        .quarters {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .q-card .qh {
          font-size: 7.2px;
          letter-spacing: .025em;
        }

        .q-card .qp b {
          font-size: 12px;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function initMobileNavigation() {
    var sidebar = document.querySelector('body > .sidebar');
    var topbar = document.querySelector('.main-wrap .topbar');

    if (!sidebar || !topbar || topbar.querySelector('.mobile-menu-btn')) {
      return;
    }

    installMobileLayoutOverrides();

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-menu-btn';
    button.setAttribute('aria-label', 'Open navigation');
    button.setAttribute('aria-controls', 'site-sidebar');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML =
      '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

    sidebar.id = sidebar.id || 'site-sidebar';

    var crumb = topbar.querySelector('.crumb');
    var originalCrumb = crumb ? crumb.innerHTML : '';

    if (crumb) {
      topbar.insertBefore(button, crumb);
    } else {
      topbar.insertBefore(button, topbar.firstChild);
    }

    var overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var media = window.matchMedia('(max-width: 860px)');
    var inspireRail = document.getElementById('inspire-rail');
    var inspireItem = null;
    var goalsPanel = document.getElementById('life-goals');
    var goalsItem = null;
    var sheetPanel = null; /* Life Sheet now has its own page */
    var sheetItem = null;
    var nav = sidebar.querySelector('.side-nav');

    /*
     * Account actions (Sign up / Change password / Log out): on phones they are
     * a small popover behind an icon in the guest member box; on larger screens
     * they go back to the top bar.
     */
    var account = document.getElementById('auth-account-actions');
    var accountHome = account ? account.parentNode : null;
    var chip = sidebar.querySelector('.user-chip');
    var chipMore = null;

    /* The icon that opens the account popover, in the chip's right corner. */
    function ensureChipMore() {
      if (!chip || chipMore) return;

      chipMore = document.createElement('button');
      chipMore.type = 'button';
      chipMore.className = 'user-chip-more';
      chipMore.setAttribute('aria-label', 'Account options');
      chipMore.setAttribute('aria-expanded', 'false');
      chipMore.innerHTML =
        '<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>';

      chip.appendChild(chipMore);

      chipMore.addEventListener('click', function (event) {
        event.stopPropagation();

        if (!account || account.hidden) return;

        var open = !chip.classList.contains('account-open');
        chip.classList.toggle('account-open', open);
        chipMore.setAttribute('aria-expanded', String(open));
      });
    }

    function closeChipAccount() {
      if (!chip || !chip.classList.contains('account-open')) return;

      chip.classList.remove('account-open');
      if (chipMore) chipMore.setAttribute('aria-expanded', 'false');
    }

    function placeAccount() {
      if (!account) return;

      if (media.matches) {
        ensureChipMore();

        if (chip) {
          if (account.parentNode !== chip) {
            chip.insertBefore(account, chipMore || null);
          }
        } else if (account.parentNode !== sidebar) {
          var foot = sidebar.querySelector('.side-foot');
          sidebar.insertBefore(
            account,
            foot && foot.parentNode === sidebar ? foot : null
          );
        }
      } else {
        closeChipAccount();

        if (accountHome && account.parentNode !== accountHome) {
          accountHome.insertBefore(account, accountHome.firstChild);
        }
      }
    }

    placeAccount();

    /* Close the popover and the drawer after tapping Sign up / Log out. */
    if (account) {
      account.addEventListener('click', function (event) {
        if (event.target.closest('button')) {
          closeChipAccount();
          setOpen(false);
        }
      });
    }

    /* Tapping anywhere else closes the account popover. */
    document.addEventListener('click', function (event) {
      if (!chip || !chip.classList.contains('account-open')) return;
      if (event.target.closest && event.target.closest('.user-chip')) return;

      closeChipAccount();
    });

    var originalActiveItems = Array.prototype.slice.call(
      sidebar.querySelectorAll('.nav-item.active')
    );

    /*
     * Add Inspire Feed to the mobile drawer only when the dashboard
     * contains the Inspire Feed component.
     */
    if (inspireRail && nav) {
      inspireItem = nav.querySelector('.mobile-inspire-nav-item');

      if (!inspireItem) {
        inspireItem = document.createElement('a');
        inspireItem.className = 'nav-item mobile-inspire-nav-item';
        inspireItem.href = '#inspire-feed';
        inspireItem.innerHTML =
          '<i class="fa-solid fa-lightbulb" aria-hidden="true"></i>' +
          '<em>Inspire Feed</em>';

        var overviewItem = nav.querySelector(
          '.nav-item[href="./"], .nav-item[href="/"]'
        );

        if (overviewItem && overviewItem.parentNode === nav) {
          overviewItem.insertAdjacentElement('afterend', inspireItem);
        } else {
          nav.appendChild(inspireItem);
        }
      }
    }

    /* Life Goals: the My Goals section gets its own menu item on phones. */
    if (goalsPanel && nav) {
      goalsItem = nav.querySelector('.mobile-goals-nav-item');

      if (!goalsItem) {
        goalsItem = document.createElement('a');
        goalsItem.className = 'nav-item mobile-goals-nav-item';
        goalsItem.href = '#life-goals';
        goalsItem.innerHTML =
          '<i class="fa-solid fa-bullseye" aria-hidden="true"></i>' +
          '<em>Life Goals</em>';

        var goalsAnchor = nav.querySelector(
          '.nav-item[href="./"], .nav-item[href="/"]'
        );

        if (goalsAnchor && goalsAnchor.parentNode === nav) {
          goalsAnchor.insertAdjacentElement('afterend', goalsItem);
        } else {
          nav.appendChild(goalsItem);
        }
      }
    }

    /*
     * Add Life Sheet to the mobile drawer in the same way: when the user picks it,
     * only the tracker remains visible on the phone.
     */
    if (sheetPanel && nav) {
      sheetItem = nav.querySelector('.mobile-sheet-nav-item');

      if (!sheetItem) {
        sheetItem = document.createElement('a');
        sheetItem.className = 'nav-item mobile-sheet-nav-item';
        sheetItem.href = '#life-sheet';
        sheetItem.innerHTML =
          '<i class="fa-solid fa-table" aria-hidden="true"></i>' +
          '<em>Life Sheet</em>';

        var overviewItem = nav.querySelector(
          '.nav-item[href="./"], .nav-item[href="/"]'
        );

        if (overviewItem && overviewItem.parentNode === nav) {
          overviewItem.insertAdjacentElement('afterend', sheetItem);
        } else {
          nav.appendChild(sheetItem);
        }
      }

      var sheetHeader = sheetPanel.previousElementSibling;
      if (sheetHeader && sheetHeader.classList) {
        sheetHeader.classList.add('mobile-sheet-target');
      }
      sheetPanel.classList.add('mobile-sheet-target');
    }

    function setOpen(open) {
      var shouldOpen = Boolean(open && media.matches);

      document.body.classList.toggle('mobile-nav-open', shouldOpen);

      if (!shouldOpen) closeChipAccount();

      button.setAttribute('aria-expanded', String(shouldOpen));
      button.setAttribute(
        'aria-label',
        shouldOpen ? 'Close navigation' : 'Open navigation'
      );

      button.innerHTML = shouldOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

      overlay.setAttribute('aria-hidden', String(!shouldOpen));
    }

    /* view: 'inspire' | 'goals' | 'sheet' | null (null = normal Overview) */
    function setView(view) {
      var items = { inspire: inspireItem, goals: goalsItem, sheet: sheetItem };
      var names = { inspire: 'INSPIRE FEED', goals: 'LIFE GOALS', sheet: 'LIFE SHEET' };
      var active = view ? items[view] : null;
      var shouldShow = Boolean(active && media.matches);

      document.body.classList.toggle('mobile-inspire-view', shouldShow && view === 'inspire');
      document.body.classList.toggle('mobile-goals-view', shouldShow && view === 'goals');
      document.body.classList.toggle('mobile-sheet-view', shouldShow && view === 'sheet');

      sidebar.querySelectorAll('.nav-item').forEach(function (item) {
        item.classList.toggle(
          'active',
          shouldShow
            ? item === active
            : originalActiveItems.indexOf(item) !== -1
        );

        if (shouldShow && item === active) {
          item.setAttribute('aria-current', 'page');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      if (crumb) {
        crumb.innerHTML = shouldShow
          ? 'INFINITE &nbsp;›&nbsp; <b>' + names[view] + '</b>'
          : originalCrumb;
      }

      if (shouldShow) window.scrollTo(0, 0);
    }

    /* Hamburger button opens and closes the mobile drawer. */
    button.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('mobile-nav-open'));
    });

    /* Tapping the overlay closes the drawer. */
    overlay.addEventListener('click', function () {
      setOpen(false);
    });

    /* Inspire Feed / Life Goals / Life Sheet open their own phone view. */
    [
      [inspireItem, 'inspire'],
      [goalsItem, 'goals'],
      [sheetItem, 'sheet']
    ].forEach(function (pair) {
      if (!pair[0]) return;

      pair[0].addEventListener('click', function (event) {
        if (!media.matches) return;

        event.preventDefault();

        setView(pair[1]);
        setOpen(false);
      });
    });

    /* Any other navigation item returns to the normal page. */
    sidebar.addEventListener('click', function (event) {
      var target = event.target;

      var item = target && target.closest
        ? target.closest('.nav-item')
        : null;

      if (!item) return;

      if (item !== inspireItem && item !== goalsItem && item !== sheetItem) {
        setView(null);
      }

      setOpen(false);
    });

    /* Escape closes the account popover and the mobile navigation drawer. */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeChipAccount();
        setOpen(false);
      }
    });

    /* Restore desktop layout when leaving the mobile breakpoint. */
    function onMediaChange() {
      placeAccount();

      if (!media.matches) {
        setOpen(false);
        setView(null);
      }
    }

    if (media.addEventListener) {
      media.addEventListener('change', onMediaChange);
    } else if (media.addListener) {
      media.addListener(onMediaChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initMobileNavigation,
      { once: true }
    );
  } else {
    initMobileNavigation();
  }
})();
