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
        .mobile-sheet-nav-item {
          display: flex;
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
    var sheetPanel = document.querySelector('.sheet-panel');
    var sheetItem = null;
    var nav = sidebar.querySelector('.side-nav');

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

    function setInspireView(show) {
      var shouldShow = Boolean(
        show && media.matches && inspireRail && inspireItem
      );

      document.body.classList.toggle(
        'mobile-inspire-view',
        shouldShow
      );
      document.body.classList.toggle(
        'mobile-sheet-view',
        false
      );

      sidebar.querySelectorAll('.nav-item').forEach(function (item) {
        item.classList.toggle(
          'active',
          shouldShow
            ? item === inspireItem
            : originalActiveItems.indexOf(item) !== -1
        );

        if (shouldShow && item === inspireItem) {
          item.setAttribute('aria-current', 'page');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      if (crumb) {
        crumb.innerHTML = shouldShow
          ? 'INFINITE &nbsp;›&nbsp; <b>INSPIRE FEED</b>'
          : originalCrumb;
      }
    }

    function setSheetView(show) {
      var shouldShow = Boolean(
        show && media.matches && sheetPanel && sheetItem
      );

      document.body.classList.toggle(
        'mobile-sheet-view',
        shouldShow
      );
      document.body.classList.toggle(
        'mobile-inspire-view',
        false
      );

      sidebar.querySelectorAll('.nav-item').forEach(function (item) {
        item.classList.toggle(
          'active',
          shouldShow
            ? item === sheetItem
            : originalActiveItems.indexOf(item) !== -1
        );

        if (shouldShow && item === sheetItem) {
          item.setAttribute('aria-current', 'page');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      if (crumb) {
        crumb.innerHTML = shouldShow
          ? 'INFINITE &nbsp;›&nbsp; <b>LIFE SHEET</b>'
          : originalCrumb;
      }
    }

    /* Hamburger button opens and closes the mobile drawer. */
    button.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('mobile-nav-open'));
    });

    /* Tapping the overlay closes the drawer. */
    overlay.addEventListener('click', function () {
      setOpen(false);
    });

    /*
     * Open the standalone Inspire Feed view only after the user selects
     * Inspire Feed from the hamburger navigation.
     */
    if (inspireItem) {
      inspireItem.addEventListener('click', function (event) {
        if (!media.matches) return;

        event.preventDefault();

        setInspireView(true);
        setOpen(false);
      });
    }

    if (sheetItem) {
      sheetItem.addEventListener('click', function (event) {
        if (!media.matches) return;

        event.preventDefault();

        setSheetView(true);
        setOpen(false);
      });
    }

    /*
     * Selecting any other navigation item returns to the normal page.
     */
    sidebar.addEventListener('click', function (event) {
      var target = event.target;

      var item = target && target.closest
        ? target.closest('.nav-item')
        : null;

      if (!item) return;

      if (item !== inspireItem) {
        setInspireView(false);
      }

      if (item !== sheetItem) {
        setSheetView(false);
      }

      setOpen(false);
    });

    /* Escape closes the mobile navigation drawer. */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    /* Restore desktop layout when leaving the mobile breakpoint. */
    function onMediaChange() {
      if (!media.matches) {
        setOpen(false);
        setInspireView(false);
        setSheetView(false);
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
