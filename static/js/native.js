/* Infinite - native shell behaviour.
 *
 * Loaded by every page, and does nothing at all in a normal browser. Inside the
 * Capacitor app (Android and iOS) it takes care of the three things a WebView
 * does not: the hardware back button, links that belong to another app, and the
 * status bar. Everything else, the pages included, stays exactly the same code.
 */
(function () {
  'use strict';

  var cap = window.Capacitor;
  var isNative = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  if (!isNative) return;

  var platform = typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'android';
  var root = document.documentElement;
  root.classList.add('native-app');
  root.classList.add(platform === 'ios' ? 'native-ios' : 'native-android');

  function plugin(name) {
    return (cap.Plugins && cap.Plugins[name]) || null;
  }

  /* Anything on another origin is somebody else's page. */
  function isAppLink(url) {
    return url.origin === location.origin;
  }

  /* YouTube, a mail client, a phone dialler: hand them to the operating system. */
  function handOff(url) {
    try {
      window.open(url, '_system');
    } catch (error) {
      location.href = url;
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;

    var url;
    try { url = new URL(href, location.href); } catch (error) { return; }

    if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
      event.preventDefault();
      handOff(url.href);
      return;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    if (isAppLink(url)) return;

    event.preventDefault();
    handOff(url.href);
  }, true);

  /* Android's back gesture: walk the history, then leave the app from the dashboard. */
  var App = plugin('App');
  if (App && typeof App.addListener === 'function') {
    App.addListener('backButton', function () {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      if (typeof App.exitApp === 'function') App.exitApp();
    });
  }

  /* Dark status bar to match the app background, on both platforms. */
  var StatusBar = plugin('StatusBar');
  if (StatusBar) {
    if (typeof StatusBar.setStyle === 'function') {
      StatusBar.setStyle({ style: 'DARK' }).catch(function () { /* not fatal */ });
    }
    if (platform !== 'ios' && typeof StatusBar.setBackgroundColor === 'function') {
      StatusBar.setBackgroundColor({ color: '#0a0f16' }).catch(function () { /* not fatal */ });
    }
  }
})();
